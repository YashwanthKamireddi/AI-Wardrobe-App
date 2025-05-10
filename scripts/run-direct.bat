@echo off
echo Setting up environment for Cher's Closet...

rem Set environment variables directly
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGPASSWORD=Yello12345
set PGDATABASE=chers_closet_db
set DATABASE_URL=postgres://postgres:Yello12345@localhost:5432/chers_closet_db
set SESSION_SECRET=super_secret_session_key_change_this_in_production

echo Environment variables set:
echo - Host: %PGHOST%
echo - Port: %PGPORT%
echo - Database: %PGDATABASE%
echo - User: %PGUSER%

echo.
echo Starting the application...
npm run dev