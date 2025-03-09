#!/bin/bash

# This script is designed to start the application in VSCode/local environment
# It uses npm scripts for better compatibility with package.json configurations

echo "🚀 Starting application in VSCode/local environment..."

# Verify database connection
echo "🔍 Testing database connection..."
npm run db:push
DB_STATUS=$?

if [ $DB_STATUS -eq 0 ]; then
  echo "✅ Database and schema setup successful"
else
  echo "⚠️ Database setup encountered issues, check connection settings"
fi

# Start the development server with npm
echo "🌐 Starting development server..."
exec npm run dev