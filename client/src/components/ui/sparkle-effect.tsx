import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface SparkleProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  count?: number;
  delay?: number;
  rotateSpeed?: number;
  className?: string;
  triggerOnScroll?: boolean;
  style?: React.CSSProperties;
}

interface Sparkle {
  id: number;
  size: number;
  color: string;
  top: string;
  left: string;
  scale: number;
  rotation: number;
  delay: number;
}

/**
 * SparkleEffect Component
 * 
 * Creates a luxury sparkle animation effect around elements,
 * perfect for highlighting premium items and interactive elements.
 * 
 * @example
 * ```tsx
 * <SparkleEffect color="#FBBF24" triggerOnScroll={true}>
 *   <PremiumContent />
 * </SparkleEffect>
 * ```
 */
const SparkleEffect: React.FC<SparkleProps> = ({
  children,
  color = 'rgba(251, 191, 36, 0.8)',
  size = 8,
  count = 12,
  delay = 2,
  rotateSpeed = 5,
  className = '',
  triggerOnScroll = false,
  style
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [showSparkles, setShowSparkles] = useState(!triggerOnScroll);
  const controls = useAnimation();
  
  // Generate sparkles
  useEffect(() => {
    const newSparkles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * size + size / 2,
      color: color,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360,
      delay: Math.random() * delay
    }));
    
    setSparkles(newSparkles);
  }, [count, size, color, delay]);
  
  // Handle scroll-based animation trigger
  useEffect(() => {
    if (triggerOnScroll) {
      if (isInView && !showSparkles) {
        setShowSparkles(true);
        controls.start("animate");
      } else if (!isInView && showSparkles) {
        controls.start("exit");
        setTimeout(() => setShowSparkles(false), 500);
      }
    }
  }, [isInView, triggerOnScroll, showSparkles, controls]);
  
  // Sparkle shine variant
  const sparkleVariants = {
    initial: {
      opacity: 0,
      scale: 0,
    },
    animate: (delay: number) => ({
      opacity: [0, 0.7, 0.9, 0.6, 0], // More nuanced opacity stages
      scale: [0, 0.7, 1, 0.8, 0], // More nuanced scaling for dimensional feel
      transition: {
        duration: 1.8, // Slightly faster for more frequent sparkles
        delay: delay,
        ease: [0.22, 0.9, 0.36, 1], // Luxury easing curve
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 0.8 // Reduced delay for more frequency
      }
    }),
    exit: {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] } // Improved exit
    }
  };
  
  // Elegant rotation animation
  const rotationVariants = {
    animate: (delay: number) => ({
      rotate: [0, 180, 360], // Add midpoint for non-linear rotation feel
      scale: [1, 1.05, 1], // Subtle pulsing during rotation
      transition: {
        duration: rotateSpeed + (Math.random() * 1.5), // Slightly reduced variability
        ease: "easeInOut", // Smoother, more elegant rotation
        repeat: Infinity,
        delay: delay * 0.4 // Quicker start
      }
    })
  };
  
  // Custom sparkle SVG element
  const SparkleSvg = ({ color, rotate }: { color: string, rotate: number }) => (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <motion.path
        d="M12 0L13.2 10.8L24 12L13.2 13.2L12 24L10.8 13.2L0 12L10.8 10.8L12 0Z"
        fill={color}
        variants={rotationVariants}
        animate="animate"
        custom={Math.random()}
      />
    </motion.svg>
  );
  
  return (
    <div ref={ref} className={`relative ${className}`} style={style}>
      {/* Sparkles layer */}
      {showSparkles && sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            zIndex: 20
          }}
          initial="initial"
          animate={controls}
          variants={sparkleVariants}
          custom={sparkle.delay}
        >
          <SparkleSvg color={sparkle.color} rotate={sparkle.rotation} />
        </motion.div>
      ))}
      
      {/* Children with subtle shine effect */}
      <div className="relative">
        {children}
        
        {/* Enhanced luxurious glow effect */}
        {showSparkles && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.05, 0.07, 0.03, 0], // More subtle, nuanced glow
              scale: [0.97, 1, 1.02, 1, 0.97], // Subtle breathing effect
              transition: { 
                duration: 3.2, 
                repeat: Infinity,
                ease: "easeInOut" 
              } 
            }}
            style={{ 
              background: `radial-gradient(circle at center, ${color} 0%, rgba(251, 191, 36, 0.1) 35%, transparent 75%)`,
              mixBlendMode: 'screen',
              filter: 'blur(4px)' // Softer edge for more refined look
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SparkleEffect;