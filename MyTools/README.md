# MyTools - 開發者實用工具箱

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

這個專案是一個基於 React、TypeScript 和 Vite 構建的現代單頁應用程式（SPA），專門用於整合各種日常開發和數據處理的實用工具。

---

## ✨ 專案特色

* **現代 UI 佈局：** 採用類似 Google Gemini 的簡潔設計，配備可收合的側邊欄（Icons-Only 模式）。
* **技術棧：** 使用 Vite 快速啟動和打包，基於 React 19 和 TypeScript 進行開發。
* **模塊化側邊欄：** 實現了巢狀（Collapsible）菜單結構，支援主項目展開和子項目導航。
* **路由管理：** 使用 `react-router-dom` 實現流暢的頁面切換和選中高亮（Active State）。

---

## 🚀 快速啟動

### 前置條件

請確保您的環境中已安裝 Node.js (v18+) 和 npm。

### 1. 安裝依賴項

在專案根目錄下（確認 `package.json` 存在於此目錄），執行安裝所有必要的套件：

```bash
npm install
```
### 2.啟動開發伺服器
執行以下指令啟動 Vite 開發伺服器。專案將會在 http://localhost:5173/ 啟動：
```bash
npm run dev
```
### 3.專案打包
如果您需要將專案打包部署到生產環境：
```bash
npm run build
```

## 🛠️ 已實現的工具清單

### 1. Base64 編解碼工具 (`/tools/base64`)

| 功能 | 描述 |
| :--- | :--- |
| **雙向轉換** | 單一按鈕實現明文 ↔ Base64 文本的互轉。 |
| **字符集支持**| 提供 **UTF-8**（推薦，支援中文）和 **ASCII** 兩種編碼選項。 |
| **錯誤處理** | 針對無效的 Base64 格式提供錯誤提示。 |