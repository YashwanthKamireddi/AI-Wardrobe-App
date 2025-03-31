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

const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
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

// Implement database storage using Drizzle ORM
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

    // Add inspirations when the database is first used
    this.addSampleInspirations();
  }

  // User methods
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

  // Wardrobe methods
  async getWardrobeItems(userId: number): Promise<WardrobeItem[]> {
    return db.select().from(wardrobeItems).where(eq(wardrobeItems.userId, userId));
  }

  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    const result = await db.select().from(wardrobeItems).where(eq(wardrobeItems.id, id));
    return result[0];
  }

  async createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem> {
    const result = await db.insert(wardrobeItems).values(item).returning();
    return result[0];
  }

  async updateWardrobeItem(id: number, itemData: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined> {
    const result = await db.update(wardrobeItems)
      .set(itemData)
      .where(eq(wardrobeItems.id, id))
      .returning();
    return result[0];
  }

  async deleteWardrobeItem(id: number): Promise<boolean> {
    const result = await db.delete(wardrobeItems).where(eq(wardrobeItems.id, id)).returning();
    return result.length > 0;
  }

  async getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]> {
    return db.select()
      .from(wardrobeItems)
      .where(
        eq(wardrobeItems.userId, userId) &&
        eq(wardrobeItems.category, category)
      );
  }

  // Outfit methods
  async getOutfits(userId: number): Promise<Outfit[]> {
    return db.select().from(outfits).where(eq(outfits.userId, userId));
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    const result = await db.select().from(outfits).where(eq(outfits.id, id));
    return result[0];
  }

  async createOutfit(outfit: InsertOutfit): Promise<Outfit> {
    const result = await db.insert(outfits).values(outfit).returning();
    return result[0];
  }

  async updateOutfit(id: number, outfitData: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const result = await db.update(outfits)
      .set(outfitData)
      .where(eq(outfits.id, id))
      .returning();
    return result[0];
  }

  async deleteOutfit(id: number): Promise<boolean> {
    const result = await db.delete(outfits).where(eq(outfits.id, id)).returning();
    return result.length > 0;
  }

  // Inspiration methods
  async getInspirations(): Promise<Inspiration[]> {
    return db.select().from(inspirations);
  }

  async getInspiration(id: number): Promise<Inspiration | undefined> {
    const result = await db.select().from(inspirations).where(eq(inspirations.id, id));
    return result[0];
  }

  // Add the new method for inspiration cleanup
  async deleteAllInspirations(): Promise<void> {
    console.log('Deleting all existing inspirations...');
    await db.delete(inspirations);
    console.log('Successfully deleted all inspirations');
  }

  // Improve logging in createInspiration
  async createInspiration(inspiration: InsertInspiration): Promise<Inspiration> {
    console.log('Creating new inspiration:', inspiration.title);
    const result = await db.insert(inspirations).values(inspiration).returning();
    console.log('Successfully created inspiration:', result[0].id);
    return result[0];
  }

  // Weather preference methods
  async getWeatherPreferences(userId: number): Promise<WeatherPreference[]> {
    return db.select().from(weatherPreferences).where(eq(weatherPreferences.userId, userId));
  }

  async createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference> {
    const result = await db.insert(weatherPreferences).values(preference).returning();
    return result[0];
  }

  // Mood preference methods
  async getMoodPreferences(userId: number): Promise<MoodPreference[]> {
    return db.select().from(moodPreferences).where(eq(moodPreferences.userId, userId));
  }

  async createMoodPreference(preference: InsertMoodPreference): Promise<MoodPreference> {
    const result = await db.insert(moodPreferences).values(preference).returning();
    return result[0];
  }



  private async addSampleInspirations() {
    const existingInspirations = await db.select({ count: { value: inspirations.id } })
      .from(inspirations);

    // Only add sample data if there are no inspirations yet
    if (existingInspirations.length === 0 || existingInspirations[0].count.value === 0) {
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