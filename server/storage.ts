import { users, wardrobeItems, outfits, type User, type InsertUser, type WardrobeItem, type InsertWardrobeItem, type Outfit, type InsertOutfit } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Wardrobe operations
  getWardrobeItems(userId: number): Promise<WardrobeItem[]>;
  getWardrobeItemById(id: number): Promise<WardrobeItem | undefined>;
  getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]>;
  addWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem>;
  updateWardrobeItem(id: number, data: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined>;
  deleteWardrobeItem(id: number): Promise<boolean>;
  
  // Outfit operations
  getOutfits(userId: number): Promise<Outfit[]>;
  getOutfitById(id: number): Promise<Outfit | undefined>;
  addOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: number, data: Partial<InsertOutfit>): Promise<Outfit | undefined>;
  deleteOutfit(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wardrobeItems: Map<number, WardrobeItem>;
  private outfits: Map<number, Outfit>;
  private userIdCounter: number;
  private itemIdCounter: number;
  private outfitIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.wardrobeItems = new Map();
    this.outfits = new Map();
    this.userIdCounter = 1;
    this.itemIdCounter = 1;
    this.outfitIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
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
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: timestamp 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Wardrobe operations
  async getWardrobeItems(userId: number): Promise<WardrobeItem[]> {
    return Array.from(this.wardrobeItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getWardrobeItemById(id: number): Promise<WardrobeItem | undefined> {
    return this.wardrobeItems.get(id);
  }

  async getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]> {
    return Array.from(this.wardrobeItems.values()).filter(
      (item) => item.userId === userId && item.category === category,
    );
  }

  async addWardrobeItem(insertItem: InsertWardrobeItem): Promise<WardrobeItem> {
    const id = this.itemIdCounter++;
    const timestamp = new Date();
    const item: WardrobeItem = {
      ...insertItem,
      id,
      createdAt: timestamp,
    };
    this.wardrobeItems.set(id, item);
    return item;
  }

  async updateWardrobeItem(id: number, data: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined> {
    const item = this.wardrobeItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...data };
    this.wardrobeItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteWardrobeItem(id: number): Promise<boolean> {
    return this.wardrobeItems.delete(id);
  }

  // Outfit operations
  async getOutfits(userId: number): Promise<Outfit[]> {
    return Array.from(this.outfits.values()).filter(
      (outfit) => outfit.userId === userId,
    );
  }

  async getOutfitById(id: number): Promise<Outfit | undefined> {
    return this.outfits.get(id);
  }

  async addOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const id = this.outfitIdCounter++;
    const timestamp = new Date();
    const outfit: Outfit = {
      ...insertOutfit,
      id,
      createdAt: timestamp,
    };
    this.outfits.set(id, outfit);
    return outfit;
  }

  async updateOutfit(id: number, data: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const outfit = this.outfits.get(id);
    if (!outfit) return undefined;
    
    const updatedOutfit = { ...outfit, ...data };
    this.outfits.set(id, updatedOutfit);
    return updatedOutfit;
  }

  async deleteOutfit(id: number): Promise<boolean> {
    return this.outfits.delete(id);
  }
}

export const storage = new MemStorage();
