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
        const sessionSettings: session.SessionOptions = {
            secret: process.env.SESSION_SECRET || "chers-closet-secret-key",
            resave: false,
            saveUninitialized: false,
            store: storage.sessionStore,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                httpOnly: true,
                secure: false, // Set to false for development on Replit/Local
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
                    if (!user || !(await AuthService.comparePasswords(password, user.password))) {
                        logger.warn(`Failed login attempt for username: ${username}`);
                        return done(null, false);
                    } else {
                        logger.info(`User logged in: ${username}`);
                        return done(null, user);
                    }
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
