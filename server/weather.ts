import { WeatherType } from "@shared/schema";

interface WeatherData {
  type: WeatherType;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

// This is a mock implementation for demonstration purposes
// In a production environment, we would integrate with a real weather API like OpenWeatherMap
export async function getWeatherForLocation(location: string): Promise<WeatherData> {
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // A simple hash function to generate consistent weather based on location
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const hash = hashCode(location);
  
  // Use the hash to deterministically generate weather data
  const weatherTypes: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
  const weatherDescriptions = {
    sunny: ["Clear skies", "Bright sunshine", "Sunny and pleasant"],
    cloudy: ["Partly cloudy", "Overcast", "Gray skies"],
    rainy: ["Light rain", "Heavy showers", "Drizzle"],
    snowy: ["Light snowfall", "Heavy snow", "Flurries"],
    windy: ["Strong winds", "Light breeze", "Gusty conditions"]
  };
  
  const weatherTypeIndex = hash % weatherTypes.length;
  const weatherType = weatherTypes[weatherTypeIndex];
  const descriptionIndex = hash % 3;
  const description = weatherDescriptions[weatherType][descriptionIndex];
  
  // Generate temperature based on weather type
  let temperature;
  switch (weatherType) {
    case 'sunny':
      temperature = 25 + (hash % 10);
      break;
    case 'cloudy':
      temperature = 18 + (hash % 8);
      break;
    case 'rainy':
      temperature = 15 + (hash % 7);
      break;
    case 'snowy':
      temperature = -5 + (hash % 10);
      break;
    case 'windy':
      temperature = 12 + (hash % 10);
      break;
    default:
      temperature = 20;
  }
  
  return {
    type: weatherType,
    temperature,
    description,
    humidity: 30 + (hash % 60),
    windSpeed: 5 + (hash % 25),
  };
}

// Helper function to determine if an item is appropriate for the weather
export function isAppropriateForWeather(category: string, type: string, weather: WeatherType): boolean {
  switch (weather) {
    case 'sunny':
      return !['winter coat', 'heavy jacket', 'rain coat', 'thick sweater'].includes(type);
    case 'rainy':
      return ['rain coat', 'umbrella', 'waterproof', 'boots', 'jacket'].includes(type);
    case 'snowy':
      return ['winter coat', 'boots', 'scarf', 'gloves', 'thick sweater'].includes(type);
    case 'windy':
      return ['jacket', 'coat', 'scarf', 'hat'].includes(type);
    default:
      return true;
  }
}
