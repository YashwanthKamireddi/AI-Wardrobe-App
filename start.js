#!/usr/bin/env node

/**
 * Start script for Cher's Closet application
 * This file is required by .replit configuration
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting Cher\'s Closet application...');

// Start the development server
const child = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  child.kill('SIGTERM');
});