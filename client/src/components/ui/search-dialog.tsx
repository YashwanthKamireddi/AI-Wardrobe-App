import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ArrowRight, Grid3X3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { WardrobeItem } from '@shared/schema';

/**
 * LUXURY SEARCH INTERFACE
 * Full-screen global search with Cmd/Ctrl + K shortcut
 * Real-time filtered results with elegant animations
 */

interface SearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<WardrobeItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Keyboard shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (!isOpen) {
                    // Open logic would be handled by parent
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Search API call
    useEffect(() => {
        if (!query.trim() || !isOpen) {
            setResults([]);
            return;
        }

        const searchItems = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/api/wardrobe/search?q=${encodeURIComponent(query)}`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(searchItems, 300);
        return () => clearTimeout(debounce);
    }, [query, isOpen]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] bg-[#F9F9F7] border-0 rounded-3xl p-0 overflow-hidden">
                {/* Search Input */}
                <div className="sticky top-0 z-10 bg-[#F9F9F7] p-6 pb-4 border-b border-[#E5E5E5]">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
                        <input
                            type="text"
                            placeholder="Search your wardrobe..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                            className="w-full h-14 pl-12 pr-12 bg-white border border-[#E5E5E5] rounded-2xl text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Keyboard hint */}
                    <div className="mt-3 flex items-center justify-between text-xs text-[#9A9A9A]">
                        <span>Search by name, category, color, brand, or tags</span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-[#E5E5E5] rounded">Esc</kbd>
                            to close
                        </span>
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {isSearching ? (
                            <motion.div
                                key="searching"
                                className="flex flex-col items-center justify-center py-24"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-12 h-12 border-2 border-[#80163A]/20 border-t-[#80163A] rounded-full animate-spin" />
                                <p className="mt-4 text-sm text-[#6B6B6B]">Searching...</p>
                            </motion.div>
                        ) : !query ? (
                            <motion.div
                                key="empty"
                                className="flex flex-col items-center justify-center py-24"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-[#D5D5D5]" />
                                </div>
                                <h3
                                    className="text-xl text-[#1A1A1A] mb-3"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Global Search
                                </h3>
                                <p className="text-sm text-[#6B6B6B] max-w-sm text-center">
                                    Start typing to search across your entire wardrobe
                                </p>
                            </motion.div>
                        ) : results.length > 0 ? (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-[#6B6B6B] mb-4">
                                    Found {results.length} item{results.length > 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {results.map((item, index) => (
                                        <motion.a
                                            key={item.id}
                                            href="/wardrobe"
                                            onClick={onClose}
                                            className="group block bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#1A1A1A] transition-colors"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="relative aspect-[3/4] bg-[#F5F5F5]">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Grid3X3 className="w-8 h-8 text-[#D5D5D5]" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                            <div className="p-3">
                                                <h4 className="text-sm font-medium text-[#1A1A1A] truncate">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-[#6B6B6B] capitalize mt-1">
                                                    {item.category}
                                                </p>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-results"
                                className="flex flex-col items-center justify-center py-24"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-6">
                                    <X className="w-8 h-8 text-[#D5D5D5]" />
                                </div>
                                <h3
                                    className="text-xl text-[#1A1A1A] mb-3"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    No Results Found
                                </h3>
                                <p className="text-sm text-[#6B6B6B] max-w-sm text-center">
                                    Try different keywords or check your spelling
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
