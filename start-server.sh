#!/bin/bash

# Script to start the server component in Replit
# This script is specifically designed for Replit's workflow system

echo "🚀 Starting server in Replit environment..."

# Set environment variables for Replit
export NODE_ENV=development
export HOST=0.0.0.0
export PORT=3000

# Start the server using tsx for TypeScript execution
exec npx tsx server/index.ts