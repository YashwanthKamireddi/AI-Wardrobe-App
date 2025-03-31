import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RunwayCurtainProps {
  children: React.ReactNode;
  isOpen?: boolean;
  direction?: 'horizontal' | 'vertical';
  bgColor?: string;
  duration?: number;
}

/**
 * RunwayCurtain Component
 * 
 * Provides a fashionable curtain transition effect for page transitions and reveals,
 * inspired by fashion runway shows.
 * 
 * @example
 * ```tsx
 * <RunwayCurtain isOpen={pageLoaded} direction="horizontal">
 *   <YourPageContent />
 * </RunwayCurtain>
 * ```
 */
export const RunwayCurtain: React.FC<RunwayCurtainProps> = ({
  children,
  isOpen = true,
  direction = 'horizontal',
  bgColor = 'rgba(0, 0, 0, 0.9)',
  duration = 1.2,
}) => {
  // Define variant animations based on direction
  const curtainVariants = {
    closed: {
      x: direction === 'horizontal' ? '0%' : undefined,
      y: direction === 'vertical' ? '0%' : undefined,
      scaleX: direction === 'horizontal' ? 1 : undefined,
      scaleY: direction === 'vertical' ? 1 : undefined,
    },
    open: {
      x: direction === 'horizontal' ? ['0%', '0%', '100%'] : undefined,
      y: direction === 'vertical' ? ['0%', '0%', '100%'] : undefined, 
      scaleX: direction === 'horizontal' ? [1, 1.05, 0] : undefined,
      scaleY: direction === 'vertical' ? [1, 1.05, 0] : undefined,
      transition: {
        duration: duration,
        times: [0, 0.3, 1],
        ease: [0.645, 0.045, 0.355, 1.0],
      }
    }
  };

  // Opposite curtain (starts from other side)
  const oppositeCurtainVariants = {
    closed: {
      x: direction === 'horizontal' ? '0%' : undefined,
      y: direction === 'vertical' ? '0%' : undefined,
      scaleX: direction === 'horizontal' ? 1 : undefined,
      scaleY: direction === 'vertical' ? 1 : undefined,
    },
    open: {
      x: direction === 'horizontal' ? ['0%', '0%', '-100%'] : undefined,
      y: direction === 'vertical' ? ['0%', '0%', '-100%'] : undefined,
      scaleX: direction === 'horizontal' ? [1, 1.05, 0] : undefined,
      scaleY: direction === 'vertical' ? [1, 1.05, 0] : undefined,
      transition: {
        duration: duration,
        times: [0, 0.3, 1],
        ease: [0.645, 0.045, 0.355, 1.0],
      }
    }
  };

  // Content variants
  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: duration * 0.8,
        ease: [0.175, 0.885, 0.32, 1.275],
      }
    }
  };

  // Spotlight variants
  const spotlightVariants = {
    initial: {
      opacity: 0,
      scale: 0
    },
    animate: {
      opacity: [0, 1, 0.8, 0],
      scale: [0, 0.5, 1.5, 3],
      transition: {
        duration: duration * 1.2,
        times: [0, 0.1, 0.3, 1],
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!isOpen && (
          <>
            {/* Left/Top Curtain */}
            <motion.div 
              className={`absolute z-50 ${direction === 'horizontal' ? 'left-0 top-0 bottom-0 w-1/2 origin-right' : 'top-0 left-0 right-0 h-1/2 origin-bottom'}`}
              style={{ 
                backgroundColor: bgColor,
                backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)",
                backgroundSize: "50px 50px",
              }}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              exit="open"
              variants={curtainVariants}
            />
            
            {/* Right/Bottom Curtain */}
            <motion.div 
              className={`absolute z-50 ${direction === 'horizontal' ? 'right-0 top-0 bottom-0 w-1/2 origin-left' : 'bottom-0 left-0 right-0 h-1/2 origin-top'}`}
              style={{ 
                backgroundColor: bgColor,
                backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)",
                backgroundSize: "50px 50px" 
              }}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              exit="open"
              variants={oppositeCurtainVariants}
            />
            
            {/* Center spotlight effect */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
              initial="initial"
              animate="animate"
              variants={spotlightVariants}
            >
              <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 blur-lg" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page content with fade-in effect */}
      <motion.div
        className="w-full h-full z-10"
        variants={contentVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default RunwayCurtain;