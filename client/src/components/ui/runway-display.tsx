import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RunwayDisplayProps {
  items: React.ReactNode[];
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  autoScroll?: boolean;
  autoScrollSpeed?: number; // in milliseconds
  className?: string;
}

export function RunwayDisplay({
  items,
  itemWidth = 240,
  itemHeight = 300,
  gap = 30,
  autoScroll = false,
  autoScrollSpeed = 3000,
  className = ""
}: RunwayDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoScroll) return;
    
    const intervalId = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
      }
    }, autoScrollSpeed);
    
    return () => clearInterval(intervalId);
  }, [items.length, autoScroll, autoScrollSpeed, isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Virtual catwalk with spotlight effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/5 to-amber-200/10 dark:from-transparent dark:via-amber-900/5 dark:to-amber-800/10 pointer-events-none z-0"></div>
      
      {/* Spotlights */}
      <div className="absolute top-0 left-1/2 w-[300px] h-[120px] -translate-x-1/2 bg-gradient-radial from-amber-200/20 to-transparent dark:from-amber-500/10 dark:to-transparent blur-xl pointer-events-none"></div>
      
      {/* Runway "floor" */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200 to-transparent dark:via-amber-500/40 z-0"></div>

      {/* Control buttons */}
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-md flex items-center justify-center text-amber-800 dark:text-amber-200 border border-amber-200/30 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
        onClick={handlePrevious}
        aria-label="Previous item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      
      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 shadow-md flex items-center justify-center text-amber-800 dark:text-amber-200 border border-amber-200/30 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
        onClick={handleNext}
        aria-label="Next item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Items display */}
      <div 
        className="flex justify-center items-center min-h-[300px] py-8 relative"
        style={{ perspective: '1000px' }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            // Calculate position relative to current index
            const position = (index - currentIndex + items.length) % items.length;
            const isActive = position === 0;
            
            // Calculate transform values for 3D runway effect
            let translateX = 0;
            let translateZ = 0;
            let opacity = 1;
            let scale = 1;
            
            if (position !== 0) {
              // Items to the right
              if (position > 0 && position <= Math.ceil(items.length / 2)) {
                translateX = (position * (itemWidth + gap));
                translateZ = -position * 100;
                opacity = Math.max(0.3, 1 - (position * 0.2));
                scale = Math.max(0.7, 1 - (position * 0.1));
              } 
              // Items to the left
              else {
                const adjustedPosition = position < 0 ? position : position - items.length;
                translateX = (adjustedPosition * (itemWidth + gap));
                translateZ = -Math.abs(adjustedPosition) * 100;
                opacity = Math.max(0.3, 1 - (Math.abs(adjustedPosition) * 0.2));
                scale = Math.max(0.7, 1 - (Math.abs(adjustedPosition) * 0.1));
              }
            }

            return (
              <motion.div
                key={index}
                className={`absolute transition-shadow ${isActive ? 'z-10 shadow-xl' : 'z-[5]'}`}
                initial={{ opacity: 0, x: 0, y: 20 }}
                animate={{ 
                  opacity, 
                  x: translateX, 
                  y: isActive ? -10 : 0,
                  z: translateZ,
                  scale
                }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
                style={{ 
                  width: itemWidth,
                  height: itemHeight,
                  filter: isActive ? 'none' : 'brightness(0.9)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Item wrapper with spotlight effect */}
                <div 
                  className={`w-full h-full relative ${isActive ? 'after:opacity-100' : 'after:opacity-0'} after:absolute after:inset-0 after:bg-gradient-to-b after:from-amber-200/20 after:via-transparent after:to-transparent after:pointer-events-none after:transition-opacity after:duration-300`}
                >
                  {item}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center items-center gap-1.5 mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-amber-500 w-4' 
                : 'bg-amber-200/50 hover:bg-amber-300/70 dark:bg-amber-700/30 dark:hover:bg-amber-600/50'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to item ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// A simpler horizontal catwalk display that works well with outfit cards
export function CatwalkScroller({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden w-full ${className}`}>
      <div className="relative w-full">
        {/* Virtual catwalk background effect */}
        <div className="absolute inset-x-0 h-[1px] bottom-6 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"></div>
        
        {/* Subtle spotlights */}
        <div className="absolute -top-10 left-1/4 w-44 h-24 bg-gradient-radial from-amber-200/20 to-transparent blur-xl"></div>
        <div className="absolute -top-10 right-1/4 w-44 h-24 bg-gradient-radial from-amber-200/20 to-transparent blur-xl"></div>

        {/* Scrollable content with smooth animation */}
        <div className="overflow-x-auto py-6 px-1 luxuryScrollable">
          <div className="flex gap-6 pb-2">
            {/* Each child will animate up slightly on hover to simulate a catwalk stride */}
            {React.Children.map(children, (child, index) => (
              <div 
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <motion.div
                  whileHover={{ 
                    y: -8, 
                    transition: { 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 10 
                    } 
                  }}
                  className="transition-shadow duration-300 hover:shadow-xl"
                >
                  {child}
                </motion.div>
                
                {/* Spotlight effect on hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 bg-gradient-to-b from-amber-200/10 via-transparent to-transparent transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}