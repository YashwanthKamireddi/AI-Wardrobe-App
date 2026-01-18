import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface AtelierPaletteProps {
    items: any[];
    onSelectItem: (item: any) => void;
    categories: string[];
    isLoading?: boolean;
}

export function AtelierPalette({ items, onSelectItem, categories, isLoading }: AtelierPaletteProps) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [items, activeCategory, searchQuery]);

    return (
        <div className="flex flex-col h-full bg-white border-t border-[#E5E5E5] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl md:rounded-none md:border-t-0 md:bg-transparent md:shadow-none">

            {/* Handle Bar (Mobile) */}
            <div className="md:hidden w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-[#E5E5E5] rounded-full" />
            </div>

            {/* Controls */}
            <div className="px-6 py-4 border-b border-[#E5E5E5]/50 md:border-0 md:px-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search wardrobe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 bg-[#F5F5F5] rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/20 transition-all font-sans"
                        />
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                shrink-0 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-all
                                ${activeCategory === cat
                                    ? 'bg-[#1A1A1A] text-white shadow-md'
                                    : 'bg-white border border-[#E5E5E5] text-[#666] hover:border-[#999]'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto px-6 pb-safe md:px-0">
                {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[3/4] bg-[#F5F5F5] rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-20">
                        {filteredItems.map((item) => (
                            <motion.button
                                key={item.id}
                                layoutId={`item-${item.id}`} // smooth transition if we want to animate generic list
                                onClick={() => onSelectItem(item)}
                                className="relative aspect-[3/4] bg-[#FAFAFA] rounded-md overflow-hidden group border border-transparent hover:border-[#E5E5E5] transition-all"
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                {item.favorite && (
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1A1A1A]" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                        <p className="text-xs">No items found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
