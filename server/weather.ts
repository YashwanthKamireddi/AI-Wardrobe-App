
import { weatherTypes } from "@shared/schema";

interface WeatherData {
  type: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherError {
  error: string;
  message: string;
}

// Expanded list of valid locations for the mock weather API
// In a real app, this would be replaced with a proper geocoding API
export const validLocations = [
  // Major US Cities
  "New York", "New York City", "NYC", "Los Angeles", "LA", "Chicago", "Houston", 
  "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", 
  "Austin", "Jacksonville", "San Francisco", "Seattle", "Denver", "Boston", 
  "Washington DC", "Nashville", "Baltimore", "Atlanta", "Miami", "Portland",
  "Las Vegas", "Milwaukee", "Albuquerque", "Kansas City", "Omaha", "Tulsa",
  "Cleveland", "Pittsburgh", "Sacramento", "Orlando", "Buffalo", "Memphis",
  "Minneapolis", "St. Louis", "Cincinnati", "Tampa", "Raleigh", "Indianapolis",
  "Charlotte", "Louisville", "Detroit", "Columbus", "Fort Worth", "El Paso",

  // Major International Cities
  "London", "Paris", "Tokyo", "Sydney", "Berlin", "Rome", "Toronto", "Dubai", "Singapore",
  "Beijing", "Mumbai", "Delhi", "Hong Kong", "Moscow", "Vancouver", "Barcelona",
  "Amsterdam", "Seoul", "Bangkok", "Vienna", "Madrid", "Brussels", "Dublin",
  "Budapest", "Prague", "Lisbon", "Athens", "Oslo", "Copenhagen", "Stockholm",
  "Helsinki", "Warsaw", "Istanbul", "Cairo", "Cape Town", "Mexico City", "Rio de Janeiro",
  "Buenos Aires", "Montreal", "Melbourne", "Auckland", "Wellington", "Zurich", "Geneva",

  // Smaller Cities and Towns
  "Boulder", "Ann Arbor", "Madison", "Eugene", "Asheville", "Santa Fe", "Burlington",
  "Savannah", "Charleston", "Oxford", "Cambridge", "Bath", "York", "Manchester",
  "Edinburgh", "Glasgow", "Liverpool", "Newcastle", "Cardiff", "Florence",
  "Naples", "Venice", "Lyon", "Marseille", "Nice", "Frankfurt", "Munich", "Hamburg",

  // Countries
  "USA", "United States", "UK", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Italy", "Spain", "Japan", "China", "India", "Brazil", "Russia",
  "South Korea", "Mexico", "South Africa", "Egypt", "Thailand", "Singapore",
  "Malaysia", "Indonesia", "Vietnam", "Philippines", "New Zealand", "Ireland",
  "Sweden", "Norway", "Denmark", "Finland", "Poland", "Ukraine", "Turkey", "Greece",
  "Netherlands", "Belgium", "Switzerland", "Austria", "Portugal", "Argentina",
  "Chile", "Peru", "Colombia", "Venezuela", "UAE", "Saudi Arabia", "Qatar",
  
  // Add state/province names that can help with matching
  "California", "New York State", "Texas", "Florida", "Illinois", "Pennsylvania",
  "Ohio", "Georgia", "Michigan", "North Carolina", "New Jersey", "Virginia",
  "Washington", "Massachusetts", "Indiana", "Arizona", "Tennessee", "Missouri",
  "Wisconsin", "Colorado", "Minnesota", "South Carolina", "Alabama", "Louisiana",
  "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Iowa", "Mississippi", "Arkansas",
  "Utah", "Nevada", "New Mexico", "West Virginia", "Nebraska", "Idaho", "Hawaii",
  "Maine", "New Hampshire", "Rhode Island", "Montana", "Delaware", "Alaska", "Vermont",
  "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan",
  "Nova Scotia", "New Brunswick", "Newfoundland", "Prince Edward Island"
];

// Common location abbreviations and aliases
const locationAliases: Record<string, string[]> = {
  "new york": ["nyc", "ny", "big apple", "manhattan"],
  "los angeles": ["la", "lax", "hollywood"],
  "san francisco": ["sf", "san fran", "bay area"],
  "chicago": ["chi-town", "windy city"],
  "dallas": ["dfw", "big d"],
  "washington dc": ["dc", "washington", "district of columbia"],
  "philadelphia": ["philly"],
  "london": ["greater london"],
  "united kingdom": ["uk", "great britain", "britain"],
  "united states": ["usa", "us", "america", "states"],
};

// Real weather implementation using OpenWeatherMap
export async function getWeatherForLocation(location: string): Promise<WeatherData | WeatherError> {
  console.log(`[Weather Service] Looking up weather for: ${location}`);
  
  // Check if location is provided and not empty
  if (!location || location.trim() === "") {
    return {
      error: "INVALID_LOCATION",
      message: "Please provide a valid location name."
    };
  }

  try {
    // Using OpenWeatherMap free API - no API key required for this endpoint
    const apiUrl = `https://wttr.in/${encodeURIComponent(location.trim())}?format=j1`;
    
    console.log(`[Weather Service] Fetching from: ${apiUrl}`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.log(`[Weather Service] API error: ${response.status} ${response.statusText}`);
      return {
        error: "API_ERROR",
        message: `Weather service returned an error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    console.log(`[Weather Service] Received data for: ${location}`);
    
    if (!data || !data.current_condition || !data.current_condition[0]) {
      return {
        error: "INVALID_RESPONSE",
        message: "Received invalid data from weather service."
      };
    }
    
    const current = data.current_condition[0];
    const weatherDescription = current.weatherDesc[0].value;
    
    // Map the wttr.in weather description to our weather types
    let weatherType = 'cloudy'; // Default
    if (/rain|shower|drizzle|precipitation/i.test(weatherDescription)) {
      weatherType = 'rainy';
    } else if (/sun|clear|fair/i.test(weatherDescription)) {
      weatherType = 'sunny';
    } else if (/snow|sleet|blizzard|ice/i.test(weatherDescription)) {
      weatherType = 'snowy';
    } else if (/wind|gale|storm/i.test(weatherDescription)) {
      weatherType = 'windy';
    } else if (parseInt(current.temp_C) > 28) {
      weatherType = 'hot';
    } else if (parseInt(current.temp_C) < 5) {
      weatherType = 'cold';
    }
    
    const result = {
      type: weatherType,
      temperature: parseFloat(current.temp_C),
      description: weatherDescription,
      humidity: parseInt(current.humidity),
      windSpeed: parseFloat(current.windspeedKmph),
    };
    
    console.log(`[Weather Service] Processed real weather for ${location}: ${result.temperature}°C (${weatherType})`);
    return result;
    
  } catch (error) {
    console.error('[Weather Service] Error fetching weather:', error);
    return {
      error: "SERVICE_ERROR",
      message: "Failed to fetch weather data. Please try again later."
    };
  }
}

// Helper function to determine if an item is appropriate for the weather
export function isAppropriateForWeather(category: string, type: string, weather: string): boolean {
  switch (weather) {
    case 'sunny':
      return !['winter coat', 'heavy jacket', 'rain coat', 'thick sweater'].includes(type);
    case 'rainy':
      return ['rain coat', 'umbrella', 'waterproof', 'boots', 'jacket'].includes(type);
    case 'snowy':
      return ['winter coat', 'boots', 'scarf', 'gloves', 'thick sweater'].includes(type);
    case 'windy':
      return ['jacket', 'coat', 'scarf', 'hat'].includes(type);
    case 'hot':
      return ['shorts', 't-shirt', 'tank top', 'sundress', 'sandals', 'hat'].includes(type);
    case 'cold':
      return ['winter coat', 'thick sweater', 'thermal', 'scarf', 'gloves', 'boots'].includes(type);
    default:
      return true;
  }
}
