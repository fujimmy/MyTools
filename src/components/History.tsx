import React, { useEffect, useState } from 'react';
import {
  deleteHistoryItem,
  getHistoryItems,
  subscribeHistoryUpdated,
  type ConversionHistoryItem,
  type ToolType,
} from '../utils/historyStore';

const TOOL_NAME_MAP: Record<ToolType, string> = {
  'base64': 'Base64 編解碼',
  'json-formatter': 'JSON Formatter',
  'html-previewer': 'HTML Previewer',
  'markdown-previewer': 'Markdown Previewer',
  'qrious': 'QRCode Previewer',
};

const formatTime = (isoTime: string): string => {
  try {
    return new Date(isoTime).toLocaleString('zh-TW', { hour12: false });
  } catch {
    return isoTime;
  }
};

const renderMetadata = (item: ConversionHistoryItem): React.ReactNode => {
  if (!item.metadata || Object.keys(item.metadata).length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '10px', color: '#666', fontSize: '0.9em' }}>
      {Object.entries(item.metadata).map(([key, value]) => (
        <span key={key} style={{ marginRight: '12px' }}>
          {key}: {String(value)}
        </span>
      ))}
    </div>
  );
};

const History: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<ConversionHistoryItem[]>([]);

  useEffect(() => {
    const loadHistoryItems = () => {
      setHistoryItems(getHistoryItems());
    };

    loadHistoryItems();
    const unsubscribe = subscribeHistoryUpdated(loadHistoryItems);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>存檔歷史</h2>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        顯示各工具手動儲存的 raw data 轉換紀錄。
      </p>

      {historyItems.length === 0 ? (
        <div
          style={{
            border: '1px dashed #c8c8c8',
            borderRadius: '8px',
            padding: '20px',
            color: '#666',
            backgroundColor: '#fafafa',
          }}
        >
          目前沒有任何存檔紀錄。請先到任一工具按下「儲存此次轉換」。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                padding: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong>
                    {TOOL_NAME_MAP[item.tool]} / {item.action}
                  </strong>
                  <span style={{ color: '#888', fontSize: '0.85em' }}>{formatTime(item.createdAt)}</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#f44336',
                    border: 'none',
                    color: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  刪除
                </button>
              </div>

              {renderMetadata(item)}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Input (Raw)</div>
                  <pre
                    style={{
                      margin: 0,
                      maxHeight: '180px',
                      overflow: 'auto',
                      backgroundColor: '#f6f8fa',
                      border: '1px solid #e1e4e8',
                      borderRadius: '6px',
                      padding: '8px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.input}
                  </pre>
                </div>

                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Output (Raw)</div>
                  <pre
                    style={{
                      margin: 0,
                      maxHeight: '180px',
                      overflow: 'auto',
                      backgroundColor: '#f6f8fa',
                      border: '1px solid #e1e4e8',
                      borderRadius: '6px',
                      padding: '8px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.output}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
