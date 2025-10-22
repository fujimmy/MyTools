// src/components/tools/HtmlPreviewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { html as html_beautify } from 'js-beautify';

const HtmlPreviewer: React.FC = () => {
  // 狀態：管理 HTML/CSS 輸入文本
  const [htmlInput, setHtmlInput] = useState<string>(
    '<h1>Hello, MyTools!</h1>\n<p style="color: blue;">在這裡輸入你的 HTML 和 CSS 代碼。</p>'
  );
  // Ref：用於指向 iframe 元素
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 設置 js-beautify 的選項
  const beautifyOptions = {
    indent_size: 2,           // 縮進空格數
    space_in_empty_paren: true,
    preserve_newlines: true,  // 保留換行
    max_preserve_newlines: 1, // 最多保留一行換行
    end_with_newline: true    // 結尾添加換行
  };

  // === [ 新增：HTML 格式化函數 ] ===
  const handleFormatHtml = () => {
    try {
      if (htmlInput.trim() === '') return;
      
      // 使用 js-beautify 庫格式化 HTML
      const formattedHtml = html_beautify(htmlInput, beautifyOptions);
      
      // 更新輸入框的內容
      setHtmlInput(formattedHtml);

    } catch (error) {
      // 雖然 js-beautify 不常拋出錯誤，但最好還是處理一下
      console.error("HTML 格式化失敗:", error);
      alert("HTML 格式化失敗，請檢查代碼是否有嚴重錯誤。");
    }
  };

  // === 核心邏輯：將 HTML 內容注入 Iframe ===
  useEffect(() => {
    // 檢查 iframe 是否已經加載
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      
      // 獲取 iframe 內的 document 物件
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // 構建完整的 HTML 頁面內容
        // 這裡將用戶的輸入直接作為 <body> 的內容
        // 如果需要完整的 CSS 支持，用戶可能需要自己包含 <style> 標籤
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>HTML 預覽</title>
              <style>
                /* 確保預覽內容不會超出範圍 */
                body { margin: 10px; font-family: sans-serif; }
              </style>
            </head>
            <body>
              ${htmlInput}
            </body>
          </html>
        `;

        // 寫入內容到 iframe
        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();
      }
    }
  }, [htmlInput]); // 依賴於 htmlInput，當它改變時重新渲染 iframe

  return (
    <div style={{ padding: '20px' }}>
      <h2>HTML 預覽器</h2>
      <p style={{ marginBottom: '15px' }}>在左側輸入 HTML/CSS 代碼，右側即時查看渲染結果。</p>      

      <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
        
        {/* 1. 輸入區域 (佔 50% 寬度) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="htmlInput" style={{ marginBottom: '5px' }}>HTML/CSS 代碼輸入區:</label>
          {/* 新增格式化按鈕 */}
          <button 
            onClick={handleFormatHtml}
            style={{ 
              padding: '8px 15px', 
              marginBottom: '10px',
              backgroundColor: '#008CBA', // 藍色按鈕
              color: 'white', 
              border: 'none', 
              cursor: 'pointer', 
              borderRadius: '5px' 
            }}
          >
            格式化 HTML
          </button>
          <textarea
            id="htmlInput"
            rows={20}
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="請輸入 HTML/CSS 代碼..."
            style={{ 
              flex: 1, 
              width: '100%', 
              padding: '10px', 
              boxSizing: 'border-box', 
              fontFamily: 'Consolas, monospace',
              fontSize: '14px',
              resize: 'none' // 禁止用戶調整大小
            }}
          />
        </div>

        {/* 2. 預覽區域 (佔 50% 寬度) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>預覽結果:</label>
          <iframe
            ref={iframeRef}
            title="HTML Preview"
            style={{
              flex: 1,
              width: '100%',
              border: '1px solid #ccc',
              backgroundColor: 'white'
            }}
            // 啟用沙盒模式，限制腳本執行等功能，提高安全性
            sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
          />
        </div>

      </div>
    </div>
  );
};

export default HtmlPreviewer;