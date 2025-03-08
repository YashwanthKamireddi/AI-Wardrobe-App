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
  deleteAllInspirations(): Promise<void>; // Add this new method

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

  // Add sample inspirations to the database
  private async addSampleInspirations() {
    const existingInspirations = await db.select({ count: { value: inspirations.id } })
      .from(inspirations);

    // Only add sample data if there are no inspirations yet
    if (existingInspirations.length === 0 || existingInspirations[0].count.value === 0) {
      const sampleInspirations: InsertInspiration[] = [
        {
          title: "Summer Casual",
          description: "Light and breezy summer outfit perfect for hot days.",
          imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600",
          tags: ["summer", "casual", "trending"],
          category: "casual",
          source: "Fashion Magazine"
        },
        {
          title: "Office Chic",
          description: "Professional outfit that maintains style and comfort.",
          imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600",
          tags: ["office", "professional", "formal"],
          category: "formal",
          source: "Corporate Style Blog"
        },
        {
          title: "Weekend Comfort",
          description: "Relaxed outfit perfect for weekend errands or coffee with friends.",
          imageUrl: "https://images.unsplash.com/photo-1614093302611-8efc4de858db?auto=format&fit=crop&w=600",
          tags: ["casual", "weekend", "comfortable"],
          category: "casual",
          source: "Street Style"
        },
        {
          title: "Evening Elegance",
          description: "Sophisticated outfit for dinner dates or evening events.",
          imageUrl: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600",
          tags: ["elegant", "evening", "date"],
          category: "formal",
          source: "Fashion Week"
        },
        {
          title: "Autumn Layers",
          description: "Stylish layered look for fall weather.",
          imageUrl: "https://images.unsplash.com/photo-1511085583985-642f67a47dba?auto=format&fit=crop&w=600",
          tags: ["autumn", "layers", "seasonal"],
          category: "casual",
          source: "Seasonal Trends"
        },
        {
          title: "Spring Fresh",
          description: "Light and colorful outfit for spring days.",
          imageUrl: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=600",
          tags: ["spring", "colorful", "fresh"],
          category: "casual",
          source: "Spring Collection"
        }
      ];

      for (const inspiration of sampleInspirations) {
        await db.insert(inspirations).values(inspiration);
      }
    }
  }
}

// Export a singleton instance of the storage
export const storage = new DatabaseStorage();