// src/components/Content.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface ToolCard {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  category: string;
}

const toolCards: ToolCard[] = [
  // 編碼轉換
  {
    id: 'base64',
    name: 'Base64',
    icon: '🔑',
    path: '/tools/base64',
    description: '文本與 Base64 互相轉換',
    category: '編碼轉換'
  },
  {
    id: 'qrcode',
    name: 'QRCode',
    icon: '📱',
    path: '/tools/QRious',
    description: '生成與解析二維碼',
    category: '編碼轉換'
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    icon: '🔐',
    path: '/tools/jwt-decoder',
    description: '解析 JWT Header/Payload 與時間欄位',
    category: '編碼轉換'
  },
  // 數據格式化
  {
    id: 'json',
    name: 'JSON Formatter',
    icon: '📄',
    path: '/tools/json-formatter',
    description: 'JSON 格式化與壓縮',
    category: '數據格式化'
  },
  // 內容預覽
  {
    id: 'html',
    name: 'HTML Previewer',
    icon: '🖥️',
    path: '/tools/html-previewer',
    description: '即時預覽 HTML 代碼',
    category: '內容預覽'
  },
  {
    id: 'markdown',
    name: 'Markdown Previewer',
    icon: '📜',
    path: '/tools/MarkdownPreviewer',
    description: 'Markdown 即時預覽',
    category: '內容預覽'
  }
];

const categories = ['編碼轉換', '數據格式化', '內容預覽'];

const Content: React.FC = () => {
  return (
    <div className="content-inner">
      <div className="tools-container">
        {categories.map(category => (
          <div key={category} className="category-section">
            <h2 className="category-title">{category}</h2>
            <div className="tools-grid">
              {toolCards
                .filter(tool => tool.category === category)
                .map(tool => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="tool-card"
                    data-testid={`tool-card-${tool.id}`}
                  >
                    <div className="tool-icon">{tool.icon}</div>
                    <div className="tool-name">{tool.name}</div>
                    <div className="tool-description">{tool.description}</div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;