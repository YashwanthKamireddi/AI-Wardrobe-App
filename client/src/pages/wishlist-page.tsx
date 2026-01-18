import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { ShoppingBag, ExternalLink, Plus, Trash2, ArrowRight, X, Link, DollarSign } from "lucide-react";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

/**
 * WISHLIST PAGE - "THE EDITOR'S CART"
 *
 * Design Philosophy: Virtual Luxury Boutique.
 * - Layout: High-end e-commerce grid (Net-a-Porter style)
 * - Typography: Serif prices, minimal labels.
 * - Interaction: Quick add, external link transition.
 */

export function WishlistPage() {
    const { data: wishlist, isLoading } = useWishlist();
    const addToWishlist = useAddToWishlist();
    const removeFromWishlist = useRemoveFromWishlist();
    const { toast } = useToast();

    const [showAddDialog, setShowAddDialog] = useState(false);

    const handleRemove = async (item: any) => {
        if (!confirm(`Remove "${item.name}" from wishlist?`)) return;

        try {
            await removeFromWishlist.mutateAsync(item.id);
            toast({ title: "Removed", description: `"${item.name}" removed from wishlist.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove item.", variant: "destructive" });
        }
    };

    const handleConvertToWardrobe = async (item: any) => {
        try {
            const response = await fetch(`/api/wishlist/${item.id}/convert`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed');

            toast({ title: "Added to Wardrobe", description: `"${item.name}" is now in your collection!` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to add to wardrobe.", variant: "destructive" });
        }
    };

    return (
        <AppLayout>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">

                {/* 1. HEADER */}
                <motion.header
                    className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b border-[#1A1A1A] pb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-[#80163A]">
                            <ShoppingBag className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Curated Selections</span>
                        </div>
                        <h1
                            className="text-[#1A1A1A] leading-[0.9]"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(3rem, 7vw, 6rem)",
                            }}
                        >
                            The Editor's <span className="italic font-light text-[#6B6B6B]">Cart</span>
                        </h1>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Total Value</p>
                        <p className="text-3xl font-playfair text-[#1A1A1A]">
                            ₹{wishlist?.reduce((acc: number, item: any) => acc + (item.price || 0), 0).toLocaleString()}
                        </p>
                    </div>
                </motion.header>

                {/* 2. GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">

                    {/* Loading State */}
                    {isLoading && (
                        <div className="col-span-full py-32 text-center">
                            <div className="animate-pulse text-gray-400">Loading wishlist...</div>
                        </div>
                    )}

                    {/* Empty State */}
                    {(!wishlist || wishlist.length === 0) && !isLoading && (
                        <div className="col-span-full py-32 text-center">
                            <div className="w-24 h-24 mx-auto border border-[#E5E5E5] rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag className="w-8 h-8 text-[#D5D5D5]" />
                            </div>
                            <h3 className="text-2xl font-playfair text-[#1A1A1A] mb-3">Your Bag is Empty</h3>
                            <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">
                                Begin your curation
                            </p>
                            <Button
                                onClick={() => setShowAddDialog(true)}
                                className="rounded-none bg-[#1A1A1A] text-white px-10 py-6 hover:bg-[#80163A] transition-colors uppercase tracking-widest text-xs"
                            >
                                Add First Item
                            </Button>
                        </div>
                    )}

                    {wishlist?.map((item: any, index: number) => (
                        <WishlistItemCard
                            key={item.id}
                            item={item}
                            index={index}
                            onRemove={() => handleRemove(item)}
                            onConvert={() => handleConvertToWardrobe(item)}
                        />
                    ))}

                    {/* Add Item Placeholder Card */}
                    {wishlist && wishlist.length > 0 && (
                        <motion.button
                            onClick={() => setShowAddDialog(true)}
                            className="group aspect-[3/4] border border-dashed border-[#E5E5E5] hover:border-[#80163A] transition-colors flex flex-col items-center justify-center gap-4 relative"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 0.99 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] group-hover:bg-[#80163A] transition-colors flex items-center justify-center text-[#1A1A1A] group-hover:text-white">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-medium text-[#1A1A1A]">Add New Piece</span>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Add Item Dialog */}
            <AddWishlistDialog
                isOpen={showAddDialog}
                onClose={() => setShowAddDialog(false)}
            />
        </AppLayout>
    );
}

interface WishlistItemCardProps {
    item: any;
    index: number;
    onRemove: () => void;
    onConvert: () => void;
}

function WishlistItemCard({ item, index, onRemove, onConvert }: WishlistItemCardProps) {
    const [showActions, setShowActions] = useState(false);

    return (
        <motion.div
            className="group cursor-pointer"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#F5F5F5]">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                )}

                {/* Tags (Absolute) */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {item.price > 5000 && (
                        <span className="bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                            Investment
                        </span>
                    )}
                    {item.versatilityScore > 8 && (
                        <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                            Essential
                        </span>
                    )}
                </div>

                {/* Remove Button */}
                {showActions && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex gap-2">
                        <Button
                            onClick={(e) => { e.stopPropagation(); onConvert(); }}
                            className="flex-1 bg-white text-[#1A1A1A] hover:bg-gray-100 h-10 text-[10px] uppercase tracking-widest border-none"
                        >
                            Add to Wardrobe
                        </Button>
                        {item.sourceUrl && (
                            <Button
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); window.open(item.sourceUrl, '_blank'); }}
                                className="bg-[#1A1A1A] text-white border border-white/20 hover:bg-[#80163A]"
                            >
                                <ExternalClick className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Meta */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="text-lg text-[#1A1A1A] font-playfair leading-tight mb-1 group-hover:text-[#80163A] transition-colors">
                        {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{item.brand || "Unknown Brand"}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-playfair italic text-[#1A1A1A]">₹{item.price?.toLocaleString()}</p>
                </div>
            </div>
        </motion.div>
    );
}

// External link icon component
function ExternalClick({ className }: { className?: string }) {
    return <ExternalLink className={className} />;
}

// Add Wishlist Dialog
interface AddWishlistDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

function AddWishlistDialog({ isOpen, onClose }: AddWishlistDialogProps) {
    const addToWishlist = useAddToWishlist();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({ title: "Name required", description: "Please enter an item name.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            await addToWishlist.mutateAsync({
                name: name.trim(),
                brand: brand.trim() || null,
                price: price ? parseFloat(price) : null,
                imageUrl: imageUrl.trim() || null,
                sourceUrl: sourceUrl.trim() || null,
            });

            toast({ title: "Added to Wishlist", description: `"${name}" has been saved.` });

            // Reset form
            setName("");
            setBrand("");
            setPrice("");
            setImageUrl("");
            setSourceUrl("");
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Dialog */}
                <motion.div
                    className="relative w-full max-w-md bg-[#FAF9F6] mx-4 overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#80163A] flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-playfair text-[#1A1A1A]">Add to Wishlist</h2>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Save for later</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                Item Name *
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Silk Blouse"
                                className="border-b border-[#1A1A1A]/20 rounded-none px-0 h-11 bg-transparent focus:outline-none focus:border-[#80163a] text-lg placeholder:text-[#1A1A1A]/20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                    Brand
                                </label>
                                <Input
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="Zara"
                                    className="border-b border-[#1A1A1A]/20 rounded-none px-0 h-10 bg-transparent focus:outline-none focus:border-[#80163a] placeholder:text-[#1A1A1A]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                    Price (₹)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="2999"
                                        className="border-b border-[#1A1A1A]/20 rounded-none pl-5 pr-0 h-10 bg-transparent focus:outline-none focus:border-[#80163a] placeholder:text-[#1A1A1A]/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                Image URL
                            </label>
                            <Input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="border-b border-[#1A1A1A]/20 rounded-none px-0 h-10 bg-transparent focus:outline-none focus:border-[#80163a] placeholder:text-[#1A1A1A]/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                <Link className="w-3 h-3 inline mr-1" />
                                Source Link
                            </label>
                            <Input
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://store.com/product"
                                className="border-b border-[#1A1A1A]/20 rounded-none px-0 h-10 bg-transparent focus:outline-none focus:border-[#80163a] placeholder:text-[#1A1A1A]/20"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#1A1A1A] text-white hover:bg-[#80163A] uppercase tracking-widest text-xs h-12"
                            >
                                {isSubmitting ? "Adding..." : "Add to Wishlist"}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default WishlistPage;
