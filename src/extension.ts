import * as vscode from 'vscode';
import { ThorVGViewerPanel } from './webview/ThorVGViewerPanel';

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

    context.subscriptions.push(thorvgDisposable, thorvgCurrentFileDisposable, openExtensionFolderDisposable);
}

export function deactivate() {
    console.log('Extension "thorvg-viewer" is now deactivated');
}

function getUriFromTabInput(input: unknown): vscode.Uri | undefined {
    if (!input || typeof input !== 'object') return undefined;

    const candidate = input as {
        uri?: vscode.Uri;
        modified?: vscode.Uri;
        original?: vscode.Uri;
        notebookUri?: vscode.Uri;
    };

    return candidate.uri
        || candidate.modified
        || candidate.original
        || candidate.notebookUri;
}
