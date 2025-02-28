
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
const validLocations = [
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

// This is a mock implementation for demonstration purposes
// In a production environment, we would integrate with a real weather API like OpenWeatherMap
export async function getWeatherForLocation(location: string): Promise<WeatherData | WeatherError> {
  console.log(`[Weather Service] Looking up weather for: ${location}`);
  
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if location is provided and not empty
  if (!location || location.trim() === "") {
    return {
      error: "INVALID_LOCATION",
      message: "Please provide a valid location name."
    };
  }

  // More flexible validation - Check if the location exists in our predefined list
  // with more lenient matching to handle partial matches and alternative spellings
  const normalizedLocation = location.trim().toLowerCase();

  // Find the best matching location
  let isValidLocation = false;
  let bestMatch = "";

  // First try exact matches
  const exactMatch = validLocations.find(
    validLoc => validLoc.toLowerCase() === normalizedLocation
  );

  if (exactMatch) {
    isValidLocation = true;
    bestMatch = exactMatch;
    console.log(`[Weather Service] Found exact match: ${bestMatch}`);
  } else {
    // Check for aliases
    let foundAlias = false;
    for (const [key, aliases] of Object.entries(locationAliases)) {
      if (aliases.includes(normalizedLocation)) {
        isValidLocation = true;
        bestMatch = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize
        foundAlias = true;
        console.log(`[Weather Service] Found alias match: ${normalizedLocation} -> ${bestMatch}`);
        break;
      }
    }

    if (!foundAlias) {
      // Then try partial matches
      const partialMatches = validLocations.filter(
        validLoc => validLoc.toLowerCase().includes(normalizedLocation) || 
                    normalizedLocation.includes(validLoc.toLowerCase())
      );

      if (partialMatches.length > 0) {
        isValidLocation = true;
        // Use the closest matching location (shortest one that fully contains the input or is contained by it)
        bestMatch = partialMatches.sort((a, b) => a.length - b.length)[0];
        console.log(`[Weather Service] Found partial match: ${normalizedLocation} -> ${bestMatch}`);
      }
    }
  }

  // If we still don't have a valid location, try a more lenient approach
  if (!isValidLocation) {
    // Check if any words in the input match any words in our valid locations
    const inputWords = normalizedLocation.split(/\s+/);

    for (const word of inputWords) {
      if (word.length < 3) continue; // Skip very short words

      const wordMatches = validLocations.filter(
        validLoc => validLoc.toLowerCase().includes(word)
      );

      if (wordMatches.length > 0) {
        isValidLocation = true;
        bestMatch = wordMatches[0];
        console.log(`[Weather Service] Found word match: ${word} -> ${bestMatch}`);
        break;
      }
    }
  }

  if (!isValidLocation) {
    console.log(`[Weather Service] No match found for: ${location}`);
    return {
      error: "LOCATION_NOT_FOUND",
      message: `Weather data for "${location}" is not available. Try a different location name or check your spelling.`
    };
  }

  // Use the best match we found for generating weather
  const locationToUse = bestMatch || location;
  console.log(`[Weather Service] Using location: ${locationToUse}`);

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

  const hash = hashCode(locationToUse);
  const today = new Date();
  const seasonalOffset = Math.sin((today.getMonth() + 1) / 12 * Math.PI) * 15; // Seasonal variation

  // Use the hash to deterministically generate weather data
  const weatherTypesList = weatherTypes.map(t => t.value);
  const weatherDescriptions: Record<string, string[]> = {
    sunny: ["Clear blue skies", "Bright sunshine", "Sunny and pleasant"],
    cloudy: ["Partly cloudy", "Overcast", "Gray skies with some breaks"],
    rainy: ["Light rain showers", "Heavy downpour", "Occasional drizzle"],
    snowy: ["Light snowfall", "Heavy snow", "Fluffy snowflakes falling"],
    windy: ["Strong gusts", "Steady breeze", "Gusty conditions"],
    hot: ["Heat wave", "Very hot and dry", "Scorching temperatures"],
    cold: ["Chilly conditions", "Freezing cold", "Frigid temperatures"]
  };

  // Adjust weather type probability based on location
  let weatherTypeIndex = hash % weatherTypesList.length;
  
  // Adjust for specific locations to make it more realistic
  if (locationToUse.includes("London") || locationToUse.includes("Seattle")) {
    // More likely to be rainy or cloudy
    weatherTypeIndex = hash % 10 < 7 ? weatherTypesList.indexOf("rainy") : weatherTypesList.indexOf("cloudy");
  } else if (locationToUse.includes("Dubai") || locationToUse.includes("Las Vegas") || locationToUse.includes("Phoenix")) {
    // More likely to be hot or sunny
    weatherTypeIndex = hash % 10 < 8 ? weatherTypesList.indexOf("hot") : weatherTypesList.indexOf("sunny");
  } else if (locationToUse.includes("Alaska") || locationToUse.includes("Norway") || locationToUse.includes("Finland")) {
    // More likely to be cold or snowy
    weatherTypeIndex = hash % 10 < 7 ? weatherTypesList.indexOf("cold") : weatherTypesList.indexOf("snowy");
  } else if (locationToUse.includes("Chicago") || locationToUse.includes("Wellington")) {
    // More likely to be windy
    weatherTypeIndex = hash % 10 < 6 ? weatherTypesList.indexOf("windy") : weatherTypesList.indexOf("cloudy");
  }
  
  const weatherType = weatherTypesList[weatherTypeIndex >= 0 ? weatherTypeIndex : 0];
  const descriptionIndex = hash % (weatherDescriptions[weatherType]?.length || 1);

  // Defensive check to ensure the weather type exists in descriptions
  // If not, default to a generic description
  const description = weatherDescriptions[weatherType]?.[descriptionIndex] || 
                     "Moderate conditions";

  // Generate temperature based on weather type with seasonal adjustments
  let temperature;
  switch (weatherType) {
    case 'sunny':
      temperature = 25 + (hash % 10) + seasonalOffset;
      break;
    case 'cloudy':
      temperature = 18 + (hash % 8) + seasonalOffset * 0.5;
      break;
    case 'rainy':
      temperature = 15 + (hash % 7) + seasonalOffset * 0.7;
      break;
    case 'snowy':
      temperature = -5 + (hash % 10) + seasonalOffset * 0.3;
      break;
    case 'windy':
      temperature = 12 + (hash % 10) + seasonalOffset * 0.6;
      break;
    case 'hot':
      temperature = 30 + (hash % 8) + seasonalOffset * 0.8;
      break;
    case 'cold':
      temperature = 0 - (hash % 10) + seasonalOffset * 0.4;
      break;
    default:
      temperature = 20 + seasonalOffset * 0.5;
  }

  console.log(`[Weather Service] Generated ${weatherType} weather for ${locationToUse}: ${temperature}°C`);

  return {
    type: weatherType,
    temperature,
    description,
    humidity: 30 + (hash % 60),
    windSpeed: 5 + (hash % 25),
  };
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
