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

### 1.Base64 編解碼工具 (`/tools/base64`)

| 功能 | 描述 |
| :--- | :--- |
| **雙向轉換** | 單一按鈕實現明文 ↔ Base64 文本的互轉。 |
| **字符集支持**| 提供 **UTF-8**（推薦，支援中文）和 **ASCII** 兩種編碼選項。 |
| **錯誤處理** | 針對無效的 Base64 格式提供錯誤提示。 |

### 2.JSON 格式化 / 校驗器 (/tools/json-formatter)

|功能	|描述|
| :--- | :--- |
|**格式化 (Format)**|	將壓縮的 JSON 美化為帶縮進和換行的格式。|
|**壓縮 (Minify)**|	將格式化的 JSON 轉為最小化的單行文本。|
|**語法校驗**|	針對無效的 JSON 語法提供錯誤訊息。|

### 3.HTML 預覽器 (/tools/html-previewer)
|功能	|描述|
| :--- | :--- |
|即時預覽|	使用 `<iframe>` 將 HTML/CSS 代碼安全地隔離並渲染。|
|格式化 HTML|	透過 js-beautify 庫，一鍵美化輸入的 HTML 代碼。|
|分屏佈局|	輸入區和預覽區並排顯示，方便對照。|

### 4. Markdown 實時預覽器 (/tools/markdown-previewer)
|功能	|描述|
| :--- | :--- |
|即時轉換|即時將 Markdown 文本轉換為 HTML 並顯示渲染結果，支援 標題、粗體、斜體 和列表等基本語法。|
|專業解析|採用業界標準的解析邏輯（marked 函式庫），確保複雜的 巢狀結構 能夠正確渲染。|
|複製 HTML|	一鍵複製渲染後的純 HTML 內容。|

## 💻 本地測試部署版本 (使用 BAT 啟動)

為了在不使用 IIS 的情況下測試打包後的靜態網站，我們使用輕量級的 `serve` 伺服器，並透過 `.bat` 批次檔簡化啟動流程。

### A. 前置作業：安裝 `serve`

請全局安裝 `serve`：

```bash
npm install -g serve
```

### B. 批次檔 (start_server.bat) 說明
在專案根目錄下有一個 start_server.bat 檔案，用於一鍵啟動測試網站。

功能： 執行 npm run build 後，雙擊此檔案，即可在 http://localhost:3000 啟動服務。

注意： 關閉此視窗會停止網站服務。

start_server.bat 內容摘要：

```bat
@echo off
chcp 950
REM ... 檢查 serve 
CD dist
serve -s -l 3000
```

### C. 更新流程
每當您修改了 src/ 中的程式碼，要更新測試網站時，請遵循以下步驟：
關閉正在運行的 start_server.bat 視窗。
在終端機中執行：npm run build。
重新雙擊 start_server.bat 啟動服務。
