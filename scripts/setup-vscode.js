/**
 * VS Code Setup Script
 * 
 * This script prepares the project for VS Code development
 * by setting up the necessary configuration files.
 */

import { existsSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupVSCode() {
  console.log('🔧 Setting up project for VS Code development...');

  // Ensure .vscode directory exists
  const vscodeDirPath = join(process.cwd(), '.vscode');
  if (!existsSync(vscodeDirPath)) {
    console.log('📁 Creating .vscode directory');
    mkdirSync(vscodeDirPath, { recursive: true });
  }

  // Create .env file if it doesn't exist
  const envPath = join(process.cwd(), '.env');
  const envExamplePath = join(process.cwd(), '.env.example');
  
  if (!existsSync(envPath) && existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from example');
    copyFileSync(envExamplePath, envPath);
  }

  // Check if PostgreSQL is installed
  try {
    console.log('🔍 Checking for PostgreSQL installation...');
    await execAsync('psql --version');
    console.log('✅ PostgreSQL is installed');
    
    // Run the database setup script
    console.log('🔄 Running database setup script...');
    await execAsync('node scripts/setup-local-db.js');
  } catch (error) {
    console.log('⚠️ PostgreSQL might not be installed or in PATH');
    console.log('Please install PostgreSQL and ensure it\'s in your PATH before running the database setup script');
  }

  console.log('\n🎉 VS Code setup complete!');
  console.log('\nNext steps:');
  console.log('1. Open the project in VS Code');
  console.log('2. Make sure your .env file has the correct database credentials');
  console.log('3. Install recommended VS Code extensions');
  console.log('4. Start the application using the VS Code debugger or by running `npm run dev`');
}

// Run the setup
setupVSCode().catch(err => {
  console.error('❌ VS Code setup error:', err);
  process.exit(1);
});