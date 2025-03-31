# VS Code Setup Guide

This document provides a comprehensive guide for setting up and developing the Wardrobe Management Application in Visual Studio Code.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **Node.js** (v16.x or later) - [Download Node.js](https://nodejs.org/)
2. **PostgreSQL** (v14.x or later) - [Download PostgreSQL](https://www.postgresql.org/download/)
3. **Visual Studio Code** - [Download VS Code](https://code.visualstudio.com/)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd wardrobe-management-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Then open the `.env` file and update the values as needed:

- Update `PGUSER`, `PGPASSWORD`, and other PostgreSQL credentials if different from defaults
- Generate a random string for `SESSION_SECRET`
- Add your `OPENAI_API_KEY` if you plan to use AI features

### 4. Install VS Code Extensions

The project has recommended extensions configured in `.vscode/settings.json`. To install them:

1. Open the Extensions view in VS Code (View > Extensions)
2. Type `@recommended` in the search box
3. Click "Install All" to install the recommended extensions

Key extensions include:
- ESLint and Prettier for code formatting
- PostgreSQL and SQLTools for database management
- Tailwind CSS IntelliSense for styling

### 5. Set Up the Database

You have two options for setting up the database:

#### Option A: Automated Setup

Run the VS Code setup script using the debugger:
1. Go to the Run and Debug view (Ctrl+Shift+D)
2. Select "VS Code Setup" from the dropdown
3. Click the green play button

Or run it from the terminal:
```bash
node scripts/setup-vscode.js
```

#### Option B: Manual Database Setup

1. Create a PostgreSQL database named `wardrobe_app`
2. Run the manual database setup:
   ```bash
   node scripts/manual-db-setup.js
   ```

Or use the SQL script directly with a PostgreSQL client:
1. Open `scripts/schema.sql` in VS Code
2. Connect to your PostgreSQL server using VS Code's PostgreSQL extension
3. Run the SQL script to create tables and sample data

## Running the Application

### Using VS Code Debugger

1. Go to the Run and Debug view (Ctrl+Shift+D)
2. Select "Start Server" from the dropdown
3. Click the green play button

The server will start and automatically watch for changes.

### Using Terminal

```bash
npm run dev
```

This starts the application in development mode with auto-reloading.

## Database Management

For a detailed guide on working with the PostgreSQL database in VS Code, see:
[Database Guide](docs/VSCODE_DATABASE.md)

## Project Structure

```
├── client/              # Frontend React application
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and libraries
│   │   ├── pages/       # Page components
│   │   └── App.tsx      # Main application component
├── server/              # Backend Express application
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── db.ts            # Database connection setup
│   ├── routes.ts        # API route definitions
│   └── storage.ts       # Storage interface implementation
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema definitions and types
├── scripts/             # Utility scripts for setup and maintenance
├── .vscode/             # VS Code configuration
└── package.json         # Project dependencies and scripts
```

## Development Workflow

### Making Database Changes

1. Update schema definitions in `shared/schema.ts`
2. Run the database migration:
   ```bash
   npm run db:push
   ```

### Adding New API Endpoints

1. Add new routes in `server/routes.ts`
2. Update storage interface in `server/storage.ts` if needed

### Adding New UI Components

1. Create new components in `client/src/components/`
2. Add new pages in `client/src/pages/` if needed
3. Update routes in `client/src/App.tsx` for new pages

## Debugging

### Backend Debugging

1. Set breakpoints in your server code
2. Start the server using the VS Code debugger
3. The debugger will stop at your breakpoints

### Frontend Debugging

1. Use the browser's developer tools (F12)
2. Use `console.log` statements for debugging
3. React DevTools browser extension is recommended

### Database Debugging

1. Use VS Code's PostgreSQL extension to inspect database tables
2. Run SQL queries directly to troubleshoot data issues

## Common Issues and Solutions

### Database Connection Issues

If you encounter database connection problems:

1. Check that PostgreSQL is running
2. Verify your credentials in `.env` file
3. Ensure the database exists
4. Check for detailed error messages in the console

### Node.js Version Conflicts

The application requires Node.js version 16 or later. If you encounter errors:

1. Check your Node.js version: `node --version`
2. Update Node.js if needed: [Node.js Downloads](https://nodejs.org/en/download/)

### Module Not Found Errors

If you see module not found errors:

1. Run `npm install` to ensure all dependencies are installed
2. Check for typos in import statements
3. Verify that the module exists in `package.json`

## Support and Resources

If you need help or have questions:

1. Check the project documentation
2. Open an issue in the repository
3. Refer to the technology documentation:
   - [React Documentation](https://reactjs.org/docs/getting-started.html)
   - [Express Documentation](https://expressjs.com/)
   - [PostgreSQL Documentation](https://www.postgresql.org/docs/)