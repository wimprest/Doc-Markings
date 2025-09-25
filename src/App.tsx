import { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { createLowlight, common } from 'lowlight';
import { fs } from '@tauri-apps/api';
import { open, save, confirm } from '@tauri-apps/api/dialog';
import { appWindow } from '@tauri-apps/api/window';
import Toolbar from './components/Toolbar';
import FindReplaceDialog from './components/FindReplaceDialog';
import TabBar from './components/TabBar';

// Tab data structure for managing multiple document tabs
interface Tab {
  id: string;              // Unique identifier for the tab
  title: string;           // Display name in tab bar
  filePath: string | null; // Full path to file (null for unsaved)
  content: string;         // HTML content of the document
  isModified: boolean;     // Track unsaved changes
}

function App() {
  // Tab management state - always maintain at least one tab
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Untitled',
      filePath: null,
      content: '',
      isModified: false
    }
  ]);

  // Currently active tab identifier
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Find/Replace dialog visibility
  const [showFindReplace, setShowFindReplace] = useState(false);

  // Recent files list (persisted in localStorage)
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  // Get current active tab object (fallback to first tab)
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  // ========== Recent Files Management ==========
  // Load recent files from localStorage on startup
  const loadRecentFiles = useCallback(() => {
    try {
      const saved = localStorage.getItem('docmarkings-recent-files');
      if (saved) {
        const files = JSON.parse(saved);
        setRecentFiles(files);
      }
    } catch (error) {
      console.error('Error loading recent files:', error);
    }
  }, []);

  const saveRecentFiles = useCallback((files: string[]) => {
    try {
      localStorage.setItem('docmarkings-recent-files', JSON.stringify(files));
      setRecentFiles(files);
    } catch (error) {
      console.error('Error saving recent files:', error);
    }
  }, []);

  const addToRecentFiles = useCallback((filePath: string) => {
    const updated = [filePath, ...recentFiles.filter(f => f !== filePath)].slice(0, 10);
    saveRecentFiles(updated);
  }, [recentFiles, saveRecentFiles]);

  const removeFromRecentFiles = useCallback((filePath: string) => {
    const updated = recentFiles.filter(f => f !== filePath);
    saveRecentFiles(updated);
  }, [recentFiles, saveRecentFiles]);

  // Load recent files on startup
  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  // ========== Tab Management Functions ==========
  // Update content and modification state for a specific tab
  const updateTabContent = useCallback((tabId: string, content: string, isModified: boolean = true) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, content, isModified }
        : tab
    ));
  }, []);

  const updateTabFile = useCallback((tabId: string, filePath: string | null, title: string, isModified: boolean = false) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, filePath, title, isModified }
        : tab
    ));
  }, []);

  const createNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: 'Untitled',
      filePath: null,
      content: '',
      isModified: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    return newTabId;
  }, []);

  // Close a tab (maintains at least one tab open)
  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      // If we closed the active tab, switch to the last remaining tab
      if (tabId === activeTabId && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      // Always keep at least one tab open
      return filtered.length === 0 ? [{
        id: `tab-${Date.now()}`,
        title: 'Untitled',
        filePath: null,
        content: '',
        isModified: false
      }] : filtered;
    });
  }, [activeTabId]);

  // Initialize syntax highlighter for code blocks
  const lowlight = createLowlight(common);

  // ========== TipTap Editor Configuration ==========
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: activeTab.content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      const isModified = newContent !== '<p></p>' && newContent !== activeTab.content;
      updateTabContent(activeTabId, newContent, isModified);
    },
    onCreate: ({ editor }) => {
      // Auto-focus the editor when it's created
      setTimeout(() => {
        editor.commands.focus();
      }, 100);
    },
  });

  const checkUnsavedChanges = useCallback(async (tabId?: string) => {
    const tab = tabId ? tabs.find(t => t.id === tabId) : activeTab;
    if (!tab?.isModified) {
      return true;
    }

    try {
      const fileName = tab.filePath ? tab.filePath.split('\\').pop() : tab.title;

      const shouldDiscard = await confirm(
        `Discard unsaved changes to ${fileName}?`,
        { title: 'Confirm', type: 'warning' }
      );

      return shouldDiscard;
    } catch (error) {
      console.error('Error in checkUnsavedChanges:', error);
      return false;
    }
  }, [tabs, activeTab]);

  const handleCloseTab = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (tab.isModified) {
      const proceed = await checkUnsavedChanges(tabId);
      if (!proceed) return;
    }

    closeTab(tabId);
  }, [tabs, closeTab, checkUnsavedChanges]);

  // Synchronize editor content when switching between tabs
  useEffect(() => {
    if (editor && activeTab) {
      editor.commands.setContent(activeTab.content);
    }
  }, [editor, activeTab.id, activeTab.content]);

  // ========== File Operations ==========
  // Save current tab's content to file
  const handleSaveFile = useCallback(async () => {
    if (!editor) return false;

    try {
      let filePath = activeTab.filePath;

      // If no file path, prompt for save location
      if (!filePath) {
        const selected = await save({
          filters: [{
            name: 'Markdown',
            extensions: ['md']
          }]
        });
        if (!selected) return false;
        filePath = selected;
      }

      const htmlContent = editor.getHTML();
      // Convert HTML back to markdown (simplified conversion)
      // TODO: Consider using a proper HTML to Markdown converter library
      const markdownContent = htmlContent
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br>/g, '\n')
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<em>/g, '*')
        .replace(/<\/em>/g, '*')
        .replace(/<h([1-6])>/g, (_match, level) => '#'.repeat(parseInt(level)) + ' ')
        .replace(/<\/h[1-6]>/g, '\n\n');

      await fs.writeTextFile(filePath as string, markdownContent);

      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Untitled';
      updateTabFile(activeTabId, filePath, fileName, false);
      addToRecentFiles(filePath);
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  }, [editor, activeTab, activeTabId, updateTabFile, addToRecentFiles]);


  const handleNewFile = useCallback(async () => {
    createNewTab();
  }, [createNewTab]);

  const handleOpenFile = useCallback(async () => {
    if (!editor) return;

    const proceed = await checkUnsavedChanges();
    if (!proceed) return;

    try {
      const selected = await open({
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown', 'txt']
        }]
      });

      if (selected && typeof selected === 'string') {
        const content = await fs.readTextFile(selected);
        // Convert markdown to HTML for display (simplified)
        const htmlContent = content.replace(/\n/g, '<br>');
        const fileName = selected.split('\\').pop() || selected.split('/').pop() || 'Untitled';

        updateTabFile(activeTabId, selected, fileName);
        updateTabContent(activeTabId, htmlContent, false);
        addToRecentFiles(selected);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, [editor, checkUnsavedChanges, activeTabId, updateTabFile, updateTabContent, addToRecentFiles]);

  const handleSaveAsFile = useCallback(async () => {
    if (!editor) return;

    try {
      const selected = await save({
        filters: [{
          name: 'Markdown',
          extensions: ['md']
        }]
      });

      if (!selected) return;

      const htmlContent = editor.getHTML();
      // Convert HTML back to markdown (simplified conversion)
      // TODO: Consider using a proper HTML to Markdown converter library
      const markdownContent = htmlContent
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br>/g, '\n')
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<em>/g, '*')
        .replace(/<\/em>/g, '*')
        .replace(/<h([1-6])>/g, (_match, level) => '#'.repeat(parseInt(level)) + ' ')
        .replace(/<\/h[1-6]>/g, '\n\n');

      await fs.writeTextFile(selected, markdownContent);
      const fileName = selected.split('\\').pop() || selected.split('/').pop() || 'Untitled';
      updateTabFile(activeTabId, selected, fileName, false);
      addToRecentFiles(selected);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }, [editor, activeTabId, updateTabFile, addToRecentFiles]);

  const handleOpenRecentFile = useCallback(async (filePath: string) => {
    if (!editor) return;

    const proceed = await checkUnsavedChanges();
    if (!proceed) return;

    try {
      const content = await fs.readTextFile(filePath);
      // Convert markdown to HTML for display (simplified)
      const htmlContent = content.replace(/\n/g, '<br>');
      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'Untitled';

      updateTabFile(activeTabId, filePath, fileName);
      updateTabContent(activeTabId, htmlContent, false);
      addToRecentFiles(filePath);
    } catch (error) {
      console.error('Failed to open recent file:', error);
      // Remove from recent files if file no longer exists
      removeFromRecentFiles(filePath);
    }
  }, [editor, checkUnsavedChanges, activeTabId, updateTabFile, updateTabContent, addToRecentFiles, removeFromRecentFiles]);

  // ========== Keyboard Shortcuts Handler ==========
  // Global keyboard shortcuts for all editor operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editor) return;

      const { ctrlKey, shiftKey, key } = event;

      if (ctrlKey && !shiftKey) {
        switch (key) {
          case 'n':
            event.preventDefault();
            handleNewFile();
            break;
          case 't':
            event.preventDefault();
            createNewTab();
            break;
          case 'w':
            event.preventDefault();
            handleCloseTab(activeTabId);
            break;
          case 'o':
            event.preventDefault();
            handleOpenFile();
            break;
          case 'r':
            event.preventDefault();
            // Open most recent file if available
            if (recentFiles.length > 0) {
              handleOpenRecentFile(recentFiles[0]);
            }
            break;
          case 's':
            event.preventDefault();
            handleSaveFile();
            break;
          case 'b':
            event.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case 'i':
            event.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case 'z':
            event.preventDefault();
            editor.chain().focus().undo().run();
            break;
          case 'y':
            event.preventDefault();
            editor.chain().focus().redo().run();
            break;
          case 'f':
            event.preventDefault();
            setShowFindReplace(true);
            break;
          case 'h':
            event.preventDefault();
            setShowFindReplace(true);
            break;
          case 'l':
            event.preventDefault();
            const url = window.prompt('Enter link URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
            break;
          case '0':
            event.preventDefault();
            editor.chain().focus().setParagraph().run();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
            event.preventDefault();
            const level = parseInt(key) as 1 | 2 | 3 | 4 | 5 | 6;
            editor.chain().focus().toggleHeading({ level }).run();
            break;
          case 'Tab':
            event.preventDefault();
            // Cycle to next tab (wraps to first after last)
            const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTabId(tabs[nextIndex].id);
            break;
        }
      } else if (ctrlKey && shiftKey) {
        switch (key) {
          case 'S':
            event.preventDefault();
            handleSaveAsFile();
            break;
          case 'C':
            event.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
            break;
          case '*':
            event.preventDefault();
            editor.chain().focus().toggleBulletList().run();
            break;
          case '&':
            event.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
            break;
          case 'Tab':
            event.preventDefault();
            // Switch to previous tab
            const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
            const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            setActiveTabId(tabs[prevIndex].id);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, handleNewFile, handleOpenFile, handleSaveFile, handleSaveAsFile, handleOpenRecentFile, recentFiles, createNewTab, handleCloseTab, activeTabId, tabs]);

  // ========== Window Close Handler ==========
  // Prevent accidental data loss when closing the application
  useEffect(() => {
    const handleWindowClose = async (event: any) => {
      // Check if any tab has unsaved changes
      const hasUnsavedChanges = tabs.some(tab => tab.isModified);
      if (hasUnsavedChanges) {
        event.preventDefault();
        const proceed = await checkUnsavedChanges();
        if (proceed) {
          await appWindow.close();
        }
      }
    };

    const unlisten = appWindow.onCloseRequested(handleWindowClose);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [tabs, checkUnsavedChanges]);

  if (!editor) {
    return <div>Loading...</div>;
  }

  // Handle click-to-focus behavior for better UX
  const handleEditorContainerClick = (event: React.MouseEvent) => {
    // Focus the editor and position cursor at end when clicking in empty space
    if (editor) {
      const target = event.target as HTMLElement;
      const isEditorContainer = target.classList.contains('editor-container') ||
                               target.classList.contains('editor') ||
                               target.classList.contains('ProseMirror');

      if (isEditorContainer) {
        editor.commands.focus('end');
      }
    }
  };

  return (
    <div className="app">
      <Toolbar
        editor={editor}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onSaveAsFile={handleSaveAsFile}
        onFindReplace={() => setShowFindReplace(true)}
        onOpenRecentFile={handleOpenRecentFile}
        currentFile={activeTab.filePath}
        isModified={activeTab.isModified}
        recentFiles={recentFiles}
      />
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabClose={handleCloseTab}
        onNewTab={createNewTab}
      />
      <div className="editor-container" onClick={handleEditorContainerClick}>
        <EditorContent editor={editor} className="editor" />
      </div>
      {showFindReplace && (
        <FindReplaceDialog
          editor={editor}
          onClose={() => setShowFindReplace(false)}
        />
      )}
    </div>
  );
}

export default App;