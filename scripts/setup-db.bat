@echo off
echo Setting up database tables for Cher's Closet...

rem Replace these with your actual PostgreSQL credentials
set PGUSER=postgres
set PGPASSWORD=postgres
set PGDATABASE=chers_closet_db
set PGHOST=localhost
set PGPORT=3000

echo Using PostgreSQL credentials:
echo - Host: %PGHOST%
echo - Port: %PGPORT%
echo - Database: %PGDATABASE%
echo - User: %PGUSER%

echo.
echo Creating database if it doesn't exist...
echo CREATE DATABASE %PGDATABASE%; | psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d postgres

echo.
echo Creating tables...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f scripts/create-tables.sql

echo.
echo Database setup complete!
echo.