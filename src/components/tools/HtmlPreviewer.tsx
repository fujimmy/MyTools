// src/components/tools/HtmlPreviewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import Editor, { type BeforeMount } from '@monaco-editor/react';
import { html as html_beautify } from 'js-beautify';
import { saveHistoryItem } from '../../utils/historyStore';

const beautifyOptions = {
  indent_size: 2,
  space_in_empty_paren: true,
  preserve_newlines: true,
  max_preserve_newlines: 1,
  end_with_newline: true
};

const formatHtmlContent = (content: string): string => {
  if (content.trim() === '') {
    return content;
  }

  return html_beautify(content, beautifyOptions);
};

const htmlEditorThemeName = 'mytools-html-theme';

const setupHtmlEditorTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(htmlEditorThemeName, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'tag', foreground: '005CC5', fontStyle: 'bold' },
      { token: 'tag.name', foreground: '005CC5', fontStyle: 'bold' },
      { token: 'tag.html', foreground: '005CC5', fontStyle: 'bold' },
      { token: 'attribute.name', foreground: 'B26A00' },
      { token: 'attribute.name.html', foreground: 'B26A00' },
      { token: 'attribute.value', foreground: '0A7F6F' },
      { token: 'attribute.value.html', foreground: '0A7F6F' },
      { token: 'string', foreground: '0A7F6F' },
      { token: 'delimiter.html', foreground: '6B7280' }
    ],
    colors: {
      'editorLineNumber.foreground': '#9ca3af',
      'editorLineNumber.activeForeground': '#4b5563',
      'editorIndentGuide.background1': '#e5e7eb',
      'editorIndentGuide.activeBackground1': '#9ca3af',
      'editorGutter.background': '#ffffff'
    }
  });
};

const HtmlPreviewer: React.FC = () => {
  // 狀態：管理 HTML/CSS 輸入文本
  const [htmlInput, setHtmlInput] = useState<string>(
    '<h1>Hello, MyTools!</h1>\n<p style="color: blue;">在這裡輸入你的 HTML 和 CSS 代碼。</p>'
  );
  const [saveStatus, setSaveStatus] = useState<'none' | 'saved'>('none');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [enableBeautify, setEnableBeautify] = useState<boolean>(false);
  // Ref：用於指向 iframe 元素
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildPreviewHtml = (content: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HTML 預覽</title>
          <style>
            body { margin: 10px; font-family: sans-serif; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
  };

  const handleSaveCurrent = () => {
    setErrorMessage('');

    if (htmlInput.trim() === '') {
      setErrorMessage('尚無可儲存資料，請先輸入 HTML。');
      return;
    }

    saveHistoryItem({
      tool: 'html-previewer',
      action: 'preview',
      input: htmlInput,
      output: buildPreviewHtml(htmlInput),
    });

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('none'), 2000);
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
        const fullHtml = buildPreviewHtml(htmlInput);

        // 寫入內容到 iframe
        iframeDoc.open();
        iframeDoc.write(fullHtml);
        iframeDoc.close();
      }
    }
  }, [htmlInput]); // 依賴於輸入內容，當它改變時重新渲染 iframe

  return (
    <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <h2>HTML 預覽器</h2>
      <p style={{ marginBottom: '15px' }}>在左側輸入 HTML/CSS 代碼，右側即時查看渲染結果。</p>      

      {errorMessage && (
        <p style={{ color: '#d32f2f', border: '1px solid #d32f2f', padding: '8px', borderRadius: '5px' }}>
          {errorMessage}
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
        <button
          onClick={handleSaveCurrent}
          style={{
            padding: '8px 15px',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          儲存此次轉換
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enableBeautify}
            onChange={(e) => {
              const shouldBeautify = e.target.checked;
              setEnableBeautify(shouldBeautify);
              setSaveStatus('none');
              setErrorMessage('');

              if (shouldBeautify && htmlInput.trim() !== '') {
                try {
                  setHtmlInput(formatHtmlContent(htmlInput));
                } catch (error) {
                  console.error('HTML 格式化失敗:', error);
                  setErrorMessage('HTML 格式化失敗，請檢查代碼是否有嚴重錯誤。');
                  setEnableBeautify(false);
                }
              }
            }}
          />
          格式化 HTML
        </label>
        {saveStatus === 'saved' && <span style={{ color: '#2e7d32' }}>✅ 已儲存</span>}
      </div>

      <div style={{ display: 'flex', gap: '20px', height: '600px', width: '100%', minWidth: 0, overflow: 'hidden' }}>
        
        {/* 1. 輸入區域 (佔 50% 寬度) */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px' }}>HTML/CSS 代碼輸入區:</label>
          <div
            style={{
              flex: 1,
              width: '100%',
              minWidth: 0,
              border: '1px solid #ccc',
              borderRadius: '5px',
              overflow: 'hidden'
            }}
          >
            <Editor
              height="100%"
              language="html"
              value={htmlInput}
              beforeMount={setupHtmlEditorTheme}
              theme={htmlEditorThemeName}
              onChange={(value) => {
                setHtmlInput(value ?? '');
                setErrorMessage('');
                setSaveStatus('none');
              }}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                lineNumbersMinChars: 3,
                glyphMargin: false,
                folding: false,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                tabSize: 2,
                insertSpaces: true,
                fontFamily: 'Consolas, monospace',
                fontSize: 14,
                guides: {
                  indentation: true
                },
                padding: {
                  top: 10,
                  bottom: 10
                }
              }}
            />
          </div>
        </div>

        {/* 2. 預覽區域 (佔 50% 寬度) */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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