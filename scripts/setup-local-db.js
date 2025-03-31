/**
 * Local PostgreSQL Database Setup Script
 * 
 * This script helps set up a local PostgreSQL database for development in VS Code.
 * It creates the necessary schema based on the application's requirements.
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
config();

const execAsync = promisify(exec);

// Database connection configuration
const dbConfig = {
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  // Connect to postgres by default to create the app database
  database: 'postgres',
};

// Name of the database to create
const appDbName = process.env.PGDATABASE || 'wardrobe_app';

async function setupDatabase() {
  console.log('🔧 Setting up local PostgreSQL database for VS Code development...');
  
  // Create a client to connect to the default postgres database
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');
    
    // Check if our database already exists
    const checkDbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [appDbName]
    );
    
    if (checkDbResult.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`🔹 Creating database: ${appDbName}`);
      await client.query(`CREATE DATABASE ${appDbName}`);
      console.log(`✅ Database ${appDbName} created successfully`);
    } else {
      console.log(`🔹 Database ${appDbName} already exists`);
    }
    
    // Close the admin connection
    await client.end();
    
    // Now run drizzle migration to set up schema
    console.log('🔹 Running Drizzle schema push to create tables...');
    try {
      await execAsync('npm run db:push');
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.error('❌ Error running Drizzle migration:', error.message);
      console.log('🔸 You may need to run "npm run db:push" manually after checking your database connection');
    }
    
    console.log('\n🎉 Local database setup complete!');
    console.log('\nℹ️  You can now update your .env file with these settings:');
    console.log(`
DATABASE_URL=postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${appDbName}
PGHOST=${dbConfig.host}
PGUSER=${dbConfig.user}
PGPASSWORD=${dbConfig.password}
PGDATABASE=${appDbName}
PGPORT=${dbConfig.port}
    `);
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    console.error('\nPlease check that:');
    console.error('1. PostgreSQL is installed and running');
    console.error('2. The username and password in your .env file are correct');
    console.error('3. The PostgreSQL user has permission to create databases');
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(err => {
  console.error('Fatal error during setup:', err);
  process.exit(1);
});