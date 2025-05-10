# Commands Cheatsheet

Quick reference for common commands and tasks when working with this project in VS Code.

## Development Workflow

| Task | Command | Description |
|------|---------|-------------|
| Start Development | `npm run dev` | Start the development server |
| Build for Production | `npm run build` | Build the application for production |
| Start Production | `npm run start` | Run the production build |
| Type Checking | `npm run check` | Run TypeScript type checking |
| Database Schema Push | `npm run db:push` | Push schema changes to the database |
| Environment Check | `node scripts/test-env.js` | Verify environment setup |

## Database Management

| Task | Command | Description |
|------|---------|-------------|
| Connect to Database | `psql -U postgres -d <database_name>` | Connect to PostgreSQL database |
| Export Database | `pg_dump -U postgres -d <database_name> > backup.sql` | Export database to SQL file |
| Import Database | `psql -U postgres -d <database_name> -f backup.sql` | Import database from SQL file |
| Export Table | `pg_dump -U postgres -d <database_name> -t <table_name> > table.sql` | Export specific table |
| View Tables | `\dt` (in psql) | List all tables in the database |
| View Schema | `\d <table_name>` (in psql) | View table schema |

## Git Commands

| Task | Command | Description |
|------|---------|-------------|
| Clone Repository | `git clone <repo-url>` | Clone the repository |
| Create Branch | `git checkout -b <branch-name>` | Create and switch to a new branch |
| Stage Changes | `git add .` | Stage all changes |
| Commit Changes | `git commit -m "message"` | Commit staged changes |
| Push Changes | `git push origin <branch-name>` | Push to remote repository |
| Pull Changes | `git pull origin <branch-name>` | Pull from remote repository |
| View Status | `git status` | Show status of working directory |
| View Branches | `git branch` | List all local branches |

## VS Code Shortcuts

| Task | Windows/Linux | Mac | Description |
|------|--------------|-----|-------------|
| Open Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` | Access all VS Code commands |
| Quick Open File | `Ctrl+P` | `Cmd+P` | Find and open files quickly |
| Toggle Terminal | ``Ctrl+` `` | ``Cmd+` `` | Show/hide terminal |
| Start Debugging | `F5` | `F5` | Run debugging session |
| Format Document | `Shift+Alt+F` | `Shift+Option+F` | Format current file |
| Go to Definition | `F12` | `F12` | Jump to symbol definition |
| Find References | `Shift+F12` | `Shift+F12` | Find all references |
| Rename Symbol | `F2` | `F2` | Rename symbols across files |
| Toggle Sidebar | `Ctrl+B` | `Cmd+B` | Show/hide sidebar |
| Open Settings | `Ctrl+,` | `Cmd+,` | Open settings |

## Environment Setup

| Task | Command | Description |
|------|---------|-------------|
| Create .env | `cp .env.example .env` | Create .env from example |
| Set Node Version | `nvm use` (with .nvmrc) | Use project Node version |
| Install Dependencies | `npm install` | Install all dependencies |
| Update Dependencies | `npm update` | Update dependencies |

## Troubleshooting Commands

| Task | Command | Description |
|------|---------|-------------|
| Check Node Version | `node -v` | Display Node.js version |
| Check NPM Version | `npm -v` | Display npm version |
| Check PostgreSQL Version | `psql --version` | Display PostgreSQL version |
| List Environment Variables | `printenv` | List all environment variables |
| Check PostgreSQL Status | `pg_isready` | Check if PostgreSQL server is running |
| Check Port Usage | `netstat -tuln \| grep <port>` | Check if port is in use |
| Kill Process on Port | `kill $(lsof -t -i:<port>)` | Kill process on specified port |

## Directory Structure Reference

| Path | Description |
|------|-------------|
| `client/src/` | Frontend React code |
| `client/src/components/` | Reusable React components |
| `client/src/pages/` | Page components |
| `server/` | Backend Express code |
| `server/routes.ts` | API route definitions |
| `server/auth.ts` | Authentication logic |
| `server/storage.ts` | Data storage implementation |
| `shared/schema.ts` | Database schema definitions |
| `docs/` | Project documentation |
| `.vscode/` | VS Code configuration |
| `scripts/` | Utility scripts |

## Quick Links

- [VS Code Setup Guide](./vs-code-setup.md)
- [Database Synchronization Guide](./database-sync.md)
- [Workflow Optimization Guide](./workflow-optimization.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Project README](../README.md)