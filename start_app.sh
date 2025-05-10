#!/bin/bash

# Export DATABASE_URL if needed (Replit should provide this automatically)
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Please ensure the database is properly provisioned."
  exit 1
fi

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
  echo "OPENAI_API_KEY is not set. AI features will not work."
  exit 1
fi

# Start the application
echo "Starting the application..."
npm run dev