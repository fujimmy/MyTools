import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { saveHistoryItem } from '../../utils/historyStore';

const MarkdownPreviewer: React.FC = () => {
    const [markdownInput, setMarkdownInput] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<'none' | 'saved'>('none');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const htmlOutput = useMemo(() => {
        const parsed = marked(markdownInput);
        return typeof parsed === 'string' ? parsed : '';
    }, [markdownInput]);

    const handleSaveCurrent = () => {
        setErrorMessage('');

        if (markdownInput.trim() === '') {
            setErrorMessage('尚無可儲存資料，請先輸入 Markdown。');
            return;
        }

        saveHistoryItem({
            tool: 'markdown-previewer',
            action: 'render',
            input: markdownInput,
            output: htmlOutput,
        });

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('none'), 2000);
    };
    
    const containerStyle: React.CSSProperties = {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '80vh',
        fontFamily: 'Inter, sans-serif'
    };

    const responsiveSplitStyle: React.CSSProperties = {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
    } as React.CSSProperties;

    const paneStyle: React.CSSProperties = {
        flex: 1,
        position: 'relative',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <div style={containerStyle}>
            <h1>Markdown 實時預覽器</h1>
            <p style={{ color: '#666', marginBottom: '15px' }}>
                在左側輸入 Markdown 文本。
            </p>

            {errorMessage && (
                <p style={{ color: '#d32f2f', border: '1px solid #d32f2f', padding: '8px', borderRadius: '5px', margin: 0 }}>
                    {errorMessage}
                </p>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                    onClick={handleSaveCurrent}
                    style={{
                        padding: '8px 15px',
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

            <div style={responsiveSplitStyle}>

                {/* === 1. Markdown 輸入區域 (左側) === */}
                <div style={paneStyle}>
                    <label htmlFor="markdownInput" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Markdown 輸入 (原始碼)</label>
                    <textarea
                        id="markdownInput"
                        rows={15}
                        value={markdownInput}
                        onChange={(e) => {
                            setMarkdownInput(e.target.value);
                            setSaveStatus('none');
                            setErrorMessage('');
                        }}
                        placeholder={"請輸入 Markdown 文本，例如：\n# 這是標題一\n\n這是一段 **粗體** 和 *斜體* 的文本。\n\n* 列表項目一\n* 列表項目二\n\n```javascript\n// 這是程式碼區塊\nconsole.log(\"Hello world\");\n```\n\n[Google 連結](https://www.google.com)"}
                        style={{
                            width: '100%',
                            padding: '10px',
                            boxSizing: 'border-box',
                            fontFamily: 'Consolas, monospace',
                            fontSize: '14px',
                            flexGrow: 1,
                            minHeight: '300px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    />
                </div>

                {/* === 2. HTML 預覽區域 (右側) === */}
                <div style={paneStyle}>
                    <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>HTML 預覽 (渲染結果)</label>

                    {/* 預覽區塊 - 使用 dangerouslySetInnerHTML */}
                    <div
                        style={{
                            border: '1px solid #ccc',
                            padding: '15px',
                            borderRadius: '5px',                          
                            flexGrow: 1,
                            minHeight: '300px',
                            overflowY: 'auto',
                            lineHeight: 1.6,                           
                            fontSize: '1em',
                        }}
                        dangerouslySetInnerHTML={{ __html: htmlOutput }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarkdownPreviewer;