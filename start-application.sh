#!/bin/bash

# start-application.sh
# Universal startup script for Cher's Closet app that works in both environments

# Detect environment
if [ -n "$REPL_ID" ]; then
  echo "🚀 Starting Cher's Closet in Replit environment"
  # Use run-replit.sh for Replit-specific configuration
  bash run-replit.sh
else
  echo "🚀 Starting Cher's Closet in VSCode/local environment"
  # Use run-vscode.sh for VSCode/local specific configuration
  bash run-vscode.sh
fi