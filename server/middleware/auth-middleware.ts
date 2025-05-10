/**
 * Authentication Middleware
 * 
 * This module provides middleware functions for protecting routes
 * with authentication and authorization requirements.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler';
import { createLogger } from '../utils/logger';
import { User } from '@shared/schema';

const logger = createLogger('auth-middleware');

// Define possible user roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Extend the Express Request type to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to require authentication
 * Checks if a user is logged in via session
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    logger.warn('Unauthorized access attempt', { 
      path: req.path, 
      method: req.method,
      ip: req.ip 
    });
    return next(ApiError.unauthorized('You must be logged in to access this resource'));
  }
  
  // User is authenticated, proceed
  next();
}

/**
 * Middleware to require a specific role
 * Checks if the authenticated user has the required role
 */
export function requireRole(role: UserRole | UserRole[]) {
  return function(req: Request, _res: Response, next: NextFunction) {
    // First check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      logger.warn('Unauthorized role access attempt', { 
        path: req.path, 
        method: req.method,
        ip: req.ip
      });
      return next(ApiError.unauthorized('You must be logged in to access this resource'));
    }
    
    // Check if user has the required role
    const userRole = req.user.role || UserRole.USER;
    const requiredRoles = Array.isArray(role) ? role : [role];
    
    if (!requiredRoles.includes(userRole as UserRole)) {
      logger.warn('Forbidden access attempt', { 
        path: req.path, 
        method: req.method,
        userId: req.user.id,
        userRole,
        requiredRoles,
        ip: req.ip
      });
      return next(ApiError.forbidden('You do not have permission to access this resource'));
    }
    
    // User has the required role, proceed
    next();
  };
}

/**
 * Middleware to ensure user can only access their own resources
 * or is an admin with permissions to access any user's resources
 * 
 * The userId parameter in the request must match the authenticated user's ID
 * unless the user is an admin
 */
export function requireSelfOrAdmin(req: Request, _res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    logger.warn('Unauthorized self-access attempt', { 
      path: req.path, 
      method: req.method,
      ip: req.ip
    });
    return next(ApiError.unauthorized('You must be logged in to access this resource'));
  }
  
  // Get the requested user ID from params or query
  const requestedUserId = req.params.userId || req.query.userId;
  
  // Skip check if no user ID was specified
  if (!requestedUserId) {
    return next();
  }
  
  // Parse requested user ID to number for comparison
  const targetId = parseInt(requestedUserId as string, 10);
  
  // Check if user is accessing their own resources or is an admin
  const isOwnResource = req.user.id === targetId;
  const isAdmin = req.user.role === UserRole.ADMIN;
  
  if (!isOwnResource && !isAdmin) {
    logger.warn('Forbidden self-access attempt', { 
      path: req.path, 
      method: req.method,
      userId: req.user.id,
      targetId,
      ip: req.ip
    });
    return next(ApiError.forbidden('You do not have permission to access this resource'));
  }
  
  // User is accessing their own resources or is an admin, proceed
  next();
}

export default {
  requireAuth,
  requireRole,
  requireSelfOrAdmin,
  UserRole
};