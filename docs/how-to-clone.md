# How to Clone Cher's Closet

This guide shows you how to clone and set up the Cher's Closet wardrobe management app on your local machine.

## Quick Start

### 1. Clone the Repository

```bash
# If using Git (from GitHub/GitLab)
git clone <repository-url>
cd chers-closet

# Or download and extract the ZIP file
# Then navigate to the project folder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Create a `.env` file in the root directory:

```env
# Basic Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Session Secret (change this!)
SESSION_SECRET=your-super-secret-key-here

# Optional: AI Features (requires OpenAI API key)
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Start the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Detailed Setup Options

### Option 1: Run with In-Memory Storage (Simplest)

```bash
# Clone and install
git clone <repository-url>
cd chers-closet
npm install

# Create basic .env file
echo "NODE_ENV=development
PORT=3000
SESSION_SECRET=change-me-in-production" > .env

# Start the app
npm run dev
```

**Pros**: Works immediately, no database setup
**Cons**: Data resets when server restarts

### Option 2: Add Database (Persistent Data)

Choose from these free database options:

#### Neon (PostgreSQL - Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a database
3. Copy the connection string
4. Add to your `.env`:

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

#### Supabase (PostgreSQL + Auth)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a project
3. Get the connection string from Settings > Database
4. Add to your `.env`:

```env
DATABASE_URL=postgresql://user:pass@host.supabase.co:5432/postgres
```

#### MongoDB Atlas (NoSQL)
1. Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Requires code changes for MongoDB integration

### Option 3: VS Code Development Setup

```bash
# Clone and install
git clone <repository-url>
cd chers-closet
npm install

# Open in VS Code
code .

# Install recommended extensions (VS Code will prompt)
# Press F5 to start with debugging
```

## Project Structure

```
chers-closet/
├── client/src/          # React frontend
│   ├── components/      # UI components
│   ├── pages/          # App pages
│   ├── hooks/          # React hooks
│   └── lib/            # Utilities
├── server/             # Express backend
│   ├── services/       # AI and other services
│   ├── routes.ts       # API routes
│   └── storage.ts      # Data storage
├── shared/             # Shared types
├── .vscode/           # VS Code configuration
└── docs/              # Documentation
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:vscode   # Start with VS Code script

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database (if using external DB)
npm run db:push      # Push schema to database

# Type checking
npm run check        # Check TypeScript types
```

## Configuration Options

### Environment Variables

```env
# Required
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key

# Optional Database
DATABASE_URL=your-database-connection-string

# Optional AI Features
OPENAI_API_KEY=your-openai-key

# Optional Weather API
WEATHER_API_KEY=your-weather-api-key
```

### Features Available

- ✅ **User Registration/Login**: Create accounts and authenticate
- ✅ **Wardrobe Management**: Add, edit, delete clothing items
- ✅ **Outfit Creation**: Combine items into outfits
- ✅ **AI Recommendations**: Get styling suggestions (requires OpenAI key)
- ✅ **Fashion Inspiration**: Browse curated style content
- ✅ **Weather Integration**: Weather-based outfit suggestions
- ✅ **Mood-Based Styling**: Select outfits by mood
- ✅ **Mobile Responsive**: Works on phones and tablets

## Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Kill existing process
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

**Module not found errors:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check for errors
npm run check
# Restart TypeScript in VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**Database connection issues:**
- Check your DATABASE_URL is correct
- Ensure database service is running
- Try removing DATABASE_URL to use in-memory storage

### Getting Help

1. **Check the logs**: Look at the terminal output for error messages
2. **Review documentation**: See `docs/` folder for detailed guides
3. **Test API endpoints**: Use `curl` or Postman to test `/api/health`
4. **Check VS Code setup**: See `README-VSCODE.md` for development setup

## Next Steps After Cloning

1. **Add wardrobe items**: Register and start adding your clothes
2. **Get OpenAI API key**: Enable AI features at [platform.openai.com](https://platform.openai.com)
3. **Set up database**: Choose from free options in `docs/database-alternatives.md`
4. **Customize styling**: Modify `theme.json` for different colors
5. **Deploy**: Use Vercel, Netlify, or Railway for hosting

## Repository Information

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (or in-memory storage)
- **AI**: OpenAI GPT integration
- **UI**: Radix UI components (shadcn)
- **State**: TanStack React Query
- **Authentication**: Express sessions + Passport

Ready to start styling with AI! 🎉