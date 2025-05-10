# PowerShell script to set up PostgreSQL for the project

# Check if PostgreSQL is installed
function Test-PostgreSQL {
    try {
        $result = Get-Command psql -ErrorAction SilentlyContinue
        return ($null -ne $result)
    } catch {
        return $false
    }
}

# Check if PostgreSQL service is running
function Test-PostgreSQLService {
    try {
        $service = Get-Service postgresql* -ErrorAction SilentlyContinue
        return ($null -ne $service -and $service.Status -eq 'Running')
    } catch {
        return $false
    }
}

# Create the database
function Create-Database {
    Write-Host "Creating database 'chers_closet'..." -ForegroundColor Yellow
    
    # Create a temporary SQL file
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    "CREATE DATABASE chers_closet;" | Out-File -FilePath $tempFile -Encoding ascii
    
    try {
        # Run the SQL command
        & psql -U postgres -f $tempFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database 'chers_closet' created successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Failed to create database. Error code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "Error executing psql: $_" -ForegroundColor Red
        return $false
    } finally {
        # Clean up the temporary file
        if (Test-Path $tempFile) {
            Remove-Item $tempFile
        }
    }
}

# Main execution
Write-Host "PostgreSQL Setup Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Check if PostgreSQL is installed
if (-not (Test-PostgreSQL)) {
    Write-Host "PostgreSQL is not installed or 'psql' is not in your PATH." -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL is installed." -ForegroundColor Green

# Check if PostgreSQL service is running
if (-not (Test-PostgreSQLService)) {
    Write-Host "PostgreSQL service is not running." -ForegroundColor Red
    Write-Host "Please start the PostgreSQL service:" -ForegroundColor Yellow
    Write-Host "1. Open Services (services.msc)" -ForegroundColor Yellow
    Write-Host "2. Find 'postgresql-x64-XX' service" -ForegroundColor Yellow
    Write-Host "3. Right-click and select 'Start'" -ForegroundColor Yellow
    exit 1
}

Write-Host "PostgreSQL service is running." -ForegroundColor Green

# Try to create the database
$success = Create-Database

if ($success) {
    Write-Host "`nSetup completed successfully!" -ForegroundColor Green
    Write-Host "You can now run 'npm run dev' to start the application." -ForegroundColor Cyan
} else {
    Write-Host "`nSetup failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}