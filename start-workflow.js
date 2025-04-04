/* Script to start a workflow */
import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Check if .workflow.json exists
  if (!fs.existsSync('.workflow.json')) {
    // Copy from .replit.workflow.json if it exists
    if (fs.existsSync('.replit.workflow.json')) {
      const content = fs.readFileSync('.replit.workflow.json', 'utf8');
      fs.writeFileSync('.workflow.json', content);
      console.log('Created .workflow.json from .replit.workflow.json');
    } else {
      // Create default workflow configuration
      const workflowConfig = {
        version: 1,
        runs: {
          "Start application": {
            run: "node start.js",
            persistent: true,
            description: "Start the Cher's Closet fashion application",
            defaultUrl: "/"
          }
        }
      };
      
      fs.writeFileSync(".workflow.json", JSON.stringify(workflowConfig, null, 2));
      console.log("Created default .workflow.json file");
    }
  }

  // Start the application directly
  console.log('Starting application...');
  execSync('node start.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting application:', error.message);
}