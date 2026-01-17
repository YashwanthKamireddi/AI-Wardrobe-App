import { motion } from 'framer-motion';

/**
 * Filter Category Tab - Minimal Luxury Style
 * Horizontal tabs with underline selection
 */

interface FilterCategoryTabProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

export function FilterCategoryTabs({
    categories,
    activeCategory,
    onSelect
}: FilterCategoryTabProps) {
    return (
        <div className="border-y border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-8 py-4">
                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                    {categories.map(category => {
                        const isActive = activeCategory === category;

                        return (
                            <button
                                key={category}
                                onClick={() => onSelect(category)}
                                className="
                  relative px-2 py-2
                  text-xs tracking-[0.15em] uppercase whitespace-nowrap
                  transition-colors duration-200
                "
                            >
                                <span className={isActive ? 'text-black' : 'text-gray-500 hover:text-black'}>
                                    {category}
                                </span>

                                {/* Underline animation */}
                                {isActive && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                                        layoutId="activeTab"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
