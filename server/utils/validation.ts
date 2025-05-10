/**
 * Validation Utilities
 * 
 * This file contains common validation functions used throughout the application.
 * Centralizing validation logic improves consistency and reduces code duplication.
 */

import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ApiError } from '../middleware/error-handler';

/**
 * Validates data against a Zod schema and returns the validated data
 * Throws a formatted ApiError if validation fails
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param errorMessage - Custom error message prefix
 * @returns The validated and typed data
 */
export function validateSchema<T>(
  schema: z.Schema<T>,
  data: unknown,
  errorMessage: string = 'Validation failed'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      throw new ApiError(
        `${errorMessage}: ${validationError.message}`,
        400,
        validationError.details
      );
    }
    throw new ApiError(`${errorMessage}: Unknown validation error`, 400);
  }
}

/**
 * Creates a validation middleware for Express routes
 * 
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate ('body', 'query', 'params')
 * @param errorMessage - Custom error message prefix
 * @returns Express middleware function
 */
export function createValidationMiddleware(
  schema: z.Schema,
  source: 'body' | 'query' | 'params' = 'body',
  errorMessage: string = 'Validation failed'
) {
  return (req: any, res: any, next: any) => {
    try {
      req[source] = validateSchema(schema, req[source], errorMessage);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Common validation schemes for use throughout the application
 */
export const commonSchemas = {
  id: z.coerce.number().int().positive(),
  uuid: z.string().uuid(),
  email: z.string().email(),
  url: z.string().url(),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
};

export default {
  validateSchema,
  createValidationMiddleware,
  commonSchemas
};