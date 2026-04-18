/**
 * VESSURA BRAND CONSTANTS
 *
 * Central source of truth for all branding elements.
 * Brand name: Vessura (selected based on brand viability research).
 */

export const BRAND = {
    // Core Identity
    name: "Vessura",
    tagline: "Your Wardrobe, Elevated",
    description: "The intelligent wardrobe platform where fashion meets technology",

    // Visual Identity
    colors: {
        primary: "#80163A",           // Burgundy
        secondary: "#D4AF37",         // Gold
        accent: "#C9A959",            // Warm Gold
        text: {
            primary: "#1A1A1A",
            secondary: "#6B6B6B",
            muted: "#9CA3AF",
        },
        background: {
            main: "#FDFBF7",          // Warm white
            card: "#FFFFFF",
            elevated: "#FAF9F6",
        },
        status: {
            success: "#10B981",
            warning: "#F59E0B",
            error: "#EF4444",
            info: "#3B82F6",
        },
    },

    // Typography
    fonts: {
        heading: "'Playfair Display', serif",
        body: "'Inter', system-ui, sans-serif",
        mono: "'JetBrains Mono', monospace",
    },

    // Styling
    borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
    },

    // Animation
    transitions: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
    },

    // Social
    social: {
        instagram: "@vessura",
        twitter: "@vessura",
    },

    // Legal
    copyright: `© ${new Date().getFullYear()} Vessura. All rights reserved.`,
} as const;

// Style Quiz Question Types
export const STYLE_QUIZ = {
    categories: [
        "Classic",
        "Modern Minimalist",
        "Bohemian",
        "Edgy",
        "Romantic",
        "Streetwear",
        "Preppy",
        "Avant-Garde",
    ],

    occasions: [
        "Work/Professional",
        "Casual Weekend",
        "Date Night",
        "Formal Events",
        "Active/Athleisure",
        "Travel",
    ],

    colorPreferences: [
        "Neutrals (Black, White, Grey, Beige)",
        "Earth Tones (Brown, Olive, Rust)",
        "Bold Colors (Red, Blue, Yellow)",
        "Pastels (Blush, Lavender, Mint)",
        "Jewel Tones (Emerald, Sapphire, Ruby)",
        "Monochromatic",
    ],

    shoppingHabits: [
        "Quality over quantity - Investment pieces",
        "Trend-focused - Latest styles",
        "Thrift & Vintage lover",
        "Basics builder",
        "Statement piece collector",
        "Sustainable/Ethical focus",
    ],

    styleWords: [
        "Effortless", "Polished", "Bold", "Minimal", "Artistic",
        "Comfortable", "Sophisticated", "Playful", "Elegant", "Relaxed",
        "Edgy", "Classic", "Modern", "Romantic", "Eclectic",
    ],
} as const;

// Wardrobe Health Metrics
export const WARDROBE_METRICS = {
    grades: {
        A: { min: 90, label: "Excellent", color: "#10B981" },
        B: { min: 75, label: "Good", color: "#34D399" },
        C: { min: 60, label: "Fair", color: "#FBBF24" },
        D: { min: 40, label: "Needs Work", color: "#F97316" },
        F: { min: 0, label: "Critical", color: "#EF4444" },
    },

    essentials: {
        tops: ["White T-Shirt", "Black T-Shirt", "White Button-Down", "Neutral Sweater"],
        bottoms: ["Dark Jeans", "Light Jeans", "Black Trousers", "Khaki Chinos"],
        outerwear: ["Denim Jacket", "Blazer", "Trench Coat", "Puffer Jacket"],
        shoes: ["White Sneakers", "Black Dress Shoes", "Casual Boots", "Sandals"],
        accessories: ["Leather Belt", "Watch", "Sunglasses", "Versatile Bag"],
    },

    cpwThresholds: {
        excellent: 2.00,   // $2 or less per wear
        good: 5.00,        // $5 or less per wear
        fair: 15.00,       // $15 or less per wear
        poor: 50.00,       // $50 or less per wear
    },
} as const;

export type StyleCategory = typeof STYLE_QUIZ.categories[number];
export type StyleWord = typeof STYLE_QUIZ.styleWords[number];
export type WardrobeGrade = keyof typeof WARDROBE_METRICS.grades;
