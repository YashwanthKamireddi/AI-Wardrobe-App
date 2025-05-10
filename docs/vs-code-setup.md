# VS Code Setup for Cher's Closet

This guide will help you set up and run the Cher's Closet application in Visual Studio Code.

## Prerequisites

1. **Node.js**: Version 20 or later
2. **PostgreSQL**: A local PostgreSQL server
3. **VS Code**: Latest version
4. **Git**: For version control

## Setting Up the Project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Wardrobe-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL

#### Windows

1. Run the PowerShell setup script:

```powershell
# Make sure you're in the project root
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
./scripts/setup-postgres.ps1
```

2. This script will:
   - Check if PostgreSQL is installed
   - Verify if the PostgreSQL service is running
   - Create the 'chers_closet' database

#### macOS/Linux

1. Make sure PostgreSQL is installed and running:

```bash
# macOS (using Homebrew)
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo service postgresql start
```

2. Create the database:

```bash
psql -U postgres -c "CREATE DATABASE chers_closet;"
```

### 4. Environment Setup

1. Update the `.env` file with your database configuration
2. Make sure the `DATABASE_URL` and other connection details match your PostgreSQL setup
3. Add your OpenAI API key for AI features

### 5. Database Migration

Run the migration to set up your database schema:

```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Running the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check your `.env` file for correct credentials
- Make sure you've created the database
- Try connecting to PostgreSQL manually:
  ```bash
  psql -U postgres -d chers_closet
  ```

### Missing Environment Variables

If you get errors about missing environment variables:

1. Run the environment debugging script:
   ```bash
   node scripts/debug-env.js
   ```
   This will check your .env file and environment variables, providing detailed recommendations.

2. Check that your `.env` file exists in the root directory
3. Make sure it contains all required variables:
   - `DATABASE_URL`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
   - `PGHOST`
   - `SESSION_SECRET`
   - `OPENAI_API_KEY`

4. If the .env file approach isn't working, you can set variables directly in PowerShell:
   ```powershell
   # Run from the project root
   ./scripts/set-env.ps1
   npm run dev
   ```
   This will set all needed environment variables for the current session only.

### OpenAI API Issues

If AI recommendations don't work:

1. Make sure you've added a valid `OPENAI_API_KEY` to your `.env` file
2. Check OpenAI API status: [https://status.openai.com/](https://status.openai.com/)

## VS Code Extensions

For the best development experience, install these VS Code extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL
- REST Client

## Debugging

A launch configuration is provided in `.vscode/launch.json` for debugging the application. You can start debugging by pressing F5 or clicking the Debug button in VS Code.