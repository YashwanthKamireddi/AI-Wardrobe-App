// VS Code startup script for Cher's Closet
import { spawn } from 'child_process';
import path from 'path';

console.log('Starting Cher\'s Closet for VS Code development...');

// Set environment variables for local development
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.HOST = 'localhost';

// Start the development server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env },
  shell: true
});

server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
});