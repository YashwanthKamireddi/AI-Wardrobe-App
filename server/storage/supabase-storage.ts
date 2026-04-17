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
    type MoodPreference, type InsertMoodPreference,
    type WearLog, type InsertWearLog,
    type Trip, type InsertTrip,
    type OutfitCalendar, type InsertOutfitCalendar
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
            logger.error({ err: err instanceof Error ? err : new Error(String(err)) }, 'Error getting user');
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

            if (error) {
                logger.warn({ error: error.message }, `[Supabase] Error fetching user by username: ${username}`);
                return undefined;
            }

            if (!data) {
                logger.info(`[Supabase] No user found for username: ${username}`);
                return undefined;
            }

            // Debug: Check if password is present in DB response
            const hasPassword = !!data.password;
            const passwordLength = data.password?.length || 0;
            logger.info(`[Supabase] User ${username} found: hasPassword=${hasPassword}, passwordLength=${passwordLength}`);

            return this.mapDbUserToUser(data);
        } catch (err) {
            logger.error({ err: err instanceof Error ? err : new Error(String(err)) }, 'Error getting user by username');
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
            logger.error({ err: error ? new Error(error.message) : undefined }, 'Error creating user');
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
            logger.error({ err: error ? new Error(error.message) : undefined }, 'Error updating user');
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
            logger.error({ err: error }, 'Error getting wardrobe items');
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
            logger.error({ err: error ? new Error(error.message) : undefined }, 'Error creating wardrobe item');
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
            logger.error({ err: error ? new Error(error.message) : undefined }, 'Error creating outfit');
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

    // Preference update/delete operations
    async updateWeatherPreference(id: number, prefData: Partial<InsertWeatherPreference>): Promise<WeatherPreference | undefined> {
        const updateData: any = {};
        if (prefData.preferredCategories !== undefined) updateData.preferred_categories = prefData.preferredCategories;
        if (prefData.weatherType) updateData.weather_type = prefData.weatherType;

        const { data, error } = await this.client
            .from('weather_preferences')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return undefined;
        return this.mapDbWeatherPrefToWeatherPref(data);
    }

    async deleteWeatherPreference(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('weather_preferences')
            .delete()
            .eq('id', id);
        return !error;
    }

    async updateMoodPreference(id: number, prefData: Partial<InsertMoodPreference>): Promise<MoodPreference | undefined> {
        const updateData: any = {};
        if (prefData.preferredCategories !== undefined) updateData.preferred_categories = prefData.preferredCategories;
        if (prefData.preferredColors !== undefined) updateData.preferred_colors = prefData.preferredColors;
        if (prefData.mood) updateData.mood = prefData.mood;

        const { data, error } = await this.client
            .from('mood_preferences')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return undefined;
        return this.mapDbMoodPrefToMoodPref(data);
    }

    async deleteMoodPreference(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('mood_preferences')
            .delete()
            .eq('id', id);
        return !error;
    }

    // Wear log operations
    async getWearLogs(userId: number): Promise<WearLog[]> {
        const { data, error } = await this.client
            .from('wear_log')
            .select('*')
            .eq('user_id', userId)
            .order('worn_date', { ascending: false });

        if (error) return [];
        return (data || []).map(log => this.mapDbWearLogToWearLog(log));
    }

    async getItemWearLogs(itemId: number): Promise<WearLog[]> {
        const { data, error } = await this.client
            .from('wear_log')
            .select('*')
            .eq('wardrobe_item_id', itemId)
            .order('worn_date', { ascending: false });

        if (error) return [];
        return (data || []).map(log => this.mapDbWearLogToWearLog(log));
    }

    async createWearLog(insertLog: InsertWearLog): Promise<WearLog> {
        const { data, error } = await this.client
            .from('wear_log')
            .insert({
                user_id: insertLog.userId,
                wardrobe_item_id: insertLog.wardrobeItemId || null,
                outfit_id: insertLog.outfitId || null,
                worn_date: insertLog.wornDate,
                occasion: insertLog.occasion || null,
                notes: insertLog.notes || null,
                rating: insertLog.rating || null
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to create wear log');
        }

        // Update wearCount on the wardrobe item
        if (insertLog.wardrobeItemId) {
            await this.client.rpc('increment_wear_count', { item_id: insertLog.wardrobeItemId });
        }

        // Update wearCount on the outfit
        if (insertLog.outfitId) {
            await this.client.rpc('increment_outfit_wear_count', { outfit_id: insertLog.outfitId });
        }

        return this.mapDbWearLogToWearLog(data);
    }

    async deleteWearLog(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('wear_log')
            .delete()
            .eq('id', id);
        return !error;
    }

    // Trip operations
    async getTrips(userId: number): Promise<Trip[]> {
        const { data, error } = await this.client
            .from('trips')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: true });

        if (error) return [];
        return (data || []).map(trip => this.mapDbTripToTrip(trip));
    }

    async getTrip(id: number): Promise<Trip | undefined> {
        const { data, error } = await this.client
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return undefined;
        return this.mapDbTripToTrip(data);
    }

    async createTrip(insertTrip: InsertTrip): Promise<Trip> {
        logger.debug({ insertTrip }, "[SupabaseStorage.createTrip] Input");

        const { data, error } = await this.client
            .from('trips')
            .insert({
                user_id: insertTrip.userId,
                name: insertTrip.name,
                destination: insertTrip.destination,
                start_date: insertTrip.startDate instanceof Date ? insertTrip.startDate.toISOString() : insertTrip.startDate,
                end_date: insertTrip.endDate instanceof Date ? insertTrip.endDate.toISOString() : insertTrip.endDate,
                type: insertTrip.type,
                packed_items: insertTrip.packedItems || [],
                status: insertTrip.status || 'upcoming'
            })
            .select()
            .single();

        if (error) {
            logger.error({ error }, "[SupabaseStorage.createTrip] Supabase error");
            throw new Error(`Failed to create trip: ${error.message}`);
        }

        if (!data) {
            logger.error("[SupabaseStorage.createTrip] No data returned");
            throw new Error('Failed to create trip: no data returned');
        }

        logger.info({ tripId: data.id }, "[SupabaseStorage.createTrip] Created");
        return this.mapDbTripToTrip(data);
    }

    async updateTrip(id: number, tripData: Partial<InsertTrip>): Promise<Trip | undefined> {
        const updateData: any = {};
        if (tripData.name) updateData.name = tripData.name;
        if (tripData.destination) updateData.destination = tripData.destination;
        if (tripData.startDate) updateData.start_date = tripData.startDate;
        if (tripData.endDate) updateData.end_date = tripData.endDate;
        if (tripData.type) updateData.type = tripData.type;
        if (tripData.packedItems !== undefined) updateData.packed_items = tripData.packedItems;
        if (tripData.status) updateData.status = tripData.status;

        const { data, error } = await this.client
            .from('trips')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return undefined;
        return this.mapDbTripToTrip(data);
    }

    async deleteTrip(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('trips')
            .delete()
            .eq('id', id);
        return !error;
    }

    // Calendar operations
    async getCalendarEvents(userId: number): Promise<OutfitCalendar[]> {
        const { data, error } = await this.client
            .from('outfit_calendar')
            .select('*')
            .eq('user_id', userId);

        if (error) return [];
        return (data || []).map(event => this.mapDbOutcomeCalendarToOutfitCalendar(event));
    }

    async createCalendarEvent(insertEvent: InsertOutfitCalendar): Promise<OutfitCalendar> {
        const { data, error } = await this.client
            .from('outfit_calendar')
            .insert({
                user_id: insertEvent.userId,
                outfit_id: insertEvent.outfitId || null,
                date: insertEvent.date,
                event_name: insertEvent.eventName || null,
                notes: insertEvent.notes || null,
                is_worn: insertEvent.isWorn || false
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to create calendar event');
        }

        return this.mapDbOutcomeCalendarToOutfitCalendar(data);
    }

    async deleteCalendarEvent(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('outfit_calendar')
            .delete()
            .eq('id', id);
        return !error;
    }

    // Capsule Wardrobes operations
    async getCapsules(userId: number): Promise<any[]> {
        const { data, error } = await this.client
            .from('capsule_wardrobes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return (data || []).map(capsule => this.mapDbCapsuleToCapsule(capsule));
    }

    async getCapsule(id: number): Promise<any | undefined> {
        const { data, error } = await this.client
            .from('capsule_wardrobes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return undefined;
        return this.mapDbCapsuleToCapsule(data);
    }

    async createCapsule(insertCapsule: any): Promise<any> {
        const { data, error } = await this.client
            .from('capsule_wardrobes')
            .insert({
                user_id: insertCapsule.userId,
                name: insertCapsule.name,
                description: insertCapsule.description || '',
                type: insertCapsule.type || 'custom',
                season: insertCapsule.season || 'all',
                items: insertCapsule.items || [],
                is_active: insertCapsule.isActive ?? true,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to create capsule: ' + (error?.message || 'Unknown error'));
        }

        return this.mapDbCapsuleToCapsule(data);
    }

    async updateCapsule(id: number, capsuleData: any): Promise<any | undefined> {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (capsuleData.name !== undefined) updateData.name = capsuleData.name;
        if (capsuleData.description !== undefined) updateData.description = capsuleData.description;
        if (capsuleData.type !== undefined) updateData.type = capsuleData.type;
        if (capsuleData.season !== undefined) updateData.season = capsuleData.season;
        if (capsuleData.items !== undefined) updateData.items = capsuleData.items;
        if (capsuleData.isActive !== undefined) updateData.is_active = capsuleData.isActive;

        const { data, error } = await this.client
            .from('capsule_wardrobes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return undefined;
        return this.mapDbCapsuleToCapsule(data);
    }

    async deleteCapsule(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('capsule_wardrobes')
            .delete()
            .eq('id', id);
        return !error;
    }

    // Wishlist operations
    async getWishlist(userId: number): Promise<any[]> {
        const { data, error } = await this.client
            .from('wishlist_items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return (data || []).map(item => this.mapDbWishlistToWishlist(item));
    }

    async addToWishlist(insertItem: any): Promise<any> {
        const { data, error } = await this.client
            .from('wishlist_items')
            .insert({
                user_id: insertItem.userId,
                name: insertItem.name,
                brand: insertItem.brand || null,
                price: insertItem.price || null,
                url: insertItem.url || insertItem.sourceUrl || null,
                image_url: insertItem.imageUrl || null,
                category: insertItem.category || null,
                notes: insertItem.notes || null,
                priority: insertItem.priority || 'medium',
                purchased: false,
            })
            .select()
            .single();

        if (error || !data) {
            throw new Error('Failed to add to wishlist: ' + (error?.message || 'Unknown error'));
        }

        return this.mapDbWishlistToWishlist(data);
    }

    async updateWishlistItem(id: number, itemData: any): Promise<any | undefined> {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (itemData.name !== undefined) updateData.name = itemData.name;
        if (itemData.brand !== undefined) updateData.brand = itemData.brand;
        if (itemData.price !== undefined) updateData.price = itemData.price;
        if (itemData.url !== undefined) updateData.url = itemData.url;
        if (itemData.imageUrl !== undefined) updateData.image_url = itemData.imageUrl;
        if (itemData.category !== undefined) updateData.category = itemData.category;
        if (itemData.notes !== undefined) updateData.notes = itemData.notes;
        if (itemData.priority !== undefined) updateData.priority = itemData.priority;
        if (itemData.purchased !== undefined) updateData.purchased = itemData.purchased;

        const { data, error } = await this.client
            .from('wishlist_items')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error || !data) return undefined;
        return this.mapDbWishlistToWishlist(data);
    }

    async removeFromWishlist(id: number): Promise<boolean> {
        const { error } = await this.client
            .from('wishlist_items')
            .delete()
            .eq('id', id);
        return !error;
    }

    // Mapping helpers - Capsule
    private mapDbCapsuleToCapsule(data: any): any {
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            description: data.description,
            type: data.type,
            season: data.season,
            items: data.items || [],
            isActive: data.is_active,
            createdAt: data.created_at ? new Date(data.created_at) : null,
            updatedAt: data.updated_at ? new Date(data.updated_at) : null,
        };
    }

    // Mapping helpers - Wishlist
    private mapDbWishlistToWishlist(data: any): any {
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            brand: data.brand,
            price: data.price,
            url: data.url,
            imageUrl: data.image_url,
            category: data.category,
            notes: data.notes,
            priority: data.priority,
            purchased: data.purchased,
            createdAt: data.created_at ? new Date(data.created_at) : null,
            updatedAt: data.updated_at ? new Date(data.updated_at) : null,
        };
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
            brand: data.brand,
            size: data.size,
            season: data.season,
            imageUrl: data.image_url,
            tags: data.tags,
            favorite: data.favorite,
            wearCount: data.wear_count || 0,
            lastWorn: data.last_worn ? new Date(data.last_worn) : null,
            purchasePrice: data.purchase_price,
            purchaseDate: data.purchase_date ? new Date(data.purchase_date) : null,
            purchaseLocation: data.purchase_location,
            status: data.status || 'available',
            lentTo: data.lent_to || null,
            returnDate: data.return_date ? new Date(data.return_date) : null,
            notes: data.notes || null,
            createdAt: data.created_at ? new Date(data.created_at) : null,
            updatedAt: data.updated_at ? new Date(data.updated_at) : null
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
            mood: data.mood,
            wearCount: data.wear_count || 0,
            lastWorn: data.last_worn ? new Date(data.last_worn) : null,
            createdAt: data.created_at ? new Date(data.created_at) : null,
            rating: data.rating
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

    private mapDbWearLogToWearLog(data: any): WearLog {
        return {
            id: data.id,
            userId: data.user_id,
            wardrobeItemId: data.wardrobe_item_id,
            outfitId: data.outfit_id,
            wornDate: new Date(data.worn_date),
            occasion: data.occasion,
            notes: data.notes,
            rating: data.rating,
            createdAt: data.created_at ? new Date(data.created_at) : null
        };
    }

    private mapDbTripToTrip(data: any): Trip {
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            destination: data.destination,
            startDate: new Date(data.start_date),
            endDate: new Date(data.end_date),
            type: data.type,
            packedItems: data.packed_items || [],
            status: data.status,
            createdAt: data.created_at ? new Date(data.created_at) : null
        };
    }

    private mapDbOutcomeCalendarToOutfitCalendar(data: any): OutfitCalendar {
        return {
            id: data.id,
            userId: data.user_id,
            outfitId: data.outfit_id,
            date: new Date(data.date),
            eventName: data.event_name,
            notes: data.notes,
            isWorn: data.is_worn,
            createdAt: data.created_at ? new Date(data.created_at) : null
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
