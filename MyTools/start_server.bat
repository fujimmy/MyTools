@echo off
ECHO --------------------------------------------
ECHO MyTools 靜態服務啟動器
ECHO --------------------------------------------

REM 檢查 serve 是否已全局安裝
where serve >nul 2>nul
if %errorlevel% neq 0 (
    ECHO 錯誤: 未找到 serve 命令。請先執行 npm install -g serve
    pause
    goto :eof
)

REM 導航到 dist 資料夾並啟動服務
CD dist

REM -s: 啟用 SPA 模式，將所有路由重定向到 index.html
REM -l 3000: 在 3000 埠啟動
ECHO 正在啟動服務... 請勿關閉此視窗！
ECHO 服務將在 http://localhost:3000 上運行。
serve -s -l 3000

REM 如果 serve 退出，則會執行到這裡
ECHO 服務已停止。
pause