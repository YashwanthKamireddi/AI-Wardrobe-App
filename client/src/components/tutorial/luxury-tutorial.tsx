/**
 * LuxuryTutorial Component
 * 
 * An interactive tutorial with elegant golden animations that guides users 
 * through the application features with sophisticated visual indicators.
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoldenParticleEffect } from "@/components/ui/golden-particle-effect";

// Types for tutorial steps
interface TutorialStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: "top" | "right" | "bottom" | "left";
}

interface LuxuryTutorialProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function LuxuryTutorial({ isActive, onComplete, onSkip }: LuxuryTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  
  // Define the tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      target: ".wardrobe-section",
      title: "Your Collection",
      description: "Browse and manage your wardrobe items with ease",
      position: "bottom"
    },
    {
      target: ".outfit-builder",
      title: "Outfit Creation",
      description: "Drag and drop items to create perfect ensembles",
      position: "right"
    },
    {
      target: ".weather-display",
      title: "Weather Integration",
      description: "Get outfit recommendations based on current weather",
      position: "left"
    },
    {
      target: ".ai-recommendations",
      title: "AI Styling Assistant",
      description: "Receive personalized style suggestions",
      position: "top"
    }
  ];
  
  // Find and measure the target element for the current step
  useEffect(() => {
    if (!isActive) return;
    
    // Find the element with the specified selector
    const element = document.querySelector(tutorialSteps[currentStep].target);
    if (element) {
      setTargetElement(element.getBoundingClientRect());
    } else {
      // If element not found, use default position in viewport center
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      setTargetElement(new DOMRect(
        viewportWidth / 2 - 100,
        viewportHeight / 2 - 100,
        200,
        200
      ));
    }
  }, [currentStep, isActive]);
  
  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // If tutorial is not active, don't render anything
  if (!isActive || !targetElement) return null;
  
  // Calculate tooltip position based on target element and desired position
  const getTooltipPosition = () => {
    const { top, left, width, height } = targetElement;
    const padding = 20; // Space between target and tooltip
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    
    switch (tutorialSteps[currentStep].position) {
      case "top":
        return { 
          top: top - padding - tooltipHeight, 
          left: left + width/2 - tooltipWidth/2 
        };
      case "right":
        return { 
          top: top + height/2 - tooltipHeight/2, 
          left: left + width + padding 
        };
      case "bottom":
        return { 
          top: top + height + padding, 
          left: left + width/2 - tooltipWidth/2 
        };
      case "left":
        return { 
          top: top + height/2 - tooltipHeight/2, 
          left: left - padding - tooltipWidth 
        };
      default:
        return { 
          top: top + height + padding, 
          left: left 
        };
    }
  };
  
  const tooltipPosition = getTooltipPosition();
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Highlight the target element */}
      <div 
        className="absolute box-content border-4 border-amber-400/80 dark:border-amber-300/80 rounded-lg shadow-2xl"
        style={{
          top: targetElement.top - 8,
          left: targetElement.left - 8,
          width: targetElement.width,
          height: targetElement.height,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Golden particle effects around the highlight */}
        <GoldenParticleEffect />
      </div>
      
      {/* Tutorial tooltip with content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          className="absolute bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-xl border border-amber-200 dark:border-amber-800 w-80 p-5 pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Luxury corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-amber-600/40 dark:border-amber-400/40"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-amber-600/40 dark:border-amber-400/40"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-amber-600/40 dark:border-amber-400/40"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-amber-600/40 dark:border-amber-400/40"></div>
          
          {/* Step indicator */}
          <div className="flex justify-center mb-3 space-x-1">
            {tutorialSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full ${
                  index === currentStep 
                    ? "w-6 bg-amber-500 dark:bg-amber-400" 
                    : "w-1.5 bg-amber-200 dark:bg-amber-700"
                }`}
                animate={index === currentStep ? {
                  backgroundColor: ["hsl(36, 80%, 45%)", "hsl(36, 90%, 65%)", "hsl(36, 80%, 45%)"]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
          
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
            {tutorialSteps[currentStep].title}
          </h3>
          
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            {tutorialSteps[currentStep].description}
          </p>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm"
            >
              Previous
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-amber-600/70 dark:text-amber-400/70 hover:text-amber-800 dark:hover:text-amber-300 text-sm"
            >
              Skip All
            </Button>
            
            <Button
              size="sm"
              onClick={nextStep}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm"
            >
              {currentStep < tutorialSteps.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}