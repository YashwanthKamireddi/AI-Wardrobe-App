import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import storage from "../../storage";
import { User as SelectUser } from "@shared/schema";
import { logger } from "../../utils/logger";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

export class AuthService {
    static async hashPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    static async comparePasswords(supplied: string, stored: string) {
        return bcrypt.compare(supplied, stored);
    }

    static setup(app: Express) {
        const isProd = process.env.NODE_ENV === "production";

        // Fail fast in production if SESSION_SECRET isn't configured — a weak
        // hardcoded fallback would let anyone forge valid session cookies.
        if (isProd && !process.env.SESSION_SECRET) {
            throw new Error(
                "SESSION_SECRET env var is required in production. Refusing to boot with an insecure fallback."
            );
        }
        if (!process.env.SESSION_SECRET) {
            logger.warn("[Auth] SESSION_SECRET not set. Using insecure dev fallback — do NOT run this in production.");
        }

        const sessionSettings: session.SessionOptions = {
            secret: process.env.SESSION_SECRET || "vessura-dev-only-insecure-fallback",
            resave: false,
            saveUninitialized: false,
            store: storage.sessionStore,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                httpOnly: true,
                secure: isProd, // HTTPS only in prod; off in dev for localhost
                sameSite: "lax",
            },
        };

        app.set("trust proxy", 1);
        app.use(session(sessionSettings));
        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(
            new LocalStrategy(async (username, password, done) => {
                try {
                    const user = await storage.getUserByUsername(username);
                    logger.info(`[Auth] Login attempt for: ${username}, User found: ${!!user}`);

                    if (!user) {
                        logger.warn(`[Auth] User not found: ${username}`);
                        return done(null, false);
                    }

                    // Debug: Log password hash info (NOT the actual passwords)
                    const hasPassword = !!user.password;
                    const passwordLength = user.password?.length || 0;
                    const isHash = user.password?.startsWith('$2') || false;
                    logger.info(`[Auth] Password check: hasPassword=${hasPassword}, length=${passwordLength}, isHash=${isHash}`);

                    const passwordMatch = await AuthService.comparePasswords(password, user.password);
                    logger.info(`[Auth] Password match result: ${passwordMatch}`);

                    if (!passwordMatch) {
                        logger.warn(`[Auth] Invalid password for user: ${username}`);
                        return done(null, false);
                    }

                    logger.info(`[Auth] User logged in successfully: ${username}`);
                    return done(null, user);
                } catch (error) {
                    logger.error({ err: error }, "Error during local strategy authentication");
                    return done(error);
                }
            }),
        );

        passport.serializeUser((user, done) => done(null, user.id));
        passport.deserializeUser(async (id: number, done) => {
            try {
                const user = await storage.getUser(id as number);
                done(null, user);
            } catch (error) {
                logger.error({ err: error, userId: id }, 'Failed to deserialize user');
                done(error);
            }
        });

        logger.info("AuthService: Passport and Sessions initialized");
    }
}
