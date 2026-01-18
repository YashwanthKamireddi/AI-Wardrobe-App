/**
 * CSRF Protection Middleware
 *
 * Implements double-submit cookie pattern for CSRF protection.
 * Works with SPA architecture using tokens in headers.
 */

import { Request, Response, NextFunction } from "express";
import { randomBytes, createHash } from "crypto";
import { logger } from "../utils/logger";

// CSRF token storage (in production, use Redis)
const csrfTokens: Map<string, { token: string; expires: number }> = new Map();

// Token expiry time (1 hour)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// Clean up expired tokens periodically
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, value] of csrfTokens.entries()) {
        if (value.expires < now) {
            csrfTokens.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        logger.info(`CSRF: Cleaned ${cleaned} expired tokens`);
    }
}, 15 * 60 * 1000); // Every 15 minutes

/**
 * Generate a new CSRF token for a session
 */
function generateCsrfToken(sessionId: string): string {
    const token = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");

    csrfTokens.set(sessionId, {
        token: hash,
        expires: Date.now() + TOKEN_EXPIRY_MS,
    });

    return token;
}

/**
 * Validate a CSRF token
 */
function validateCsrfToken(sessionId: string, token: string): boolean {
    const stored = csrfTokens.get(sessionId);
    if (!stored) return false;

    if (stored.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return false;
    }

    const hash = createHash("sha256").update(token).digest("hex");
    return stored.token === hash;
}

/**
 * Middleware to set CSRF token cookie
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    // Get or create session ID
    let sessionId = req.cookies?.["session-id"];

    if (!sessionId) {
        sessionId = randomBytes(16).toString("hex");
        res.cookie("session-id", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
    }

    // Attach sessionId to request
    (req as any).csrfSessionId = sessionId;

    next();
}

/**
 * Endpoint to get CSRF token (called on app init)
 */
export function getCsrfToken(req: Request, res: Response) {
    const sessionId = (req as any).csrfSessionId || req.cookies?.["session-id"];

    if (!sessionId) {
        return res.status(400).json({ message: "Session not initialized" });
    }

    const token = generateCsrfToken(sessionId);

    res.json({ csrfToken: token });
}

/**
 * Middleware to validate CSRF token on state-changing requests
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction) {
    // Skip for safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const sessionId = (req as any).csrfSessionId || req.cookies?.["session-id"];
    const token = req.headers["x-csrf-token"] as string;

    if (!sessionId) {
        logger.warn("CSRF: No session ID found");
        return res.status(403).json({ message: "CSRF validation failed: no session" });
    }

    if (!token) {
        logger.warn("CSRF: No token in request headers");
        return res.status(403).json({ message: "CSRF validation failed: no token" });
    }

    if (!validateCsrfToken(sessionId, token)) {
        logger.warn("CSRF: Invalid token");
        return res.status(403).json({ message: "CSRF validation failed: invalid token" });
    }

    next();
}

/**
 * Utility to check if CSRF protection is enabled
 */
export function isCsrfEnabled(): boolean {
    return process.env.CSRF_PROTECTION !== "disabled";
}
