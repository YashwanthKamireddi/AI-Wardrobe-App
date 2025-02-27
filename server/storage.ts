import { 
  users, type User, type InsertUser,
  wardrobeItems, type WardrobeItem, type InsertWardrobeItem,
  outfits, type Outfit, type InsertOutfit,
  inspirations, type Inspiration, type InsertInspiration,
  weatherPreferences, type WeatherPreference, type InsertWeatherPreference,
  moodPreferences, type MoodPreference, type InsertMoodPreference
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

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
  
  // Weather preference operations
  getWeatherPreferences(userId: number): Promise<WeatherPreference[]>;
  createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference>;
  
  // Mood preference operations
  getMoodPreferences(userId: number): Promise<MoodPreference[]>;
  createMoodPreference(preference: InsertMoodPreference): Promise<MoodPreference>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  // Maps for storage
  private users: Map<number, User>;
  private wardrobeItems: Map<number, WardrobeItem>;
  private outfits: Map<number, Outfit>;
  private inspirations: Map<number, Inspiration>;
  private weatherPreferences: Map<number, WeatherPreference>;
  private moodPreferences: Map<number, MoodPreference>;
  
  // ID counters
  private userIdCounter: number;
  private wardrobeItemIdCounter: number;
  private outfitIdCounter: number;
  private inspirationIdCounter: number;
  private weatherPreferenceIdCounter: number;
  private moodPreferenceIdCounter: number;
  
  // Session store
  sessionStore: session.Store;
  
  constructor() {
    this.users = new Map();
    this.wardrobeItems = new Map();
    this.outfits = new Map();
    this.inspirations = new Map();
    this.weatherPreferences = new Map();
    this.moodPreferences = new Map();
    
    this.userIdCounter = 1;
    this.wardrobeItemIdCounter = 1;
    this.outfitIdCounter = 1;
    this.inspirationIdCounter = 1;
    this.weatherPreferenceIdCounter = 1;
    this.moodPreferenceIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some sample inspirations
    this.addSampleInspirations();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Wardrobe methods
  async getWardrobeItems(userId: number): Promise<WardrobeItem[]> {
    return Array.from(this.wardrobeItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    return this.wardrobeItems.get(id);
  }
  
  async createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem> {
    const id = this.wardrobeItemIdCounter++;
    const wardrobeItem: WardrobeItem = { ...item, id };
    this.wardrobeItems.set(id, wardrobeItem);
    return wardrobeItem;
  }
  
  async updateWardrobeItem(id: number, itemData: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined> {
    const item = this.wardrobeItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemData };
    this.wardrobeItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteWardrobeItem(id: number): Promise<boolean> {
    return this.wardrobeItems.delete(id);
  }
  
  async getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]> {
    return Array.from(this.wardrobeItems.values()).filter(
      (item) => item.userId === userId && item.category === category
    );
  }
  
  // Outfit methods
  async getOutfits(userId: number): Promise<Outfit[]> {
    return Array.from(this.outfits.values()).filter(
      (outfit) => outfit.userId === userId
    );
  }
  
  async getOutfit(id: number): Promise<Outfit | undefined> {
    return this.outfits.get(id);
  }
  
  async createOutfit(outfit: InsertOutfit): Promise<Outfit> {
    const id = this.outfitIdCounter++;
    const newOutfit: Outfit = { ...outfit, id };
    this.outfits.set(id, newOutfit);
    return newOutfit;
  }
  
  async updateOutfit(id: number, outfitData: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const outfit = this.outfits.get(id);
    if (!outfit) return undefined;
    
    const updatedOutfit = { ...outfit, ...outfitData };
    this.outfits.set(id, updatedOutfit);
    return updatedOutfit;
  }
  
  async deleteOutfit(id: number): Promise<boolean> {
    return this.outfits.delete(id);
  }
  
  // Inspiration methods
  async getInspirations(): Promise<Inspiration[]> {
    return Array.from(this.inspirations.values());
  }
  
  async getInspiration(id: number): Promise<Inspiration | undefined> {
    return this.inspirations.get(id);
  }
  
  async createInspiration(inspiration: InsertInspiration): Promise<Inspiration> {
    const id = this.inspirationIdCounter++;
    const newInspiration: Inspiration = { ...inspiration, id };
    this.inspirations.set(id, newInspiration);
    return newInspiration;
  }
  
  // Weather preference methods
  async getWeatherPreferences(userId: number): Promise<WeatherPreference[]> {
    return Array.from(this.weatherPreferences.values()).filter(
      (pref) => pref.userId === userId
    );
  }
  
  async createWeatherPreference(preference: InsertWeatherPreference): Promise<WeatherPreference> {
    const id = this.weatherPreferenceIdCounter++;
    const newPreference: WeatherPreference = { ...preference, id };
    this.weatherPreferences.set(id, newPreference);
    return newPreference;
  }
  
  // Mood preference methods
  async getMoodPreferences(userId: number): Promise<MoodPreference[]> {
    return Array.from(this.moodPreferences.values()).filter(
      (pref) => pref.userId === userId
    );
  }
  
  async createMoodPreference(preference: InsertMoodPreference): Promise<MoodPreference> {
    const id = this.moodPreferenceIdCounter++;
    const newPreference: MoodPreference = { ...preference, id };
    this.moodPreferences.set(id, newPreference);
    return newPreference;
  }
  
  // Add sample inspirations for the app
  private addSampleInspirations() {
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
    
    sampleInspirations.forEach(inspiration => {
      const id = this.inspirationIdCounter++;
      this.inspirations.set(id, { ...inspiration, id });
    });
  }
}

export const storage = new MemStorage();
