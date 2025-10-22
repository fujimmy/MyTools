// src/components/tools/Base64.tsx
import React, { useState } from 'react';

// === [ UTF-8 轉換輔助函數 ] ===
// 解決 btoa/atob 不支援原生 UTF-8 的問題
const utf8ToBase64 = (str: string): string => {
  // 1. 先將 UTF-8 字串轉為位元組 (Bytes)
  const utf8Bytes = new TextEncoder().encode(str);
  
  // 2. 將位元組轉為 Latin-1 字串 (btoa 可接受的格式)
  const latin1String = String.fromCharCode.apply(null, Array.from(utf8Bytes));
  
  // 3. 執行 Base64 編碼
  return btoa(latin1String);
};

const base64ToUtf8 = (str: string): string => {
  // 1. 執行 Base64 解碼 (得到 Latin-1 字串)
  const latin1String = atob(str);
  
  // 2. 將 Latin-1 字串轉為位元組陣列
  const utf8Bytes = Uint8Array.from(latin1String, c => c.charCodeAt(0));
  
  // 3. 將位元組轉回 UTF-8 字串
  return new TextDecoder().decode(utf8Bytes);
};
// ===============================


const Base64Tool: React.FC = () => {
  const [plainText, setPlainText] = useState<string>('');
  const [base64Text, setBase64Text] = useState<string>('');
  const [error, setError] = useState<string>('');
  // 新增狀態：管理用戶選擇的編碼方式，預設為 UTF-8
  const [encoding, setEncoding] = useState<'utf-8' | 'ascii'>('utf-8'); 

  // 核心邏輯：雙向轉換函數
  const handleConvert = () => {
    setError('');

    // 決定使用哪個編碼/解碼器
    let encoder: (str: string) => string;
    let decoder: (str: string) => string;

    if (encoding === 'utf-8') {
      encoder = utf8ToBase64;
      decoder = base64ToUtf8;
    } else {
      // 選擇 ASCII 時，我們使用原生的 btoa/atob (它更接近 ASCII/Latin-1)
      encoder = btoa;
      decoder = atob;
    }

    // 情況 A: 明文框有內容 -> 執行編碼
    if (plainText.trim() !== '') {
      try {
        const encoded = encoder(plainText);
        setBase64Text(encoded);
      } catch (e) {
        setError('編碼失敗：請檢查輸入或切換編碼方式。');
      }
    } 
    // 情況 B: Base64 框有內容 -> 執行解碼
    else if (base64Text.trim() !== '') {
      try {
        // 簡單檢查 Base64 格式
        if (!/^[A-Za-z0-9+/=]*$/.test(base64Text)) {
            throw new Error('無效的 Base64 字符串');
        }
        
        const decoded = decoder(base64Text);
        setPlainText(decoded);
      } catch (e) {
        setError('解碼失敗：請檢查 Base64 格式是否正確，或切換編碼方式。');
      }
    } 
    else {
      setError('請在任一輸入框中輸入內容。');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Base64 編碼/解碼工具</h2>
      
      {/* 錯誤訊息顯示 (保持不變) */}
      {error && (
        <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
          {error}
        </p>
      )}

      {/* === [ 新增：編碼方式選擇下拉菜單 ] === */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="encodingSelect" style={{ marginRight: '10px', fontWeight: 'bold' }}>選擇字符編碼:</label>
        <select
          id="encodingSelect"
          value={encoding}
          onChange={(e) => setEncoding(e.target.value as 'utf-8' | 'ascii')}
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="utf-8">UTF-8 (推薦, 支援中文)</option>
          <option value="ascii">ASCII (僅支援英文/符號)</option>
        </select>
      </div>
      {/* ======================================= */}

      {/* 1. 明文輸入框 */}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="plainText">明文 (Plain Text):</label>
        <textarea
          id="plainText"
          rows={5}
          value={plainText}
          onChange={(e) => { setPlainText(e.target.value); setBase64Text(''); setError(''); }}
          placeholder="在這裡輸入明文..."
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
        />
      </div>

      {/* 2. 轉換按鈕 */}
      <button 
        onClick={handleConvert}
        style={{ padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
      >
        轉換 Base64 ↔ 明文 (使用 {encoding.toUpperCase()})
      </button>

      {/* 3. Base64 輸出/輸入框 */}
      <div style={{ marginTop: '20px' }}>
        <label htmlFor="base64Text">Base64 文本:</label>
        <textarea
          id="base64Text"
          rows={5}
          value={base64Text}
          onChange={(e) => { setBase64Text(e.target.value); setPlainText(''); setError(''); }}
          placeholder="在這裡輸入 Base64 進行解碼..."
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
};

export default Base64Tool;