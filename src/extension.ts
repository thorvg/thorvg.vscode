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
import { ThorVGViewerPanel } from './webview/ThorVGViewerPanel';
import { PlaygroundPanel } from './webview/PlaygroundPanel';
import { getUriFromTabInput } from './utils/vscodeUtils';
import { ensureWebcanvasIntellisenseForDocument } from './services/intellisense';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "thorvg-viewer" is now active');

    // Register command to open ThorVG Viewer
    const thorvgDisposable = vscode.commands.registerCommand(
        'thorvg-viewer.openThorVGViewer',
        () => {
            ThorVGViewerPanel.createOrShow(context.extensionUri);
        }
    );

    // Register command to open ThorVG Viewer with current file and auto-sync
    const thorvgCurrentFileDisposable = vscode.commands.registerCommand(
        'thorvg-viewer.openThorVGViewerWithCurrentFile',
        async (uri?: vscode.Uri) => {
            const resolvedUri = uri
                || vscode.window.activeTextEditor?.document.uri
                || getUriFromTabInput(vscode.window.tabGroups.activeTabGroup?.activeTab?.input);

            await ThorVGViewerPanel.createOrShowWithCurrentFile(context.extensionUri, resolvedUri);
        }
    );

    // Register command to open extension folder
    const openExtensionFolderDisposable = vscode.commands.registerCommand(
        'thorvg-viewer.openExtensionFolder',
        async () => {
            // Point to thorvg-viewer folder where WASM file is located
            const thorvgViewerUri = vscode.Uri.joinPath(context.extensionUri, 'thorvg-viewer');
            const thorvgViewerPath = thorvgViewerUri.fsPath;

            // Show quick pick in command palette
            const action = await vscode.window.showQuickPick(
                [
                    {
                        label: '$(folder-opened) Open Folder',
                        description: 'Open thorvg-viewer folder (contains thorvg.wasm)',
                        action: 'open'
                    },
                    {
                        label: '$(clippy) Copy Path',
                        description: thorvgViewerPath,
                        action: 'copy'
                    }
                ],
                {
                    placeHolder: 'Choose an action for the ThorVG Viewer folder'
                }
            );

            if (!action) {
                return;
            }

            if (action.action === 'open') {
                // Open the thorvg-viewer folder in file explorer
                await vscode.commands.executeCommand('revealFileInOS', thorvgViewerUri);
            } else if (action.action === 'copy') {
                // Copy path to clipboard
                await vscode.env.clipboard.writeText(thorvgViewerPath);
                vscode.window.showInformationMessage('ThorVG Viewer folder path copied to clipboard');
            }
        }
    );

    // Register command to open Playground
    const playgroundDisposable = vscode.commands.registerCommand(
        'thorvg-viewer.openPlayground',
        () => {
            PlaygroundPanel.createOrShow(context.extensionUri);
        }
    );

    // Register command to open Playground with current file
    const playgroundCurrentFileDisposable = vscode.commands.registerCommand(
        'thorvg-viewer.openPlaygroundWithCurrentFile',
        async (uri?: vscode.Uri) => {
            const resolvedUri = uri
                || vscode.window.activeTextEditor?.document.uri
                || getUriFromTabInput(vscode.window.tabGroups.activeTabGroup?.activeTab?.input);

            await PlaygroundPanel.createOrShowWithCurrentFile(context.extensionUri, resolvedUri);
        }
    );

    // Register command to enable WebCanvas IntelliSense
    const enableWebcanvasIntellisenseDisposable = vscode.commands.registerCommand(
        'thorvg-viewer.enableWebcanvasIntellisense',
        async () => {
            const document = vscode.window.activeTextEditor?.document;
            if (!document) {
                vscode.window.showErrorMessage('No active editor found.');
                return;
            }

            await ensureWebcanvasIntellisenseForDocument(document, context.extensionUri);
            vscode.window.showInformationMessage(
                'ThorVG WebCanvas IntelliSense enabled for this file. If suggestions do not appear, run "TypeScript: Restart TS Server".'
            );
        }
    );

    context.subscriptions.push(
        thorvgDisposable,
        thorvgCurrentFileDisposable,
        openExtensionFolderDisposable,
        playgroundDisposable,
        playgroundCurrentFileDisposable,
        enableWebcanvasIntellisenseDisposable
    );
}

export function deactivate() {
    console.log('Extension "thorvg-viewer" is now deactivated');
}
