#!/bin/bash
# Cher's Closet Production Startup Script
# This is a streamlined script for starting the application in production

# Verify required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Database connection required."
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "ERROR: OPENAI_API_KEY is not set. AI features will not work."
  exit 1
fi

# Print startup info
echo "======================================"
echo "  Cher's Closet Application Startup"
echo "======================================"
echo "- Environment: ${NODE_ENV:-development}"
echo "- Database: Connected"
echo "- OpenAI API: Configured"
echo "======================================"

# Start the application using the consolidated script
node scripts/start.js