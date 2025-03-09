#!/usr/bin/env node

/**
 * Cross-environment startup script for both Replit and VSCode
 * This script determines the correct startup method based on the environment
 */

import { spawn, exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __filename equivalent in ESM
const __filename = fileURLToPath(import.meta.url);

// Check if we're in Replit or another environment
const isReplit = process.env.REPL_ID || process.env.REPLIT_ENVIRONMENT;
const isProduction = process.env.NODE_ENV === 'production';

// Log message with timestamp
function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
}

// Handle errors 
function handleError(error) {
  console.error('Error starting application:', error);
  process.exit(1);
}

// Start application with appropriate command
async function startApp() {
  try {
    if (isProduction) {
      log('Starting in production mode...');
      // Run the built application
      runCommand('node', ['dist/index.js']);
    } else {
      // Development mode
      if (isReplit) {
        log('Starting in Replit development environment...');
        // Use tsx directly on Replit to avoid extra npm run command
        runCommand('npx', ['tsx', 'server/index.ts']);
      } else {
        log('Starting in local development environment...');
        // For local development, use npm script
        runCommand('npm', ['run', 'dev']);
      }
    }
  } catch (error) {
    handleError(error);
  }
}

// Execute command and handle output
function runCommand(cmd, args) {
  log(`Running command: ${cmd} ${args.join(' ')}`);
  
  const childProcess = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true
  });
  
  childProcess.on('error', (error) => {
    console.error(`Command execution error: ${error.message}`);
    process.exit(1);
  });
  
  childProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`Command exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  process.on('SIGINT', () => {
    log('Received SIGINT. Shutting down...');
    childProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM. Shutting down...');
    childProcess.kill('SIGTERM');
  });
}

// Check database connectivity before starting
function checkDatabase() {
  log('Checking database connectivity...');
  
  try {
    // Run test-db.ts using tsx to test database connection
    const testProcess = exec('npx tsx test-db.ts');
    
    testProcess.stdout.on('data', (data) => {
      log(`Database test output: ${data}`);
    });
    
    testProcess.stderr.on('data', (data) => {
      console.warn(`Database test error: ${data}`);
    });
    
    testProcess.on('close', (code) => {
      if (code !== 0) {
        console.warn(`Database connection test failed with code ${code}, but continuing anyway`);
      } else {
        log('Database connection verified successfully');
      }
      
      // Start the application regardless of database status
      startApp();
    });
  } catch (err) {
    console.warn('Error checking database:', err);
    // Continue anyway
    startApp();
  }
}

// Make the script executable
function makeExecutable() {
  if (process.platform !== 'win32') { // Not needed on Windows
    try {
      fs.chmodSync(__filename, '755');
    } catch (err) {
      // Ignore errors changing permissions
    }
  }
}

// Initialize
function init() {
  makeExecutable();
  log('Application startup initiated');
  checkDatabase();
}

// Start the process
init();