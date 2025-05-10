/**
 * Error Handling Middleware
 * 
 * This module provides centralized error handling for the application.
 * It includes a custom error class, async handler, and error middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('error-handler');

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  statusCode: number;
  details?: any;
  
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    
    // Maintain proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Factory method to create a 400 Bad Request error
   */
  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(message, 400, details);
  }
  
  /**
   * Factory method to create a 401 Unauthorized error
   */
  static unauthorized(message: string = 'Authentication required'): ApiError {
    return new ApiError(message, 401);
  }
  
  /**
   * Factory method to create a 403 Forbidden error
   */
  static forbidden(message: string = 'Access denied'): ApiError {
    return new ApiError(message, 403);
  }
  
  /**
   * Factory method to create a 404 Not Found error
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }
  
  /**
   * Factory method to create a 409 Conflict error
   */
  static conflict(message: string, details?: any): ApiError {
    return new ApiError(message, 409, details);
  }
  
  /**
   * Factory method to create a 422 Unprocessable Entity error
   */
  static validationError(message: string, details?: any): ApiError {
    return new ApiError(message, 422, details);
  }
  
  /**
   * Factory method to create a 500 Internal Server Error
   */
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }
}

/**
 * Utility to wrap async route handlers for error handling
 * 
 * This allows using async/await in route handlers without try/catch blocks.
 * Any errors thrown are automatically passed to the error handler middleware.
 */
export function asyncHandler(fn: Function) {
  return function(req: Request, res: Response, next: NextFunction) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware
 * 
 * This middleware should be applied after all routes to catch any errors
 * and send a standardized error response to the client.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Get status code and message, defaulting to 500 for unknown errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  // Log the error with appropriate severity
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, err);
  } else if (statusCode >= 400) {
    logger.warn(`${statusCode} - ${message}`, { path: req.path, method: req.method });
  }
  
  // Format the error response
  const errorResponse: any = {
    success: false,
    error: {
      message,
      status: statusCode
    }
  };
  
  // Include error details in development environments
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error.stack = err.stack;
    
    if (err.details) {
      errorResponse.error.details = err.details;
    }
  }
  
  // Send the error response
  res.status(statusCode).json(errorResponse);
}

export default {
  ApiError,
  asyncHandler,
  errorHandler
};