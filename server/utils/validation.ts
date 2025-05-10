/**
 * Validation Utility
 * 
 * This module provides validation helpers for request data using Zod.
 * It includes middleware for validating request bodies, params, and queries.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ApiError } from '../middleware/error-handler';
import { createLogger } from './logger';

const logger = createLogger('validation');

/**
 * Validates data against a Zod schema
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated and parsed data
 * @throws ApiError if validation fails
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      logger.warn('Validation error', { message: validationError.message, details: error.errors });
      
      throw ApiError.validationError('Validation error', {
        message: validationError.message,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    logger.error('Unexpected validation error: ' + errorMessage);
    throw ApiError.internal('An unexpected error occurred during validation');
  }
}

/**
 * Creates middleware for validating request data
 * 
 * @param config - Configuration object specifying schemas for different parts of the request
 * @returns Middleware function for Express
 */
export function createValidationMiddleware(config: {
  body?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema provided
      if (config.body && req.body) {
        req.body = validateSchema(config.body, req.body);
      }
      
      // Validate route parameters if schema provided
      if (config.params && req.params) {
        req.params = validateSchema(config.params, req.params);
      }
      
      // Validate query parameters if schema provided
      if (config.query && req.query) {
        req.query = validateSchema(config.query, req.query);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Common validation schemas for reuse throughout the application
 */
export const commonSchemas = {
  /**
   * Schema for validating pagination parameters
   */
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  }),
  
  /**
   * Schema for validating ID parameters
   */
  id: z.object({
    id: z.coerce.number().int().positive()
  }),
  
  /**
   * Schema for validating dates
   */
  date: z.string().refine(value => !isNaN(Date.parse(value)), {
    message: 'Invalid date format'
  }),
  
  /**
   * Schema for validating email addresses
   */
  email: z.string().email({
    message: 'Invalid email address'
  }),
  
  /**
   * Schema for validating strong passwords
   */
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters'
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }),
  
  /**
   * Schema for validating usernames
   */
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters'
  }).max(30, {
    message: 'Username cannot exceed 30 characters'
  }).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens'
  })
};

export default {
  validateSchema,
  createValidationMiddleware,
  commonSchemas
};