/**
 * Cross-environment startup script for both Replit and VSCode
 * This script determines the correct startup method based on the environment
 */

import { spawn } from 'child_process';
import path from 'path';

function log(message) {
  console.log(`[STARTER] ${message}`);
}

function handleError(error) {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
}

async function startApp() {
  try {
    log('Starting Cher\'s Closet application...');
    
    // Set environment variables
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';
    process.env.HOST = '0.0.0.0';
    
    // Determine if we're in Replit
    const isReplit = process.env.REPL_ID !== undefined;
    log(`Running in ${isReplit ? 'Replit' : 'local'} environment`);
    
    // Start the server using tsx directly
    const serverProcess = runCommand('npx', ['tsx', 'server/index.ts']);
    
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    serverProcess.on('close', (code) => {
      if (code !== 0) {
        log(`Server process exited with code ${code}`);
        process.exit(code);
      }
    });
    
    // Keep the main process running
    process.on('SIGINT', () => {
      log('Shutting down server...');
      serverProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    handleError(error);
  }
}

function runCommand(cmd, args) {
  return spawn(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });
}

// Start the application
startApp().catch(handleError);