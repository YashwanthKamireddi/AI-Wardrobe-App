import { motion } from "framer-motion";

/**
 * CloudSunIcon Component
 * 
 * A custom animated SVG icon showing a cloud with sun for partly cloudy weather condition.
 * Features subtle animations for a luxury aesthetic with amber color theme.
 * 
 * @component
 * @example
 * // Basic usage
 * <CloudSunIcon />
 * 
 * // Inside a weather display component
 * <div className="weather-icon">
 *   <CloudSunIcon />
 * </div>
 * 
 * @returns {JSX.Element} An animated cloud with sun icon
 * 
 * @animation
 * - Sun: Pulsing opacity and scale effect using Framer Motion
 * - Sun rays: Slow continuous rotation animation
 * - Cloud: Gentle floating movement with slight position shifts
 * - Cloud details: Subtle opacity changes
 * 
 * @styling
 * - Uses amber-600/400 color palette with dark mode support
 * - Includes subtle glow effect with blur and gradient
 * - Default size: 12×12 (3rem × 3rem)
 * 
 * @relatedComponents
 * - WeatherDisplay - Parent component that uses this icon
 * - SunIcon - Icon for sunny conditions
 * - CloudIcon - Icon for cloudy conditions
 * - CloudRainIcon - Icon for rainy conditions
 * - CloudSnowIcon - Icon for snowy conditions
 */
export const CloudSunIcon = () => (
  <div className="relative">
    <motion.div
      className="h-12 w-12 text-amber-600 dark:text-amber-400"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Sun */}
        <motion.circle 
          cx="12" 
          cy="7" 
          r="3" 
          fill="currentColor"
          animate={{ 
            opacity: [1, 0.8, 1],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Sun rays */}
        <motion.g 
          className="opacity-80"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line 
              key={angle} 
              x1="12" 
              y1="7" 
              x2="12" 
              y2="4" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              strokeLinecap="round"
              transform={`rotate(${angle} 12 7)`}
            />
          ))}
        </motion.g>
        
        {/* Cloud */}
        <motion.path 
          d="M7 16C4.79086 16 3 14.2091 3 12C3 9.79086 4.79086 8 7 8C8.48056 8 9.73784 8.85085 10.352 10.0912C10.8308 9.76872 11.3992 9.58581 12.0098 9.58581C13.6673 9.58581 15.0098 10.9284 15.0098 12.5858C15.0098 14.2433 13.6673 15.5858 12.0098 15.5858H7.5"
          stroke="currentColor" 
          strokeWidth="1.25" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="0.5 0.5"
          animate={{ 
            x: [0, 1, 0, -1, 0],
            y: [0, 0.5, 0, -0.5, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Cloud details */}
        <motion.path 
          d="M5 12.5C5 12.5 6 13 7.5 13C9 13 10 12 10 12"
          stroke="currentColor" 
          strokeWidth="0.5" 
          strokeLinecap="round"
          className="opacity-70"
          animate={{ opacity: [0.7, 0.4, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
    
    {/* Subtle glow effect */}
    <div className="absolute inset-0 blur-lg opacity-20 scale-110">
      <div className="w-full h-full rounded-full bg-amber-200 dark:bg-amber-300/30"></div>
    </div>
  </div>
);

export default CloudSunIcon;