#!/bin/bash

# This script sets up the application for Replit environment
# It prepares the database and creates a Replit Deployments compatible setup

echo "🔧 Setting up Replit environment..."

# Verify the database connection
echo "🔍 Testing database connection..."
npx tsx test-db.ts
DB_STATUS=$?
if [ $DB_STATUS -ne 0 ]; then
  echo "⚠️ Database connection test failed. Some features may not work correctly."
else
  echo "✅ Database connection verified"
fi

# Create the public folder for static assets if it doesn't exist
mkdir -p server/public

# Create a .env file for local environment variables if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file for local development..."
  cat > .env << EOL
# Environment Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
EOL
fi

# Print setup instructions
echo "✅ Setup complete!"
echo ""
echo "To run the application in Replit:"
echo "1. Click on the Run button, or"
echo "2. Type 'node start' in the Shell"
echo ""
echo "For deployment:"
echo "1. Use the Deploy button in the Replit interface"
echo "2. The application will be deployed using port 3000"
echo ""
echo "For local development (VSCode):"
echo "1. Run: ./run-vscode.sh"

# Ask if user wants to start the server now
read -p "Do you want to start the server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Starting server..."
  ./start-server.sh
fi