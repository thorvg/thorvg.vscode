/**
 * VSCode Webview Bridge Script for ThorVG Viewer
 * This script bridges file operations between VSCode and the ThorVG Viewer
 */
var isFirstTarget = true;

function applyViewerSize(nextSize) {
    const parsed = Number(nextSize);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        console.warn('VSCode Bridge: Invalid viewer size:', nextSize);
        return;
    }
    window.size = parsed;
    if (window.player) {
        window.resize(window.size, window.size);
        window.refreshZoomValue();
    }
}

function updateRendererSelection(next) {
  const dropdown = document.getElementById('renderer-dropdown');
  if (!dropdown) return;

  if (dropdown.value !== next) {
    dropdown.value = next;
    dropdown.dispatchEvent(new Event('change'));
    window.onRendererMode({ target: { value: next } });
  }
}

(function() {
    // Get VSCode API
    const vscode = acquireVsCodeApi();

    // Override file input behavior
    window.addEventListener('DOMContentLoaded', function() {
        console.log('VSCode Bridge: Initializing...');

        // Handle the main file selector
        const fileSelector = document.getElementById('image-file-selector');
        if (fileSelector) {
            fileSelector.addEventListener('change', e => handleFileInput(e));
        }

        // Track if we already opened VSCode file picker to prevent double dialog
        let isPickingFile = false;

        // Intercept hidden file input to prevent native dialog
        const hiddenFileInput = document.getElementById('hidden-file-input');
        if (hiddenFileInput) {
            // Override click to use VSCode file picker instead
            hiddenFileInput.addEventListener('click', function(e) {
                if (!isPickingFile) {
                    e.preventDefault();
                    e.stopPropagation();

                    isPickingFile = true;
                    console.log('VSCode Bridge: Intercepting file input click, using VSCode picker');

                    // Request VSCode to show file picker
                    vscode.postMessage({
                        command: 'pickFile'
                    });

                    // Reset flag after a short delay
                    setTimeout(() => {
                        isPickingFile = false;
                    }, 500);
                }
            }, true);
        }

        // Also intercept "Add File Local" button click
        const addFileLocalBtn = document.getElementById('add-file-local');
        if (addFileLocalBtn) {
            addFileLocalBtn.addEventListener('click', function(e) {
                if (!isPickingFile) {
                    e.preventDefault();
                    e.stopPropagation();

                    isPickingFile = true;
                    console.log('VSCode Bridge: Add File Local clicked, using VSCode picker');

                    // Request VSCode to show file picker
                    vscode.postMessage({
                        command: 'pickFile'
                    });

                    // Reset flag after a short delay
                    setTimeout(() => {
                        isPickingFile = false;
                    }, 500);
                }
            }, true);
        }

        console.log('VSCode Bridge: Ready');
    });

    // Handle file input events
    function handleFileInput(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                addFileObjectToViewer(file);
            });
        }
    }

    // Process file data
    function processFileData(fileName, fileData) {
        console.log('VSCode Bridge: Processing file:', fileName);

        // Set global variables that ThorVG viewer expects
        window.filename = fileName;

        // Determine file type
        const ext = fileName.split('.').pop().toLowerCase();
        const isLottie = ext === 'json' || ext === 'lot';

        // Process the data based on file type
        let processedData;
        if (isLottie) {
            // For JSON/Lottie files, parse the JSON string
            try {
                processedData = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
            } catch (e) {
                console.error('VSCode Bridge: Failed to parse JSON:', e);
                return;
            }
        } else {
            // For other formats, keep as is
            processedData = fileData;
        }

        // Create a File from the provided data so the built-in list UI keeps working
        const fileForViewer = createFileFromData(fileName, processedData, ext);
        if (!fileForViewer) {
            console.error('VSCode Bridge: Failed to create File object for', fileName);
            return;
        }

        addFileObjectToViewer(fileForViewer);
    }

    // Override export functions to use VSCode file save dialog
    function setupExportOverrides() {
        // Override PNG export
        const exportPngBtn = document.getElementById('export-png');
        if (exportPngBtn) {
            exportPngBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (!window.player) {
                    console.error('VSCode Bridge: No player found for export');
                    vscode.postMessage({
                        command: 'showError',
                        text: 'No player found. Please load a file first.'
                    });
                    return;
                }

                try {
                    console.log('VSCode Bridge: Exporting PNG...');

                    // Try multiple methods to get canvas
                    let canvas = null;

                    // Method 1: Try shadowRoot
                    if (window.player.shadowRoot) {
                        canvas = window.player.shadowRoot.querySelector('canvas');
                        console.log('VSCode Bridge: Tried shadowRoot, canvas found:', !!canvas);
                    }

                    // Method 2: Try direct querySelector
                    if (!canvas) {
                        canvas = window.player.querySelector('canvas');
                        console.log('VSCode Bridge: Tried querySelector, canvas found:', !!canvas);
                    }

                    // Method 3: Check if player itself is a canvas
                    if (!canvas && window.player.tagName === 'CANVAS') {
                        canvas = window.player;
                        console.log('VSCode Bridge: Player itself is canvas');
                    }

                    if (!canvas) {
                        throw new Error('Canvas not found. Player structure: ' + window.player.tagName);
                    }

                    // Convert canvas to data URL directly
                    const dataUrl = canvas.toDataURL('image/png');
                    console.log('VSCode Bridge: PNG data ready, length:', dataUrl.length);

                    // Send to extension for saving
                    vscode.postMessage({
                        command: 'exportFile',
                        fileType: 'png',
                        fileName: (window.filename || 'export').replace(/\.[^/.]+$/, '') + '.png',
                        fileData: dataUrl
                    });

                } catch (error) {
                    console.error('VSCode Bridge: PNG export failed:', error);
                    vscode.postMessage({
                        command: 'showError',
                        text: 'Failed to export PNG: ' + error.message
                    });
                }
            }, true); // Use capture to intercept before main.js handler
        }

        // Override GIF export
        const exportGifBtn = document.getElementById('export-gif');
        if (exportGifBtn) {
            exportGifBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (!window.player || !window.filedata) {
                    console.error('VSCode Bridge: No player or file data found for GIF export');
                    vscode.postMessage({
                        command: 'showError',
                        text: 'No player or file data found. Please load a file first.'
                    });
                    return;
                }

                try {
                    console.log('VSCode Bridge: Exporting GIF...');

                    // We'll intercept the download by overriding click
                    let capturedBlob = null;
                    let capturedFilename = null;

                    // Override URL.createObjectURL to capture blob
                    const originalCreateObjectURL = URL.createObjectURL;
                    URL.createObjectURL = function(blob) {
                        if (blob instanceof Blob) {
                            capturedBlob = blob;
                            console.log('VSCode Bridge: Captured blob, size:', blob.size, 'type:', blob.type);
                        }
                        return originalCreateObjectURL.call(URL, blob);
                    };

                    // Override HTMLAnchorElement click to prevent default download
                    const originalClick = HTMLAnchorElement.prototype.click;
                    HTMLAnchorElement.prototype.click = function() {
                        if (this.download && capturedBlob) {
                            capturedFilename = this.download;
                            console.log('VSCode Bridge: Intercepted download:', capturedFilename);
                            // Don't actually click - we'll handle it ourselves
                            return;
                        }
                        return originalClick.call(this);
                    };

                    // Call the original save2gif
                    await window.player.save2gif(window.filedata);

                    // Restore original functions
                    URL.createObjectURL = originalCreateObjectURL;
                    HTMLAnchorElement.prototype.click = originalClick;

                    // Wait a bit for the blob to be captured
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // If we captured the blob, convert it
                    if (capturedBlob) {
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            const base64data = reader.result;
                            console.log('VSCode Bridge: GIF data ready, size:', capturedBlob.size);

                            vscode.postMessage({
                                command: 'exportFile',
                                fileType: 'gif',
                                fileName: capturedFilename || (window.filename || 'export').replace(/\.[^/.]+$/, '') + '.gif',
                                fileData: base64data
                            });
                        };
                        reader.onerror = function(error) {
                            console.error('VSCode Bridge: FileReader error:', error);
                            throw new Error('Failed to read GIF blob');
                        };
                        reader.readAsDataURL(capturedBlob);
                    } else {
                        throw new Error('Failed to capture GIF blob');
                    }

                } catch (error) {
                    console.error('VSCode Bridge: GIF export failed:', error);
                    vscode.postMessage({
                        command: 'showError',
                        text: 'Failed to export GIF: ' + error.message
                    });
                }
            }, true); // Use capture to intercept before main.js handler
        }
    }

    // Setup other overrides when DOM is ready
    window.addEventListener('DOMContentLoaded', function() {
        setupExportOverrides();
        console.log('VSCode Bridge: Export overrides set up');
        // Notify extension that the webview is ready to receive messages
        vscode.postMessage({ command: 'ready' });
    });

    // Listen for messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        console.log('VSCode Bridge: Received message', message);

        switch (message.command) {
            case 'loadFile':
                // File selected from VSCode file picker
                if (isFirstTarget) {
                    updateRendererSelection('sw');
                }
                processFileData(message.fileName, message.fileData);
                isFirstTarget = false;
                break;
            case 'setViewerSize':
                console.log('VSCode Bridge: Setting viewer size to', message.size);
                applyViewerSize(message.size);
                break;
            case 'error':
                console.error('VSCode Bridge Error:', message.text);
                break;
        }
    });

    // Helper: ensure we have a mutable files list
    function ensureFilesList() {
        if (!Array.isArray(window.filesList)) {
            window.filesList = [];
        }
        return window.filesList;
    }

    // Helper: add a File object to the viewer and list
    function addFileObjectToViewer(file) {
        if (!file || !file.name) return;
        if (typeof window.allowedFileExtension === 'function' && !window.allowedFileExtension(file.name)) {
            console.warn('VSCode Bridge: Unsupported extension for', file.name);
            return;
        }

        // Replace existing entry with the same name
        const list = ensureFilesList();
        const existingIndex = list.findIndex(f => f.name === file.name);
        if (existingIndex >= 0) {
            list.splice(existingIndex, 1);
        }
        list.push(file);

        // Use the viewer's loader; loadData is already overridden to work in VSCode
        if (typeof window.loadFile === 'function') {
            console.log('VSCode Bridge: Using window.loadFile');
            window.loadFile(file);
        } else if (typeof window.loadData === 'function') {
            console.log('VSCode Bridge: Using window.loadData fallback');
            // Fallback: read text or data URL ourselves
            const ext = file.name.split('.').pop()?.toLowerCase();
            const reader = new FileReader();
            reader.onload = e => {
                console.log('VSCode Bridge: File read complete, calling loadData with ext:', ext);
                window.loadData(e.target.result, ext);
            };
            // SVG should be read as text, not data URL
            if (ext === 'json' || ext === 'lot' || ext === 'svg') {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        } else {
            console.error('VSCode Bridge: No loadFile/loadData available');
        }

        // Force update the files list UI with a small delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof window.createFilesListTab === 'function') {
                console.log('VSCode Bridge: Calling createFilesListTab');
                window.createFilesListTab();
                applyViewerSize(window.size);
            } else {
                console.warn('VSCode Bridge: createFilesListTab not available');
            }
        }, 100);
    }

    // Helper: build a File object from data supplied by the extension
    function createFileFromData(fileName, data, ext) {
        try {
            ext = ext || fileName.split('.').pop()?.toLowerCase();
            let blob;

            if (ext === 'json' || ext === 'lot') {
                const text = typeof data === 'string' ? data : JSON.stringify(data);
                blob = new Blob([text], { type: 'application/json' });
            } else if (ext === 'svg') {
                const text = typeof data === 'string' ? data : String(data);
                blob = new Blob([text], { type: 'image/svg+xml' });
            } else if (typeof data === 'string' && data.startsWith('data:')) {
                blob = dataUrlToBlob(data);
            } else if (typeof data === 'string') {
                blob = base64ToBlob(data, 'application/octet-stream');
            } else if (data instanceof Uint8Array) {
                blob = new Blob([data], { type: 'application/octet-stream' });
            } else {
                console.error('VSCode Bridge: Unsupported data type for', fileName);
                return null;
            }

            return new File([blob], fileName, { type: blob.type });
        } catch (err) {
            console.error('VSCode Bridge: Failed to build File object:', err);
            return null;
        }
    }

    function dataUrlToBlob(dataUrl) {
        const parts = dataUrl.split(',');
        const meta = parts[0] || '';
        const base64 = parts[1] || '';
        const mimeMatch = meta.match(/data:(.*?);base64/);
        const contentType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bytes = atob(base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            arr[i] = bytes.charCodeAt(i);
        }
        return new Blob([arr], { type: contentType });
    }

    function base64ToBlob(base64, type) {
        const bytes = atob(base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            arr[i] = bytes.charCodeAt(i);
        }
        return new Blob([arr], { type });
    }

})();
