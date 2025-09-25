import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';

// Props for FindReplaceDialog component
interface FindReplaceDialogProps {
  editor: Editor;       // TipTap editor instance
  onClose: () => void;  // Close dialog handler
}

/**
 * FindReplaceDialog Component
 * Provides find and replace functionality for the editor
 * Features:
 * - Find text with case sensitivity option
 * - Replace single or all occurrences
 * - Match counter display
 * - Keyboard shortcuts (Enter for find, Shift+Enter for replace, Esc to close)
 */
const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({ editor, onClose }) => {
  // Dialog state management
  const [findText, setFindText] = useState('');         // Search query
  const [replaceText, setReplaceText] = useState('');   // Replacement text
  const [caseSensitive, setCaseSensitive] = useState(false);  // Case sensitivity toggle
  const [, setCurrentMatch] = useState(0);              // Current match position (for future enhancement)
  const [totalMatches, setTotalMatches] = useState(0);  // Total matches found

  // Escape special regex characters to treat them as literals
  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Find next occurrence and update match counter
  const findNext = () => {
    if (!findText) return;

    const content = editor.getHTML();
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(escapeRegex(findText), flags);
    const matches = content.match(regex);

    if (matches) {
      setTotalMatches(matches.length);
      // TODO: Implement proper highlighting and navigation between matches
      // Current implementation only shows match count
    } else {
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  };

  // Replace the next occurrence of the search text
  const replaceNext = () => {
    if (!findText) return;

    const content = editor.getHTML();
    const flags = caseSensitive ? '' : 'i';
    const regex = new RegExp(escapeRegex(findText), flags);
    const newContent = content.replace(regex, replaceText);

    if (newContent !== content) {
      editor.commands.setContent(newContent);
      findNext(); // Update match count after replacement
    }
  };

  // Replace all occurrences of the search text
  const replaceAll = () => {
    if (!findText) return;

    const content = editor.getHTML();
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(escapeRegex(findText), flags);
    const newContent = content.replace(regex, replaceText);

    if (newContent !== content) {
      editor.commands.setContent(newContent);
      setTotalMatches(0);  // Reset counters after replacing all
      setCurrentMatch(0);
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();  // Close dialog on Escape key
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          replaceNext();  // Shift+Enter to replace
        } else {
          findNext();     // Enter to find next
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-search when find text or case sensitivity changes
  useEffect(() => {
    findNext();
  }, [findText, caseSensitive]);

  return (
    <div className="find-replace-dialog">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Find & Replace</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      {/* Find input field */}
      <input
        type="text"
        placeholder="Find..."
        value={findText}
        onChange={(e) => setFindText(e.target.value)}
        autoFocus
      />

      {/* Replace input field */}
      <input
        type="text"
        placeholder="Replace with..."
        value={replaceText}
        onChange={(e) => setReplaceText(e.target.value)}
      />

      {/* Case sensitivity option */}
      <div style={{ margin: '8px 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            style={{ marginRight: '6px' }}
          />
          Case sensitive
        </label>
      </div>

      {/* Match counter display */}
      {totalMatches > 0 && (
        <div style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
          {totalMatches} match{totalMatches !== 1 ? 'es' : ''} found
        </div>
      )}

      {/* Action buttons */}
      <div className="buttons">
        <button onClick={findNext}>Find Next</button>
        <button onClick={replaceNext}>Replace</button>
        <button onClick={replaceAll}>Replace All</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default FindReplaceDialog;