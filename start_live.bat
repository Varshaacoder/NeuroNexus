@echo off
title CAMPUS-Q&A Multi-Tunnel Host
echo ========================================================
echo Starting CAMPUS-Q&A Ultra-Stable Server & Dual Tunnels
echo ========================================================
echo.

REM Kill any stale processes on port 5173
taskkill /F /IM cloudflared.exe 2>nul
taskkill /F /IM python.exe 2>nul

echo 1. Starting Python SPA Server on port 5173...
start /b python serve_app.py
timeout /t 2 /nobreak >nul

echo 2. Starting LocalTunnel (Fixed domain: https://campus-qa-apex.loca.lt)...
start /b npx --yes localtunnel --port 5173 --subdomain campus-qa-apex

echo 3. Starting Cloudflare Tunnel (Edge Network)...
.\cloudflared.exe tunnel --url http://127.0.0.1:5173
pause
