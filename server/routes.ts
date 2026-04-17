
import type { Express } from "express";
import { upload } from "./config/upload";
import { uploadRateLimiter } from "./middleware";

// Import Controllers
import * as wardrobeController from "./controllers/wardrobe-controller";
import * as outfitController from "./controllers/outfit-controller";
import * as tripsController from "./controllers/trips-controller";
import * as servicesController from "./controllers/services-controller";
import * as preferencesController from "./controllers/preferences-controller";
import * as wearLogController from "./controllers/wear-log-controller";
import * as aiController from "./controllers/ai-controller";
import * as inspirationsController from "./controllers/inspirations-controller";
import * as advancedController from "./controllers/advanced-controller";
import * as socialController from "./controllers/social-controller";
import * as intelligenceController from "./controllers/intelligence-controller";


export async function registerRoutes(app: Express): Promise<void> {

    // ============================================
    // SERVICES & UTILITIES
    // ============================================
    app.post("/api/upload-image", uploadRateLimiter, upload.single('image'), servicesController.uploadImageHandler);
    app.post("/api/scrape-product", servicesController.scrapeProduct);
    app.get("/api/analytics/wardrobe", servicesController.getAnalytics);
    app.get("/api/weather", servicesController.getWeather);

    // ============================================
    // WARDROBE
    // ============================================
    app.get("/api/wardrobe", wardrobeController.getWardrobeItems);
    app.post("/api/wardrobe", wardrobeController.createWardrobeItem);
    app.post("/api/wardrobe/seed", wardrobeController.seedWardrobe);
    app.get("/api/wardrobe/:id", wardrobeController.getWardrobeItem);
    app.patch("/api/wardrobe/:id", wardrobeController.updateWardrobeItem);
    app.delete("/api/wardrobe/:id", wardrobeController.deleteWardrobeItem);

    // ============================================
    // OUTFITS & CALENDAR
    // ============================================
    app.get("/api/outfits", outfitController.getOutfits);
    app.post("/api/outfits", outfitController.createOutfit);
    app.get("/api/outfits/:id", outfitController.getOutfit);
    app.patch("/api/outfits/:id", outfitController.updateOutfit);
    app.delete("/api/outfits/:id", outfitController.deleteOutfit);
    app.post("/api/outfits/:id/share", outfitController.shareOutfit);

    // Public shared outfit route
    app.get("/api/shared-outfit/:shareId", outfitController.getSharedOutfit);

    app.get("/api/calendar-outfits", outfitController.getCalendarOutfits);
    app.post("/api/calendar-outfits", outfitController.scheduleOutfit);
    app.delete("/api/calendar-outfits/:id", outfitController.deleteCalendarEvent);

    // ============================================
    // TRIPS
    // ============================================
    app.get("/api/trips", tripsController.getTrips);
    app.post("/api/trips", tripsController.createTrip);
    app.patch("/api/trips/:id", tripsController.updateTrip);
    app.delete("/api/trips/:id", tripsController.deleteTrip);

    // ============================================
    // PREFERENCES (Weather & Mood)
    // ============================================
    app.get("/api/weather-preferences", preferencesController.getWeatherPreferences);
    app.post("/api/weather-preferences", preferencesController.createWeatherPreference);
    app.put("/api/weather-preferences/:id", preferencesController.updateWeatherPreference);
    app.delete("/api/weather-preferences/:id", preferencesController.deleteWeatherPreference);

    app.get("/api/mood-preferences", preferencesController.getMoodPreferences);
    app.post("/api/mood-preferences", preferencesController.createMoodPreference);
    app.put("/api/mood-preferences/:id", preferencesController.updateMoodPreference);
    app.delete("/api/mood-preferences/:id", preferencesController.deleteMoodPreference);

    // ============================================
    // WEAR LOGS
    // ============================================
    app.get("/api/wear-log", wearLogController.getWearLogs);
    // Note: original had /api/wardrobe/:id/wear-log
    app.get("/api/wardrobe/:id/wear-log", wearLogController.getItemWearLogs);
    app.post("/api/wear-log", wearLogController.createWearLog);
    app.delete("/api/wear-log/:id", wearLogController.deleteWearLog);

    // ============================================
    // AI & INTELLIGENCE
    // ============================================
    app.post("/api/ai-outfit-recommendations", aiController.getAdvancedOutfitRecommendations);
    app.get("/api/style-profile", aiController.createStyleProfile);
    app.get("/api/style-analysis", aiController.analyzeStyle);
    app.post("/api/occasion-outfit", aiController.getOccasionOutfit);

    // ============================================
    // INSPIRATIONS
    // ============================================
    app.get("/api/inspirations", inspirationsController.getInspirations);
    app.get("/api/inspirations/:id", inspirationsController.getInspiration);

    // ============================================
    // CAPSULE WARDROBES
    // ============================================
    app.get("/api/capsules", advancedController.getCapsules);
    app.post("/api/capsules", advancedController.createCapsule);
    app.put("/api/capsules/:id", advancedController.updateCapsule);
    app.delete("/api/capsules/:id", advancedController.deleteCapsule);

    // ============================================
    // WISHLIST
    // ============================================
    app.get("/api/wishlist", advancedController.getWishlist);
    app.post("/api/wishlist", advancedController.addToWishlist);
    app.delete("/api/wishlist/:id", advancedController.removeFromWishlist);
    app.post("/api/wishlist/:id/convert", advancedController.convertWishlistToWardrobe);

    // ============================================
    // WEAR LOGGING
    // ============================================
    app.get("/api/wear-logs", advancedController.getWearLogs);
    app.post("/api/wear-logs", advancedController.createWearLog);
    app.delete("/api/wear-logs/:id", advancedController.deleteWearLog);

    // ============================================
    // SEASONAL FILTERS
    // ============================================
    app.get("/api/wardrobe/seasonal", advancedController.getWardrobeBySeasonalFilter);

    // ============================================
    // SOCIAL FEATURES
    // ============================================
    app.get("/api/social/feed", socialController.getCommunityFeed);
    app.post("/api/social/follow/:userId", socialController.followUser);
    app.delete("/api/social/unfollow/:userId", socialController.unfollowUser);
    app.post("/api/social/outfits/:outfitId/like", socialController.likeOutfit);
    app.delete("/api/social/outfits/:outfitId/like", socialController.unlikeOutfit);
    app.post("/api/social/outfits/:outfitId/share", socialController.shareOutfit);
    app.get("/api/social/challenges", socialController.getChallenges);
    app.post("/api/social/challenges/:challengeId/submit", socialController.submitToChallenge);

    // ============================================
    // WARDROBE INTELLIGENCE (AI Shopping Advisor)
    // ============================================
    app.get("/api/wardrobe/intelligence", intelligenceController.getWardrobeIntelligence);
    app.get("/api/wardrobe/shopping-recommendations", intelligenceController.getShoppingRecommendations);

}
