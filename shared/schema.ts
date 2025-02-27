import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  location: text("location"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wardrobe items table
export const wardrobeItems = pgTable("wardrobe_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // tops, bottoms, dresses, shoes, accessories, etc.
  type: text("type"), // subcategory like t-shirt, blouse, jeans, etc.
  color: text("color"),
  season: text("season"), // summer, winter, fall, spring, all
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array(), // Material, pattern, brand, etc.
  occasions: text("occasions").array(), // casual, formal, business, party, etc.
  favorite: boolean("favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Outfits table
export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  items: jsonb("items").notNull(), // Array of wardrobe item IDs
  weather: text("weather"), // sunny, rainy, cloudy, snowy, etc.
  mood: text("mood"), // casual, formal, playful, confident, etc.
  occasion: text("occasion"),
  favorite: boolean("favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  location: true,
  preferences: true,
});

export const insertWardrobeItemSchema = createInsertSchema(wardrobeItems).omit({
  id: true,
  createdAt: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWardrobeItem = z.infer<typeof insertWardrobeItemSchema>;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

export type User = typeof users.$inferSelect;
export type WardrobeItem = typeof wardrobeItems.$inferSelect;
export type Outfit = typeof outfits.$inferSelect;

// Additional schemas for frontend/backend validation
export const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'] as const;
export const moodTypes = ['casual', 'formal', 'playful', 'confident', 'relaxed', 'energetic', 'romantic', 'professional'] as const;
export const categoryTypes = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'makeup'] as const;

export type WeatherType = typeof weatherTypes[number];
export type MoodType = typeof moodTypes[number];
export type CategoryType = typeof categoryTypes[number];
