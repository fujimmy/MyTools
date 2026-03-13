// src/components/Sidebar.tsx
import React, { useState } from 'react'; // 引入 useState
import { FiMenu } from 'react-icons/fi';
// 引入箭頭圖標用於子菜單收合
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FiAlertCircle } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

// 1. 更新介面：NavItem 可以包含一個子項目陣列
interface NavItem {
  id: number;
  icon: string;
  text: string;
  path?: string; // 主項目可能沒有 path
  children?: NavItem[]; // 可選的子項目陣列
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

// 2. 更新導航數據：為 '我的工具' 添加子項目
const navItems: NavItem[] = [
  { id: 1, icon: '🏠', text: '主控台', path: '/' },
  {
    id: 2,
    icon: '🤖',
    text: '我的工具',
    // 注意：主項目通常沒有 path，或者 path 指向一個摘要頁面
    children: [
      { id: 21, icon: '🔑', text: 'Base64', path: '/tools/base64' },
      { id: 22, icon: '📄', text: 'JSON Formatter', path: '/tools/json-formatter' },
      { id: 23, icon: '🖥️', text: 'HTML Previewer', path: '/tools/html-previewer' },
      { id: 24, icon: '📜', text: 'Markdown Previewer', path: '/tools/MarkdownPreviewer' },
      { id: 25, icon: '📜', text: 'QRCode Previewer', path: '/tools/QRious' }
    ]
  },
  { id: 3, icon: '💾', text: '存檔歷史', path: '/history' },
  { id: 4, icon: '⚙️', text: '設置', path: '/settings' },
];

// 3. (新增) 子組件：處理單個導航項目的渲染和展開/收合邏輯
interface SidebarItemProps {
  item: NavItem;
  isSidebarCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isSidebarCollapsed }) => {
  // 狀態：追蹤當前項目是否展開
  const [isExpanded, setIsExpanded] = useState(false);

  // 檢查是否有子項目
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      // 阻止 NavLink 執行預設的跳轉行為
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else if (item.path) {
      // 否則，執行導航邏輯 (未來使用 React Router)
      console.log(`Navigating to: ${item.path}`);
    }
  };

  const navContent = (
    <>
      <span className="icon">{item.icon}</span>
      <span className="text">{item.text}</span>
      {hasChildren && !isSidebarCollapsed && (
        <span className="submenu-toggle">
          {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </span>
      )}
    </>
  );

  return (
    <li className="nav-item">
      {/* 判斷是否有 path。如果有 path，就使用 NavLink */}
      {item.path ? (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `nav-link-content ${isActive ? 'active' : ''}` // 新增 'active' 類別
          }
          onClick={handleClick}
          end={item.path === '/'} // 確保只有根路徑精確匹配時才被視為 active
        >
          {navContent}
        </NavLink>
      ) : (
        // 如果沒有 path (純粹的父級菜單)，使用 div
        <div className="nav-link-content" onClick={handleClick}>
          {navContent}
        </div>
      )}

      {/* 子菜單渲染 */}
      {hasChildren && isExpanded && (
        <ul className="sub-menu">
          {item.children!.map(child => (
            <li key={child.id} className="nav-item sub-item">
              {/*
          錯誤：這裡使用了普通的 div 元素
          <div className="nav-link-content sub-link">
          
          修正：使用 NavLink 才能實現路由跳轉！
        */}
              <NavLink
                to={child.path!} // 確保子項目有 path
                className={({ isActive }) =>
                  `nav-link-content sub-link ${isActive ? 'active' : ''}` // 啟用選中高亮
                }
              >
                <span className="icon">{child.icon}</span>
                <span className="text">{child.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};


// 4. Sidebar 主組件：使用新的 SidebarItem
const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/* 1. 側邊欄頂部的切換按鈕 */}
      <div className="sidebar-header">
        <button className="toggle-button" onClick={toggleSidebar}>
          <FiMenu size={20} />
        </button>
      </div>

      {/* 2. 導航列表：使用 SidebarItem 渲染每個項目 */}
      <ul className="nav-list">
        {navItems.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isSidebarCollapsed={isCollapsed}
          />
        ))}
      </ul>

      {/* 3. 底部區域 */}
      <div className="sidebar-footer">
        {!isCollapsed && <span>版本 {__APP_VERSION__}</span>}
        <a
          href="https://github.com/fujimmy/MyTools/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="issue-button"
          title="回報問題"
          data-testid="issue-report-button"
        >
          <FiAlertCircle size={20} />
          {!isCollapsed && <span>回報 Issue</span>}
        </a>
      </div>

    </nav>
  );
};

export default Sidebar;