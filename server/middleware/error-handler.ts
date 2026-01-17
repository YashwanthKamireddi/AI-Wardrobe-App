import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // 1. Handle Zod Validation Errors
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        return res.status(statusCode).json({
            status: 'error',
            message,
            errors: err.errors,
        });
    }

    // 2. Handle Known App Errors
    if (err instanceof AppError) {
        return res.status(statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    // 3. Handle Unexpected Errors
    console.error('❌ UNHANDLED ERROR:', err);

    return res.status(statusCode).json({
        status: 'error',
        message: 'Something went wrong. Please try again.',
        // Only show stack in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
