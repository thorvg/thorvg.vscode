[![Discord](https://img.shields.io/badge/Community-5865f2?style=flat&logo=discord&logoColor=white)](https://discord.gg/n25xj6J6HM)
[![ThorVGPT](https://img.shields.io/badge/ThorVGPT-76A99C?style=flat&logo=openai&logoColor=white)](https://chat.openai.com/g/g-Ht3dYIwLO-thorvgpt)
[![OpenCollective](https://img.shields.io/badge/OpenCollective-84B5FC?style=flat&logo=opencollective&logoColor=white)](https://opencollective.com/thorvg)
[![License](https://img.shields.io/badge/licence-MIT-green.svg?style=flat)](LICENSE)

# ThorVG for VS Code
<p align="center">
  <img width="800" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/logo/512/thorvg-banner.png">
</p>

A Visual Studio Code extension that integrates [ThorVG Viewer](https://github.com/thorvg/thorvg.viewer) for previewing Lottie animations and SVG files directly inside the editor.

## Contents
- [ThorVG for VS Code](#thorvg-for-vs-code)
  - [Features](#features)
  - [Usage](#usage)
    - [Opening ThorVG Preview](#opening-thorvg-preview)
    - [Commands](#commands)
  - [Development](#development)
    - [Project Launch & Task Configuration](#project-launch--task-configuration)
    - [Package Extension](#package-extension)
    - [Requirements](#requirements)
  - [Communication](#communication)

 [](#contents)
 <br />

## Features

- **Real-time Preview**: View Lottie (`.json`, `.lot`) and SVG files directly in VSCode

<p align="center">
  <img width="800" height="auto" src="https://github.com/user-attachments/assets/b30cf427-9a12-449a-adaa-3062141ba831"/>
</p>

- **Auto-sync**: Automatically updates the preview as you edit files

<p align="center">
  <img width="800" height="auto" src="https://github.com/user-attachments/assets/7c512be9-632e-4cbb-930b-d8ac9a2263f9"/>
</p>

- **Export Options**: Export animations to PNG or GIF
- **Performance Stats**: View FPS, memory usage, and rendering statistics
- **Animation Controls**: Play, pause, loop, and adjust playback speed
- **Dark Mode**: Supports VSCode theme-aware styling

[Back to contents](#contents)

<br />

## Usage

### Opening ThorVG Preview

- **Editor Icon**: Click the ThorVG icon in the editor title bar while a `.svg`, `.json`, or `.lot` file is open to preview it with automatic loading and syncing.

<p align="center">
	<img width="500" height="auto" alt="image" src="https://github.com/user-attachments/assets/5f044aaa-f242-4302-af44-dfd9fd782908" />
</p>

- **Command Palette**: Use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) to open ThorVG Preview.
- **Auto-Sync**: Clicking the editor icon automatically loads the current file, syncs edits in real time, and switches to the active file when you change editors.

### Commands

All commands are accessible via Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- **ThorVG: Open Viewer** - Open ThorVG Preview panel
- **ThorVG: Open Viewer with Current File** - Open ThorVG Preview with current file and enable auto-sync
- **ThorVG: Open Extension Folder** - Open `thorvg-preview` folder (contains `thorvg.wasm`) for easy WASM updates

<p align="center">
	<img width="800" height="auto" alt="image" src="https://github.com/user-attachments/assets/5f549fa8-4eb6-4c39-b4f1-33f92d120bd3" />
</p>

[Back to contents](#contents)

<br />

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

<br />

## Communication
For real-time conversations and discussions, please join us on Discord

[Back to contents](#contents)
