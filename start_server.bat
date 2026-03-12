@echo off
ECHO --------------------------------------------
ECHO MyTools Static File Server script
ECHO --------------------------------------------

REM 檢查 serve 是否已全局安裝
where serve >nul 2>nul
if %errorlevel% neq 0 (
    ECHO Error: The cmd serve not found.plese exec-> npm install -g serve
    pause
    goto :eof
)

REM 導航到 dist 資料夾並啟動服務
CD dist

REM -s: 啟用 SPA 模式，將所有路由重定向到 index.html
REM -l 3000: 在 3000 埠啟動
ECHO Starting static file server...
ECHO Run the service in http://localhost:3000 .
serve -s -l 3000

REM 如果 serve 退出，則會執行到這裡
ECHO Stop service.
pause