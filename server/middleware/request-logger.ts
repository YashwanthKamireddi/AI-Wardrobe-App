/**
 * Request Logger Middleware
 * 
 * This middleware logs information about incoming HTTP requests.
 * It provides visibility into API usage and can help with debugging
 * and monitoring application traffic.
 */

import { Request, Response, NextFunction } from 'express';
import { features } from '../config/app-config';

/**
 * Creates a logger middleware with the given options
 * @param {Object} options - Configuration options
 * @param {boolean} options.logBody - Whether to log request bodies
 * @param {boolean} options.logResponse - Whether to log response bodies
 * @param {number} options.maxBodyLength - Maximum length for logged bodies
 * @param {string[]} options.excludePaths - Paths to exclude from logging
 */
export function createRequestLogger(options: {
  logBody?: boolean;
  logResponse?: boolean;
  maxBodyLength?: number;
  excludePaths?: string[];
} = {}) {
  const {
    logBody = false,
    logResponse = false,
    maxBodyLength = 1000,
    excludePaths = ['/api/health', '/api/ping']
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const start = Date.now();
    const { method, path, ip } = req;
    
    // Log request start
    console.log(`[${new Date().toISOString()}] ${method} ${path} - Started ${ip}`);
    
    // Log request body if enabled
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      const bodyString = JSON.stringify(req.body);
      const truncatedBody = bodyString.length > maxBodyLength 
        ? `${bodyString.substring(0, maxBodyLength)}...` 
        : bodyString;
      console.log(`[REQUEST] Body: ${truncatedBody}`);
    }
    
    // Capture response data if enabled
    if (logResponse) {
      const originalJson = res.json;
      res.json = function(body) {
        res.locals.responseBody = body;
        return originalJson.call(this, body);
      };
    }
    
    // Log when request is complete
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      
      const logLevel = statusCode >= 500 
        ? 'error' 
        : statusCode >= 400 
          ? 'warn' 
          : 'log';
      
      // Format the log message
      let message = `[${new Date().toISOString()}] ${method} ${path} ${statusCode} - ${duration}ms`;
      
      // Add response body summary if enabled
      if (logResponse && res.locals.responseBody) {
        const responseBody = JSON.stringify(res.locals.responseBody);
        if (responseBody && responseBody.length > 0) {
          const truncatedResponse = responseBody.length > maxBodyLength 
            ? `${responseBody.substring(0, maxBodyLength)}...` 
            : responseBody;
          message += ` - Response: ${truncatedResponse}`;
        }
      }
      
      // Log with appropriate level
      console[logLevel](message);
    });
    
    next();
  };
}

// Create a default logger instance
export const requestLogger = createRequestLogger({
  logBody: features.debugMode,
  logResponse: features.debugMode,
  maxBodyLength: 500,
  excludePaths: ['/api/health', '/api/ping', '/static']
});

export default requestLogger;