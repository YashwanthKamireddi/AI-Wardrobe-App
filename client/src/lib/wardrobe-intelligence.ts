/**
 * WARDROBE INTELLIGENCE ENGINE
 *
 * Implements the "Agentic Wardrobe" concepts from the architectural blueprint:
 * - Cost-Per-Wear (CPW) Analytics
 * - Dead Stock Detection
 * - Style Compatibility Scoring
 * - Color Harmony Analysis
 * - Predictive Insights
 *
 * This transforms the wardrobe from a passive catalog to an active asset management tool.
 */

import { WardrobeItem, Outfit } from "@shared/schema";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WardrobeAnalytics {
  totalItems: number;
  totalValue: number;
  averageCPW: number;
  mostWorn: WardrobeItem[];
  leastWorn: WardrobeItem[];
  deadStock: WardrobeItem[];
  highValueItems: WardrobeItem[];
  categoryBreakdown: CategoryStats[];
  colorPalette: ColorStats[];
  seasonalDistribution: SeasonStats[];
  investmentHealth: InvestmentHealth;
}

export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  totalValue: number;
  averageCPW: number;
  icon: string;
}

export interface ColorStats {
  color: string;
  hex: string;
  count: number;
  percentage: number;
  items: WardrobeItem[];
}

export interface SeasonStats {
  season: string;
  count: number;
  percentage: number;
  icon: string;
}

export interface InvestmentHealth {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  insights: string[];
  recommendations: string[];
}

export interface ItemInsight {
  item: WardrobeItem;
  cpw: number;
  cpwGrade: "Excellent" | "Good" | "Fair" | "Poor" | "Dead Stock";
  daysOwned: number;
  wearFrequency: string;
  valueAssessment: string;
  actionRecommendation: string | null;
  compatibleItems: WardrobeItem[];
  colorHarmonyScore: number;
}

export interface StyleCompatibility {
  item1: WardrobeItem;
  item2: WardrobeItem;
  score: number; // 0-100
  reasoning: string;
  harmonyType: "Complementary" | "Analogous" | "Triadic" | "Neutral" | "Clash";
}

// ============================================================================
// COLOR THEORY ENGINE
// ============================================================================

const COLOR_MAP: Record<string, { hex: string; hue: number; family: string }> = {
  // Neutrals
  white: { hex: "#FAFAFA", hue: 0, family: "neutral" },
  black: { hex: "#1A1A1A", hue: 0, family: "neutral" },
  grey: { hex: "#6B6B6B", hue: 0, family: "neutral" },
  gray: { hex: "#6B6B6B", hue: 0, family: "neutral" },
  cream: { hex: "#FFFDD0", hue: 54, family: "neutral" },
  beige: { hex: "#E8DFD0", hue: 36, family: "neutral" },
  ivory: { hex: "#FFFFF0", hue: 60, family: "neutral" },
  // Warm Colors
  red: { hex: "#B44141", hue: 0, family: "warm" },
  burgundy: { hex: "#80163A", hue: 340, family: "warm" },
  maroon: { hex: "#800000", hue: 0, family: "warm" },
  orange: { hex: "#FF6B35", hue: 20, family: "warm" },
  coral: { hex: "#FF7F50", hue: 16, family: "warm" },
  peach: { hex: "#FFCBA4", hue: 28, family: "warm" },
  yellow: { hex: "#F5C563", hue: 45, family: "warm" },
  gold: { hex: "#C5A572", hue: 40, family: "warm" },
  tan: { hex: "#D2B48C", hue: 34, family: "warm" },
  brown: { hex: "#8B4513", hue: 25, family: "warm" },
  camel: { hex: "#C19A6B", hue: 30, family: "warm" },
  khaki: { hex: "#C3B091", hue: 42, family: "warm" },
  // Cool Colors
  blue: { hex: "#3B5998", hue: 220, family: "cool" },
  navy: { hex: "#1B2838", hue: 210, family: "cool" },
  indigo: { hex: "#3F51B5", hue: 231, family: "cool" },
  teal: { hex: "#008080", hue: 180, family: "cool" },
  turquoise: { hex: "#40E0D0", hue: 174, family: "cool" },
  cyan: { hex: "#00FFFF", hue: 180, family: "cool" },
  // Greens
  green: { hex: "#2E7D32", hue: 123, family: "cool" },
  olive: { hex: "#556B2F", hue: 82, family: "warm" },
  sage: { hex: "#9CAF88", hue: 95, family: "cool" },
  mint: { hex: "#98FF98", hue: 120, family: "cool" },
  forest: { hex: "#228B22", hue: 120, family: "cool" },
  // Purple/Pink
  purple: { hex: "#9B59B6", hue: 283, family: "cool" },
  lavender: { hex: "#E6E6FA", hue: 240, family: "cool" },
  violet: { hex: "#8B00FF", hue: 270, family: "cool" },
  pink: { hex: "#FFC0CB", hue: 350, family: "warm" },
  blush: { hex: "#DE5D83", hue: 343, family: "warm" },
  magenta: { hex: "#FF00FF", hue: 300, family: "cool" },
  rose: { hex: "#FF007F", hue: 330, family: "warm" },
};

/**
 * Get color info from a color string
 */
export function getColorInfo(colorString: string | null | undefined): { hex: string; hue: number; family: string } {
  if (!colorString) return { hex: "#9A9A9A", hue: 0, family: "neutral" };

  const lowerColor = colorString.toLowerCase();

  // Direct match
  if (COLOR_MAP[lowerColor]) return COLOR_MAP[lowerColor];

  // Partial match
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (lowerColor.includes(key) || key.includes(lowerColor)) {
      return value;
    }
  }

  return { hex: "#9A9A9A", hue: 0, family: "neutral" };
}

/**
 * Calculate color harmony between two items
 * Based on color wheel theory: complementary, analogous, triadic
 */
export function calculateColorHarmony(item1: WardrobeItem, item2: WardrobeItem): StyleCompatibility {
  const color1 = getColorInfo(item1.color);
  const color2 = getColorInfo(item2.color);

  // Neutrals go with everything
  if (color1.family === "neutral" || color2.family === "neutral") {
    return {
      item1,
      item2,
      score: 90,
      reasoning: "Neutrals provide a versatile foundation that pairs effortlessly",
      harmonyType: "Neutral",
    };
  }

  const hueDiff = Math.abs(color1.hue - color2.hue);
  const normalizedDiff = hueDiff > 180 ? 360 - hueDiff : hueDiff;

  // Complementary (opposite on color wheel: 150-180°)
  if (normalizedDiff >= 150 && normalizedDiff <= 180) {
    return {
      item1,
      item2,
      score: 85,
      reasoning: "Complementary colors create bold, dynamic contrast",
      harmonyType: "Complementary",
    };
  }

  // Analogous (adjacent: 0-30°)
  if (normalizedDiff <= 30) {
    return {
      item1,
      item2,
      score: 88,
      reasoning: "Analogous colors create a harmonious, sophisticated flow",
      harmonyType: "Analogous",
    };
  }

  // Triadic (120° apart)
  if (normalizedDiff >= 110 && normalizedDiff <= 130) {
    return {
      item1,
      item2,
      score: 80,
      reasoning: "Triadic harmony offers vibrant visual interest",
      harmonyType: "Triadic",
    };
  }

  // Potential clash (60-90°)
  if (normalizedDiff >= 60 && normalizedDiff <= 90) {
    return {
      item1,
      item2,
      score: 55,
      reasoning: "These colors may clash - consider adding a neutral buffer",
      harmonyType: "Clash",
    };
  }

  // Default acceptable
  return {
    item1,
    item2,
    score: 70,
    reasoning: "These colors can work together with thoughtful styling",
    harmonyType: "Neutral",
  };
}

// ============================================================================
// COST-PER-WEAR ANALYTICS
// ============================================================================

/**
 * Calculate Cost-Per-Wear for an item
 * CPW = Purchase Price / Number of Wears
 */
export function calculateCPW(item: WardrobeItem): number {
  if (!item.purchasePrice || !item.wearCount || item.wearCount === 0) {
    return item.purchasePrice ? item.purchasePrice / 100 : 0; // Return full price if never worn
  }
  return (item.purchasePrice / 100) / item.wearCount;
}

/**
 * Grade an item's CPW performance
 */
export function gradeCPW(cpw: number, item: WardrobeItem): ItemInsight["cpwGrade"] {
  // Consider how long they've owned it
  const daysOwned = item.purchaseDate
    ? Math.floor((Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24))
    : 365; // Assume 1 year if unknown

  const expectedWears = Math.floor(daysOwned / 14); // Expect wear every 2 weeks minimum
  const actualWears = item.wearCount || 0;
  const wearRatio = actualWears / Math.max(expectedWears, 1);

  if (actualWears === 0 && daysOwned > 60) return "Dead Stock";
  if (cpw < 5 || wearRatio > 1.5) return "Excellent";
  if (cpw < 15 || wearRatio > 1) return "Good";
  if (cpw < 30 || wearRatio > 0.5) return "Fair";
  return "Poor";
}

/**
 * Generate detailed insights for a single item
 */
export function generateItemInsight(item: WardrobeItem, allItems: WardrobeItem[]): ItemInsight {
  const cpw = calculateCPW(item);
  const cpwGrade = gradeCPW(cpw, item);

  const daysOwned = item.purchaseDate
    ? Math.floor((Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const wearCount = item.wearCount || 0;
  const wearsPerMonth = daysOwned > 0 ? (wearCount / daysOwned) * 30 : 0;

  let wearFrequency: string;
  if (wearsPerMonth >= 8) wearFrequency = "Wardrobe staple";
  else if (wearsPerMonth >= 4) wearFrequency = "Regular rotation";
  else if (wearsPerMonth >= 2) wearFrequency = "Occasional wear";
  else if (wearsPerMonth >= 0.5) wearFrequency = "Rarely worn";
  else wearFrequency = "Never worn";

  let valueAssessment: string;
  let actionRecommendation: string | null = null;

  switch (cpwGrade) {
    case "Excellent":
      valueAssessment = "Exceptional investment - this piece delivers outstanding value";
      break;
    case "Good":
      valueAssessment = "Solid performer - earning its place in your wardrobe";
      break;
    case "Fair":
      valueAssessment = "Room for improvement - try incorporating it into more outfits";
      actionRecommendation = "Consider styling this piece in new ways";
      break;
    case "Poor":
      valueAssessment = "Underperforming - may not suit your lifestyle";
      actionRecommendation = "Review if this aligns with your current style";
      break;
    case "Dead Stock":
      valueAssessment = "Not being utilized - occupying space without value";
      actionRecommendation = "Consider selling, donating, or restyling";
      break;
  }

  // Find compatible items based on color harmony
  const compatibleItems = allItems
    .filter(other => other.id !== item.id && other.category !== item.category)
    .map(other => ({ item: other, ...calculateColorHarmony(item, other) }))
    .filter(c => c.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(c => c.item);

  const avgHarmonyScore = compatibleItems.length > 0
    ? compatibleItems.reduce((sum, other) => sum + calculateColorHarmony(item, other).score, 0) / compatibleItems.length
    : 0;

  return {
    item,
    cpw,
    cpwGrade,
    daysOwned,
    wearFrequency,
    valueAssessment,
    actionRecommendation,
    compatibleItems,
    colorHarmonyScore: Math.round(avgHarmonyScore),
  };
}

// ============================================================================
// WARDROBE-LEVEL ANALYTICS
// ============================================================================

/**
 * Generate comprehensive wardrobe analytics
 */
export function analyzeWardrobe(items: WardrobeItem[]): WardrobeAnalytics {
  if (!items || items.length === 0) {
    return {
      totalItems: 0,
      totalValue: 0,
      averageCPW: 0,
      mostWorn: [],
      leastWorn: [],
      deadStock: [],
      highValueItems: [],
      categoryBreakdown: [],
      colorPalette: [],
      seasonalDistribution: [],
      investmentHealth: {
        score: 0,
        grade: "F",
        insights: ["Add items to your wardrobe to see analytics"],
        recommendations: ["Start building your digital wardrobe"],
      },
    };
  }

  const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0) / 100;

  const cpws = items.map(item => calculateCPW(item)).filter(cpw => cpw > 0);
  const averageCPW = cpws.length > 0 ? cpws.reduce((a, b) => a + b, 0) / cpws.length : 0;

  const sortedByWear = [...items].sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0));
  const mostWorn = sortedByWear.slice(0, 5);
  const leastWorn = sortedByWear.filter(item => (item.wearCount || 0) > 0).slice(-5).reverse();

  const deadStock = items.filter(item => {
    const daysOwned = item.purchaseDate
      ? Math.floor((Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    return (item.wearCount || 0) === 0 && daysOwned > 60;
  });

  const highValueItems = [...items]
    .filter(item => item.purchasePrice)
    .sort((a, b) => (b.purchasePrice || 0) - (a.purchasePrice || 0))
    .slice(0, 5);

  // Category breakdown
  const categoryIcons: Record<string, string> = {
    tops: "👕",
    bottoms: "👖",
    dresses: "👗",
    outerwear: "🧥",
    shoes: "👟",
    accessories: "⌚",
    activewear: "🏃",
    swimwear: "👙",
    formal: "🎩",
  };

  const categoryMap = new Map<string, WardrobeItem[]>();
  items.forEach(item => {
    const cat = item.category || "other";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(item);
  });

  const categoryBreakdown: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, catItems]) => ({
    category,
    count: catItems.length,
    percentage: (catItems.length / items.length) * 100,
    totalValue: catItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0) / 100,
    averageCPW: catItems.reduce((sum, item) => sum + calculateCPW(item), 0) / catItems.length,
    icon: categoryIcons[category] || "📦",
  })).sort((a, b) => b.count - a.count);

  // Color palette
  const colorMap = new Map<string, WardrobeItem[]>();
  items.forEach(item => {
    const color = item.color?.toLowerCase() || "unknown";
    if (!colorMap.has(color)) colorMap.set(color, []);
    colorMap.get(color)!.push(item);
  });

  const colorPalette: ColorStats[] = Array.from(colorMap.entries())
    .map(([color, colorItems]) => ({
      color,
      hex: getColorInfo(color).hex,
      count: colorItems.length,
      percentage: (colorItems.length / items.length) * 100,
      items: colorItems,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Seasonal distribution
  const seasonIcons: Record<string, string> = {
    spring: "🌸",
    summer: "☀️",
    fall: "🍂",
    winter: "❄️",
    all: "🌍",
  };

  const seasonMap = new Map<string, number>();
  items.forEach(item => {
    const season = item.season || "all";
    seasonMap.set(season, (seasonMap.get(season) || 0) + 1);
  });

  const seasonalDistribution: SeasonStats[] = Array.from(seasonMap.entries()).map(([season, count]) => ({
    season,
    count,
    percentage: (count / items.length) * 100,
    icon: seasonIcons[season] || "📅",
  })).sort((a, b) => b.count - a.count);

  // Investment health score
  const investmentHealth = calculateInvestmentHealth(items, deadStock, averageCPW, totalValue);

  return {
    totalItems: items.length,
    totalValue,
    averageCPW,
    mostWorn,
    leastWorn,
    deadStock,
    highValueItems,
    categoryBreakdown,
    colorPalette,
    seasonalDistribution,
    investmentHealth,
  };
}

/**
 * Calculate overall wardrobe investment health
 */
function calculateInvestmentHealth(
  items: WardrobeItem[],
  deadStock: WardrobeItem[],
  averageCPW: number,
  totalValue: number
): InvestmentHealth {
  const insights: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Dead stock penalty
  const deadStockRatio = deadStock.length / items.length;
  if (deadStockRatio > 0.3) {
    score -= 30;
    insights.push(`${Math.round(deadStockRatio * 100)}% of your wardrobe is unused`);
    recommendations.push("Consider selling or donating items you haven't worn in 60+ days");
  } else if (deadStockRatio > 0.15) {
    score -= 15;
    insights.push("Some items are gathering dust");
    recommendations.push("Try styling overlooked pieces in new combinations");
  } else if (deadStockRatio < 0.05) {
    insights.push("Excellent wardrobe utilization - nearly everything gets worn");
  }

  // CPW assessment
  if (averageCPW < 10) {
    insights.push("Outstanding cost efficiency - your pieces deliver great value");
  } else if (averageCPW < 25) {
    insights.push("Good cost efficiency overall");
  } else if (averageCPW > 50) {
    score -= 20;
    insights.push("High cost-per-wear suggests underutilization");
    recommendations.push("Focus on versatile pieces that work with multiple outfits");
  }

  // Category balance
  const categories = new Set(items.map(i => i.category));
  if (categories.size < 4) {
    score -= 10;
    insights.push("Limited wardrobe variety");
    recommendations.push("Consider adding pieces from different categories for more outfit options");
  } else if (categories.size >= 6) {
    insights.push("Well-rounded wardrobe with good category diversity");
  }

  // High-value item utilization
  const highValueItems = items.filter(i => (i.purchasePrice || 0) > 10000); // $100+
  const underusedHighValue = highValueItems.filter(i => (i.wearCount || 0) < 5);
  if (underusedHighValue.length > 0) {
    score -= 10;
    insights.push(`${underusedHighValue.length} premium items are underutilized`);
    recommendations.push("Maximize ROI on high-value pieces by wearing them more frequently");
  }

  // Determine grade
  let grade: InvestmentHealth["grade"];
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";
  else grade = "F";

  // Add positive recommendation if doing well
  if (score >= 80) {
    recommendations.push("Keep up the great wardrobe management!");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    grade,
    insights,
    recommendations,
  };
}

// ============================================================================
// OUTFIT COMPATIBILITY ENGINE
// ============================================================================

/**
 * Score an outfit combination
 */
export function scoreOutfitCombination(items: WardrobeItem[]): {
  score: number;
  reasoning: string[];
  colorHarmony: number;
  styleCoherence: number;
  seasonalMatch: number;
} {
  if (items.length < 2) {
    return { score: 0, reasoning: ["Need at least 2 items"], colorHarmony: 0, styleCoherence: 0, seasonalMatch: 0 };
  }

  const reasoning: string[] = [];

  // Calculate average color harmony between all pairs
  let totalHarmony = 0;
  let pairCount = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const harmony = calculateColorHarmony(items[i], items[j]);
      totalHarmony += harmony.score;
      pairCount++;
      if (harmony.score < 60) {
        reasoning.push(`${items[i].name} and ${items[j].name}: ${harmony.reasoning}`);
      }
    }
  }
  const colorHarmony = pairCount > 0 ? totalHarmony / pairCount : 0;

  // Style coherence (check if tags align)
  const allTags = items.flatMap(item => item.tags || []);
  const tagFrequency = new Map<string, number>();
  allTags.forEach(tag => tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1));
  const dominantTags = Array.from(tagFrequency.entries()).filter(([_, count]) => count >= 2);
  const styleCoherence = dominantTags.length > 0 ? Math.min(100, 70 + dominantTags.length * 10) : 60;

  if (dominantTags.length > 0) {
    reasoning.push(`Strong style coherence: ${dominantTags.map(([tag]) => tag).join(", ")}`);
  }

  // Seasonal match
  const seasons = items.map(item => item.season || "all");
  const uniqueSeasons = new Set(seasons.filter(s => s !== "all"));
  const seasonalMatch = uniqueSeasons.size <= 1 ? 100 : (uniqueSeasons.size === 2 ? 75 : 50);

  if (uniqueSeasons.size > 1) {
    reasoning.push("Mixed seasonal items - ensure weather appropriateness");
  }

  // Overall score
  const score = Math.round((colorHarmony * 0.4) + (styleCoherence * 0.35) + (seasonalMatch * 0.25));

  return {
    score,
    reasoning,
    colorHarmony: Math.round(colorHarmony),
    styleCoherence,
    seasonalMatch,
  };
}

// ============================================================================
// PREDICTIVE INSIGHTS
// ============================================================================

/**
 * Predict items that may need replacement soon
 */
export function predictReplacements(items: WardrobeItem[]): Array<{
  item: WardrobeItem;
  wearVelocity: number;
  estimatedLifeRemaining: string;
  replacementUrgency: "Low" | "Medium" | "High";
}> {
  const highWearItems = items.filter(item => (item.wearCount || 0) > 20);

  return highWearItems.map(item => {
    const wearCount = item.wearCount || 0;
    const daysOwned = item.purchaseDate
      ? Math.floor((Date.now() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    const wearVelocity = daysOwned > 0 ? (wearCount / daysOwned) * 30 : 0; // Wears per month

    // Estimate lifespan based on category
    const lifespanMap: Record<string, number> = {
      shoes: 150, // wears
      tops: 100,
      bottoms: 120,
      outerwear: 200,
      accessories: 300,
    };

    const expectedLifespan = lifespanMap[item.category || "tops"] || 100;
    const remainingWears = Math.max(0, expectedLifespan - wearCount);
    const monthsRemaining = wearVelocity > 0 ? remainingWears / wearVelocity : 999;

    let estimatedLifeRemaining: string;
    let replacementUrgency: "Low" | "Medium" | "High";

    if (monthsRemaining < 2) {
      estimatedLifeRemaining = "Less than 2 months";
      replacementUrgency = "High";
    } else if (monthsRemaining < 6) {
      estimatedLifeRemaining = `~${Math.round(monthsRemaining)} months`;
      replacementUrgency = "Medium";
    } else {
      estimatedLifeRemaining = "6+ months";
      replacementUrgency = "Low";
    }

    return {
      item,
      wearVelocity: Math.round(wearVelocity * 10) / 10,
      estimatedLifeRemaining,
      replacementUrgency,
    };
  }).filter(p => p.replacementUrgency !== "Low");
}

/**
 * Suggest wardrobe gaps based on current inventory
 */
export function identifyWardrobeGaps(items: WardrobeItem[]): Array<{
  gap: string;
  reason: string;
  priority: "Essential" | "Recommended" | "Nice to Have";
}> {
  const gaps: Array<{ gap: string; reason: string; priority: "Essential" | "Recommended" | "Nice to Have" }> = [];

  const categories = new Map<string, number>();
  items.forEach(item => {
    const cat = item.category || "other";
    categories.set(cat, (categories.get(cat) || 0) + 1);
  });

  // Essential category checks
  if (!categories.has("outerwear") || (categories.get("outerwear") || 0) < 2) {
    gaps.push({
      gap: "Outerwear variety",
      reason: "A versatile jacket and coat are wardrobe essentials",
      priority: "Essential",
    });
  }

  if (!categories.has("shoes") || (categories.get("shoes") || 0) < 3) {
    gaps.push({
      gap: "Footwear options",
      reason: "Recommend: casual sneakers, dress shoes, and boots",
      priority: "Essential",
    });
  }

  // Color balance
  const colors = items.map(item => getColorInfo(item.color).family);
  const neutralCount = colors.filter(c => c === "neutral").length;
  const neutralRatio = neutralCount / items.length;

  if (neutralRatio < 0.3) {
    gaps.push({
      gap: "Neutral basics",
      reason: "Neutrals anchor any outfit - add more black, white, or grey pieces",
      priority: "Recommended",
    });
  }

  if (neutralRatio > 0.7) {
    gaps.push({
      gap: "Color variety",
      reason: "Add strategic color pieces to elevate your looks",
      priority: "Nice to Have",
    });
  }

  // Seasonal gaps
  const seasons = items.map(item => item.season);
  const winterItems = seasons.filter(s => s === "winter" || s === "all").length;
  const summerItems = seasons.filter(s => s === "summer" || s === "all").length;

  if (winterItems < items.length * 0.2) {
    gaps.push({
      gap: "Winter wardrobe",
      reason: "Limited cold-weather options",
      priority: "Recommended",
    });
  }

  if (summerItems < items.length * 0.2) {
    gaps.push({
      gap: "Summer wardrobe",
      reason: "Limited warm-weather options",
      priority: "Recommended",
    });
  }

  return gaps;
}
