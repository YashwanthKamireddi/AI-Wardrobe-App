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
import helmet from 'helmet';
import { AuthService } from './features/auth/auth.service';
import authRoutes from './features/auth/auth.routes';
import { registerRoutes } from './routes';
import { requestLogger, generalRateLimiter, authRateLimiter, aiRateLimiter } from './middleware';
import { globalErrorHandler } from './middleware/error-handler';
import { logger } from './utils';
import appConfig from './config/app-config';
import storage from './storage';

/**
 * Creates and configures the Express application
 */
export async function createApp(): Promise<Express> {
    logger.info('[createApp] Initializing Express application...');

    // Initialize the Express application
    const app = express();
    logger.info('[createApp] Express app created');

    // Set application variables
    app.set('isLocal', appConfig.environment.isLocal);
    app.set('env', appConfig.environment.nodeEnv);
    app.set('trust proxy', 1);
    logger.info('[createApp] Application variables set');

    // Apply security headers with Helmet
    // Content Security Policy (CSP) is configured to allow necessary resources
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for development convenience
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "blob:"],
                connectSrc: ["'self'", "https://api.openai.com"], // Allow connections to self and AI services
            },
        },
    }));
    logger.info('[createApp] Security headers (Helmet) applied');

    // Apply basic middleware
    app.use(cors({
        origin: appConfig.server.corsOrigins,
        credentials: true
    }));
    // Parse request bodies
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // XSS Protection - Sanitize user input (Gold Standard Security)
    const { sanitizeBody } = await import('./middleware/xss-protection');
    app.use(sanitizeBody);
    logger.info('[createApp] Basic middleware applied');

    // Set up request logging
    app.use(requestLogger);
    logger.info('[createApp] Request logging configured');

    // Set up authentication (includes session handling)
    logger.info('[createApp] Setting up authentication...');
    AuthService.setup(app);
    logger.info('[createApp] Authentication configured');

    // Apply rate limiting
    logger.info('[createApp] Setting up rate limiting...');

    // Mount Auth Routes - Feature Slice
    app.use('/api', authRoutes);

    // AI endpoints - moderate rate limiting (10 req/min per user)
    app.use('/api/ai-outfit-recommendations', aiRateLimiter);
    app.use('/api/style-profile', aiRateLimiter);
    app.use('/api/style-analysis', aiRateLimiter);
    app.use('/api/occasion-outfit', aiRateLimiter);

    // General API - relaxed rate limiting (100 req/min per user)
    app.use('/api', generalRateLimiter);

    logger.info('[createApp] Rate limiting configured');

    // Health check endpoint that doesn't require authentication
    logger.info('[createApp] Registering health check endpoint...');
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
    logger.info('[createApp] Health check endpoint registered');

    // Register application routes
    logger.info('[createApp] About to register application routes...');
    await registerRoutes(app);
    logger.info('[createApp] Application routes registered successfully');

    // Apply global error handler (must be after routes)
    logger.info('[createApp] Applying error handler...');
    app.use(globalErrorHandler);
    logger.info('[createApp] Error handler applied');

    logger.info('[createApp] Application initialization complete');
    return app;
}

export default createApp;
