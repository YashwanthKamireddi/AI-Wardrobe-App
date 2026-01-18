import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

/**
 * Global Error Handling Middleware (Enterprise Grade)
 *
 * Deep Reasoning:
 * 1. **Security:** Never leaks stack traces to the client in production.
 * 2. **Observability:** Logs errors with structured context for debugging.
 * 3. **Determinism:** Distinguishes between Operational Errors (trusted) and Programmer Errors (untrusted).
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-request-id'] || req.headers['x-correlation-id'] || 'unknown';
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the full error context for internal debugging (structured)
    logger.error({
        message: err.message,
        stack: err.stack,
        correlationId,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode || 500,
        errorName: err.name,
    });

    // CASE 1: Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'fail',
            code: 'VALIDATION_ERROR',
            message: 'Invalid input provided',
            errors: err.flatten().fieldErrors,
        });
    }

    // CASE 2: Known Operational App Errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.statusCode >= 500 ? 'error' : 'fail',
            message: err.message,
        });
    }

    // CASE 3: JSON Parsing Errors (malformed body)
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid JSON payload',
        });
    }

    // CASE 4: Untrusted/Unknown Errors (Programmer Errors)
    // Sanitize response in production to prevent information disclosure
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        status: 'error',
        message: isProduction
            ? 'An unexpected internal error occurred'
            : err.message,
        // Only show stack in development
        ...(isProduction ? {} : { stack: err.stack }),
    });
};
