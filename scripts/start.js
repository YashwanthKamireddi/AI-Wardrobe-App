/**
 * Unified startup script for Cher's Closet application
 * 
 * Features:
 * - Cross-environment compatibility (Replit, local development)
 * - Environment validation (API keys, database connection)
 * - Proper process handling and cleanup
 */

import { spawn } from 'child_process';
import fs from 'fs';

const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  debug: (message) => console.log(`[DEBUG] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`)
};

/**
 * Validates required environment variables
 */
function validateEnvironment() {
  // Check critical environment variables
  const requiredVars = [
    { name: 'DATABASE_URL', message: 'Database URL is required for database connection' },
    { name: 'OPENAI_API_KEY', message: 'OpenAI API key is required for AI features' }
  ];

  for (const { name, message } of requiredVars) {
    if (!process.env[name]) {
      throw new Error(`Missing ${name}: ${message}`);
    }
  }

  // Set default environment variables if not already set
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || '3000'; 
  process.env.HOST = process.env.HOST || '0.0.0.0';
}

/**
 * Starts the application server
 */
async function startServer() {
  logger.info('Starting Cher\'s Closet application server...');
  
  // Determine if we're in Replit
  const isReplit = process.env.REPL_ID !== undefined;
  logger.info(`Running in ${isReplit ? 'Replit' : 'local'} environment`);
  
  // Output environment info for debugging
  logger.debug(`Node environment: ${process.env.NODE_ENV}`);
  logger.debug(`Database connection: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
  logger.debug(`OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
  
  // Start the server
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  // Handle server process events
  serverProcess.on('error', (error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down server gracefully...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    logger.info('Received termination signal...');
    serverProcess.kill('SIGTERM');
  });
  
  return serverProcess;
}

/**
 * Main application entry point
 */
async function main() {
  try {
    validateEnvironment();
    await startServer();
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

// Start the application
main();