/**
 * Weather Service Module
 * Provides real weather data using OpenWeatherMap API or falls back to mock data
 */

export interface WeatherData {
  type: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'windy' | 'hot' | 'cold';
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  location?: string;
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
  "Portland",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Toronto",
  "Mumbai",
  "Berlin",
  "Madrid",
  "Rome",
  "Dubai"
];

/**
 * Map OpenWeatherMap condition codes to our weather types
 */
function mapWeatherCondition(conditionCode: number, temp: number): WeatherData['type'] {
  // Thunderstorm (2xx)
  if (conditionCode >= 200 && conditionCode < 300) return 'rainy';
  // Drizzle (3xx)
  if (conditionCode >= 300 && conditionCode < 400) return 'rainy';
  // Rain (5xx)
  if (conditionCode >= 500 && conditionCode < 600) return 'rainy';
  // Snow (6xx)
  if (conditionCode >= 600 && conditionCode < 700) return 'snowy';
  // Atmosphere (7xx) - mist, fog, etc
  if (conditionCode >= 700 && conditionCode < 800) return 'cloudy';
  // Clear (800)
  if (conditionCode === 800) {
    if (temp > 30) return 'hot';
    if (temp < 5) return 'cold';
    return 'sunny';
  }
  // Clouds (80x)
  if (conditionCode > 800) return 'cloudy';

  return 'cloudy';
}

/**
 * Get real weather data from OpenWeatherMap API
 */
export async function getWeatherFromAPI(location: string): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.log('[Weather] No OpenWeatherMap API key found, using mock data');
    return null;
  }

  try {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log(`[Weather] API returned ${response.status} for ${location}`);
      return null;
    }

    const data = await response.json();

    const weatherType = mapWeatherCondition(data.weather[0].id, data.main.temp);

    return {
      type: weatherType,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      location: data.name
    };
  } catch (error) {
    console.error('[Weather] Error fetching from API:', error);
    return null;
  }
}

/**
 * Get mock weather data for a given location (fallback)
 */
export function getMockWeatherForLocation(location: string): WeatherData {
  // Generate semi-realistic mock data based on location name
  const hash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // More realistic temperature range (5-35°C)
  const baseTemp = 15;
  const tempVariation = (hash % 30) - 10;
  const temp = baseTemp + tempVariation;

  const weatherTypes: WeatherData['type'][] = ['sunny', 'rainy', 'cloudy', 'snowy', 'windy'];
  const typeIndex = hash % weatherTypes.length;
  let type = weatherTypes[typeIndex];

  // Adjust type based on temperature
  if (temp > 28) type = 'hot';
  if (temp < 5) type = 'cold';
  if (temp < 0 && type === 'rainy') type = 'snowy';

  const descriptions: Record<WeatherData['type'], string> = {
    sunny: 'Clear skies',
    rainy: 'Light rain expected',
    cloudy: 'Partly cloudy',
    snowy: 'Snow showers',
    windy: 'Windy conditions',
    hot: 'Hot and sunny',
    cold: 'Cold and crisp'
  };

  return {
    type,
    temperature: temp,
    description: descriptions[type] || 'Clear',
    humidity: 40 + (hash % 40),
    windSpeed: 5 + (hash % 20),
    location
  };
}

/**
 * Get weather data - tries API first, falls back to mock
 */
export async function getWeatherForLocation(location: string): Promise<WeatherData> {
  // Try real API first
  const apiWeather = await getWeatherFromAPI(location);

  if (apiWeather) {
    console.log(`[Weather] Got real data for ${location}: ${apiWeather.temperature}°C, ${apiWeather.description}`);
    return apiWeather;
  }

  // Fall back to mock data
  console.log(`[Weather] Using mock data for ${location}`);
  return getMockWeatherForLocation(location);
}
