import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  profilePicture: text("profile_picture"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  profilePicture: true,
});

// Wardrobe item schema
export const wardrobeItems = pgTable("wardrobe_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // tops, bottoms, dresses, outerwear, accessories, shoes, etc.
  subcategory: text("subcategory"), // t-shirt, jeans, sneakers, etc.
  color: text("color"),
  season: text("season"), // winter, summer, spring, fall, all
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array(), // casual, formal, sporty, etc.
  favorite: boolean("favorite").default(false),
});

export const insertWardrobeItemSchema = createInsertSchema(wardrobeItems).pick({
  userId: true,
  name: true,
  category: true,
  subcategory: true,
  color: true,
  season: true,
  imageUrl: true,
  tags: true,
  favorite: true,
});

// Outfit schema
export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  items: integer("items").array().notNull(), // IDs of wardrobe items in this outfit
  occasion: text("occasion"), // casual, work, party, etc.
  season: text("season"), // winter, summer, spring, fall, all
  favorite: boolean("favorite").default(false),
  weatherConditions: text("weather_conditions"), // sunny, rainy, cold, etc.
  mood: text("mood"), // happy, confident, relaxed, etc.
});

export const insertOutfitSchema = createInsertSchema(outfits).pick({
  userId: true,
  name: true,
  items: true,
  occasion: true,
  season: true,
  favorite: true,
  weatherConditions: true,
  mood: true,
});

// Inspiration item schema
export const inspirations = pgTable("inspirations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array(), // tags for filtering
  category: text("category"), // casual, formal, trends, etc.
  source: text("source"), // source of the inspiration
});

export const insertInspirationSchema = createInsertSchema(inspirations).pick({
  title: true,
  description: true,
  imageUrl: true,
  tags: true,
  category: true,
  source: true,
});

// Weather preferences schema
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
});

// Mood preferences schema
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
});

// Type exports
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

// Category and subcategory definitions
export const clothingCategories = [
  { value: "tops", label: "Tops", subcategories: ["t-shirt", "blouse", "shirt", "sweater", "tank top", "crop top"] },
  { value: "bottoms", label: "Bottoms", subcategories: ["jeans", "skirt", "shorts", "pants", "leggings"] },
  { value: "dresses", label: "Dresses", subcategories: ["casual dress", "formal dress", "sundress", "maxi dress"] },
  { value: "outerwear", label: "Outerwear", subcategories: ["jacket", "coat", "blazer", "cardigan", "hoodie"] },
  { value: "shoes", label: "Shoes", subcategories: ["sneakers", "heels", "boots", "sandals", "flats", "loafers"] },
  { value: "accessories", label: "Accessories", subcategories: ["hat", "scarf", "jewelry", "bag", "belt", "sunglasses"] },
  { value: "makeup", label: "Makeup", subcategories: ["lipstick", "eyeshadow", "foundation", "blush", "mascara"] }
];

// Weather types
export const weatherTypes = [
  { value: "sunny", label: "Sunny" },
  { value: "rainy", label: "Rainy" },
  { value: "cloudy", label: "Cloudy" },
  { value: "snowy", label: "Snowy" },
  { value: "windy", label: "Windy" },
  { value: "hot", label: "Hot" },
  { value: "cold", label: "Cold" }
];

// Mood types
export const moodTypes = [
  { value: "happy", label: "Happy" },
  { value: "confident", label: "Confident" },
  { value: "relaxed", label: "Relaxed" },
  { value: "energetic", label: "Energetic" },
  { value: "romantic", label: "Romantic" },
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" }
];

// Seasons
export const seasons = [
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "all", label: "All Seasons" }
];


