/**
 * RunwayCurtain Component
 * 
 * A luxury fashion-inspired visual transition element that mimics the elegant 
 * opening/closing of curtains at a high-fashion runway show.
 * 
 * @module RunwayCurtain
 * @component
 * 
 * Features:
 * - Elegant animation sequences for opening and closing transitions
 * - Custom timing options for entrance and exit animations
 * - Customizable styling with gold/amber gradient accents
 * - Optimized performance with auto-cleanup
 * 
 * Usage scenarios:
 * - Page transitions between major app sections
 * - Revealing premium content or special features
 * - Entrance animations for modals and dialogs
 * - Highlighting luxury items in the wardrobe
 * 
 * @example
 * // Basic usage
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <RunwayCurtain isOpen={isOpen}>
 *   <YourContent />
 * </RunwayCurtain>
 * 
 * // Advanced usage with custom timing and direction
 * <RunwayCurtain 
 *   isOpen={isRevealed}
 *   direction="vertical"
 *   openDuration={0.8}
 *   closeDuration={0.6}
 *   className="my-12 rounded-lg"
 * >
 *   <ExclusiveContent />
 * </RunwayCurtain>
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RunwayCurtainProps {
  /** Content to show when curtain is open */
  children: React.ReactNode;
  /** Whether the curtain is open */
  isOpen: boolean;
  /** Animation direction */
  direction?: 'horizontal' | 'vertical';
  /** Duration in seconds for the opening animation */
  openDuration?: number;
  /** Duration in seconds for the closing animation */
  closeDuration?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RunwayCurtain Component Implementation
 * 
 * Provides an elegant curtain-style animation for revealing content with
 * a luxury fashion aesthetic using amber/gold accents.
 */
export const RunwayCurtain = ({
  children,
  isOpen,
  direction = 'horizontal',
  openDuration = 0.7,
  closeDuration = 0.5,
  className,
}: RunwayCurtainProps) => {
  const isHorizontal = direction === 'horizontal';
  
  // Setup animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        duration: 0.2,
      }
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        duration: 0.2,
      }
    }
  };
  
  const curtainVariants = {
    left: {
      open: { 
        x: '-100%', 
        transition: { 
          duration: openDuration,
          ease: [0.16, 1, 0.3, 1], // Elegant cubic bezier easing
        }
      },
      closed: { 
        x: '0%', 
        transition: { 
          duration: closeDuration,
          ease: [0.5, 0, 0.75, 0],
        }
      },
    },
    right: {
      open: { 
        x: '100%', 
        transition: { 
          duration: openDuration,
          ease: [0.16, 1, 0.3, 1],
        }
      },
      closed: { 
        x: '0%', 
        transition: { 
          duration: closeDuration, 
          ease: [0.5, 0, 0.75, 0],
        }
      },
    },
    top: {
      open: { 
        y: '-100%', 
        transition: { 
          duration: openDuration,
          ease: [0.16, 1, 0.3, 1],
        }
      },
      closed: { 
        y: '0%', 
        transition: { 
          duration: closeDuration,
          ease: [0.5, 0, 0.75, 0],
        }
      },
    },
    bottom: {
      open: { 
        y: '100%', 
        transition: { 
          duration: openDuration,
          ease: [0.16, 1, 0.3, 1],
        }
      },
      closed: { 
        y: '0%', 
        transition: { 
          duration: closeDuration,
          ease: [0.5, 0, 0.75, 0],
        }
      },
    },
  };
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence initial={false}>
        {!isOpen && (
          <motion.div
            className="absolute inset-0 z-50 flex items-stretch"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Left/Top Curtain */}
            <motion.div
              className={cn(
                "bg-gradient-to-br from-amber-100 via-amber-50 to-white dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900/90",
                isHorizontal ? "w-1/2 h-full" : "w-full h-1/2"
              )}
              variants={isHorizontal ? curtainVariants.left : curtainVariants.top}
              initial="open"
              animate="closed"
              exit="open"
            >
              {/* Gold trim */}
              <div 
                className={cn(
                  "absolute bg-gradient-to-b from-amber-300 to-amber-500/80 dark:from-amber-500/80 dark:to-amber-700/60",
                  isHorizontal ? "w-1 h-full right-0" : "h-1 w-full bottom-0"
                )} 
              />
              
              {/* Decorative lines */}
              <div className="absolute inset-0 overflow-hidden opacity-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={`line-left-${i}`}
                    className={cn(
                      "absolute bg-amber-200/30 dark:bg-amber-700/20",
                      isHorizontal
                        ? "h-px w-full top-[10%]"
                        : "w-px h-full left-[10%]"
                    )}
                    style={{
                      [isHorizontal ? 'top' : 'left']: `${15 + i * 15}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Right/Bottom Curtain */}
            <motion.div
              className={cn(
                "bg-gradient-to-bl from-amber-100 via-amber-50 to-white dark:from-slate-900 dark:via-amber-950/30 dark:to-slate-900/90",
                isHorizontal ? "w-1/2 h-full" : "w-full h-1/2"
              )}
              variants={isHorizontal ? curtainVariants.right : curtainVariants.bottom}
              initial="open"
              animate="closed"
              exit="open"
            >
              {/* Gold trim */}
              <div 
                className={cn(
                  "absolute bg-gradient-to-b from-amber-300 to-amber-500/80 dark:from-amber-500/80 dark:to-amber-700/60",
                  isHorizontal ? "w-1 h-full left-0" : "h-1 w-full top-0"
                )} 
              />
              
              {/* Decorative lines */}
              <div className="absolute inset-0 overflow-hidden opacity-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={`line-right-${i}`}
                    className={cn(
                      "absolute bg-amber-200/30 dark:bg-amber-700/20",
                      isHorizontal
                        ? "h-px w-full top-[10%]"
                        : "w-px h-full left-[10%]"
                    )}
                    style={{
                      [isHorizontal ? 'top' : 'left']: `${15 + i * 15}%`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div 
        className={cn(
          "transition-opacity duration-300",
          !isOpen && "opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default RunwayCurtain;