/**
 * Supabase Storage Implementation
 *
 * This file implements the IStorage interface using Supabase as the backend.
 * It provides persistent storage with real-time capabilities.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { getSupabaseClient } from '../lib/supabase';
import { logger } from '../utils';
import {
  type User, type InsertUser,
  type WardrobeItem, type InsertWardrobeItem,
  type Outfit, type InsertOutfit,
  type Inspiration, type InsertInspiration,
  type WeatherPreference, type InsertWeatherPreference,
  type MoodPreference, type InsertMoodPreference
} from "@shared/schema";
import { IStorage } from '../storage';

/**
 * Supabase Storage Implementation
 */
export class SupabaseStorage implements IStorage {
  private client: SupabaseClient;
  sessionStore: session.Store;

  constructor(client: SupabaseClient) {
    this.client = client;

    // Use memory store for sessions (you can also use Supabase for sessions)
    const MemoryStoreClass = MemoryStore(session);
    this.sessionStore = new MemoryStoreClass({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return undefined;
      return this.mapDbUserToUser(data);
    } catch (err) {
      logger.error('Error getting user:', err instanceof Error ? err : new Error(String(err)));
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) return undefined;
      return this.mapDbUserToUser(data);
    } catch (err) {
      logger.error('Error getting user by username:', err instanceof Error ? err : new Error(String(err)));
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .insert({
        username: insertUser.username,
        password: insertUser.password,
        name: insertUser.name || null,
        email: insertUser.email || null,
        profile_picture: insertUser.profilePicture || null,
        role: insertUser.role || 'user'
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Error creating user:', error ? new Error(error.message) : undefined);
      throw new Error('Failed to create user');
    }

    return this.mapDbUserToUser(data);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const updateData: any = {};
    if (userData.username) updateData.username = userData.username;
    if (userData.password) updateData.password = userData.password;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.profilePicture !== undefined) updateData.profile_picture = userData.profilePicture;
    if (userData.role) updateData.role = userData.role;

    const { data, error } = await this.client
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      logger.error('Error updating user:', error ? new Error(error.message) : undefined);
      return undefined;
    }

    return this.mapDbUserToUser(data);
  }

  // Wardrobe operations
  async getWardrobeItems(userId: number): Promise<WardrobeItem[]> {
    const { data, error } = await this.client
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error getting wardrobe items:', error);
      return [];
    }

    return (data || []).map(item => this.mapDbWardrobeItemToWardrobeItem(item));
  }

  async getWardrobeItem(id: number): Promise<WardrobeItem | undefined> {
    const { data, error } = await this.client
      .from('wardrobe_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapDbWardrobeItemToWardrobeItem(data);
  }

  async createWardrobeItem(insertItem: InsertWardrobeItem): Promise<WardrobeItem> {
    const { data, error } = await this.client
      .from('wardrobe_items')
      .insert({
        user_id: insertItem.userId,
        name: insertItem.name,
        category: insertItem.category,
        subcategory: insertItem.subcategory || null,
        color: insertItem.color || null,
        season: insertItem.season || null,
        image_url: insertItem.imageUrl,
        tags: insertItem.tags || null,
        favorite: insertItem.favorite || false
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Error creating wardrobe item:', error ? new Error(error.message) : undefined);
      throw new Error('Failed to create wardrobe item');
    }

    return this.mapDbWardrobeItemToWardrobeItem(data);
  }

  async updateWardrobeItem(id: number, itemData: Partial<InsertWardrobeItem>): Promise<WardrobeItem | undefined> {
    const updateData: any = {};
    if (itemData.name) updateData.name = itemData.name;
    if (itemData.category) updateData.category = itemData.category;
    if (itemData.subcategory !== undefined) updateData.subcategory = itemData.subcategory;
    if (itemData.color !== undefined) updateData.color = itemData.color;
    if (itemData.season !== undefined) updateData.season = itemData.season;
    if (itemData.imageUrl) updateData.image_url = itemData.imageUrl;
    if (itemData.tags !== undefined) updateData.tags = itemData.tags;
    if (itemData.favorite !== undefined) updateData.favorite = itemData.favorite;

    const { data, error } = await this.client
      .from('wardrobe_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapDbWardrobeItemToWardrobeItem(data);
  }

  async deleteWardrobeItem(id: number): Promise<boolean> {
    const { error } = await this.client
      .from('wardrobe_items')
      .delete()
      .eq('id', id);

    return !error;
  }

  async getWardrobeItemsByCategory(userId: number, category: string): Promise<WardrobeItem[]> {
    const { data, error } = await this.client
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category);

    if (error) return [];
    return (data || []).map(item => this.mapDbWardrobeItemToWardrobeItem(item));
  }

  // Outfit operations
  async getOutfits(userId: number): Promise<Outfit[]> {
    const { data, error } = await this.client
      .from('outfits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(outfit => this.mapDbOutfitToOutfit(outfit));
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    const { data, error } = await this.client
      .from('outfits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapDbOutfitToOutfit(data);
  }

  async createOutfit(insertOutfit: InsertOutfit): Promise<Outfit> {
    const { data, error } = await this.client
      .from('outfits')
      .insert({
        user_id: insertOutfit.userId,
        name: insertOutfit.name,
        description: insertOutfit.description || null,
        items: insertOutfit.items,
        occasion: insertOutfit.occasion || null,
        season: insertOutfit.season || null,
        favorite: insertOutfit.favorite || false,
        weather_conditions: insertOutfit.weatherConditions || null,
        mood: insertOutfit.mood || null
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Error creating outfit:', error ? new Error(error.message) : undefined);
      throw new Error('Failed to create outfit');
    }

    return this.mapDbOutfitToOutfit(data);
  }

  async updateOutfit(id: number, outfitData: Partial<InsertOutfit>): Promise<Outfit | undefined> {
    const updateData: any = {};
    if (outfitData.name) updateData.name = outfitData.name;
    if (outfitData.description !== undefined) updateData.description = outfitData.description;
    if (outfitData.items) updateData.items = outfitData.items;
    if (outfitData.occasion !== undefined) updateData.occasion = outfitData.occasion;
    if (outfitData.season !== undefined) updateData.season = outfitData.season;
    if (outfitData.favorite !== undefined) updateData.favorite = outfitData.favorite;
    if (outfitData.weatherConditions !== undefined) updateData.weather_conditions = outfitData.weatherConditions;
    if (outfitData.mood !== undefined) updateData.mood = outfitData.mood;

    const { data, error } = await this.client
      .from('outfits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapDbOutfitToOutfit(data);
  }

  async deleteOutfit(id: number): Promise<boolean> {
    const { error } = await this.client
      .from('outfits')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Inspiration operations
  async getInspirations(): Promise<Inspiration[]> {
    const { data, error } = await this.client
      .from('inspirations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(insp => this.mapDbInspirationToInspiration(insp));
  }

  async getInspiration(id: number): Promise<Inspiration | undefined> {
    const { data, error } = await this.client
      .from('inspirations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapDbInspirationToInspiration(data);
  }

  async createInspiration(insertInsp: InsertInspiration): Promise<Inspiration> {
    const { data, error } = await this.client
      .from('inspirations')
      .insert({
        title: insertInsp.title,
        description: insertInsp.description || null,
        image_url: insertInsp.imageUrl,
        source: insertInsp.source || null,
        tags: insertInsp.tags || null,
        category: insertInsp.category || null,
        content: insertInsp.content || null
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create inspiration');
    }

    return this.mapDbInspirationToInspiration(data);
  }

  async deleteAllInspirations(): Promise<void> {
    await this.client.from('inspirations').delete().neq('id', 0);
  }

  // Weather preference operations
  async getWeatherPreferences(userId: number): Promise<WeatherPreference[]> {
    const { data, error } = await this.client
      .from('weather_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) return [];
    return (data || []).map(pref => this.mapDbWeatherPrefToWeatherPref(pref));
  }

  async createWeatherPreference(pref: InsertWeatherPreference): Promise<WeatherPreference> {
    const { data, error } = await this.client
      .from('weather_preferences')
      .insert({
        user_id: pref.userId,
        weather_type: pref.weatherType,
        preferred_categories: pref.preferredCategories || null
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create weather preference');
    }

    return this.mapDbWeatherPrefToWeatherPref(data);
  }

  // Mood preference operations
  async getMoodPreferences(userId: number): Promise<MoodPreference[]> {
    const { data, error } = await this.client
      .from('mood_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) return [];
    return (data || []).map(pref => this.mapDbMoodPrefToMoodPref(pref));
  }

  async createMoodPreference(pref: InsertMoodPreference): Promise<MoodPreference> {
    const { data, error } = await this.client
      .from('mood_preferences')
      .insert({
        user_id: pref.userId,
        mood: pref.mood,
        preferred_categories: pref.preferredCategories || null,
        preferred_colors: pref.preferredColors || null
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create mood preference');
    }

    return this.mapDbMoodPrefToMoodPref(data);
  }

  // Mapping helpers
  private mapDbUserToUser(data: any): User {
    return {
      id: data.id,
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      profilePicture: data.profile_picture,
      role: data.role
    };
  }

  private mapDbWardrobeItemToWardrobeItem(data: any): WardrobeItem {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
      color: data.color,
      season: data.season,
      imageUrl: data.image_url,
      tags: data.tags,
      favorite: data.favorite
    };
  }

  private mapDbOutfitToOutfit(data: any): Outfit {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      items: data.items,
      occasion: data.occasion,
      season: data.season,
      favorite: data.favorite,
      weatherConditions: data.weather_conditions,
      mood: data.mood
    };
  }

  private mapDbInspirationToInspiration(data: any): Inspiration {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      source: data.source,
      tags: data.tags,
      category: data.category,
      content: data.content
    };
  }

  private mapDbWeatherPrefToWeatherPref(data: any): WeatherPreference {
    return {
      id: data.id,
      userId: data.user_id,
      weatherType: data.weather_type,
      preferredCategories: data.preferred_categories
    };
  }

  private mapDbMoodPrefToMoodPref(data: any): MoodPreference {
    return {
      id: data.id,
      userId: data.user_id,
      mood: data.mood,
      preferredCategories: data.preferred_categories,
      preferredColors: data.preferred_colors
    };
  }
}

/**
 * Create Supabase storage instance if configured
 */
export function createSupabaseStorage(): SupabaseStorage | null {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }
  return new SupabaseStorage(client);
}

export default SupabaseStorage;
