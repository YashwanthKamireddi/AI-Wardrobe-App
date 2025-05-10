@echo off
echo Setting up environment variables for database push...

rem Set the environment variables needed for drizzle-kit
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGPASSWORD=postgres
set PGDATABASE=chers_closet_db
set DATABASE_URL=postgres://postgres:postgres@localhost:5432/chers_closet_db

echo Environment variables set!
echo.
echo IMPORTANT: Please make sure PostgreSQL is running and the password is correct before continuing.
echo.
pause

echo Running drizzle-kit push to create database tables...
echo.

npx drizzle-kit push:pg

echo.
echo Database schema push complete!
echo.