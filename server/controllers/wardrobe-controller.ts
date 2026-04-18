import { Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertWardrobeItemSchema, CATEGORIES, SEASONS } from "@shared/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

// ─── Editorial demo image generator ─────────────────────────────────────────
// Instead of linking random stock photos that may not match the item, each
// seeded wardrobe piece gets a deterministic editorial SVG "product card"
// that shows the brand, the actual item colour, the category, and the item
// name. Rendered inline as a data: URL so it never 404s and always looks
// on-brand with Vessura's quiet-luxury aesthetic.

const COLOR_HEX: Record<string, string> = {
    white: "#EFE9DC",
    cream: "#F2E9D4",
    ivory: "#EAE3D0",
    black: "#151515",
    charcoal: "#2A2A2A",
    navy: "#1A2744",
    blue: "#2E4A6A",
    "blue-white": "#6B7F99",
    indigo: "#25345C",
    grey: "#7A7A7A",
    gray: "#7A7A7A",
    silver: "#A8ACB2",
    khaki: "#B3A678",
    tan: "#C6A780",
    camel: "#B58A5C",
    brown: "#5C3A20",
    olive: "#5E6B2F",
    burgundy: "#6E1426",
    wine: "#6E1426",
    red: "#7E1E1E",
    green: "#365940",
    pink: "#D4A5B1",
    yellow: "#C9A24B",
    tortoise: "#7A5A30",
    gold: "#B08A2E",
};

function hexForColor(name: string | undefined): string {
    if (!name) return "#80163A";
    const key = name.toLowerCase().trim();
    return COLOR_HEX[key] ?? "#80163A";
}

function isLightHex(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

function escapeXml(str: string): string {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Wrap a string into at most `max` lines at word boundaries.
function wrapLabel(label: string, max = 3): string[] {
    const words = label.toUpperCase().split(/\s+/);
    if (words.length <= max) return words.map((w) => w);
    // Pack ~2 words per line
    const lines: string[] = [];
    let buf: string[] = [];
    for (const w of words) {
        buf.push(w);
        if (buf.join(" ").length > 11) {
            lines.push(buf.join(" "));
            buf = [];
        }
    }
    if (buf.length) lines.push(buf.join(" "));
    return lines.slice(0, max);
}

// Minimal silhouettes per category. Kept abstract on purpose — the card is
// typographic first, illustration second.
function silhouettePath(category: string): string {
    switch (category) {
        case "tops":
            return "M135 170 L175 150 L185 155 L195 150 L200 170 L230 180 L250 240 L220 250 L220 340 L150 340 L150 250 L120 240 L140 180 Z";
        case "bottoms":
            return "M155 170 L215 170 L225 180 L215 340 L195 340 L185 215 L175 340 L155 340 L145 180 Z";
        case "outerwear":
            return "M120 175 L150 160 L170 165 L185 175 L200 165 L220 160 L250 175 L260 350 L230 360 L230 220 L220 350 L150 350 L140 220 L140 360 L110 350 Z";
        case "shoes":
            return "M110 280 Q110 260 140 255 L235 270 Q260 280 258 300 L258 318 L105 318 L105 298 Q105 285 110 280 Z";
        case "accessories":
            return "M120 250 L250 250 L255 260 L250 270 L120 270 L115 260 Z";
        default:
            return "M150 170 L220 170 L240 200 L230 340 L140 340 L130 200 Z";
    }
}

function buildDemoImage(opts: {
    name: string;
    brand?: string;
    color?: string;
    category: string;
}): string {
    const bg = hexForColor(opts.color);
    const light = isLightHex(bg);
    const fg = light ? "#151515" : "#FDFBF7";
    const accent = light ? "#80163A" : "#D4AF37";
    const nameLines = wrapLabel(opts.name, 3);
    const lineHeight = 30;
    const startY = 235 - ((nameLines.length - 1) * lineHeight) / 2;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
<rect width="400" height="500" fill="${bg}"/>
<g stroke="${fg}" stroke-width="1.25" stroke-opacity="0.12" fill="${fg}" fill-opacity="0.06">
<path d="${silhouettePath(opts.category)}"/>
</g>
<text x="32" y="46" font-family="Georgia,serif" font-size="13" font-style="italic" fill="${fg}" fill-opacity="0.82">${escapeXml(opts.brand ?? "Vessura")}</text>
<line x1="32" y1="58" x2="80" y2="58" stroke="${accent}" stroke-width="1.25"/>
<text x="368" y="46" font-family="-apple-system,Inter,sans-serif" font-size="9" letter-spacing="2.5" fill="${fg}" fill-opacity="0.55" text-anchor="end">${escapeXml(opts.category.toUpperCase())}</text>
${nameLines
    .map(
        (line, i) =>
            `<text x="200" y="${startY + i * lineHeight}" font-family="Georgia,serif" font-size="26" fill="${fg}" text-anchor="middle">${escapeXml(line)}</text>`
    )
    .join("\n")}
<line x1="32" y1="448" x2="368" y2="448" stroke="${accent}" stroke-width="1" stroke-opacity="0.35"/>
<text x="32" y="470" font-family="-apple-system,Inter,sans-serif" font-size="10" letter-spacing="3" fill="${fg}" fill-opacity="0.68">${escapeXml((opts.color ?? "VESSURA").toUpperCase())}</text>
<text x="368" y="470" font-family="-apple-system,Inter,sans-serif" font-size="9" letter-spacing="2" fill="${fg}" fill-opacity="0.5" text-anchor="end">ATELIER EDITION</text>
</svg>`;

    return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

// Input validation schemas
const patchWardrobeItemSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.enum(CATEGORIES).optional(),
    color: z.string().min(1).max(50).optional(),
    brand: z.string().max(100).optional(),
    size: z.string().max(20).optional(),
    season: z.enum(SEASONS).optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().optional(),
}).strict();

// Helper function to validate and parse numeric IDs
const parseId = (id: string): number => {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed) || parsed < 1) {
        throw new AppError("Invalid item ID", 400);
    }
    return parsed;
};

export const getWardrobeItems = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);
    const items = await storage.getWardrobeItems(req.user.id);
    res.json(items);
});

export const createWardrobeItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    // Zod will throw error caught by global handler
    const itemData = insertWardrobeItemSchema.parse({
        ...req.body,
        userId: req.user.id
    });

    const item = await storage.createWardrobeItem(itemData);
    res.status(201).json(item);
});

export const getWardrobeItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const id = parseId(req.params.id);
    const item = await storage.getWardrobeItem(id);

    if (!item) throw new AppError("Wardrobe item not found", 404);
    if (item.userId !== req.user.id) throw new AppError("Forbidden", 403);

    res.json(item);
});

export const updateWardrobeItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const id = parseId(req.params.id);
    const validatedData = patchWardrobeItemSchema.parse(req.body);

    const item = await storage.getWardrobeItem(id);
    if (!item) throw new AppError("Wardrobe item not found", 404);
    if (item.userId !== req.user.id) throw new AppError("Forbidden", 403);

    const updatedItem = await storage.updateWardrobeItem(id, validatedData);
    res.json(updatedItem);
});

export const deleteWardrobeItem = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const id = parseId(req.params.id);
    const item = await storage.getWardrobeItem(id);

    if (!item) throw new AppError("Wardrobe item not found", 404);
    if (item.userId !== req.user.id) throw new AppError("Forbidden", 403);

    await storage.deleteWardrobeItem(id);
    res.status(204).end();
});

export const seedWardrobe = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userId = req.user!.id;

        // Opt-in reset: delete the user's existing items + outfits before
        // seeding so reseeding replaces old demo data with the new SVG cards
        // rather than duplicating it. Only triggered when ?reset=true or
        // when the body includes { reset: true }.
        const shouldReset =
            req.query?.reset === "true" || (req.body && req.body.reset === true);

        if (shouldReset) {
            try {
                const existingOutfits = await storage.getOutfits(userId);
                for (const o of existingOutfits) {
                    try { await storage.deleteOutfit(o.id); } catch { /* swallow */ }
                }
                const existingItems = await storage.getWardrobeItems(userId);
                for (const it of existingItems) {
                    try { await storage.deleteWardrobeItem(it.id); } catch { /* swallow */ }
                }
            } catch (err) {
                console.warn("Reset step failed; continuing with seed:", err);
            }
        }

        // ─── Seeded pieces ────────────────────────────────────────────────
        // Every piece below is a real wardrobe essential paired with a plausible
        // brand. Images are generated from buildDemoImage() so colour + brand +
        // name always match — no broken stock photos.
        type ItemSpec = {
            name: string;
            category: "tops" | "bottoms" | "outerwear" | "shoes" | "accessories";
            subcategory: string;
            color: string;
            brand: string;
            size: string;
            season: "all" | "spring" | "summer" | "fall" | "winter";
            tags: string[];
            favorite: boolean;
            purchasePrice: number;
        };

        const itemSpecs: ItemSpec[] = [
            // ─── Tops ─────────────────────────────────────────────
            { name: "Classic White Oxford Shirt", category: "tops", subcategory: "dress-shirt", color: "white", brand: "Ralph Lauren", size: "M", season: "all", tags: ["formal", "classic", "versatile"], favorite: true, purchasePrice: 9800 },
            { name: "Navy Blue Polo", category: "tops", subcategory: "polo", color: "navy", brand: "Lacoste", size: "M", season: "summer", tags: ["casual", "smart-casual", "preppy"], favorite: false, purchasePrice: 11500 },
            { name: "Black Crew Neck Tee", category: "tops", subcategory: "t-shirt", color: "black", brand: "COS", size: "M", season: "all", tags: ["casual", "minimal", "essential"], favorite: true, purchasePrice: 3900 },
            { name: "Grey Cashmere Sweater", category: "tops", subcategory: "sweater", color: "grey", brand: "Uniqlo", size: "M", season: "winter", tags: ["cozy", "minimal", "layering"], favorite: false, purchasePrice: 12900 },
            { name: "Striped Linen Shirt", category: "tops", subcategory: "casual-shirt", color: "blue-white", brand: "J.Crew", size: "M", season: "summer", tags: ["casual", "summer", "vacation"], favorite: false, purchasePrice: 7400 },
            { name: "Charcoal Henley", category: "tops", subcategory: "henley", color: "charcoal", brand: "James Perse", size: "M", season: "all", tags: ["casual", "layering"], favorite: false, purchasePrice: 15500 },

            // ─── Bottoms ──────────────────────────────────────────
            { name: "Dark Indigo Slim Jeans", category: "bottoms", subcategory: "jeans", color: "indigo", brand: "Levi\'s", size: "32", season: "all", tags: ["casual", "essential", "versatile"], favorite: true, purchasePrice: 9800 },
            { name: "Khaki Chinos", category: "bottoms", subcategory: "chinos", color: "khaki", brand: "Dockers", size: "32", season: "all", tags: ["smart-casual", "office", "versatile"], favorite: false, purchasePrice: 6500 },
            { name: "Navy Dress Trousers", category: "bottoms", subcategory: "dress-pants", color: "navy", brand: "Hugo Boss", size: "32", season: "all", tags: ["formal", "office", "tailored"], favorite: true, purchasePrice: 18900 },
            { name: "Olive Cargo Shorts", category: "bottoms", subcategory: "shorts", color: "olive", brand: "Carhartt", size: "32", season: "summer", tags: ["casual", "summer", "outdoor"], favorite: false, purchasePrice: 6200 },

            // ─── Outerwear ────────────────────────────────────────
            { name: "Navy Blazer", category: "outerwear", subcategory: "blazer", color: "navy", brand: "Brooks Brothers", size: "M", season: "all", tags: ["formal", "classic", "tailored"], favorite: true, purchasePrice: 39500 },
            { name: "Camel Trench Coat", category: "outerwear", subcategory: "trench", color: "camel", brand: "Burberry", size: "M", season: "fall", tags: ["classic", "elegant", "investment"], favorite: true, purchasePrice: 195000 },
            { name: "Black Leather Biker", category: "outerwear", subcategory: "jacket", color: "black", brand: "AllSaints", size: "M", season: "fall", tags: ["edgy", "statement", "casual"], favorite: true, purchasePrice: 54000 },
            { name: "Charcoal Wool Overcoat", category: "outerwear", subcategory: "overcoat", color: "charcoal", brand: "Reiss", size: "M", season: "winter", tags: ["formal", "elegant", "winter"], favorite: false, purchasePrice: 59500 },
            { name: "Indigo Denim Jacket", category: "outerwear", subcategory: "jacket", color: "indigo", brand: "Levi\'s", size: "M", season: "spring", tags: ["casual", "layering", "classic"], favorite: false, purchasePrice: 11900 },

            // ─── Shoes ────────────────────────────────────────────
            { name: "White Leather Sneakers", category: "shoes", subcategory: "sneakers", color: "white", brand: "Common Projects", size: "10", season: "all", tags: ["minimal", "versatile", "everyday"], favorite: true, purchasePrice: 45000 },
            { name: "Brown Oxford Shoes", category: "shoes", subcategory: "oxford", color: "brown", brand: "Allen Edmonds", size: "10", season: "all", tags: ["formal", "classic", "leather"], favorite: true, purchasePrice: 39500 },
            { name: "Black Chelsea Boots", category: "shoes", subcategory: "boots", color: "black", brand: "R.M. Williams", size: "10", season: "fall", tags: ["smart-casual", "versatile"], favorite: false, purchasePrice: 58500 },
            { name: "Tan Suede Loafers", category: "shoes", subcategory: "loafers", color: "tan", brand: "Tod\'s", size: "10", season: "summer", tags: ["smart-casual", "italian", "summer"], favorite: false, purchasePrice: 48000 },

            // ─── Accessories ──────────────────────────────────────
            { name: "Black Leather Belt", category: "accessories", subcategory: "belt", color: "black", brand: "Saint Laurent", size: "34", season: "all", tags: ["essential", "formal"], favorite: true, purchasePrice: 32000 },
            { name: "Steel Chronograph Watch", category: "accessories", subcategory: "watch", color: "silver", brand: "Omega", size: "42mm", season: "all", tags: ["luxury", "classic", "investment"], favorite: true, purchasePrice: 575000 },
            { name: "Navy Silk Tie", category: "accessories", subcategory: "tie", color: "navy", brand: "Hermès", size: "one-size", season: "all", tags: ["formal", "silk", "elegant"], favorite: false, purchasePrice: 18500 },
            { name: "Tortoise Wayfarer Sunglasses", category: "accessories", subcategory: "sunglasses", color: "tortoise", brand: "Ray-Ban", size: "one-size", season: "summer", tags: ["classic", "summer"], favorite: true, purchasePrice: 16500 },
            { name: "Gold Aviator Sunglasses", category: "accessories", subcategory: "sunglasses", color: "gold", brand: "Ray-Ban", size: "one-size", season: "summer", tags: ["classic", "iconic"], favorite: false, purchasePrice: 17500 },
            { name: "Charcoal Wool Scarf", category: "accessories", subcategory: "scarf", color: "charcoal", brand: "Acne Studios", size: "one-size", season: "winter", tags: ["winter", "cozy"], favorite: false, purchasePrice: 22000 },
            { name: "Black Canvas Backpack", category: "accessories", subcategory: "bag", color: "black", brand: "Herschel", size: "one-size", season: "all", tags: ["everyday", "practical"], favorite: false, purchasePrice: 9500 },

            // ─── Extra tops (for variety) ─────────────────────────
            { name: "White Crew Neck Tee", category: "tops", subcategory: "t-shirt", color: "white", brand: "Sunspel", size: "M", season: "all", tags: ["essential", "minimal"], favorite: true, purchasePrice: 6500 },
            { name: "Sky Blue Oxford Shirt", category: "tops", subcategory: "dress-shirt", color: "blue", brand: "Brooks Brothers", size: "M", season: "all", tags: ["formal", "classic", "preppy"], favorite: false, purchasePrice: 9800 },
            { name: "Cream Fisherman Knit", category: "tops", subcategory: "sweater", color: "cream", brand: "Inis Meáin", size: "M", season: "winter", tags: ["cozy", "investment"], favorite: false, purchasePrice: 32000 },
            { name: "Charcoal Grey Hoodie", category: "tops", subcategory: "hoodie", color: "charcoal", brand: "Reigning Champ", size: "M", season: "all", tags: ["casual", "weekend"], favorite: false, purchasePrice: 13500 },
            { name: "Navy Merino Sweater", category: "tops", subcategory: "sweater", color: "navy", brand: "John Smedley", size: "M", season: "fall", tags: ["smart-casual", "layering"], favorite: true, purchasePrice: 22000 },

            // ─── Extra bottoms ────────────────────────────────────
            { name: "Grey Flannel Trousers", category: "bottoms", subcategory: "dress-pants", color: "grey", brand: "Incotex", size: "32", season: "winter", tags: ["formal", "tailored"], favorite: false, purchasePrice: 16500 },
            { name: "Black Dress Trousers", category: "bottoms", subcategory: "dress-pants", color: "black", brand: "Hugo Boss", size: "32", season: "all", tags: ["formal", "evening"], favorite: false, purchasePrice: 17500 },
            { name: "Cream Cotton Trousers", category: "bottoms", subcategory: "chinos", color: "cream", brand: "Drake\\'s", size: "32", season: "summer", tags: ["summer", "smart-casual"], favorite: false, purchasePrice: 14500 },
            { name: "Black Selvedge Jeans", category: "bottoms", subcategory: "jeans", color: "black", brand: "A.P.C.", size: "32", season: "all", tags: ["casual", "edgy"], favorite: false, purchasePrice: 19500 },

            // ─── Extra outerwear ──────────────────────────────────
            { name: "Olive Field Jacket", category: "outerwear", subcategory: "jacket", color: "olive", brand: "Barbour", size: "M", season: "fall", tags: ["casual", "heritage"], favorite: true, purchasePrice: 38500 },
            { name: "Navy Peacoat", category: "outerwear", subcategory: "overcoat", color: "navy", brand: "Schott NYC", size: "M", season: "winter", tags: ["classic", "nautical"], favorite: false, purchasePrice: 45000 },
            { name: "Black MA-1 Bomber", category: "outerwear", subcategory: "jacket", color: "black", brand: "Alpha Industries", size: "M", season: "fall", tags: ["casual", "heritage"], favorite: false, purchasePrice: 15500 },
            { name: "Navy Shawl Cardigan", category: "outerwear", subcategory: "cardigan", color: "navy", brand: "Todd Snyder", size: "M", season: "fall", tags: ["cozy", "smart-casual"], favorite: false, purchasePrice: 24500 },

            // ─── Extra shoes ──────────────────────────────────────
            { name: "Navy Canvas Sneakers", category: "shoes", subcategory: "sneakers", color: "navy", brand: "Vans", size: "10", season: "summer", tags: ["casual", "weekend"], favorite: false, purchasePrice: 6500 },
            { name: "Black Penny Loafers", category: "shoes", subcategory: "loafers", color: "black", brand: "G.H. Bass", size: "10", season: "all", tags: ["smart-casual", "preppy"], favorite: false, purchasePrice: 18500 },
            { name: "Brown Boat Shoes", category: "shoes", subcategory: "boat-shoes", color: "brown", brand: "Sperry", size: "10", season: "summer", tags: ["summer", "casual"], favorite: false, purchasePrice: 9500 },

            // ─── Extra accessories ────────────────────────────────
            { name: "Brown Leather Bifold Wallet", category: "accessories", subcategory: "wallet", color: "brown", brand: "Il Bisonte", size: "one-size", season: "all", tags: ["essential", "daily"], favorite: true, purchasePrice: 12500 },
            { name: "Navy Baseball Cap", category: "accessories", subcategory: "hat", color: "navy", brand: "New Era", size: "one-size", season: "all", tags: ["casual", "sporty"], favorite: false, purchasePrice: 3500 },
            { name: "Black Leather Gloves", category: "accessories", subcategory: "gloves", color: "black", brand: "Dents", size: "M", season: "winter", tags: ["winter", "formal"], favorite: false, purchasePrice: 12000 },
            { name: "White Pocket Square", category: "accessories", subcategory: "pocket-square", color: "white", brand: "Drake\\'s", size: "one-size", season: "all", tags: ["formal", "detail"], favorite: false, purchasePrice: 4500 },
            { name: "Tan Leather Weekender", category: "accessories", subcategory: "bag", color: "tan", brand: "Filson", size: "one-size", season: "all", tags: ["travel", "heritage"], favorite: false, purchasePrice: 48500 },
        ];

        const sampleItems = itemSpecs.map((spec) => ({
            userId,
            name: spec.name,
            category: spec.category,
            subcategory: spec.subcategory,
            color: spec.color,
            brand: spec.brand,
            size: spec.size,
            season: spec.season,
            imageUrl: buildDemoImage({ name: spec.name, brand: spec.brand, color: spec.color, category: spec.category }),
            tags: spec.tags,
            favorite: spec.favorite,
            purchasePrice: spec.purchasePrice,
            wearCount: 0,
            status: "available" as const,
        }));

        const createdItems = [];
        for (const item of sampleItems) {
            const itemWithDefaults = {
                ...item,
                wearCount: item.wearCount ?? 0,
                status: (item.status ?? "available") as "available" | "in_laundry" | "at_cleaners" | "in_storage" | "lent_out" | "archived",
            };
            const created = await storage.createWardrobeItem(itemWithDefaults);
            createdItems.push(created);
        }

        // Build a name→id map so we can reference seeded items when composing outfits.
        const idByName = new Map<string, number>();
        for (const item of createdItems) {
            idByName.set(item.name, item.id);
        }

        // Curated outfits — each a realistic combination of seeded pieces.
        // Keys must match sampleItems names above exactly.
        const outfitRecipes: Array<{
            name: string;
            description: string;
            occasion: string;
            season: string;
            weatherConditions: string;
            mood: string;
            favorite: boolean;
            itemNames: string[];
        }> = [
            {
                name: "The Monday Meeting",
                description: "Crisp, quietly authoritative. Works across seasons.",
                occasion: "work",
                season: "all",
                weatherConditions: "mild",
                mood: "focused",
                favorite: true,
                itemNames: [
                    "Classic White Oxford Shirt",
                    "Navy Dress Trousers",
                    "Brown Oxford Dress Shoes",
                    "Black Leather Belt",
                    "Silver Chronograph Watch",
                ],
            },
            {
                name: "Weekend Reset",
                description: "Effortless Sunday mode. Coffee, bookstore, nowhere to be.",
                occasion: "casual",
                season: "all",
                weatherConditions: "mild",
                mood: "relaxed",
                favorite: false,
                itemNames: [
                    "Black Crew Neck T-Shirt",
                    "Dark Indigo Slim Jeans",
                    "White Minimalist Sneakers",
                    "Tortoise Shell Sunglasses",
                ],
            },
            {
                name: "Coastal Summer",
                description: "Hot weather, salt air, linen over everything.",
                occasion: "casual",
                season: "summer",
                weatherConditions: "hot",
                mood: "easy",
                favorite: true,
                itemNames: [
                    "Striped Linen Shirt",
                    "Olive Cargo Shorts",
                    "Navy Suede Loafers",
                    "Tortoise Shell Sunglasses",
                ],
            },
            {
                name: "Off Hours",
                description: "Smart-casual without trying. For drinks or dinner plans.",
                occasion: "date",
                season: "all",
                weatherConditions: "mild",
                mood: "confident",
                favorite: true,
                itemNames: [
                    "Navy Blue Polo",
                    "Khaki Chinos",
                    "Navy Suede Loafers",
                    "Silver Chronograph Watch",
                ],
            },
            {
                name: "Black Tie Adjacent",
                description: "Formal events, weddings, the gala you didn't expect.",
                occasion: "formal",
                season: "all",
                weatherConditions: "mild",
                mood: "elevated",
                favorite: true,
                itemNames: [
                    "Classic White Oxford Shirt",
                    "Navy Dress Trousers",
                    "Classic Navy Blazer",
                    "Brown Oxford Dress Shoes",
                    "Navy Silk Tie",
                    "Black Leather Belt",
                    "Silver Chronograph Watch",
                ],
            },
            {
                name: "City Nights",
                description: "Leather, denim, confidence. For anything after dark.",
                occasion: "night-out",
                season: "fall",
                weatherConditions: "cool",
                mood: "bold",
                favorite: false,
                itemNames: [
                    "Black Crew Neck T-Shirt",
                    "Dark Indigo Slim Jeans",
                    "Black Leather Jacket",
                    "Black Chelsea Boots",
                ],
            },
            {
                name: "Autumn Transition",
                description: "Layers for 12°C mornings and 22°C afternoons.",
                occasion: "casual",
                season: "fall",
                weatherConditions: "cool",
                mood: "composed",
                favorite: false,
                itemNames: [
                    "Grey Cashmere Sweater",
                    "Dark Indigo Slim Jeans",
                    "Tan Trench Coat",
                    "Black Chelsea Boots",
                ],
            },
            {
                name: "Deep Winter",
                description: "When the temperature drops below freezing.",
                occasion: "casual",
                season: "winter",
                weatherConditions: "cold",
                mood: "cozy",
                favorite: false,
                itemNames: [
                    "Grey Cashmere Sweater",
                    "Dark Indigo Slim Jeans",
                    "Charcoal Wool Overcoat",
                    "Charcoal Wool Scarf",
                    "Black Chelsea Boots",
                ],
            },
            {
                name: "Smart Casual Friday",
                description: "The office is relaxed, but the meeting still matters.",
                occasion: "work",
                season: "all",
                weatherConditions: "mild",
                mood: "confident",
                favorite: false,
                itemNames: [
                    "Sky Blue Oxford Shirt",
                    "Grey Flannel Trousers",
                    "Black Penny Loafers",
                    "Navy Shawl Cardigan",
                    "Brown Leather Bifold Wallet",
                ],
            },
            {
                name: "Summer Editor",
                description: "Airports, aperitifs, architectural shade.",
                occasion: "casual",
                season: "summer",
                weatherConditions: "hot",
                mood: "easy",
                favorite: true,
                itemNames: [
                    "White Crew Neck Tee",
                    "Cream Cotton Trousers",
                    "Brown Boat Shoes",
                    "Tortoise Wayfarer Sunglasses",
                    "Tan Leather Weekender",
                ],
            },
            {
                name: "Winter Formal",
                description: "Black tie-adjacent. Long coats and deliberate knots.",
                occasion: "formal",
                season: "winter",
                weatherConditions: "cold",
                mood: "elevated",
                favorite: true,
                itemNames: [
                    "Classic White Oxford Shirt",
                    "Black Dress Trousers",
                    "Black Penny Loafers",
                    "Navy Peacoat",
                    "Navy Silk Tie",
                    "Black Leather Gloves",
                    "Steel Chronograph Watch",
                ],
            },
            {
                name: "Heritage Weekend",
                description: "Field jacket, selvedge denim, nowhere to be in a hurry.",
                occasion: "casual",
                season: "fall",
                weatherConditions: "cool",
                mood: "relaxed",
                favorite: false,
                itemNames: [
                    "Navy Merino Sweater",
                    "Black Selvedge Jeans",
                    "Olive Field Jacket",
                    "Black Chelsea Boots",
                    "Navy Baseball Cap",
                ],
            },
        ];

        const createdOutfits: any[] = [];
        for (const recipe of outfitRecipes) {
            const itemIds = recipe.itemNames
                .map(name => idByName.get(name))
                .filter((id): id is number => typeof id === "number");

            if (itemIds.length === 0) continue; // skip if no items matched

            try {
                const outfit = await storage.createOutfit({
                    userId,
                    name: recipe.name,
                    description: recipe.description,
                    items: itemIds,
                    occasion: recipe.occasion,
                    season: recipe.season,
                    weatherConditions: recipe.weatherConditions,
                    mood: recipe.mood,
                    favorite: recipe.favorite,
                });
                createdOutfits.push(outfit);
            } catch (err) {
                console.warn(`Failed to seed outfit "${recipe.name}":`, err);
            }
        }

        res.status(201).json({
            message: `Successfully seeded ${createdItems.length} items and ${createdOutfits.length} outfits`,
            itemCount: createdItems.length,
            outfitCount: createdOutfits.length,
            items: createdItems,
            outfits: createdOutfits,
        });
    } catch (error) {
        console.error("Failed to seed wardrobe:", error);
        res.status(500).json({ message: "Failed to seed wardrobe" });
    }
};
