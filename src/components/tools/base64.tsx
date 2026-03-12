import React, { useState } from 'react';
import { saveHistoryItem } from '../../utils/historyStore';

const utf8ToBase64 = (str: string): string => {
  const utf8Bytes = new TextEncoder().encode(str);
  const latin1String = String.fromCharCode.apply(null, Array.from(utf8Bytes));
  return btoa(latin1String);
};

const base64ToUtf8 = (str: string): string => {
  const latin1String = atob(str);
  const utf8Bytes = Uint8Array.from(latin1String, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(utf8Bytes);
};

type CopyStatus = 'none' | 'plain' | 'base64';
type Base64ConversionAction = 'encode' | 'decode';

interface LastBase64Conversion {
  action: Base64ConversionAction;
  input: string;
  output: string;
  encoding: 'utf-8' | 'ascii';
}

const Base64Tool: React.FC = () => {
  const [plainText, setPlainText] = useState<string>('');
  const [base64Text, setBase64Text] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [encoding, setEncoding] = useState<'utf-8' | 'ascii'>('utf-8');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');
  const [saveStatus, setSaveStatus] = useState<'none' | 'saved'>('none');
  const [lastConversion, setLastConversion] = useState<LastBase64Conversion | null>(null);

  const copyButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '35px',
    right: '10px',
    zIndex: 10,
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    opacity: 0.85,
    transition: 'opacity 0.2s',
    outline: 'none',
  };

  const copyStatusStyle: React.CSSProperties = {
    position: 'absolute',
    top: '35px',
    right: '120px',
    zIndex: 10,
    color: '#1a73e8',
    backgroundColor: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  };

  const handleConvert = () => {
    setError('');
    setCopyStatus('none');
    setSaveStatus('none');

    let encoder: (str: string) => string;
    let decoder: (str: string) => string;

    if (encoding === 'utf-8') {
      encoder = utf8ToBase64;
      decoder = base64ToUtf8;
    } else {
      encoder = btoa;
      decoder = atob;
    }

    if (plainText.trim() !== '') {
      try {
        const encoded = encoder(plainText);
        setBase64Text(encoded);
        setLastConversion({
          action: 'encode',
          input: plainText,
          output: encoded,
          encoding,
        });
      } catch {
        setError('編碼失敗：請檢查輸入或切換編碼方式。');
        setLastConversion(null);
      }
      return;
    }

    if (base64Text.trim() !== '') {
      try {
        if (!/^[A-Za-z0-9+/=]*$/.test(base64Text)) {
          throw new Error('無效的 Base64 字符串');
        }

        const decoded = decoder(base64Text);
        setPlainText(decoded);
        setLastConversion({
          action: 'decode',
          input: base64Text,
          output: decoded,
          encoding,
        });
      } catch {
        setError('解碼失敗：請檢查 Base64 格式是否正確，或切換編碼方式。');
        setLastConversion(null);
      }
      return;
    }

    setError('請在任一輸入框中輸入內容。');
    setLastConversion(null);
  };

  const handleSaveCurrent = () => {
    setError('');

    if (!lastConversion) {
      setError('尚無可儲存的轉換結果，請先執行一次轉換。');
      return;
    }

    saveHistoryItem({
      tool: 'base64',
      action: lastConversion.action,
      input: lastConversion.input,
      output: lastConversion.output,
      metadata: {
        encoding: lastConversion.encoding,
      },
    });

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('none'), 2000);
  };

  const handleCopy = async (text: string, type: CopyStatus) => {
    if (text.trim() === '') {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus('none'), 2000);
    } catch {
      setError('複製失敗：瀏覽器不支援或未授予權限。');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Base64 編碼/解碼工具</h2>

      {error && (
        <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
          {error}
        </p>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="encodingSelect" style={{ marginRight: '10px', fontWeight: 'bold' }}>
          選擇字符編碼:
        </label>
        <select
          id="encodingSelect"
          value={encoding}
          onChange={(event) => {
            setEncoding(event.target.value as 'utf-8' | 'ascii');
            setSaveStatus('none');
          }}
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="utf-8">UTF-8 (推薦, 支援中文)</option>
          <option value="ascii">ASCII (僅支援英文/符號)</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px', position: 'relative' }}>
        <label htmlFor="plainText">明文 (Plain Text):</label>

        <button
          onClick={() => handleCopy(plainText, 'plain')}
          style={copyButtonStyle}
          onMouseEnter={(event) => (event.currentTarget.style.opacity = '1')}
          onMouseLeave={(event) => (event.currentTarget.style.opacity = '0.85')}
        >
          複製明文
        </button>

        {copyStatus === 'plain' && (
          <span style={copyStatusStyle}>✅ 已複製！</span>
        )}

        <textarea
          id="plainText"
          rows={5}
          value={plainText}
          onChange={(event) => {
            setPlainText(event.target.value);
            setBase64Text('');
            setError('');
            setCopyStatus('none');
            setSaveStatus('none');
            setLastConversion(null);
          }}
          placeholder="在這裡輸入明文..."
          style={{
            width: '100%',
            padding: '10px',
            paddingRight: '120px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={handleConvert}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          轉換 Base64 ↔ 明文 (使用 {encoding.toUpperCase()})
        </button>

        <button
          onClick={handleSaveCurrent}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2e7d32',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          儲存此次轉換
        </button>

        {saveStatus === 'saved' && <span style={{ color: '#2e7d32' }}>✅ 已儲存</span>}
      </div>

      <div style={{ marginTop: '20px', position: 'relative' }}>
        <label htmlFor="base64Text">Base64 文本:</label>

        <button
          onClick={() => handleCopy(base64Text, 'base64')}
          style={copyButtonStyle}
          onMouseEnter={(event) => (event.currentTarget.style.opacity = '1')}
          onMouseLeave={(event) => (event.currentTarget.style.opacity = '0.85')}
        >
          複製 Base64
        </button>

        {copyStatus === 'base64' && (
          <span style={copyStatusStyle}>✅ 已複製！</span>
        )}

        <textarea
          id="base64Text"
          rows={5}
          value={base64Text}
          onChange={(event) => {
            setBase64Text(event.target.value);
            setPlainText('');
            setError('');
            setCopyStatus('none');
            setSaveStatus('none');
            setLastConversion(null);
          }}
          placeholder="在這裡輸入 Base64 進行解碼..."
          style={{
            width: '100%',
            padding: '10px',
            paddingRight: '120px',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};

export default Base64Tool;
