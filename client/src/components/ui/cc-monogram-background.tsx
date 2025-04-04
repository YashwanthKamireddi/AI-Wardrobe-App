import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CCMonogramBackgroundProps {
  brandName?: string;
  opacity?: number;
  density?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * CC Monogram Background Component
 * 
 * A sophisticated, subtle background element featuring an animated pattern
 * of the brand monogram that adds depth and luxury to the auth page.
 */
const CCMonogramBackground: React.FC<CCMonogramBackgroundProps> = ({
  brandName = "CC",
  opacity = 0.03,
  density = 5,
  className = "",
  children,
}) => {
  const [monograms, setMonograms] = useState<{ x: number; y: number; delay: number; scale: number; rotate: number }[]>([]);
  
  // Generate monogram positions
  useEffect(() => {
    const newMonograms = [];
    const count = density * 5; // Adjust based on density setting
    
    for (let i = 0; i < count; i++) {
      newMonograms.push({
        x: Math.random() * 100, // Random x position (percentage)
        y: Math.random() * 100, // Random y position (percentage)
        delay: Math.random() * 10, // Random animation delay
        scale: 0.7 + (Math.random() * 0.6), // Random scale between 0.7 and 1.3
        rotate: -10 + (Math.random() * 20), // Random rotation between -10 and 10 degrees
      });
    }
    
    setMonograms(newMonograms);
  }, [density]);
  
  return (
    <div className="relative">
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {monograms.map((monogram, index) => (
          <motion.div
            key={index}
            className="absolute font-serif font-light text-2xl md:text-3xl text-amber-500"
            style={{
              left: `${monogram.x}%`,
              top: `${monogram.y}%`,
              opacity: opacity,
              originX: "50%",
              originY: "50%",
            }}
            initial={{ opacity: 0, scale: monogram.scale - 0.1, rotate: monogram.rotate - 5 }}
            animate={{ 
              opacity: [0, opacity, 0],
              scale: [monogram.scale - 0.1, monogram.scale, monogram.scale - 0.1],
              rotate: [monogram.rotate - 2, monogram.rotate, monogram.rotate - 2]
            }}
            transition={{
              duration: 20,
              delay: monogram.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {brandName}
          </motion.div>
        ))}
      </div>
      {children}
    </div>
  );
};

export default CCMonogramBackground;