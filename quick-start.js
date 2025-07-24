#!/usr/bin/env node

// Quick start script that bypasses Windows networking issues
const express = require('express');
const { spawn } = require('child_process');

console.log('🚀 Quick Start: Testing port availability...');

// Test if port 3000 is available
const testServer = express();
const server = testServer.listen(3000, () => {
  console.log('✅ Port 3000 is available');
  server.close();
  
  console.log('🔧 Starting Cher\'s Closet with Windows compatibility...');
  
  // Set environment variables
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  process.env.HOST = '127.0.0.1';
  process.env.SESSION_SECRET = 'chers-closet-secret';
  
  // Start the main application
  const app = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  app.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n❌ Server exited with code ${code}`);
      console.log('Try running: npm install && node quick-start.js');
    }
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    app.kill();
    process.exit(0);
  });
  
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('❌ Port 3000 is already in use.');
    console.log('Kill the existing process and try again:');
    console.log('  netstat -ano | findstr :3000');
    console.log('  taskkill /PID <PID> /F');
  } else {
    console.log('❌ Port test failed:', err.message);
  }
  process.exit(1);
});