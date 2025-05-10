# Database Synchronization Guide

This guide provides detailed instructions on how to keep your database in sync when working between Replit and VS Code environments.

## Understanding the Database Architecture

The Cher's Closet app uses:

- **PostgreSQL**: For the database engine
- **Drizzle ORM**: For database schema definition and queries 
- **connect-pg-simple**: For PostgreSQL session storage

The database schema is defined in `shared/schema.ts` and includes these tables:
- `sessions`: For session management
- `users`: User profiles and authentication
- `wardrobe_items`: Clothing items
- `outfits`: Created outfit combinations
- `inspirations`: Fashion inspiration content
- `weather_preferences`: Weather-based preferences
- `mood_preferences`: Mood-based preferences

## Database Setup Options

### Option 1: Shared Database (Recommended)

Using the same database for both Replit and VS Code environments ensures data consistency.

#### Steps:

1. **In Replit**:
   - Get your database connection details from Secrets
   - Note down `DATABASE_URL` and related variables

2. **In VS Code**:
   - Create a `.env` file with the same database credentials
   - You may need to set up an SSH tunnel (see below)

3. **Test Connection**:
   ```bash
   # In VS Code
   npx drizzle-kit studio
   ```

#### Setting Up SSH Tunnel (If Needed)

If Replit's PostgreSQL is not accessible directly:

```bash
# Install SSH tunnel utility
npm install -g localtunnel

# Create a tunnel
lt --port <your-pg-port> --subdomain <choose-a-name>

# Then update your .env to point to this tunnel
```

### Option 2: Local Development Database

If you prefer to work with a local database during development:

#### Steps:

1. **Install PostgreSQL Locally**:
   - [Download PostgreSQL](https://www.postgresql.org/download/)
   - Create a new database: `createdb chers_closet`

2. **Configure Local Environment**:
   ```
   # .env file in VS Code
   DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/chers_closet
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=yourpassword
   PGDATABASE=chers_closet
   PGHOST=localhost
   SESSION_SECRET=your_secret_key_here
   ```

3. **Initialize Schema**:
   ```bash
   npm run db:push
   ```

### Option 3: Cloud Database Service

Using a cloud database service like Neon, Supabase, or Railway:

#### Steps:

1. **Create Account and Database**:
   - Sign up for a cloud PostgreSQL service
   - Create a new database

2. **Configure Environment**:
   - Get connection details from your provider
   - Update both Replit Secrets and local `.env` file

3. **Initialize Schema**:
   ```bash
   npm run db:push
   ```

## Schema Management

The database schema is managed using Drizzle ORM and defined in `shared/schema.ts`.

### Making Schema Changes

When making changes to the schema:

1. **Update Schema File**:
   - Edit `shared/schema.ts` with your changes
   - Follow the existing patterns for table definitions

2. **Push Changes to Database**:
   ```bash
   npm run db:push
   ```

3. **Synchronize Environments**:
   - Make the same schema changes in both environments
   - Push from both environments, or...
   - If using a shared database, push from one environment only

### Safety Tips

1. **Always Back Up First**:
   ```bash
   # Export your database before making schema changes
   pg_dump -U postgres chers_closet > backup.sql
   ```

2. **Test in Development**:
   - Always test schema changes in a development environment before applying to production

3. **Review Push Plan**:
   - Drizzle shows a preview of changes before applying them
   - Review carefully to avoid data loss

## Data Migration Strategies

### Small Data Volumes

For smaller datasets, you can manually transfer data:

1. **Export from Source**:
   ```bash
   # From Replit or local environment
   pg_dump -U postgres -t table_name chers_closet > table_export.sql
   ```

2. **Import to Target**:
   ```bash
   # To VS Code/local environment
   psql -U postgres -d chers_closet -f table_export.sql
   ```

### Larger Data Volumes

For larger datasets, use a more automated approach:

1. **Full Database Dump**:
   ```bash
   pg_dump -U postgres -Fc chers_closet > full_db.dump
   ```

2. **Restore to Target**:
   ```bash
   pg_restore -U postgres -d chers_closet full_db.dump
   ```

## Database Seeding

If you need sample data for development:

1. **Create Seed Script**:
   ```typescript
   // scripts/seed.ts
   import { db } from '../server/db';
   import { users, wardrobeItems /* ... other tables */ } from '../shared/schema';

   async function seed() {
     // Add sample data
     await db.insert(users).values([
       { username: 'testuser', password: 'hashedpassword', name: 'Test User' },
       // More records...
     ]);

     // Add more sample data for other tables
     
     console.log('Database seeded successfully');
   }

   seed().catch(console.error);
   ```

2. **Run the Seed Script**:
   ```bash
   npx tsx scripts/seed.ts
   ```

## Handling Sessions

The `sessions` table is used for authentication and managed by `connect-pg-simple`.

### Creating Sessions Table

This table should be created automatically by Drizzle when pushing the schema. If missing:

```sql
CREATE TABLE "sessions" (
  "sid" varchar NOT NULL PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");
```

### Session Management

Sessions are temporary by nature and generally don't need to be migrated between environments.

## Troubleshooting

### Connection Issues

1. **Check Connection String**:
   - Verify all parts of your DATABASE_URL are correct
   - Test with `psql` command line tool

2. **Network/Firewall**:
   - Ensure your IP is allowed if using a cloud database
   - Check if you need to use SSL connections

3. **Permission Issues**:
   - Verify your user has appropriate permissions in the database

### Schema Push Failures

1. **Schema Conflicts**:
   - If you get conflicts, review the differences carefully
   - Consider dropping tables and recreating them (only in development)

2. **Connection Timeout**:
   - Increase timeout settings in Drizzle configuration

3. **Data Type Issues**:
   - Ensure compatible data types when changing column types

## Database Monitoring

### Using PgAdmin

[PgAdmin](https://www.pgadmin.org/) is a useful tool for monitoring and managing PostgreSQL:

1. **Install PgAdmin**
2. **Connect to your database**
3. **Monitor table sizes, query performance, etc.**

### Connection Pooling

The application uses connection pooling to improve performance. Key settings in `server/db.ts`:

```typescript
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_SIZE || '10'), // Max connections
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // Idle timeout
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'), // Connection timeout
  maxUses: parseInt(process.env.DB_MAX_USES || '7500'), // Max uses per connection
};
```

Adjust these settings based on your needs and environment.

## Best Practices

1. **Version Control Schema Changes**:
   - Always commit schema changes to git
   - Document significant changes in commit messages

2. **Regular Backups**:
   - Schedule regular database backups
   - Test restoration process occasionally

3. **Environment Separation**:
   - Consider separating development, testing, and production databases
   - Use different database names or schemas for each environment

4. **Schema Documentation**:
   - Keep schema documentation up to date
   - Add meaningful comments to schema definitions

5. **Monitoring and Optimization**:
   - Regularly check database performance
   - Optimize queries and indexes as needed

## Advanced Topics

### Using Database Migrations

For more control over schema changes, consider using Drizzle migrations:

```bash
# Generate migration files
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit migrate
```

### Database Replication

For advanced setups, consider database replication:

1. **Set Up Primary Database**
2. **Configure Read Replicas**
3. **Update Application to Use Appropriate Connections**

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node-Postgres Documentation](https://node-postgres.com/)
- [Connect-PG-Simple Documentation](https://github.com/voxpelli/node-connect-pg-simple)