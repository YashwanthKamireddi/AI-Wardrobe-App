import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Sparkle = {
  id: string;
  createdAt: number;
  color: string;
  size: number;
  style: {
    top: string;
    left: string;
    zIndex: number;
  };
};

interface SparkleEffectProps {
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  sparklesCount?: number;
  moodColor?: string;
  fadeSpeed?: number;
  className?: string;
  children?: React.ReactNode;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  colors = ["#FFC700", "#FF6B6B", "#6B66FF", "#44D7B6", "#FF61D2"],
  minSize = 10,
  maxSize = 20,
  sparklesCount = 15,
  moodColor,
  fadeSpeed = 0.8,
  className = "",
  children,
}) => {
  // If a mood color is provided, adjust the colors array to use variations of that color
  const sparkleColors = moodColor
    ? [
        moodColor,
        moodColor + "CC", // 80% opacity
        moodColor + "99", // 60% opacity
        moodColor + "66", // 40% opacity
        "#ffffff",
      ]
    : colors;

  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  
  const getRandomColor = () => sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
  const getRandomSize = () => Math.random() * (maxSize - minSize) + minSize;
  const getRandomPosition = () => `${Math.random() * 100}%`;
  
  // Create a new sparkle
  const createSparkle = (): Sparkle => {
    return {
      id: String(Date.now() + Math.random()),
      createdAt: Date.now(),
      color: getRandomColor(),
      size: getRandomSize(),
      style: {
        top: getRandomPosition(),
        left: getRandomPosition(),
        zIndex: 1,
      },
    };
  };
  
  // Initialize sparkles
  useEffect(() => {
    // Clear existing sparkles when moodColor changes
    setSparkles([]);
    
    // Generate new sparkles with the updated color
    const initialSparkles = Array.from({ length: sparklesCount }).map(() => createSparkle());
    setSparkles(initialSparkles);
    
    // Create new sparkles at intervals
    const interval = setInterval(() => {
      // Remove one old sparkle and add a new one
      setSparkles(currentSparkles => {
        const newSparkles = [...currentSparkles];
        if (newSparkles.length > 0) {
          newSparkles.shift(); // Remove the oldest sparkle
        }
        return [...newSparkles, createSparkle()];
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, [sparklesCount, moodColor]);
  
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeSpeed }}
          style={{
            ...sparkle.style,
            position: "absolute",
            pointerEvents: "none",
          }}
        >
          <Sparkle 
            color={sparkle.color} 
            size={sparkle.size} 
          />
        </motion.div>
      ))}
    </div>
  );
};

// Individual Sparkle SVG
const Sparkle = ({ color, size }: { color: string; size: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <motion.path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
        animate={{ 
          rotate: [0, 180],
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 2,
          ease: "linear", 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
    </svg>
  );
};

// Mood-specific sparkle effect wrapper for easy use
export const MoodSparkleWrapper: React.FC<{
  mood: string; 
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ mood, active = true, children, className = "" }) => {
  // Map mood to a hex color
  const getMoodColor = (mood: string): string => {
    switch (mood) {
      case "happy": return "#FFD700"; // Gold
      case "confident": return "#4169E1"; // Royal Blue
      case "relaxed": return "#20B2AA"; // Light Sea Green
      case "energetic": return "#FF4500"; // Orange Red
      case "romantic": return "#FF69B4"; // Hot Pink
      case "professional": return "#696969"; // Dim Gray
      case "creative": return "#9370DB"; // Medium Purple
      default: return "#FFD700"; // Default Gold
    }
  };

  // Only show sparkles if active
  if (!active) return <div className={className}>{children}</div>;

  return (
    <SparkleEffect 
      moodColor={getMoodColor(mood)} 
      className={className}
    >
      {children}
    </SparkleEffect>
  );
};