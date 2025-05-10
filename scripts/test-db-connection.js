/**
 * Database Connection Test Script
 * 
 * This script attempts to connect to the PostgreSQL database using the
 * supplied environment variables to verify connectivity.
 */

require('dotenv').config();
const { Pool } = require('pg');

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}====================================${colors.reset}`);
console.log(`${colors.cyan}    Database Connection Test        ${colors.reset}`);
console.log(`${colors.cyan}====================================${colors.reset}`);

// Print environment variables (without passwords)
console.log(`\n${colors.cyan}Environment Variables:${colors.reset}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '[defined]' : '[not defined]'}`);
console.log(`PGHOST: ${process.env.PGHOST || '[not defined]'}`);
console.log(`PGPORT: ${process.env.PGPORT || '[not defined]'}`);
console.log(`PGUSER: ${process.env.PGUSER || '[not defined]'}`);
console.log(`PGDATABASE: ${process.env.PGDATABASE || '[not defined]'}`);
console.log(`PGPASSWORD: ${process.env.PGPASSWORD ? '[defined]' : '[not defined]'}`);

// Create connection configuration
const dbConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  connectionTimeoutMillis: 5000, // 5 seconds
};

// If DATABASE_URL is defined, use it instead of individual params
if (process.env.DATABASE_URL) {
  console.log(`\n${colors.yellow}Using DATABASE_URL for connection${colors.reset}`);
} else {
  console.log(`\n${colors.yellow}Using individual connection parameters${colors.reset}`);
}

// Create connection pool
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL }) 
  : new Pool(dbConfig);

// Test the connection
async function testConnection() {
  console.log(`\n${colors.cyan}Attempting to connect to database...${colors.reset}`);
  
  try {
    // Connect to the database
    const client = await pool.connect();
    console.log(`${colors.green}✓ Successfully connected to PostgreSQL!${colors.reset}`);
    
    // Try to query the database
    console.log(`\n${colors.cyan}Querying database version...${colors.reset}`);
    const result = await client.query('SELECT version()');
    console.log(`${colors.green}✓ Database query successful!${colors.reset}`);
    console.log(`Version: ${result.rows[0].version}`);
    
    // Check if the required tables exist
    console.log(`\n${colors.cyan}Checking for required tables...${colors.reset}`);
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log(`${colors.green}✓ Found ${existingTables.length} tables in the database${colors.reset}`);
    
    if (existingTables.length > 0) {
      console.log(`Tables: ${existingTables.join(', ')}`);
    }
    
    // Important tables to check
    const requiredTables = ['sessions', 'users', 'wardrobe_items', 'outfits', 'inspirations'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`${colors.yellow}⚠ Missing tables: ${missingTables.join(', ')}${colors.reset}`);
      console.log(`${colors.yellow}⚠ You may need to run 'npm run db:push' to create these tables${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ All required tables are present${colors.reset}`);
    }
    
    // Release the client back to the pool
    client.release();
    
    console.log(`\n${colors.green}✓ Database connection test completed successfully!${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}✗ Database connection failed:${colors.reset}`, err.message);
    
    if (err.message.includes('password authentication failed')) {
      console.log(`\n${colors.yellow}Possible solution:${colors.reset}`);
      console.log(`1. Check that PGPASSWORD in your .env file is correct`);
      console.log(`2. Verify PostgreSQL user permissions`);
    }
    
    if (err.message.includes('role "postgres" does not exist')) {
      console.log(`\n${colors.yellow}Possible solution:${colors.reset}`);
      console.log(`1. Create the postgres user: CREATE USER postgres WITH PASSWORD 'postgres';`);
      console.log(`2. Grant privileges: ALTER USER postgres WITH SUPERUSER;`);
    }
    
    if (err.message.includes('does not exist')) {
      console.log(`\n${colors.yellow}Possible solution:${colors.reset}`);
      console.log(`1. Create the database: CREATE DATABASE chers_closet;`);
      console.log(`2. Run the setup script: ./scripts/setup-postgres.ps1`);
    }
    
    if (err.message.includes('connect ECONNREFUSED')) {
      console.log(`\n${colors.yellow}Possible solution:${colors.reset}`);
      console.log(`1. Check if PostgreSQL is running`);
      console.log(`2. Verify the PGPORT (${process.env.PGPORT}) is correct`);
      console.log(`3. Make sure PostgreSQL is listening on the specified host and port`);
    }
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the test
testConnection();