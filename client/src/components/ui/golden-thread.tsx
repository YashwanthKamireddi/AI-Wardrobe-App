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
  direction?: "horizontal" | "vertical";
  /** Length of the thread in pixels or CSS value (e.g., "100%", "10rem") */
  length?: number | string;
  /** Thickness of the thread in pixels */
  thickness?: number;
  /** Additional CSS classes */
  className?: string;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Starting point coordinates (for custom threads not bound to direction) */
  startPoint?: { x: number; y: number };
  /** Ending point coordinates (for custom threads not bound to direction) */
  endPoint?: { x: number; y: number };
  /** Opacity of the thread (0-1) */
  opacity?: number;
}

const GoldenThread = ({
  direction = "horizontal",
  length = 100,
  thickness = 1,
  className,
  animationDuration = 3,
  startPoint,
  endPoint,
  opacity = 1
}: GoldenThreadProps) => {
  const isHorizontal = direction === "horizontal";
  const hasCustomPoints = startPoint && endPoint;
  
  // Calculate dimensions, position and rotation for custom points
  let dimensions: React.CSSProperties = {};
  let transformStyle: React.CSSProperties = {};
  
  if (hasCustomPoints) {
    // Calculate distance between points
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate angle in degrees
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Set dimensions and position
    dimensions = {
      width: `${length}px`,
      height: `${thickness}px`,
      position: 'absolute',
      left: `${startPoint.x}px`,
      top: `${startPoint.y}px`,
      opacity: opacity,
      transformOrigin: '0 50%',
      transform: `rotate(${angle}deg)`
    };
  } else {
    // Standard directional thread
    // Convert length to string if it's a number
    const lengthValue = typeof length === "number" ? `${length}px` : length;
    
    // Create appropriate dimensions based on direction
    dimensions = isHorizontal
      ? { width: lengthValue, height: `${thickness}px`, opacity: opacity }
      : { height: lengthValue, width: `${thickness}px`, opacity: opacity };
  }
  
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
        {Array(Math.max(3, Math.floor((hasCustomPoints ? 
          Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)) : 
          (typeof length === "number" ? length : 100)) / 30)))
          .fill(0)
          .map((_, i) => {
            // Calculate positions spread evenly
            const numDots = Math.floor((hasCustomPoints ? 
              Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)) : 
              (typeof length === "number" ? length : 100)) / 30);
            
            const position = i / (numDots - 1 || 1);
            const delay = i * 0.5;
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-200 dark:bg-amber-300 rounded-full shadow-glow"
                style={{
                  [isHorizontal && !hasCustomPoints ? "left" : "top"]: hasCustomPoints ? 
                    undefined : 
                    `calc(${position * 100}%)`,
                  [isHorizontal && !hasCustomPoints ? "top" : "left"]: hasCustomPoints ? 
                    undefined : 
                    "50%",
                  // For custom points, position directly on the line
                  ...(hasCustomPoints ? {
                    left: `${position * 100}%`,
                    top: '50%',
                  } : {}),
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