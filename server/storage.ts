/**
 * Database Storage Implementation for Cher's Closet
 * 
 * This file contains the storage layer implementation that connects the application 
 * to the PostgreSQL database using Drizzle ORM. It provides a complete set of CRUD operations
 * for all entities in the Cher's Closet wardrobe management application.
 * 
 * The storage implementation follows the repository pattern:
 * - Defines an interface (IStorage) that specifies all available operations
 * - Implements the interface with a concrete class (DatabaseStorage)
 * - Exports a singleton instance for use throughout the application
 * 
 * Key features:
 * - Type-safe database operations using TypeScript and Drizzle ORM
 * - Session management with PostgreSQL session store
 * - Automatic sample data generation for first-time setup
 * - Error handling and logging for database operations
 */

import { 
  users, type User, type InsertUser,
  wardrobeItems, type WardrobeItem, type InsertWardrobeItem,
  outfits, type Outfit, type InsertOutfit,
  inspirations, type Inspiration, type InsertInspiration,
  weatherPreferences, type WeatherPreference, type InsertWeatherPreference,
  moodPreferences, type MoodPreference, type InsertMoodPreference
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Session store for persistent user sessions in PostgreSQL
const PostgresSessionStore = connectPg(session);

/**
 * Storage Interface
 * 
 * Defines all database operations available throughout the application.
 * This interface ensures consistent access patterns and enables potential
 * alternative implementations (e.g., for testing or different databases).
 */
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Wardrobe operations
  getWardrobeItems(userId: number): Promise<WardrobeItem[]>;
  getWardrobeItem(id: number): Promise<WardrobeItem | undefined>;
  createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem>;
  updateWardrobeItem(id: number, item: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined>;
  deleteWardrobeItem(id: number): Promise<boolean>;
  getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]>;

  // Outfit operations
  getOutfits(userId: number): Promise<Outfit[]>;
  getOutfit(id: number): Promise<Outfit | undefined>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: number, outfit: Partial<InsertOutfit>): Promise<Outfit | undefined>;
  deleteOutfit(id: number): Promise<boolean>;

  // Inspiration operations
  getInspirations(): Promise<Inspiration[]>;
  getInspiration(id: number): Promise<Inspiration | undefined>;
  createInspiration(inspiration: InsertInspiration): Promise<Inspiration>;
  deleteAllInspirations(): Promise<void>;

  // Weather preference operations
  getWeatherPreferences(userId: number): Promise<WeatherPreference[]>;
  createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference>;

  // Mood preference operations
  getMoodPreferences(userId: number): Promise<MoodPreference[]>;
  createMoodPreference(preference: InsertMoodPreference): Promise<MoodPreference>;
  
  // Session store
  sessionStore: session.Store;
}

/**
 * Database Storage Implementation
 * 
 * This class implements the IStorage interface using Drizzle ORM with PostgreSQL.
 * It provides concrete implementations for all CRUD operations defined in the interface,
 * with appropriate error handling and data validation.
 * 
 * Features:
 * - Type-safe database queries with Drizzle ORM
 * - Session management with PostgreSQL
 * - Sample data initialization for first-time setup
 * - Comprehensive methods for all entity types in the application
 */
export class DatabaseStorage implements IStorage {
  /** PostgreSQL session store for user authentication persistence */
  sessionStore: session.Store;

  /**
   * Constructor initializes the database connection and session store
   * Also runs initial data seeding if the database is empty
   */
  constructor() {
    // Initialize PostgreSQL session store with connection pool
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true, // Auto-creates session table if not exists
    });

    // Add sample inspiration data on first run
    this.addSampleInspirations();
  }

  /**
   * User Management Methods
   * These methods handle user account operations including retrieval and updates
   */
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  /**
   * Wardrobe Item Management Methods
   * These methods handle all clothing items in a user's digital wardrobe
   */

  /**
   * Retrieves all wardrobe items belonging to a specific user
   * @param userId - The ID of the user whose wardrobe items to retrieve
   * @returns Promise resolving to an array of wardrobe items
   */
  async getWardrobeItems(userId: number): Promise<WardrobeItem[]> {
    return db.select().from(wardrobeItems).where(eq(wardrobeItems.userId, userId));
  }

  /**
   * Retrieves a specific wardrobe item by its ID
   * @param id - The ID of the wardrobe item to retrieve
   * @returns Promise resolving to the wardrobe item or undefined if not found
   */
  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    const result = await db.select().from(wardrobeItems).where(eq(wardrobeItems.id, id));
    return result[0];
  }

  /**
   * Creates a new wardrobe item in the database
   * @param item - The wardrobe item data to insert
   * @returns Promise resolving to the newly created wardrobe item
   */
  async createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem> {
    const result = await db.insert(wardrobeItems).values(item).returning();
    return result[0];
  }

  /**
   * Updates an existing wardrobe item with new data
   * @param id - The ID of the wardrobe item to update
   * @param itemData - The partial wardrobe item data to update
   * @returns Promise resolving to the updated wardrobe item or undefined if not found
   */
  async updateWardrobeItem(id: number, itemData: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined> {
    const result = await db.update(wardrobeItems)
      .set(itemData)
      .where(eq(wardrobeItems.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes a wardrobe item from the database
   * @param id - The ID of the wardrobe item to delete
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteWardrobeItem(id: number): Promise<boolean> {
    const result = await db.delete(wardrobeItems).where(eq(wardrobeItems.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Retrieves wardrobe items filtered by category for a specific user
   * @param userId - The ID of the user whose wardrobe items to retrieve
   * @param category - The category to filter by (e.g., "tops", "bottoms", etc.)
   * @returns Promise resolving to an array of matching wardrobe items
   */
  async getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]> {
    return db.select()
      .from(wardrobeItems)
      .where(
        eq(wardrobeItems.userId, userId) &&
        eq(wardrobeItems.category, category)
      );
  }

  /**
   * Outfit Management Methods
   * These methods handle complete outfits created from wardrobe items
   */

  /**
   * Retrieves all outfits belonging to a specific user
   * @param userId - The ID of the user whose outfits to retrieve
   * @returns Promise resolving to an array of outfits
   */
  async getOutfits(userId: number): Promise<Outfit[]> {
    return db.select().from(outfits).where(eq(outfits.userId, userId));
  }

  /**
   * Retrieves a specific outfit by its ID
   * @param id - The ID of the outfit to retrieve
   * @returns Promise resolving to the outfit or undefined if not found
   */
  async getOutfit(id: number): Promise<Outfit | undefined> {
    const result = await db.select().from(outfits).where(eq(outfits.id, id));
    return result[0];
  }

  /**
   * Creates a new outfit in the database
   * @param outfit - The outfit data to insert
   * @returns Promise resolving to the newly created outfit
   */
  async createOutfit(outfit: InsertOutfit): Promise<Outfit> {
    const result = await db.insert(outfits).values(outfit).returning();
    return result[0];
  }

  /**
   * Updates an existing outfit with new data
   * @param id - The ID of the outfit to update
   * @param outfitData - The partial outfit data to update
   * @returns Promise resolving to the updated outfit or undefined if not found
   */
  async updateOutfit(id: number, outfitData: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const result = await db.update(outfits)
      .set(outfitData)
      .where(eq(outfits.id, id))
      .returning();
    return result[0];
  }

  /**
   * Deletes an outfit from the database
   * @param id - The ID of the outfit to delete
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteOutfit(id: number): Promise<boolean> {
    const result = await db.delete(outfits).where(eq(outfits.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Fashion Inspiration Management Methods
   * These methods handle curated fashion inspiration content
   */

  /**
   * Retrieves all fashion inspirations
   * @returns Promise resolving to an array of inspiration items
   */
  async getInspirations(): Promise<Inspiration[]> {
    return db.select().from(inspirations);
  }

  /**
   * Retrieves a specific inspiration by its ID
   * @param id - The ID of the inspiration to retrieve
   * @returns Promise resolving to the inspiration or undefined if not found
   */
  async getInspiration(id: number): Promise<Inspiration | undefined> {
    const result = await db.select().from(inspirations).where(eq(inspirations.id, id));
    return result[0];
  }

  /**
   * Deletes all inspirations from the database
   * Used for refreshing inspiration content
   * @returns Promise that resolves when deletion is complete
   */
  async deleteAllInspirations(): Promise<void> {
    console.log('Deleting all existing inspirations...');
    await db.delete(inspirations);
    console.log('Successfully deleted all inspirations');
  }

  /**
   * Creates a new fashion inspiration in the database
   * @param inspiration - The inspiration data to insert
   * @returns Promise resolving to the newly created inspiration
   */
  async createInspiration(inspiration: InsertInspiration): Promise<Inspiration> {
    console.log('Creating new inspiration:', inspiration.title);
    const result = await db.insert(inspirations).values(inspiration).returning();
    console.log('Successfully created inspiration:', result[0].id);
    return result[0];
  }

  /**
   * Weather Preference Management Methods
   * These methods handle user preferences for clothing based on weather conditions
   */
  
  /**
   * Retrieves all weather preferences for a specific user
   * @param userId - The ID of the user whose weather preferences to retrieve
   * @returns Promise resolving to an array of weather preferences
   */
  async getWeatherPreferences(userId: number): Promise<WeatherPreference[]> {
    return db.select().from(weatherPreferences).where(eq(weatherPreferences.userId, userId));
  }

  /**
   * Creates a new weather preference in the database
   * @param preference - The weather preference data to insert
   * @returns Promise resolving to the newly created weather preference
   */
  async createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference> {
    const result = await db.insert(weatherPreferences).values(preference).returning();
    return result[0];
  }

  /**
   * Mood Preference Management Methods
   * These methods handle user preferences for clothing based on emotional states
   */
  
  /**
   * Retrieves all mood preferences for a specific user
   * @param userId - The ID of the user whose mood preferences to retrieve
   * @returns Promise resolving to an array of mood preferences
   */
  async getMoodPreferences(userId: number): Promise<MoodPreference[]> {
    return db.select().from(moodPreferences).where(eq(moodPreferences.userId, userId));
  }

  /**
   * Creates a new mood preference in the database
   * @param preference - The mood preference data to insert
   * @returns Promise resolving to the newly created mood preference
   */
  async createMoodPreference(preference: InsertMoodPreference): Promise<MoodPreference> {
    const result = await db.insert(moodPreferences).values(preference).returning();
    return result[0];
  }



  /**
   * Sample Data Initialization
   * Populates the database with initial fashion inspiration data
   * Only runs when the database is empty (first-time setup)
   * 
   * @private
   * @returns Promise that resolves when initialization is complete
   */
  private async addSampleInspirations() {
    // Check if inspirations already exist in the database
    const existingInspirations = await db.select({ count: { value: inspirations.id } })
      .from(inspirations);

    // Only add sample data if there are no inspirations yet
    if (existingInspirations.length === 0 || existingInspirations[0].count.value === 0) {
      // Array of curated fashion inspirations with high-quality images from Pexels
      const sampleInspirations: InsertInspiration[] = [
        {
          title: "Minimalist Chic",
          description: "Clean lines and neutral tones create a timeless wardrobe foundation",
          imageUrl: "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg",
          tags: ["minimalist", "neutral", "classic", "elegant"],
          category: "casual",
          source: "Fashion Editor's Pick"
        },
        {
          title: "Street Style Edge",
          description: "Urban fashion with attitude and personality",
          imageUrl: "https://images.pexels.com/photos/2901915/pexels-photo-2901915.jpeg",
          tags: ["streetwear", "urban", "edgy", "trendy"],
          category: "casual",
          source: "Street Fashion"
        },
        {
          title: "Professional Power",
          description: "Modern workwear that commands attention",
          imageUrl: "https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg",
          tags: ["business", "professional", "workwear", "formal"],
          category: "formal",
          source: "Business Style"
        },
        {
          title: "Bohemian Dreams",
          description: "Free-spirited fashion with romantic details",
          imageUrl: "https://images.pexels.com/photos/4725133/pexels-photo-4725133.jpeg",
          tags: ["boho", "romantic", "flowy", "summer"],
          category: "casual",
          source: "Lifestyle Fashion"
        },
        {
          title: "Evening Glamour",
          description: "Sophisticated evening wear for special occasions",
          imageUrl: "https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg",
          tags: ["evening", "glamour", "formal", "luxury"],
          category: "formal",
          source: "Evening Style"
        },
        {
          title: "Sporty Luxe",
          description: "Athletic wear meets high fashion",
          imageUrl: "https://images.pexels.com/photos/2475878/pexels-photo-2475878.jpeg",
          tags: ["athleisure", "sporty", "comfortable", "modern"],
          category: "casual",
          source: "Active Style"
        },
        {
          title: "Vintage Revival",
          description: "Classic styles reimagined for today",
          imageUrl: "https://images.pexels.com/photos/4725117/pexels-photo-4725117.jpeg",
          tags: ["vintage", "retro", "classic", "timeless"],
          category: "casual",
          source: "Vintage Collection"
        },
        {
          title: "Modern Minimalism",
          description: "Contemporary takes on minimalist fashion",
          imageUrl: "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg",
          tags: ["minimal", "modern", "clean", "sophisticated"],
          category: "casual",
          source: "Modern Style"
        },
        {
          title: "Urban Explorer",
          description: "City-ready looks for the fashion adventurer",
          imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg",
          tags: ["urban", "explorer", "streetwear", "practical"],
          category: "casual",
          source: "Urban Fashion"
        },
        {
          title: "Resort Elegance",
          description: "Vacation-ready looks with refined style",
          imageUrl: "https://images.pexels.com/photos/4725119/pexels-photo-4725119.jpeg",
          tags: ["resort", "summer", "elegant", "vacation"],
          category: "casual",
          source: "Resort Collection"
        },
        {
          title: "Autumn Layers",
          description: "Sophisticated layering for fall weather",
          imageUrl: "https://images.pexels.com/photos/2887766/pexels-photo-2887766.jpeg",
          tags: ["autumn", "layers", "cozy", "seasonal"],
          category: "casual",
          source: "Seasonal Edit"
        },
        {
          title: "Weekend Casual",
          description: "Effortless style for your days off",
          imageUrl: "https://images.pexels.com/photos/2896840/pexels-photo-2896840.jpeg",
          tags: ["casual", "weekend", "relaxed", "comfortable"],
          category: "casual",
          source: "Casual Style"
        }
      ];

      for (const inspiration of sampleInspirations) {
        await db.insert(inspirations).values(inspiration);
      }

      console.log('Added sample inspirations to the database');
    }
  }
}

// Export a singleton instance of the storage
export const storage = new DatabaseStorage();