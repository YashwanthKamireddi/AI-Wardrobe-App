/**
 * Request Logging Middleware
 * 
 * This middleware logs incoming HTTP requests with timestamps and response times.
 * It provides visibility into API usage and performance.
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import { environment } from '../config/app-config';

const logger = createLogger('http');

/**
 * Creates a request ID for correlation
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Gets the client IP address from the request
 */
function getClientIp(req: Request): string {
  // Get IP from various headers that might contain the real client IP
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress;
  
  return ip || 'unknown';
}

/**
 * Request logging middleware factory
 * Creates middleware that logs requests with customizable options
 */
export function createRequestLogger(options: {
  logBody?: boolean;
  logQuery?: boolean;
  excludePaths?: string[];
} = {}) {
  const {
    logBody = false,
    logQuery = true,
    excludePaths = ['/api/health']
  } = options;
  
  return function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    // Skip logging for excluded paths
    if (excludePaths.includes(req.path)) {
      return next();
    }
    
    // Record request start time
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    // Store request ID on the request object for correlation
    (req as any).requestId = requestId;
    
    // Basic request information
    const requestInfo: Record<string, any> = {
      id: requestId,
      method: req.method,
      path: req.path,
      ip: getClientIp(req),
      userAgent: req.get('user-agent') || 'unknown'
    };
    
    // Add query parameters if enabled
    if (logQuery && Object.keys(req.query).length > 0) {
      requestInfo['query'] = req.query;
    }
    
    // Add request body if enabled and present (excluding sensitive data)
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      // Create safe copy of body without sensitive fields
      const safeBody = { ...req.body };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
      sensitiveFields.forEach(field => {
        if (field in safeBody) {
          safeBody[field] = '[REDACTED]';
        }
      });
      
      requestInfo['body'] = safeBody;
    }
    
    // Log the incoming request
    logger.info(`${req.method} ${req.path}`, requestInfo);
    
    // Capture the response
    const originalEnd = res.end;
    // @ts-ignore - Overriding complex express type definitions
    res.end = function(this: any, ...args: any[]) {
      // Calculate request duration
      const duration = Date.now() - startTime;
      
      // Log at appropriate level based on status code
      const logMessage = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
      if (res.statusCode >= 500) {
        logger.error(logMessage);
      } else if (res.statusCode >= 400) {
        logger.warn(logMessage);
      } else {
        logger.info(logMessage);
      }
      
      // Call the original end method with original arguments
      // @ts-ignore - Express typings are complex, but this works at runtime
      return originalEnd.apply(this, args);
    };
    
    next();
  };
}

/**
 * Default request logger middleware with standard options
 */
export const requestLogger = createRequestLogger({
  logBody: !environment.isProduction,
  logQuery: true,
  excludePaths: ['/api/health', '/favicon.ico']
});

export default {
  createRequestLogger,
  requestLogger
};