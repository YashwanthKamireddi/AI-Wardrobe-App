/**
 * Advanced Features Controller
 *
 * Handles Capsule Wardrobes, Wishlist, and Style Profile endpoints.
 */

import { Request, Response } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";

// ============================================
// CAPSULE WARDROBES
// ============================================

// In-memory capsule storage (before DB migration)
const capsules: Map<number, any> = new Map();
let capsuleIdCounter = 1;

export async function getCapsules(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const userCapsules = Array.from(capsules.values()).filter(c => c.userId === userId);

        res.json(userCapsules);
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

        const capsule = {
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
        const capsule = capsules.get(id);

        if (!capsule || capsule.userId !== userId) {
            return res.status(404).json({ message: "Capsule not found" });
        }

        const { name, description, type, season, items, isActive } = req.body;

        const updated = {
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
        const capsule = capsules.get(id);

        if (!capsule || capsule.userId !== userId) {
            return res.status(404).json({ message: "Capsule not found" });
        }

        capsules.delete(id);
        logger.info(`Capsule deleted: ${capsule.name} (ID: ${id})`);

        res.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, "Error deleting capsule");
        res.status(500).json({ message: "Failed to delete capsule" });
    }
}

// ============================================
// WISHLIST
// ============================================

// In-memory wishlist storage (before DB migration)
const wishlistItems: Map<number, any> = new Map();
let wishlistIdCounter = 1;

export async function getWishlist(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const userWishlist = Array.from(wishlistItems.values()).filter(w => w.userId === userId);

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
        const { name, brand, price, imageUrl, sourceUrl, category, notes, versatilityScore } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const item = {
            id: wishlistIdCounter++,
            userId,
            name,
            brand: brand || null,
            price: price || null,
            imageUrl: imageUrl || null,
            sourceUrl: sourceUrl || null,
            category: category || null,
            notes: notes || null,
            versatilityScore: versatilityScore || null,
            createdAt: new Date(),
        };

        wishlistItems.set(item.id, item);
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
        const item = wishlistItems.get(id);

        if (!item || item.userId !== userId) {
            return res.status(404).json({ message: "Item not found" });
        }

        wishlistItems.delete(id);
        logger.info(`Wishlist item removed: ${item.name} (ID: ${id})`);

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
        const wishlistItem = wishlistItems.get(id);

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
        });

        // Remove from wishlist
        wishlistItems.delete(id);
        logger.info(`Wishlist converted to wardrobe: ${wishlistItem.name}`);

        res.json(wardrobeItem);
    } catch (error) {
        logger.error({ err: error }, "Error converting wishlist item");
        res.status(500).json({ message: "Failed to convert wishlist item" });
    }
}
