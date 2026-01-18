/**
 * Trip Planner Feature
 *
 * FSD Feature layer - trip planning actions.
 * Create trips, pack items, plan outfits for travel.
 */

// Re-export entity
export * from '@/entities/trip';

// Feature-specific types
export interface TripPlannerState {
    trip: Partial<import('@shared/schema').InsertTrip>;
    packedItems: number[];
    plannedOutfits: number[];
    packingList: PackingListItem[];
}

export interface PackingListItem {
    itemId: number;
    packed: boolean;
    quantity: number;
    notes?: string;
}

export interface TripWeatherForecast {
    date: string;
    temperature: number;
    condition: string;
    icon?: string;
}

export interface TripSuggestion {
    type: 'item' | 'outfit';
    id: number;
    reason: string;
    priority: 'essential' | 'recommended' | 'optional';
}

// Packing templates
export const PACKING_TEMPLATES = {
    weekend: {
        name: 'Weekend Getaway',
        duration: 2,
        items: ['2 tops', '1 bottom', '1 dress/outfit', '2 underwear', 'sleepwear', 'toiletries'],
    },
    business: {
        name: 'Business Trip',
        duration: 3,
        items: ['3-4 business outfits', 'casual dinner outfit', 'workout clothes', 'laptop bag'],
    },
    vacation: {
        name: 'Week Vacation',
        duration: 7,
        items: ['7 tops', '3-4 bottoms', '2 dresses', 'swimwear', 'evening outfit', 'activewear'],
    },
    beach: {
        name: 'Beach Holiday',
        duration: 5,
        items: ['swimsuits', 'cover-ups', 'shorts', 'tank tops', 'sun hat', 'sandals'],
    },
} as const;
