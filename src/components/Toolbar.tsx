import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  FolderOpen,
  Save,
  FileText,
  Search,
  CheckSquare,
  Plus,
  Minus,
  Columns,
  Rows,
  Type,
  Clock,
  ChevronDown
} from 'lucide-react';

// Props for the main toolbar component
interface ToolbarProps {
  editor: Editor;                               // TipTap editor instance
  onNewFile: () => void;                        // New file handler
  onOpenFile: () => void;                       // Open file handler
  onSaveFile: () => void;                       // Save file handler
  onSaveAsFile: () => void;                     // Save as handler
  onFindReplace: () => void;                    // Find/replace dialog toggle
  onOpenRecentFile: (filePath: string) => void; // Open recent file handler
  currentFile: string | null;                   // Current file path
  isModified: boolean;                          // Current file modification state
  recentFiles: string[];                        // List of recent files
}

/**
 * Toolbar Component
 * Main editor toolbar with all formatting and file operations
 * Features:
 * - File operations (New, Open, Save)
 * - Recent files dropdown menu
 * - Text formatting controls
 * - Headers and lists management
 * - Table insertion and management
 * - Find/Replace functionality
 * - Current file status display
 */
const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onFindReplace,
  onOpenRecentFile,
  currentFile,
  isModified,
  recentFiles
}) => {
  // Recent files dropdown visibility state
  const [showRecentFiles, setShowRecentFiles] = React.useState(false);

  // Auto-close recent files menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowRecentFiles(false);
    };

    if (showRecentFiles) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showRecentFiles]);
  // ========== Helper Functions ==========
  // Prompt for link URL and insert into document
  const addLink = () => {
    const url = window.prompt('Enter link URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Prompt for image URL and insert into document
  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Insert default 3x3 table with header row
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  // ========== Table Management Functions ==========
  // Add column before current position
  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  // Add column after current position
  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  // Delete current column
  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  // Add row above current position
  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  // Add row below current position
  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  // Delete current row
  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  // Delete entire table
  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  // Check if cursor is currently inside a table
  const isInTable = editor.isActive('table');

  return (
    <div className="toolbar">
      {/* ========== File Operations Section ========== */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onNewFile}
          title="New (Ctrl+N)"
        >
          <FileText size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={onOpenFile}
          title="Open (Ctrl+O)"
        >
          <FolderOpen size={16} />
        </button>
        {/* Recent files dropdown container */}
        <div style={{ position: 'relative' }}>
          <button
            className="toolbar-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowRecentFiles(!showRecentFiles);
            }}
            title="Recent Files (Ctrl+R)"
            style={{ paddingRight: '20px' }}
          >
            <Clock size={16} />
            <ChevronDown size={12} style={{ position: 'absolute', right: '4px' }} />
          </button>
          {/* Recent files dropdown menu */}
          {showRecentFiles && recentFiles.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '300px',
                maxHeight: '300px',
                overflow: 'auto'
              }}
            >
              {recentFiles.map((filePath, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onOpenRecentFile(filePath);
                    setShowRecentFiles(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '12px',
                    borderBottom: index < recentFiles.length - 1 ? '1px solid #eee' : 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                    {filePath.split('\\').pop() || filePath.split('/').pop()}
                  </div>
                  <div style={{ color: '#666', fontSize: '10px' }}>
                    {filePath}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="toolbar-button"
          onClick={onSaveFile}
          title="Save (Ctrl+S)"
        >
          <Save size={16} />
        </button>
      </div>

      {/* ========== Undo/Redo Section ========== */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* ========== Text Formatting Section ========== */}
      <div className="toolbar-group">
        <button
          className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code size={16} />
        </button>
      </div>

      {/* ========== Headings Section ========== */}
      <div className="toolbar-group">
        <button
          className={`toolbar-button ${editor.isActive('paragraph') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Regular Text (Ctrl+0)"
        >
          <Type size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1 (Ctrl+1)"
        >
          <Heading1 size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2 (Ctrl+2)"
        >
          <Heading2 size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3 (Ctrl+3)"
        >
          <Heading3 size={16} />
        </button>
      </div>

      {/* ========== Lists Section ========== */}
      <div className="toolbar-group">
        <button
          className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <ListOrdered size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('taskList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task List"
        >
          <CheckSquare size={16} />
        </button>
      </div>

      {/* ========== Block Elements Section ========== */}
      <div className="toolbar-group">
        <button
          className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote size={16} />
        </button>
        <button
          className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block (Ctrl+Shift+C)"
        >
          <Code size={16} />
        </button>
      </div>

      {/* ========== Links and Media Section ========== */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={addLink}
          title="Insert Link (Ctrl+L)"
        >
          <LinkIcon size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={addImage}
          title="Insert Image"
        >
          <ImageIcon size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={insertTable}
          title="Insert Table"
        >
          <TableIcon size={16} />
        </button>
      </div>

      {/* ========== Contextual Table Management ========== */}
      {/* Only visible when cursor is inside a table */}
      {isInTable && (
        <div className="toolbar-group">
          <button
            className="toolbar-button"
            onClick={addColumnBefore}
            title="Add Column Before"
          >
            <Plus size={12} />
            <Columns size={12} />
          </button>
          <button
            className="toolbar-button"
            onClick={addColumnAfter}
            title="Add Column After"
          >
            <Columns size={12} />
            <Plus size={12} />
          </button>
          <button
            className="toolbar-button"
            onClick={deleteColumn}
            title="Delete Column"
          >
            <Columns size={12} />
            <Minus size={12} />
          </button>
          <button
            className="toolbar-button"
            onClick={addRowBefore}
            title="Add Row Before"
          >
            <Plus size={12} />
            <Rows size={12} />
          </button>
          <button
            className="toolbar-button"
            onClick={addRowAfter}
            title="Add Row After"
          >
            <Rows size={12} />
            <Plus size={12} />
          </button>
          <button
            className="toolbar-button"
            onClick={deleteRow}
            title="Delete Row"
          >
            <Rows size={12} />
            <Minus size={12} />
          </button>
          <button
            className="toolbar-button"
            onClick={deleteTable}
            title="Delete Table"
            style={{ color: '#d32f2f' }}
          >
            <TableIcon size={16} />
            <Minus size={12} />
          </button>
        </div>
      )}

      {/* ========== Find/Replace Section ========== */}
      <div className="toolbar-group">
        <button
          className="toolbar-button"
          onClick={onFindReplace}
          title="Find/Replace (Ctrl+F)"
        >
          <Search size={16} />
        </button>
      </div>

      {/* ========== File Status Display ========== */}
      {/* Auto-positioned to the right */}
      <div className="toolbar-group" style={{ marginLeft: 'auto' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {currentFile ? currentFile.split('\\').pop() || currentFile.split('/').pop() : 'Untitled'}
          {isModified && '*'}
        </span>
      </div>
    </div>
  );
};

export default Toolbar;