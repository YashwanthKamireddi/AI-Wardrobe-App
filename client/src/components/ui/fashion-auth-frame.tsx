import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useLocation } from 'wouter';
import GoldenThread from './golden-thread';
import SparkleEffect from './sparkle-effect';
import LuxuryFeatureGuide from './luxury-feature-guide';

interface FashionAuthFrameProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  brandName?: string;
  logoImage?: string;
  backgroundType?: 'monogram' | 'pattern' | 'gradient' | 'minimal';
  accentColor?: string;
  className?: string;
}

/**
 * FashionAuthFrame Component
 * 
 * A designer-inspired auth page frame with luxury animations and styling.
 * Creates a couture experience for login, registration and other auth pages.
 * 
 * @example
 * ```tsx
 * <FashionAuthFrame title="Welcome Back" subtitle="Sign in to your wardrobe">
 *   <LoginForm />
 * </FashionAuthFrame>
 * ```
 */
const FashionAuthFrame: React.FC<FashionAuthFrameProps> = ({
  children,
  title = "Cher's Closet",
  subtitle = "Where fashion meets technology",
  brandName = "CC",
  logoImage,
  backgroundType = 'minimal',
  accentColor = 'rgba(251, 191, 36, 0.8)',
  className = ''
}) => {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowAnimations(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Determine if we're on login or register page
  const isLoginPage = location.includes('/login') || location === '/';
  const isRegisterPage = location.includes('/register') || location.includes('/signup');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };
  
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.17, 0.67, 0.83, 0.67]
      }
    }
  };
  
  const childrenVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.17, 0.67, 0.83, 0.67],
        delay: 0.4
      }
    }
  };
  
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.9,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  };
  
  // Mouse position for parallax effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse movement for parallax effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    }
  };
  
  // Spring animation for smooth movement
  const springX = useSpring(mouseX, { stiffness: 30, damping: 30 }); // More refined movement
  const springY = useSpring(mouseY, { stiffness: 30, damping: 30 });
  
  // Transform values for parallax effect
  const bgX = useTransform(springX, [0, 1], ['-3%', '3%']); // Subtler movement
  const bgY = useTransform(springY, [0, 1], ['-3%', '3%']);
  const glowX = useTransform(springX, [0, 1], ['-5%', '5%']);
  const glowY = useTransform(springY, [0, 1], ['-5%', '5%']);
  
  // Background pattern based on selectedType
  const renderBackground = () => {
    switch (backgroundType) {
      case 'minimal':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Subtle gradient background */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-amber-50/5 via-transparent to-amber-100/5 dark:from-amber-900/10 dark:via-transparent dark:to-amber-800/5"
              style={{ x: bgX, y: bgY }}
            />
            
            {/* Minimalist dot pattern */}
            <motion.div 
              className="absolute inset-0" 
              style={{ 
                backgroundImage: `radial-gradient(${accentColor}10 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                x: bgX, 
                y: bgY,
                opacity: 0.3
              }}
            />
            
            {/* Subtle light accents */}
            <motion.div 
              className="absolute right-0 top-0 w-1/3 h-1/2 bg-gradient-to-b from-amber-200/5 to-transparent rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [1, 1.03, 1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{ x: glowX, y: glowY }}
            />
            
            <motion.div 
              className="absolute left-0 bottom-0 w-1/3 h-1/2 bg-gradient-to-t from-amber-200/5 to-transparent rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 2
              }}
              style={{ x: glowX, y: glowY }}
            />
          </div>
        );
        
      case 'monogram':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.05]"> {/* Even more subtle */}
            <motion.div 
              className="absolute inset-0 flex flex-wrap items-center justify-center"
              style={{ x: bgX, y: bgY }}
              animate={{ 
                scale: [1, 1.01, 1], // Subtler animation
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut" 
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => ( // Fewer elements
                <motion.div 
                  key={i} 
                  className="text-[100px] font-serif rotate-[10deg] m-16" // Larger spacing, smaller text
                  style={{ 
                    color: accentColor,
                    opacity: 0.6
                  }}
                  animate={{ 
                    opacity: [0.4, 0.6, 0.4],
                    rotate: [10, 10.5, 10], // Subtler rotation
                    scale: [1, 1.005, 1]
                  }}
                  transition={{ 
                    duration: 8 + Math.random() * 4, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                >
                  {brandName}
                </motion.div>
              ))}
            </motion.div>
            
            {/* Floating gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-amber-50/3 to-amber-100/3 dark:from-amber-900/3 dark:to-amber-950/3" 
              style={{ x: glowX, y: glowY }}
            />
          </div>
        );
        
      case 'pattern':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.03]"> {/* More subtle */}
            <motion.div 
              className="w-full h-full" 
              style={{ 
                backgroundImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 0.5px, transparent 0.5px, transparent 20px)`, // Thinner lines, larger spacing
                backgroundSize: '40px 40px',
                x: bgX,
                y: bgY
              }}
              animate={{
                backgroundPosition: ['0px 0px', '40px 40px', '0px 0px']
              }}
              transition={{
                duration: 30, // Slower animation
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        );
        
      case 'gradient':
      default:
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div 
              className="w-full h-full bg-gradient-to-br from-amber-50/20 to-amber-100/20 dark:from-amber-900/10 dark:to-amber-950/5" // More subtle gradients
              style={{ x: bgX, y: bgY }}
            />
            <motion.div 
              className="absolute right-0 top-0 w-1/3 h-1/2 bg-gradient-to-b from-amber-200/5 to-transparent rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [1, 1.03, 1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{ x: glowX, y: glowY }}
            />
          </div>
        );
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`h-screen w-full flex flex-col md:flex-row items-center justify-center py-4 px-4 sm:px-6 lg:px-8 bg-luxury relative overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={mounted ? "visible" : "hidden"}
    >
      {/* Background design elements */}
      {renderBackground()}
      
      {/* Minimal decorative elements with golden thread */}
      {showAnimations && (
        <>
          {/* Subtle horizontal thread */}
          <div className="absolute top-12 left-0 w-full h-6 opacity-40">
            <GoldenThread 
              pathType="wave" 
              thickness={0.5} // Thinner line
              color={accentColor}
              duration={3}
            />
          </div>
          
          {/* Subtle bottom thread */}
          <div className="absolute bottom-12 left-0 w-full h-6 opacity-40">
            <GoldenThread 
              pathType="stitch" 
              thickness={0.5} // Thinner line
              color={accentColor}
              duration={3}
              delay={0.5}
            />
          </div>
          
          {/* Minimalist corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16">
            <div className="absolute top-6 left-6 w-14 h-14 border-t border-l rounded-tl-lg opacity-30" style={{ borderColor: accentColor }} />
          </div>
          
          <div className="absolute bottom-0 right-0 w-16 h-16">
            <div className="absolute bottom-6 right-6 w-14 h-14 border-b border-r rounded-br-lg opacity-30" style={{ borderColor: accentColor }} />
          </div>
        </>
      )}
      
      {/* Main content container */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-16 relative z-10"> {/* Increased gap */}
        {/* Left side: Logo and feature guide (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center md:items-start relative">
          {/* Logo area */}
          <motion.div 
            className="mb-10" // Increased spacing
            variants={logoVariants}
          >
            {logoImage ? (
              <img 
                src={logoImage} 
                alt={brandName} 
                className="h-20 w-auto mx-auto" // Slightly smaller
              />
            ) : (
              <SparkleEffect size={4} count={6} className="py-3"> {/* Fewer, smaller sparkles */}
                <div className="h-20 w-20 flex items-center justify-center rounded-full border font-serif text-3xl font-light text-luxury-gold tracking-wider"
                  style={{ borderColor: `${accentColor}60` }} // More transparent border
                >
                  {brandName}
                </div>
              </SparkleEffect>
            )}
          </motion.div>
          
          {/* Feature guide component - more minimal */}
          <div className="mt-10 pl-4 border-l" style={{ borderColor: `${accentColor}20` }}> {/* Thinner border, more transparent */}
            <LuxuryFeatureGuide animationDelay={1.2} />
          </div>
        </div>
        
        {/* Right side: Auth form */}
        <div className="max-w-md w-full flex flex-col items-center"> {/* Narrower width */}
          {/* Logo area (only shown on mobile) */}
          <motion.div 
            className="mb-10 md:hidden" // Increased spacing
            variants={logoVariants}
          >
            {logoImage ? (
              <img 
                src={logoImage} 
                alt={brandName} 
                className="h-16 w-auto mx-auto" // Smaller
              />
            ) : (
              <SparkleEffect size={3} count={6} className="py-2"> {/* Fewer, smaller sparkles */}
                <div className="h-16 w-16 flex items-center justify-center rounded-full border font-serif text-2xl font-light text-luxury-gold tracking-wider"
                  style={{ borderColor: `${accentColor}60` }} // More transparent border
                >
                  {brandName}
                </div>
              </SparkleEffect>
            )}
          </motion.div>
          
          {/* Title area - more minimal */}
          <motion.div 
            className="mb-8 text-center" // Increased spacing
            variants={titleVariants}
          >
            <h1 className="text-2xl font-luxury-heading mb-2 text-luxury-brown tracking-wider font-light"> {/* Thinner font, wider tracking */}
              {title}
            </h1>
            <p className="text-xs text-luxury-brown/60 font-luxury-body tracking-widest uppercase"> {/* Smaller, uppercase, wider tracking */}
              {subtitle}
            </p>
          </motion.div>
          
          {/* Content area with minimalist card styling */}
          <motion.div 
            className="w-full"
            variants={childrenVariants}
          >
            <div className="relative">
              {/* Subtle ambient glow */}
              <motion.div 
                className="absolute -inset-6 bg-gradient-radial from-amber-300/5 to-transparent rounded-3xl opacity-0"
                animate={{
                  opacity: [0, 0.2, 0], // Subtler glow
                  scale: [0.98, 1.02, 0.98]
                }}
                transition={{
                  duration: 8, // Slower animation
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Modernized minimal card design */}
              <div className="backdrop-blur-sm relative overflow-hidden rounded-xl border border-amber-200/10 dark:border-amber-700/10"> {/* Thinner border */}
                {/* Almost invisible edge highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent dark:from-white/3 dark:to-transparent" />
                
                {/* Minimal content container */}
                <div className="p-8 relative bg-white/5 dark:bg-black/5"> {/* Subtle background */}
                  {/* Subtle shimmer effect - single line */}
                  <div className="absolute top-0 right-0 left-0 overflow-hidden">
                    <motion.div
                      className="h-[0.5px] w-1/3 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" // Thinner line
                      animate={{
                        x: ['-100%', '400%'],
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 5 // Longer delay between animations
                      }}
                    />
                  </div>
                  
                  {/* Auth form content */}
                  <div className="relative">
                    {children}
                  </div>
                  
                  {/* Minimalist bottom accent */}
                  <div className="mt-10 flex justify-center">
                    <div className="w-8 h-[0.5px] bg-amber-300/20 rounded relative overflow-hidden"> {/* Thinner, shorter, more transparent */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
                        animate={{
                          x: ['-200%', '200%'],
                        }}
                        transition={{
                          duration: 3,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 4 // Longer delay
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FashionAuthFrame;