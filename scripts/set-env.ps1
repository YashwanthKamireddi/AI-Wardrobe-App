# PowerShell script to set environment variables for the Cher's Closet application
# This is helpful when .env file loading isn't working properly

# Database Configuration
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:3000/chers_closet"
$env:PGHOST = "localhost"
$env:PGPORT = "3000"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "postgres" 
$env:PGDATABASE = "chers_closet"

# Session Configuration
$env:SESSION_SECRET = "super_secret_session_key_change_this_in_production"

# Node Environment
$env:NODE_ENV = "development"

# Optional: OpenAI API Key (uncomment and replace with your key if using AI features)
# $env:OPENAI_API_KEY = "your_openai_api_key"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Database URL: $env:DATABASE_URL" -ForegroundColor Cyan
Write-Host "PostgreSQL Host: $env:PGHOST" -ForegroundColor Cyan
Write-Host "PostgreSQL Port: $env:PGPORT" -ForegroundColor Cyan
Write-Host "PostgreSQL User: $env:PGUSER" -ForegroundColor Cyan
Write-Host "PostgreSQL Database: $env:PGDATABASE" -ForegroundColor Cyan
Write-Host "Session Secret: [HIDDEN]" -ForegroundColor Cyan
Write-Host "Node Environment: $env:NODE_ENV" -ForegroundColor Cyan

Write-Host ""
Write-Host "Now you can run the application with: npm run dev" -ForegroundColor Yellow
Write-Host "NOTE: These variables are only set for the current PowerShell session" -ForegroundColor Yellow