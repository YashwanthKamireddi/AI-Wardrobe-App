/**
 * @fileOverview Weather Display Component
 * 
 * This file contains:
 * 1. Custom SVG weather icons (SunIcon, CloudIcon, CloudRainIcon, CloudSnowIcon)
 * 2. WeatherDisplay component that shows current weather data
 * 3. Animations and visual effects for weather elements
 * 4. Optional clothing recommendations based on weather
 * 
 * @requires framer-motion - For animations
 * @requires @/components/ui/badge - For clothing type tags
 * @requires @/components/ui/cloud-sun-icon - For partly cloudy icon
 * @requires @/hooks/use-mobile - For responsive design
 */

import { Badge } from "@/components/ui/badge";
import { 
  ThermometerIcon,
  WindIcon
} from "lucide-react";
import { CloudSunIcon } from "@/components/ui/cloud-sun-icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

/**
 * Custom Weather Icon Components
 * 
 * Each icon is designed with a consistent amber luxurious aesthetic
 * featuring subtle animations and glow effects.
 */

/**
 * SunIcon Component - Used for sunny weather conditions
 * 
 * @component
 * @element div - Container with relative positioning
 * @element motion.div - Animated container for rotation effect
 * @element svg - Scalable vector graphic with viewBox="0 0 24 24"
 * @element circle - Central sun body, amber-colored
 * @element g - Group of radiating sun rays
 * @element line - Individual sun rays with dynamic spacing and lengths
 * 
 * @animation
 * - Continuous 360° rotation (20s duration)
 * - Background glow with amber gradient
 * 
 * @styling
 * - Size: Default 12×12 (3rem)
 * - Colors: amber-600 (light mode), amber-400 (dark mode)
 * - Glow: blur-lg effect with radial gradient
 * 
 * @usedIn
 * - WeatherDisplay component (case: 'sunny')
 */
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

/**
 * CloudIcon Component - Used for cloudy weather conditions
 * 
 * @component
 * @element svg - Scalable vector graphic with viewBox="0 0 24 24"
 * @element path - Main cloud outline with stroke styling
 * @element path - Secondary detailed line inside cloud for depth
 * 
 * @animation
 * - Subtle floating motion (x: [0, 3, 0], y: [0, -1, 0]) with 4s duration
 * - Background glow effect with amber gradient
 * 
 * @styling
 * - Size: Default 12×12 (3rem)
 * - Colors: amber-600 (light mode), amber-400 (dark mode)
 * - Stroke styling: 1.5 width for main cloud, 0.7 for details
 * - Glow: blur-lg effect with amber-200 gradient
 * 
 * @usedIn
 * - WeatherDisplay component (case: 'cloudy')
 */
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

/**
 * CloudRainIcon Component - Used for rainy weather conditions
 * 
 * @component
 * @element svg - Scalable vector graphic with viewBox="0 0 24 24"
 * @element path - Main cloud outline with stroke styling
 * @element line - Animated rain drops falling from cloud
 * 
 * @animation
 * - Gentle vertical bobbing effect (y: [0, 1, 0]) with 2s duration
 * - Background glow effect with amber gradient
 * 
 * @styling
 * - Size: Default 12×12 (3rem)
 * - Colors: amber-600 (light mode), amber-400 (dark mode)
 * - Rain drops: Simple vertical lines with rounded caps
 * - Glow: blur-lg effect with amber-100/200 gradient
 * 
 * @usedIn
 * - WeatherDisplay component (case: 'rainy')
 */
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

/**
 * CloudSnowIcon Component - Used for snowy weather conditions
 * 
 * @component
 * @element svg - Scalable vector graphic with viewBox="0 0 24 24"
 * @element path - Main cloud outline with stroke styling
 * @element circle - Snowflakes represented as small filled circles
 * 
 * @animation
 * - Gentle rotation effect (rotate: [0, 5, 0, -5, 0]) with 6s duration
 * - Background glow effect with amber gradient
 * 
 * @styling
 * - Size: Default 12×12 (3rem)
 * - Colors: amber-600 (light mode), amber-400 (dark mode)
 * - Snowflakes: Simple filled circles with strategic placement
 * - Glow: blur-lg effect with amber-100/200 gradient
 * 
 * @usedIn
 * - WeatherDisplay component (case: 'snowy')
 */
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
            <div className="absolute inset-0 blur-lg opacity-20 scale-110">
              <div className="w-full h-full rounded-full bg-amber-300 dark:bg-amber-300/50"></div>
            </div>
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
            <div className="absolute inset-0 blur-lg opacity-20 scale-110">
              <div className="w-full h-full rounded-full bg-amber-200 dark:bg-amber-200/30"></div>
            </div>
          </div>
        );
      case 'partly_cloudy':
        return (
          <div className="relative">
            <CloudSunIcon />
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
            <div className="absolute inset-0 blur-lg opacity-20 scale-110">
              <div className="w-full h-full rounded-full bg-amber-100 dark:bg-amber-200/20"></div>
            </div>
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
            <div className="absolute inset-0 blur-lg opacity-20 scale-110">
              <div className="w-full h-full rounded-full bg-amber-100 dark:bg-amber-200/20"></div>
            </div>
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
            <div className="absolute inset-0 blur-lg opacity-20 scale-110">
              <div className="w-full h-full rounded-full bg-amber-100 dark:bg-amber-200/20"></div>
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
            <div className="absolute inset-0 blur-lg opacity-20 scale-110">
              <div className="w-full h-full rounded-full bg-amber-200 dark:bg-amber-200/30"></div>
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
      className="weather-display-luxury animate-fade-scale relative before:absolute before:inset-0 before:border before:border-amber-600/20 dark:before:border-amber-400/20 before:rounded-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {/* Luxury corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-amber-600/30 dark:border-amber-400/30"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-amber-600/30 dark:border-amber-400/30"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-amber-600/30 dark:border-amber-400/30"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-amber-600/30 dark:border-amber-400/30"></div>
      {/* Weather header with location and main info */}
      <div className="p-5 bg-gradient-to-r from-amber-600/10 dark:from-amber-400/10 via-background to-amber-600/5 dark:to-amber-400/5 border-b border-amber-600/20 dark:border-amber-400/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-amber-300/20 to-transparent dark:from-amber-400/10 opacity-80 rounded-full blur-xl transform -translate-x-5 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-radial from-amber-200/30 to-transparent dark:from-amber-300/10 opacity-60 rounded-full blur-lg transform translate-x-2 translate-y-6"></div>
        
        <motion.div 
          className="flex items-center justify-between relative"
          variants={itemVariants}
        >
          <h3 className="text-xl font-fashion-heading tracking-tight flex items-center">
            <span className="bg-gradient-to-r from-amber-600 dark:from-amber-400 to-amber-800 dark:to-amber-500 bg-clip-text text-transparent relative">
              {weather.location}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-amber-400/40 to-transparent"></div>
            </span>
          </h3>
          <div className="designer-tag animate-shimmer-gold">
            {weather.condition}
          </div>
        </motion.div>
        
        {/* Subtle divider */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 dark:via-amber-400/30 to-transparent"></div>
      </div>
      
      {/* Weather content area */}
      <div className="p-5 space-y-5 relative">
        {/* Luxury background element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-radial from-amber-200/5 to-transparent dark:from-amber-400/5 rounded-full blur-xl"></div>
        
        {/* Main weather display */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center relative">
            <div className="relative">
              <motion.p 
                variants={itemVariants} 
                className="weather-temp-luxury relative z-10"
              >
                {weather.temperature}°<span className="text-xl font-luxury-heading">C</span>
              </motion.p>
              
              {/* Temperature visual flourish */}
              <div className="absolute -left-3 -top-3 w-16 h-16 bg-gradient-radial from-amber-200/20 dark:from-amber-400/10 to-transparent rounded-full blur-lg"></div>
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-amber-400/40 to-transparent"></div>
            </div>
          </div>
          
          <motion.div 
            variants={containerVariants} 
            className="flex flex-col space-y-2 bg-gradient-to-r from-amber-50/20 to-transparent dark:from-amber-900/20 dark:to-transparent p-2 rounded-sm border-l border-amber-200/30 dark:border-amber-700/30"
          >
            <motion.div 
              variants={itemVariants} 
              className="flex items-center border-b border-amber-600/10 dark:border-amber-400/10 pb-1 pl-2"
            >
              <ThermometerIcon className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-luxury-body tracking-wide">Humidity: {weather.humidity}%</span>
            </motion.div>
            <motion.div 
              variants={itemVariants} 
              className="flex items-center border-b border-amber-600/10 dark:border-amber-400/10 pb-1 pl-2"
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
            className="mt-8 haute-couture-section rounded-sm py-6"
            whileHover={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)" }}
          >
            <motion.div 
              className="flex items-center mb-5"
              variants={itemVariants}
            >
              <span className="p-2 rounded-sm bg-amber-600/10 dark:bg-amber-400/10 mr-4 border border-amber-600/30 dark:border-amber-400/30 shadow-inner relative overflow-hidden">
                <ThermometerIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 dark:from-amber-400/5 to-transparent"></div>
              </span>
              <motion.h4 
                className="text-sm font-fashion-heading uppercase tracking-wider gold-accent"
                whileHover={{
                  textShadow: "0 0 8px rgba(var(--accent-rgb), 0.3)"
                }}
              >
                Curated Style Guide
              </motion.h4>
            </motion.div>
            
            <motion.div
              className="mb-6 relative"
              variants={itemVariants}
            >
              <motion.p 
                className="text-sm font-fashion-body text-muted-foreground italic border-l-2 border-amber-600/30 dark:border-amber-400/30 pl-4 pr-2 py-1 bg-amber-600/5 dark:bg-amber-400/5"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {recommendations.recommendation}
              </motion.p>
              <div className="absolute -bottom-1 -right-1 w-20 h-1 bg-gradient-to-r from-transparent to-amber-600/20 dark:to-amber-400/20"></div>
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
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="border-amber-600/30 dark:border-amber-400/30 bg-background/80 hover:bg-amber-600/10 dark:hover:bg-amber-400/10 text-foreground px-3 py-1.5 uppercase tracking-wider text-[10px] font-fashion-body backdrop-blur-sm"
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