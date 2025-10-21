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
