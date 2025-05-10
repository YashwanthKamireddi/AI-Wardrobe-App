# Troubleshooting Guide

This document provides solutions to common issues that may arise when transitioning from Replit to VS Code development.

## TypeScript/LSP Errors

### Issue: "Type X is missing properties from type X"

This commonly occurs with type mismatches between package versions in different environments.

#### Solution 1: Use Type Assertions

```typescript
// Before (causing error)
this.sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
});

// After (working around type mismatch)
this.sessionStore = new PostgresSessionStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  tableName: 'sessions',
});
```

#### Solution 2: Update Package Versions

Make sure your local dependencies match the ones used in Replit:

```bash
# Check current version in Replit
npm list @neondatabase/serverless pg connect-pg-simple

# Install matching versions locally
npm install @neondatabase/serverless@X.X.X pg@X.X.X connect-pg-simple@X.X.X
```

### Issue: Path Aliases Not Working

#### Solution:

Ensure your `tsconfig.json` and VS Code settings match:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}

// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

## Database Connectivity Issues

### Issue: Cannot Connect to Replit Database from VS Code

#### Solution 1: SSH Tunnel

```bash
# Install localtunnel
npm install -g localtunnel

# Create tunnel to Replit database
lt --port <your-pg-port> --subdomain <choose-a-name>

# Update .env to use the tunnel
DATABASE_URL=postgres://username:password@localhost:<tunnel-port>/database
```

#### Solution 2: Use a Cloud Database

1. Provision a database on a service like Neon, Supabase, or Railway
2. Update both Replit and VS Code environments with the same connection string

#### Solution 3: PostgreSQL Connection String Format Issues

Ensure your connection string is correctly formatted:

```
// Correct format
postgres://username:password@hostname:port/database_name

// With additional parameters
postgres://username:password@hostname:port/database_name?sslmode=require
```

## Environment Variables

### Issue: Environment Variables Not Recognized

#### Solution:

1. Make sure you have a `.env` file in your project root
2. Check that the variable names match exactly (case-sensitive)
3. Restart VS Code or your development server
4. Consider using `dotenv-cli` to preload variables:

```bash
npm install -g dotenv-cli
dotenv -e .env npm run dev
```

## Workflow / Script Execution

### Issue: Scripts Working in Replit But Not in VS Code

#### Solution:

1. Check for OS-specific syntax in scripts
   - Replace Unix-only commands with cross-platform alternatives
   - Use a library like `cross-env` for environment variables

2. Path differences
   - Use relative paths based on `__dirname` or `import.meta.url`
   - Avoid hardcoded absolute paths

## Session Management

### Issue: Authentication Works in Replit But Not in VS Code

#### Solution:

1. Check session configuration:
   - Ensure SESSION_SECRET is properly set
   - Verify session storage configuration matches

2. Verify session table exists:
   ```bash
   # Run test script
   node scripts/test-env.js
   
   # Or manually check in database
   psql -U postgres -d your_database -c "SELECT * FROM information_schema.tables WHERE table_name='sessions';"
   ```

3. Use the same session settings in both environments:
   ```javascript
   const sessionConfig = {
     secret: process.env.SESSION_SECRET || 'fallback-dev-secret',
     resave: false,
     saveUninitialized: false,
     cookie: {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
     },
     store: storage.sessionStore,
   };
   ```

## API/Frontend Communication

### Issue: API Endpoints Not Accessible

#### Solution:

1. Check port configuration:
   - Replit might use port forwarding differently
   - Ensure your frontend is calling the correct API URL

2. CORS issues:
   - Verify CORS configuration allows requests from your frontend origin

3. Proxy configuration in Vite:
   - Check if the proxy in `vite.config.js` needs adjustment

## VS Code-Specific Issues

### Issue: Debugging Not Working

#### Solution:

1. Verify the `.vscode/launch.json` configuration:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Server",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/server/index.ts",
         "outFiles": ["${workspaceFolder}/dist/**/*.js"],
         "sourceMaps": true
       }
     ]
   }
   ```

2. Ensure TypeScript sourcemaps are enabled:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "sourceMap": true
     }
   }
   ```

### Issue: Extensions Causing Conflicts

#### Solution:

1. Try disabling extensions that might interfere with TypeScript/JavaScript
2. Create a `.vscode/extensions.json` to recommend the right extensions:
   ```json
   {
     "recommendations": [
       "dbaeumer.vscode-eslint",
       "esbenp.prettier-vscode",
       "bradlc.vscode-tailwindcss"
     ]
   }
   ```

## Performance Issues

### Issue: Development Server is Slow in VS Code

#### Solution:

1. Optimize TypeScript configuration:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true,
       "skipLibCheck": true
     }
   }
   ```

2. Use a faster transpiler for development:
   ```bash
   npm install --save-dev esbuild-register
   ```

   Then update your dev script:
   ```json
   "scripts": {
     "dev": "node --require esbuild-register server/index.ts"
   }
   ```

3. Reduce VS Code extensions:
   - Disable heavy extensions you don't need
   - Consider using VS Code Workspace Trust

## Data Differences

### Issue: Data Available in Replit But Not in VS Code

#### Solution:

1. Export data from Replit:
   ```bash
   # On Replit
   pg_dump -U postgres -d database_name > data_dump.sql
   ```

2. Import to local database:
   ```bash
   # In VS Code environment
   psql -U postgres -d database_name -f data_dump.sql
   ```

3. For specific tables only:
   ```bash
   # Export specific table
   pg_dump -U postgres -t table_name database_name > table_dump.sql
   
   # Import specific table
   psql -U postgres -d database_name -f table_dump.sql
   ```

## Common Fixes Checklist

When transitioning from Replit to VS Code, go through this checklist:

1. ✅ **Environment Variables**: Copy all from Replit to local `.env`
2. ✅ **Database**: Verify connection string and access
3. ✅ **Dependencies**: Ensure all packages are installed with matching versions
4. ✅ **Node Version**: Use the same Node.js version as Replit
5. ✅ **TypeScript Config**: Check paths and compiler options
6. ✅ **VS Code Settings**: Configure for optimal development experience
7. ✅ **Port Configuration**: Adjust as needed for local development
8. ✅ **CORS Settings**: Update to allow local development origins
9. ✅ **Database Schema**: Run `npm run db:push` to sync the schema
10. ✅ **File Paths**: Fix any hardcoded paths that might differ