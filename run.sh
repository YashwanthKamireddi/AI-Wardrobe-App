#!/bin/bash

# Make the script exit on any error
set -e

# Log helper function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Ensure we have the latest environment variables
if [ -f .env ]; then
  source .env
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  log "⚠️ WARNING: OPENAI_API_KEY is not set. AI features will not work properly."
  log "Please set the OPENAI_API_KEY environment variable."
fi

# Check if database URL is set
if [ -z "$DATABASE_URL" ]; then
  log "⚠️ ERROR: DATABASE_URL is not set. The application requires a PostgreSQL database."
  log "Please set up a database using the create_postgresql_database_tool."
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  log "📦 Installing dependencies..."
  npm install
fi

# Run database push to ensure schema is up to date
log "🔄 Ensuring database schema is up to date..."
npm run db:push

# Start the development server
log "🚀 Starting the application..."
npm run dev