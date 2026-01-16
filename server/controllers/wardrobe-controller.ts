
import { Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertWardrobeItemSchema } from "@shared/schema";

// Input validation schemas
const patchWardrobeItemSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(50).optional(),
    color: z.string().min(1).max(50).optional(),
    brand: z.string().max(100).optional(),
    size: z.string().max(20).optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().optional(),
}).strict();

// Helper function to validate and parse numeric IDs
const parseId = (id: string): number | null => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) || parsed < 1 ? null : parsed;
};

export const getWardrobeItems = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const items = await storage.getWardrobeItems(req.user!.id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wardrobe items" });
    }
};

export const createWardrobeItem = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const itemData = insertWardrobeItemSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        const item = await storage.createWardrobeItem(itemData);
        res.status(201).json(item);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid wardrobe item data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to create wardrobe item" });
    }
};

export const getWardrobeItem = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        const item = await storage.getWardrobeItem(id);

        if (!item) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }

        if (item.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wardrobe item" });
    }
};

export const updateWardrobeItem = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseId(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        // Validate input data
        const validatedData = patchWardrobeItemSchema.parse(req.body);

        const item = await storage.getWardrobeItem(id);

        if (!item) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }

        if (item.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updatedItem = await storage.updateWardrobeItem(id, validatedData);
        res.json(updatedItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid input data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to update wardrobe item" });
    }
};

export const deleteWardrobeItem = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        const item = await storage.getWardrobeItem(id);

        if (!item) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }

        if (item.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteWardrobeItem(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete wardrobe item" });
    }
};

export const seedWardrobe = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userId = req.user!.id;

        // Sample men's wardrobe items with high-quality Unsplash images
        const sampleItems = [
            // TOPS
            {
                userId,
                name: "Classic White Oxford Shirt",
                category: "tops",
                subcategory: "dress-shirt",
                color: "white",
                brand: "Ralph Lauren",
                size: "M",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
                tags: ["formal", "classic", "versatile"],
                favorite: true,
                purchasePrice: 8900,
            },
            {
                userId,
                name: "Navy Blue Polo",
                category: "tops",
                subcategory: "polo",
                color: "navy",
                brand: "Lacoste",
                size: "M",
                season: "summer",
                imageUrl: "https://images.unsplash.com/photo-1625910513413-5fc45e836d0f?w=400&h=500&fit=crop",
                tags: ["casual", "smart-casual", "preppy"],
                favorite: false,
                purchasePrice: 9500,
            },
            {
                userId,
                name: "Black Crew Neck T-Shirt",
                category: "tops",
                subcategory: "t-shirt",
                color: "black",
                brand: "COS",
                size: "M",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
                tags: ["casual", "minimal", "essential"],
                favorite: true,
                purchasePrice: 3500,
            },
            {
                userId,
                name: "Grey Cashmere Sweater",
                category: "tops",
                subcategory: "sweater",
                color: "grey",
                brand: "Uniqlo",
                size: "M",
                season: "winter",
                imageUrl: "https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=400&h=500&fit=crop",
                tags: ["casual", "cozy", "minimal"],
                favorite: false,
                purchasePrice: 12900,
            },
            {
                userId,
                name: "Striped Linen Shirt",
                category: "tops",
                subcategory: "casual-shirt",
                color: "blue-white",
                brand: "J.Crew",
                size: "M",
                season: "summer",
                imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop",
                tags: ["casual", "summer", "vacation"],
                favorite: false,
                purchasePrice: 6500,
            },
            // BOTTOMS
            {
                userId,
                name: "Dark Indigo Slim Jeans",
                category: "bottoms",
                subcategory: "jeans",
                color: "indigo",
                brand: "Levi's",
                size: "32",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
                tags: ["casual", "essential", "versatile"],
                favorite: true,
                purchasePrice: 9800,
            },
            {
                userId,
                name: "Khaki Chinos",
                category: "bottoms",
                subcategory: "chinos",
                color: "khaki",
                brand: "Dockers",
                size: "32",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
                tags: ["smart-casual", "office", "versatile"],
                favorite: false,
                purchasePrice: 6500,
            },
            {
                userId,
                name: "Navy Dress Trousers",
                category: "bottoms",
                subcategory: "dress-pants",
                color: "navy",
                brand: "Hugo Boss",
                size: "32",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
                tags: ["formal", "office", "elegant"],
                favorite: true,
                purchasePrice: 15000,
            },
            {
                userId,
                name: "Olive Cargo Shorts",
                category: "bottoms",
                subcategory: "shorts",
                color: "olive",
                brand: "Carhartt",
                size: "32",
                season: "summer",
                imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop",
                tags: ["casual", "summer", "outdoor"],
                favorite: false,
                purchasePrice: 5500,
            },
            // OUTERWEAR
            {
                userId,
                name: "Classic Navy Blazer",
                category: "outerwear",
                subcategory: "blazer",
                color: "navy",
                brand: "Brooks Brothers",
                size: "M",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop",
                tags: ["formal", "classic", "timeless"],
                favorite: true,
                purchasePrice: 35000,
            },
            {
                userId,
                name: "Tan Trench Coat",
                category: "outerwear",
                subcategory: "coat",
                color: "tan",
                brand: "Burberry",
                size: "M",
                season: "fall",
                imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop",
                tags: ["classic", "elegant", "british"],
                favorite: true,
                purchasePrice: 89000,
            },
            {
                userId,
                name: "Black Leather Jacket",
                category: "outerwear",
                subcategory: "jacket",
                color: "black",
                brand: "AllSaints",
                size: "M",
                season: "fall",
                imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
                tags: ["edgy", "casual", "statement"],
                favorite: true,
                purchasePrice: 45000,
            },
            {
                userId,
                name: "Grey Wool Overcoat",
                category: "outerwear",
                subcategory: "coat",
                color: "grey",
                brand: "Reiss",
                size: "M",
                season: "winter",
                imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop",
                tags: ["formal", "elegant", "winter"],
                favorite: false,
                purchasePrice: 55000,
            },
            // SHOES
            {
                userId,
                name: "White Minimalist Sneakers",
                category: "shoes",
                subcategory: "sneakers",
                color: "white",
                brand: "Common Projects",
                size: "10",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
                tags: ["casual", "minimal", "versatile"],
                favorite: true,
                purchasePrice: 42500,
            },
            {
                userId,
                name: "Brown Oxford Dress Shoes",
                category: "shoes",
                subcategory: "oxford",
                color: "brown",
                brand: "Allen Edmonds",
                size: "10",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop",
                tags: ["formal", "classic", "elegant"],
                favorite: true,
                purchasePrice: 39500,
            },
            {
                userId,
                name: "Black Chelsea Boots",
                category: "shoes",
                subcategory: "boots",
                color: "black",
                brand: "R.M. Williams",
                size: "10",
                season: "fall",
                imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=500&fit=crop",
                tags: ["smart-casual", "versatile", "stylish"],
                favorite: false,
                purchasePrice: 52500,
            },
            {
                userId,
                name: "Navy Suede Loafers",
                category: "shoes",
                subcategory: "loafers",
                color: "navy",
                brand: "Tod's",
                size: "10",
                season: "summer",
                imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=500&fit=crop",
                tags: ["smart-casual", "summer", "italian"],
                favorite: false,
                purchasePrice: 48000,
            },
            // ACCESSORIES
            {
                userId,
                name: "Black Leather Belt",
                category: "accessories",
                subcategory: "belt",
                color: "black",
                brand: "Gucci",
                size: "34",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
                tags: ["essential", "formal", "versatile"],
                favorite: true,
                purchasePrice: 35000,
            },
            {
                userId,
                name: "Silver Chronograph Watch",
                category: "accessories",
                subcategory: "watch",
                color: "silver",
                brand: "Omega",
                size: "42mm",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop",
                tags: ["luxury", "classic", "timepiece"],
                favorite: true,
                purchasePrice: 550000,
            },
            {
                userId,
                name: "Navy Silk Tie",
                category: "accessories",
                subcategory: "tie",
                color: "navy",
                brand: "Hermes",
                size: "one-size",
                season: "all",
                imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=400&h=500&fit=crop",
                tags: ["formal", "elegant", "silk"],
                favorite: false,
                purchasePrice: 18500,
            },
            {
                userId,
                name: "Tortoise Shell Sunglasses",
                category: "accessories",
                subcategory: "sunglasses",
                color: "tortoise",
                brand: "Ray-Ban",
                size: "one-size",
                season: "summer",
                imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop",
                tags: ["casual", "summer", "classic"],
                favorite: false,
                purchasePrice: 15500,
            },
            {
                userId,
                name: "Grey Wool Scarf",
                category: "accessories",
                subcategory: "scarf",
                color: "grey",
                brand: "Acne Studios",
                size: "one-size",
                season: "winter",
                imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=500&fit=crop",
                tags: ["winter", "cozy", "minimal"],
                favorite: false,
                purchasePrice: 22000,
            },
        ];

        const createdItems = [];
        for (const item of sampleItems) {
            const created = await storage.createWardrobeItem(item);
            createdItems.push(created);
        }

        res.status(201).json({
            message: `Successfully added ${createdItems.length} sample wardrobe items`,
            count: createdItems.length,
            items: createdItems
        });
    } catch (error) {
        console.error("Failed to seed wardrobe items:", error);
        res.status(500).json({ message: "Failed to seed wardrobe items" });
    }
};
