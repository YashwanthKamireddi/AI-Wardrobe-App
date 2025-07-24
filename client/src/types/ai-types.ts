export interface AIOutfitRecommendation {
  name: string;
  items: string[];
  stylingTip: string;
  reasoning: string;
  confidenceScore: number;
}

export interface AIOutfitRecommendationRequest {
  wardrobeItems: any[];
  weatherCondition?: {
    temperature: number;
    condition: string;
    humidity: number;
    precipitation: number;
  };
  occasion?: string;
  mood?: string;
  userPreferences?: Record<string, any>;
}