#!/bin/bash

echo "Setting up the application for Replit..."

# Check and create .env file if needed
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  echo "# Database Configuration" > .env
  echo "DATABASE_URL=${DATABASE_URL}" >> .env
  echo "PGHOST=${PGHOST}" >> .env
  echo "PGUSER=${PGUSER}" >> .env
  echo "PGPASSWORD=${PGPASSWORD}" >> .env
  echo "PGDATABASE=${PGDATABASE}" >> .env
  echo "PGPORT=${PGPORT}" >> .env
  echo "SESSION_SECRET=replit_session_secret_$(date +%s)" >> .env
  echo "PORT=3000" >> .env
  echo "NODE_ENV=development" >> .env
  echo ".env file created successfully"
fi

# Update database schema
echo "Pushing database schema..."
npm run db:push

echo "Setup completed! Run ./start-app.sh to start the application."