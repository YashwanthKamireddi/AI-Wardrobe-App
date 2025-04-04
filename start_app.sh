#!/bin/bash
pkill -f "node start.js" || true
node start.js > server.log 2>&1 &
echo $! > server.pid
echo "Started application with PID: $(cat server.pid)"
