/**
 * Style DNA scoring
 *
 * Derives a persisted style profile from a user's wardrobe items.
 * Scores are deterministic integers 0–100. The algorithm is intentionally
 * transparent — every score is a weighted sum of observable wardrobe facts,
 * not a black box.
 */

import type { WardrobeItem } from "@shared/schema";

const NEUTRAL_COLORS = new Set([
    "black", "white", "gray", "grey", "beige", "cream", "navy", "brown", "tan", "khaki", "charcoal", "ivory"
]);
const WARM_COLORS = new Set(["red", "orange", "yellow", "coral", "burgundy", "maroon", "rust", "terracotta", "pink"]);
const COOL_COLORS = new Set(["blue", "green", "purple", "teal", "mint", "lavender", "violet", "turquoise"]);
const METALLICS = new Set(["gold", "silver", "bronze", "copper"]);
const SEASONS = ["spring", "summer", "fall", "winter"] as const;

export type StyleArchetype = 'minimalist' | 'curator' | 'classicist' | 'expressionist' | 'naturalist';

export interface StyleProfile {
    archetype: StyleArchetype;
    styleScore: number;
    colorHarmony: number;
    versatilityScore: number;
    maturityScore: number;
    dominantColors: string[];
    categoryBreakdown: Record<string, number>;
    traits: string[];
    totalItems: number;
    computedAt: Date;
}

function bucketColor(raw: string | null | undefined): string {
    if (!raw) return 'unknown';
    const lower = raw.toLowerCase().trim();
    for (const n of NEUTRAL_COLORS) if (lower.includes(n)) return n;
    for (const w of WARM_COLORS) if (lower.includes(w)) return w;
    for (const c of COOL_COLORS) if (lower.includes(c)) return c;
    for (const m of METALLICS) if (lower.includes(m)) return m;
    return lower;
}

function colorFamily(color: string): 'neutral' | 'warm' | 'cool' | 'metallic' | 'other' {
    const c = color.toLowerCase();
    if (NEUTRAL_COLORS.has(c) || Array.from(NEUTRAL_COLORS).some(n => c.includes(n))) return 'neutral';
    if (WARM_COLORS.has(c) || Array.from(WARM_COLORS).some(w => c.includes(w))) return 'warm';
    if (COOL_COLORS.has(c) || Array.from(COOL_COLORS).some(cc => c.includes(cc))) return 'cool';
    if (METALLICS.has(c) || Array.from(METALLICS).some(m => c.includes(m))) return 'metallic';
    return 'other';
}

/**
 * Color harmony: rewards wardrobes that stay within a coherent palette.
 * Pure neutrals = high harmony. Too many unrelated families = lower.
 */
function computeColorHarmony(items: WardrobeItem[]): { score: number; dominantColors: string[] } {
    if (items.length === 0) return { score: 0, dominantColors: [] };

    const counts: Record<string, number> = {};
    let neutrals = 0;
    let warm = 0;
    let cool = 0;

    for (const item of items) {
        const bucket = bucketColor(item.color);
        if (bucket === 'unknown') continue;
        counts[bucket] = (counts[bucket] || 0) + 1;
        const fam = colorFamily(bucket);
        if (fam === 'neutral') neutrals++;
        else if (fam === 'warm') warm++;
        else if (fam === 'cool') cool++;
    }

    const dominantColors = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([c]) => c);

    const countedItems = neutrals + warm + cool;
    if (countedItems === 0) return { score: 50, dominantColors };

    // Penalize wardrobes that try to be everything at once.
    const neutralRatio = neutrals / countedItems;
    const warmRatio = warm / countedItems;
    const coolRatio = cool / countedItems;

    // Harmony = neutral anchoring + dominant accent family.
    // 60 base + up to 30 from neutral anchor + up to 10 from accent dominance.
    const neutralAnchor = Math.min(30, neutralRatio * 45);
    const accentDominance = Math.min(10, Math.abs(warmRatio - coolRatio) * 20);
    const base = 60;
    const diversityPenalty = Math.max(0, (Object.keys(counts).length - 6) * 2);

    const score = Math.round(Math.max(20, Math.min(100, base + neutralAnchor + accentDominance - diversityPenalty)));
    return { score, dominantColors };
}

/**
 * Versatility: category spread × season coverage × reasonable quantity.
 */
function computeVersatility(items: WardrobeItem[]): number {
    if (items.length === 0) return 0;
    const categories = new Set(items.map(i => (i.category || '').toLowerCase()).filter(Boolean));
    const seasons = new Set(items.map(i => (i.season || '').toLowerCase()).filter(Boolean));

    const categoryScore = Math.min(35, categories.size * 8);   // 5+ categories → full 35
    const seasonScore = Math.min(25, seasons.size * 7);        // all 4 seasons → ~28 capped at 25
    const quantityScore = Math.min(25, items.length * 2);      // 12+ items → full 25
    const depthScore = (() => {
        // Depth = items per category (rewarded up to ~3 per category)
        if (categories.size === 0) return 0;
        const avgPerCategory = items.length / categories.size;
        return Math.min(15, Math.round(avgPerCategory * 4));
    })();

    return Math.min(100, categoryScore + seasonScore + quantityScore + depthScore);
}

/**
 * Maturity: how actively the wardrobe is used. Rewards wear logs, recency.
 */
function computeMaturity(items: WardrobeItem[]): number {
    if (items.length === 0) return 0;

    const withWear = items.filter(i => (i.wearCount || 0) > 0).length;
    const wearRatio = withWear / items.length;

    const recentlyWorn = items.filter(i => {
        if (!i.lastWorn) return false;
        const days = (Date.now() - new Date(i.lastWorn).getTime()) / 86400000;
        return days >= 0 && days <= 30;
    }).length;
    const recencyRatio = recentlyWorn / items.length;

    // 40 from wear ratio, 40 from recency, 20 base for simply having items
    const base = 20;
    const wearScore = Math.round(wearRatio * 40);
    const recencyScore = Math.round(recencyRatio * 40);
    return Math.min(100, base + wearScore + recencyScore);
}

/**
 * Archetype selection — based on wardrobe shape, not just color.
 */
function selectArchetype(items: WardrobeItem[], colorHarmony: number, dominantColors: string[]): { archetype: StyleArchetype; traits: string[] } {
    if (items.length === 0) {
        return { archetype: 'curator', traits: ['Just getting started'] };
    }

    const neutralShare = dominantColors.slice(0, 3).filter(c => colorFamily(c) === 'neutral').length / Math.max(1, Math.min(3, dominantColors.length));
    const boldShare = dominantColors.filter(c => colorFamily(c) === 'warm' || colorFamily(c) === 'metallic').length / Math.max(1, dominantColors.length);
    const hasEarth = dominantColors.some(c => ['brown', 'tan', 'khaki', 'olive', 'beige'].some(e => c.includes(e)));
    const avgPrice = (() => {
        const priced = items.filter(i => i.purchasePrice && i.purchasePrice > 0);
        if (priced.length === 0) return 0;
        return priced.reduce((s, i) => s + (i.purchasePrice || 0), 0) / priced.length;
    })();

    // Minimalist: strong neutral dominance, high harmony, fewer bold colors.
    if (neutralShare >= 0.66 && colorHarmony >= 75 && boldShare < 0.2) {
        return {
            archetype: 'minimalist',
            traits: ['Capsule wardrobe', 'Neutral tones', 'Clean silhouettes'],
        };
    }

    // Expressionist: bold colors, lower neutral share.
    if (boldShare >= 0.35 || (neutralShare < 0.3 && dominantColors.length >= 4)) {
        return {
            archetype: 'expressionist',
            traits: ['Bold choices', 'Color lover', 'Trend-aware'],
        };
    }

    // Naturalist: earth tones prominent.
    if (hasEarth && neutralShare < 0.6) {
        return {
            archetype: 'naturalist',
            traits: ['Eco-conscious', 'Natural fibers', 'Earth tones'],
        };
    }

    // Curator: high avg investment + some color coherence.
    if (avgPrice >= 3000 && colorHarmony >= 60) {
        return {
            archetype: 'curator',
            traits: ['Quality-focused', 'Timeless choices', 'Investment mindset'],
        };
    }

    // Default: Classicist — moderate neutrals, classic balance.
    return {
        archetype: 'classicist',
        traits: ['Traditional styling', 'Polished looks', 'Heritage brands'],
    };
}

export function computeStyleProfile(items: WardrobeItem[]): StyleProfile {
    const { score: colorHarmony, dominantColors } = computeColorHarmony(items);
    const versatilityScore = computeVersatility(items);
    const maturityScore = computeMaturity(items);
    const { archetype, traits } = selectArchetype(items, colorHarmony, dominantColors);

    const categoryBreakdown: Record<string, number> = {};
    for (const item of items) {
        const cat = (item.category || 'uncategorized').toLowerCase();
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }

    // Composite style score: weighted blend, bounded 0–100.
    const styleScore = Math.round(
        colorHarmony * 0.35 +
        versatilityScore * 0.35 +
        maturityScore * 0.30
    );

    return {
        archetype,
        styleScore,
        colorHarmony,
        versatilityScore,
        maturityScore,
        dominantColors,
        categoryBreakdown,
        traits,
        totalItems: items.length,
        computedAt: new Date(),
    };
}

export const STYLE_PROFILE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
export const ALL_SEASONS = SEASONS;
