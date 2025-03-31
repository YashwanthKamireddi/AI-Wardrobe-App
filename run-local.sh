#!/bin/bash
# Script to start the application in local development mode

# Check if .env file exists, if not copy the example
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please edit the .env file with your database credentials."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the application
echo "Starting the application in development mode..."
npm run dev