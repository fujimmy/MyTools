// src/components/Content.tsx
import React from 'react';

// 定義 Content 組件的型別為 React Functional Component
const Content: React.FC = () => {
  return (
    <div className="content-inner">
      <h1>歡迎來到您的工作工具網站</h1>
      <p>
        這裡將是您所有工作工具功能和界面的展示區域。
      </p>
      
      <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px', backgroundColor: '#fff' }}>
        <h3>預計的內容區塊</h3>
        <p>當您整合 **React Router** 後，這個區塊的內容將會根據您在側邊欄點擊的連結而動態切換。</p>
        <ul>
          <li>**目標：** 在這裡實作您的第一個工具功能，例如待辦清單 (To-do List) 或資料輸入表單。</li>
          <li>**狀態：** 點擊頂部按鈕，檢查左側側邊欄是否能平滑地收合與展開。</li>
        </ul>
      </div>
    </div>
  );
};

export default Content;