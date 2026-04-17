import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

/**
 * XSS Protection Middleware
 * Sanitizes user-generated content to prevent XSS attacks
 *
 * Gold Standard: Server-side sanitization with DOMPurify
 * Protects against malicious HTML/JavaScript in user inputs
 */

/**
 * Sanitize a single value (string, number, boolean, null)
 */
function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
        // Remove all HTML tags and scripts
        return DOMPurify.sanitize(value, {
            ALLOWED_TAGS: [], // Strip all HTML tags
            ALLOWED_ATTR: [], // Strip all attributes
            KEEP_CONTENT: true, // Keep text content
        });
    }
    return value;
}

/**
 * Recursively sanitize an object or array
 */
function sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return sanitizeValue(obj);
}

/**
 * Fields that should be sanitized (user-generated content)
 * Expand this list as needed for your application
 */
const SANITIZE_FIELDS = [
    'name',
    'description',
    'notes',
    'location',
    'destination',
    'title',
    'caption',
    'comment',
    'message',
    'bio',
];

/**
 * Middleware to sanitize request body
 * Only sanitizes specified fields to avoid breaking structured data
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
        for (const field of SANITIZE_FIELDS) {
            if (req.body[field] !== undefined) {
                req.body[field] = sanitizeObject(req.body[field]);
            }
        }
    }
    next();
}

/**
 * Strict sanitization middleware for specific endpoints
 * Sanitizes ALL string fields in the request body
 */
export function sanitizeAllStrings(req: Request, _res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}

/**
 * Export DOMPurify instance for manual sanitization
 */
export { DOMPurify };
