@echo off
cd /d "%~dp0"
echo ============================================
echo   CodeStat - 正在启动开发服务器...
echo   浏览器将自动打开 http://localhost:3000
echo   （关闭本窗口即可停止服务器）
echo ============================================
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"
npm run dev
