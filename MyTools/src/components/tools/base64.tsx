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

type CopyStatus = 'none' | 'plain' | 'base64';

const Base64Tool: React.FC = () => {
    const [plainText, setPlainText] = useState<string>('');
    const [base64Text, setBase64Text] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [encoding, setEncoding] = useState<'utf-8' | 'ascii'>('utf-8');
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');

    // 定義複製按鈕的樣式
    const copyButtonStyle: React.CSSProperties = {
        // === 關鍵 CSS 定位 (絕對定位) ===
        position: 'absolute', 
        top: '35px',          // 相對於父容器（即包含 textarea 的 div）頂部
        right: '10px',        // 相對於父容器右側
        zIndex: 10,           // 確保按鈕在 textarea 上方
        // === 樣式美化 ===
        padding: '6px 12px',
        backgroundColor: '#007bff', // 藍色背景
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '12px',
        opacity: 0.85, 
        transition: 'opacity 0.2s',
        outline: 'none',
    };

    // 定義提示文本的樣式
    const copyStatusStyle: React.CSSProperties = {
        position: 'absolute',
        top: '35px',
        right: '120px', // 定位在按鈕的左邊
        zIndex: 10,
        color: '#1a73e8',
        backgroundColor: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)'
    };


    // 核心邏輯：雙向轉換函數
    const handleConvert = () => {
        setError('');
        setCopyStatus('none'); // 清除複製提示
        
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
            } catch (e) {
                setError('編碼失敗：請檢查輸入或切換編碼方式。');
            }
        }
        else if (base64Text.trim() !== '') {
            try {
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

    // 處理複製操作
    const handleCopy = async (text: string, type: CopyStatus) => {
        // 我們不使用 alert，而是使用 UI 提示
        if (text.trim() === '') {
            // 這裡可以選擇不操作，或使用一個短暫的 UI 提示
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus(type);
            // 成功複製後，2 秒後清除提示
            setTimeout(() => setCopyStatus('none'), 2000);
        } catch (err) {
            setError('複製失敗：瀏覽器不支援或未授予權限。');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Base64 編碼/解碼工具</h2>

            {/* 錯誤訊息顯示 */}
            {error && (
                <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
                    {error}
                </p>
            )}

            {/* 編碼方式選擇下拉菜單 */}
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

            {/* 1. 明文輸入框 - 修正：新增 position: relative */}
            <div style={{ marginBottom: '15px', position: 'relative' }}>
                <label htmlFor="plainText">明文 (Plain Text):</label>
                
                {/* 複製按鈕 - 懸浮在右上角 */}
                <button
                    onClick={() => handleCopy(plainText, 'plain')}
                    style={copyButtonStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                >
                    複製明文
                </button>
                
                {/* 複製狀態提示 */}
                {copyStatus === 'plain' && (
                    <span style={copyStatusStyle}>✅ 已複製！</span>
                )}
                
                <textarea
                    id="plainText"
                    rows={5}
                    value={plainText}
                    onChange={(e) => { setPlainText(e.target.value); setBase64Text(''); setError(''); setCopyStatus('none'); }}
                    placeholder="在這裡輸入明文..."
                    style={{ 
                            width: '100%', 
                            padding: '10px', 
                            paddingRight: '120px', // 為懸浮按鈕預留空間
                            boxSizing: 'border-box' 
                        }}
                />
            </div>

            {/* 2. 轉換按鈕 */}
            <button
                onClick={handleConvert}
                style={{ padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
            >
                轉換 Base64 ↔ 明文 (使用 {encoding.toUpperCase()})
            </button>

            {/* 3. Base64 輸出/輸入框 - 修正：新增 position: relative */}
            <div style={{ marginTop: '20px', position: 'relative' }}>
                <label htmlFor="base64Text">Base64 文本:</label>
                
                {/* 複製按鈕 - 懸浮在右上角 */}
                <button
                    onClick={() => handleCopy(base64Text, 'base64')}
                    style={copyButtonStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                >
                    複製 Base64
                </button>

                {/* 複製狀態提示 */}
                {copyStatus === 'base64' && (
                    <span style={copyStatusStyle}>✅ 已複製！</span>
                )}
                
                <textarea
                    id="base64Text"
                    rows={5}
                    value={base64Text}
                    onChange={(e) => { setBase64Text(e.target.value); setPlainText(''); setError(''); setCopyStatus('none'); }}
                    placeholder="在這裡輸入 Base64 進行解碼..."
                    style={{ 
                            width: '100%', 
                            padding: '10px', 
                            paddingRight: '120px', // 為懸浮按鈕預留空間
                            boxSizing: 'border-box' 
                        }}
                />
            </div>
        </div>
    );
};

export default Base64Tool;
