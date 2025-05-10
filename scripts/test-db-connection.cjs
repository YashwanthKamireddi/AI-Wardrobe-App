/**
 * Direct Database Connection Test (CommonJS Version)
 */

// Load environment variables
require('dotenv').config();

// Import PostgreSQL client
const { Pool } = require('pg');

console.log('=== PostgreSQL Connection Test ===');
console.log('Testing connection with:');
console.log('- Host:', process.env.PGHOST || 'localhost');
console.log('- Port:', process.env.PGPORT || '5432');
console.log('- User:', process.env.PGUSER || 'postgres');
console.log('- Database:', process.env.PGDATABASE || 'chers_closet_db');

// Create a connection pool
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'chers_closet_db'
});

async function testConnection() {
  try {
    console.log('\nConnecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL Version:', result.rows[0].version);
    client.release();
    console.log('\n✅ Connection test successful!');
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    
    // Show helpful error message based on error type
    if (err.code === 'ECONNREFUSED') {
      console.error('\nPossible causes:');
      console.error('1. PostgreSQL service is not running');
      console.error('2. Wrong host or port in configuration');
      console.error('\nSolutions:');
      console.error('1. Start PostgreSQL service');
      console.error('2. Verify correct host and port in .env file');
    }
    
    if (err.code === '28P01') { // Password authentication failed
      console.error('\nAuthentication failed. Possible causes:');
      console.error('1. Wrong username or password');
      console.error('2. PostgreSQL user permissions issue');
      console.error('\nSolutions:');
      console.error('1. Check PGUSER and PGPASSWORD in .env file');
      console.error('2. Run these commands in psql:');
      console.error('   CREATE ROLE postgres WITH LOGIN PASSWORD \'your_password\';');
      console.error('   ALTER ROLE postgres WITH SUPERUSER;');
    }
    
    if (err.code === '3D000') { // Database does not exist
      console.error('\nThe database does not exist. Create it with:');
      console.error('1. Run psql to connect to PostgreSQL');
      console.error('2. Execute: CREATE DATABASE chers_closet_db;');
    }
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the test
testConnection();