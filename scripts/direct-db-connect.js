/**
 * Direct Database Connection Test
 * 
 * This script bypasses all the middleware and tries to connect directly to 
 * the PostgreSQL database using environment variables loaded directly.
 */

// Directly set environment variables if needed
process.env.PGHOST = 'localhost';
process.env.PGPORT = '3000';
process.env.PGUSER = 'postgres';
process.env.PGPASSWORD = 'postgres';
process.env.PGDATABASE = 'chers_closet';

// Try to connect using pg
const { Pool } = require('pg');

console.log('Attempting to connect to PostgreSQL with these settings:');
console.log('- Host:', process.env.PGHOST);
console.log('- Port:', process.env.PGPORT);
console.log('- User:', process.env.PGUSER);
console.log('- Database:', process.env.PGDATABASE);

// Create a connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  connectionTimeoutMillis: 5000 // 5 seconds timeout
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    console.log('Running test query...');
    const result = await client.query('SELECT version()');
    console.log('Query successful!');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // List tables
    console.log('Listing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('Tables found:', tableNames.length);
    
    if (tableNames.length > 0) {
      console.log('Table names:');
      tableNames.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
      });
    } else {
      console.log('No tables found. You may need to run migrations.');
    }
    
    client.release();
    console.log('Connection test completed successfully!');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    
    if (err.message.includes('connect ECONNREFUSED')) {
      console.error(
        'The connection was refused. This usually means either:\n' +
        '1. PostgreSQL is not running\n' +
        '2. PostgreSQL is not listening on the specified host/port\n' +
        '3. A firewall is blocking the connection'
      );
    }
    
    if (err.message.includes('password authentication failed')) {
      console.error(
        'Invalid username or password. Check your PGUSER and PGPASSWORD values.'
      );
    }
    
    if (err.message.includes('database "chers_closet" does not exist')) {
      console.error(
        'The database does not exist. Create it with:\n' +
        'psql -U postgres -c "CREATE DATABASE chers_closet;"'
      );
    }
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();