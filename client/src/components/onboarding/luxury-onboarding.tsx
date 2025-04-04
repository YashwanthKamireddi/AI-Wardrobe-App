/**
 * LuxuryOnboarding Component
 * 
 * A high-end onboarding experience with animated welcome sequence
 * that introduces app features with luxurious transitions and visual effects.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldenThread } from "@/components/ui/golden-thread";
import RunwayCurtain from "@/components/ui/runway-curtain";
import { FashionLogo } from "@/components/ui/fashion-logo";
import { Button } from "@/components/ui/button";
import { CloudSunIcon } from "@/components/ui/cloud-sun-icon";

// Animation components for feature illustrations
const WardrobeAnimation = () => (
  <motion.div 
    className="relative h-32 w-32 mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Wardrobe frame */}
    <motion.div 
      className="w-28 h-28 border-4 border-amber-600 dark:border-amber-400 rounded-lg mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hanging clothes */}
      <div className="flex justify-around pt-2">
        {[0, 1, 2].map((i) => (
          <motion.div 
            key={i}
            className="w-6 h-16 bg-gradient-to-b from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800 rounded-md"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + (i * 0.2), duration: 0.5, type: "spring" }}
          >
            {/* Hanger top */}
            <motion.div 
              className="w-4 h-4 border-t-2 border-amber-700 dark:border-amber-300 rounded-t-full mx-auto -mt-3"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.2 + (i * 0.2) }}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Drawer */}
      <motion.div 
        className="w-full h-6 bg-amber-800 dark:bg-amber-700 rounded-b-md absolute bottom-0 left-0 right-0"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        <motion.div 
          className="w-4 h-2 bg-amber-200 dark:bg-amber-300 rounded-full mx-auto mt-2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.div>
    </motion.div>
    
    {/* Floating clothing items entering wardrobe */}
    <motion.div 
      className="absolute top-0 right-0 w-5 h-5 rounded-full bg-pink-400 dark:bg-pink-600"
      initial={{ x: 40, y: -20, opacity: 0 }}
      animate={{ 
        x: 0, 
        y: 0, 
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.8]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        repeatDelay: 1,
        times: [0, 0.3, 0.7, 1]
      }}
    />
    
    <motion.div 
      className="absolute bottom-2 left-0 w-5 h-5 rounded-full bg-blue-400 dark:bg-blue-600"
      initial={{ x: -30, y: 20, opacity: 0 }}
      animate={{ 
        x: 0, 
        y: 0, 
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.8]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        repeatDelay: 1,
        delay: 1.5,
        times: [0, 0.3, 0.7, 1]
      }}
    />
  </motion.div>
);

const OutfitAssemblyAnimation = () => (
  <motion.div 
    className="relative h-32 w-32 mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Outfit items */}
    <motion.div 
      className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-b from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800 rounded-md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    />
    
    <motion.div 
      className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-blue-300 to-blue-500 dark:from-blue-600 dark:to-blue-800 rounded-md"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
    />
    
    {/* Sparkle effects */}
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-amber-200 dark:bg-amber-400"
        style={{
          width: 3 + Math.random() * 3,
          height: 3 + Math.random() * 3,
          left: `${20 + Math.random() * 60}%`,
          top: `${20 + Math.random() * 60}%`,
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
        }}
        transition={{
          duration: 1 + Math.random(),
          repeat: Infinity,
          delay: i * 0.5,
        }}
      />
    ))}
    
    {/* Rotating plus sign indicating assembly */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 font-bold text-2xl"
      animate={{
        rotate: 360,
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
        opacity: { duration: 2, repeat: Infinity, repeatType: "reverse" }
      }}
    >
      +
    </motion.div>
  </motion.div>
);

const WeatherStyleAnimation = () => (
  <motion.div 
    className="relative h-32 w-32 mx-auto flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Weather icon */}
    <motion.div
      className="absolute"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <CloudSunIcon size={32} />
    </motion.div>
    
    {/* Outfit suggestion connected to weather */}
    <motion.div
      className="absolute bottom-0 right-0 w-12 h-16 bg-gradient-to-b from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800 rounded-md"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
    />
    
    {/* Connection line */}
    <motion.div
      className="absolute top-1/2 right-1/4 w-10 h-0.5 bg-amber-400 dark:bg-amber-300"
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      style={{ transformOrigin: "left" }}
    />
    
    {/* Rain drops animation */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-2 bg-blue-400 dark:bg-blue-300 rounded-full"
        style={{
          left: `${30 + (i * 15)}%`,
          top: "40%",
        }}
        animate={{
          y: [0, 15, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.3,
        }}
      />
    ))}
  </motion.div>
);

// Main component props
interface LuxuryOnboardingProps {
  onComplete?: () => void;
}

export function LuxuryOnboarding({ onComplete }: LuxuryOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [curtainOpen, setCurtainOpen] = useState(true);
  
  // Define onboarding steps
  const onboardingSteps = [
    {
      title: "Welcome to Cher's Closet",
      description: "Your personal luxury wardrobe assistant",
      icon: <motion.div className="h-32 flex items-center justify-center">
              <FashionLogo size="xl" />
            </motion.div>,
      animation: "fadeIn"
    },
    {
      title: "Curate Your Collection",
      description: "Upload and organize your fashion pieces with elegant simplicity",
      icon: <WardrobeAnimation />,
      animation: "slideRight"
    },
    {
      title: "Create Stunning Ensembles",
      description: "Mix and match pieces to create perfect outfits for any occasion",
      icon: <OutfitAssemblyAnimation />,
      animation: "slideUp"
    },
    {
      title: "Weather-Aware Styling",
      description: "Get recommendations based on current weather conditions",
      icon: <WeatherStyleAnimation />,
      animation: "fadeScale"
    }
  ];
  
  // Complete onboarding function
  const completeOnboarding = () => {
    // Close curtain first
    setCurtainOpen(false);
    
    // After animation, save to localStorage and call onComplete callback
    setTimeout(() => {
      localStorage.setItem("onboardingComplete", "true");
      if (onComplete) onComplete();
    }, 700);
  };
  
  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Animation variants for step content
  const contentVariants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slideRight: {
      hidden: { x: 50, opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: -50, opacity: 0 }
    },
    slideUp: {
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: -50, opacity: 0 }
    },
    fadeScale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.2 }
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Background with golden gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/95 to-amber-100/98 dark:from-slate-900/95 dark:to-slate-950/98" />
      
      {/* Luxury decorative elements */}
      <RunwayCurtain isOpen={curtainOpen}>
        <div></div>
      </RunwayCurtain>
      <GoldenThread direction="horizontal" length="100%" className="absolute top-4 left-0" />
      <GoldenThread direction="horizontal" length="100%" className="absolute bottom-4 left-0" />
      
      {/* Content container */}
      <motion.div 
        className="relative z-10 w-full max-w-md mx-auto p-8 rounded-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Step indicator dots */}
        <div className="flex justify-center mb-8 space-x-2">
          {onboardingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentStep 
                  ? "bg-amber-600 dark:bg-amber-400" 
                  : "bg-amber-300/50 dark:bg-amber-700/50"
              }`}
              animate={{
                scale: index === currentStep ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: index === currentStep ? Infinity : 0,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
        
        {/* Step content with animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants[onboardingSteps[currentStep].animation as keyof typeof contentVariants]}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-6">
              {onboardingSteps[currentStep].icon}
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-amber-800 dark:text-amber-300">
              {onboardingSteps[currentStep].title}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              {onboardingSteps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
          >
            Previous
          </Button>
          
          {currentStep < onboardingSteps.length - 1 ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              Get Started
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}