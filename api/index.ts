/**
 * Vercel Serverless Function Entrypoint
 *
 * This file wraps the Express app for Vercel's serverless environment.
 * All /api/* requests are routed here.
 *
 * Note: We avoid path aliases (@shared, etc.) as they don't work in Vercel's runtime.
 */

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import MemoryStore from 'memorystore';

// Create Express App
const app = express();

// Basic Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1);

// Session Setup (In-Memory for Vercel serverless)
const MemorySessionStore = MemoryStore(session);
app.use(session({
    secret: process.env.SESSION_SECRET || 'celura-session-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemorySessionStore({ checkPeriod: 86400000 }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    },
}));

app.use(passport.initialize());
app.use(passport.session());

// Simple in-memory user store (for demo, will be replaced by Supabase/DB later)
const users: Map<number, { id: number; username: string; password: string; name?: string }> = new Map();
let userIdCounter = 1;

// Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = Array.from(users.values()).find(u => u.username === username);
        if (!user) return done(null, false, { message: 'Invalid username or password' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return done(null, false, { message: 'Invalid username or password' });

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => {
    const user = users.get(id);
    done(null, user || null);
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', environment: process.env.NODE_ENV || 'development' });
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existing = Array.from(users.values()).find(u => u.username === username);
        if (existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: userIdCounter++, username, password: hashedPassword, name };
        users.set(newUser.id, newUser);

        req.login(newUser, (err) => {
            if (err) return res.status(500).json({ message: 'Login failed after registration' });
            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json(userWithoutPassword);
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register' });
    }
});

// Login
app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || 'Invalid username or password' });

        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        });
    })(req, res, next);
});

// Logout
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
    const { password: _, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
});

// Catch-all for unhandled API routes
app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Export handler for Vercel
export default app;
