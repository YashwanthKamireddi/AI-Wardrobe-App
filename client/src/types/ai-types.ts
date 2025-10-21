export interface AIOutfitItem {
  id: number;
  name: string;
  reason?: string;
}

export interface AIOutfitRecommendation {
  name: string;
  outfitName: string;
  description: string;
  items: AIOutfitItem[];
  stylingTip: string;
  styleAdvice: string;
  reasoning: string;
  confidenceScore: number;
  confidence?: number;
  occasion?: string;
}

export interface AIOutfitRecommendationRequest {
  wardrobeItems?: any[];
  weatherCondition?: {
    temperature: number;
    condition: string;
    humidity: number;
    precipitation: number;
  };
  weather?: string;
  occasion?: string;
  mood?: string;
  userPreferences?: Record<string, any>;
}

export interface StyleProfile {
  dominantStyle: string;
  keyItems?: string[];
  colorPalette?: string[];
  styleTraits?: string[];
  personalityTraits?: string[];
  preferences?: {
    formality?: number;
    boldness?: number;
    trendiness?: number;
    seasonality?: string;
    silhouette?: string;
  };
}
