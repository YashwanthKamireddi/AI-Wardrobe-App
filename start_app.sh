#!/bin/bash
# Kill any existing process
pkill -f "node start.js" || true
pkill -f "tsx server/index.ts" || true

# Start with more verbose logging
echo "[$(date)] Starting application..." > server.log
NODE_DEBUG=module node start.js >> server.log 2>&1 &
echo $! > server.pid
echo "Started application with PID: $(cat server.pid)"

# Wait a moment to check if the process is still alive
sleep 2
if ps -p $(cat server.pid) > /dev/null; then
  echo "Process is running"
else
  echo "Process failed to start, check server.log for details"
fi
