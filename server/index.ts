/**
 * Main Server Entry Point
 * 
 * This file is responsible for:
 * 1. Loading environment variables
 * 2. Starting the Express application
 * 3. Connecting to the database
 * 4. Setting up Vite in development mode
 * 5. Handling graceful shutdown
 */

// Load environment variables first before any other imports
import './config/env';

import { createServer } from 'http';
import { setupVite, serveStatic } from './vite';
import { createApp } from './app';
import { logger } from './utils';
import database from './config/database';
import appConfig from './config/app-config';

// Start the server
(async () => {
  try {
    // Verify database health before starting server
    logger.info('Verifying database health...');
    const dbHealth = await database.verifyDatabaseHealth();
    
    if (!dbHealth.healthy) {
      logger.warn(`WARNING: Database health check failed: ${dbHealth.message}`);
      if (dbHealth.details) {
        logger.debug(`Details: ${JSON.stringify(dbHealth.details)}`);
      }
      logger.warn('The server will start, but database-dependent features may not work correctly.');
    } else {
      logger.info('Database health check successful');
      logger.info(`Connected to ${dbHealth.details?.tables?.length || 0} tables`);
      logger.debug(`Connection pool status: ${JSON.stringify(database.getPoolStatus())}`);
    }
    
    // Create Express app
    const app = await createApp();
    
    // Create HTTP server
    const server = createServer(app);
    
    // Set up Vite for development or serve static files for production
    if (appConfig.environment.isDevelopment) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Get port from environment or use default
    const port = appConfig.server.port;
    const host = appConfig.server.host;
    
    // Start listening on the configured port
    logger.info(`Starting server on port ${port}...`);
    
    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      logger.info(`Server running at http://${host}:${port}`);
      logger.info(`Environment: ${app.get('env')} (${appConfig.environment.isReplit ? 'Replit' : 'Local'})`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use. Please choose a different port.`);
      } else {
        logger.error('Server startup error:', err);
      }
      process.exit(1);
    });
    
    // Handle graceful shutdown
    const shutdownHandler = async () => {
      logger.info('Shutting down gracefully...');
      
      // Close server first to stop accepting new connections
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('Server closed');
          resolve();
        });
      });
      
      // Close database pool
      try {
        await database.pool.end();
        logger.info('Database connections closed');
      } catch (err) {
        logger.error('Error closing database connections:', err);
      }
      
      process.exit(0);
    };
    
    // Register shutdown handlers
    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
})();