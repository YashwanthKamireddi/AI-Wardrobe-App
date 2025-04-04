#!/bin/bash
# Helper script to run the demo user creation

# Copy workflow file
cp .workflow-demo.json .workflow.json

# Run the create demo user workflow
echo "Creating demo user..."
node scripts/create-demo-user.js

echo ""
echo "Demo user created successfully!"
echo "Login credentials:"
echo "  Username: demouser"
echo "  Password: demopassword"
echo ""
echo "You can now start the application with 'node start.js'"