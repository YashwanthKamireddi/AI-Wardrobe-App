/**
 * In-Memory Storage Implementation for Cher's Closet
 * 
 * This file contains the storage layer implementation using in-memory storage
 * instead of a database. It provides a complete set of CRUD operations
 * for all entities in the Cher's Closet wardrobe management application.
 * 
 * Key features:
 * - Type-safe operations using TypeScript
 * - In-memory session management using MemoryStore
 * - Automatic sample data generation for first-time setup
 * - Auto-incrementing IDs for entities
 */

import { 
  type User, type InsertUser,
  type WardrobeItem, type InsertWardrobeItem,
  type Outfit, type InsertOutfit,
  type Inspiration, type InsertInspiration,
  type WeatherPreference, type InsertWeatherPreference,
  type MoodPreference, type InsertMoodPreference
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

/**
 * Storage Interface
 * 
 * Defines all storage operations available throughout the application.
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
 * In-Memory Storage Implementation
 */
export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private wardrobeItems: Map<number, WardrobeItem> = new Map();
  private outfits: Map<number, Outfit> = new Map();
  private inspirations: Map<number, Inspiration> = new Map();
  private weatherPreferences: Map<number, WeatherPreference> = new Map();
  private moodPreferences: Map<number, MoodPreference> = new Map();
  
  private userIdCounter = 1;
  private wardrobeItemIdCounter = 1;
  private outfitIdCounter = 1;
  private inspirationIdCounter = 1;
  private weatherPreferenceIdCounter = 1;
  private moodPreferenceIdCounter = 1;

  sessionStore: session.Store;

  constructor() {
    // Initialize memory session store
    const MemoryStoreClass = MemoryStore(session);
    this.sessionStore = new MemoryStoreClass({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Add sample data
    this.addSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name || null,
      email: insertUser.email || null,
      profilePicture: insertUser.profilePicture || null,
      role: insertUser.role || "user"
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Wardrobe operations
  async getWardrobeItems(userId: number): Promise<WardrobeItem[]> {
    return Array.from(this.wardrobeItems.values()).filter(item => item.userId === userId);
  }

  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    return this.wardrobeItems.get(id);
  }

  async createWardrobeItem(insertItem: InsertWardrobeItem): Promise<WardrobeItem> {
    const item: WardrobeItem = {
      id: this.wardrobeItemIdCounter++,
      userId: insertItem.userId,
      name: insertItem.name,
      category: insertItem.category,
      subcategory: insertItem.subcategory || null,
      color: insertItem.color || null,
      season: insertItem.season || null,
      imageUrl: insertItem.imageUrl,
      tags: insertItem.tags || null,
      favorite: insertItem.favorite || false
    };
    this.wardrobeItems.set(item.id, item);
    return item;
  }

  async updateWardrobeItem(id: number, itemData: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined> {
    const existingItem = this.wardrobeItems.get(id);
    if (!existingItem) return undefined;

    const updatedItem = { ...existingItem, ...itemData };
    this.wardrobeItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteWardrobeItem(id: number): Promise<boolean> {
    return this.wardrobeItems.delete(id);
  }

  async getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]> {
    return Array.from(this.wardrobeItems.values())
      .filter(item => item.userId === userId && item.category === category);
  }

  // Outfit operations
  async getOutfits(userId: number): Promise<Outfit[]> {
    return Array.from(this.outfits.values()).filter(outfit => outfit.userId === userId);
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    return this.outfits.get(id);
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const outfit: Outfit = {
      id: this.outfitIdCounter++,
      userId: insertOutfit.userId,
      name: insertOutfit.name,
      description: insertOutfit.description || null,
      items: insertOutfit.items,
      occasion: insertOutfit.occasion || null,
      season: insertOutfit.season || null,
      favorite: insertOutfit.favorite || false,
      weatherConditions: insertOutfit.weatherConditions || null,
      mood: insertOutfit.mood || null
    };
    this.outfits.set(outfit.id, outfit);
    return outfit;
  }

  async updateOutfit(id: number, outfitData: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const existingOutfit = this.outfits.get(id);
    if (!existingOutfit) return undefined;

    const updatedOutfit = { ...existingOutfit, ...outfitData };
    this.outfits.set(id, updatedOutfit);
    return updatedOutfit;
  }

  async deleteOutfit(id: number): Promise<boolean> {
    return this.outfits.delete(id);
  }

  // Inspiration operations
  async getInspirations(): Promise<Inspiration[]> {
    return Array.from(this.inspirations.values());
  }

  async getInspiration(id: number): Promise<Inspiration | undefined> {
    return this.inspirations.get(id);
  }

  async createInspiration(insertInspiration: InsertInspiration): Promise<Inspiration> {
    const inspiration: Inspiration = {
      id: this.inspirationIdCounter++,
      title: insertInspiration.title,
      description: insertInspiration.description || null,
      imageUrl: insertInspiration.imageUrl,
      tags: insertInspiration.tags || null,
      category: insertInspiration.category || null,
      source: insertInspiration.source || null,
      content: insertInspiration.content || null
    };
    this.inspirations.set(inspiration.id, inspiration);
    return inspiration;
  }

  async deleteAllInspirations(): Promise<void> {
    this.inspirations.clear();
  }

  // Weather preference operations
  async getWeatherPreferences(userId: number): Promise<WeatherPreference[]> {
    return Array.from(this.weatherPreferences.values()).filter(pref => pref.userId === userId);
  }

  async createWeatherPreference(insertPreference: InsertWeatherPreference): Promise<WeatherPreference> {
    const preference: WeatherPreference = {
      id: this.weatherPreferenceIdCounter++,
      userId: insertPreference.userId,
      weatherType: insertPreference.weatherType,
      preferredCategories: insertPreference.preferredCategories || null
    };
    this.weatherPreferences.set(preference.id, preference);
    return preference;
  }

  // Mood preference operations
  async getMoodPreferences(userId: number): Promise<MoodPreference[]> {
    return Array.from(this.moodPreferences.values()).filter(pref => pref.userId === userId);
  }

  async createMoodPreference(insertPreference: InsertMoodPreference): Promise<MoodPreference> {
    const preference: MoodPreference = {
      id: this.moodPreferenceIdCounter++,
      userId: insertPreference.userId,
      mood: insertPreference.mood,
      preferredCategories: insertPreference.preferredCategories || null,
      preferredColors: insertPreference.preferredColors || null
    };
    this.moodPreferences.set(preference.id, preference);
    return preference;
  }

  private addSampleData() {
    // Add sample inspirations
    const sampleInspirations = [
      {
        title: "Casual Weekend Look",
        description: "Perfect for a relaxed weekend outing",
        imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
        tags: ["casual", "weekend", "comfortable"],
        category: "casual",
        source: "Curated Collection",
        content: "A comfortable yet stylish approach to weekend dressing"
      },
      {
        title: "Professional Chic",
        description: "Sophisticated office wear with a modern twist",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        tags: ["professional", "work", "chic"],
        category: "formal",
        source: "Business Fashion Guide",
        content: "Elevate your office wardrobe with modern professional styling"
      },
      {
        title: "Summer Vibes",
        description: "Light and breezy summer outfit inspiration",
        imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400",
        tags: ["summer", "light", "breezy"],
        category: "seasonal",
        source: "Seasonal Style Guide",
        content: "Stay cool and fashionable during warm summer days"
      }
    ];

    sampleInspirations.forEach(inspiration => {
      this.createInspiration(inspiration);
    });
  }
}

// Export singleton instance
const storage = new MemoryStorage();
export default storage;