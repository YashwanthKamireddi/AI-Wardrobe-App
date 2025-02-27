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

interface WeatherDisplayProps {
  weather: WeatherData;
  recommendations: WeatherRecommendations;
}

export default function WeatherDisplay({ weather, recommendations }: WeatherDisplayProps) {
  console.log("Rendering WeatherDisplay with:", weather);

  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    const iconSize = "h-12 w-12";

    if (condition.includes("rain")) {
      return <CloudRain className={`${iconSize} text-blue-500`} />;
    } else if (condition.includes("snow")) {
      return <CloudSnow className={`${iconSize} text-slate-300`} />;
    } else if (condition.includes("cloud")) {
      return <Cloud className={`${iconSize} text-slate-400`} />;
    } else if (condition.includes("wind")) {
      return <Wind className={`${iconSize} text-slate-500`} />;
    } else if (condition.includes("sun") || condition.includes("clear")) {
      return <Sun className={`${iconSize} text-amber-400`} />;
    } else if (condition.includes("part")) {
      return <CloudSun className={`${iconSize} text-slate-400`} />;
    } else {
      return <CloudSun className={`${iconSize} text-slate-400`} />;
    }
  };

  // Determine temperature color based on value
  const getTempColor = () => {
    if (weather.temperature < 5) return "text-blue-500";
    if (weather.temperature < 15) return "text-teal-500";
    if (weather.temperature < 25) return "text-green-500";
    if (weather.temperature < 30) return "text-amber-500";
    return "text-red-500";
  };

  // Get temperature descriptor
  const getTempDescription = () => {
    if (weather.temperature < 5) return "Very Cold";
    if (weather.temperature < 15) return "Cool";
    if (weather.temperature < 25) return "Mild";
    if (weather.temperature < 30) return "Warm";
    return "Hot";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{weather.location}</h3>
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className={`text-2xl font-bold ${getTempColor()}`}>
              {weather.temperature}°C
            </span>
            <Badge variant="outline" className="ml-2">
              {getTempDescription()}
            </Badge>
          </div>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <Cloud className="h-3 w-3 mr-1" />
            <span className="mr-3">Humidity: {weather.humidity}%</span>
            <Wind className="h-3 w-3 mr-1" />
            <span>Wind: {weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="text-center">
          {getWeatherIcon()}
          <p className="text-sm font-medium">{weather.condition}</p>
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-1">Outfit Recommendation</h4>
        <p className="text-sm text-muted-foreground">{recommendations.recommendation}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {recommendations.clothingTypes.map((type, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {type === "outerwear" && <Snowflake className="h-3 w-3 mr-1" />}
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}