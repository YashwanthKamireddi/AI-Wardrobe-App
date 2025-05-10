# VS Code Setup Guide

This document provides a detailed guide for setting up and working with this Replit project in Visual Studio Code.

## Prerequisites

Before starting, ensure you have the following installed:

1. **Visual Studio Code**: [Download VS Code](https://code.visualstudio.com/download)
2. **Node.js**: Version 20.x or later [Download Node.js](https://nodejs.org/en/download/)
3. **Git**: [Download Git](https://git-scm.com/downloads)
4. **PostgreSQL**: Either:
   - Local installation [Download PostgreSQL](https://www.postgresql.org/download/)
   - Cloud database (Neon, Supabase, etc.)
   - Access to your Replit PostgreSQL database

## Step 1: Clone the Repository

First, clone your Replit repository to your local machine:

1. **Get Your Replit Repository URL**:
   - In Replit, go to the "Version Control" tab
   - Copy the Git URL provided

2. **Clone the Repository**:
   ```bash
   git clone <your-replit-git-url>
   cd <repository-directory>
   ```

## Step 2: Install VS Code Extensions

Install these recommended VS Code extensions for the best development experience:

1. **ESLint**: JavaScript/TypeScript linting
   - Extension ID: `dbaeumer.vscode-eslint`

2. **Prettier**: Code formatting
   - Extension ID: `esbenp.prettier-vscode`

3. **Tailwind CSS IntelliSense**: For Tailwind CSS support
   - Extension ID: `bradlc.vscode-tailwindcss`

4. **PostCSS Language Support**: For PostCSS syntax
   - Extension ID: `csstools.postcss`

5. **SQLTools**: For database management
   - Extension ID: `mtxr.sqltools`

6. **SQLTools PostgreSQL/Redshift Driver**:
   - Extension ID: `mtxr.sqltools-driver-pg`

7. **DotENV**: For .env file syntax highlighting
   - Extension ID: `mikestead.dotenv`

8. **Import Cost**: See the size of imported packages
   - Extension ID: `wix.vscode-import-cost`

9. **Path Intellisense**: Autocompletes filenames
   - Extension ID: `christian-kohler.path-intellisense`

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory of your project:

```bash
touch .env
```

Add the following environment variables to your `.env` file:

```
DATABASE_URL=postgres://<username>:<password>@<hostname>:<port>/<database>
PGPORT=<port>
PGUSER=<username>
PGPASSWORD=<password>
PGDATABASE=<database>
PGHOST=<hostname>
SESSION_SECRET=<random-string-for-session-encryption>
```

### Option A: Using Local PostgreSQL

If you're using a local PostgreSQL installation:

```
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/chers_closet
PGPORT=5432
PGUSER=postgres
PGPASSWORD=yourpassword
PGDATABASE=chers_closet
PGHOST=localhost
SESSION_SECRET=your_secret_key_here
```

### Option B: Using Replit PostgreSQL

If you want to continue using your Replit database:

1. In Replit, go to the "Secrets" tab
2. Copy all database-related environment variables
3. Add them to your local `.env` file

Note: You might need to set up an SSH tunnel to access Replit's PostgreSQL database externally.

### Option C: Using a Cloud PostgreSQL Service

If using a service like Neon:

1. Create a new PostgreSQL database in your chosen service
2. Copy the connection details provided by the service
3. Update your `.env` file with these details

## Step 4: Install Dependencies

Install all required dependencies:

```bash
npm install
```

## Step 5: Set Up Database Schema

Push the schema to your database:

```bash
npm run db:push
```

## Step 6: VS Code Settings

Create a `.vscode` folder with settings and launch configurations.

### settings.json

Create `.vscode/settings.json` with these recommended settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.css": "postcss"
  }
}
```

### launch.json

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/tsx/dist/cli.js",
      "args": ["server/index.ts"],
      "console": "integratedTerminal",
      "outFiles": ["${workspaceFolder}/**/*.js"],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/.env"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/client",
      "sourceMaps": true
    }
  ],
  "compounds": [
    {
      "name": "Full Stack: Server + Frontend",
      "configurations": ["Debug Server", "Debug Frontend"]
    }
  ]
}
```

## Step 7: Start Development Server

Start the development server:

```bash
npm run dev
```

This will start both the backend server and the frontend development server.

## Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## Working with VS Code

### Using the Terminal

VS Code has an integrated terminal that you can use to run commands:

1. Open the terminal with `` Ctrl+` `` (backtick)
2. Run any npm script from here

### Debugging

Use the debugging configurations set up in `launch.json`:

1. Click the "Run and Debug" icon in the sidebar (or press `F5`)
2. Select "Full Stack: Server + Frontend" to debug both
3. Set breakpoints in your code by clicking next to line numbers

### Database Management

Use the SQLTools extension to connect to your database:

1. Click the SQLTools icon in the sidebar
2. Add a new connection with your PostgreSQL details
3. Navigate tables, run queries, and manage your database

### Git Integration

VS Code has excellent Git integration:

1. Click the Source Control icon in the sidebar
2. Stage changed files, commit, and push directly from VS Code
3. Use the Git Graph extension for a visual representation of your Git history

## Key Differences Between Replit and VS Code

### Environment Variables

- In Replit: Set in the "Secrets" tab
- In VS Code: Set in the `.env` file

### Port Access

- In Replit: Automatically handled through the webview
- In VS Code: Accessed directly via localhost

### File Watching and Reload

- In Replit: Handled by the Replit environment
- In VS Code: Handled by the dev script, but might need manual refresh sometimes

### Database Access

- In Replit: Direct access to the provided PostgreSQL database
- In VS Code: Need to set up PostgreSQL locally or connect to a remote database

## Making Changes

Always follow these best practices when making changes:

1. **Sync Regularly**: Pull changes from Replit if you're working on both platforms
2. **Test in Both Environments**: Features might work differently between Replit and VS Code
3. **Keep Dependencies in Sync**: If you add a dependency in VS Code, add it in Replit too
4. **Database Migrations**: Apply schema changes in both environments

## Troubleshooting

### Common VS Code Issues

1. **"Module not found" errors**:
   - Check if all dependencies are installed
   - Make sure tsconfig.json paths are correctly set up

2. **Debugging not working**:
   - Make sure launch.json is correctly configured
   - Check that sourceMap options are enabled

3. **Environment variables not being loaded**:
   - Verify your .env file has the correct format
   - Restart VS Code to ensure it picks up the new variables

4. **Database connection issues**:
   - Check your database connection details in .env
   - Make sure your database is running
   - For remote databases, check firewall/network settings

5. **TypeScript errors in VS Code but not in Replit**:
   - Make sure you're using the workspace version of TypeScript
   - Check TypeScript versions match between environments

## Additional Resources

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)