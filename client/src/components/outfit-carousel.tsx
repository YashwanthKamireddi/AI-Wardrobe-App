import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2, Sparkles, Check } from "lucide-react";
import { Outfit } from "@shared/schema";

interface OutfitCarouselProps {
    outfits: Outfit[];
    onWear: (outfitId: number) => void;
    onGenerateNew: () => void;
}

export function OutfitCarousel({ outfits, onWear, onGenerateNew }: OutfitCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        })
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + outfits.length) % outfits.length);
    };

    const currentOutfit = outfits[currentIndex];

    if (!outfits.length) {
        return (
            <div className="w-full aspect-[4/5] bg-[#F5F5F5] rounded-[2rem] flex flex-col items-center justify-center p-8 text-center border border-[#E5E5E5]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Sparkles className="w-6 h-6 text-[#C5A572]" />
                </div>
                <h3 className="text-lg font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Ready to Dress?
                </h3>
                <p className="text-sm text-[#6B6B6B] mb-6">
                    Generate your first outfit for today based on the weather.
                </p>
                <button
                    onClick={onGenerateNew}
                    className="px-8 py-3 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-[#80163A] transition-colors"
                >
                    Create Outfit
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Carousel Container */}
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-black/5 border border-[#E5E5E5]/50 group">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0 p-6 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 z-10">
                            <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-medium tracking-wide border border-[#E5E5E5]">
                                {currentOutfit.name || "Daily Selection"}
                            </span>
                            <button className="p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-colors border border-[#E5E5E5]">
                                <Share2 className="w-4 h-4 text-[#1A1A1A]" />
                            </button>
                        </div>

                        {/* Items Grid Layout - Dynamic based on item count */}
                        <div className="flex-1 grid grid-cols-2 gap-3 mb-6 relative">
                            {/* This assumes currentOutfit has items populated.
                   Real implementation might need to fetch items if not included in outfit object */}
                            {/* Placeholder visuals for now as simple blocks if image urls missing */}
                            <div className="bg-[#F9F9F7] rounded-2xl col-span-2 row-span-2 relative overflow-hidden group/item">
                                <div className="absolute inset-0 flex items-center justify-center text-[#E5E5E5]">
                                    <span className="text-6xl font-serif opacity-20">1</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 flex gap-3 z-10">
                            <button
                                onClick={() => onWear(currentOutfit.id)}
                                className="flex-1 bg-[#1A1A1A] text-white h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Wear This
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {outfits.length > 1 && (
                    <>
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                            onClick={() => paginate(-1)}
                        >
                            <ChevronLeft className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                            onClick={() => paginate(1)}
                        >
                            <ChevronRight className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                    </>
                )}
            </div>

            {/* Pagination Dots */}
            {outfits.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {outfits.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-[#1A1A1A]" : "w-1.5 bg-[#E5E5E5]"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
