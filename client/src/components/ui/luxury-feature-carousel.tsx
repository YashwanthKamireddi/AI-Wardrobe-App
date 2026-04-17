/**
 * Luxury Feature Carousel Component
 * Swipeable feature showcase with premium styling
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Shirt, Cloud, Calendar } from "lucide-react";

interface CarouselSlide {
    title: string;
    description: string;
    image?: string;
    gradient?: string;
    icon?: React.ReactNode;
}

interface LuxuryFeatureCarouselProps {
    slides?: CarouselSlide[];
    className?: string;
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    interval?: number;
}

const defaultSlides: CarouselSlide[] = [
    {
        title: "AI Styling",
        description: "Smart outfit recommendations powered by AI",
        gradient: "from-[#80163A] to-[#D4AF37]",
        icon: <Sparkles className="w-8 h-8" />,
    },
    {
        title: "Weather Sync",
        description: "Outfits tailored for any condition",
        gradient: "from-[#1A1A1A] to-[#4A4A4A]",
        icon: <Cloud className="w-8 h-8" />,
    },
    {
        title: "Virtual Wardrobe",
        description: "Your entire closet in one place",
        gradient: "from-[#2C3E50] to-[#4A6278]",
        icon: <Shirt className="w-8 h-8" />,
    },
    {
        title: "Smart Planning",
        description: "Plan outfits for any occasion",
        gradient: "from-[#8E44AD] to-[#9B59B6]",
        icon: <Calendar className="w-8 h-8" />,
    },
];

export function LuxuryFeatureCarousel({
    slides = defaultSlides,
    className = "",
    autoPlay = true,
    autoPlaySpeed = 4000,
    interval,
}: LuxuryFeatureCarouselProps) {
    const [current, setCurrent] = useState(0);

    const next = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(next, interval || autoPlaySpeed);
        return () => clearInterval(timer);
    }, [autoPlay, autoPlaySpeed, interval]);

    return (
        <div className={`relative ${className}`}>
            <div className="overflow-hidden rounded-xl h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className={`h-full bg-gradient-to-br ${slides[current].gradient || 'from-gray-800 to-gray-900'} flex flex-col items-center justify-center p-6`}
                    >
                        {slides[current].icon && (
                            <div className="text-white/80 mb-3">
                                {slides[current].icon}
                            </div>
                        )}
                        <div className="text-center text-white">
                            <h3
                                className="text-lg mb-1 font-medium"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {slides[current].title}
                            </h3>
                            <p className="text-white/60 text-sm">{slides[current].description}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === current ? 'bg-white w-4' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default LuxuryFeatureCarousel;
