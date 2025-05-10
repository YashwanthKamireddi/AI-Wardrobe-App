import { spawn } from 'child_process';
import fs from 'fs';

console.log('Starting development server...');
console.log('Current working directory:', process.cwd());
console.log('Files in current directory:', fs.readdirSync('.'));

// Check environment variables
console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

try {
  console.log('Attempting to start server...');
  const server = spawn('tsx', ['server/index.ts'], { 
    stdio: 'inherit',
    env: process.env
  });

  server.on('error', (err) => {
    console.error('Failed to start server process:', err);
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    server.kill('SIGINT');
  });
} catch (error) {
  console.error('Error starting server:', error);
}