#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates that all required environment variables are present
 * and tests the database connection to ensure the application can start properly.
 * 
 * Usage: 
 *   node scripts/test-env.js
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name from the current module's URL
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Setup
const result = config({ path: resolve(__dirname, '../.env') });

if (result.error) {
  console.error('❌ Failed to load .env file. Make sure it exists in the project root.');
  console.error(result.error);
  console.log('\n💡 Tip: Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

// Required environment variables
const requiredVars = [
  'DATABASE_URL',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'PGHOST',
  'SESSION_SECRET'
];

// Optional environment variables with defaults
const optionalVars = {
  'DB_POOL_SIZE': '10',
  'DB_IDLE_TIMEOUT': '30000',
  'DB_CONNECTION_TIMEOUT': '10000',
  'DB_MAX_USES': '7500',
  'NODE_ENV': 'development'
};

// Check required variables
console.log('🔍 Checking required environment variables...');
const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('\n💡 Tip: Make sure these variables are defined in your .env file.');
  process.exit(1);
}

console.log('✅ All required environment variables are present.');

// Check optional variables
console.log('\n🔍 Checking optional environment variables...');
for (const [varName, defaultValue] of Object.entries(optionalVars)) {
  if (!process.env[varName]) {
    console.log(`ℹ️ Optional variable ${varName} is not set. Using default: ${defaultValue}`);
    process.env[varName] = defaultValue;
  }
}

// Test database connection
console.log('\n🔍 Testing database connection...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_SIZE),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT)
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    console.log(`✅ Successfully connected to the database at ${process.env.PGHOST}.`);
    console.log(`   Current database time: ${result.rows[0].current_time}`);
    
    // Test sessions table existence
    try {
      const tablesResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sessions'
        );
      `);
      
      if (tablesResult.rows[0].exists) {
        console.log('✅ Sessions table exists.');
      } else {
        console.log('❌ Sessions table does not exist. Run "npm run db:push" to create it.');
      }
    } catch (error) {
      console.error('❌ Error checking for sessions table:', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    console.log('\n💡 Tip: Check your database credentials and make sure the database server is running.');
    return false;
  } finally {
    // Close pool
    await pool.end();
  }
}

// Check for .vscode directory
console.log('\n🔍 Checking VS Code configuration...');
const vscodePath = resolve(__dirname, '../.vscode');

if (fs.existsSync(vscodePath)) {
  console.log('✅ VS Code configuration directory exists.');
  
  // Check for important VS Code files
  const requiredVSCodeFiles = ['settings.json', 'launch.json'];
  const missingVSCodeFiles = [];
  
  for (const file of requiredVSCodeFiles) {
    if (!fs.existsSync(resolve(vscodePath, file))) {
      missingVSCodeFiles.push(file);
    }
  }
  
  if (missingVSCodeFiles.length > 0) {
    console.log(`ℹ️ Some VS Code configuration files are missing: ${missingVSCodeFiles.join(', ')}`);
  } else {
    console.log('✅ All important VS Code configuration files are present.');
  }
} else {
  console.log('ℹ️ VS Code configuration directory not found. VS Code-specific features may not work properly.');
}

// Summarize environment
console.log('\n📊 Environment Summary:');
console.log(`   Node Environment: ${process.env.NODE_ENV}`);
console.log(`   Database Host: ${process.env.PGHOST}`);
console.log(`   Database Name: ${process.env.PGDATABASE}`);
console.log(`   Database User: ${process.env.PGUSER}`);
console.log(`   Session Secret: ${process.env.SESSION_SECRET ? '**********' : 'Not set'}`);

// Run database test
const dbResult = await testConnection();

// Final summary
console.log('\n🏁 Environment Check Summary:');
if (missingVars.length === 0 && dbResult) {
  console.log('✅ Your environment is correctly configured and ready for development!');
} else {
  console.log('⚠️ Your environment has some issues that need to be resolved before development.');
}

console.log('\n📚 For more information on setting up your development environment:');
console.log('   - See the README.md file for general setup instructions');
console.log('   - Check docs/vs-code-setup.md for VS Code specific setup');
console.log('   - Review docs/database-sync.md for database configuration details');