/* Create a .workflow.json file for Replit */
import { writeFileSync } from 'fs';

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

writeFileSync(".workflow.json", JSON.stringify(workflowConfig, null, 2));
console.log("Created .workflow.json file successfully!");