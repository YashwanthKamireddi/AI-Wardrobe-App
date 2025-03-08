import { resolve } from 'path';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';

const MIGRATION_LOG_DIR = resolve(process.cwd(), 'logs');
const MIGRATION_LOG_FILE = resolve(MIGRATION_LOG_DIR, 'migrations.log');

// Ensure logs directory exists
if (!existsSync(MIGRATION_LOG_DIR)) {
  mkdirSync(MIGRATION_LOG_DIR, { recursive: true });
}

// Create log file if it doesn't exist
if (!existsSync(MIGRATION_LOG_FILE)) {
  writeFileSync(MIGRATION_LOG_FILE, '# Database Migration Logs\n\n');
}

export function logMigration(action: string, details: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${action}: ${details}\n`;
  
  appendFileSync(MIGRATION_LOG_FILE, logEntry);
  console.log(`Migration logged: ${action}`);
}

export function logMigrationError(error: Error) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ERROR: ${error.message}\n${error.stack}\n`;
  
  appendFileSync(MIGRATION_LOG_FILE, logEntry);
  console.error(`Migration error logged: ${error.message}`);
}
