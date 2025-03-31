# Using PostgreSQL with VS Code

This guide provides detailed instructions on how to connect to and work with PostgreSQL databases in Visual Studio Code.

## Installing PostgreSQL Extensions

To make working with PostgreSQL easier in VS Code, install these extensions:

1. **PostgreSQL** by Chris Kolkman - For managing PostgreSQL connections and executing queries
2. **SQLTools** by Matheus Teixeira - For database management and query execution
3. **SQLTools PostgreSQL/Redshift Driver** - Driver for SQLTools to connect to PostgreSQL

## Setting Up a PostgreSQL Connection

### Using the PostgreSQL Extension

1. Open VS Code and navigate to the PostgreSQL extension in the sidebar
2. Click the + button to add a new connection
3. Fill in your connection details:
   - Host: `localhost` (or your remote host)
   - Port: `5432` (default PostgreSQL port)
   - Username: Your PostgreSQL username
   - Password: Your PostgreSQL password
   - Database: `wardrobe_app` (or your database name)

4. Click "Save" to store your connection details

### Using SQLTools

1. Open the SQLTools view in the sidebar
2. Click "Add New Connection"
3. Select "PostgreSQL" as the database type
4. Fill in your connection details (similar to above)
5. Test the connection and save it

## Creating the Database Schema

There are two ways to set up your database schema:

### Option 1: Using Drizzle ORM (Recommended)

1. Ensure your `.env` file has the correct PostgreSQL connection details
2. Run the database push command:
   ```bash
   npm run db:push
   ```

This will create all necessary tables based on the schema defined in `shared/schema.ts`.

### Option 2: Using Raw SQL

1. Open the SQLTools or PostgreSQL extension
2. Connect to your PostgreSQL server
3. Create a new database named `wardrobe_app` if it doesn't exist
4. Open the `scripts/schema.sql` file in VS Code
5. Select all the SQL code and execute it using your chosen extension

Alternatively, you can use our helper script:
```bash
node scripts/manual-db-setup.js
```

## Working with the Database in VS Code

### Viewing Tables and Data

1. Expand your database connection in the PostgreSQL or SQLTools extension
2. Navigate to the Tables section
3. Right-click on a table and select "View Data" to see its contents

### Running Queries

1. Create a new SQL file (e.g., `query.sql`)
2. Write your SQL query
3. Right-click and select "Run Query" or use the extension's command buttons

### Common Queries for This Application

#### View all users
```sql
SELECT * FROM users;
```

#### View all wardrobe items for a user
```sql
SELECT * FROM wardrobe_items WHERE user_id = 1;
```

#### View outfits with their items
```sql
SELECT o.id, o.name, o.occasion, o.season, 
       array_agg(w.name) as item_names
FROM outfits o
LEFT JOIN unnest(o.items) as item_id ON true
LEFT JOIN wardrobe_items w ON w.id = item_id
WHERE o.user_id = 1
GROUP BY o.id, o.name, o.occasion, o.season;
```

## Troubleshooting Database Connections

### Connection Refused Errors

If you see "connection refused" errors:

1. Verify PostgreSQL is running on your system:
   ```bash
   # On Windows
   net start postgresql
   
   # On macOS
   brew services list
   
   # On Linux
   sudo systemctl status postgresql
   ```

2. Check your connection details in the `.env` file
3. Ensure your PostgreSQL user has the correct permissions

### Authentication Failed

1. Double-check your username and password
2. Verify that the user exists in PostgreSQL:
   ```sql
   SELECT * FROM pg_user;
   ```

### Missing Tables

If tables are missing:

1. Verify that you're connected to the correct database
2. Run the schema setup again:
   ```bash
   npm run db:push
   ```
   or
   ```bash
   node scripts/manual-db-setup.js
   ```

## Backing Up and Restoring

### Creating a Backup

Using pg_dump (in terminal):
```bash
pg_dump -U your_username -d wardrobe_app -f backup.sql
```

### Restoring from Backup

Using psql (in terminal):
```bash
psql -U your_username -d wardrobe_app -f backup.sql
```

## Database Migrations

When you need to update your database schema:

1. Update the schema definitions in `shared/schema.ts`
2. Run the migration:
   ```bash
   npm run db:push
   ```

Note: This may result in data loss warnings if changing column types. Always back up your data before running migrations.