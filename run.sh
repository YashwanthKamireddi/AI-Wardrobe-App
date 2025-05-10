#!/bin/bash

# Export DATABASE_URL if needed (Replit should provide this automatically)
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Please ensure the database is properly provisioned."
  exit 1
fi

# Print database status
echo "Database URL is configured. Starting application..."

# Start the application
npm run dev