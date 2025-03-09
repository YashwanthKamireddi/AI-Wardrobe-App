#!/bin/bash

# start-server.sh - Server-only startup script for Replit workflows
# This script starts just the server component

echo "Starting server on port 3000..."
NODE_ENV=development PORT=3000 HOST=0.0.0.0 NODE_OPTIONS="--max-old-space-size=460" node server/index.js