import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SilkUnwrappingProps {
  children: React.ReactNode;
  isRevealing?: boolean;
  onRevealComplete?: () => void;
  luxuryLevel?: "standard" | "premium" | "haute-couture";
  backgroundColor?: string;
  silkColor?: string;
  showShimmer?: boolean;
}

/**
 * SilkUnwrapping Component
 * 
 * A luxury animation component that reveals its children with an elegant
 * silk unwrapping effect, inspired by high-end fashion packaging.
 * 
 * @example
 * ```tsx
 * <SilkUnwrapping isRevealing={showItemDetails} luxuryLevel="premium">
 *   <YourContent />
 * </SilkUnwrapping>
 * ```
 */
export const SilkUnwrapping: React.FC<SilkUnwrappingProps> = ({
  children,
  isRevealing = false,
  onRevealComplete,
  luxuryLevel = "standard",
  backgroundColor = "rgba(251, 191, 36, 0.05)",
  silkColor = "rgba(251, 191, 36, 0.3)",
  showShimmer = true,
}) => {
  const [showContent, setShowContent] = useState(false);
  
  // Number of silk layers based on luxury level
  const silkLayerCount = 
    luxuryLevel === "haute-couture" ? 5 :
    luxuryLevel === "premium" ? 3 : 2;
  
  // Create silk layers with staggered opacity
  const silkLayers = Array.from({ length: silkLayerCount }).map((_, i) => {
    const opacity = 0.5 - (i * 0.1);
    return {
      opacity,
      zIndex: silkLayerCount - i,
      delay: i * 0.15,
    };
  });

  // Handle animation completion
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isRevealing) {
      timer = setTimeout(() => {
        setShowContent(true);
        if (onRevealComplete) onRevealComplete();
      }, (silkLayerCount * 200) + 500);
    } else {
      setShowContent(false);
    }
    
    return () => clearTimeout(timer);
  }, [isRevealing, silkLayerCount, onRevealComplete]);

  // Variants for silk layer animations
  const silkVariants = {
    initial: { 
      scaleX: 1,
      x: 0,
      opacity: 1
    },
    unwrap: (i: number) => ({
      scaleX: 0,
      x: "100%",
      opacity: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        delay: i * 0.2,
      }
    })
  };

  // Shimmer effect variant
  const shimmerVariants = {
    initial: {
      x: "-100%",
      opacity: 0.7,
    },
    animate: {
      x: "200%",
      opacity: 0,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }
    }
  };

  // Variants for the box container
  const containerVariants = {
    initial: { 
      scale: 0.95,
      opacity: 0,
      rotate: -3
    },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1
      }
    },
    exit: {
      scale: 0.97,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.32, 0, 0.67, 0]
      }
    }
  };

  // Content variants
  const contentVariants = {
    hidden: { 
      opacity: 0,
      y: 15
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isRevealing && (
        <motion.div
          className="relative w-full h-full overflow-hidden rounded-lg"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            backgroundColor,
            boxShadow: luxuryLevel === "haute-couture" 
              ? "0 25px 50px -12px rgba(251, 191, 36, 0.25), 0 0 0 1px rgba(251, 191, 36, 0.1)" 
              : "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}
        >
          {/* Silk layers */}
          {silkLayers.map((layer, index) => (
            <motion.div
              key={`silk-layer-${index}`}
              className="absolute inset-0"
              style={{
                backgroundColor: silkColor,
                backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)",
                backgroundSize: "350px 350px",
                transformOrigin: "right center",
                zIndex: 10 + layer.zIndex,
                opacity: layer.opacity
              }}
              variants={silkVariants}
              custom={index}
              initial="initial"
              animate={isRevealing ? "unwrap" : "initial"}
            >
              {/* Shimmer effect on silk */}
              {showShimmer && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    zIndex: 1
                  }}
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                />
              )}
            </motion.div>
          ))}
          
          {/* Content */}
          <motion.div
            className="relative w-full h-full z-20"
            variants={contentVariants}
            initial="hidden"
            animate={showContent ? "visible" : "hidden"}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SilkUnwrapping;