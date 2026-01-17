// Load environment variables FIRST
import appConfig from './config/app-config';

import { createServer } from 'http';
import { setupVite, serveStatic } from './vite';
import { createApp } from './app';
import { logger } from './utils/logger';
import { initializeOpenTelemetry, shutdownOpenTelemetry } from './config/telemetry';

/**
 * Start the application
 */
async function start() {
    try {
        logger.info('🚀 Starting application...');

        // Initialize OpenTelemetry for distributed tracing (Gold Standard)
        initializeOpenTelemetry();

        const app = await createApp();
        const server = createServer(app);
        const PORT = appConfig.server.port;
        const HOST = appConfig.server.host;

        // Development vs Production Setup
        if (appConfig.environment.isDevelopment) {
            await setupVite(app, server);
        } else {
            serveStatic(app);
        }

        // Start Server
        server.listen(PORT, HOST, () => {
            logger.info(`🚀 Server running at http://${HOST}:${PORT}`);
            logger.info(`Environment: ${app.get('env')}`);
        });

        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use. Please choose a different port.`);
            } else {
                logger.error('Server startup error:', err);
            }
            process.exit(1);
        });

        // Graceful Shutdown Logic
        const shutdownHandler = async (signal: string) => {
            logger.info(`${signal} signal received. Starting graceful shutdown...`);

            // Close HTTP server
            server.close(async () => {
                logger.info('HTTP server closed. Connections drained.');
                // If we had a direct DB connection pool here, we would close it now.
                // await db.end();

                // Shutdown OpenTelemetry
                await shutdownOpenTelemetry();
                logger.info('OpenTelemetry shut down.');

                process.exit(0);
            });

            // Force kill if hanging
            setTimeout(() => {
                logger.error('Shutdown timed out. Forcing exit.');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
        process.on('SIGINT', () => shutdownHandler('SIGINT'));

    } catch (err) {
        logger.error({ err: err instanceof Error ? err : new Error(String(err)) }, '❌ Critical failure during startup');
        process.exit(1);
    }
}

// Start the application
start();
