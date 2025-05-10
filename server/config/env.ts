import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the root directory (where .env should be located)
function findRootDir() {
  // Start with the directory of this file
  let currentDir = __dirname;
  
  // Keep going up until we find the .env file or reach the root
  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, '.env'))) {
      return currentDir;
    }
    
    // Go up one directory
    const parentDir = path.dirname(currentDir);
    
    // If we've reached the root directory
    if (parentDir === currentDir) {
      break;
    }
    
    currentDir = parentDir;
  }
  
  // If we've reached here, we couldn't find the .env file up the directory tree
  // Use the current working directory as a fallback
  return process.cwd();
}

// Load .env file
const rootDir = findRootDir();
const envPath = path.join(rootDir, '.env');

console.log(`Loading environment from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

// Validate and log environment status
export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'PGHOST',
    'PGUSER',
    'PGDATABASE',
    'PGPASSWORD',
    'SESSION_SECRET'
  ];
  
  const missing = requiredVars.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error(`❌ Check that your .env file exists and contains these variables.`);
    return false;
  }
  
  console.log('✅ Environment variables loaded successfully');
  return true;
}

// This helps with debugging environment issues
export function printEnvironmentDebug() {
  console.log('=== Environment Debug Info ===');
  console.log('Current directory:', process.cwd());
  console.log('Root directory:', rootDir);
  console.log('Env path:', envPath);
  console.log('Env file exists:', fs.existsSync(envPath));
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
  console.log('PGHOST defined:', !!process.env.PGHOST);
  console.log('PGUSER defined:', !!process.env.PGUSER);
  console.log('PGDATABASE defined:', !!process.env.PGDATABASE);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('=============================');
}

// Print debug info during initialization
printEnvironmentDebug();