import React, { useState } from 'react';

// 定義縮進空格的數量
const INDENT_SPACES = 2;

// 定義複製狀態
type CopyStatus = 'none' | 'copied';
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

const JsonFormatter: React.FC = () => {
    // 狀態：管理 JSON 輸入/輸出文本
    const [jsonInput, setJsonInput] = useState<string>('');
    // 狀態：管理錯誤訊息
    const [error, setError] = useState<string>('');
    // 狀態：管理複製提示
    const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');
    // 狀態：管理解析後的 JSON（用於樹狀結構）
    const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
    // 狀態：管理樹節點展開/收合
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    // 狀態：管理樹狀搜尋關鍵字
    const [searchKeyword, setSearchKeyword] = useState<string>('');

    const normalizedSearchKeyword = searchKeyword.trim().toLowerCase();

    const isExpandableValue = (value: JsonValue): value is JsonObject | JsonArray => {
        return typeof value === 'object' && value !== null;
    };

    const buildNodePath = (parentPath: string, childKey: string): string => {
        return `${parentPath}/${encodeURIComponent(childKey)}`;
    };

    const getPrimitiveDisplay = (value: JsonPrimitive): string => {
        if (value === null) {
            return 'null';
        }

        if (typeof value === 'string') {
            return `"${value}"`;
        }

        return String(value);
    };

    const nodeMatchesSearch = (key: string | null, value: JsonValue, searchTerm: string): boolean => {
        if (!searchTerm) {
            return true;
        }

        const keyMatched = key !== null && key.toLowerCase().includes(searchTerm);

        if (Array.isArray(value)) {
            return (
                keyMatched ||
                value.some((childValue, index) =>
                    nodeMatchesSearch(String(index), childValue, searchTerm)
                )
            );
        }

        if (isExpandableValue(value)) {
            return (
                keyMatched ||
                Object.entries(value).some(([childKey, childValue]) =>
                    nodeMatchesSearch(childKey, childValue, searchTerm)
                )
            );
        }

        const primitiveText = value === null ? 'null' : String(value);
        return keyMatched || primitiveText.toLowerCase().includes(searchTerm);
    };

    const getNodeExpandedState = (path: string, level: number): boolean => {
        if (normalizedSearchKeyword) {
            return true;
        }

        if (path in expandedNodes) {
            return expandedNodes[path];
        }

        return level <= 1;
    };

    const toggleNode = (path: string, level: number) => {
        setExpandedNodes((previous) => {
            const currentExpanded = path in previous ? previous[path] : level <= 1;
            return {
                ...previous,
                [path]: !currentExpanded,
            };
        });
    };

    const isTextMatched = (text: string): boolean => {
        if (!normalizedSearchKeyword) {
            return false;
        }
        return text.toLowerCase().includes(normalizedSearchKeyword);
    };

    const renderJsonNode = (
        key: string | null,
        value: JsonValue,
        path: string,
        level: number
    ): React.ReactNode => {
        if (normalizedSearchKeyword && !nodeMatchesSearch(key, value, normalizedSearchKeyword)) {
            return null;
        }

        const indent = level * 16;

        if (!isExpandableValue(value)) {
            const displayValue = getPrimitiveDisplay(value);
            const keyLabel = key ?? 'root';
            const keyMatched = isTextMatched(keyLabel);
            const valueMatched = isTextMatched(displayValue);

            return (
                <div
                    key={path}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        paddingLeft: `${indent}px`,
                        lineHeight: 1.8,
                    }}
                >
                    {key !== null && (
                        <>
                            <span
                                style={{
                                    color: '#333',
                                    fontWeight: 600,
                                    backgroundColor: keyMatched ? '#fff3bf' : 'transparent',
                                    borderRadius: '3px',
                                    padding: keyMatched ? '0 4px' : '0',
                                }}
                            >
                                {key}
                            </span>
                            <span style={{ color: '#888' }}>:</span>
                        </>
                    )}
                    <span
                        style={{
                            color: typeof value === 'string' ? '#b40000' : value === null ? '#8a2be2' : '#1f6feb',
                            backgroundColor: valueMatched ? '#fff3bf' : 'transparent',
                            borderRadius: '3px',
                            padding: valueMatched ? '0 4px' : '0',
                        }}
                    >
                        {displayValue}
                    </span>
                </div>
            );
        }

        const isArray = Array.isArray(value);
        const nodeSummary = isArray
            ? `Array(${value.length})`
            : `Object(${Object.keys(value).length})`;
        const keyLabel = key ?? 'root';
        const keyMatched = isTextMatched(keyLabel);
        const isExpanded = getNodeExpandedState(path, level);

        const childEntries: Array<[string, JsonValue]> = isArray
            ? value.map((childValue, index) => [String(index), childValue])
            : Object.entries(value);

        const visibleChildren = normalizedSearchKeyword
            ? childEntries.filter(([childKey, childValue]) =>
                nodeMatchesSearch(childKey, childValue, normalizedSearchKeyword)
            )
            : childEntries;

        return (
            <div key={path}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        paddingLeft: `${indent}px`,
                        lineHeight: 1.8,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => toggleNode(path, level)}
                        style={{
                            width: '22px',
                            height: '22px',
                            border: '1px solid #d0d7de',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            color: '#333',
                            cursor: 'pointer',
                            lineHeight: 1,
                            padding: 0,
                        }}
                        aria-label={isExpanded ? '收合節點' : '展開節點'}
                    >
                        {isExpanded ? '▾' : '▸'}
                    </button>

                    {key !== null && (
                        <>
                            <span
                                style={{
                                    color: '#333',
                                    fontWeight: 600,
                                    backgroundColor: keyMatched ? '#fff3bf' : 'transparent',
                                    borderRadius: '3px',
                                    padding: keyMatched ? '0 4px' : '0',
                                }}
                            >
                                {key}
                            </span>
                            <span style={{ color: '#888' }}>:</span>
                        </>
                    )}

                    <span style={{ color: '#666', fontSize: '13px' }}>{nodeSummary}</span>
                </div>

                {isExpanded && (
                    <div>
                        {visibleChildren.length === 0 ? (
                            <div
                                style={{
                                    paddingLeft: `${indent + 28}px`,
                                    color: '#999',
                                    fontStyle: 'italic',
                                    lineHeight: 1.8,
                                }}
                            >
                                (空)
                            </div>
                        ) : (
                            visibleChildren.map(([childKey, childValue]) =>
                                renderJsonNode(
                                    childKey,
                                    childValue,
                                    buildNodePath(path, childKey),
                                    level + 1
                                )
                            )
                        )}
                    </div>
                )}
            </div>
        );
    };

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
        } catch {
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
            const parsedObject = JSON.parse(jsonInput) as JsonValue;
            const formattedJson = JSON.stringify(parsedObject, null, INDENT_SPACES);
            setJsonInput(formattedJson);
            setParsedJson(parsedObject);
            setExpandedNodes({});
            setSearchKeyword('');
        } catch (e) {
            setParsedJson(null);
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
            const parsedObject = JSON.parse(jsonInput) as JsonValue;
            const minifiedJson = JSON.stringify(parsedObject);
            setJsonInput(minifiedJson);
            setParsedJson(parsedObject);
            setExpandedNodes({});
            setSearchKeyword('');
        } catch (e) {
            setParsedJson(null);
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
        setParsedJson(null);
        setExpandedNodes({});
        setSearchKeyword('');
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
                        setParsedJson(null);
                        setExpandedNodes({});
                        setSearchKeyword('');
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

            {/* 樹狀瀏覽區塊（格式化後顯示） */}
            {parsedJson !== null && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>JSON 樹狀瀏覽</h3>

                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder="搜尋 key 或 value..."
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            marginBottom: '10px',
                            border: '1px solid #d0d7de',
                            borderRadius: '5px',
                            fontSize: '14px',
                        }}
                    />

                    <div
                        style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            padding: '10px',
                            backgroundColor: '#fafafa',
                            maxHeight: '420px',
                            overflowY: 'auto',
                        }}
                    >
                        {normalizedSearchKeyword && !nodeMatchesSearch(null, parsedJson, normalizedSearchKeyword) ? (
                            <div style={{ color: '#888', padding: '8px' }}>
                                找不到符合搜尋條件的節點。
                            </div>
                        ) : (
                            renderJsonNode(null, parsedJson, 'root', 0)
                        )}
                    </div>
                </div>
            )}

            <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
                * 點擊任一按鈕即可同時進行 JSON 語法校驗。
            </p>
        </div>
    );
};

export default JsonFormatter;
