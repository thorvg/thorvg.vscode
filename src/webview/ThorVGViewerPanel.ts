/*
 * Copyright (c) 2025 - 2026 ThorVG project. All rights reserved.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


import * as vscode from 'vscode';
import { getUriFromTabInput } from '../utils/vscodeUtils';
import { toBase64, fromBase64 } from '../utils/base64';
import { DEFAULT_VIEWER_SIZE, SUPPORTED_EXTENSIONS, isTextBasedFormat } from '../constants';

export class ThorVGViewerPanel {
    public static currentPanel: ThorVGViewerPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _autoSyncEnabled: boolean = false;
    private _currentDocument: vscode.TextDocument | undefined;
    private _currentResourceUri: vscode.Uri | undefined;
    private _webviewReady: Promise<void>;
    private _webviewReadyResolver: (() => void) | undefined;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, autoSync: boolean = true) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._autoSyncEnabled = autoSync;
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

        // Set up auto-sync listeners
        this._setupAutoSync();

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'alert': {
                        vscode.window.showInformationMessage(message.text);
                        return;
                    }
                    case 'log': {
                        console.log('ThorVG Viewer log:', message.text);
                        return;
                    }
                    case 'loadError': {
                        // File loading failed in the webview
                        // Show error to user but DON'T change current document state
                        vscode.window.showErrorMessage(`ThorVG Viewer: ${message.text}`);
                        console.error('ThorVG Viewer load error:', message.text);
                        return;
                    }
                    case 'pickFile': {
                        // Show VSCode file picker
                        const fileUris = await vscode.window.showOpenDialog({
                            canSelectMany: true,
                            openLabel: 'Select File',
                            filters: {
                                'Vector Graphics': ['svg', 'json', 'lot', 'png'],
                                'All Files': ['*']
                            }
                        });

                        if (fileUris && fileUris.length > 0) {
                            // Read each file and send to webview
                            for (const fileUri of fileUris) {
                                const fileName = this._getFileName(fileUri);
                                const fileData = await vscode.workspace.fs.readFile(fileUri);

                                // Determine if file is text or binary
                                const ext = fileName.split('.').pop()?.toLowerCase();
                                let fileContent: string;

                                if (isTextBasedFormat(ext || '')) {
                                    // Text file - decode as UTF-8
                                    fileContent = new TextDecoder().decode(fileData);
                                } else if (ext === 'png') {
                                    // PNG file - convert to base64 data URL
                                    const base64 = toBase64(fileData);
                                    fileContent = `data:image/png;base64,${base64}`;
                                } else {
                                    // Other binary file
                                    const base64 = toBase64(fileData);
                                    fileContent = `data:application/octet-stream;base64,${base64}`;
                                }

                                // Send file to webview
                                await this._ensureWebviewReady();
                                this._panel.webview.postMessage({
                                    command: 'loadFile',
                                    fileName: fileName,
                                    fileData: fileContent
                                });
                            }
                        }
                        return;
                    }
                    case 'exportFile': {
                        // Handle file export (PNG/GIF)
                        const defaultFileName = message.fileName || `export.${message.fileType}`;
                        const fileTypeUpper = message.fileType.toUpperCase();

                        const baseFolderUri = this._currentDocument
                            ? this._getDirUri(this._currentDocument.uri)
                            : vscode.workspace.workspaceFolders?.[0]?.uri;
                        const defaultUri = baseFolderUri
                            ? vscode.Uri.joinPath(baseFolderUri, defaultFileName)
                            : undefined;

                        const saveUri = await vscode.window.showSaveDialog({
                            defaultUri,
                            filters: {
                                [fileTypeUpper]: [message.fileType]
                            }
                        });

                        if (saveUri) {
                            try {
                                // Convert data URL or base64 to buffer
                                let buffer: Uint8Array;
                                const fileData = message.fileData;

                                if (typeof fileData === 'string') {
                                    // Handle data URL format (data:image/png;base64,...)
                                    if (fileData.startsWith('data:')) {
                                        const base64Data = fileData.split(',')[1] || '';
                                        buffer = fromBase64(base64Data);
                                    } else {
                                        // Already base64
                                        buffer = fromBase64(fileData);
                                    }
                                } else if (fileData instanceof Uint8Array) {
                                    buffer = fileData;
                                } else {
                                    throw new Error('Unsupported file data format');
                                }

                                // Write file
                                await vscode.workspace.fs.writeFile(saveUri, buffer);
                                vscode.window.showInformationMessage(`${fileTypeUpper} exported successfully: ${saveUri.fsPath}`);
                            } catch (error) {
                                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                                vscode.window.showErrorMessage(`Failed to export ${fileTypeUpper}: ${errorMsg}`);
                            }
                        }
                        return;
                    }
                    case 'showError': {
                        vscode.window.showErrorMessage(message.text);
                        return;
                    }
                    case 'ready': {
                        if (this._webviewReadyResolver) {
                            this._webviewReadyResolver();
                            this._webviewReadyResolver = undefined;
                        }
                        void this._panel.webview.postMessage({
                            command: 'setViewerSize',
                            size: DEFAULT_VIEWER_SIZE
                        });
                        return;
                    }
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const targetColumn = vscode.ViewColumn.Beside;

        // If we already have a panel, show it
        if (ThorVGViewerPanel.currentPanel) {
            ThorVGViewerPanel.currentPanel._panel.reveal(targetColumn);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'thorvgViewer',
            'ThorVG Viewer',
            targetColumn,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'thorvg.viewer'),
                    vscode.Uri.joinPath(extensionUri, 'thorvg.viewer', 'icon')
                ]
            }
        );

        ThorVGViewerPanel.currentPanel = new ThorVGViewerPanel(panel, extensionUri);
    }

    public static async createOrShowWithCurrentFile(extensionUri: vscode.Uri, resourceUri?: vscode.Uri) {
        const targetColumn = vscode.ViewColumn.Beside;

        // If we already have a panel, show it and load current file
        if (ThorVGViewerPanel.currentPanel) {
            ThorVGViewerPanel.currentPanel._panel.reveal(targetColumn);
            await ThorVGViewerPanel.currentPanel._loadCurrentFile(resourceUri);
            return;
        }

        // Otherwise, create a new panel with auto-sync enabled
        const panel = vscode.window.createWebviewPanel(
            'thorvgViewer',
            'ThorVG Viewer',
            targetColumn,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'thorvg.viewer'),
                    vscode.Uri.joinPath(extensionUri, 'thorvg.viewer', 'icon')
                ]
            }
        );

        ThorVGViewerPanel.currentPanel = new ThorVGViewerPanel(panel, extensionUri, true);

        // Load the current file after panel is ready
        await ThorVGViewerPanel.currentPanel._loadCurrentFile(resourceUri);
    }

    private _setupAutoSync() {
        // Listen for document changes
        const documentChangeListener = vscode.workspace.onDidChangeTextDocument(async e => {
            if (this._autoSyncEnabled && this._currentDocument && e.document === this._currentDocument) {
                await this._loadDocument(this._currentDocument);
            }
        });
        this._disposables.push(documentChangeListener);

        // Listen for active editor changes
        const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(async editor => {
            if (this._autoSyncEnabled && editor && this._isSupportedFile(editor.document) && editor.document !== this._currentDocument) {
                await this._loadDocument(editor.document);
                return;
            }
            if (this._autoSyncEnabled) {
                await this._syncActiveResourceIfSupported();
            }
        });
        this._disposables.push(editorChangeListener);

        // Listen for tab changes (covers image/custom viewers where no text editor exists)
        const tabChangeListener = vscode.window.tabGroups.onDidChangeTabs(async () => {
            if (this._autoSyncEnabled) {
                await this._syncActiveResourceIfSupported();
            }
        });
        this._disposables.push(tabChangeListener);

        // Listen for active tab group changes (captures focus shifts between custom editors)
        const tabGroupChangeListener = vscode.window.tabGroups.onDidChangeTabGroups(async () => {
            if (this._autoSyncEnabled) {
                await this._syncActiveResourceIfSupported();
            }
        });
        this._disposables.push(tabGroupChangeListener);

        // Initial sync for whatever is currently active
        this._syncActiveResourceIfSupported();
    }

    private async _loadCurrentFile(resourceUri?: vscode.Uri, silentIfMissing: boolean = false) {
        const targetUri = resourceUri ?? this._getActiveResourceUri();

        if (!targetUri) {
            if (!silentIfMissing) {
                vscode.window.showWarningMessage('No active file found. Please open a file (.svg, .json, .lot, .png)');
            }
            return;
        }

        if (!this._isSupportedPath(targetUri.fsPath)) {
            if (!silentIfMissing) {
                vscode.window.showWarningMessage('Selected file is not a supported format (.svg, .json, .lot, .png)');
            }
            return;
        }

        const activeDoc = vscode.window.activeTextEditor?.document;
        if (activeDoc && activeDoc.uri.toString() === targetUri.toString()) {
            if (!this._isSupportedFile(activeDoc)) {
                if (!silentIfMissing) {
                    vscode.window.showWarningMessage('Current file is not a supported format (.svg, .json, .lot, .png)');
                }
                return;
            }
            await this._loadDocument(activeDoc);
            return;
        }

        await this._loadUri(targetUri);
    }

    private _getActiveResourceUri(): vscode.Uri | undefined {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && this._isSupportedPath(activeEditor.document.uri.fsPath)) {
            return activeEditor.document.uri;
        }

        const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
        const fromActiveTab = getUriFromTabInput(activeTab?.input);
        if (fromActiveTab && this._isSupportedPath(fromActiveTab.fsPath)) {
            return fromActiveTab;
        }

        // Fallback: scan all tabs for the first supported URI
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                const uri = getUriFromTabInput(tab.input);
                if (uri && this._isSupportedPath(uri.fsPath)) {
                    return uri;
                }
            }
        }

        return undefined;
    }

    private _isSupportedPath(filePath: string): boolean {
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
        return (SUPPORTED_EXTENSIONS.ALL as readonly string[]).includes(ext);
    }

    private _isSupportedFile(document: vscode.TextDocument): boolean {
        return this._isSupportedPath(document.fileName);
    }

    private async _loadUri(uri: vscode.Uri) {
        const fileName = this._getFileName(uri);
        const ext = fileName.split('.').pop()?.toLowerCase();

        if (isTextBasedFormat(ext || '')) {
            const document = await vscode.workspace.openTextDocument(uri);
            await this._loadDocument(document);
            return;
        }

        // Binary types: read directly and avoid setting _currentDocument for auto-sync
        const fileData = await vscode.workspace.fs.readFile(uri);
        let fileContent: string;
        if (ext === 'png') {
            const base64 = toBase64(fileData);
            fileContent = `data:image/png;base64,${base64}`;
        } else {
            const base64 = toBase64(fileData);
            fileContent = `data:application/octet-stream;base64,${base64}`;
        }

        this._currentDocument = undefined;
        this._currentResourceUri = uri;

        await this._ensureWebviewReady();
        this._panel.webview.postMessage({
            command: 'loadFile',
            fileName,
            fileData: fileContent
        });
    }

    private async _loadDocument(document: vscode.TextDocument) {
        this._currentDocument = document;
        this._currentResourceUri = document.uri;

        const fileName = this._getFileName(document.uri);
        const ext = fileName.split('.').pop()?.toLowerCase();
        let fileContent: string;

        if (isTextBasedFormat(ext || '')) {
            // Use in-memory text to include unsaved changes
            fileContent = document.getText();
        } else if (ext === 'png') {
            // Read and encode binary as data URL for webview consumption
            const fileData = await vscode.workspace.fs.readFile(document.uri);
            const base64 = toBase64(fileData);
            fileContent = `data:image/png;base64,${base64}`;
        } else {
            // Fallback for other binary formats
            const fileData = await vscode.workspace.fs.readFile(document.uri);
            const base64 = toBase64(fileData);
            fileContent = `data:application/octet-stream;base64,${base64}`;
        }

        // Send file to webview
        await this._ensureWebviewReady();
        this._panel.webview.postMessage({
            command: 'loadFile',
            fileName: fileName,
            fileData: fileContent
        });
    }

    private async _ensureWebviewReady() {
        await this._webviewReady;
    }

    private _urisEqual(a: vscode.Uri, b: vscode.Uri): boolean {
        return a.toString() === b.toString();
    }

    private _normalizePath(uri: vscode.Uri): string {
        const rawPath = uri.path || uri.fsPath || '';
        return rawPath.replace(/\\/g, '/');
    }

    private _getFileName(uri: vscode.Uri): string {
        const normalizedPath = this._normalizePath(uri);
        const segments = normalizedPath.split('/');
        return segments[segments.length - 1] || 'unknown';
    }

    private _getDirUri(uri: vscode.Uri): vscode.Uri {
        const normalizedPath = this._normalizePath(uri);
        const lastSlash = normalizedPath.lastIndexOf('/');
        const dirPath = lastSlash > 0 ? normalizedPath.slice(0, lastSlash) : '/';
        return uri.with({ path: dirPath });
    }

    private async _syncActiveResourceIfSupported() {
        // First check if active editor/tab is a supported file
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && this._isSupportedPath(activeEditor.document.uri.fsPath)) {
            // Active editor is supported, sync to it
            if (this._currentResourceUri && this._urisEqual(this._currentResourceUri, activeEditor.document.uri)) {
                return; // Already showing this file
            }
            await this._loadCurrentFile(activeEditor.document.uri, true);
            return;
        }

        const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
        const fromActiveTab = getUriFromTabInput(activeTab?.input);
        if (fromActiveTab && this._isSupportedPath(fromActiveTab.fsPath)) {
            // Active tab is supported, sync to it
            if (this._currentResourceUri && this._urisEqual(this._currentResourceUri, fromActiveTab)) {
                return; // Already showing this file
            }
            
            await this._loadCurrentFile(fromActiveTab, true);
        }

        // Active editor/tab is NOT a supported file
        // Keep current file displayed - don't switch to another file
        // This prevents the viewer from jumping to the first file in the list
    }

    public dispose() {
        ThorVGViewerPanel.currentPanel = undefined;

        // Clean up resources
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
            console.error('ThorVG Viewer: Failed to load webview HTML', error);
            this._panel.webview.html = '<!DOCTYPE html><html><body><h1>ThorVG Viewer</h1><p>Failed to load webview content.</p></body></html>';
        }
    }

    private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        // Get resource URIs for ThorVG Viewer assets (from thorvg.viewer submodule)
        const thorvgViewerUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'thorvg.viewer'));
        const bridgeJsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode-bridge.js'));

        const indexHtmlPath = vscode.Uri.joinPath(this._extensionUri, 'thorvg.viewer', 'index.html');
        const htmlBytes = await vscode.workspace.fs.readFile(indexHtmlPath);
        let html = new TextDecoder('utf-8').decode(htmlBytes);

        const baseUri = `${thorvgViewerUri.toString()}/`;
        const csp = [
            "default-src 'none';",
            `style-src ${webview.cspSource} 'unsafe-inline' https:;`,
            `font-src ${webview.cspSource} https:;`,
            `script-src ${webview.cspSource} 'unsafe-eval' 'unsafe-inline' https://mrdoob.github.io;`,
            `img-src ${webview.cspSource} data: blob: https:;`,
            `connect-src ${webview.cspSource} https:;`
        ].join(' ');

        const headInjection = `
    <base href="${baseUri}">
    <meta http-equiv="Content-Security-Policy" content="${csp}">`;

        html = html.replace('<head>', `<head>${headInjection}`);
        html = html.replace(
            '</body>',
            `    <script type="text/javascript" src="${bridgeJsUri}"></script>
</body>`
        );

        return html;
    }
}
