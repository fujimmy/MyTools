// src/App.tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import './App.css'; // 引入樣式文件

const App: React.FC = () => {
  // 使用 useState<boolean> 明確指出狀態的型別是布林值
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // 定義切換函數的型別
  const toggleSidebar = (): void => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="app-container">      

      <div className={`main-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        
        {/* 傳遞切換函數給 Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="content-area">
          <Content />
        </main>
      </div>
    </div>
  );
};

export default App;