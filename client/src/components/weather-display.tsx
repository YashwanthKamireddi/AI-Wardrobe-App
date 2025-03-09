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
      className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50/40 dark:from-gray-900 dark:to-gray-800/40 backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center">
          <motion.div variants={iconVariants}>
            {getWeatherIcon(weather.icon)}
          </motion.div>
          <div className="ml-3">
            <motion.h3 variants={itemVariants} className="text-xl font-bold">{weather.location}</motion.h3>
            <motion.p variants={itemVariants} className="text-2xl font-semibold">{weather.temperature}°C</motion.p>
            <motion.p variants={itemVariants} className="text-sm text-muted-foreground">{weather.condition}</motion.p>
          </div>
        </div>
        <motion.div variants={containerVariants} className="mt-4 sm:mt-0 grid grid-cols-2 gap-3">
          <motion.div variants={itemVariants} className="flex items-center">
            <Thermometer className="h-4 w-4 mr-1 text-orange-500" />
            <span className="text-sm">Humidity: {weather.humidity}%</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center">
            <Wind className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-sm">Wind: {weather.windSpeed} km/h</span>
          </motion.div>
        </motion.div>
      </div>

      {recommendations && (
        <motion.div 
          variants={containerVariants}
          className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10"
        >
          <motion.h4 variants={itemVariants} className="text-sm font-medium mb-2">Outfit Recommendations</motion.h4>
          <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-3">{recommendations.recommendation}</motion.p>
          <div className="flex flex-wrap gap-2">
            {recommendations.clothingTypes.map((type, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary">
                  {type}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}