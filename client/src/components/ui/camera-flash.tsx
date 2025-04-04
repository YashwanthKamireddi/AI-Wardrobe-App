import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraFlashProps {
  children?: React.ReactNode;
  trigger?: boolean;
  intensity?: 'soft' | 'medium' | 'high';
  color?: string;
  flashCount?: number;
  flashSpacing?: number;
  onFlashComplete?: () => void;
  className?: string;
}

/**
 * CameraFlash Component
 * 
 * Creates a fashion runway-inspired camera flash effect when triggered
 * to highlight premium content and important UI elements.
 * 
 * @example
 * ```tsx
 * <CameraFlash trigger={isHovered} intensity="medium">
 *   <PremiumProductCard />
 * </CameraFlash>
 * ```
 */
export const CameraFlash: React.FC<CameraFlashProps> = ({
  children,
  trigger = false,
  intensity = 'medium',
  color = 'white',
  flashCount = 3,
  flashSpacing = 200,
  onFlashComplete,
  className = ''
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashSequence, setFlashSequence] = useState(0);
  
  // Configure flash intensity settings
  const intensitySettings = {
    soft: { opacity: 0.3, duration: 0.3 },
    medium: { opacity: 0.6, duration: 0.4 },
    high: { opacity: 0.85, duration: 0.5 }
  };
  
  // The current intensity setting based on prop
  const currentIntensity = intensitySettings[intensity];
  
  // Flash effect trigger
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (trigger && !isFlashing) {
      setIsFlashing(true);
      setFlashSequence(1);
      
      // Schedule the next flashes
      const executeFlashSequence = (sequence: number) => {
        if (sequence <= flashCount) {
          timeout = setTimeout(() => {
            setFlashSequence(sequence);
            executeFlashSequence(sequence + 1);
          }, flashSpacing);
        } else {
          // All flashes completed
          setIsFlashing(false);
          if (onFlashComplete) {
            onFlashComplete();
          }
        }
      };
      
      executeFlashSequence(2);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [trigger, flashCount, flashSpacing, onFlashComplete]);
  
  // Variants for the flash animation
  const flashVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: currentIntensity.opacity,
      transition: {
        duration: currentIntensity.duration,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: currentIntensity.duration * 1.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  // Create lens flare pattern for more realism
  const createLensFlare = () => {
    const flareCount = 5;
    const flares = [];
    
    for (let i = 0; i < flareCount; i++) {
      const size = 20 + (i * 15);
      const position = 15 + (i * 12);
      const opacity = 0.5 - (i * 0.1);
      
      flares.push(
        <div 
          key={`flare-${i}`}
          className="absolute rounded-full blur-md"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            top: `${position}%`,
            left: `${position}%`,
            opacity: opacity,
            transform: 'translate(-50%, -50%)'
          }}
        />
      );
    }
    
    return flares;
  };
  
  // Calculate if we should show the current flash in sequence
  const shouldShowFlash = isFlashing && flashSequence > 0;

  return (
    <div className={`relative ${className}`}>
      {/* The actual content */}
      {children}
      
      {/* Flash overlay */}
      <AnimatePresence>
        {shouldShowFlash && (
          <motion.div
            className="absolute inset-0 z-50 overflow-hidden pointer-events-none"
            variants={flashVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key={`flash-${flashSequence}`}
          >
            {/* Flash background */}
            <div className="absolute inset-0" style={{ backgroundColor: color, mixBlendMode: 'screen' }}></div>
            
            {/* Lens flare effects */}
            {intensity !== 'soft' && createLensFlare()}
            
            {/* Center bright spot */}
            <div 
              className="absolute rounded-full blur-lg"
              style={{
                width: '70px',
                height: '70px',
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                top: '30%',
                left: '30%',
                opacity: 0.9,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CameraFlash;