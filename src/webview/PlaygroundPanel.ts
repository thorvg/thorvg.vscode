/*
 * Copyright (c) 2025 - 2026 ThorVG project. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { getBundler, BundleResult } from '../services/bundler';
import { PLAYGROUND_EXTENSIONS, isPlaygroundFile } from '../constants';
import { ensureWebcanvasIntellisenseForDocument } from '../services/intellisense';

export class PlaygroundPanel {
    public static currentPanel: PlaygroundPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _autoRunEnabled: boolean = true;
    private _currentDocument: vscode.TextDocument | undefined;
    private _currentFileUri: vscode.Uri | undefined;
    private _webviewReady: Promise<void>;
    private _webviewReadyResolver: (() => void) | undefined;
    private _fileWatcher: vscode.FileSystemWatcher | undefined;
    private _debounceTimer: NodeJS.Timeout | undefined;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._webviewReady = new Promise(resolve => {
            this._webviewReadyResolver = resolve;
        });

        // Set panel icon
        this._panel.iconPath = {
            light: vscode.Uri.joinPath(extensionUri, 'media', 'logo_black.png'),
            dark: vscode.Uri.joinPath(extensionUri, 'media', 'logo_white.png')
        };

        // Set the webview's initial html content
        void this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Set up auto-sync and file watching
        this._setupAutoSync();

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'ready':
                        // Webview is ready, resolve the promise
                        if (this._webviewReadyResolver) {
                            this._webviewReadyResolver();
                            this._webviewReadyResolver = undefined;
                        }
                        // Send initialization config
                        await this._sendInitConfig();
                        return;

                    case 'domReady':
                        // DOM is ready, we can now initialize ThorVG
                        console.log('Playground: DOM ready');
                        return;

                    case 'requestCode':
                        // Manual run requested
                        if (this._currentDocument) {
                            await this._bundleAndExecute(this._currentDocument);
                        }
                        return;

                    case 'rendererChange':
                        console.log('Playground: Renderer changed to', message.renderer);
                        return;

                    case 'error':
                        vscode.window.showErrorMessage(`Playground: ${message.text}`);
                        return;

                    case 'executionError':
                        vscode.window.showErrorMessage(`Code Error: ${message.text}`);
                        console.error('Playground execution error:', message.stack);
                        return;

                    case 'log':
                        console.log('Playground:', message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const targetColumn = vscode.ViewColumn.Beside;

        // If we already have a panel, show it
        if (PlaygroundPanel.currentPanel) {
            PlaygroundPanel.currentPanel._panel.reveal(targetColumn);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'thorvgPlayground',
            'ThorVG Playground',
            targetColumn,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'thorvg.playground')
                ]
            }
        );

        PlaygroundPanel.currentPanel = new PlaygroundPanel(panel, extensionUri);
    }

    public static async createOrShowWithCurrentFile(extensionUri: vscode.Uri, resourceUri?: vscode.Uri) {
        const targetColumn = vscode.ViewColumn.Beside;

        // If we already have a panel, show it and load current file
        if (PlaygroundPanel.currentPanel) {
            PlaygroundPanel.currentPanel._panel.reveal(targetColumn);
            await PlaygroundPanel.currentPanel._loadCurrentFile(resourceUri);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'thorvgPlayground',
            'ThorVG Playground',
            targetColumn,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'thorvg.playground')
                ]
            }
        );

        PlaygroundPanel.currentPanel = new PlaygroundPanel(panel, extensionUri);

        // Load the current file after panel is ready
        await PlaygroundPanel.currentPanel._loadCurrentFile(resourceUri);
    }

    private _setupAutoSync() {
        // Listen for document changes
        const documentChangeListener = vscode.workspace.onDidChangeTextDocument(e => {
            if (this._autoRunEnabled && this._currentDocument && e.document === this._currentDocument) {
                this._debouncedBundleAndExecute(this._currentDocument);
            }
        });
        this._disposables.push(documentChangeListener);

        // Listen for document saves
        const documentSaveListener = vscode.workspace.onDidSaveTextDocument(document => {
            if (this._currentDocument && document === this._currentDocument) {
                // Always re-bundle on save
                this._bundleAndExecute(document);
            }
        });
        this._disposables.push(documentSaveListener);

        // Listen for active editor changes
        const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(async editor => {
            if (editor && this._isPlaygroundFile(editor.document) && editor.document !== this._currentDocument) {
                await this._loadDocument(editor.document);
            }
        });
        this._disposables.push(editorChangeListener);
    }

    private _debouncedBundleAndExecute(document: vscode.TextDocument) {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
            this._bundleAndExecute(document);
        }, 500); // 500ms debounce
    }

    private async _loadCurrentFile(resourceUri?: vscode.Uri) {
        const targetUri = resourceUri || vscode.window.activeTextEditor?.document.uri;

        if (!targetUri) {
            vscode.window.showWarningMessage('No active file found. Please open a JavaScript or TypeScript file.');
            return;
        }

        if (!this._isPlaygroundPath(targetUri.fsPath)) {
            vscode.window.showWarningMessage('Selected file is not a supported format (.js, .ts, .jsx, .tsx)');
            return;
        }

        const document = await vscode.workspace.openTextDocument(targetUri);
        await this._loadDocument(document);
    }

    private _isPlaygroundPath(filePath: string): boolean {
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
        return (PLAYGROUND_EXTENSIONS.ALL as readonly string[]).includes(ext);
    }

    private _isPlaygroundFile(document: vscode.TextDocument): boolean {
        return this._isPlaygroundPath(document.fileName);
    }

    private async _loadDocument(document: vscode.TextDocument) {
        this._currentDocument = document;
        this._currentFileUri = document.uri;

        await ensureWebcanvasIntellisenseForDocument(document, this._extensionUri);

        // Update panel title
        const fileName = path.basename(document.fileName);
        this._panel.title = `Playground: ${fileName}`;

        // Set up file watcher for the directory
        this._setupFileWatcher(document.uri);

        // Bundle and execute
        await this._bundleAndExecute(document);
    }

    private _setupFileWatcher(fileUri: vscode.Uri) {
        // Dispose previous watcher
        if (this._fileWatcher) {
            this._fileWatcher.dispose();
        }

        // Watch for changes in the same directory
        const dir = path.dirname(fileUri.fsPath);
        const pattern = new vscode.RelativePattern(dir, '**/*.{js,ts,jsx,tsx}');

        this._fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        this._fileWatcher.onDidChange(() => {
            if (this._autoRunEnabled && this._currentDocument) {
                this._debouncedBundleAndExecute(this._currentDocument);
            }
        });

        this._disposables.push(this._fileWatcher);
    }

    private async _bundleAndExecute(document: vscode.TextDocument) {
        await this._ensureWebviewReady();

        try {
            const bundler = getBundler({
                projectRoot: path.dirname(document.uri.fsPath)
            });

            const code = document.getText();
            const result: BundleResult = await bundler.bundleFromString(
                code,
                path.basename(document.fileName)
            );

            if (result.errors.length > 0) {
                // Show errors
                vscode.window.showErrorMessage(`Bundle errors:\n${result.errors.join('\n')}`);
                return;
            }

            if (result.warnings.length > 0) {
                console.log('Bundle warnings:', result.warnings);
            }

            // Send code to webview for execution
            await this._panel.webview.postMessage({
                command: 'executeCode',
                code: result.code
            });

            // Update renderer if config specifies one
            if (result.config.renderer) {
                await this._panel.webview.postMessage({
                    command: 'setRenderer',
                    renderer: result.config.renderer
                });
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to bundle code: ${errorMsg}`);
        }
    }

    private async _sendInitConfig() {
        const webview = this._panel.webview;

        // Get URIs for WASM and WebCanvas from thorvg.playground
        const wasmUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'thorvg.playground', 'thorvg.wasm')
        );

        const webcanvasUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'thorvg.playground', 'webcanvas.esm.js')
        );

        await this._panel.webview.postMessage({
            command: 'init',
            wasmUri: wasmUri.toString(),
            webcanvasUri: webcanvasUri.toString(),
            renderer: 'sw'
        });
    }

    private async _ensureWebviewReady() {
        await this._webviewReady;
    }

    public dispose() {
        PlaygroundPanel.currentPanel = undefined;

        // Clean up resources
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        if (this._fileWatcher) {
            this._fileWatcher.dispose();
        }

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private async _update(): Promise<void> {
        const webview = this._panel.webview;
        try {
            this._panel.webview.html = await this._getHtmlForWebview(webview);
        } catch (error) {
            console.error('Playground: Failed to load webview HTML', error);
            this._panel.webview.html = this._getFallbackHtml();
        }
    }

    private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        // Get resource URIs for Playground assets
        const playgroundUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'thorvg.playground')
        );

        // Read the index.html template
        const indexHtmlPath = vscode.Uri.joinPath(
            this._extensionUri, 'thorvg.playground', 'index.html'
        );
        const htmlBytes = await vscode.workspace.fs.readFile(indexHtmlPath);
        let html = new TextDecoder('utf-8').decode(htmlBytes);

        // Set up base URI and CSP
        const baseUri = `${playgroundUri.toString()}/`;
        const csp = [
            "default-src 'none';",
            `style-src ${webview.cspSource} 'unsafe-inline';`,
            `script-src ${webview.cspSource} 'unsafe-eval' 'wasm-unsafe-eval';`,
            `img-src ${webview.cspSource} data: blob:;`,
            `connect-src ${webview.cspSource} data:;`,
            `font-src ${webview.cspSource};`
        ].join(' ');

        // Inject base URL and CSP into head
        const headInjection = `
    <base href="${baseUri}">
    <meta http-equiv="Content-Security-Policy" content="${csp}">`;

        html = html.replace('<head>', `<head>${headInjection}`);

        return html;
    }

    private _getFallbackHtml(): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ThorVG Playground</title>
</head>
<body>
    <h1>ThorVG Playground</h1>
    <p>Failed to load webview content. Please check the extension installation.</p>
</body>
</html>`;
    }
}
