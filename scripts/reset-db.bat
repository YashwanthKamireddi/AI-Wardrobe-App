@echo off
echo WARNING: This script will DELETE all existing tables and recreate them!
echo This will result in ALL DATA BEING LOST.
echo.
echo Are you sure you want to continue? (Y/N)
set /p confirm=
if /I NOT "%confirm%"=="Y" (
    echo Operation cancelled.
    exit /b
)

echo Setting up database tables for Cher's Closet...

rem Replace these with your actual PostgreSQL credentials
set PGUSER=postgres
set PGPASSWORD=your_password_here
set PGDATABASE=chers_closet_db
set PGHOST=localhost
set PGPORT=5432

echo Using PostgreSQL credentials:
echo - Host: %PGHOST%
echo - Port: %PGPORT%
echo - Database: %PGDATABASE%
echo - User: %PGUSER%

echo.
echo Creating database if it doesn't exist...
echo CREATE DATABASE %PGDATABASE%; | psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d postgres

echo.
echo Recreating all tables...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f scripts/create-tables.sql

echo.
echo Database reset complete!
echo.