/**
 * Environment Debug Script
 * 
 * This script helps diagnose environment variable loading issues
 * by checking the existence of the .env file and validating
 * critical environment variables needed for database connection.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}====================================${colors.reset}`);
console.log(`${colors.cyan}     Environment Debug Tool         ${colors.reset}`);
console.log(`${colors.cyan}====================================${colors.reset}`);

// Function to check if .env file exists
function checkEnvFile() {
  const envPath = path.resolve('.env');
  
  if (fs.existsSync(envPath)) {
    console.log(`${colors.green}✓ .env file found at:${colors.reset} ${envPath}`);
    
    try {
      // Try to read the file to see if it's accessible
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n').filter(line => line.trim() !== '');
      
      console.log(`${colors.green}✓ .env file is readable and contains ${lines.length} lines${colors.reset}`);
      
      // Load environment variables from .env file
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        console.log(`${colors.red}✗ Error parsing .env file: ${result.error.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ .env file parsed successfully${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Error reading .env file: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ .env file NOT found at: ${envPath}${colors.reset}`);
    console.log(`${colors.yellow}  Please create this file with your database connection details${colors.reset}`);
  }
}

// Function to check if critical environment variables are set
function checkEnvironmentVariables() {
  console.log(`\n${colors.cyan}Critical Environment Variables:${colors.reset}`);
  
  const requiredVars = [
    'DATABASE_URL',
    'PGHOST',
    'PGUSER',
    'PGDATABASE',
    'PGPASSWORD',
    'PGPORT',
    'SESSION_SECRET'
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      // For security, don't show actual values
      console.log(`${colors.green}✓ ${varName}:${colors.reset} [defined]`);
    } else {
      console.log(`${colors.red}✗ ${varName}:${colors.reset} [not defined]`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Function to attempt to parse the database connection string
function checkDatabaseUrl() {
  console.log(`\n${colors.cyan}Database URL Analysis:${colors.reset}`);
  
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log(`${colors.red}✗ DATABASE_URL is not defined${colors.reset}`);
    return;
  }
  
  try {
    // Simple validation of PostgreSQL URL format
    if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
      console.log(`${colors.red}✗ DATABASE_URL does not start with "postgres://" or "postgresql://"${colors.reset}`);
      console.log(`${colors.yellow}  Current value starts with: ${dbUrl.substring(0, 10)}...${colors.reset}`);
      return;
    }
    
    // Try to parse components (without showing sensitive data)
    const hasUsername = dbUrl.includes('@');
    const hasPassword = dbUrl.includes(':') && dbUrl.includes('@');
    const hasHost = dbUrl.includes('@') && dbUrl.split('@')[1].includes(':');
    const hasPort = dbUrl.includes(':') && dbUrl.split('@')[1].includes(':');
    const hasDatabase = dbUrl.includes('/') && dbUrl.split('/').length > 3;
    
    console.log(`${colors.cyan}URL Structure:${colors.reset}`);
    console.log(`${hasUsername ? colors.green + '✓' : colors.red + '✗'} Username${colors.reset}`);
    console.log(`${hasPassword ? colors.green + '✓' : colors.red + '✗'} Password${colors.reset}`);
    console.log(`${hasHost ? colors.green + '✓' : colors.red + '✗'} Host${colors.reset}`);
    console.log(`${hasPort ? colors.green + '✓' : colors.red + '✗'} Port${colors.reset}`);
    console.log(`${hasDatabase ? colors.green + '✓' : colors.red + '✗'} Database Name${colors.reset}`);
    
    if (!(hasUsername && hasPassword && hasHost && hasPort && hasDatabase)) {
      console.log(`${colors.red}✗ DATABASE_URL appears to be incomplete or malformed${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ DATABASE_URL appears to be properly formatted${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error analyzing DATABASE_URL: ${error.message}${colors.reset}`);
  }
}

// Function to suggest fixes based on diagnostic results
function suggestFixes(allVarsPresent) {
  console.log(`\n${colors.cyan}====================================${colors.reset}`);
  console.log(`${colors.cyan}     Recommendations                ${colors.reset}`);
  console.log(`${colors.cyan}====================================${colors.reset}`);
  
  if (!allVarsPresent) {
    console.log(`${colors.yellow}1. Make sure your .env file contains ALL required variables:${colors.reset}`);
    console.log(`   DATABASE_URL=postgres://postgres:postgres@localhost:5432/chers_closet`);
    console.log(`   PGHOST=localhost`);
    console.log(`   PGPORT=5432`);
    console.log(`   PGUSER=postgres`);
    console.log(`   PGPASSWORD=postgres`);
    console.log(`   PGDATABASE=chers_closet`);
    console.log(`   SESSION_SECRET=your_session_secret_here`);
    
    console.log(`\n${colors.yellow}2. Make sure PostgreSQL is installed and running:${colors.reset}`);
    console.log(`   - Run 'services.msc' on Windows to check if PostgreSQL service is running`);
    console.log(`   - Install PostgreSQL if not already installed`);
    
    console.log(`\n${colors.yellow}3. Create the database if it doesn't exist:${colors.reset}`);
    console.log(`   - Run the setup script: ./scripts/setup-postgres.ps1`);
    console.log(`   - Or manually: psql -U postgres -c "CREATE DATABASE chers_closet;"`);
    
    console.log(`\n${colors.yellow}4. Try running the app with environment variables directly:${colors.reset}`);
    console.log(`   $env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/chers_closet"; $env:PGHOST="localhost"; $env:PGPORT="5432"; $env:PGUSER="postgres"; $env:PGPASSWORD="postgres"; $env:PGDATABASE="chers_closet"; npm run dev`);
  } else {
    console.log(`${colors.green}All critical environment variables are defined!${colors.reset}`);
    console.log(`\n${colors.yellow}If you're still having issues:${colors.reset}`);
    console.log(`1. Check if PostgreSQL is running and accessible`);
    console.log(`2. Verify the database 'chers_closet' exists`);
    console.log(`3. Make sure the PostgreSQL user has proper permissions`);
    console.log(`4. Try connecting manually: psql -U postgres -d chers_closet`);
  }
}

// Run diagnostics
checkEnvFile();
const allVarsPresent = checkEnvironmentVariables();
checkDatabaseUrl();
suggestFixes(allVarsPresent);

console.log(`\n${colors.cyan}====================================${colors.reset}`);