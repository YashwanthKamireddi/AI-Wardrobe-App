/**
 * Weather Service Module
 * Provides mock weather data for outfit recommendations
 */

export interface WeatherData {
  type: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'windy' | 'hot' | 'cold';
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

export const validLocations = [
  "New York City",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "San Francisco",
  "Seattle",
  "Denver",
  "Boston",
  "Miami",
  "Atlanta",
  "Las Vegas",
  "Portland"
];

/**
 * Get mock weather data for a given location
 */
export async function getWeatherForLocation(location: string): Promise<WeatherData> {
  // Mock weather data based on location name hash
  const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = 50 + (hash % 40);
  
  const weatherTypes: WeatherData['type'][] = ['sunny', 'rainy', 'cloudy', 'snowy', 'windy'];
  const typeIndex = hash % weatherTypes.length;
  const type = weatherTypes[typeIndex];
  
  const descriptions: Record<WeatherData['type'], string> = {
    sunny: 'Clear skies',
    rainy: 'Light rain',
    cloudy: 'Partly cloudy',
    snowy: 'Snow showers',
    windy: 'Windy conditions',
    hot: 'Hot and dry',
    cold: 'Cold and crisp'
  };
  
  return {
    type,
    temperature: temp,
    description: descriptions[type] || 'Clear',
    humidity: 40 + (hash % 40),
    windSpeed: 5 + (hash % 15)
  };
}
