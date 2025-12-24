# ThorVG Viewer for VS Code

A Visual Studio Code extension that integrates [ThorVG Viewer](https://github.com/thorvg/thorvg.viewer) for previewing Lottie animations and SVG files directly inside the editor.

## Contents
- [ThorVG Viewer for VS Code](#thorvg-viewer-for-vs-code)
  - [Features](#features)
  - [Usage](#usage)
    - [Opening ThorVG Viewer](#opening-thorvg-viewer)
    - [Commands](cCommands)
  - [Development](#development)
    - [Project Launch & Task Configuration](#project-launch--task-configuration)
    - [Package Extension](#package-extension)
    - [Requirements](#requirements)
  - [Communication](#communication)

 [](#contents)
 <br />

## Features

- **Real-time Preview**: View Lottie (`.json`, `.lot`) and SVG files directly in VSCode

![preview](https://github.com/user-attachments/assets/b30cf427-9a12-449a-adaa-3062141ba831)

- **Auto-sync**: Automatically updates the preview as you edit files

![auto-sync](https://github.com/user-attachments/assets/7c512be9-632e-4cbb-930b-d8ac9a2263f9)

- **Export Options**: Export animations to PNG or GIF
- **Performance Stats**: View FPS, memory usage, and rendering statistics
- **Animation Controls**: Play, pause, loop, and adjust playback speed
- **Dark Mode**: Supports VSCode theme-aware styling

[Back to contents](#contents)

## Usage

### Opening ThorVG Viewer

**Method 1: Command Palette**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
2. Type "Open ThorVG Viewer"
3. Select the command

**Method 2: Editor Icon (Recommended)**

<img width="335" height="81" alt="image" src="https://github.com/user-attachments/assets/5f044aaa-f242-4302-af44-dfd9fd782908" />

1. Open a `.svg`, `.json`, or `.lot` file
2. Click the ThorVG icon in the editor title bar (top-right)
3. The viewer opens with your file automatically loaded and synced

**Method 3: Auto-sync Current File**
- When you click the editor icon, the viewer automatically:
  - Loads your current file
  - Syncs changes as you edit
  - Switches to the active file when you change editors

[Back to contents](#contents)

### Commands

![command](https://github.com/user-attachments/assets/5f549fa8-4eb6-4c39-b4f1-33f92d120bd3)

All commands are accessible via Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- **ThorVG: Open Viewer** - Open ThorVG Viewer panel
- **ThorVG: Open Viewer with Current File** - Open ThorVG Viewer with current file and enable auto-sync
- **ThorVG: Open Extension Folder** - Open `thorvg-viewer` folder (contains `thorvg.wasm`) for easy WASM updates

## Development

### Project Launch & Task Configuration

**`.vscode/launch.json`**

```json
{
	"name": "Run Extension",
	"type": "extensionHost",
	"request": "launch",
	"args": [
		"--extensionDevelopmentPath=${workspaceFolder}"
	],
	"outFiles": [
		"${workspaceFolder}/out/**/*.js"
	],
	"preLaunchTask": "${defaultBuildTask}"
},
```

**`.vscode/tasks.json`**

```json
{
	"type": "npm",
	"script": "compile",
	"group": {
		"kind": "build",
		"isDefault": true
	}
},
```

### Package Extension

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package extension
vsce package
```

This creates a `.vsix` file that can be installed in VSCode.

### Requirements

- Node.js >= 18
- Visual Studio Code >= 1.85

[Back to contents](#contents)

## Communication
For real-time conversations and discussions, please join us on Discord

[Back to contents](#contents)
