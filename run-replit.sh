#!/bin/bash

# run-replit.sh - Specialized startup script for Replit environment
# Handles environment detection and proper setup for Replit

echo -e "\033[0;34m[INFO]\033[0m Starting Cher's Closet in Replit environment..."

# Check for database connection
echo -e "\033[0;34m[INFO]\033[0m Verifying database connection..."
if npx tsx test-db.ts; then
  echo -e "\033[0;32m[SUCCESS]\033[0m Database connection verified."
else
  echo -e "\033[0;31m[WARNING]\033[0m Database connection issues detected. Some features may not work properly."
fi

# Start the application with Replit-specific settings
echo -e "\033[0;34m[INFO]\033[0m Launching application on port 3000..."
NODE_ENV=development PORT=3000 HOST=0.0.0.0 NODE_OPTIONS="--max-old-space-size=460" npm run dev