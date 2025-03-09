#!/bin/bash

# This script is designed to start the application in the Replit environment
# It verifies database connectivity first, then runs the server

echo "🚀 Starting application in Replit environment..."

# Verify database connection
echo "🔍 Testing database connection..."
npx tsx test-db.ts
DB_STATUS=$?

if [ $DB_STATUS -eq 0 ]; then
  echo "✅ Database connection successful"
else
  echo "⚠️ Database connection test failed, but continuing anyway"
fi

# Start the server
echo "🌐 Starting server..."
exec npx tsx server/index.ts