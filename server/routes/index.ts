/**
 * Routes Index
 * Combines all modular route files into a single registration function
 */

import { Express } from "express";

// Import modular routes
import wardrobeRoutes from "./wardrobe.routes";
import outfitRoutes from "./outfit.routes";
import preferencesRoutes from "./preferences.routes";
import wearLogRoutes from "./wear-log.routes";
import uploadRoutes from "./upload.routes";
import aiRoutes from "./ai.routes";
import analyticsRoutes from "./analytics.routes";
import socialRoutes from "./social.routes";
import advancedRoutes from "./advanced.routes";

/**
 * Register all API routes
 */
export function registerModularRoutes(app: Express): void {
    // Wardrobe management
    app.use("/api/wardrobe", wardrobeRoutes);

    // Outfit management
    app.use("/api/outfits", outfitRoutes);

    // User preferences (weather & mood)
    app.use("/api", preferencesRoutes);

    // Wear tracking
    app.use("/api/wear-log", wearLogRoutes);

    // File uploads
    app.use("/api", uploadRoutes);

    // AI-powered features (recommendations, analytics)
    app.use("/api/ai", aiRoutes);

    // Analytics and insights
    app.use("/api/analytics", analyticsRoutes);

    // Social features (Phase 2)
    app.use("/api/social", socialRoutes);

    // Advanced features (Phase 3)
    app.use("/api", advancedRoutes);
}

export default registerModularRoutes;
