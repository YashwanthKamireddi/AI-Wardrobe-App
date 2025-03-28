import { 
  users, type User, type InsertUser,
  wardrobeItems, type WardrobeItem, type InsertWardrobeItem,
  outfits, type Outfit, type InsertOutfit,
  inspirations, type Inspiration, type InsertInspiration,
  weatherPreferences, type WeatherPreference, type InsertWeatherPreference,
  moodPreferences, type MoodPreference, type InsertMoodPreference,
  achievements, type Achievement, type InsertAchievement,
  challenges, type Challenge, type InsertChallenge,
  userChallenges, type UserChallenge, type InsertUserChallenge,
  userStats, type UserStats, type InsertUserStats
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

  // Achievement operations
  getAchievements(userId: number): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;

  // Challenge operations
  getChallenges(active?: boolean): Promise<Challenge[]>; 
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<boolean>;

  // User Challenge operations
  getUserChallenges(userId: number): Promise<UserChallenge[]>;
  getUserChallenge(id: number): Promise<UserChallenge | undefined>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallenge(id: number, userChallenge: Partial<InsertUserChallenge>): Promise<UserChallenge | undefined>;
  completeUserChallenge(id: number): Promise<UserChallenge | undefined>;

  // User Stats operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(userStats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, userStats: Partial<InsertUserStats>): Promise<UserStats | undefined>;
  addUserPoints(userId: number, points: number): Promise<UserStats | undefined>;

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

  // Achievement methods
  async getAchievements(userId: number): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const result = await db.select().from(achievements).where(eq(achievements.id, id));
    return result[0];
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const result = await db.insert(achievements).values({
      ...achievement,
      unlockedAt: new Date(),
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateAchievement(id: number, achievementData: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const result = await db.update(achievements)
      .set(achievementData)
      .where(eq(achievements.id, id))
      .returning();
    return result[0];
  }

  // Challenge methods
  async getChallenges(active: boolean = true): Promise<Challenge[]> {
    if (active) {
      return db.select().from(challenges).where(eq(challenges.active, true));
    }
    return db.select().from(challenges);
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const result = await db.select().from(challenges).where(eq(challenges.id, id));
    return result[0];
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const result = await db.insert(challenges).values({
      ...challenge,
      createdAt: new Date()
    }).returning();
    return result[0];
  }

  async updateChallenge(id: number, challengeData: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const result = await db.update(challenges)
      .set(challengeData)
      .where(eq(challenges.id, id))
      .returning();
    return result[0];
  }

  async deleteChallenge(id: number): Promise<boolean> {
    const result = await db.delete(challenges).where(eq(challenges.id, id)).returning();
    return result.length > 0;
  }

  // User Challenge methods
  async getUserChallenges(userId: number): Promise<UserChallenge[]> {
    return db.select().from(userChallenges).where(eq(userChallenges.userId, userId));
  }

  async getUserChallenge(id: number): Promise<UserChallenge | undefined> {
    const result = await db.select().from(userChallenges).where(eq(userChallenges.id, id));
    return result[0];
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const result = await db.insert(userChallenges).values({
      ...userChallenge,
      startedAt: new Date()
    }).returning();
    return result[0];
  }

  async updateUserChallenge(id: number, userChallengeData: Partial<InsertUserChallenge>): Promise<UserChallenge | undefined> {
    const result = await db.update(userChallenges)
      .set(userChallengeData)
      .where(eq(userChallenges.id, id))
      .returning();
    return result[0];
  }

  async completeUserChallenge(id: number): Promise<UserChallenge | undefined> {
    const result = await db.update(userChallenges)
      .set({ 
        completed: true, 
        completedAt: new Date() 
      })
      .where(eq(userChallenges.id, id))
      .returning();
    
    if (result[0]) {
      // Get the related challenge to find the points reward
      const challenge = await this.getChallenge(result[0].challengeId);
      if (challenge) {
        // Update user stats with the points earned
        const userStats = await this.getUserStats(result[0].userId);
        if (userStats) {
          await this.addUserPoints(result[0].userId, challenge.pointsReward);
          await this.updateUserStats(result[0].userId, {
            challengesCompleted: userStats.challengesCompleted + 1
          });
        }
      }
    }
    
    return result[0];
  }

  // User Stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const result = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return result[0];
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const result = await db.insert(userStats).values({
      ...stats,
      lastActive: new Date()
    }).returning();
    return result[0];
  }

  async updateUserStats(userId: number, statsData: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    // First, try to get the existing stats
    let existingStats = await this.getUserStats(userId);
    
    // If user stats don't exist, create them
    if (!existingStats) {
      existingStats = await this.createUserStats({ userId });
    }
    
    // Now update the stats
    const result = await db.update(userStats)
      .set({
        ...statsData,
        lastActive: new Date()
      })
      .where(eq(userStats.userId, userId))
      .returning();
      
    return result[0];
  }

  async addUserPoints(userId: number, points: number): Promise<UserStats | undefined> {
    // Get current stats
    let userStat = await this.getUserStats(userId);
    
    if (!userStat) {
      // Create user stats if they don't exist
      userStat = await this.createUserStats({ userId });
    }
    
    // Calculate new values
    const newTotalPoints = userStat.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1; // Simple level calculation: 100 points per level
    
    // Update the stats
    const result = await db.update(userStats)
      .set({
        totalPoints: newTotalPoints,
        level: newLevel,
        lastActive: new Date()
      })
      .where(eq(userStats.userId, userId))
      .returning();
    
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