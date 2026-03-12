# MyTools - 開發者實用工具箱

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

這是一個以 React + TypeScript + Vite 建置的工具型 SPA，整合常用的開發與資料處理小工具。

---

## ✨ 專案特色

- 類似 Gemini 的簡潔介面與可收合側邊欄。
- `react-router-dom` 路由切換，工具頁面可獨立存取。
- 模組化元件設計，方便持續新增工具。
- 支援本地開發、正式打包與靜態站預覽。

---

## 📁 目錄結構（重要）

本倉庫是「雙層」目錄，真正的前端專案在 `MyTools/` 子資料夾：

```text
MyTools/
├─ README.md                # 本文件
└─ MyTools/
	├─ package.json          # npm 指令要在這層執行
	├─ src/
	├─ dist/
	└─ start_server.bat
```

---

## 🚀 快速啟動

### 前置條件

- Node.js 18+
- npm 9+

### 方式 A（推薦）

```bash
cd MyTools
npm install
npm run dev
```

### 方式 B（在倉庫根目錄直接執行）

```bash
npm --prefix MyTools install
npm --prefix MyTools run dev
```

開發站預設啟動於 <http://localhost:5173/>。

---

## 🧪 常用指令

請在 `MyTools/` 子資料夾執行：

```bash
npm run dev      # 啟動開發伺服器
npm run build    # TypeScript 檢查 + 生產打包
npm run preview  # 預覽打包結果
npm run lint     # ESLint 檢查
```

---

## 🛠️ 已實作工具

| 工具 | 路由 | 主要功能 |
| :--- | :--- | :--- |
| Base64 編解碼 | `/tools/base64` | UTF-8 / ASCII 轉換、雙向編解碼、錯誤提示 |
| JSON Formatter | `/tools/json-formatter` | Format / Minify、語法校驗、複製結果、樹狀瀏覽、節點收合、搜尋 key/value |
| HTML Previewer | `/tools/html-previewer` | 即時預覽、HTML 美化、左右分欄對照 |
| Markdown Previewer | `/tools/MarkdownPreviewer` | 即時渲染、`marked` 解析、複製輸出 HTML |
| QRCode Previewer | `/tools/QRious` | 即時產生 QR Code、上傳圖片解碼 |

---

## 💻 打包後本地預覽（BAT）

`MyTools/start_server.bat` 會使用 `serve` 啟動 `dist` 內容。

### 1) 安裝 `serve`

```bash
npm install -g serve
```

### 2) 打包

```bash
cd MyTools
npm run build
```

### 3) 啟動靜態站

雙擊 `MyTools/start_server.bat`，預設在 <http://localhost:3000/>。

---

## 🌐 GitHub Pages 部署

本專案已支援透過 GitHub Actions 自動部署到 GitHub Pages。

### 1) 確認已提交以下檔案

- `MyTools/vite.config.ts`（已設定 Pages 用 `base`）
- `MyTools/src/App.tsx`（已使用 `HashRouter`）
- `.github/workflows/pages.yml`（自動建置與部署）

### 2) 推送到 `main`

```bash
git add .
git commit -m "chore: setup github pages deployment"
git push origin main
```

### 3) 啟用 GitHub Pages

到 GitHub 專案頁面：

- `Settings` → `Pages`
- `Build and deployment` 的 `Source` 選擇 `GitHub Actions`

### 4) 查看部署結果

- 到 `Actions` 分頁確認 `Deploy MyTools to GitHub Pages` 成功
- 網址格式：`https://<github-username>.github.io/<repository-name>/`

---

## ❗常見問題

### `npm ERR! enoent Could not read package.json`

代表你目前終端機所在目錄沒有 `package.json`。

請切到 `MyTools/` 子資料夾再執行：

```bash
cd MyTools
npm run build
```

### `Get Pages site failed. Error: Not Found`（GitHub Actions）

如果在 `actions/configure-pages` 出現這個錯誤，請確認：

1. 進入 `Settings` → `Pages`
2. `Build and deployment` 的 `Source` 已選擇 `GitHub Actions`
3. 倉庫有權限啟用 Pages（若為 Organization，需管理員允許）

本專案 workflow 已設定：

- `.github/workflows/pages.yml` 使用 `actions/configure-pages@v5`
- 並加上 `enablement: true` 以支援首次自動啟用
