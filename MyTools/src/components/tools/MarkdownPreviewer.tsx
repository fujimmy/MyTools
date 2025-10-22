import React, { useState, useMemo } from 'react';
import { marked } from 'marked';

// 定義複製狀態
type CopyStatus = 'none' | 'copied';

const MarkdownPreviewer: React.FC = () => {
    const [markdownInput, setMarkdownInput] = useState<string>('');
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');
    const htmlOutput = useMemo(() => marked(markdownInput), [markdownInput]);   
    
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

            <div style={responsiveSplitStyle}>

                {/* === 1. Markdown 輸入區域 (左側) === */}
                <div style={paneStyle}>
                    <label htmlFor="markdownInput" style={{ fontWeight: 'bold', marginBottom: '8px' }}>Markdown 輸入 (原始碼)</label>
                    <textarea
                        id="markdownInput"
                        rows={15}
                        value={markdownInput}
                        onChange={(e) => setMarkdownInput(e.target.value)}
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