/**
 * API Validation Schemas
 *
 * Zod schemas for all API endpoints.
 * Provides strict input validation at the controller layer.
 */

import { z } from 'zod';

// ============================================
// USER / AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password cannot exceed 100 characters'),
});

export const registerSchema = loginSchema.extend({
    name: z.string().max(100).optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

export const updateUserSchema = z.object({
    name: z.string().max(100).optional(),
    email: z.string().email().optional(),
    profilePicture: z.string().url().optional(),
    preferences: z.record(z.unknown()).optional(),
});

// ============================================
// WARDROBE ITEM SCHEMAS
// ============================================

const categoryEnum = z.enum([
    'tops', 'bottoms', 'dresses', 'outerwear',
    'shoes', 'accessories', 'bags', 'activewear',
    'swimwear', 'formal', 'loungewear', 'other'
]);

const seasonEnum = z.enum(['spring', 'summer', 'fall', 'winter', 'all']);

const itemStatusEnum = z.enum([
    'available', 'in_laundry', 'at_cleaners',
    'in_storage', 'lent_out', 'archived'
]);

export const createWardrobeItemSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Name cannot exceed 200 characters'),
    category: categoryEnum,
    subcategory: z.string().max(100).optional(),
    color: z.string().max(50).optional(),
    brand: z.string().max(100).optional(),
    size: z.string().max(20).optional(),
    season: seasonEnum.optional().default('all'),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    purchasePrice: z.number().min(0, 'Price must be positive').optional(),
    purchaseDate: z.string().datetime().optional(),
    tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
    favorite: z.boolean().optional(),
    status: itemStatusEnum.optional().default('available'),
    notes: z.string().max(1000).optional(),
});

export const updateWardrobeItemSchema = createWardrobeItemSchema.partial();

export const wardrobeItemIdSchema = z.object({
    id: z.string().regex(/^\d+$/, 'Invalid item ID').transform(Number),
});

// ============================================
// OUTFIT SCHEMAS
// ============================================

export const createOutfitSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Name cannot exceed 200 characters'),
    items: z.array(z.number().int().positive())
        .min(1, 'At least one item is required')
        .max(20, 'Maximum 20 items per outfit'),
    occasion: z.string().max(100).optional(),
    season: seasonEnum.optional(),
    notes: z.string().max(1000).optional(),
    imageUrl: z.string().url().optional(),
});

export const updateOutfitSchema = createOutfitSchema.partial();

// ============================================
// TRIP SCHEMAS
// ============================================

export const createTripSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Name cannot exceed 200 characters'),
    destination: z.string()
        .min(1, 'Destination is required')
        .max(200, 'Destination cannot exceed 200 characters'),
    startDate: z.string().datetime({ message: 'Invalid start date format' }),
    endDate: z.string().datetime({ message: 'Invalid end date format' }),
    climate: z.string().max(50).optional(),
    activities: z.array(z.string().max(100)).max(20).optional(),
    packedItems: z.array(z.number().int().positive()).optional(),
    outfits: z.array(z.number().int().positive()).optional(),
    notes: z.string().max(2000).optional(),
}).refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'End date must be after start date', path: ['endDate'] }
);

export const updateTripSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    destination: z.string().min(1).max(200).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    climate: z.string().max(50).optional(),
    activities: z.array(z.string().max(100)).max(20).optional(),
    packedItems: z.array(z.number().int().positive()).optional(),
    outfits: z.array(z.number().int().positive()).optional(),
    notes: z.string().max(2000).optional(),
});

// ============================================
// CALENDAR SCHEMAS
// ============================================

export const createCalendarEventSchema = z.object({
    outfitId: z.number().int().positive('Invalid outfit ID'),
    date: z.string().datetime({ message: 'Invalid date format' }),
    occasion: z.string().max(200).optional(),
    notes: z.string().max(500).optional(),
});

// ============================================
// WEAR LOG SCHEMAS
// ============================================

export const createWearLogSchema = z.object({
    itemId: z.number().int().positive('Invalid item ID'),
    wornAt: z.string().datetime().optional(),
    occasion: z.string().max(200).optional(),
    weather: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
});

// ============================================
// PREFERENCES SCHEMAS
// ============================================

export const createWeatherPreferenceSchema = z.object({
    weatherType: z.string().min(1).max(50),
    preferredCategories: z.array(categoryEnum).optional(),
    avoidCategories: z.array(categoryEnum).optional(),
    notes: z.string().max(500).optional(),
});

export const createMoodPreferenceSchema = z.object({
    mood: z.string().min(1).max(50),
    preferredColors: z.array(z.string().max(30)).optional(),
    preferredStyles: z.array(z.string().max(50)).optional(),
    notes: z.string().max(500).optional(),
});

// ============================================
// AI / SERVICES SCHEMAS
// ============================================

export const aiOutfitRequestSchema = z.object({
    occasion: z.string().max(200).optional(),
    weather: z.object({
        temperature: z.number(),
        condition: z.string().max(50),
    }).optional(),
    mood: z.string().max(50).optional(),
    colorPreference: z.string().max(30).optional(),
    excludeItems: z.array(z.number().int().positive()).optional(),
});

export const scrapeProductSchema = z.object({
    url: z.string().url('Invalid product URL'),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateWardrobeItemInput = z.infer<typeof createWardrobeItemSchema>;
export type UpdateWardrobeItemInput = z.infer<typeof updateWardrobeItemSchema>;
export type CreateOutfitInput = z.infer<typeof createOutfitSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CreateWearLogInput = z.infer<typeof createWearLogSchema>;
