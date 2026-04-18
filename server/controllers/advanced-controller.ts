/**
 * Advanced Features Controller
 *
 * Handles Capsule Wardrobes, Wishlist, Wear Logging, and Style Profile endpoints.
 * Uses Supabase storage with in-memory fallback.
 */

import { Request, Response } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { getSupabaseClient } from "../lib/supabase";

// In-memory fallback storage (when Supabase is not configured)
const capsules: Map<number, any> = new Map();
let capsuleIdCounter = 1;
const wishlistItems: Map<number, any> = new Map();
let wishlistIdCounter = 1;
const wearLogs: Map<number, any> = new Map();
let wearLogIdCounter = 1;

// Helper to check if Supabase is available
function hasSupabase(): boolean {
    return !!getSupabaseClient();
}

// ============================================
// CAPSULE WARDROBES
// ============================================

export async function getCapsules(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;

        let userCapsules: any[];

        if (hasSupabase() && typeof (storage as any).getCapsules === 'function') {
            userCapsules = await (storage as any).getCapsules(userId);
        } else {
            userCapsules = Array.from(capsules.values()).filter(c => c.userId === userId);
        }

        // Enrich capsules with resolved wardrobe items for image display
        const enrichedCapsules = await Promise.all(
            userCapsules.map(async (capsule) => {
                let resolvedItems: any[] = [];
                if (capsule.items && capsule.items.length > 0) {
                    resolvedItems = await Promise.all(
                        capsule.items.slice(0, 4).map(async (itemId: number) => {
                            try {
                                const item = await storage.getWardrobeItem(itemId);
                                return item ? { id: item.id, name: item.name, imageUrl: item.imageUrl, category: item.category } : null;
                            } catch {
                                return null;
                            }
                        })
                    );
                    resolvedItems = resolvedItems.filter(Boolean);
                }
                return { ...capsule, resolvedItems };
            })
        );

        res.json(enrichedCapsules);
    } catch (error) {
        logger.error({ err: error }, "Error getting capsules");
        res.status(500).json({ message: "Failed to get capsules" });
    }
}

export async function createCapsule(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const { name, description, type, season, items, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        let capsule: any;

        if (hasSupabase() && typeof (storage as any).createCapsule === 'function') {
            capsule = await (storage as any).createCapsule({
                userId,
                name,
                description: description || "",
                type: type || "custom",
                season: season || "all",
                items: items || [],
                isActive: isActive ?? true,
            });
        } else {
            capsule = {
                id: capsuleIdCounter++,
                userId,
                name,
                description: description || "",
                type: type || "custom",
                season: season || "all",
                items: items || [],
                isActive: isActive ?? true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            capsules.set(capsule.id, capsule);
        }

        logger.info(`Capsule created: ${name} (ID: ${capsule.id})`);
        res.status(201).json(capsule);
    } catch (error) {
        logger.error({ err: error }, "Error creating capsule");
        res.status(500).json({ message: "Failed to create capsule" });
    }
}

export async function updateCapsule(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const id = parseInt(req.params.id);
        const { name, description, type, season, items, isActive } = req.body;

        let updated: any;

        if (hasSupabase() && typeof (storage as any).updateCapsule === 'function') {
            // Verify ownership
            const existing = await (storage as any).getCapsule(id);
            if (!existing || existing.userId !== userId) {
                return res.status(404).json({ message: "Capsule not found" });
            }
            updated = await (storage as any).updateCapsule(id, {
                name, description, type, season, items, isActive
            });
        } else {
            const capsule = capsules.get(id);
            if (!capsule || capsule.userId !== userId) {
                return res.status(404).json({ message: "Capsule not found" });
            }
            updated = {
                ...capsule,
                name: name ?? capsule.name,
                description: description ?? capsule.description,
                type: type ?? capsule.type,
                season: season ?? capsule.season,
                items: items ?? capsule.items,
                isActive: isActive ?? capsule.isActive,
                updatedAt: new Date(),
            };
            capsules.set(id, updated);
        }

        logger.info(`Capsule updated: ${updated.name} (ID: ${id})`);
        res.json(updated);
    } catch (error) {
        logger.error({ err: error }, "Error updating capsule");
        res.status(500).json({ message: "Failed to update capsule" });
    }
}

export async function deleteCapsule(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const id = parseInt(req.params.id);

        if (hasSupabase() && typeof (storage as any).deleteCapsule === 'function') {
            const existing = await (storage as any).getCapsule(id);
            if (!existing || existing.userId !== userId) {
                return res.status(404).json({ message: "Capsule not found" });
            }
            await (storage as any).deleteCapsule(id);
        } else {
            const capsule = capsules.get(id);
            if (!capsule || capsule.userId !== userId) {
                return res.status(404).json({ message: "Capsule not found" });
            }
            capsules.delete(id);
        }

        logger.info(`Capsule deleted (ID: ${id})`);
        res.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, "Error deleting capsule");
        res.status(500).json({ message: "Failed to delete capsule" });
    }
}

// ============================================
// WISHLIST
// ============================================

export async function getWishlist(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;

        let userWishlist: any[];

        if (hasSupabase() && typeof (storage as any).getWishlist === 'function') {
            userWishlist = await (storage as any).getWishlist(userId);
        } else {
            userWishlist = Array.from(wishlistItems.values()).filter(w => w.userId === userId);
        }

        res.json(userWishlist);
    } catch (error) {
        logger.error({ err: error }, "Error getting wishlist");
        res.status(500).json({ message: "Failed to get wishlist" });
    }
}

export async function addToWishlist(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const { name, brand, price, imageUrl, sourceUrl, category, notes, priority } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        let item: any;

        if (hasSupabase() && typeof (storage as any).addToWishlist === 'function') {
            item = await (storage as any).addToWishlist({
                userId,
                name,
                brand,
                price,
                imageUrl,
                sourceUrl,
                category,
                notes,
                priority: priority || 'medium',
            });
        } else {
            item = {
                id: wishlistIdCounter++,
                userId,
                name,
                brand: brand || null,
                price: price || null,
                imageUrl: imageUrl || null,
                sourceUrl: sourceUrl || null,
                category: category || null,
                notes: notes || null,
                priority: priority || 'medium',
                createdAt: new Date(),
            };
            wishlistItems.set(item.id, item);
        }

        logger.info(`Wishlist item added: ${name} (ID: ${item.id})`);
        res.status(201).json(item);
    } catch (error) {
        logger.error({ err: error }, "Error adding to wishlist");
        res.status(500).json({ message: "Failed to add to wishlist" });
    }
}

export async function removeFromWishlist(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid wishlist id" });
        }

        if (hasSupabase() && typeof (storage as any).removeFromWishlist === 'function') {
            // Verify the wishlist item belongs to the authed user before deleting.
            const userWishlist = typeof (storage as any).getWishlist === 'function'
                ? await (storage as any).getWishlist(userId)
                : [];
            const owned = userWishlist.find((w: any) => w.id === id);
            if (!owned) {
                return res.status(404).json({ message: "Item not found" });
            }
            await (storage as any).removeFromWishlist(id);
        } else {
            const item = wishlistItems.get(id);
            if (!item || item.userId !== userId) {
                return res.status(404).json({ message: "Item not found" });
            }
            wishlistItems.delete(id);
        }

        logger.info(`Wishlist item removed (ID: ${id})`);
        res.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, "Error removing from wishlist");
        res.status(500).json({ message: "Failed to remove from wishlist" });
    }
}

export async function convertWishlistToWardrobe(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const id = parseInt(req.params.id);

        let wishlistItem: any;

        if (hasSupabase() && typeof (storage as any).getWishlist === 'function') {
            const items = await (storage as any).getWishlist(userId);
            wishlistItem = items.find((i: any) => i.id === id);
        } else {
            wishlistItem = wishlistItems.get(id);
        }

        if (!wishlistItem || wishlistItem.userId !== userId) {
            return res.status(404).json({ message: "Wishlist item not found" });
        }

        // Create wardrobe item from wishlist
        const wardrobeItem = await storage.createWardrobeItem({
            userId,
            name: wishlistItem.name,
            category: wishlistItem.category || "other",
            imageUrl: wishlistItem.imageUrl || "",
            brand: wishlistItem.brand,
            purchasePrice: wishlistItem.price,
            tags: ["from-wishlist"],
            status: "available",
            wearCount: 0
        });

        // Remove from wishlist
        if (hasSupabase() && typeof (storage as any).removeFromWishlist === 'function') {
            await (storage as any).removeFromWishlist(id);
        } else {
            wishlistItems.delete(id);
        }

        logger.info(`Wishlist converted to wardrobe: ${wishlistItem.name}`);
        res.json(wardrobeItem);
    } catch (error) {
        logger.error({ err: error }, "Error converting wishlist item");
        res.status(500).json({ message: "Failed to convert wishlist item" });
    }
}

// ============================================
// WEAR LOGGING
// ============================================

export async function getWearLogs(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;

        let logs: any[];

        if (hasSupabase() && typeof storage.getWearLogs === 'function') {
            logs = await storage.getWearLogs(userId);
        } else {
            logs = Array.from(wearLogs.values())
                .filter(l => l.userId === userId)
                .sort((a, b) => new Date(b.wornDate).getTime() - new Date(a.wornDate).getTime());
        }

        // Enrich with item details
        const enrichedLogs = await Promise.all(
            logs.map(async (log) => {
                let outfitDetails = null;
                let itemDetails: any[] = [];

                if (log.outfitId) {
                    outfitDetails = await storage.getOutfit(log.outfitId);
                }

                if (log.wardrobeItemIds && log.wardrobeItemIds.length > 0) {
                    itemDetails = await Promise.all(
                        log.wardrobeItemIds.map(async (id: number) => {
                            const item = await storage.getWardrobeItem(id);
                            return item ? { id: item.id, name: item.name, imageUrl: item.imageUrl } : null;
                        })
                    );
                    itemDetails = itemDetails.filter(Boolean);
                }

                return { ...log, outfitDetails, itemDetails };
            })
        );

        res.json(enrichedLogs);
    } catch (error) {
        logger.error({ err: error }, "Error getting wear logs");
        res.status(500).json({ message: "Failed to get wear logs" });
    }
}

export async function createWearLog(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const { outfitId, wardrobeItemIds, photoUrl, occasion, weatherCondition, temperature, notes, rating, wornDate } = req.body;

        if (!outfitId && (!wardrobeItemIds || wardrobeItemIds.length === 0)) {
            return res.status(400).json({ message: "Either outfitId or wardrobeItemIds is required" });
        }

        let log: any;

        if (hasSupabase() && typeof storage.createWearLog === 'function') {
            log = await storage.createWearLog({
                userId,
                outfitId: outfitId || null,
                wardrobeItemId: wardrobeItemIds?.[0] || null, // Primary item
                wornDate: wornDate || new Date().toISOString().split('T')[0],
                occasion: occasion || null,
                notes: notes || null,
                rating: rating || null,
            });
        } else {
            log = {
                id: wearLogIdCounter++,
                userId,
                outfitId: outfitId || null,
                wardrobeItemIds: wardrobeItemIds || [],
                photoUrl: photoUrl || null,
                occasion: occasion || null,
                weatherCondition: weatherCondition || null,
                temperature: temperature || null,
                notes: notes || null,
                rating: rating || null,
                wornDate: wornDate || new Date().toISOString().split('T')[0],
                createdAt: new Date(),
            };
            wearLogs.set(log.id, log);
        }

        // Update wear counts for items
        const itemsToUpdate = wardrobeItemIds || [];
        for (const itemId of itemsToUpdate) {
            const item = await storage.getWardrobeItem(itemId);
            if (item) {
                await storage.updateWardrobeItem(itemId, {
                    wearCount: (item.wearCount || 0) + 1,
                    lastWorn: new Date(),
                });
            }
        }

        logger.info(`Wear log created (ID: ${log.id})`);
        res.status(201).json(log);
    } catch (error) {
        logger.error({ err: error }, "Error creating wear log");
        res.status(500).json({ message: "Failed to create wear log" });
    }
}

export async function deleteWearLog(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid wear log id" });
        }

        if (hasSupabase() && typeof storage.deleteWearLog === 'function') {
            // Ownership check: load the user's logs and confirm this id belongs to them.
            const userLogs = typeof storage.getWearLogs === 'function'
                ? await storage.getWearLogs(userId)
                : [];
            const owned = userLogs.find((l: any) => l.id === id);
            if (!owned) {
                return res.status(404).json({ message: "Wear log not found" });
            }
            await storage.deleteWearLog(id);
        } else {
            const log = wearLogs.get(id);
            if (!log || log.userId !== userId) {
                return res.status(404).json({ message: "Wear log not found" });
            }
            wearLogs.delete(id);
        }

        logger.info(`Wear log deleted (ID: ${id})`);
        res.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, "Error deleting wear log");
        res.status(500).json({ message: "Failed to delete wear log" });
    }
}

// ============================================
// SEASONAL FILTERS
// ============================================

export async function getWardrobeBySeasonalFilter(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const { season, weather } = req.query;

        // Get all wardrobe items
        const items = await storage.getWardrobeItems(userId);

        // Filter by season if provided
        let filtered = items;

        if (season && season !== 'all') {
            filtered = items.filter(item =>
                item.season === season || item.season === 'all' || !item.season
            );
        }

        // Weather-based filtering
        if (weather) {
            const weatherStr = String(weather).toLowerCase();
            filtered = filtered.filter(item => {
                const tags = (item.tags || []).map(t => t.toLowerCase());
                const category = item.category?.toLowerCase() || '';

                switch (weatherStr) {
                    case 'hot':
                    case 'sunny':
                        return ['tops', 'dresses', 'shorts'].some(c => category.includes(c)) ||
                            tags.some(t => ['summer', 'light', 'breathable', 'casual'].includes(t));
                    case 'cold':
                    case 'snowy':
                        return ['outerwear', 'sweaters'].some(c => category.includes(c)) ||
                            tags.some(t => ['winter', 'warm', 'cozy', 'layering'].includes(t));
                    case 'rainy':
                        return tags.some(t => ['waterproof', 'rain', 'jacket'].includes(t)) ||
                            category.includes('outerwear');
                    default:
                        return true;
                }
            });
        }

        // Group by category for easy UI display
        const grouped = filtered.reduce((acc, item) => {
            const cat = item.category || 'other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {} as Record<string, any[]>);

        res.json({
            items: filtered,
            grouped,
            stats: {
                total: filtered.length,
                byCategory: Object.entries(grouped).map(([cat, items]) => ({
                    category: cat,
                    count: items.length,
                })),
            }
        });
    } catch (error) {
        logger.error({ err: error }, "Error filtering wardrobe by season");
        res.status(500).json({ message: "Failed to filter wardrobe" });
    }
}
