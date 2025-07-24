// Entry point for Replit - starts the development server
import { spawn } from 'child_process';

console.log('Starting Cher\'s Closet application...');

// Start the development server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env }
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