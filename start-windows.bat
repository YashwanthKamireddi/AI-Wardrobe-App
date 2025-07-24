@echo off
echo Starting Cher's Closet for Windows...
echo.
set NODE_ENV=development
set PORT=3000
set HOST=127.0.0.1
set SESSION_SECRET=chers-closet-secret-key
echo Environment configured:
echo   HOST=%HOST%
echo   PORT=%PORT%
echo   NODE_ENV=%NODE_ENV%
echo.
echo Starting server...
npm run dev