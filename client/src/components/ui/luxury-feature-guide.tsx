import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, Umbrella, Sparkle, Wind } from 'lucide-react';
import GoldenThread from './golden-thread';

interface LuxuryFeatureGuideProps {
  animationDelay?: number;
}

/**
 * LuxuryFeatureGuide Component
 * 
 * An elegant visual guide showcasing app features with luxury styling.
 * Designed to be displayed alongside the auth form to help new users
 * understand the app's value proposition.
 */
const LuxuryFeatureGuide: React.FC<LuxuryFeatureGuideProps> = ({
  animationDelay = 0.3
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: animationDelay
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.17, 0.67, 0.83, 0.67]
      }
    }
  };
  
  // Feature data
  const features = [
    {
      title: "Weather-Smart Styling",
      description: "Never worry about weather again. Get outfit recommendations perfectly suited to current conditions.",
      icon: <Umbrella className="h-8 w-8 text-amber-400" />,
      iconBg: "bg-amber-100/20 dark:bg-amber-900/20"
    },
    {
      title: "Digital Luxury Wardrobe",
      description: "Organize your collection with a beautiful, intuitive interface that showcases your personal style.",
      icon: <Sparkle className="h-8 w-8 text-amber-400" />,
      iconBg: "bg-amber-100/20 dark:bg-amber-900/20"
    },
    {
      title: "Style Intelligence",
      description: "Our AI understands your preferences and helps you create perfectly coordinated outfits every time.",
      icon: <Wind className="h-8 w-8 text-amber-400" />,
      iconBg: "bg-amber-100/20 dark:bg-amber-900/20"
    }
  ];
  
  // Before & After visual
  const beforeAfterVisual = {
    before: "Morning Closet Confusion",
    after: "Perfect Outfit, Every Time"
  };
  
  return (
    <div className="w-full lg:max-w-md relative">
      <motion.div
        className="flex flex-col space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Tagline */}
        <motion.div 
          className="flex flex-col space-y-2"
          variants={itemVariants}
        >
          <h2 className="font-luxury-heading text-xl text-amber-500 font-semibold">
            Your Personal Fashion Assistant
          </h2>
          <p className="text-sm text-luxury-brown/80 dark:text-amber-200/80">
            Elevate your style with sophisticated technology
          </p>
        </motion.div>
        
        {/* Before & After */}
        <motion.div
          className="relative overflow-hidden rounded-xl h-36 border border-amber-200/30 dark:border-amber-800/30 shadow-sm"
          variants={itemVariants}
        >
          <div className="absolute inset-0 flex">
            {/* Before side */}
            <div className="w-1/2 h-full bg-gradient-to-r from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4 flex flex-col justify-between">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">BEFORE</div>
              <div className="flex justify-center items-center flex-1">
                <Cloud className="w-8 h-8 text-neutral-400 dark:text-neutral-600 opacity-70" />
                <span className="ml-2 font-medium text-neutral-500 dark:text-neutral-400 text-xs">❓</span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{beforeAfterVisual.before}</div>
            </div>
            
            {/* After side */}
            <div className="w-1/2 h-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20 p-4 flex flex-col justify-between">
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">AFTER</div>
              <div className="flex justify-center items-center flex-1">
                <Sun className="w-8 h-8 text-amber-400" />
                <span className="ml-2 font-medium text-amber-500 text-xs">✨</span>
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">{beforeAfterVisual.after}</div>
            </div>
            
            {/* Divider line */}
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white/50 dark:bg-black/50" />
          </div>
        </motion.div>
        
        {/* Features list */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="flex items-start space-x-4"
              variants={itemVariants}
            >
              <div className={`p-2 rounded-full ${feature.iconBg} flex-shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="font-luxury-heading text-luxury-brown dark:text-amber-300 font-medium text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-luxury-brown/70 dark:text-amber-200/70 mt-1">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Golden thread decoration */}
        <motion.div 
          className="pt-4"
          variants={itemVariants}
        >
          <GoldenThread 
            pathType="wave" 
            thickness={1} 
            color="rgba(251, 191, 36, 0.6)"
            duration={4}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LuxuryFeatureGuide;