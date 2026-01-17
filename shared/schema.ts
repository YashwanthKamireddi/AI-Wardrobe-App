/**
 * Database Schema Definitions for Cher's Closet Application
 *
 * This file contains all database table definitions and related types for the Cher's Closet
 * wardrobe management application. It serves as the central source of truth for the data model
 * across both frontend and backend parts of the application.
 *
 * Technology Stack:
 * - Drizzle ORM: Used for type-safe database operations and schema definition
 * - Zod: Provides runtime validation for data integrity
 * - PostgreSQL: The underlying database system
 *
 * Database Architecture:
 * The schema is designed around a user-centric model where each user has:
 * - A personal wardrobe (collection of clothing items)
 * - Created outfits (combinations of wardrobe items)
 * - Weather and mood preferences that influence recommendations
 * - Access to shared fashion inspiration content
 *
 * Each table has:
 * 1. A table definition (pgTable) with column specifications
 * 2. An insert schema with validation rules (createInsertSchema)
 * 3. Type definitions for strongly-typed database operations
 *
 * Relationships:
 * - Users ← Wardrobe Items (one-to-many)
 * - Users ← Outfits (one-to-many)
 * - Wardrobe Items ← Outfits (many-to-many via items array)
 * - Users ← Weather/Mood Preferences (one-to-many)
 * - Inspirations (standalone, accessible by all users)
 *
 * IMPORTANT: When modifying the schema, run 'npm run db:push' to apply changes to the database.
 * Never manually write SQL migrations as they could lead to data inconsistency.
 */

import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Zod Enums & Constants ---

/**
 * Clothing Categories
 *
 * Defines all available clothing categories and their subcategories
 * Used for consistent categorization across the application
 */
export const clothingCategories = [
    { value: "tops", label: "Tops", subcategories: ["t-shirt", "blouse", "shirt", "sweater", "tank top", "crop top"] },
    { value: "bottoms", label: "Bottoms", subcategories: ["jeans", "skirt", "shorts", "pants", "leggings"] },
    { value: "dresses", label: "Dresses", subcategories: ["casual dress", "formal dress", "sundress", "maxi dress"] },
    { value: "outerwear", label: "Outerwear", subcategories: ["jacket", "coat", "blazer", "cardigan", "hoodie"] },
    { value: "shoes", label: "Shoes", subcategories: ["sneakers", "heels", "boots", "sandals", "flats", "loafers"] },
    { value: "accessories", label: "Accessories", subcategories: ["hat", "scarf", "jewelry", "bag", "belt", "sunglasses"] },
    { value: "makeup", label: "Makeup", subcategories: ["lipstick", "eyeshadow", "foundation", "blush", "mascara"] }
];

/**
 * Weather Types
 *
 * Standard weather condition classifications used for weather-based outfit recommendations
 */
export const weatherTypes = [
    { value: "sunny", label: "Sunny" },
    { value: "rainy", label: "Rainy" },
    { value: "cloudy", label: "Cloudy" },
    { value: "snowy", label: "Snowy" },
    { value: "windy", label: "Windy" },
    { value: "hot", label: "Hot" },
    { value: "cold", label: "Cold" }
];

/**
 * Mood Types
 *
 * Standard mood classifications used for mood-based outfit recommendations
 * These influence color choices and style combinations
 */
export const moodTypes = [
    { value: "happy", label: "Happy" },
    { value: "confident", label: "Confident" },
    { value: "relaxed", label: "Relaxed" },
    { value: "energetic", label: "Energetic" },
    { value: "romantic", label: "Romantic" },
    { value: "professional", label: "Professional" },
    { value: "creative", label: "Creative" }
];

/**
 * Seasons
 *
 * Standard seasonal classifications for clothing items
 * Used to associate items with appropriate weather conditions
 */
export const seasons = [
    { value: "winter", label: "Winter" },
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "fall", label: "Fall" },
    { value: "all", label: "All Seasons" }
];

// Extract values for strict validation
export const CATEGORIES = clothingCategories.map(c => c.value) as [string, ...string[]];
export const SEASONS = seasons.map(s => s.value) as [string, ...string[]];
export const WEATHER_TYPES = weatherTypes.map(w => w.value) as [string, ...string[]];
export const MOOD_TYPES = moodTypes.map(m => m.value) as [string, ...string[]];
export const TRIP_STATUSES = ["upcoming", "active", "completed", "cancelled"] as const;
export const TRIP_TYPES = ["business", "vacation", "adventure", "city", "relaxing", "family"] as const;

// --- Drizzle Tables & Schemas ---

// Session storage table for user authentication sessions with PostgreSQL
export const sessions = pgTable(
    "sessions",
    {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull(),
    },
    (table) => [index("IDX_session_expire").on(table.expire)],
);

/**
 * Users Table
 *
 * Purpose:
 * - Stores user account information and authentication details
 * - Serves as the central entity that all personal data relates to
 *
 * Features:
 * - Secure password storage (hashed using bcrypt in auth.ts)
 * - Unique username constraint to prevent duplicates
 * - Optional profile information (name, email, profile picture)
 *
 * Used in:
 * - Authentication flows (login, register, password change)
 * - User profile pages
 * - Authorization middleware to restrict access to personal data
 */
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    name: text("name"),
    email: text("email"),
    profilePicture: text("profile_picture"),
    role: text("role").default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
    name: true,
    email: true,
    profilePicture: true,
    role: true,
});

// Safe registration schema - excludes privileged fields (id, role)
export const registerUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
    name: true,
    email: true,
    profilePicture: true,
}).extend({
    username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    name: z.string().min(2, "Name too short").max(50, "Name too long").optional(),
    email: z.string().email("Invalid email").max(100, "Email too long").optional(),
});

/**
 * Wardrobe Items Table
 *
 * Purpose:
 * - Stores all clothing items in a user's digital wardrobe with detailed attributes
 * - Serves as the foundation for outfit creation and recommendations
 * - Provides data for AI-powered styling suggestions and analytics
 *
 * Features:
 * - Comprehensive categorization system (category, subcategory)
 * - Visual representation through image URLs
 * - Seasonal appropriateness tagging
 * - Customizable tags for filtering and organization
 * - Favorite flag for quick access to preferred items
 *
 * Used in:
 * - Wardrobe management pages (viewing, adding, editing items)
 * - Outfit creation workflows
 * - AI recommendation algorithms
 * - Style analysis and trends detection
 */
export const wardrobeItems = pgTable("wardrobe_items", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(), // tops, bottoms, dresses, outerwear, accessories, shoes, etc.
    subcategory: text("subcategory"), // t-shirt, jeans, sneakers, etc.
    color: text("color"),
    brand: text("brand"), // brand/designer name
    size: text("size"), // S, M, L, XL, or specific sizes
    season: text("season"), // winter, summer, spring, fall, all
    imageUrl: text("image_url").notNull(),
    tags: text("tags").array(), // casual, formal, sporty, etc.
    favorite: boolean("favorite").default(false),
    // Wear tracking
    wearCount: integer("wear_count").default(0),
    lastWorn: timestamp("last_worn"),
    // Purchase info
    purchasePrice: integer("purchase_price"), // in cents for precision
    purchaseDate: timestamp("purchase_date"),
    purchaseLocation: text("purchase_location"), // store name or website
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("wardrobe_items_user_id_idx").on(table.userId),
    categoryIdx: index("wardrobe_items_category_idx").on(table.category),
    userCategoryIdx: index("wardrobe_items_user_category_idx").on(table.userId, table.category),
}));

export const insertWardrobeItemSchema = createInsertSchema(wardrobeItems).pick({
    userId: true,
    name: true,
    category: true,
    subcategory: true,
    color: true,
    brand: true,
    size: true,
    season: true,
    imageUrl: true,
    tags: true,
    favorite: true,
    wearCount: true,
    lastWorn: true,
    purchasePrice: true,
    purchaseDate: true,
    purchaseLocation: true,
}).extend({
    name: z.string().min(1, "Name is required").max(100),
    category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Invalid category" }) }),
    season: z.enum(SEASONS).optional(),
    imageUrl: z.string().url("Invalid image URL"),
    wearCount: z.number().int().min(0).default(0),
    purchasePrice: z.number().int().positive().optional(),
    purchaseDate: z.coerce.date().optional(),
});

/**
 * Outfits Table
 *
 * Purpose:
 * - Stores assembled outfits created by users or generated by the AI recommendation engine
 * - Enables outfit planning, sharing, and selection based on various criteria
 * - Captures contextual information like occasions, weather conditions, and moods
 *
 * Features:
 * - References individual wardrobe items through the items array (many-to-many relationship)
 * - Contextual tagging (occasion, season, weather, mood)
 * - Descriptive information for outfit context and styling notes
 * - Favorite flag for quick access to frequently worn outfits
 *
 * Used in:
 * - Outfit creation and browsing pages
 * - Calendar-based outfit planning features
 * - Smart outfit recommendations based on weather and mood
 * - Sharing capabilities for social features
 * - Style analysis and usage statistics
 */
export const outfits = pgTable("outfits", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"), // detailed description of the outfit
    items: integer("items").array().notNull(), // IDs of wardrobe items in this outfit
    occasion: text("occasion"), // casual, work, party, etc.
    season: text("season"), // winter, summer, spring, fall, all
    favorite: boolean("favorite").default(false),
    weatherConditions: text("weather_conditions"), // sunny, rainy, cold, etc.
    mood: text("mood"), // happy, confident, relaxed, etc.
    // Wear tracking
    wearCount: integer("wear_count").default(0),
    lastWorn: timestamp("last_worn"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    rating: integer("rating"), // 1-5 star rating
}, (table) => ({
    userIdIdx: index("outfits_user_id_idx").on(table.userId),
    seasonIdx: index("outfits_season_idx").on(table.season),
    userSeasonIdx: index("outfits_user_season_idx").on(table.userId, table.season),
}));

export const insertOutfitSchema = createInsertSchema(outfits).pick({
    userId: true,
    name: true,
    description: true,
    items: true,
    occasion: true,
    season: true,
    favorite: true,
    weatherConditions: true,
    mood: true,
    wearCount: true,
    lastWorn: true,
    rating: true,
}).extend({
    name: z.string().min(1, "Name is required"),
    items: z.array(z.number()).min(1, "Outfit must have at least one item"),
    season: z.enum(SEASONS).optional(),
    mood: z.enum(MOOD_TYPES).optional(),
    weatherConditions: z.enum(WEATHER_TYPES).optional(),
    rating: z.number().min(1).max(5).optional(),
});

/**
 * Outfit Calendar Table
 *
 * Purpose:
 * - Stores planned outfits for specific dates
 * - Enables users to schedule what to wear in advance
 * - Supports trip planning and packing lists
 */
export const outfitCalendar = pgTable("outfit_calendar", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    outfitId: integer("outfit_id"), // Can be null for "open slot"
    date: timestamp("date").notNull(),
    eventName: text("event_name"), // "Work", "Date Night", "Wedding", etc.
    notes: text("notes"),
    isWorn: boolean("is_worn").default(false), // Did they actually wear this?
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("outfit_calendar_user_id_idx").on(table.userId),
    dateIdx: index("outfit_calendar_date_idx").on(table.date),
    userDateIdx: index("outfit_calendar_user_date_idx").on(table.userId, table.date),
}));

export const insertOutfitCalendarSchema = createInsertSchema(outfitCalendar).pick({
    userId: true,
    outfitId: true,
    date: true,
    eventName: true,
    notes: true,
    isWorn: true,
}).extend({
    date: z.coerce.date(),
});

export type OutfitCalendar = typeof outfitCalendar.$inferSelect;
export type InsertOutfitCalendar = z.infer<typeof insertOutfitCalendarSchema>;

/**
 * Wear Log Table
 *
 * Purpose:
 * - Tracks when individual items or outfits are worn
 * - Enables statistics like "cost per wear" and "most worn items"
 */
export const wearLog = pgTable("wear_log", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    wardrobeItemId: integer("wardrobe_item_id"),
    outfitId: integer("outfit_id"),
    wornDate: timestamp("worn_date").notNull(),
    occasion: text("occasion"),
    notes: text("notes"),
    rating: integer("rating"), // How did they feel in this? 1-5
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("wear_log_user_id_idx").on(table.userId),
    wardrobeItemIdIdx: index("wear_log_wardrobe_item_id_idx").on(table.wardrobeItemId),
    outfitIdIdx: index("wear_log_outfit_id_idx").on(table.outfitId),
}));

export const insertWearLogSchema = createInsertSchema(wearLog).pick({
    userId: true,
    wardrobeItemId: true,
    outfitId: true,
    wornDate: true,
    occasion: true,
    notes: true,
    rating: true,
}).extend({
    wornDate: z.coerce.date(),
    rating: z.number().min(1).max(5).optional(),
});

export type WearLog = typeof wearLog.$inferSelect;
export type InsertWearLog = typeof wearLog.$inferInsert;

/**
 * Inspirations Table
 *
 * Purpose:
 * - Stores curated fashion inspiration images and content from various sources
 * - Provides styling ideas, trend information, and creative concepts
 * - Serves as a shared resource accessible to all users (non-user-specific)
 *
 * Features:
 * - Visual content through high-quality fashion imagery
 * - Rich descriptive information and context for each inspiration
 * - Categorization and tagging system for filtering and discovery
 * - Source attribution for external content
 *
 * Used in:
 * - Inspiration browsing pages
 * - Mood boards and style collages
 * - Fashion trend analysis and recommendations
 * - Educational content about style principles
 * - Contextual suggestions alongside outfit creation
 */
export const inspirations = pgTable("inspirations", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url").notNull(),
    tags: text("tags").array(), // tags for filtering
    category: text("category"), // casual, formal, trends, etc.
    source: text("source"), // source of the inspiration
    content: text("content"), // detailed content/text of the inspiration
});

export const insertInspirationSchema = createInsertSchema(inspirations).pick({
    title: true,
    description: true,
    imageUrl: true,
    tags: true,
    category: true,
    source: true,
    content: true,
});

/**
 * Weather Preferences Table
 *
 * Purpose:
 * - Stores user-specific clothing preferences based on different weather conditions
 * - Enables highly personalized outfit recommendations based on current weather
 * - Improves the relevance of AI-generated styling suggestions
 *
 * Features:
 * - Links users to their preferred clothing categories for specific weather types
 * - Supports multiple preference records per user (one per weather condition)
 * - Flexible array storage for clothing category preferences
 *
 * Used in:
 * - Weather-aware outfit recommendation algorithms
 * - Weather integration features on the home and outfit pages
 * - User preference management interfaces
 * - Machine learning model training for personalized recommendations
 */
export const weatherPreferences = pgTable("weather_preferences", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    weatherType: text("weather_type").notNull(), // sunny, rainy, cold, hot, etc.
    preferredCategories: text("preferred_categories").array(), // categories preferred for this weather
});

export const insertWeatherPreferenceSchema = createInsertSchema(weatherPreferences).pick({
    userId: true,
    weatherType: true,
    preferredCategories: true,
}).extend({
    weatherType: z.enum(WEATHER_TYPES),
    preferredCategories: z.array(z.enum(CATEGORIES)).optional(),
});

/**
 * Mood Preferences Table
 *
 * Purpose:
 * - Stores user-specific clothing and color preferences based on different emotional states
 * - Enables emotionally intelligent outfit recommendations that match user's current mood
 * - Provides a unique personalization layer beyond conventional style preferences
 *
 * Features:
 * - Links users to both preferred clothing categories and colors for specific moods
 * - Supports multiple preference records per user (one per mood type)
 * - Flexible array storage for both category and color preferences
 *
 * Used in:
 * - Mood-based outfit recommendation algorithms
 * - Mood selection interfaces on the home and outfit pages
 * - User preference settings management
 * - Emotional intelligence aspects of the AI styling engine
 * - Color psychology applications in fashion recommendations
 */
export const moodPreferences = pgTable("mood_preferences", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    mood: text("mood").notNull(), // happy, confident, relaxed, etc.
    preferredCategories: text("preferred_categories").array(), // categories preferred for this mood
    preferredColors: text("preferred_colors").array(), // colors preferred for this mood
});

export const insertMoodPreferenceSchema = createInsertSchema(moodPreferences).pick({
    userId: true,
    mood: true,
    preferredCategories: true,
    preferredColors: true,
}).extend({
    mood: z.enum(MOOD_TYPES),
    preferredCategories: z.array(z.enum(CATEGORIES)).optional(),
});

/**
 * Type Definitions
 *
 * These types provide type safety for database operations throughout the application.
 * Each type corresponds to a table in the database.
 */
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WardrobeItem = typeof wardrobeItems.$inferSelect;
export type InsertWardrobeItem = z.infer<typeof insertWardrobeItemSchema>;

export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

export type Inspiration = typeof inspirations.$inferSelect;
export type InsertInspiration = z.infer<typeof insertInspirationSchema>;

export type WeatherPreference = typeof weatherPreferences.$inferSelect;
export type InsertWeatherPreference = z.infer<typeof insertWeatherPreferenceSchema>;

export type MoodPreference = typeof moodPreferences.$inferSelect;
export type InsertMoodPreference = z.infer<typeof insertMoodPreferenceSchema>;



/**
 * Trips Table
 *
 * Purpose:
 * - Stores travel plans to organize packing lists
 * - Allows different packing lists for different destinations/weather
 */
export const trips = pgTable("trips", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    destination: text("destination").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    type: text("type").notNull(), // business, vacation, adventure, city
    packedItems: integer("packed_items").array(), // IDs of wardrobe items packed
    status: text("status").default("upcoming"), // upcoming, past
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("trips_user_id_idx").on(table.userId),
}));

export const insertTripSchema = createInsertSchema(trips).pick({
    userId: true,
    name: true,
    destination: true,
    startDate: true,
    endDate: true,
    type: true,
    packedItems: true,
    status: true,
}).extend({
    // Allow ISO strings to be coerced to Date objects
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
