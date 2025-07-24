Write-Host "Starting Cher's Closet for Windows..." -ForegroundColor Green
Write-Host ""

# Set environment variables for PowerShell
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:HOST = "127.0.0.1"
$env:SESSION_SECRET = "chers-closet-secret-key"

Write-Host "Environment configured:" -ForegroundColor Yellow
Write-Host "  HOST: $env:HOST"
Write-Host "  PORT: $env:PORT"
Write-Host "  NODE_ENV: $env:NODE_ENV"
Write-Host ""

Write-Host "Starting server..." -ForegroundColor Green
npm run dev