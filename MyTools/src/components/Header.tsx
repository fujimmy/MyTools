// src/components/Header.tsx
import React from 'react';

// 1. 定義 Props 介面
interface HeaderProps {
  toggleSidebar: () => void; // 接收一個無參數、無回傳值的函數
}

// 2. 將介面應用於函數組件
const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        {/* 點擊按鈕呼叫傳入的函數 */}
        <button className="toggle-button" onClick={toggleSidebar}>
          {/* 使用三元運算符來切換圖標，讓使用者知道側邊欄狀態 */}
          ▶
        </button>
        <span className="logo-text">工作工具網站</span>
      </div>
      <div className="header-right">
        <span>👤 User Profile</span>
      </div>
    </header>
  );
};

export default Header;