import React, { useState } from 'react';

// 定義縮進空格的數量
const INDENT_SPACES = 2;

// 定義複製狀態
type CopyStatus = 'none' | 'copied';

const JsonFormatter: React.FC = () => {
    // 狀態：管理 JSON 輸入/輸出文本
    const [jsonInput, setJsonInput] = useState<string>('');
    // 狀態：管理錯誤訊息
    const [error, setError] = useState<string>('');
    // 狀態：管理複製提示
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');

    // 設置懸浮複製按鈕的樣式
    const copyButtonStyle: React.CSSProperties = {
        // === 關鍵 CSS 定位 (絕對定位) ===
        position: 'absolute',
        top: '10px',        // 相對於父容器頂部
        right: '10px',      // 相對於父容器右側
        zIndex: 10,         // 確保按鈕在 textarea 上方
        // === 樣式美化 ===
        padding: '6px 12px',
        backgroundColor: '#28a745', // 使用綠色表示成功或操作
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
        top: '15px',
        right: '90px', // 定位在按鈕的左邊
        zIndex: 10,
        color: '#28a745',
        backgroundColor: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 0 5px rgba(0,0,0,0.1)'
    };


    /**
     * 處理複製操作。
     */
    const handleCopy = async () => {
        if (jsonInput.trim() === '') {
            setError('複製失敗：輸入內容為空。');
            return;
        }

        try {
            await navigator.clipboard.writeText(jsonInput);
            setCopyStatus('copied');
            // 成功複製後，2 秒後清除提示
            setTimeout(() => setCopyStatus('none'), 2000);
        } catch (err) {
            setError('複製失敗：瀏覽器不支援或未授予權限。');
        }
    };


    /**
     * 嘗試將 JSON 字符串格式化（美化）。
     */
    const handleFormat = () => {
        setError('');
        setCopyStatus('none');

        if (jsonInput.trim() === '') {
            return;
        }

        try {
            const parsedObject = JSON.parse(jsonInput);
            const formattedJson = JSON.stringify(parsedObject, null, INDENT_SPACES);
            setJsonInput(formattedJson);
        } catch (e) {
            if (e instanceof Error) {
                setError(`JSON 語法錯誤：${e.message}`);
            } else {
                setError('JSON 語法錯誤：請檢查您的輸入。');
            }
        }
    };

    /**
     * 嘗試將 JSON 字符串壓縮（最小化）。
     */
    const handleMinify = () => {
        setError('');
        setCopyStatus('none');

        if (jsonInput.trim() === '') {
            return;
        }

        try {
            const parsedObject = JSON.parse(jsonInput);
            const minifiedJson = JSON.stringify(parsedObject);
            setJsonInput(minifiedJson);
        } catch (e) {
            if (e instanceof Error) {
                setError(`JSON 語法錯誤：${e.message}`);
            } else {
                setError('JSON 語法錯誤：請檢查您的輸入。');
            }
        }
    };

    /**
     * 清空所有輸入和錯誤。
     */
    const handleClear = () => {
        setJsonInput('');
        setError('');
        setCopyStatus('none');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>JSON 格式化 / 校驗器</h2>

            {/* 錯誤訊息顯示 */}
            {error && (
                <div style={{
                    color: '#D8000C',
                    backgroundColor: '#FFD2D2',
                    border: '1px solid #D8000C',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px'
                }}>
                    <strong>錯誤：</strong> {error}
                </div>
            )}

            {/* 輸入/輸出區域 - 關鍵：設置 position: relative */}
            <div style={{ position: 'relative' }}>

                {/* 複製按鈕 - 懸浮在右上角 */}
                <button
                    onClick={handleCopy}
                    style={copyButtonStyle}
                    // 懸停效果
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                >
                    複製結果
                </button>

                {/* 複製狀態提示 */}
                {copyStatus === 'copied' && (
                    <span style={copyStatusStyle}>✅ 已複製！</span>
                )}

                <textarea
                    rows={20}
                    value={jsonInput}
                    onChange={(e) => {
                        setJsonInput(e.target.value);
                        setError('');
                        setCopyStatus('none'); // 清除複製提示
                    }}
                    placeholder="請在這裡貼上 JSON 數據進行格式化或校驗..."
                    style={{
                        width: '100%',
                        padding: '10px',
                        paddingRight: '120px', // 為懸浮按鈕和提示預留空間
                        boxSizing: 'border-box',
                        fontFamily: 'Consolas, monospace',
                        fontSize: '14px',
                        marginBottom: '10px'
                    }}
                />
            </div>

            {/* 操作按鈕 */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleFormat}
                    style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                    格式化 (Format)
                </button>

                <button
                    onClick={handleMinify}
                    style={{ padding: '10px 15px', backgroundColor: '#008CBA', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                    壓縮 (Minify)
                </button>

                <button
                    onClick={handleClear}
                    style={{ padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                    清空 (Clear)
                </button>
            </div>

            <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
                * 點擊任一按鈕即可同時進行 JSON 語法校驗。
            </p>
        </div>
    );
};

export default JsonFormatter;
