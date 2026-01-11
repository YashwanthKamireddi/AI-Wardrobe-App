import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets } from "lucide-react";

interface WeatherProps {
  weather: {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
}

export default function WeatherDisplay({ weather }: WeatherProps) {
  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return <Sun className="h-10 w-10 text-primary" />;
      case 'cloudy':
      case 'partly_cloudy':
        return <Cloud className="h-10 w-10 text-primary" />;
      case 'rainy':
        return <CloudRain className="h-10 w-10 text-primary" />;
      case 'snowy':
        return <CloudSnow className="h-10 w-10 text-primary" />;
      case 'windy':
        return <Wind className="h-10 w-10 text-primary" />;
      default:
        return <Sun className="h-10 w-10 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {getWeatherIcon(weather.icon)}
        <div>
          <p className="text-4xl font-serif">{weather.temperature}°</p>
          <p className="text-sm text-muted-foreground">{weather.condition}</p>
        </div>
      </div>
      
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}
