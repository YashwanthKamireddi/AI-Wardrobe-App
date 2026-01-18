/**
 * Rate Limiting Middleware
 *
 * Protects API endpoints from abuse using express-rate-limit.
 * Different limits for different endpoint types:
 * - AI endpoints: Stricter limits due to API costs
 * - Auth endpoints: Prevent brute force attacks
 * - General API: Reasonable limits for normal usage
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * AI Endpoints Rate Limiter
 * Applies to: /api/ai-*, /api/style-*, /api/occasion-*
 * Limit: 10 requests per minute per user
 */
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        message: 'Too many AI requests. Please wait a moment before trying again.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Disable IP validation since we use user ID when available
    validate: { ip: false },
    keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise use a hash
        return req.user?.id?.toString() || 'anon-' + (req.headers['x-forwarded-for'] || 'unknown');
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            message: 'Too many AI requests. Please wait a moment before trying again.',
            retryAfter: 60,
            code: 'RATE_LIMIT_EXCEEDED'
        });
    }
});

/**
 * Authentication Endpoints Rate Limiter
 * Applies to: /api/login, /api/register
 * Limit: 5 requests per minute per IP (prevent brute force)
 */
export const authRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: {
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: 60
    },
    validate: { ip: false },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use forwarded header or fallback
        return String(req.headers['x-forwarded-for'] || 'unknown');
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter: 60,
            code: 'AUTH_RATE_LIMIT_EXCEEDED'
        });
    }
});

/**
 * General API Rate Limiter
 * Applies to: All other /api/* endpoints
 * Limit: 100 requests per minute per user
 */
export const generalRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        message: 'Too many requests. Please slow down.',
        retryAfter: 60
    },
    validate: { ip: false },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return req.user?.id?.toString() || 'anon-' + (req.headers['x-forwarded-for'] || 'unknown');
    },
    skip: (req: Request) => {
        // Skip rate limiting for health check
        return req.path === '/api/health';
    }
});

/**
 * Upload Rate Limiter
 * Applies to: /api/upload-image
 * Limit: 20 uploads per minute
 */
export const uploadRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 uploads per minute
    message: {
        message: 'Too many uploads. Please wait before uploading more images.',
        retryAfter: 60
    },
    validate: { ip: false },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        return req.user?.id?.toString() || 'anon-' + (req.headers['x-forwarded-for'] || 'unknown');
    }
});

export default {
    aiRateLimiter,
    authRateLimiter,
    generalRateLimiter,
    uploadRateLimiter
};
