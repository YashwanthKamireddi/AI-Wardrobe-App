import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GoldenThreadProps {
  pathType?: 'stitch' | 'wave' | 'zigzag' | 'spiral' | 'custom';
  customPath?: string;
  duration?: number;
  thickness?: number;
  color?: string;
  className?: string;
  onComplete?: () => void;
  repeat?: boolean | number;
  delay?: number;
  startPosition?: { x: number | string, y: number | string };
  endPosition?: { x: number | string, y: number | string };
}

/**
 * GoldenThread Component
 * 
 * Creates an animated golden thread that stitches across the screen in different
 * patterns, ideal for page transitions and section dividers.
 * 
 * @example
 * ```tsx
 * <GoldenThread pathType="stitch" duration={2} />
 * ```
 */
const GoldenThread: React.FC<GoldenThreadProps> = ({
  pathType = 'stitch',
  customPath,
  duration = 2.5,
  thickness = 2,
  color = 'rgba(251, 191, 36, 0.8)',
  className = '',
  onComplete,
  repeat = false,
  delay = 0,
  startPosition = { x: '0%', y: '50%' },
  endPosition = { x: '100%', y: '50%' },
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  
  // Generate path based on type
  const generatePath = (): string => {
    if (customPath) return customPath;
    
    // Convert position to values usable in SVG path
    const startX = typeof startPosition.x === 'string' ? startPosition.x : `${startPosition.x}px`;
    const startY = typeof startPosition.y === 'string' ? startPosition.y : `${startPosition.y}px`;
    const endX = typeof endPosition.x === 'string' ? endPosition.x : `${endPosition.x}px`;
    const endY = typeof endPosition.y === 'string' ? endPosition.y : `${endPosition.y}px`;
    
    // Check if we're using percentages - scale appropriately if so
    const startXVal = startX.includes('%') ? parseInt(startX) / 100 * 1000 : parseInt(startX);
    const startYVal = startY.includes('%') ? parseInt(startY) / 100 * 300 : parseInt(startY);
    const endXVal = endX.includes('%') ? parseInt(endX) / 100 * 1000 : parseInt(endX);
    const endYVal = endY.includes('%') ? parseInt(endY) / 100 * 300 : parseInt(endY);
    
    switch (pathType) {
      case 'stitch':
        // Create a stitched pattern
        const stitchCount = 20;
        const stitchLength = (endXVal - startXVal) / stitchCount;
        const stitchHeight = 10;
        
        let stitchPath = `M ${startXVal} ${startYVal} `;
        
        for (let i = 0; i < stitchCount; i++) {
          const x1 = startXVal + (i * stitchLength);
          const x2 = startXVal + ((i + 1) * stitchLength);
          const y1 = startYVal;
          const y2 = i % 2 === 0 ? startYVal - stitchHeight : startYVal + stitchHeight;
          
          stitchPath += `L ${x1} ${y1} Q ${(x1 + x2) / 2} ${y2}, ${x2} ${y1} `;
        }
        
        return stitchPath;
        
      case 'wave':
        // Create a wavy pattern
        return `M ${startXVal} ${startYVal} 
                C ${startXVal + 100} ${startYVal - 50}, 
                  ${startXVal + 200} ${startYVal + 50}, 
                  ${startXVal + 300} ${startYVal - 30} 
                C ${startXVal + 400} ${startYVal - 80}, 
                  ${startXVal + 500} ${startYVal + 50}, 
                  ${startXVal + 600} ${startYVal - 20}
                C ${startXVal + 700} ${startYVal - 70}, 
                  ${startXVal + 800} ${startYVal + 40},
                  ${endXVal} ${endYVal}`;
                  
      case 'zigzag':
        // Create a zigzag pattern
        const zigZagCount = 10;
        const zigZagLength = (endXVal - startXVal) / zigZagCount;
        const zigZagHeight = 20;
        
        let zigZagPath = `M ${startXVal} ${startYVal} `;
        
        for (let i = 1; i <= zigZagCount; i++) {
          const x = startXVal + (i * zigZagLength);
          const y = i % 2 === 0 ? startYVal : startYVal + zigZagHeight;
          
          zigZagPath += `L ${x} ${y} `;
        }
        
        return zigZagPath;
        
      case 'spiral':
        // Create a spiral pattern
        const centerX = (startXVal + endXVal) / 2;
        const centerY = (startYVal + endYVal) / 2;
        const spiralRadius = Math.min(Math.abs(endXVal - startXVal), Math.abs(endYVal - startYVal)) / 3;
        
        let spiralPath = `M ${centerX} ${centerY - spiralRadius} `;
        
        for (let angle = 0; angle <= 1080; angle += 30) {
          const radius = spiralRadius * (1 - angle / 1080);
          const x = centerX + radius * Math.cos(angle * Math.PI / 180);
          const y = centerY + radius * Math.sin(angle * Math.PI / 180);
          
          spiralPath += `L ${x} ${y} `;
        }
        
        return spiralPath;
        
      default:
        // Simple line
        return `M ${startXVal} ${startYVal} L ${endXVal} ${endYVal}`;
    }
  };
  
  // Calculate the path length for animation
  useEffect(() => {
    const path = pathRef.current;
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    }
  }, [pathType, customPath]);
  
  // Prepare animation variants
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: duration,
          ease: "easeInOut",
          delay: delay
        },
        opacity: {
          duration: Math.min(0.5, duration / 3),
          ease: "easeIn",
          delay: delay
        }
      }
    }
  };
  
  // Get repeat type for Framer Motion
  const getRepeatType = () => {
    if (repeat === true) return Infinity;
    if (typeof repeat === 'number') return repeat;
    return 0;
  };
  
  // Use inline path generation - doesn't change after mounting
  const path = generatePath();
  
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        className="w-full absolute"
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        style={{ top: 0, left: 0, height: '100%', pointerEvents: 'none' }}
      >
        <motion.path
          ref={pathRef}
          d={path}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          initial="hidden"
          animate="visible"
          variants={pathVariants}
          onAnimationComplete={() => onComplete && onComplete()}
          custom={delay}
          // Handle repeat
          transition={{
            pathLength: {
              duration: duration,
              ease: "easeInOut",
              delay: delay,
              repeat: getRepeatType(),
              repeatType: "loop",
              repeatDelay: 0.5
            },
            opacity: {
              duration: Math.min(0.5, duration / 3),
              ease: "easeIn",
              delay: delay
            }
          }}
        />
        
        {/* Add a subtle shadow/glow effect */}
        <motion.path
          d={path}
          stroke={color}
          strokeWidth={thickness + 2}
          strokeLinecap="round"
          strokeOpacity={0.15}
          fill="none"
          initial="hidden"
          animate="visible"
          variants={pathVariants}
          filter="blur(3px)"
          custom={delay}
          transition={{
            pathLength: {
              duration: duration,
              ease: "easeInOut",
              delay: delay,
              repeat: getRepeatType(),
              repeatType: "loop",
              repeatDelay: 0.5
            },
            opacity: {
              duration: Math.min(0.5, duration / 3),
              ease: "easeIn",
              delay: delay
            }
          }}
        />
      </svg>
    </div>
  );
};

export default GoldenThread;