import React, { useState, useRef, useEffect, useCallback } from 'react';
 import QRious from 'qrious';
 import jsQR from 'jsqr';
import { saveHistoryItem } from '../../utils/historyStore';

/**
 * QR Code 編碼/解碼工具組件
 */
const App: React.FC = () => {
    // 狀態管理
    const [inputValue, setInputValue] = useState('https://www.google.com/search?q=Vite+React+TS');
    const [decodeResult, setDecodeResult] = useState<{ text: string, error: string } | null>(null);
    const [encodeError, setEncodeError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'none' | 'saved-encode' | 'saved-decode'>('none');
    const [lastDecodeSource, setLastDecodeSource] = useState('');

    // Canvas 參考
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const tempCanvasRef = useRef<HTMLCanvasElement>(null); // 用於解碼處理的臨時 Canvas

    // ==============================================================
    // 1. 編碼功能 (Encode)
    // ==============================================================

    const generateQRCode = useCallback(() => {
        if (!qrCanvasRef.current) {
            setEncodeError("編碼失敗：Canvas 元素未準備好。");
            return;
        }

        if (!inputValue) {
            setEncodeError("請輸入要編碼的文字或網址。");
            return;
        }
        
        setEncodeError('');

        try {
            // 使用模擬的 QRious 類別生成 QR Code
            new QRious({
                element: qrCanvasRef.current,
                value: inputValue,
                size: 256,
                padding: 15,
                level: 'H' // 錯誤修正級別：高
            });
        } catch (err) {
            setEncodeError("生成 QR Code 發生錯誤。");
            console.error("QR Code Generation Error:", err);
        }
    }, [inputValue]);

    // 輸入值變化時，立即生成 QR Code
    useEffect(() => {
        generateQRCode();
    }, [inputValue, generateQRCode]);


    // ==============================================================
    // 2. 解碼功能 (Decode)
    // ==============================================================

    const decodeQRCode = useCallback((imageDataUrl: string) => {
        if (!tempCanvasRef.current) {
            setDecodeResult({ text: '', error: '解碼失敗：臨時 Canvas 未準備好。' });
            return;
        }

        const tempCanvas = tempCanvasRef.current;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // 確保 Canvas 與圖片尺寸一致
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;

            // 繪製圖片到臨時 Canvas
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // 獲取圖片的像素數據
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            
            // 使用模擬的 jsQR 進行解碼
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                setDecodeResult({ text: code.data, error: '' });
            } else {
                setDecodeResult({ text: '', error: '圖片中找不到 QR Code 或無法識別。' });
            }
        };
        img.onerror = () => {
            setDecodeResult({ text: '', error: '無法載入圖片檔案。' });
        };
        img.src = imageDataUrl;
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDecodeResult(null); 
        setSaveStatus('none');
        const file = event.target.files?.[0];
        if (!file) return;

        setLastDecodeSource(file.name);

        if (!file.type.startsWith('image/')) {
            setDecodeResult({ text: '', error: '請選擇有效的圖片檔案。' });
            return;
        }

        // 讀取檔案為 Data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
                decodeQRCode(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveEncode = () => {
        if (!inputValue.trim()) {
            setEncodeError('尚無可儲存的編碼資料。');
            return;
        }

        saveHistoryItem({
            tool: 'qrious',
            action: 'encode',
            input: inputValue,
            output: inputValue,
            metadata: {
                mode: 'encode',
            },
        });

        setSaveStatus('saved-encode');
        setTimeout(() => setSaveStatus('none'), 2000);
    };

    const handleSaveDecode = () => {
        if (!decodeResult) {
            return;
        }

        const outputText = decodeResult.error ? `錯誤: ${decodeResult.error}` : decodeResult.text;

        saveHistoryItem({
            tool: 'qrious',
            action: 'decode',
            input: lastDecodeSource || '(未記錄檔名)',
            output: outputText,
            metadata: {
                mode: 'decode',
                source: lastDecodeSource || 'unknown',
                success: !decodeResult.error,
            },
        });

        setSaveStatus('saved-decode');
        setTimeout(() => setSaveStatus('none'), 2000);
    };

    // ==============================================================
    // 3. UI 渲染
    // ==============================================================

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-inter">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
                二維碼 (QR Code) 編碼/解碼器
            </h1>
            <p className="text-gray-600 mb-8">
                即時生成 QR Code 並支援上傳圖片解碼。
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* ======================= 編碼區塊 (ENCODER) ======================= */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-indigo-500" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        1. 編碼 (Encode)
                    </h2>
                    
                    {/* 輸入框 */}
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none h-32 mb-4 font-mono text-sm"
                        placeholder="請輸入要編碼的文字、網址或資料..."
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setSaveStatus('none');
                        }}
                    />

                    <div className="mb-4 flex items-center gap-3">
                        <button
                            onClick={handleSaveEncode}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                            儲存此次轉換
                        </button>
                        {saveStatus === 'saved-encode' && (
                            <span className="text-sm text-green-700">✅ 編碼資料已儲存</span>
                        )}
                    </div>
                    
                    {encodeError && (
                        <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg">{encodeError}</p>
                    )}

                    {/* QR Code 顯示區 */}
                    <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg">
                        <div className="w-64 h-64 border-4 border-white shadow-2xl rounded-lg overflow-hidden">
                            <canvas ref={qrCanvasRef} width="256" height="256" className="block w-full h-full"></canvas>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-gray-500 text-sm">QR Code 已即時生成</p>
                </div>

                {/* ======================= 解碼區塊 (DECODER) ======================= */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-green-500" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        2. 解碼 (Decode)
                    </h2>

                    {/* 檔案上傳 */}
                    <label className="block mb-4">
                        <span className="sr-only">選擇檔案</span>
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-green-50 file:text-green-700
                                hover:file:bg-green-100 cursor-pointer transition duration-150"
                        />
                    </label>

                    {/* 解碼結果 */}
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg min-h-[150px]">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">解碼結果：</h3>
                        {decodeResult && decodeResult.error ? (
                            <p className="text-red-600 bg-red-100 p-3 rounded-lg border-l-4 border-red-500">
                                錯誤: {decodeResult.error}
                            </p>
                        ) : decodeResult && decodeResult.text ? (
                            <div className="break-all bg-green-100 p-3 rounded-lg border-l-4 border-green-500">
                                <p className="font-mono text-green-800">{decodeResult.text}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">請上傳包含 QR Code 的圖片來進行解碼。</p>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={handleSaveDecode}
                            disabled={!decodeResult}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            儲存此次轉換
                        </button>
                        {saveStatus === 'saved-decode' && (
                            <span className="text-sm text-green-700">✅ 解碼資料已儲存</span>
                        )}
                    </div>
                </div>
            </div>    

            {/* 解碼使用的隱藏臨時 Canvas */}
            <canvas
                ref={tempCanvasRef}
                width="1"
                height="1"
                style={{ display: 'none' }}
                aria-hidden="true"
            ></canvas>
        </div>
    );
};

export default App;
