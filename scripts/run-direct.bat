@echo off
echo Setting up environment variables for Cher's Closet...

rem Database connection
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGPASSWORD=postgres
set PGDATABASE=chers_closet_db
set DATABASE_URL=postgres://postgres:postgres@localhost:5432/chers_closet_db

rem Session configuration
set SESSION_SECRET=super_secret_session_key_change_this_in_production

echo Environment variables set!
echo.
echo Starting application...
echo.

npm run dev