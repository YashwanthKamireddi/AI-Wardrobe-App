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
  // Initialize the Express application
  const app = express();
  
  // Set application variables
  app.set('isReplit', appConfig.environment.isReplit);
  app.set('env', appConfig.environment.nodeEnv);
  
  // Apply basic middleware
  app.use(cors({
    origin: appConfig.server.corsOrigins,
    credentials: true
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  
  // Set up request logging
  app.use(requestLogger);
  
  // Set up session handling with in-memory storage
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
  
  // Set up authentication
  setupAuth(app);
  
  // Health check endpoint that doesn't require authentication
  app.get('/api/health', async (req, res) => {
    try {
      // Check memory usage
      const memoryUsage = process.memoryUsage();
      
      return res.status(200).json({
        status: 'OK',
        environment: app.get('env'),
        platform: appConfig.environment.isReplit ? 'Replit' : 'Local',
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
  
  // Register application routes
  await registerRoutes(app);
  
  // Apply global error handler (must be after routes)
  app.use(errorHandler);
  
  return app;
}

export default createApp;