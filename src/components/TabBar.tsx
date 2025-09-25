import React from 'react';
import { X, Plus } from 'lucide-react';

// Tab data structure matching App.tsx
interface Tab {
  id: string;
  title: string;
  filePath: string | null;
  content: string;
  isModified: boolean;
}

// Props for TabBar component
interface TabBarProps {
  tabs: Tab[];                           // All open tabs
  activeTabId: string;                   // Currently selected tab
  onTabSelect: (tabId: string) => void;  // Tab click handler
  onTabClose: (tabId: string) => void;   // Tab close handler
  onNewTab: () => void;                  // New tab creation handler
}

/**
 * TabBar Component
 * Displays and manages multiple document tabs
 * Features:
 * - Visual tab selection with active highlighting
 * - Modified indicator (*) for unsaved changes
 * - Close button per tab with hover effect
 * - New tab button with Ctrl+T shortcut hint
 */
const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 8px',
      minHeight: '40px',
      overflow: 'auto'
    }}>
      {/* Render each tab with appropriate styling */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: tab.id === activeTabId ? '#fff' : 'transparent',
            border: tab.id === activeTabId ? '1px solid #e0e0e0' : '1px solid transparent',
            borderBottom: tab.id === activeTabId ? '1px solid #fff' : '1px solid transparent',
            marginBottom: '-1px',
            borderRadius: '6px 6px 0 0',
            padding: '8px 12px',
            cursor: 'pointer',
            maxWidth: '200px',
            minWidth: '120px',
            position: 'relative'
          }}
          onClick={() => onTabSelect(tab.id)}
        >
          {/* Tab title with modified indicator */}
          <span
            style={{
              fontSize: '13px',
              color: tab.id === activeTabId ? '#333' : '#666',
              fontWeight: tab.id === activeTabId ? '500' : 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              marginRight: '8px'
            }}
          >
            {tab.title}{tab.isModified ? '*' : ''}
          </span>
          {/* Close button with click propagation prevention */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent tab selection when closing
              onTabClose(tab.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              border: 'none',
              background: 'transparent',
              borderRadius: '2px',
              cursor: 'pointer',
              color: '#999',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {/* New tab button */}
      <button
        onClick={onNewTab}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          border: 'none',
          background: 'transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          color: '#666',
          marginLeft: '8px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        title="New Tab (Ctrl+T)"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default TabBar;