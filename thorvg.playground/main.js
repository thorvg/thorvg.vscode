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

/**
 * ThorVG Playground - Main Webview Script
 * This script initializes ThorVG and handles code execution in the webview.
 */

(function() {
    'use strict';

    // Get VSCode API
    const vscode = acquireVsCodeApi();

    // State
    let TVG = null;
    let canvas = null;
    let currentRenderer = 'sw';
    let animationId = null;
    let isInitialized = false;
    let isConfigReceived = false;
    let pendingCode = null;

    // DOM Elements
    const canvasEl = document.getElementById('canvas');
    const rendererSelect = document.getElementById('renderer');
    const autoRunCheckbox = document.getElementById('auto-run');
    const darkCanvasCheckbox = document.getElementById('dark-canvas');
    const clearBtn = document.getElementById('clear-btn');
    const runBtn = document.getElementById('run-btn');
    const statusBar = document.getElementById('status-bar');

    // Fetch cache for resources
    const fetchCache = new Map();

    /**
     * Update status bar
     */
    function setStatus(message, type = 'info') {
        statusBar.textContent = message;
        statusBar.className = 'status-bar ' + type;
    }

    /**
     * Initialize ThorVG with the specified renderer
     */
    async function initThorVG(renderer) {
        try {
            setStatus(`Initializing ThorVG with ${renderer.toUpperCase()} renderer...`, 'info');

            // Get configuration from window (injected by extension)
            const config = window.__thorvg_config__ || {};
            const wasmUrl = config.wasmUri;
            const webcanvasUrl = config.webcanvasUri;

            if (!wasmUrl || !webcanvasUrl) {
                throw new Error('Missing WASM or WebCanvas URI configuration');
            }

            // Dynamically import the WebCanvas module
            const module = await import(webcanvasUrl);

            TVG = await module.init({
                renderer: renderer,
                locateFile: () => wasmUrl
            });

            applyLegacyScalePatch(TVG);

            canvas = new TVG.Canvas('#canvas', {
                width: 600,
                height: 600
            });

            currentRenderer = renderer;
            isInitialized = true;
            setStatus('Ready', 'success');

            // Notify extension that ThorVG initialization is complete
            vscode.postMessage({ command: 'initialized' });

            // Execute pending code if any
            if (pendingCode) {
                executeCode(pendingCode);
                pendingCode = null;
            }
        } catch (error) {
            console.error('ThorVG initialization error:', error);
            setStatus(`Initialization error: ${error.message}`, 'error');
            vscode.postMessage({
                command: 'error',
                text: `Failed to initialize ThorVG: ${error.message}`
            });
        }
    }

    /**
     * Patch scale() for legacy WASM signatures (expects 2 args).
     * Falls back to transform() for non-uniform scaling.
     */
    function applyLegacyScalePatch(TVGInstance) {
        const moduleInstance = globalThis.__ThorVGModule;
        if (!moduleInstance || typeof moduleInstance._tvg_paint_scale !== 'function') {
            return;
        }

        if (moduleInstance._tvg_paint_scale.length >= 3) {
            return;
        }

        const targets = [
            TVGInstance.Scene,
            TVGInstance.Shape,
            TVGInstance.Picture,
            TVGInstance.Text
        ];

        for (const Target of targets) {
            if (!Target || !Target.prototype) {
                continue;
            }

            Target.prototype.scale = function(sx, sy = sx) {
                if (sy !== sx && typeof this.transform === 'function') {
                    return this.transform({
                        e11: sx,
                        e12: 0,
                        e13: 0,
                        e21: 0,
                        e22: sy,
                        e23: 0,
                        e31: 0,
                        e32: 0,
                        e33: 1
                    });
                }

                moduleInstance._tvg_paint_scale(this.ptr, sx);
                return this;
            };
        }
    }

    /**
     * Create a cached fetch wrapper
     */
    function cachedFetch(url, init) {
        const urlString = url.toString();
        const method = init?.method?.toUpperCase() || 'GET';

        // Only cache GET requests
        if (method !== 'GET') {
            return fetch(url, init);
        }

        // Check cache
        if (fetchCache.has(urlString)) {
            const cached = fetchCache.get(urlString);
            return Promise.resolve(new Response(cached.data, {
                status: cached.status,
                statusText: cached.statusText + ' (cached)',
                headers: cached.headers
            }));
        }

        // Fetch and cache
        return fetch(url, init).then(async response => {
            const data = await response.arrayBuffer();
            fetchCache.set(urlString, {
                data,
                headers: response.headers,
                status: response.status,
                statusText: response.statusText
            });
            return new Response(data, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        });
    }

    /**
     * Wrapped requestAnimationFrame that tracks animation IDs
     */
    function wrappedRAF(callback) {
        animationId = requestAnimationFrame(callback);
        return animationId;
    }

    /**
     * Clear the canvas and stop animations
     */
    function clearCanvas() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (canvas) {
            canvas.clear();
        }
        setStatus('Canvas cleared', 'success');
    }

    /**
     * Execute user code
     * The code is expected to be pre-bundled and transformed by the extension
     */
    function executeCode(code) {
        if (!isInitialized || !canvas || !TVG) {
            pendingCode = code;
            setStatus('Waiting for ThorVG initialization...', 'warning');
            return;
        }

        // Clear previous state
        clearCanvas();
        setStatus('Running code...', 'info');

        try {
            // Create the execution context
            // The code should be an IIFE that uses these globals
            window.__thorvg_context__ = {
                TVG: TVG,
                canvas: canvas,
                requestAnimationFrame: wrappedRAF,
                performance: window.performance,
                console: window.console,
                fetch: cachedFetch
            };

            // Execute the bundled code
            // The extension will bundle user code into a self-contained script
            // and send it as a string to be evaluated
            const executeUserCode = new Function(
                'TVG',
                'canvas',
                'requestAnimationFrame',
                'performance',
                'console',
                'fetch',
                code
            );

            executeUserCode(
                TVG,
                canvas,
                wrappedRAF,
                window.performance,
                window.console,
                cachedFetch
            );

            setStatus('Code executed successfully', 'success');
        } catch (error) {
            console.error('Code execution error:', error);
            setStatus(`Error: ${error.message}`, 'error');
            vscode.postMessage({
                command: 'executionError',
                text: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * Handle renderer change
     */
    async function handleRendererChange() {
        const newRenderer = rendererSelect.value;
        if (newRenderer !== currentRenderer) {
            // Wait for config to be received before initializing
            if (!isConfigReceived) {
                currentRenderer = newRenderer;
                return;
            }
            // Notify extension about renderer change
            vscode.postMessage({
                command: 'rendererChange',
                renderer: newRenderer
            });
            // Re-initialize ThorVG with new renderer
            isInitialized = false;
            await initThorVG(newRenderer);
        }
    }

    /**
     * Handle dark canvas toggle
     */
    function handleDarkCanvasChange() {
        if (darkCanvasCheckbox.checked) {
            canvasEl.classList.add('dark');
        } else {
            canvasEl.classList.remove('dark');
        }
    }

    // Event Listeners
    rendererSelect.addEventListener('change', handleRendererChange);
    darkCanvasCheckbox.addEventListener('change', handleDarkCanvasChange);
    clearBtn.addEventListener('click', clearCanvas);
    runBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'requestCode' });
    });

    // Listen for messages from the extension
    window.addEventListener('message', async event => {
        const message = event.data;
        console.log('Playground: Received message', message.command);

        switch (message.command) {
            case 'init':
                // Initialize with configuration
                window.__thorvg_config__ = {
                    wasmUri: message.wasmUri,
                    webcanvasUri: message.webcanvasUri
                };
                isConfigReceived = true;
                await initThorVG(message.renderer || 'sw');
                break;

            case 'executeCode':
                // Execute bundled user code
                executeCode(message.code);
                break;

            case 'setRenderer':
                rendererSelect.value = message.renderer;
                await handleRendererChange();
                break;

            case 'clearCanvas':
                clearCanvas();
                break;

            case 'setAutoRun':
                autoRunCheckbox.checked = message.enabled;
                break;

            case 'setDarkCanvas':
                darkCanvasCheckbox.checked = message.enabled;
                handleDarkCanvasChange();
                break;
        }
    });

    // Notify extension that the webview is ready to receive config
    vscode.postMessage({ command: 'ready' });

})();
