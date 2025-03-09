#!/bin/bash

# run-vscode.sh - Specialized startup script for VS Code/local environment
# Handles environment detection and proper setup for local development

echo -e "\033[0;34m[INFO]\033[0m Starting Cher's Closet in local environment..."

# Check for database connection
echo -e "\033[0;34m[INFO]\033[0m Verifying database connection..."
if npx tsx test-db.ts; then
  echo -e "\033[0;32m[SUCCESS]\033[0m Database connection verified."
else
  echo -e "\033[0;31m[WARNING]\033[0m Database connection issues detected. Some features may not work properly."
fi

# Start the application with VSCode-specific settings
echo -e "\033[0;34m[INFO]\033[0m Launching application on port 5000..."
NODE_ENV=development PORT=5000 HOST=0.0.0.0 npm run dev