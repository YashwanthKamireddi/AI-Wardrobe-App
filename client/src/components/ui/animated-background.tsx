import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  pattern?: "gradient" | "dots" | "waves" | "grid" | "bubbles";
  color?: string;
  secondaryColor?: string;
  speed?: "slow" | "medium" | "fast";
  intensity?: "subtle" | "medium" | "strong";
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  className,
  pattern = "gradient",
  color = "primary",
  secondaryColor,
  speed = "medium",
  intensity = "medium"
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get speed duration based on speed setting
  const getDuration = () => {
    switch (speed) {
      case "slow": return 20;
      case "medium": return 15;
      case "fast": return 10;
      default: return 15;
    }
  };
  
  // Get opacity based on intensity
  const getOpacity = () => {
    switch (intensity) {
      case "subtle": return 0.05;
      case "medium": return 0.1;
      case "strong": return 0.15;
      default: return 0.1;
    }
  };
  
  // Get primary color class
  const getColorClass = () => {
    switch (color) {
      case "primary": return "from-primary/20 via-primary/5 to-transparent";
      case "secondary": return "from-secondary/20 via-secondary/5 to-transparent";
      case "accent": return "from-orange-500/20 via-orange-500/5 to-transparent";
      case "muted": return "from-muted/20 via-muted/5 to-transparent";
      default: return "from-primary/20 via-primary/5 to-transparent";
    }
  };
  
  // Get background pattern JSX
  const renderBackgroundPattern = () => {
    switch (pattern) {
      case "gradient":
        return (
          <motion.div 
            className={cn(
              "absolute inset-0 bg-gradient-to-b opacity-30",
              getColorClass()
            )}
            animate={{
              opacity: [getOpacity() * 0.8, getOpacity() * 1.2, getOpacity() * 0.8],
            }}
            transition={{
              duration: getDuration(),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );
        
      case "dots":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute rounded-full bg-primary",
                  i % 3 === 0 ? "w-16 h-16" : i % 3 === 1 ? "w-12 h-12" : "w-8 h-8"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: getOpacity() * (Math.random() * 0.5 + 0.5)
                }}
                animate={{
                  x: [
                    Math.random() * 50 - 25,
                    Math.random() * 50 - 25,
                    Math.random() * 50 - 25
                  ],
                  y: [
                    Math.random() * 50 - 25,
                    Math.random() * 50 - 25,
                    Math.random() * 50 - 25
                  ],
                  opacity: [
                    getOpacity() * (Math.random() * 0.3 + 0.2),
                    getOpacity() * (Math.random() * 0.5 + 0.3),
                    getOpacity() * (Math.random() * 0.3 + 0.2)
                  ]
                }}
                transition={{
                  duration: getDuration() + Math.random() * 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                }}
              />
            ))}
          </div>
        );
        
      case "waves":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute inset-0 border-t-2 border-primary/10 rounded-[100%]",
                )}
                style={{
                  height: `${100 + i * 5}%`,
                  width: `${150 + i * 10}%`,
                  left: '-25%',
                  opacity: getOpacity() * (1 - i * 0.2)
                }}
                animate={{
                  y: [
                    i * 5,
                    i * 5 - 10,
                    i * 5
                  ],
                }}
                transition={{
                  duration: getDuration() - i * 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );
        
      case "grid":
        return (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, var(--primary) 1px, transparent 1px),
                linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              opacity: getOpacity() * 0.5
            }}
          >
            <motion.div
              className="absolute inset-0 bg-background"
              animate={{
                opacity: [0.85, 0.9, 0.85]
              }}
              transition={{
                duration: getDuration(),
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        );
        
      case "bubbles":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
                style={{
                  width: `${Math.random() * 80 + 20}px`,
                  height: `${Math.random() * 80 + 20}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: `-100px`,
                  opacity: getOpacity() * (Math.random() * 0.5 + 0.5)
                }}
                animate={{
                  y: [0, -Math.random() * window.innerHeight * 1.2 - 100],
                  opacity: [0, getOpacity(), 0],
                  scale: [0.8, Math.random() * 0.5 + 1, 0.9]
                }}
                transition={{
                  duration: getDuration() + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * getDuration(),
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );
        
      default:
        return (
          <motion.div 
            className={cn(
              "absolute inset-0 bg-gradient-to-b opacity-30",
              getColorClass()
            )}
            animate={{
              opacity: [getOpacity() * 0.8, getOpacity() * 1.2, getOpacity() * 0.8],
            }}
            transition={{
              duration: getDuration(),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );
    }
  };
  
  if (!mounted) return <div className={cn("relative", className)}>{children}</div>;
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {renderBackgroundPattern()}
      <div className="relative z-10">{children}</div>
    </div>
  );
};