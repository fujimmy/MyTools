import React, { useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { saveHistoryItem } from '../../utils/historyStore';

type JwtObject = Record<string, unknown>;

interface DecodedJwt {
  normalizedToken: string;
  header: JwtObject;
  payload: JwtObject;
  signature: string;
}

interface LastJwtConversion {
  input: string;
  output: string;
  metadata: Record<string, string | number | boolean | null>;
}

type CopyStatus = 'none' | 'header' | 'payload' | 'signature';

const decodeBase64UrlSegment = (segment: string): string => {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingLength);

  const decodedBinary = atob(padded);
  const bytes = Uint8Array.from(decodedBinary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const parseJwtToken = (rawToken: string): DecodedJwt => {
  const trimmedInput = rawToken.trim();
  const token = trimmedInput.toLowerCase().startsWith('bearer ')
    ? trimmedInput.slice(7).trim()
    : trimmedInput;

  if (!token) {
    throw new Error('請先輸入 JWT Token。');
  }

  const parts = token.split('.');
  if (parts.length < 2 || parts.length > 3) {
    throw new Error('JWT 格式錯誤：應為 header.payload 或 header.payload.signature。');
  }

  const [headerPart, payloadPart, signaturePart = ''] = parts;

  if (!headerPart || !payloadPart) {
    throw new Error('JWT 格式錯誤：header 或 payload 內容為空。');
  }

  try {
    const header = JSON.parse(decodeBase64UrlSegment(headerPart)) as JwtObject;
    const payload = JSON.parse(decodeBase64UrlSegment(payloadPart)) as JwtObject;

    return {
      normalizedToken: token,
      header,
      payload,
      signature: signaturePart,
    };
  } catch {
    throw new Error('JWT 解碼失敗：請確認 token 為有效的 Base64URL JSON。');
  }
};

const getNumericClaim = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const formatUnixTimestamp = (unixSeconds: number): string => {
  try {
    return new Date(unixSeconds * 1000).toLocaleString('zh-TW', { hour12: false });
  } catch {
    return '無法解析時間';
  }
};

const buildHistoryOutput = (decoded: DecodedJwt): string => {
  return JSON.stringify(
    {
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature,
    },
    null,
    2
  );
};

const JwtDecoder: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'none' | 'saved'>('none');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('none');
  const [lastConversion, setLastConversion] = useState<LastJwtConversion | null>(null);

  const handleDecode = () => {
    setErrorMessage('');
    setSaveStatus('none');
    setCopyStatus('none');

    try {
      const decoded = parseJwtToken(tokenInput);
      const algorithm = typeof decoded.header['alg'] === 'string' ? decoded.header['alg'] : null;
      const tokenType = typeof decoded.header['typ'] === 'string' ? decoded.header['typ'] : null;
      const expUnix = getNumericClaim(decoded.payload['exp']);

      const metadata: Record<string, string | number | boolean | null> = {
        alg: algorithm,
        typ: tokenType,
        hasSignature: decoded.signature !== '',
      };

      if (expUnix !== null) {
        metadata.exp = expUnix;
        metadata.expAt = formatUnixTimestamp(expUnix);
        metadata.isExpired = Date.now() >= expUnix * 1000;
      }

      setDecodedJwt(decoded);
      setLastConversion({
        input: decoded.normalizedToken,
        output: buildHistoryOutput(decoded),
        metadata,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JWT 解碼失敗。';
      setDecodedJwt(null);
      setLastConversion(null);
      setErrorMessage(message);
    }
  };

  const handleCopy = async (
    text: string,
    target: Exclude<CopyStatus, 'none'>,
    emptyMessage = '尚無可複製內容，請先解碼 JWT。'
  ) => {
    setErrorMessage('');

    if (text.trim() === '') {
      setErrorMessage(emptyMessage);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(target);
      setTimeout(() => setCopyStatus('none'), 1800);
    } catch {
      setErrorMessage('複製失敗：瀏覽器不支援或未授予權限。');
    }
  };

  const handleSaveCurrent = () => {
    setErrorMessage('');

    if (!lastConversion) {
      setErrorMessage('尚無可儲存資料，請先執行一次 JWT 解碼。');
      return;
    }

    saveHistoryItem({
      tool: 'jwt-decoder',
      action: 'decode',
      input: lastConversion.input,
      output: lastConversion.output,
      metadata: lastConversion.metadata,
    });

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('none'), 2000);
  };

  const payload = decodedJwt?.payload ?? null;
  const exp = payload ? getNumericClaim(payload['exp']) : null;
  const iat = payload ? getNumericClaim(payload['iat']) : null;
  const nbf = payload ? getNumericClaim(payload['nbf']) : null;

  const expirationStatus = (() => {
    if (exp === null) {
      return '無 exp 欄位';
    }

    const remainingMs = exp * 1000 - Date.now();
    if (remainingMs <= 0) {
      return '已過期';
    }

    const remainingMinutes = Math.floor(remainingMs / 1000 / 60);
    return `有效中（約剩 ${remainingMinutes} 分鐘）`;
  })();

  const headerText = decodedJwt ? JSON.stringify(decodedJwt.header, null, 2) : '';
  const payloadText = decodedJwt ? JSON.stringify(decodedJwt.payload, null, 2) : '';
  const signatureText = decodedJwt?.signature ?? '';

  const infoCardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    padding: '10px',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    marginBottom: '6px',
    display: 'block',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  };

  const copyButtonStyle: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid #cfd8dc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#37474f',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>JWT Decoder</h2>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        貼上 JWT（支援 Bearer 前綴），可解析 Header/Payload 與時間欄位。此工具僅解碼，不驗證簽章。
      </p>

      {errorMessage && (
        <p style={{ color: '#d32f2f', border: '1px solid #d32f2f', padding: '8px', borderRadius: '5px' }}>
          {errorMessage}
        </p>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
        <button
          onClick={handleDecode}
          style={{
            padding: '8px 15px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
          }}
        >
          解碼 JWT
        </button>

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

      <div style={{ display: 'flex', gap: '20px', minHeight: '560px' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="jwtInput" style={{ marginBottom: '6px', fontWeight: 700 }}>
            JWT Token 輸入區
          </label>
          <textarea
            id="jwtInput"
            rows={16}
            value={tokenInput}
            onChange={(event) => {
              setTokenInput(event.target.value);
              setErrorMessage('');
              setSaveStatus('none');
              setCopyStatus('none');
            }}
            placeholder="請貼上 JWT，例如：eyJhbGciOi..."
            style={{
              flex: 1,
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
              fontFamily: 'Consolas, monospace',
              fontSize: '14px',
              resize: 'none',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={infoCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Header</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {copyStatus === 'header' && <span style={{ color: '#2e7d32', fontSize: '12px' }}>✅ 已複製</span>}
                <button
                  onClick={() => handleCopy(headerText, 'header')}
                  style={copyButtonStyle}
                >
                  <FiCopy size={13} />
                  <span>複製</span>
                </button>
              </div>
            </div>
            <pre
              style={{
                margin: 0,
                maxHeight: '140px',
                overflow: 'auto',
                backgroundColor: '#f6f8fa',
                borderRadius: '6px',
                padding: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {decodedJwt ? headerText : '尚未解碼'}
            </pre>
          </div>

          <div style={infoCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Payload</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {copyStatus === 'payload' && <span style={{ color: '#2e7d32', fontSize: '12px' }}>✅ 已複製</span>}
                <button
                  onClick={() => handleCopy(payloadText, 'payload')}
                  style={copyButtonStyle}
                >
                  <FiCopy size={13} />
                  <span>複製</span>
                </button>
              </div>
            </div>
            <pre
              style={{
                margin: 0,
                maxHeight: '180px',
                overflow: 'auto',
                backgroundColor: '#f6f8fa',
                borderRadius: '6px',
                padding: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {decodedJwt ? payloadText : '尚未解碼'}
            </pre>
          </div>

          <div style={infoCardStyle}>
            <span style={labelStyle}>時間欄位解析</span>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
              <strong>exp</strong>
              <span>{exp !== null ? `${exp} (${formatUnixTimestamp(exp)})` : '—'}</span>
              <strong>iat</strong>
              <span>{iat !== null ? `${iat} (${formatUnixTimestamp(iat)})` : '—'}</span>
              <strong>nbf</strong>
              <span>{nbf !== null ? `${nbf} (${formatUnixTimestamp(nbf)})` : '—'}</span>
              <strong>狀態</strong>
              <span>{decodedJwt ? expirationStatus : '尚未解碼'}</span>
            </div>
          </div>

          <div style={infoCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ ...labelStyle, marginBottom: 0 }}>Signature</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {copyStatus === 'signature' && <span style={{ color: '#2e7d32', fontSize: '12px' }}>✅ 已複製</span>}
                <button
                  onClick={() =>
                    handleCopy(signatureText, 'signature', '此 JWT 沒有簽章段可複製。')
                  }
                  style={copyButtonStyle}
                >
                  <FiCopy size={13} />
                  <span>複製</span>
                </button>
              </div>
            </div>
            <pre
              style={{
                margin: 0,
                maxHeight: '80px',
                overflow: 'auto',
                backgroundColor: '#f6f8fa',
                borderRadius: '6px',
                padding: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {decodedJwt ? (decodedJwt.signature || '(無簽章段)') : '尚未解碼'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JwtDecoder;
