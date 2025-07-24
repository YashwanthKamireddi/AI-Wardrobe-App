# Windows Setup Guide

This guide helps you run Cher's Closet on Windows systems.

## Quick Fix for the Current Error

The error you're seeing (`ENOTSUP: operation not supported on socket`) is a Windows networking issue. Here's how to fix it:

### Option 1: Set HOST environment variable (Recommended)

```cmd
# In your terminal, before running npm run dev:
set HOST=localhost
npm run dev
```

Or create a `.env` file in your project root with:

```env
NODE_ENV=development
PORT=3000
HOST=localhost
SESSION_SECRET=your-secret-key-here
```

### Option 2: Use localhost directly

```cmd
# Alternative approach - use a different port if needed
set PORT=3001
set HOST=127.0.0.1
npm run dev
```

## Complete Windows Setup

### 1. Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org)
- **Git** (optional): Download from [git-scm.com](https://git-scm.com)

### 2. Clone and Install

```cmd
# Clone the project (or extract ZIP)
cd C:\Users\%USERNAME%\Downloads\War\War

# Install dependencies
npm install

# Create .env file
echo NODE_ENV=development > .env
echo PORT=3000 >> .env
echo HOST=localhost >> .env
echo SESSION_SECRET=change-me-in-production >> .env

# Start the application
npm run dev
```

### 3. Verify It's Working

Open your browser to: http://localhost:3000

You should see the Cher's Closet login page.

## Windows-Specific Issues & Solutions

### Issue: "ENOTSUP: operation not supported on socket"
**Solution**: Use `localhost` instead of `0.0.0.0` as the host

### Issue: "Port already in use"
```cmd
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
set PORT=3001
npm run dev
```

### Issue: "Permission denied" errors
- Run Command Prompt as Administrator
- Or use PowerShell with execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Module not found" errors
```cmd
# Clean reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

## Development on Windows

### Using Command Prompt
```cmd
cd C:\Users\%USERNAME%\Downloads\War\War
set HOST=localhost
npm run dev
```

### Using PowerShell
```powershell
cd C:\Users\$env:USERNAME\Downloads\War\War
$env:HOST="localhost"
npm run dev
```

### Using VS Code
1. Open the project folder in VS Code
2. Open integrated terminal (Ctrl + `)
3. Run: `npm run dev`

## Environment Variables for Windows

Create `.env` file with Windows-friendly settings:

```env
# Basic Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Session Secret
SESSION_SECRET=chers-closet-secret-key

# Optional: Database (use free services)
# DATABASE_URL=postgresql://user:pass@host:5432/db

# Optional: AI Features
# OPENAI_API_KEY=your-openai-key-here

# Optional: Weather
# WEATHER_API_KEY=your-weather-key-here
```

## Windows Firewall

If you can't access the app:

1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find "Node.js" and allow both Private and Public networks

## Next Steps

1. **Test the app**: Register an account and add wardrobe items
2. **Get API keys**: 
   - OpenAI for AI features: [platform.openai.com](https://platform.openai.com)
   - Weather API: [weatherapi.com](https://weatherapi.com)
3. **Add database**: See `docs/database-alternatives.md` for free options
4. **Deploy**: Use Vercel, Netlify, or other hosting services

## Troubleshooting Commands

```cmd
# Check Node.js version
node --version

# Check npm version
npm --version

# Check what's running on port 3000
netstat -ano | findstr :3000

# Start with different port
set PORT=3001 && npm run dev

# Check environment variables
echo %HOST%
echo %PORT%
```

Your app should now work perfectly on Windows! 🎉