/**
 * Weather Widget
 *
 * FSD Widget layer - weather display with location.
 */

// Re-export weather hooks and components
export { useWeather } from '@/hooks/use-weather';
export { default as WeatherLocationModal } from '@/components/weather-location-modal';

// Weather data type
export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity?: number;
    wind?: number;
    icon?: string;
}

// Weather-based outfit suggestions
export function getWeatherCategory(temperature: number): 'hot' | 'warm' | 'mild' | 'cool' | 'cold' {
    if (temperature >= 30) return 'hot';
    if (temperature >= 20) return 'warm';
    if (temperature >= 15) return 'mild';
    if (temperature >= 10) return 'cool';
    return 'cold';
}

export function getSuggestedLayers(temperature: number): string[] {
    const category = getWeatherCategory(temperature);

    switch (category) {
        case 'hot':
            return ['Light tops', 'Shorts', 'Sandals'];
        case 'warm':
            return ['T-shirts', 'Light pants', 'Sneakers'];
        case 'mild':
            return ['Long sleeves', 'Jeans', 'Light jacket'];
        case 'cool':
            return ['Sweaters', 'Pants', 'Jacket'];
        case 'cold':
            return ['Layers', 'Coat', 'Boots', 'Scarf'];
    }
}
