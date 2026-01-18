/**
 * Validation Middleware
 *
 * Express middleware for Zod schema validation.
 * Validates request body, params, or query against schemas.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

interface ValidationOptions {
    /** Validate request body (default: true) */
    body?: boolean;
    /** Validate request params */
    params?: boolean;
    /** Validate request query */
    query?: boolean;
}

/**
 * Create validation middleware for a Zod schema
 *
 * @example
 * app.post('/api/wardrobe', validate(createWardrobeItemSchema), handler);
 */
export function validate(
    schema: ZodSchema,
    options: ValidationOptions = { body: true }
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Determine what to validate
            const toValidate: Record<string, unknown> = {};

            if (options.body !== false) {
                Object.assign(toValidate, req.body);
            }
            if (options.params) {
                Object.assign(toValidate, req.params);
            }
            if (options.query) {
                Object.assign(toValidate, req.query);
            }

            // Validate and transform
            const validated = await schema.parseAsync(toValidate);

            // Merge validated data back to request
            if (options.body !== false) {
                req.body = validated;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Log validation failure for monitoring
                logger.warn({
                    path: req.path,
                    method: req.method,
                    errors: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                }, 'Validation failed');

                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                        code: e.code,
                    })),
                });
            }

            // Unexpected error
            logger.error({ err: error }, 'Unexpected validation error');
            return res.status(500).json({
                error: 'Internal validation error',
            });
        }
    };
}

/**
 * Validate request params (e.g., :id)
 */
export function validateParams(schema: ZodSchema) {
    return validate(schema, { body: false, params: true });
}

/**
 * Validate request query string
 */
export function validateQuery(schema: ZodSchema) {
    return validate(schema, { body: false, query: true });
}

/**
 * Validate both body and params
 */
export function validateAll(bodySchema: ZodSchema, paramsSchema?: ZodSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate body
            req.body = await bodySchema.parseAsync(req.body);

            // Validate params if schema provided
            if (paramsSchema) {
                const validatedParams = await paramsSchema.parseAsync(req.params);
                Object.assign(req.params, validatedParams);
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            next(error);
        }
    };
}

export default validate;
