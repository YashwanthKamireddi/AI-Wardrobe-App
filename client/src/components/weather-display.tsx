import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  CloudRainIcon, 
  CloudIcon, 
  CloudSnowIcon, 
  WindIcon, 
  SunIcon, 
  SnowflakeIcon,
  ThermometerIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherRecommendation {
  condition: string;
  recommendation: string;
  clothingTypes: string[];
}

interface WeatherDisplayProps {
  weather: WeatherData;
  recommendations?: WeatherRecommendation;
}

/**
 * WeatherDisplay Component
 * 
 * Displays current weather information and provides clothing recommendations based on conditions.
 * Features animated transitions and responsive design for both mobile and desktop views.
 * 
 * @param {WeatherData} weather - Current weather information including location, temperature, condition
 * @param {WeatherRecommendation} recommendations - Optional clothing recommendations for current weather
 */
export default function WeatherDisplay({ weather, recommendations }: WeatherDisplayProps) {

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return (
          <div className="relative">
            <SunIcon className="h-10 w-10 text-accent" />
            <div className="absolute inset-0 blur-sm opacity-40">
              <SunIcon className="h-10 w-10 text-accent" />
            </div>
          </div>
        );
      case 'cloudy':
        return (
          <div className="relative">
            <CloudIcon className="h-10 w-10 text-primary/80" />
            <div className="absolute inset-0 blur-sm opacity-30">
              <CloudIcon className="h-10 w-10 text-primary/80" />
            </div>
          </div>
        );
      case 'rainy':
        return (
          <div className="relative">
            <CloudRainIcon className="h-10 w-10 text-primary/90" />
            <div className="absolute inset-0 blur-sm opacity-30">
              <CloudRainIcon className="h-10 w-10 text-primary/90" />
            </div>
          </div>
        );
      case 'snowy':
        return (
          <div className="relative">
            <CloudSnowIcon className="h-10 w-10 text-accent/60" />
            <div className="absolute inset-0 blur-sm opacity-30">
              <CloudSnowIcon className="h-10 w-10 text-accent/60" />
            </div>
          </div>
        );
      case 'windy':
        return (
          <div className="relative">
            <WindIcon className="h-10 w-10 text-primary/70" />
            <div className="absolute inset-0 blur-sm opacity-30">
              <WindIcon className="h-10 w-10 text-primary/70" />
            </div>
          </div>
        );
      default:
        return (
          <div className="relative">
            <SunIcon className="h-10 w-10 text-accent" />
            <div className="absolute inset-0 blur-sm opacity-40">
              <SunIcon className="h-10 w-10 text-accent" />
            </div>
          </div>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <motion.div 
      className="weather-display-luxury gold-corner animate-fade-scale"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Weather header with location and main info */}
      <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/10">
        <motion.div 
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <h3 className="text-xl font-fashion-heading tracking-tight flex items-center">
            <span className="mr-2">{weather.location}</span>
          </h3>
          <div className="designer-tag animate-shimmer-gold">
            {weather.condition}
          </div>
        </motion.div>
      </div>
      
      {/* Weather content area */}
      <div className="p-5 space-y-5">
        {/* Main weather display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div 
              variants={iconVariants}
              className="weather-icon-luxury"
            >
              {getWeatherIcon(weather.icon)}
            </motion.div>
            <div className="ml-4">
              <motion.p 
                variants={itemVariants} 
                className="weather-temp-luxury"
              >
                {weather.temperature}°<span className="text-xl">C</span>
              </motion.p>
              <motion.p 
                variants={itemVariants} 
                className="weather-condition-luxury"
              >
                {weather.condition}
              </motion.p>
            </div>
          </div>
          
          <motion.div 
            variants={containerVariants} 
            className="flex flex-col space-y-2"
          >
            <motion.div 
              variants={itemVariants} 
              className="flex items-center border-b border-accent/10 pb-1 pl-2"
            >
              <ThermometerIcon className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-fashion-body">Humidity: {weather.humidity}%</span>
            </motion.div>
            <motion.div 
              variants={itemVariants} 
              className="flex items-center border-b border-accent/10 pb-1 pl-2"
            >
              <WindIcon className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-fashion-body">Wind: {weather.windSpeed} km/h</span>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Recommendations section */}
        {recommendations && (
          <motion.div 
            variants={containerVariants}
            className="mt-6 haute-couture-section rounded-sm"
          >
            <motion.div 
              className="flex items-center mb-4"
              variants={itemVariants}
            >
              <span className="p-1.5 rounded-sm bg-accent/10 mr-3 border border-accent/20">
                <ThermometerIcon className="h-4 w-4 text-accent" />
              </span>
              <h4 className="text-sm font-fashion-heading uppercase tracking-wider gold-accent">Style Guide</h4>
            </motion.div>
            
            <motion.p 
              variants={itemVariants} 
              className="text-sm font-fashion-body text-muted-foreground mb-5 italic border-l-2 border-accent/30 pl-3"
            >
              {recommendations.recommendation}
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-2"
              variants={containerVariants}
            >
              {recommendations.clothingTypes.map((type, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Badge 
                    variant="outline" 
                    className="border-accent/30 bg-background/60 hover:bg-accent/10 text-foreground px-3 py-1 uppercase tracking-wider text-[10px] font-fashion-body"
                  >
                    {type}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}