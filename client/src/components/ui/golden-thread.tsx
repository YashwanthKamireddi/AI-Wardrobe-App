/**
 * GoldenThread Component
 * 
 * A luxurious animated thread/line effect with a gold/amber gradient that simulates
 * a shimmering thread of gold used for decorative elements in luxury fashion interfaces.
 * 
 * @component
 * @example
 * // Basic usage
 * <GoldenThread direction="horizontal" length={100} />
 * 
 * // Vertical thread with custom styling
 * <GoldenThread 
 *   direction="vertical" 
 *   length={200} 
 *   thickness={2}
 *   className="my-8" 
 * />
 * 
 * // Used as a divider
 * <div className="flex flex-col space-y-8">
 *   <section>First section</section>
 *   <GoldenThread direction="horizontal" length="100%" />
 *   <section>Second section</section>
 * </div>
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GoldenThreadProps {
  /** Direction of the thread - horizontal or vertical */
  direction: "horizontal" | "vertical";
  /** Length of the thread in pixels or CSS value (e.g., "100%", "10rem") */
  length: number | string;
  /** Thickness of the thread in pixels */
  thickness?: number;
  /** Additional CSS classes */
  className?: string;
  /** Animation duration in seconds */
  animationDuration?: number;
}

const GoldenThread = ({
  direction = "horizontal",
  length = 100,
  thickness = 1,
  className,
  animationDuration = 3
}: GoldenThreadProps) => {
  const isHorizontal = direction === "horizontal";
  
  // Convert length to string if it's a number
  const lengthValue = typeof length === "number" ? `${length}px` : length;
  
  // Create appropriate dimensions based on direction
  const dimensions = isHorizontal
    ? { width: lengthValue, height: `${thickness}px` }
    : { height: lengthValue, width: `${thickness}px` };
  
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={dimensions}
    >
      {/* Base layer - subtle amber gradient */}
      <div 
        className={`absolute inset-0 ${
          isHorizontal 
            ? "bg-gradient-to-r from-amber-200/30 via-amber-400/40 to-amber-200/30" 
            : "bg-gradient-to-b from-amber-200/30 via-amber-400/40 to-amber-200/30"
        } dark:from-amber-700/20 dark:via-amber-500/30 dark:to-amber-700/20`}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className={`absolute inset-0 ${
          isHorizontal 
            ? "bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" 
            : "bg-gradient-to-b from-transparent via-amber-400/80 to-transparent"
        } dark:via-amber-300/60`}
        initial={{ 
          [isHorizontal ? "x" : "y"]: "-100%" 
        }}
        animate={{ 
          [isHorizontal ? "x" : "y"]: "100%" 
        }}
        transition={{
          repeat: Infinity,
          duration: animationDuration,
          ease: "linear",
        }}
      />
      
      {/* Sparkle dots */}
      <div className="absolute inset-0">
        {Array(Math.max(3, Math.floor((typeof length === "number" ? length : 100) / 30)))
          .fill(0)
          .map((_, i) => {
            // Calculate positions spread evenly
            const position = i / (Math.floor((typeof length === "number" ? length : 100) / 30) - 1);
            const delay = i * 0.5;
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-200 dark:bg-amber-300 rounded-full shadow-glow"
                style={{
                  [isHorizontal ? "left" : "top"]: `calc(${position * 100}%)`,
                  [isHorizontal ? "top" : "left"]: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

export { GoldenThread };
export default GoldenThread;