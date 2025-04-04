import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Shirt, CalendarDays, BadgePercent } from "lucide-react";
import { CloudSunIcon } from "@/components/ui/cloud-sun-icon";

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface LuxuryFeatureCarouselProps {
  autoPlaySpeed?: number;
  className?: string;
}

/**
 * LuxuryFeatureCarousel Component
 * 
 * An elegant, animated carousel that showcases the app's key features
 * with sophisticated transitions and visual elements.
 */
const LuxuryFeatureCarousel: React.FC<LuxuryFeatureCarouselProps> = ({
  autoPlaySpeed = 4000,
  className = "",
}) => {
  // Feature items with elegant descriptions
  const features: FeatureItem[] = [
    {
      id: 1,
      title: "AI Styling Assistant",
      description: "Personal recommendations curated for your unique aesthetic and lifestyle",
      icon: <Paintbrush size={28} />,
      color: "bg-gradient-to-br from-amber-300/10 to-amber-500/5"
    },
    {
      id: 2,
      title: "Smart Wardrobe",
      description: "Organize and visualize your collection with intuitive management",
      icon: <Shirt size={28} />,
      color: "bg-gradient-to-br from-amber-400/10 to-amber-600/5"
    },
    {
      id: 3,
      title: "Weather Integration",
      description: "Climate-appropriate suggestions that adapt to your local forecast",
      icon: <CloudSunIcon size={28} />,
      color: "bg-gradient-to-br from-amber-500/10 to-amber-700/5"
    },
    {
      id: 4,
      title: "Outfit Calendar",
      description: "Plan your signature looks for upcoming events and occasions",
      icon: <CalendarDays size={28} />,
      color: "bg-gradient-to-br from-amber-400/10 to-amber-600/5"
    },
    {
      id: 5,
      title: "Style Analysis",
      description: "Insights into your preferences and recommendations for evolution",
      icon: <BadgePercent size={28} />,
      color: "bg-gradient-to-br from-amber-300/10 to-amber-500/5"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, autoPlaySpeed);
    
    return () => clearInterval(interval);
  }, [features.length, autoPlaySpeed, isPaused]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      filter: "blur(5px)"
    },
    visible: { 
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: "blur(5px)",
      transition: {
        ease: [0.22, 1, 0.36, 1],
        duration: 0.5
      }
    }
  };

  // Handle manual navigation
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    // Resume autoplay after 5 seconds of inactivity
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Feature carousel */}
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={`absolute inset-0 p-5 ${features[currentIndex].color} backdrop-blur-sm`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            {/* Icon with glow effect */}
            <motion.div 
              className="mb-3 flex justify-center"
              variants={itemVariants}
            >
              <div className="relative p-3 rounded-full bg-amber-500/10 text-amber-500">
                {features[currentIndex].icon}
                <div className="absolute inset-0 rounded-full bg-amber-500/5 blur-md" />
              </div>
            </motion.div>
            
            {/* Title with elegant typography */}
            <motion.h3 
              className="text-center font-light text-lg tracking-wide text-amber-500/90 mb-2"
              variants={itemVariants}
            >
              {features[currentIndex].title}
            </motion.h3>
            
            {/* Description with refined styling */}
            <motion.p 
              className="text-center text-xs font-light text-amber-500/70 leading-relaxed"
              variants={itemVariants}
            >
              {features[currentIndex].description}
            </motion.p>
            
            {/* Decorative element */}
            <motion.div 
              className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent w-full"
              variants={itemVariants}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? "bg-amber-500/80 w-3" 
                : "bg-amber-500/30 hover:bg-amber-500/50"
            }`}
            aria-label={`View feature ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LuxuryFeatureCarousel;