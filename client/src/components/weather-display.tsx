import { Badge } from "@/components/ui/badge";
import { 
  ThermometerIcon,
  WindIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

// Custom weather icons
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <g className="opacity-90">
      {[...Array(8)].map((_, i) => (
        <line 
          key={i} 
          x1="12" 
          y1="12" 
          x2="12" 
          y2={i % 2 === 0 ? "1" : "3"} 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round"
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
    </g>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="0.5 1.5" className="opacity-50" />
  </svg>
);

const CloudIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path 
      d="M7 14C4.23858 14 2 11.7614 2 9C2 6.23858 4.23858 4 7 4C9.09772 4 10.9037 5.4022 11.6282 7.32167C12.2234 7.11323 12.8627 7 13.5269 7C16.5775 7 19.0561 9.47842 19.0561 12.5291C19.0561 15.5797 16.5775 18.0581 13.5269 18.0581H7.5"
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
      strokeLinecap="round"
    />
    <path 
      d="M5 12C5 12 6 12.5 7.5 12.5C9 12.5 10 11.5 10 11.5"
      stroke="currentColor" 
      strokeWidth="0.7" 
      strokeLinecap="round"
      className="opacity-70"
    />
  </svg>
);

const CloudRainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path 
      d="M7 14C4.23858 14 2 11.7614 2 9C2 6.23858 4.23858 4 7 4C9.09772 4 10.9037 5.4022 11.6282 7.32167C12.2234 7.11323 12.8627 7 13.5269 7C16.5775 7 19.0561 9.47842 19.0561 12.5291C19.0561 15.5797 16.5775 18.0581 13.5269 18.0581H7.5"
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
      strokeLinecap="round"
    />
    <line x1="7" y1="16" x2="7" y2="19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="10.5" y1="16" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="14" y1="16" x2="14" y2="19" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const CloudSnowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path 
      d="M7 14C4.23858 14 2 11.7614 2 9C2 6.23858 4.23858 4 7 4C9.09772 4 10.9037 5.4022 11.6282 7.32167C12.2234 7.11323 12.8627 7 13.5269 7C16.5775 7 19.0561 9.47842 19.0561 12.5291C19.0561 15.5797 16.5775 18.0581 13.5269 18.0581H7.5"
      stroke="currentColor" 
      strokeWidth="1.5" 
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="8" cy="17" r="0.8" fill="currentColor" />
    <circle cx="12" cy="18" r="0.8" fill="currentColor" />
    <circle cx="16" cy="17" r="0.8" fill="currentColor" />
  </svg>
);

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
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 text-amber-600 dark:text-amber-400"
            >
              <SunIcon />
            </motion.div>
          </div>
        );
      case 'cloudy':
        return (
          <div className="relative">
            <motion.div 
              animate={{ x: [0, 3, 0], y: [0, -1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-12 w-12 text-amber-600 dark:text-amber-400"
            >
              <CloudIcon />
            </motion.div>
          </div>
        );
      case 'rainy':
        return (
          <div className="relative">
            <motion.div
              animate={{ y: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-12 w-12 text-amber-600 dark:text-amber-400"
            >
              <CloudRainIcon />
            </motion.div>
          </div>
        );
      case 'snowy':
        return (
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-12 w-12 text-amber-600 dark:text-amber-400"
            >
              <CloudSnowIcon />
            </motion.div>
          </div>
        );
      case 'windy':
        return (
          <div className="relative">
            <div className="h-12 w-12 text-amber-600 dark:text-amber-400">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <motion.path
                  d="M5 8h8.5c1.93 0 3.5 1.57 3.5 3.5S15.43 15 13.5 15H6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ 
                    d: [
                      "M5 8h8.5c1.93 0 3.5 1.57 3.5 3.5S15.43 15 13.5 15H6",
                      "M5 8h8.5c1.93 0 3.5 1.57 3.5 3.5S15.43 15 13.5 15H6",
                      "M3 8h10.5c1.93 0 3.5 1.57 3.5 3.5S15.43 15 13.5 15H4",
                      "M5 8h8.5c1.93 0 3.5 1.57 3.5 3.5S15.43 15 13.5 15H6"
                    ] 
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                  d="M8 12h9.5c1.38 0 2.5 1.12 2.5 2.5S18.88 17 17.5 17H9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ 
                    d: [
                      "M8 12h9.5c1.38 0 2.5 1.12 2.5 2.5S18.88 17 17.5 17H9",
                      "M6 12h11.5c1.38 0 2.5 1.12 2.5 2.5S18.88 17 17.5 17H7",
                      "M8 12h9.5c1.38 0 2.5 1.12 2.5 2.5S18.88 17 17.5 17H9",
                      "M8 12h9.5c1.38 0 2.5 1.12 2.5 2.5S18.88 17 17.5 17H9"
                    ] 
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.path
                  d="M11 7.5h5.5c1.38 0 2.5-1.12 2.5-2.5S17.88 2.5 16.5 2.5H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ 
                    d: [
                      "M11 7.5h5.5c1.38 0 2.5-1.12 2.5-2.5S17.88 2.5 16.5 2.5H11",
                      "M9 7.5h7.5c1.38 0 2.5-1.12 2.5-2.5S17.88 2.5 16.5 2.5H9",
                      "M11 7.5h5.5c1.38 0 2.5-1.12 2.5-2.5S17.88 2.5 16.5 2.5H11",
                      "M11 7.5h5.5c1.38 0 2.5-1.12 2.5-2.5S17.88 2.5 16.5 2.5H11"
                    ] 
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-12 w-12 text-amber-600 dark:text-amber-400"
            >
              <SunIcon />
            </motion.div>
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
      className="weather-display-luxury animate-fade-scale border border-amber-200/50 dark:border-amber-700/40 rounded-md overflow-hidden shadow-md dark:shadow-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.005, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {/* Weather header with location and main info */}
      <div className="p-5 bg-gradient-to-r from-amber-50/80 dark:from-amber-900/20 to-transparent border-b border-amber-200/30 dark:border-amber-700/30 relative">
        <motion.div 
          className="flex items-center justify-between relative"
          variants={itemVariants}
        >
          <h3 className="text-xl font-luxury-heading tracking-tight flex items-center">
            <span className="bg-gradient-to-r from-amber-700 dark:from-amber-400 to-amber-500 dark:to-amber-300 bg-clip-text text-transparent">{weather.location}</span>
            <motion.div 
              variants={iconVariants}
              className="weather-icon-luxury ml-2 scale-75"
            >
              {getWeatherIcon(weather.icon)}
            </motion.div>
          </h3>
          <div className="designer-tag">
            {weather.condition}
          </div>
        </motion.div>
        
        {/* Subtle divider */}
        <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 dark:via-amber-400/20 to-transparent"></div>
      </div>
      
      {/* Weather content area */}
      <div className="p-5 space-y-5 relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        {/* Main weather display */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <motion.p 
              variants={itemVariants} 
              className="weather-temp-luxury relative text-4xl font-luxury-heading text-amber-800 dark:text-amber-300"
            >
              {weather.temperature}°<span className="text-2xl">C</span>
            </motion.p>
          </div>
          
          <motion.div 
            variants={containerVariants} 
            className="flex flex-col space-y-2 bg-amber-50/30 dark:bg-amber-900/20 p-3 rounded-sm border-l border-amber-200/50 dark:border-amber-700/40"
          >
            <motion.div 
              variants={itemVariants} 
              className="flex items-center pb-1"
            >
              <ThermometerIcon className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-luxury-body tracking-wide">Humidity: {weather.humidity}%</span>
            </motion.div>
            <motion.div 
              variants={itemVariants} 
              className="flex items-center"
            >
              <WindIcon className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-luxury-body tracking-wide">Wind: {weather.windSpeed} km/h</span>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Enhanced Recommendations section */}
        {recommendations && (
          <motion.div 
            variants={containerVariants}
            className="mt-6 rounded-sm pt-4 border-t border-amber-200/30 dark:border-amber-700/30"
          >
            <motion.div 
              className="flex items-center mb-4"
              variants={itemVariants}
            >
              <span className="text-sm font-luxury-heading uppercase tracking-wider text-amber-800 dark:text-amber-300 mr-2">●</span>
              <motion.h4 
                className="text-sm font-luxury-heading uppercase tracking-wider text-amber-800 dark:text-amber-300"
              >
                Style Recommendations
              </motion.h4>
            </motion.div>
            
            <motion.div
              className="mb-5 relative"
              variants={itemVariants}
            >
              <motion.p 
                className="text-sm font-luxury-body italic text-amber-700 dark:text-amber-300/80 pl-4 pr-2 py-1"
                whileHover={{ x: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {recommendations.recommendation}
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-2"
              variants={containerVariants}
            >
              {recommendations.clothingTypes.map((type, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 15
                  }}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="border-amber-400/40 dark:border-amber-600/50 bg-amber-50/80 dark:bg-amber-900/30 hover:bg-amber-100/90 dark:hover:bg-amber-800/40 text-amber-800 dark:text-amber-200 px-3 py-1 uppercase tracking-wider text-[10px] font-luxury-body"
                    >
                      {type}
                    </Badge>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}