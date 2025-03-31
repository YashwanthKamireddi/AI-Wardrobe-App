/**
 * Manual Database Setup Script
 * 
 * This script provides a way to set up the database manually
 * using the schema.sql file instead of relying on Drizzle migrations.
 * 
 * This is useful when working with VS Code and direct SQL management.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config();

// Database connection configuration for the main postgres database
const pgConfig = {
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: 'postgres',
};

// Name of the database to create
const appDbName = process.env.PGDATABASE || 'wardrobe_app';

// App database connection configuration
const appDbConfig = {
  ...pgConfig,
  database: appDbName,
};

async function setupDatabase() {
  console.log('🔧 Setting up database using SQL schema...');
  
  try {
    // Step 1: Connect to postgres and create the database if it doesn't exist
    const pgClient = new Client(pgConfig);
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL server');
    
    // Check if our database already exists
    const checkDbResult = await pgClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [appDbName]
    );
    
    if (checkDbResult.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`🔹 Creating database: ${appDbName}`);
      await pgClient.query(`CREATE DATABASE ${appDbName}`);
      console.log(`✅ Database ${appDbName} created successfully`);
    } else {
      console.log(`🔹 Database ${appDbName} already exists`);
    }
    
    // Close the postgres admin connection
    await pgClient.end();
    
    // Step 2: Connect to the application database and run the schema script
    const appClient = new Client(appDbConfig);
    await appClient.connect();
    console.log(`✅ Connected to ${appDbName} database`);
    
    // Read and execute the schema SQL file
    console.log('🔹 Executing schema.sql script...');
    const schemaPath = resolve(process.cwd(), 'scripts', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    await appClient.query(schemaSql);
    
    console.log('✅ Schema executed successfully');
    
    // Close the app database connection
    await appClient.end();
    
    console.log('\n🎉 Database setup complete!');
    console.log('\nℹ️  You can now connect to your database using:');
    console.log(`
Host: ${pgConfig.host}
Port: ${pgConfig.port}
Database: ${appDbName}
Username: ${pgConfig.user}
Password: ${pgConfig.password}
    `);
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.error('\nPlease check that:');
    console.error('1. PostgreSQL is installed and running');
    console.error('2. The database credentials in your .env file are correct');
    console.error('3. The PostgreSQL user has permission to create databases and tables');
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(err => {
  console.error('Fatal error during setup:', err);
  process.exit(1);
});