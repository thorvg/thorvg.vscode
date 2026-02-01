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

const INTELLISENSE_MARKER = '// @thorvg-playground-intellisense';
let cachedLibContent: string | null = null;

export async function ensureWebcanvasIntellisenseForDocument(
    document: vscode.TextDocument,
    extensionUri: vscode.Uri
): Promise<void> {
    if (document.isUntitled) {
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return;
    }

    const typesUri = await ensureTypesFile(workspaceFolder.uri, extensionUri);
    const relativePath = toRelativePosixPath(path.dirname(document.uri.fsPath), typesUri.fsPath);
    const referencePath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

    const referenceLine = `/// <reference path="${referencePath}" />`;
    const docText = document.getText();

    if (docText.includes(INTELLISENSE_MARKER) || docText.includes(referenceLine)) {
        return;
    }

    const eol = document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
    const insertion = `${INTELLISENSE_MARKER}${eol}${referenceLine}${eol}`;

    let insertPos = new vscode.Position(0, 0);
    if (document.lineCount > 0) {
        const firstLine = document.lineAt(0).text;
        if (firstLine.startsWith('#!')) {
            insertPos = new vscode.Position(1, 0);
        }
    }

    const edit = new vscode.WorkspaceEdit();
    edit.insert(document.uri, insertPos, insertion);
    await vscode.workspace.applyEdit(edit);
}

async function ensureTypesFile(
    workspaceUri: vscode.Uri,
    extensionUri: vscode.Uri
): Promise<vscode.Uri> {
    const vscodeFolder = vscode.Uri.joinPath(workspaceUri, '.vscode');
    const typesUri = vscode.Uri.joinPath(vscodeFolder, 'thorvg-webcanvas.d.ts');

    await vscode.workspace.fs.createDirectory(vscodeFolder);

    const content = await getWebcanvasLibContent(extensionUri);
    const currentContent = await readFileIfExists(typesUri);
    if (currentContent !== content) {
        await vscode.workspace.fs.writeFile(typesUri, Buffer.from(content, 'utf-8'));
    }

    return typesUri;
}

async function getWebcanvasLibContent(extensionUri: vscode.Uri): Promise<string> {
    if (cachedLibContent) {
        return cachedLibContent;
    }

    const sourceUri = vscode.Uri.joinPath(extensionUri, 'thorvg.playground', 'webcanvas.d.ts');
    const sourceBytes = await vscode.workspace.fs.readFile(sourceUri);
    const rawTypes = new TextDecoder('utf-8').decode(sourceBytes);

    cachedLibContent = [
        "declare module '@thorvg/webcanvas' {",
        rawTypes,
        '}',
        '',
        "declare const TVG: import('@thorvg/webcanvas').ThorVGNamespace;",
        "declare const canvas: import('@thorvg/webcanvas').Canvas;",
        ''
    ].join('\n');

    return cachedLibContent;
}

async function readFileIfExists(uri: vscode.Uri): Promise<string | null> {
    try {
        const bytes = await vscode.workspace.fs.readFile(uri);
        return new TextDecoder('utf-8').decode(bytes);
    } catch {
        return null;
    }
}

function toRelativePosixPath(fromDir: string, toFile: string): string {
    const relative = path.relative(fromDir, toFile);
    return relative.split(path.sep).join('/');
}
