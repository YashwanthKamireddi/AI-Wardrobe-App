/**
 * Application Constants
 * Centralized location for all magic values, strings, and configuration
 */

// ============================================
// DESIGN TOKENS
// ============================================

export const COLORS = {
    // Primary Palette (Quiet Luxury)
    charcoal: '#1A1A1A',
    graphite: '#6B6B6B',
    taupe: '#9A9A9A',
    pearl: '#E5E5E5',
    cashmere: '#FAFAFA',
    ivory: '#FDFBF7',

    // Accent Colors
    burgundy: '#80163A',
    gold: '#D4AF37',
    goldMuted: '#B8962F',

    // Semantic Colors
    success: '#16A34A',
    warning: '#EAB308',
    error: '#DC2626',
    info: '#4A7DB4',
} as const;

export const FONTS = {
    display: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
} as const;

export const SPACING = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
} as const;

export const BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================
// ANIMATION TIMINGS
// ============================================

export const ANIMATIONS = {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: { type: 'spring', stiffness: 300, damping: 30 },
    springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
    easeOut: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
} as const;

// ============================================
// APP CONFIGURATION
// ============================================

export const APP_CONFIG = {
    name: 'Vessura',
    tagline: 'Your Wardrobe, Elevated',
    version: '1.0.0',
    maxWardrobeItems: 500,
    maxOutfitsPerDay: 5,
    maxUploadSizeMB: 10,
} as const;

// ============================================
// WARDROBE CATEGORIES
// ============================================

export const CATEGORIES = [
    'tops',
    'bottoms',
    'dresses',
    'outerwear',
    'shoes',
    'accessories',
    'bags',
    'jewelry',
    'swimwear',
    'activewear',
] as const;

export const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all'] as const;

export const OCCASIONS = [
    'casual',
    'work',
    'formal',
    'date',
    'workout',
    'travel',
    'party',
    'wedding',
] as const;

// ============================================
// WEATHER MAPPINGS
// ============================================

export const WEATHER_ICONS = {
    sunny: 'Sun',
    partly_cloudy: 'CloudSun',
    cloudy: 'Cloud',
    rainy: 'CloudRain',
    snowy: 'CloudSnow',
    windy: 'Wind',
    hot: 'Thermometer',
    cold: 'Snowflake',
} as const;

export const WEATHER_OUTFIT_ADVICE = {
    hot: 'Light layers, breathable fabrics',
    warm: 'Perfect for a light blouse or shirt',
    mild: 'Consider a light jacket',
    cool: 'Layer up with a sweater',
    cold: 'Warm coat and layers recommended',
} as const;

// ============================================
// API ENDPOINTS (relative paths)
// ============================================

export const API = {
    auth: {
        login: '/api/login',
        logout: '/api/logout',
        register: '/api/register',
        user: '/api/user',
    },
    wardrobe: {
        items: '/api/wardrobe',
        item: (id: number) => `/api/wardrobe/${id}`,
        upload: '/api/upload-image',
    },
    outfits: {
        list: '/api/outfits',
        item: (id: number) => `/api/outfits/${id}`,
    },
    social: {
        feed: '/api/social/feed',
        challenges: '/api/social/challenges',
    },
    weather: '/api/weather',
} as const;

export type Category = typeof CATEGORIES[number];
export type Season = typeof SEASONS[number];
export type Occasion = typeof OCCASIONS[number];
