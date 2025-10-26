/**
 * Application Configuration and Setup
 * 
 * This file initializes the Express application with all necessary middleware,
 * configurations, and routes. It sets up error handling, authentication,
 * and other core features.
 */

import express, { Express } from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';
import { errorHandler, requestLogger } from './middleware';
import { logger } from './utils';
import appConfig from './config/app-config';
import storage from './storage';

/**
 * Creates and configures the Express application
 */
export async function createApp(): Promise<Express> {
  const timestamp = () => new Date().toISOString();
  console.log(`[${timestamp()}] [createApp] Initializing Express application...`);
  
  // Initialize the Express application
  const app = express();
  console.log(`[${timestamp()}] [createApp] Express app created`);
  
  // Set application variables
  app.set('isLocal', appConfig.environment.isLocal);
  app.set('env', appConfig.environment.nodeEnv);
  console.log(`[${timestamp()}] [createApp] Application variables set`);
  
  // Apply basic middleware
  app.use(cors({
    origin: appConfig.server.corsOrigins,
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  console.log(`[${timestamp()}] [createApp] Basic middleware applied`);
  
  // Set up request logging
  app.use(requestLogger);
  console.log(`[${timestamp()}] [createApp] Request logging configured`);
  
  // Set up session handling with in-memory storage
  console.log(`[${timestamp()}] [createApp] Setting up session handling...`);
  const sessionConfig = {
    secret: appConfig.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: appConfig.environment.isProduction,
      maxAge: appConfig.auth.cookieMaxAge
    }
  };
  
  app.use(session(sessionConfig));
  console.log(`[${timestamp()}] [createApp] Session handling configured`);
  
  // Set up authentication
  console.log(`[${timestamp()}] [createApp] Setting up authentication...`);
  setupAuth(app);
  console.log(`[${timestamp()}] [createApp] Authentication configured`);
  
  // Health check endpoint that doesn't require authentication
  console.log(`[${timestamp()}] [createApp] Registering health check endpoint...`);
  app.get('/api/health', async (req, res) => {
    try {
      // Check memory usage
      const memoryUsage = process.memoryUsage();
      
      return res.status(200).json({
        status: 'OK',
        environment: app.get('env'),
        platform: 'Local',
        storage: {
          type: 'in-memory',
          status: 'ready'
        },
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        },
        uptime: Math.round(process.uptime()) + 's'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Failed to check system health',
        error: errorMessage
      });
    }
  });
  console.log(`[${timestamp()}] [createApp] Health check endpoint registered`);
  
  // Register application routes
  console.log(`[${timestamp()}] [createApp] About to register application routes...`);
  await registerRoutes(app);
  console.log(`[${timestamp()}] [createApp] Application routes registered successfully`);
  
  // Apply global error handler (must be after routes)
  console.log(`[${timestamp()}] [createApp] Applying error handler...`);
  app.use(errorHandler);
  console.log(`[${timestamp()}] [createApp] Error handler applied`);
  
  console.log(`[${timestamp()}] [createApp] Application initialization complete`);
  return app;
}

export default createApp;