/**
 * Database Configuration
 * 
 * This module handles database connection setup, pooling, and health monitoring.
 * It provides robust error handling, reconnection logic, and connection validation
 * for the Neon PostgreSQL database used in the application.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import { createLogger } from '../utils/logger';
import { database as dbConfig } from './app-config';

// Create a dedicated logger for database operations
const logger = createLogger('database');

// Configure Neon database to use WebSocket for connection
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;

// Environment validation
function validateDbEnvironment() {
  const requiredVars = ['DATABASE_URL', 'PGHOST', 'PGUSER', 'PGDATABASE'];
  const missing = requiredVars.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missing.join(', ')}. Did you forget to provision a database?`
    );
  }
}

// Validate environment variables before proceeding
validateDbEnvironment();

// Database connection configuration
const poolConfig = {
  connectionString: dbConfig.url,
  max: dbConfig.maxPoolSize || 10,
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: dbConfig.connectionTimeoutMs || 10000,
  maxUses: 7500, // Close a connection after it has been used 7500 times (helps prevent memory leaks)
};

// Create connection pool with better error handling and reconnection
export const pool = new Pool(poolConfig);

// State variables for connection management
let isReconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// Log pool events
pool.on('connect', () => {
  logger.info('New database connection established');
  reconnectAttempts = 0; // Reset reconnect counter on successful connection
});

// Log pool errors rather than crashing
pool.on('error', async (err) => {
  logger.error('Unexpected error on idle database client', err);
  
  // Only attempt reconnection if we're not already trying
  if (!isReconnecting) {
    await attemptReconnection();
  }
});

// Helper function to attempt database reconnection
async function attemptReconnection() {
  isReconnecting = true;
  reconnectAttempts++;
  
  logger.info(`Attempting database reconnection (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  try {
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    logger.info('Database reconnection successful');
    isReconnecting = false;
    reconnectAttempts = 0;
  } catch (error) {
    // Handle the unknown error type safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Database reconnection attempt failed: ${errorMessage}`);
    
    // If we haven't reached max attempts, try again after interval
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(attemptReconnection, RECONNECT_INTERVAL);
    } else {
      logger.error('Max reconnection attempts reached. Database connection lost.');
      isReconnecting = false;
    }
  }
}

// Create Drizzle ORM instance with the pool
export const db = drizzle({ client: pool, schema });

// Function to get pool status
export function getPoolStatus() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}

// Function to test database connection with retry logic
export async function testDatabaseConnection(retries = 3, delay = 1000) {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT 1 AS ping');
      client.release();
      
      // Additional check to ensure result is as expected
      if (result?.rows?.[0]?.ping === 1) {
        return true;
      }
      
      // If we get here, something is wrong with the result format
      logger.error(`Unexpected database test result: ${JSON.stringify(result)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Database connection test failed (attempt ${attempt + 1}/${retries}): ${errorMessage}`);
      
      // Last attempt failed
      if (attempt === retries - 1) {
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    attempt++;
  }
  
  return false;
}

// Function to verify database health and schema with more details
export async function verifyDatabaseHealth() {
  try {
    // Test basic connectivity
    if (!await testDatabaseConnection()) {
      return { healthy: false, message: 'Database connection failed', details: null };
    }
    
    // Check all tables exist
    const tables = [
      'users', 'wardrobe_items', 'outfits', 'inspirations', 
      'weather_preferences', 'mood_preferences'
    ];
    
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = Array.isArray(tablesResult) 
      ? tablesResult.map(row => row.table_name) 
      : tablesResult.rows.map(row => row.table_name);
    
    const missingTables = tables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      return { 
        healthy: false, 
        message: 'Database schema incomplete', 
        details: { missingTables } 
      };
    }
    
    // Get pool status
    const poolStatus = getPoolStatus();
    
    return { 
      healthy: true,
      message: 'Database connection and schema verified',
      details: { 
        tables: existingTables,
        poolStatus
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      healthy: false,
      message: 'Database health check failed',
      details: { error: errorMessage }
    };
  }
}

/**
 * Initializes the database connection.
 * - Tests connection to the database
 * - Logs the database health status
 * - Logs the connected tables
 */
export async function initializeDatabase() {
  logger.info('Initializing database connection...');
  
  try {
    const health = await verifyDatabaseHealth();
    
    if (health.healthy) {
      logger.info('Database health check successful');
      logger.info(`Connected to ${health.details?.tables?.length || 0} tables`);
      logger.debug(`Connection pool status: ${JSON.stringify(getPoolStatus())}`);
      return true;
    } else {
      logger.warn(`Database health check failed: ${health.message}`);
      if (health.details) {
        logger.debug(`Details: ${JSON.stringify(health.details)}`);
      }
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to initialize database: ' + errorMessage);
    return false;
  }
}

// Export a default object with all database-related utilities
export default {
  pool,
  db,
  getPoolStatus,
  testDatabaseConnection,
  verifyDatabaseHealth,
  initializeDatabase
};