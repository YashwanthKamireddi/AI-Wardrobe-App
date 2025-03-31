#!/bin/bash

# Exit on error
set -e

echo "Starting application..."
npm run dev &
PID=$!

echo "Application started with PID: $PID"
echo "You can now access the app at http://localhost:3000"

# Keep script running so the application continues to run
wait $PID