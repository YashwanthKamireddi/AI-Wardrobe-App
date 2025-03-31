import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  backgroundType?: 'monogram' | 'pattern' | 'gradient';
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
  backgroundType = 'monogram',
  accentColor = 'rgba(251, 191, 36, 0.9)',
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
  
  // Background pattern based on selectedType
  const renderBackground = () => {
    switch (backgroundType) {
      case 'monogram':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="text-[120px] font-serif opacity-70 rotate-[15deg] m-12"
                  style={{ color: accentColor }}
                >
                  {brandName}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'pattern':
        return (
          <div className="absolute inset-0 z-0 overflow-hidden opacity-5">
            <div className="w-full h-full" 
              style={{ 
                backgroundImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 1px, transparent 1px, transparent 15px)`,
                backgroundSize: '30px 30px'
              }} 
            />
          </div>
        );
        
      case 'gradient':
      default:
        return (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-amber-50/30 to-amber-100/40 dark:from-amber-900/20 dark:to-amber-950/10" />
            <div className="absolute right-0 top-0 w-1/2 h-3/4 bg-gradient-to-b from-amber-200/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          </div>
        );
    }
  };

  return (
    <motion.div 
      className={`min-h-screen w-full flex flex-col md:flex-row items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-luxury relative overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={mounted ? "visible" : "hidden"}
    >
      {/* Background design elements */}
      {renderBackground()}
      
      {/* Decorative line elements with golden thread */}
      {showAnimations && (
        <>
          <div className="absolute top-10 left-0 w-full h-10">
            <GoldenThread 
              pathType="wave" 
              thickness={1.5} 
              color={accentColor}
              duration={3}
            />
          </div>
          
          <div className="absolute bottom-10 left-0 w-full h-10">
            <GoldenThread 
              pathType="stitch" 
              thickness={1.5} 
              color={accentColor}
              duration={3}
              delay={0.5}
            />
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20">
            <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 rounded-tl-lg opacity-50" style={{ borderColor: accentColor }} />
          </div>
          
          <div className="absolute bottom-0 right-0 w-20 h-20">
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 rounded-br-lg opacity-50" style={{ borderColor: accentColor }} />
          </div>
        </>
      )}
      
      {/* Main content container */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
        {/* Left side: Logo and feature guide (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center md:items-start relative">
          {/* Logo area */}
          <motion.div 
            className="mb-8"
            variants={logoVariants}
          >
            {logoImage ? (
              <img 
                src={logoImage} 
                alt={brandName} 
                className="h-24 w-auto mx-auto"
              />
            ) : (
              <SparkleEffect size={5} count={8} className="py-2">
                <div className="h-24 w-24 flex items-center justify-center rounded-full border-2 font-serif text-4xl font-bold text-luxury-gold"
                  style={{ borderColor: accentColor }}
                >
                  {brandName}
                </div>
              </SparkleEffect>
            )}
          </motion.div>
          
          {/* Feature guide component */}
          <div className="mt-8 pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
            <LuxuryFeatureGuide animationDelay={1.2} />
          </div>
        </div>
        
        {/* Right side: Auth form */}
        <div className="max-w-lg w-full flex flex-col items-center">
          {/* Logo area (only shown on mobile) */}
          <motion.div 
            className="mb-8 md:hidden"
            variants={logoVariants}
          >
            {logoImage ? (
              <img 
                src={logoImage} 
                alt={brandName} 
                className="h-20 w-auto mx-auto"
              />
            ) : (
              <SparkleEffect size={5} count={8} className="py-2">
                <div className="h-20 w-20 flex items-center justify-center rounded-full border-2 font-serif text-3xl font-bold text-luxury-gold"
                  style={{ borderColor: accentColor }}
                >
                  {brandName}
                </div>
              </SparkleEffect>
            )}
          </motion.div>
          
          {/* Title area */}
          <motion.div 
            className="mb-6 text-center"
            variants={titleVariants}
          >
            <h1 className="text-3xl font-luxury-heading mb-2 text-luxury-brown tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-luxury-brown/70 font-luxury-body">
              {subtitle}
            </p>
          </motion.div>
          
          {/* Content area with card styling */}
          <motion.div 
            className="w-full"
            variants={childrenVariants}
          >
            <div className="luxury-card p-8 shadow-md">
              {/* Login/Register animated indicator */}
              <div className="relative overflow-hidden mb-6 h-0.5 bg-amber-100/30 dark:bg-amber-900/30">
                <AnimatePresence>
                  <motion.div 
                    key={isLoginPage ? 'login' : 'register'}
                    className="absolute h-0.5 w-1/2"
                    style={{ backgroundColor: accentColor }}
                    initial={{ x: isLoginPage ? '-100%' : '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: isLoginPage ? '100%' : '-100%' }}
                    transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  />
                </AnimatePresence>
                
                <div className="flex justify-center gap-1 absolute top-4 left-0 right-0 text-xs font-medium">
                  <div className={`px-4 py-1 rounded-full ${isLoginPage ? 'text-luxury-gold' : 'text-luxury-brown/60'}`}>
                    Sign In
                  </div>
                  <div className={`px-4 py-1 rounded-full ${isRegisterPage ? 'text-luxury-gold' : 'text-luxury-brown/60'}`}>
                    Register
                  </div>
                </div>
              </div>
              
              {/* Auth form content */}
              <div className="pt-6">
                {children}
              </div>
              
              {/* Bottom decorative accent */}
              <div className="mt-10 flex justify-center">
                <div className="w-16 h-0.5 rounded relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    style={{ backgroundColor: accentColor }}
                    animate={{ 
                      x: ['0%', '100%', '0%'],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Footer text */}
            <div className="text-center mt-6">
              <p className="text-xs text-luxury-brown/60 font-luxury-body tracking-wide">
                &copy; {new Date().getFullYear()} Cher's Closet. All couture rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FashionAuthFrame;