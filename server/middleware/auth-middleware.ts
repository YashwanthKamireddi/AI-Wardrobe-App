/**
 * Authentication Middleware
 * 
 * This middleware handles user authentication verification for protected routes.
 * It provides functions to check if a user is authenticated and authorize
 * access based on user roles or other criteria.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler';

/**
 * Middleware to ensure a user is authenticated
 * If not authenticated, it returns a 401 Unauthorized response
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next(new ApiError('Authentication required', 401));
  }
  next();
}

/**
 * Middleware to ensure a user has the correct role
 * @param {string[]} allowedRoles - Array of roles that are permitted access
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return next(new ApiError('Authentication required', 401));
    }
    
    // Type assertion to access user with role property
    const user = req.user as any;
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      return next(new ApiError('Insufficient permissions', 403));
    }
    
    next();
  };
}

/**
 * Middleware to check if request is for the authenticated user
 * Useful for routes that operate on a specific user's data
 * @param {string} paramName - URL parameter name containing the user ID
 */
export function requireSelfOrAdmin(paramName: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return next(new ApiError('Authentication required', 401));
    }
    
    const user = req.user as any;
    const requestedUserId = parseInt(req.params[paramName], 10);
    
    // Allow if user is requesting their own data or has admin role
    if (!isNaN(requestedUserId) && 
        (user.id === requestedUserId || user.role === 'admin')) {
      return next();
    }
    
    return next(new ApiError('Insufficient permissions', 403));
  };
}

export default {
  requireAuth,
  requireRole,
  requireSelfOrAdmin
};