/**
 * Main Server Entry Point
 *
 * This file is responsible for:
 * 1. Starting the Express application
 * 2. Setting up Vite in development mode
 * 3. Handling graceful shutdown
 */

// Load environment variables FIRST
import appConfig from './config/app-config';

import { createServer } from 'http';
import { setupVite, serveStatic } from './vite';
import { createApp } from './app';
import { logger } from './utils';

// Start the server
(async () => {
  try {
    const timestamp = () => new Date().toISOString();
    console.log(`[${timestamp()}] Starting Celura application...`);
    logger.info('Starting Celura application...');

    // Create Express app
    console.log(`[${timestamp()}] About to call createApp()...`);
    const app = await createApp();
    console.log(`[${timestamp()}] createApp() completed successfully`);

    // Create HTTP server
    console.log(`[${timestamp()}] Creating HTTP server...`);
    const server = createServer(app);
    console.log(`[${timestamp()}] HTTP server created`);

    // Set up Vite for development or serve static files for production
    if (appConfig.environment.isDevelopment) {
      console.log(`[${timestamp()}] About to call setupVite()...`);
      await setupVite(app, server);
      console.log(`[${timestamp()}] setupVite() completed successfully`);
    } else {
      console.log(`[${timestamp()}] Serving static files...`);
      serveStatic(app);
      console.log(`[${timestamp()}] Static files setup complete`);
    }

    // Get port from environment or use default
    const port = appConfig.server.port;
    const host = appConfig.server.host;

    // Start listening on the configured port
    logger.info(`Starting server on port ${port}...`);
    logger.info(`Binding to host: ${host}`);

    // Windows-specific listen method to avoid socket issues
    if (process.platform === 'win32') {
      // On Windows, listen only on port without specifying host
      server.listen(port, () => {
        logger.info(`Server running at http://127.0.0.1:${port}`);
        logger.info(`Environment: ${app.get('env')} (Local)`);
      });
    } else {
      // On other platforms, use the configured host
      server.listen(port, host, () => {
        logger.info(`Server running at http://${host}:${port}`);
        logger.info(`Environment: ${app.get('env')} (Local)`);
      });
    }

    server.on('error', (err: any) => {
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

      logger.info('Application shut down complete');
      process.exit(0);
    };

    // Register shutdown handlers
    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);

  } catch (err) {
    logger.error('Failed to start server:', err instanceof Error ? err : new Error(String(err)));
    process.exit(1);
  }
})();
