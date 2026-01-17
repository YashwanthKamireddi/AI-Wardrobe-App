/**
 * Authentication Middleware
 *
 * This module provides middleware functions for protecting routes
 * with authentication and authorization requirements.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
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
        logger.warn({
            path: req.path,
            method: req.method,
            ip: req.ip
        }, 'Unauthorized access attempt');
        return next(new AppError('You must be logged in to access this resource', 401));
    }

    // User is authenticated, proceed
    next();
}

/**
 * Middleware to require a specific role
 * Checks if the authenticated user has the required role
 */
export function requireRole(role: UserRole | UserRole[]) {
    return function (req: Request, _res: Response, next: NextFunction) {
        // First check if user is authenticated
        if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
            logger.warn({
                path: req.path,
                method: req.method,
                ip: req.ip
            }, 'Unauthorized role access attempt');
            return next(new AppError('You must be logged in to access this resource', 401));
        }

        // Check if user has the required role
        const userRole = req.user.role || UserRole.USER;
        const requiredRoles = Array.isArray(role) ? role : [role];

        if (!requiredRoles.includes(userRole as UserRole)) {
            logger.warn({
                path: req.path,
                method: req.method,
                userId: req.user.id,
                userRole,
                requiredRoles,
                ip: req.ip
            }, 'Forbidden access attempt');
            return next(new AppError('You do not have permission to access this resource', 403));
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
        logger.warn({
            path: req.path,
            method: req.method,
            ip: req.ip
        }, 'Unauthorized self-access attempt');
        return next(new AppError('You must be logged in to access this resource', 401));
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
        logger.warn({
            path: req.path,
            method: req.method,
            userId: req.user.id,
            targetId,
            ip: req.ip
        }, 'Forbidden self-access attempt');
        return next(new AppError('You do not have permission to access this resource', 403));
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
