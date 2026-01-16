/**
 * Middleware Index
 *
 * This file exports all application middleware for easier imports elsewhere.
 * Centralizing middleware exports improves code organization and helps
 * maintain a clear middleware dependency structure.
 */

import { errorHandler, asyncHandler, ApiError } from './error-handler';
import { requireAuth, requireRole, requireSelfOrAdmin } from './auth-middleware';
import { requestLogger, createRequestLogger } from './request-logger';
import { aiRateLimiter, authRateLimiter, generalRateLimiter, uploadRateLimiter } from './rate-limiter';

// Export all middleware components
export {
    // Error handling
    errorHandler,
    asyncHandler,
    ApiError,

    // Authentication
    requireAuth,
    requireRole,
    requireSelfOrAdmin,

    // Logging
    requestLogger,
    createRequestLogger,

    // Rate limiting
    aiRateLimiter,
    authRateLimiter,
    generalRateLimiter,
    uploadRateLimiter
};

// Default export for convenience
export default {
    errorHandler,
    asyncHandler,
    ApiError,
    requireAuth,
    requireRole,
    requireSelfOrAdmin,
    requestLogger,
    createRequestLogger,
    aiRateLimiter,
    authRateLimiter,
    generalRateLimiter,
    uploadRateLimiter
};
