# DocMarkings - WYSIWYG Markdown Editor

A standalone Windows desktop application for professional WYSIWYG markdown editing built with Tauri and React.

## Features

- **True WYSIWYG markdown editing** using TipTap editor
- **Multiple tabs support** - work with multiple documents simultaneously
- **Native file operations** with Windows file dialogs
- **Recent files menu** with persistent storage
- **Auto-focus and click-to-focus** editing experience
- **Comprehensive keyboard shortcuts** for efficient editing
- **Advanced markdown support**:
  - Headers (H1-H6) with regular text option
  - Bold, italic, and inline code formatting
  - Bullet and numbered lists
  - Task lists with checkboxes
  - Links and images
  - Code blocks with syntax highlighting
  - Tables with full management tools
  - Blockquotes
- **Professional table editing**:
  - Add/remove columns and rows
  - Contextual table management toolbar
  - Resizable tables
- **Find and replace functionality**
- **Save confirmation dialogs** for unsaved changes

## Keyboard Shortcuts

### File Operations
- `Ctrl+N` - New file
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save as
- `Ctrl+R` - Open most recent file

### Tab Management
- `Ctrl+T` - New tab
- `Ctrl+W` - Close current tab (with save confirmation)
- `Ctrl+Tab` - Switch to next tab
- `Ctrl+Shift+Tab` - Switch to previous tab

### Editing
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+F` - Find
- `Ctrl+H` - Find and replace

### Text Formatting
- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Ctrl+L` - Insert link

### Headers
- `Ctrl+0` - Regular text/paragraph
- `Ctrl+1` through `Ctrl+6` - Header levels H1-H6

### Lists
- `Ctrl+Shift+8` - Bullet list
- `Ctrl+Shift+7` - Numbered list

### Code
- `Ctrl+Shift+C` - Code block

## Installation & Development

### Prerequisites
- Node.js (latest LTS version)
- Rust (for Tauri)
- Windows development environment

### Setup
1. Install dependencies:
```bash
npm install
```

2. Install Tauri CLI:
```bash
npm install -g @tauri-apps/cli
```

3. Run in development mode:
```bash
npm run tauri dev
```

4. Build for production:
```bash
npm run tauri build
```

## Project Structure

```
markdown-editor/
├── src/                    # React frontend source
│   ├── components/         # React components
│   │   ├── Toolbar.tsx     # Editor toolbar with recent files
│   │   ├── TabBar.tsx      # Multiple tabs interface
│   │   └── FindReplaceDialog.tsx
│   ├── App.tsx            # Main app with tab management
│   ├── main.tsx           # React entry point
│   └── styles.css         # Global styles
├── src-tauri/             # Tauri backend
│   ├── src/               # Rust source code
│   ├── icons/             # Application icons
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **Editor**: TipTap (ProseMirror-based WYSIWYG editor)
- **Desktop Framework**: Tauri (Rust + Web)
- **Syntax Highlighting**: Lowlight
- **Icons**: Lucide React

## Building for Distribution

The application builds to standalone Windows executables and installers:

```bash
npm run tauri build
```

**Output files**:
- **Executable**: `src-tauri/target/release/docmarkings.exe`
- **MSI Installer**: `src-tauri/target/release/bundle/msi/DocMarkings_1.0.0_x64_en-US.msi`
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/DocMarkings_1.0.0_x64-setup.exe`

**Distribution recommendations**:
- Use NSIS installer for general distribution
- Use MSI installer for enterprise environments
- Raw executable for portable usage

## User Features

- **Professional Interface**: Clean, intuitive interface designed for writing
- **Auto-save Prompts**: Never lose work with smart save confirmations
- **Recent Files**: Quick access to recently opened documents
- **Portable**: Self-contained executable with no external dependencies
- **Performance**: Fast startup and responsive editing experience
