/**
 * Request Logging Middleware (Pino-HTTP)
 *
 * High-performance request logging utilizing pino-http.
 * replaces the custom Winston middleware.
 */

import { pinoHttp } from 'pino-http';
import { logger } from '../utils/logger';
import { Request, Response } from 'express';

// Exclude sensitive headers
const REDACTED_HEADERS = ['authorization', 'cookie', 'x-api-key'];

export const requestLogger = pinoHttp({
    logger,
    // Define a custom serializer for the request
    serializers: {
        req: (req: any) => {
            // Filter sensitive headers
            if (req.headers) {
                const headers = { ...req.headers };
                REDACTED_HEADERS.forEach((header) => {
                    if (headers[header]) headers[header] = '[REDACTED]';
                });
                req.headers = headers;
            }
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                headers: req.headers,
                remoteAddress: req.remoteAddress,
            };
        },
        res: (res: any) => ({
            statusCode: res.statusCode,
        }),
    },
    // Prevent logging health checks to reduce noise
    autoLogging: {
        ignore: (req: any) => {
            return req.url === '/api/health' || req.url === '/favicon.ico';
        },
    },
    // Custom success message
    customSuccessMessage: (req: any, res: any) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms`;
    },
    // Custom error message
    customErrorMessage: (req: any, res: any, err: any) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
    // Assign a unique ID to each request
    genReqId: (req: any) => req.headers['x-request-id'] || req.id || crypto.randomUUID(),
});

// Backward compatibility export (if needed)
export function createRequestLogger() {
    return requestLogger;
}

export default {
    requestLogger,
    createRequestLogger
};
