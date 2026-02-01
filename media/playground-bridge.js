/**
 * VSCode Webview Bridge Script for ThorVG Playground
 * This script bridges file operations between VSCode and the Playground webview.
 *
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

(function() {
    'use strict';

    // Get VSCode API if not already acquired
    const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

    if (!vscode) {
        console.warn('Playground Bridge: VSCode API not available');
        return;
    }

    // Override console to send logs to extension
    const originalConsole = {
        log: console.log.bind(console),
        error: console.error.bind(console),
        warn: console.warn.bind(console),
        info: console.info.bind(console)
    };

    // Don't override console in playground to avoid noise
    // Just provide a way to send messages back to extension

    /**
     * Send a message to the extension
     */
    function sendMessage(command, data = {}) {
        vscode.postMessage({ command, ...data });
    }

    /**
     * Show an error in VSCode
     */
    window.showError = function(message) {
        sendMessage('error', { text: message });
    };

    /**
     * Log a message to VSCode console
     */
    window.logToExtension = function(message) {
        sendMessage('log', { text: message });
    };

    // Expose bridge utilities
    window.__playgroundBridge__ = {
        sendMessage,
        showError: window.showError,
        log: window.logToExtension,
        vscode
    };

    console.log('Playground Bridge: Initialized');

})();
