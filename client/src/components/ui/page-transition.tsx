import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import RunwayCurtain from './runway-curtain';

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
}

/**
 * PageTransition Component
 * 
 * A fashion-forward page transition component that uses a runway curtain effect
 * to create elegant transitions between pages.
 * 
 * @example
 * ```tsx
 * <PageTransition>
 *   <YourRouterContent />
 * </PageTransition>
 * ```
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 1.2
}) => {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut' | 'none'>('none');
  
  // Detect location changes to trigger transitions
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
      
      // After fadeOut is complete, update location and start fadeIn
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
        
        // Reset the transition stage after animation completes
        const resetTimeout = setTimeout(() => {
          setTransitionStage('none');
        }, duration * 1000);
        
        return () => clearTimeout(resetTimeout);
      }, duration * 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, duration]);
  
  // Page content animation variants
  const contentVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: duration * 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: duration * 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Runway curtain transition */}
      <RunwayCurtain
        isOpen={transitionStage !== 'fadeOut'}
        direction="horizontal"
        duration={duration}
        bgColor="rgba(0, 0, 0, 0.92)"
      >
        {/* Page content with fade transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={displayLocation}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={contentVariants}
            className="w-full min-h-[calc(100vh-4rem)]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </RunwayCurtain>
    </div>
  );
};

export default PageTransition;