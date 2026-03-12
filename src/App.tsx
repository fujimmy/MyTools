// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // 引入路由组件
import Sidebar from './components/Sidebar';
import Dashboard from './components/Content'; // 我们可以把原来的 Content 改名为 Dashboard
import Base64Tool from './components/tools/base64.tsx';
import JsonFormatter from './components/tools/JsonFormatter';
import HtmlPreviewer from './components/tools/HtmlPreviewer';
import MarkdownPreviewer from './components/tools/MarkdownPreviewer';
import QRCodePreviewer from './components/tools/QRious';
import HistoryPage from './components/History';

import './App.css'; // 引入樣式文件

const App: React.FC = () => {
  // 使用 useState<boolean> 明確指出狀態的型別是布林值
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // 定義切換函數的型別
  const toggleSidebar = (): void => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app-container">

        <div className={`main-wrapper ${isCollapsed ? 'collapsed' : ''}`}>

          {/* 傳遞切換函數給 Sidebar */}
          <Sidebar
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
          />

          <main className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tools/base64" element={<Base64Tool />} />
              <Route path="/tools/json-formatter" element={<JsonFormatter />} />
              <Route path="/tools/html-previewer" element={<HtmlPreviewer />} />
              <Route path="/tools/MarkdownPreviewer" element={<MarkdownPreviewer />} />
              <Route path="/tools/QRious" element={<QRCodePreviewer />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;