#!/bin/bash

# Universal application startup script for both Replit and VSCode
# This script detects the environment and runs the appropriate startup script

# Detect environment
if [ -n "$REPL_ID" ] || [ -n "$REPLIT_ENVIRONMENT" ]; then
    # Replit environment detected
    echo "🚀 Replit environment detected"
    
    # Set environment variables
    export NODE_ENV=development
    export HOST=0.0.0.0
    export PORT=3000
    
    # Start server directly using the start-server.sh script
    exec ./start-server.sh
else
    # VSCode/local environment detected
    echo "🖥️ VSCode/local environment detected"
    
    # Use local run script
    exec ./run-vscode.sh
fi