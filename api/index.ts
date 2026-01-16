/**
 * Vercel Serverless Function Entrypoint
 *
 * This file wraps the Express app for Vercel's serverless environment.
 * All /api/* requests are routed here.
 */

// Load environment config
import '../server/config/app-config';

import { createApp } from '../server/app';

let app: ReturnType<typeof createApp> | null = null;

// Export the Express app as a Vercel serverless function
export default async function handler(req: any, res: any) {
    // Lazy-initialize the app
    if (!app) {
        app = createApp();
    }
    const expressApp = await app;
    return expressApp(req, res);
}
