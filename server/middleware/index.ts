import { globalErrorHandler } from './error-handler';
import { requireAuth, requireRole, requireSelfOrAdmin } from './auth-middleware';
import { requestLogger, createRequestLogger } from './request-logger';
import { aiRateLimiter, authRateLimiter, generalRateLimiter, uploadRateLimiter } from './rate-limiter';
import { sanitizeBody, sanitizeAllStrings } from './xss-protection';
import { validate, validateParams, validateQuery, validateAll } from './validate';
import { csrfTokenMiddleware, getCsrfToken, validateCsrf } from './csrf-protection';


// Export all middleware components
export {
    // Error handling
    globalErrorHandler,

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
    uploadRateLimiter,

    // XSS Protection
    sanitizeBody,
    sanitizeAllStrings,

    // Validation
    validate,
    validateParams,
    validateQuery,
    validateAll,

    // CSRF Protection
    csrfTokenMiddleware,
    getCsrfToken,
    validateCsrf
};

// Default export for convenience
export default {
    globalErrorHandler,
    requireAuth,
    requireRole,
    requireSelfOrAdmin,
    requestLogger,
    createRequestLogger,
    aiRateLimiter,
    authRateLimiter,
    generalRateLimiter,
    uploadRateLimiter,
    sanitizeBody,
    sanitizeAllStrings,
    validate,
    validateParams,
    validateQuery,
    validateAll,
    csrfTokenMiddleware,
    getCsrfToken,
    validateCsrf
};
