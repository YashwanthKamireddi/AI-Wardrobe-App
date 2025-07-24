// Quick Windows fix script
const { spawn } = require('child_process');

console.log('🔧 Windows Fix: Starting Cher\'s Closet with forced IPv4...');

// Force environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.HOST = '127.0.0.1';
process.env.SESSION_SECRET = 'chers-closet-secret-key';

console.log(`✅ Environment set:`);
console.log(`   HOST: ${process.env.HOST}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log('');

// Start the server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});