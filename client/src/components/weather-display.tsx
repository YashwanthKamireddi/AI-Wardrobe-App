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
import { useIsMobile } from "@/hooks/use-mobile";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherDisplayProps {
  weather: WeatherData;
  recommendations?: string[];
}

export default function WeatherDisplay({ weather, recommendations }: WeatherDisplayProps) {
  console.log("Rendering WeatherDisplay with:", weather);

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return <Sun className="h-12 w-12 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-12 w-12 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-12 w-12 text-blue-400" />;
      case 'snowy':
        return <CloudSnow className="h-12 w-12 text-blue-200" />;
      case 'windy':
        return <Wind className="h-12 w-12 text-teal-500" />;
      default:
        return <CloudSun className="h-12 w-12 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center">
          {getWeatherIcon(weather.icon)}
          <div className="ml-3">
            <h3 className="text-xl font-bold">{weather.location}</h3>
            <p className="text-2xl font-semibold">{weather.temperature}°C</p>
            <p className="text-sm text-muted-foreground">{weather.condition}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm">Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-sm">Wind: {weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((recommendation, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary">
                {recommendation}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}