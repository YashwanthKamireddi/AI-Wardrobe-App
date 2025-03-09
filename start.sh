#!/bin/bash

# start.sh - Universal startup script for Cher's Closet app
# Works in both Replit and VSCode environments

# Set colors for console output
INFO="\033[0;34m"
SUCCESS="\033[0;32m"
WARNING="\033[0;33m"
ERROR="\033[0;31m"
RESET="\033[0m"

# Function to print formatted messages
print_message() {
  local type=$1
  local message=$2
  echo -e "${type}${message}${RESET}"
}

# Detect environment
if [ -n "$REPL_ID" ]; then
  ENV="replit"
  PORT=3000
  print_message "$INFO" "[INFO] Running in Replit environment"
  # For Replit, limit memory usage to prevent OOM issues
  MEMORY_OPTION="--max-old-space-size=460"
else
  ENV="local"
  PORT=5000
  print_message "$INFO" "[INFO] Running in local environment"
  MEMORY_OPTION=""
fi

# Verify database connection
print_message "$INFO" "[INFO] Verifying database connection..."
if npx tsx test-db.ts; then
  print_message "$SUCCESS" "[SUCCESS] Database connection verified."
else
  print_message "$WARNING" "[WARNING] Database connection issues detected. Some features may not work properly."
fi

# Start the application with environment-specific settings
print_message "$INFO" "[INFO] Launching application on port $PORT..."
NODE_ENV=development PORT=$PORT HOST=0.0.0.0 NODE_OPTIONS="$MEMORY_OPTION" npm run dev