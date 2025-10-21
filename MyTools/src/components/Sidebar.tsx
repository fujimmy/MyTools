// src/components/Sidebar.tsx
import React from 'react';
import { FiMenu } from 'react-icons/fi';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void; // 新增：用於側邊欄內的切換按鈕
}

// 導航菜單的資料結構（可以使用實際的 Icon 組件，這裡我們用 emoji 代替）
interface NavItem {
  id: number;
  icon: string;
  text: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: 1, icon: '🏠', text: '主控台', path: '/' },
  { id: 2, icon: '🤖', text: '我的工具', path: '/tools' },
  { id: 3, icon: '💾', text: '存檔歷史', path: '/history' },
  { id: 4, icon: '⚙️', text: '設置', path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    // 使用內聯樣式調整，確保側邊欄是粘性的 (Sticky)
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      
      {/* 1. 側邊欄頂部的切換按鈕 (類似 Gemini 的設計) */}
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          {/* 無論收合或展開，都只顯示 FiMenu 圖標 */}
          <FiMenu size={20} />
        </button>
      </div>

      {/* 2. 導航列表 */}
      <ul className="nav-list">
        {navItems.map(item => (
          <li key={item.id} className="nav-item">
            <div className="nav-link-content">
              <span className="icon">{item.icon}</span>
              {/* 文字部分被包裹，等待 CSS 處理隱藏 */}
              <span className="text">{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
      
      {/* 3. 底部區域 (例如用戶/版本信息) */}
      <div className="sidebar-footer">
        {!isCollapsed && <span>版本 1.0.0</span>}
      </div>
      
    </nav>
  );
};

export default Sidebar;