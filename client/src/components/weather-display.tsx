
import { Badge } from "@/components/ui/badge";
import { 
  CloudSun, 
  CloudRain, 
  Cloud, 
  CloudSnow, 
  Wind, 
  Sun, 
  Snowflake,
  Thermometer
} from "lucide-react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherRecommendations {
  condition: string;
  recommendation: string;
  clothingTypes: string[];
}

export function WeatherDisplay({ 
  weather, 
  temperatureUnit = "celsius" 
}: { 
  weather: WeatherData, 
  temperatureUnit?: "celsius" | "fahrenheit" 
}) {
  if (!weather) return null;

  // Convert temperature if needed
  const displayTemp = temperatureUnit === "fahrenheit" 
    ? Math.round(weather.temperature * 9/5 + 32) 
    : Math.round(weather.temperature);
  
  // Get appropriate icon
  const WeatherIcon = getWeatherIcon(weather.icon);
  
  // Get color scheme based on weather type
  const colorScheme = getWeatherColorScheme(weather.icon);
  
  // Get recommendations
  const recommendations = getWeatherRecommendations(weather.icon);

  return (
    <div className={`rounded-lg p-4 ${colorScheme.bg} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-xl font-bold ${colorScheme.text}`}>{weather.location}</h3>
          <p className={`text-sm ${colorScheme.subtext}`}>{weather.condition}</p>
        </div>
        <div className={`p-2 rounded-full ${colorScheme.iconBg}`}>
          <WeatherIcon className={`h-10 w-10 ${colorScheme.icon}`} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <Thermometer className={`mr-2 h-5 w-5 ${colorScheme.subtext}`} />
        <span className={`text-2xl font-bold ${colorScheme.text}`}>
          {displayTemp}°{temperatureUnit === "celsius" ? "C" : "F"}
        </span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg ${colorScheme.statBg}`}>
          <p className={`text-xs ${colorScheme.subtext}`}>Humidity</p>
          <p className={`text-sm font-bold ${colorScheme.text}`}>{weather.humidity}%</p>
        </div>
        <div className={`p-2 rounded-lg ${colorScheme.statBg}`}>
          <p className={`text-xs ${colorScheme.subtext}`}>Wind</p>
          <p className={`text-sm font-bold ${colorScheme.text}`}>{weather.windSpeed} km/h</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className={`text-sm font-medium ${colorScheme.text}`}>Recommended for today:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recommendations.clothingTypes.map((type, index) => (
            <Badge key={index} variant="outline" className={`${colorScheme.badgeBg} ${colorScheme.badgeText}`}>
              {type}
            </Badge>
          ))}
        </div>
        <p className={`mt-2 text-sm ${colorScheme.subtext}`}>{recommendations.recommendation}</p>
      </div>
    </div>
  );
}

function getWeatherIcon(icon: string) {
  switch (icon) {
    case 'sunny':
      return Sun;
    case 'cloudy':
      return Cloud;
    case 'rainy':
      return CloudRain;
    case 'snowy':
      return CloudSnow;
    case 'windy':
      return Wind;
    case 'hot':
      return Sun;
    case 'cold':
      return Snowflake;
    default:
      return CloudSun;
  }
}

function getWeatherColorScheme(icon: string) {
  switch (icon) {
    case 'sunny':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        subtext: 'text-amber-700',
        icon: 'text-amber-500',
        iconBg: 'bg-amber-100',
        statBg: 'bg-amber-100',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800'
      };
    case 'cloudy':
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-900',
        subtext: 'text-slate-600',
        icon: 'text-slate-400',
        iconBg: 'bg-slate-100',
        statBg: 'bg-slate-100',
        badgeBg: 'bg-slate-200',
        badgeText: 'text-slate-800'
      };
    case 'rainy':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        subtext: 'text-blue-700',
        icon: 'text-blue-500',
        iconBg: 'bg-blue-100',
        statBg: 'bg-blue-100',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800'
      };
    case 'snowy':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-900',
        subtext: 'text-indigo-700',
        icon: 'text-indigo-400',
        iconBg: 'bg-indigo-100',
        statBg: 'bg-indigo-100',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-800'
      };
    case 'windy':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-900',
        subtext: 'text-teal-700',
        icon: 'text-teal-500',
        iconBg: 'bg-teal-100',
        statBg: 'bg-teal-100',
        badgeBg: 'bg-teal-100',
        badgeText: 'text-teal-800'
      };
    case 'hot':
      return {
        bg: 'bg-red-50',
        text: 'text-red-900',
        subtext: 'text-red-700',
        icon: 'text-red-500',
        iconBg: 'bg-red-100',
        statBg: 'bg-red-100',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800'
      };
    case 'cold':
      return {
        bg: 'bg-cyan-50',
        text: 'text-cyan-900',
        subtext: 'text-cyan-700',
        icon: 'text-cyan-500',
        iconBg: 'bg-cyan-100',
        statBg: 'bg-cyan-100',
        badgeBg: 'bg-cyan-100',
        badgeText: 'text-cyan-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-900',
        subtext: 'text-gray-600',
        icon: 'text-gray-500',
        iconBg: 'bg-gray-100',
        statBg: 'bg-gray-100',
        badgeBg: 'bg-gray-200',
        badgeText: 'text-gray-800'
      };
  }
}

function getWeatherRecommendations(weatherType: string): WeatherRecommendations {
  switch (weatherType) {
    case 'sunny':
      return {
        condition: 'Sunny',
        recommendation: 'Perfect day for light clothing and sun protection!',
        clothingTypes: ['Sunglasses', 'Hat', 'T-shirt', 'Shorts', 'Sunscreen']
      };
    case 'cloudy':
      return {
        condition: 'Cloudy',
        recommendation: 'It might get chilly, bring a light jacket just in case.',
        clothingTypes: ['Light jacket', 'Long sleeve', 'Jeans', 'Sneakers']
      };
    case 'rainy':
      return {
        condition: 'Rainy',
        recommendation: 'Don\'t forget your umbrella and waterproof shoes!',
        clothingTypes: ['Rain coat', 'Umbrella', 'Waterproof shoes', 'Hoodie']
      };
    case 'snowy':
      return {
        condition: 'Snowy',
        recommendation: 'Bundle up! Layers are essential today.',
        clothingTypes: ['Winter coat', 'Gloves', 'Scarf', 'Boots', 'Hat']
      };
    case 'windy':
      return {
        condition: 'Windy',
        recommendation: 'Wear something that won\'t fly away! Secure hairstyles recommended.',
        clothingTypes: ['Windbreaker', 'Jeans', 'Sweater', 'Boots']
      };
    case 'hot':
      return {
        condition: 'Hot',
        recommendation: 'Stay cool and hydrated. Light and breathable fabrics are best.',
        clothingTypes: ['Tank top', 'Shorts', 'Sandals', 'Sunscreen', 'Hat']
      };
    case 'cold':
      return {
        condition: 'Cold',
        recommendation: 'Layer up! Don\'t forget gloves and a hat to stay warm.',
        clothingTypes: ['Thermal', 'Sweater', 'Winter coat', 'Beanie', 'Gloves']
      };
    default:
      return {
        condition: 'Mild',
        recommendation: 'A normal day, dress comfortably for the temperature.',
        clothingTypes: ['Casual wear', 'Light layers']
      };
  }
}
