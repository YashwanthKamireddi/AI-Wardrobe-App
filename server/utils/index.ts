/**
 * Utilities Index
 * 
 * This file exports all utility functions in a centralized way.
 * It allows importing multiple utilities with a single import statement.
 */

import { createLogger, logger, LogLevel } from './logger';
import { 
  validateSchema, 
  createValidationMiddleware,
  commonSchemas 
} from './validation';
import {
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent
} from './response-formatter';

// Export all utility components
export {
  // Logging
  createLogger,
  logger,
  LogLevel,
  
  // Validation
  validateSchema,
  createValidationMiddleware,
  commonSchemas,
  
  // Response formatting
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent
};

// Default export for convenience
export default {
  createLogger,
  logger,
  validateSchema,
  createValidationMiddleware,
  commonSchemas,
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent
};