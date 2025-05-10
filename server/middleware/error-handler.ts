/**
 * Global Error Handler Middleware
 * 
 * This middleware provides consistent error handling across the application.
 * It catches errors thrown in route handlers and API endpoints, formats them
 * appropriately, and returns them to the client with the correct HTTP status code.
 */

import { Request, Response, NextFunction } from 'express';
import { features } from '../config/app-config';

// Custom Error class with status code
export class ApiError extends Error {
  statusCode: number;
  details?: any;
  
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Helper function to determine if an error is an operational error we can handle gracefully
function isOperationalError(error: any): boolean {
  return error instanceof ApiError || error.statusCode !== undefined;
}

// Error handler middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Log error for server-side debugging
  console.error(`[ERROR] ${err.message || 'Unknown error'}`, err.stack);
  
  // Default error values
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Format the error response
  const errorResponse: Record<string, any> = {
    error: {
      message,
      status: statusCode,
      path: req.path
    }
  };
  
  // Add error details for debugging in development mode
  if (features.debugMode && err.details) {
    errorResponse.error.details = err.details;
  }
  
  // Include stack trace in development mode only
  if (features.debugMode && !isOperationalError(err)) {
    errorResponse.error.stack = err.stack;
  }
  
  return res.status(statusCode).json(errorResponse);
}

// Express middleware to handle async errors
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default errorHandler;