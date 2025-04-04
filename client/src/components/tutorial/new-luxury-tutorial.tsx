/**
 * LuxuryTutorial Component (Version 2.0)
 * 
 * A Google-inspired premium tutorial experience with immersive animations and intelligent
 * guidance that adapts to the application state. Features elegant transitions and
 * high-end visual effects creating a sophisticated onboarding journey.
 * 
 * Key Features:
 * - Fully guided modal-based tutorial (no DOM element targeting)
 * - Interactive illustrations and animations
 * - Gold/amber luxury theme with premium visual effects
 * - Mobile-responsive design
 * - Discrete progress tracking
 * - Animated transitions between steps
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoldenParticleEffect } from "@/components/ui/golden-particle-effect";
import { CameraFlash } from "@/components/ui/camera-flash";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  highlightText?: string;
}

interface LuxuryTutorialProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function LuxuryTutorial({ isActive, onComplete, onSkip }: LuxuryTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCameraFlash, setShowCameraFlash] = useState(false);
  
  // Reset flash effect when step changes
  useEffect(() => {
    setShowCameraFlash(false);
  }, [currentStep]);
  
  // Define tutorial steps with rich visuals and animations
  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to Cher's Closet",
      description: "Your premium fashion management and style assistant. Let's explore what makes this experience special.",
      highlightText: "Luxury at your fingertips",
      illustration: (
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="2" 
                animate={{ strokeDasharray: ["0, 283", "283, 0"] }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
              <motion.path
                d="M30,65 L50,30 L70,65 Z" 
                fill="none" 
                stroke="url(#logoGradient)" 
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
              />
              <motion.path
                d="M35,50 L65,50" 
                fill="none" 
                stroke="url(#logoGradient)" 
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
              />
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 text-amber-600 dark:text-amber-400 font-luxury-heading text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            CHER'S CLOSET
          </motion.div>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-10 left-10 w-20 h-1 bg-amber-300/50 dark:bg-amber-500/30" 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-1 h-20 bg-amber-300/50 dark:bg-amber-500/30" 
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.5, delay: 0.7 }}
          />
        </div>
      )
    },
    {
      id: "wardrobe",
      title: "Your Digital Wardrobe",
      description: "Organize all your fashion items in one luxurious digital closet. Add, edit, and categorize your collection with ease.",
      highlightText: "Organize with elegance",
      illustration: (
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          <motion.div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-20 h-24 bg-gradient-to-br from-amber-200/80 to-amber-300/50 dark:from-amber-700/40 dark:to-amber-600/20 rounded-md border border-amber-300/50 dark:border-amber-600/30 shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)" }}
                >
                  <div className="h-3/4 w-full bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-800/30 dark:to-amber-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-500/70 dark:text-amber-400/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                    </svg>
                  </div>
                  <div className="h-1/4 w-full flex items-center justify-center">
                    <motion.div 
                      className="w-10 h-1 bg-amber-400/60 dark:bg-amber-500/40 rounded-full" 
                      animate={{ width: ["10px", "16px", "10px"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Animated indicator */}
          <motion.div
            className="absolute bottom-4 right-4 bg-amber-400/20 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-medium"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            24 items
          </motion.div>
        </div>
      )
    },
    {
      id: "outfits",
      title: "Curate Perfect Ensembles",
      description: "Create stunning outfit combinations from your wardrobe items. Save your favorite looks for any occasion.",
      highlightText: "Fashion curation simplified",
      illustration: (
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          {/* Center outfit preview */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-48 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-lg border border-amber-200 dark:border-amber-700/50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {/* Outfit title */}
            <div className="absolute top-2 left-0 right-0 text-center text-xs text-amber-800 dark:text-amber-300 font-medium">Summer Casual</div>
            
            {/* Outfit items */}
            <div className="absolute top-8 left-0 right-0 bottom-0 flex flex-col items-center justify-center space-y-2 p-2">
              {["Top", "Bottom", "Shoes"].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="w-full h-8 bg-amber-100 dark:bg-amber-800/30 rounded flex items-center px-2 border border-amber-200 dark:border-amber-700/30"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.2) }}
                >
                  <div className="w-4 h-4 rounded-full bg-amber-300 dark:bg-amber-600 mr-2"></div>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Wardrobe items to choose from */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div 
                key={i} 
                className="w-12 h-12 bg-amber-200/70 dark:bg-amber-700/30 rounded flex items-center justify-center border border-amber-300/80 dark:border-amber-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <motion.div 
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400/80 to-amber-500/60 dark:from-amber-500/60 dark:to-amber-600/40"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Animated arrow indicating drag movement */}
          <motion.div
            className="absolute top-1/4 right-1/3"
            animate={{ 
              x: [0, 20, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,10 L35,10 M25,2 L35,10 L25,18" stroke="rgba(217, 119, 6, 0.6)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>
      )
    },
    {
      id: "weather",
      title: "Weather-Optimized Style",
      description: "Get outfit recommendations based on current weather conditions. Never be unprepared for rain, sun, or cold.",
      highlightText: "Climate-conscious fashion",
      illustration: (
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full p-4">
            {/* Weather card */}
            <motion.div 
              className="bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md border border-amber-200 dark:border-amber-700/50 p-4 w-64"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <motion.div 
                    className="text-sm font-medium text-amber-800 dark:text-amber-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    New York City
                  </motion.div>
                  <motion.div 
                    className="text-xs text-amber-600/70 dark:text-amber-400/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Tuesday, 10:30 AM
                  </motion.div>
                </div>
                
                <motion.div 
                  className="text-amber-600 dark:text-amber-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <g className="opacity-70">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                        <line 
                          key={angle} 
                          x1="12" 
                          y1="12" 
                          x2="12" 
                          y2={angle % 90 === 0 ? 4 : 6} 
                          stroke="currentColor" 
                          strokeWidth="1" 
                          strokeLinecap="round"
                          transform={`rotate(${angle} 12 12)`}
                        />
                      ))}
                    </g>
                  </svg>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex justify-between items-end mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <div className="text-2xl font-semibold text-amber-800 dark:text-amber-300">24°C</div>
                <div className="text-sm text-amber-600/70 dark:text-amber-400/70">Sunny</div>
              </motion.div>
              
              <motion.div 
                className="bg-amber-100/50 dark:bg-amber-800/20 rounded-md p-2 text-xs text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <div className="font-medium mb-1">Today's Style Recommendation:</div>
                <div>Light, breathable clothing is best. Consider a light cotton top with slim trousers.</div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Animated weather indicators */}
          <motion.div 
            className="absolute top-4 right-4 text-amber-400 opacity-30 dark:opacity-20"
            animate={{ rotate: 10, scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          >
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a8 8 0 008 8 8 8 0 01-8 8 8 8 0 01-8-8 8 8 0 018-8z" />
            </svg>
          </motion.div>
          
          <motion.div 
            className="absolute top-10 left-10 text-amber-400 opacity-20 dark:opacity-10"
            animate={{ y: [-5, 5, -5], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          >
            <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a8 8 0 000 16 8 8 0 000-16z" />
            </svg>
          </motion.div>
        </div>
      )
    },
    {
      id: "ai-stylist",
      title: "AI Personal Stylist",
      description: "Receive personalized outfit ideas from our AI stylist based on your mood, weather, and personal style preferences.",
      highlightText: "Fashion intelligence at your service",
      illustration: (
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="bg-white/80 dark:bg-slate-800/80 shadow-lg rounded-lg border border-amber-200 dark:border-amber-700/50 p-4 w-64"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center mb-3">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white mr-2"
                  animate={{ 
                    boxShadow: ["0 0 0 rgba(217, 119, 6, 0.4)", "0 0 10px rgba(217, 119, 6, 0.7)", "0 0 0 rgba(217, 119, 6, 0.4)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                  </svg>
                </motion.div>
                <div>
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-300">AI Stylist</div>
                  <div className="text-xs text-amber-600/70 dark:text-amber-400/70">Analyzing your style...</div>
                </div>
              </div>
              
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {/* Typing indicator animation */}
                <motion.div 
                  className="flex items-center space-x-1 ml-2 mb-3"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.7, delay: 2, repeatType: "reverse" }}
                >
                  {[1, 2, 3].map((dot) => (
                    <motion.div 
                      key={dot}
                      className="w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: dot * 0.1 }}
                    />
                  ))}
                </motion.div>
                
                {/* AI response */}
                <motion.div 
                  className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-700/30 text-sm text-amber-800 dark:text-amber-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                >
                  For your confident mood today, I recommend the "Executive Elegance" outfit with your navy blazer and cream silk blouse.
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-4 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                <div className="text-xs py-1 px-3 bg-amber-400/20 dark:bg-amber-700/20 text-amber-700 dark:text-amber-300 rounded-full">
                  98% match with your style profile
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Background decorative elements */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-300/20 to-transparent dark:from-amber-600/10"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          />
          
          <motion.div
            className="absolute top-4 right-4 opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="1 8" />
            </svg>
          </motion.div>
        </div>
      )
    }
  ];
  
  // Navigate to the next step
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setShowCameraFlash(true);
      
      // Delay the step change to complete animation
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
    } else {
      // Final celebration
      setShowCameraFlash(true);
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  };
  
  // Go back to the previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // If tutorial is not active, don't render anything
  if (!isActive) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Luxury dark overlay with blur */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
        {/* Camera flash effect */}
        <CameraFlash 
          trigger={showCameraFlash}
          intensity="medium"
          color="white"
          className="absolute inset-0 z-10"
        />
        
        {/* Tutorial card with content */}
        <motion.div 
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/30 dark:border-amber-500/30 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/30 dark:border-amber-500/30 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/30 dark:border-amber-500/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/30 dark:border-amber-500/30 rounded-br-xl" />
          
          {/* Progress indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-100 dark:bg-amber-900/50">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700"
              initial={{ width: `${(currentStep / tutorialSteps.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Main content */}
          <div className="p-6 sm:p-8">
            {/* Header with step indicators */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {tutorialSteps.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStep 
                          ? "w-6 bg-amber-500 dark:bg-amber-400" 
                          : idx < currentStep 
                            ? "w-3 bg-amber-400/70 dark:bg-amber-500/70" 
                            : "w-1.5 bg-amber-200/50 dark:bg-amber-600/50"
                      }`}
                      animate={idx === currentStep ? { 
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-amber-700/70 dark:text-amber-300/70 font-medium ml-2">
                  {currentStep + 1} of {tutorialSteps.length}
                </span>
              </div>
              
              <button 
                onClick={onSkip} 
                className="text-amber-700/60 dark:text-amber-300/60 hover:text-amber-600 dark:hover:text-amber-200 text-sm transition-colors"
              >
                Skip
              </button>
            </div>
            
            {/* Tutorial content with animations */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tutorialSteps[currentStep].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Illustration */}
                <div className="relative">
                  {tutorialSteps[currentStep].illustration}
                  
                  {/* Golden particle effect overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <GoldenParticleEffect particleCount={20} intensity={0.8} />
                  </div>
                  
                  {/* Highlight text overlay */}
                  {tutorialSteps[currentStep].highlightText && (
                    <motion.div 
                      className="absolute bottom-3 left-3 right-3 text-center bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white text-sm py-1.5 px-4 rounded-md opacity-90"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.9, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      {tutorialSteps[currentStep].highlightText}
                    </motion.div>
                  )}
                </div>
                
                {/* Title and description */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-300 tracking-wide font-luxury-heading">
                    {tutorialSteps[currentStep].title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {tutorialSteps[currentStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 0}
                className={`border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 ${
                  currentStep === 0 ? 'opacity-0' : 'opacity-100'
                }`}
              >
                Previous
              </Button>
              
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-500 dark:to-amber-700 hover:opacity-90 text-white px-8"
              >
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LuxuryTutorial;