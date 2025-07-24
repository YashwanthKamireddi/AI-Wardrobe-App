# VS Code Setup Guide for Cher's Closet

This guide helps you run the Cher's Closet application in Visual Studio Code.

## Quick Start

1. **Clone/Download the project**
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Open**: http://localhost:3000

## VS Code Configuration

The project includes pre-configured VS Code settings:

### Extensions (Auto-recommended)
- Tailwind CSS IntelliSense
- Prettier Code Formatter
- TypeScript and JavaScript Language Features
- Auto Rename Tag
- Path Intellisense
- Code Spell Checker

### Debug Configuration
Press `F5` or go to Run > Start Debugging to:
- Launch the development server with debugging
- Set breakpoints in TypeScript code
- Debug both frontend and backend

### Available Tasks
- `Ctrl+Shift+P` → "Tasks: Run Task" → "npm: dev"
- `Ctrl+Shift+P` → "Tasks: Run Task" → "npm: build"

## Running the Application

### Method 1: Integrated Terminal
```bash
npm run dev
```

### Method 2: VS Code Debugger
1. Open Run and Debug panel (Ctrl+Shift+D)
2. Select "Start Development Server"
3. Press F5

### Method 3: VS Code Tasks
1. Press Ctrl+Shift+P
2. Type "Tasks: Run Task"
3. Select "npm: dev"

## Environment Setup

Create a `.env` file in the root directory:

```env
# Basic Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Session Secret (change in production)
SESSION_SECRET=your-secret-key-here

# Optional: AI Features (requires OpenAI API key)
OPENAI_API_KEY=your-openai-key-here
```

## Database Options

The app currently uses **in-memory storage** (data resets on restart). For persistent data, see `docs/database-alternatives.md` for free database options.

## Project Structure

```
├── client/src/          # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── .vscode/            # VS Code configuration
├── docs/               # Documentation
└── README-VSCODE.md    # This file
```

## Development Workflow

1. **Frontend changes**: Files auto-reload via Vite HMR
2. **Backend changes**: Server auto-restarts via tsx watch mode
3. **Type checking**: Automatic in VS Code + `npm run check`
4. **Debugging**: Set breakpoints in .ts files, works seamlessly

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors
```bash
# Check types
npm run check

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Features

- **Wardrobe Management**: Add, edit, categorize clothing items
- **Outfit Creation**: Combine items into outfits
- **AI Recommendations**: Style suggestions (requires OpenAI API key)
- **Fashion Inspiration**: Browse curated style ideas
- **Responsive Design**: Works on desktop and mobile
- **Authentication**: User registration and login

## Next Steps

1. **Add database**: See `docs/database-alternatives.md`
2. **Deploy**: Use services like Vercel, Netlify, or Railway
3. **Add features**: Weather integration, social sharing, etc.

Happy coding! 🎉