#!/bin/bash

# Run Cher's Closet application locally in VS Code
echo "Starting Cher's Closet application locally..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Warning: .env file not found. Creating a sample .env file..."
  cat > .env << EOF
# Sample .env file - Replace with your actual values
DATABASE_URL=postgres://username:password@localhost:5432/cherscloset
OPENAI_API_KEY=your_openai_api_key
EOF
  echo "Please edit the .env file with your actual database credentials and API keys."
  exit 1
fi

# Check if postgresql service is running (platform dependent)
if command -v pg_isready &> /dev/null; then
  if ! pg_isready; then
    echo "PostgreSQL database is not running. Please start your database service."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      echo "  For macOS: brew services start postgresql"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
      echo "  For Linux: sudo systemctl start postgresql"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
      echo "  For Windows: Start PostgreSQL from Services or use pg_ctl"
    fi
    exit 1
  fi
fi

# Start the application
echo "Starting Node.js application..."
node start.js