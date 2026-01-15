import { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Umbrella,
  Shirt,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  suitability: number; // 0-100, how suitable for your wardrobe
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location?: string;
  feelsLike?: number;
  hourlyForecast?: HourlyForecast[];
}

interface EnhancedWeatherWidgetProps {
  weather: WeatherData;
  compact?: boolean;
  onOutfitSuggestion?: () => void;
}

const MOCK_HOURLY: HourlyForecast[] = [
  { time: "Now", temp: 72, condition: "sunny", suitability: 95 },
  { time: "10AM", temp: 74, condition: "sunny", suitability: 90 },
  { time: "12PM", temp: 78, condition: "partly_cloudy", suitability: 85 },
  { time: "2PM", temp: 80, condition: "partly_cloudy", suitability: 75 },
  { time: "4PM", temp: 76, condition: "cloudy", suitability: 80 },
  { time: "6PM", temp: 70, condition: "cloudy", suitability: 88 },
];

export function EnhancedWeatherWidget({
  weather,
  compact = false,
  onOutfitSuggestion,
}: EnhancedWeatherWidgetProps) {
  const [activeHour, setActiveHour] = useState(0);
  const hourlyForecast = weather.hourlyForecast || MOCK_HOURLY;

  const getWeatherIcon = (icon: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-10 w-10",
    };

    const iconStyle = { color: "var(--color-gold-muted)" };

    switch (icon) {
      case "sunny":
        return <Sun className={sizeClasses[size]} style={iconStyle} />;
      case "partly_cloudy":
        return <CloudSun className={sizeClasses[size]} style={iconStyle} />;
      case "cloudy":
        return <Cloud className={sizeClasses[size]} style={{ color: "var(--color-graphite)" }} />;
      case "rainy":
        return <CloudRain className={sizeClasses[size]} style={{ color: "var(--color-info)" }} />;
      case "snowy":
        return <CloudSnow className={sizeClasses[size]} style={{ color: "var(--color-info)" }} />;
      case "windy":
        return <Wind className={sizeClasses[size]} style={{ color: "var(--color-graphite)" }} />;
      default:
        return <Sun className={sizeClasses[size]} style={iconStyle} />;
    }
  };

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 80) return "var(--color-success)";
    if (suitability >= 60) return "var(--color-gold-muted)";
    if (suitability >= 40) return "var(--color-warning)";
    return "var(--color-error)";
  };

  const getOutfitRecommendation = () => {
    const temp = weather.temperature;
    if (temp >= 80) return "Light layers, breathable fabrics";
    if (temp >= 70) return "Perfect for a light blouse or shirt";
    if (temp >= 60) return "Consider a light jacket";
    if (temp >= 50) return "Layer up with a sweater";
    return "Warm coat and layers recommended";
  };

  const getConditionAdvice = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes("rain")) return "Bring an umbrella!";
    if (condition.includes("snow")) return "Waterproof boots recommended";
    if (condition.includes("wind")) return "A scarf would be perfect";
    return null;
  };

  const advice = getConditionAdvice();

  if (compact) {
    return (
      <div
        className="flex items-center justify-between p-3 rounded-xl transition-all"
        style={{
          background: "white",
          border: "1px solid var(--color-pearl)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-cashmere)" }}
          >
            {getWeatherIcon(weather.icon, "md")}
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: "var(--color-charcoal)" }}>
              {Math.round(weather.temperature)}°
            </p>
            <p className="text-xs capitalize" style={{ color: "var(--color-graphite)" }}>
              {weather.condition}
            </p>
          </div>
        </div>

        {/* Mini Suitability Bar */}
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4" style={{ color: "var(--color-taupe)" }} />
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 h-4 rounded-full transition-all"
                style={{
                  background: i <= Math.ceil(hourlyForecast[0].suitability / 20)
                    ? getSuitabilityColor(hourlyForecast[0].suitability)
                    : "var(--color-pearl)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid var(--color-pearl)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Main Weather Display */}
      <div
        className="p-5"
        style={{
          background: "linear-gradient(135deg, var(--color-cashmere) 0%, white 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-xs font-semibold tracking-wider uppercase mb-1"
              style={{ color: "var(--color-graphite)" }}
            >
              Weather Now
            </p>
            <div className="flex items-baseline gap-1">
              <span
                className="text-5xl font-light tracking-tight"
                style={{ color: "var(--color-charcoal)" }}
              >
                {Math.round(weather.temperature)}
              </span>
              <span
                className="text-2xl font-light"
                style={{ color: "var(--color-graphite)" }}
              >
                °F
              </span>
            </div>
            <p className="capitalize mt-1" style={{ color: "var(--color-graphite)" }}>
              {weather.condition}
            </p>
          </div>

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(212, 175, 55, 0.1)",
              border: "1px solid rgba(212, 175, 55, 0.2)",
            }}
          >
            {getWeatherIcon(weather.icon, "lg")}
          </div>
        </div>

        {/* Weather Details */}
        <div className="flex gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" style={{ color: "var(--color-info)" }} />
            <span className="text-sm" style={{ color: "var(--color-graphite)" }}>
              {weather.humidity}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" style={{ color: "var(--color-graphite)" }} />
            <span className="text-sm" style={{ color: "var(--color-graphite)" }}>
              {weather.windSpeed} mph
            </span>
          </div>
          {weather.feelsLike && (
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" style={{ color: "var(--color-warning)" }} />
              <span className="text-sm" style={{ color: "var(--color-graphite)" }}>
                Feels {Math.round(weather.feelsLike)}°
              </span>
            </div>
          )}
        </div>

        {/* Outfit Recommendation */}
        <div
          className="p-3 rounded-xl flex items-center justify-between"
          style={{
            background: "rgba(15, 15, 15, 0.03)",
            border: "1px solid var(--color-pearl)",
          }}
        >
          <div className="flex items-center gap-3">
            <Shirt className="h-5 w-5" style={{ color: "var(--color-obsidian)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-charcoal)" }}>
              {getOutfitRecommendation()}
            </span>
          </div>
          {onOutfitSuggestion && (
            <button
              onClick={onOutfitSuggestion}
              className="text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:bg-champagne"
              style={{ color: "var(--color-gold-muted)" }}
            >
              Suggest <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Special Condition Alert */}
        {advice && (
          <div
            className="mt-3 p-3 rounded-xl flex items-center gap-3"
            style={{
              background: "rgba(74, 125, 180, 0.08)",
              border: "1px solid rgba(74, 125, 180, 0.15)",
            }}
          >
            <Umbrella className="h-5 w-5" style={{ color: "var(--color-info)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-info)" }}>
              {advice}
            </span>
          </div>
        )}
      </div>

      {/* Hourly Forecast with Suitability */}
      <div
        className="p-4"
        style={{ borderTop: "1px solid var(--color-pearl)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: "var(--color-graphite)" }}
          >
            Hourly Outfit Suitability
          </p>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" style={{ color: "var(--color-taupe)" }} />
            <span className="text-xs" style={{ color: "var(--color-taupe)" }}>
              6 hours
            </span>
          </div>
        </div>

        {/* Hourly Bars */}
        <div className="flex gap-2">
          {hourlyForecast.slice(0, 6).map((hour, index) => (
            <button
              key={hour.time}
              onClick={() => setActiveHour(index)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                activeHour === index && "ring-1 ring-[var(--color-obsidian)]"
              )}
              style={{
                background: activeHour === index ? "var(--color-cashmere)" : "transparent",
              }}
            >
              <span className="text-[10px] font-medium" style={{ color: "var(--color-graphite)" }}>
                {hour.time}
              </span>

              {/* Suitability Bar */}
              <div
                className="w-3 rounded-full overflow-hidden"
                style={{
                  height: "40px",
                  background: "var(--color-pearl)",
                }}
              >
                <div
                  className="w-full rounded-full transition-all"
                  style={{
                    height: `${hour.suitability}%`,
                    background: getSuitabilityColor(hour.suitability),
                    marginTop: `${100 - hour.suitability}%`,
                  }}
                />
              </div>

              <span className="text-xs font-semibold" style={{ color: "var(--color-charcoal)" }}>
                {hour.temp}°
              </span>

              <div className="w-5 h-5 flex items-center justify-center">
                {getWeatherIcon(hour.condition, "sm")}
              </div>
            </button>
          ))}
        </div>

        {/* Active Hour Details */}
        <div
          className="mt-3 p-3 rounded-lg flex items-center justify-between"
          style={{
            background: "var(--color-cashmere)",
            border: "1px solid var(--color-pearl)",
          }}
        >
          <div>
            <span className="text-sm font-medium" style={{ color: "var(--color-charcoal)" }}>
              {hourlyForecast[activeHour].time}: {hourlyForecast[activeHour].suitability}% Match
            </span>
            <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
              {hourlyForecast[activeHour].suitability >= 80
                ? "Perfect for your planned outfit"
                : hourlyForecast[activeHour].suitability >= 60
                ? "Consider layering options"
                : "May need outfit adjustment"}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: getSuitabilityColor(hourlyForecast[activeHour].suitability),
              color: "white",
            }}
          >
            <span className="text-sm font-bold">
              {hourlyForecast[activeHour].suitability}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedWeatherWidget;
