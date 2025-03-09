// Types for AI-powered features

export interface StyleProfile {
  dominantStyle: string;
  colorPalette: string[];
  keyItems: string[];
  preferences: {
    formality: number;
    boldness: number;
    trendiness: number;
    seasonality: string;
    silhouette: string;
    [key: string]: any;
  };
  personalityTraits: string[];
}

export interface AIOutfitRecommendation {
  outfitName: string;
  description: string;
  items: {
    id: number;
    name: string;
    reason: string;
  }[];
  styleAdvice: string;
  occasion: string;
  confidence: number;
}

export interface OccasionOutfitRequest {
  occasion: string;
  weather?: string;
}

export interface AIOutfitRecommendationRequest {
  mood: string;
  weather: string;
  occasion?: string;
}