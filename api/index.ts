/**
 * Vercel Serverless Function - Complete Backend
 *
 * This file provides a self-contained Express API for Vercel deployment.
 * All /api/* requests are routed here.
 *
 * Features:
 * - Authentication (Register, Login, Logout)
 * - Wardrobe CRUD
 * - Outfits CRUD
 * - Weather API (Open-Meteo)
 * - In-Memory Storage (no DB required)
 */

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import MemoryStore from 'memorystore';
import axios from 'axios';

// ============================================
// EXPRESS APP SETUP
// ============================================
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1);

// Session Setup
const MemorySessionStore = MemoryStore(session);
app.use(session({
    secret: process.env.SESSION_SECRET || 'celura-session-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemorySessionStore({ checkPeriod: 86400000 }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    },
}));

app.use(passport.initialize());
app.use(passport.session());

// ============================================
// IN-MEMORY DATA STORES
// ============================================
interface User {
    id: number;
    username: string;
    password: string;
    name?: string;
    email?: string;
    profilePicture?: string;
}

interface WardrobeItem {
    id: number;
    userId: number;
    name: string;
    category: string;
    color?: string;
    brand?: string;
    imageUrl?: string;
    tags?: string[];
    createdAt: Date;
}

interface Outfit {
    id: number;
    userId: number;
    name: string;
    items: number[];
    occasion?: string;
    notes?: string;
    createdAt: Date;
}

const users = new Map<number, User>();
const wardrobeItems = new Map<number, WardrobeItem>();
const outfits = new Map<number, Outfit>();

let userIdCounter = 1;
let wardrobeIdCounter = 1;
let outfitIdCounter = 1;

// ============================================
// PASSPORT SETUP
// ============================================
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

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// ============================================
// AUTH ROUTES
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existing = Array.from(users.values()).find(u => u.username === username);
        if (existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: User = { id: userIdCounter++, username, password: hashedPassword, name, email };
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

app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Unauthorized' });
    const { password: _, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
});

// ============================================
// WARDROBE ROUTES
// ============================================
app.get('/api/wardrobe', requireAuth, (req, res) => {
    const userId = (req.user as User).id;
    const items = Array.from(wardrobeItems.values()).filter(item => item.userId === userId);
    res.json(items);
});

app.post('/api/wardrobe', requireAuth, (req, res) => {
    const userId = (req.user as User).id;
    const { name, category, color, brand, imageUrl, tags } = req.body;

    const newItem: WardrobeItem = {
        id: wardrobeIdCounter++,
        userId,
        name: name || 'Untitled Item',
        category: category || 'other',
        color,
        brand,
        imageUrl,
        tags: tags || [],
        createdAt: new Date(),
    };

    wardrobeItems.set(newItem.id, newItem);
    res.status(201).json(newItem);
});

app.get('/api/wardrobe/:id', requireAuth, (req, res) => {
    const item = wardrobeItems.get(parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

app.patch('/api/wardrobe/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const item = wardrobeItems.get(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const updated = { ...item, ...req.body };
    wardrobeItems.set(id, updated);
    res.json(updated);
});

app.delete('/api/wardrobe/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    if (!wardrobeItems.has(id)) return res.status(404).json({ message: 'Item not found' });
    wardrobeItems.delete(id);
    res.json({ message: 'Item deleted' });
});

// ============================================
// OUTFITS ROUTES
// ============================================
app.get('/api/outfits', requireAuth, (req, res) => {
    const userId = (req.user as User).id;
    const userOutfits = Array.from(outfits.values()).filter(o => o.userId === userId);
    res.json(userOutfits);
});

app.post('/api/outfits', requireAuth, (req, res) => {
    const userId = (req.user as User).id;
    const { name, items, occasion, notes } = req.body;

    const newOutfit: Outfit = {
        id: outfitIdCounter++,
        userId,
        name: name || 'Untitled Outfit',
        items: items || [],
        occasion,
        notes,
        createdAt: new Date(),
    };

    outfits.set(newOutfit.id, newOutfit);
    res.status(201).json(newOutfit);
});

app.get('/api/outfits/:id', requireAuth, (req, res) => {
    const outfit = outfits.get(parseInt(req.params.id));
    if (!outfit) return res.status(404).json({ message: 'Outfit not found' });
    res.json(outfit);
});

app.patch('/api/outfits/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const outfit = outfits.get(id);
    if (!outfit) return res.status(404).json({ message: 'Outfit not found' });

    const updated = { ...outfit, ...req.body };
    outfits.set(id, updated);
    res.json(updated);
});

app.delete('/api/outfits/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    if (!outfits.has(id)) return res.status(404).json({ message: 'Outfit not found' });
    outfits.delete(id);
    res.json({ message: 'Outfit deleted' });
});

// ============================================
// WEATHER ROUTE (Open-Meteo - No API Key Required)
// ============================================
app.get('/api/weather', async (req, res) => {
    try {
        const location = req.query.location as string;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        let lat: number, lon: number;
        let locationName = location;

        // Check if location is "lat,long" format
        if (location.includes(',')) {
            const [latStr, lonStr] = location.split(',');
            lat = parseFloat(latStr);
            lon = parseFloat(lonStr);
            locationName = 'Current Location';
        } else {
            // Geocode the city name
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
            const geoRes = await axios.get(geoUrl);

            if (!geoRes.data.results || geoRes.data.results.length === 0) {
                return res.status(404).json({ message: 'Location not found' });
            }

            lat = geoRes.data.results[0].latitude;
            lon = geoRes.data.results[0].longitude;
            locationName = geoRes.data.results[0].name;
        }

        // Fetch Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`;
        const weatherRes = await axios.get(weatherUrl);
        const data = weatherRes.data.current;

        // Map WMO Weather Codes
        const wmoCode = data.weather_code;
        let condition = 'Clear';
        let icon = 'sun';

        if (wmoCode === 0) { condition = 'Clear Sky'; icon = 'sun'; }
        else if (wmoCode >= 1 && wmoCode <= 3) { condition = 'Cloudy'; icon = 'cloud'; }
        else if (wmoCode >= 45 && wmoCode <= 48) { condition = 'Foggy'; icon = 'cloud-fog'; }
        else if (wmoCode >= 51 && wmoCode <= 55) { condition = 'Drizzle'; icon = 'cloud-drizzle'; }
        else if (wmoCode >= 61 && wmoCode <= 65) { condition = 'Rain'; icon = 'cloud-rain'; }
        else if (wmoCode >= 71 && wmoCode <= 77) { condition = 'Snow'; icon = 'cloud-snow'; }
        else if (wmoCode >= 80 && wmoCode <= 82) { condition = 'Heavy Rain'; icon = 'cloud-lightning'; }
        else if (wmoCode >= 95 && wmoCode <= 99) { condition = 'Thunderstorm'; icon = 'cloud-lightning'; }

        res.json({
            location: locationName,
            temperature: Math.round(data.temperature_2m),
            condition,
            humidity: data.relative_humidity_2m,
            windSpeed: data.wind_speed_10m,
            icon,
        });

    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ message: 'Failed to fetch weather data' });
    }
});

// ============================================
// CATCH-ALL
// ============================================
app.all('/api/*', (req, res) => {
    res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.path}` });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

export default app;
