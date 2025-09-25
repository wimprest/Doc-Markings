# DocMarkings - Development Notes

This document contains development information and build commands for the DocMarkings WYSIWYG Markdown Editor.

## Quick Commands

### Development
```bash
npm run tauri dev
```

### Build Production
```bash
npm run tauri build
```

### Lint & Type Check
```bash
npm run build  # Runs TypeScript compilation check
```

## Project Overview

DocMarkings is a professional Windows desktop markdown editor built with:
- **Frontend**: React + TypeScript + TipTap editor
- **Backend**: Tauri (Rust)
- **UI**: Custom styling with Lucide icons

## Key Features Implemented

1. **Multiple Tabs Support**
   - Tab creation, switching, and closing
   - Individual file state per tab
   - Save confirmation per tab

2. **File Management**
   - Native Windows dialogs for open/save
   - Recent files with localStorage persistence
   - Auto-save prompts for unsaved changes

3. **Editor Features**
   - WYSIWYG markdown editing
   - Comprehensive keyboard shortcuts
   - Table management tools
   - Find/replace functionality
   - Syntax highlighting for code blocks

4. **User Experience**
   - Auto-focus on startup
   - Click-anywhere-to-focus
   - Professional interface design
   - Contextual toolbars

## Build Outputs

The build process creates:
- `docmarkings.exe` - Standalone executable
- `DocMarkings_1.0.0_x64_en-US.msi` - MSI installer
- `DocMarkings_1.0.0_x64-setup.exe` - NSIS installer

## Architecture Notes

### Tab Management
- `Tab` interface defines tab structure
- State managed in `App.tsx` with React hooks
- `TabBar.tsx` component handles UI
- Save confirmations integrated with tab operations

### File Operations
- All file operations work through active tab
- Recent files stored in localStorage
- Error handling for missing files

### Editor Integration
- TipTap editor with multiple extensions
- Lowlight for syntax highlighting
- Custom toolbar with contextual buttons

## Development Tips

1. **TypeScript Compilation**: Always check `npm run build` before committing
2. **Tab State**: Remember that editor content syncs with active tab
3. **Save Logic**: Each tab maintains its own modification state
4. **Keyboard Shortcuts**: All shortcuts defined in `App.tsx` useEffect

## Troubleshooting

### Build Issues
- Ensure Rust is installed: `cargo --version`
- Check Node.js version compatibility
- Run `npm install` if dependencies are missing

### Runtime Issues
- Check browser console in dev mode for React errors
- Verify Tauri permissions in `tauri.conf.json`
- Confirm file paths are absolute, not relative