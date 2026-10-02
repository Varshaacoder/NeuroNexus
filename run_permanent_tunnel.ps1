# Stop any existing instances
Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*serve_app.py*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

# Ensure clean log
Remove-Item "tunnel_live.log" -Force -ErrorAction SilentlyContinue
Remove-Item "LATEST_LIVE_URL.txt" -Force -ErrorAction SilentlyContinue

# 1. Start Python SPA server as detached OS process
$pyProc = Start-Process -FilePath "python.exe" -ArgumentList "serve_app.py" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2

# 2. Start Cloudflare Tunnel as detached OS process
$cfProc = Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel --url http://127.0.0.1:5173" -WindowStyle Hidden -RedirectStandardError "tunnel_live.log" -PassThru

# 3. Wait for URL to appear in log
$url = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path "tunnel_live.log") {
        $content = Get-Content "tunnel_live.log" -Raw -ErrorAction SilentlyContinue
        if ($content -match "https://[a-zA-Z0-9\-]+\.trycloudflare\.com") {
            $url = $matches[0]
            Set-Content -Path "LATEST_LIVE_URL.txt" -Value $url
            Write-Output "PERMANENT_URL: $url"
            break
        }
    }
}

if (-not $url) {
    Write-Output "URL not detected within 30s. Checking log:"
    Get-Content "tunnel_live.log" -Tail 20
}
