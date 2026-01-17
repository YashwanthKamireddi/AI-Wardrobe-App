import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { ShoppingBag, Star, ExternalLink, Plus, Filter } from "lucide-react";
import { useWishlist } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";

export function WishlistPage() {
    const { data: wishlist } = useWishlist();

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                <motion.header
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Smart Shopping</p>
                        <h1
                            className="text-[#1A1A1A]"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                                lineHeight: 1.1
                            }}
                        >
                            Wish<span className="italic font-light">list</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-full border-[#E5E5E5]">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button className="rounded-full bg-[#1A1A1A] text-white px-6 hover:bg-[#80163A] transition-colors">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(!wishlist || wishlist.length === 0) && (
                        <div className="col-span-full py-20 text-center bg-[#F9F9F7] rounded-3xl border border-dashed border-[#E5E5E5]">
                            <ShoppingBag className="w-12 h-12 mx-auto text-[#D5D5D5] mb-4" />
                            <h3 className="text-xl font-playfair text-[#1A1A1A] mb-2">Your wishlist is empty</h3>
                            <p className="text-[#6B6B6B] mb-6">Start planning your next strategic purchase.</p>
                            <Button className="rounded-full bg-[#1A1A1A] text-white">
                                Add First Item
                            </Button>
                        </div>
                    )}

                    {wishlist?.map((item: any) => (
                        <WishlistItemCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function WishlistItemCard({ item }: any) {
    return (
        <motion.div
            className="group bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
        >
            <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-[#D5D5D5]" />
                    </div>
                )}

                {/* Versatility Score Badge */}
                {item.versatilityScore && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-[#1A1A1A] shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#80163A] fill-[#80163A]" />
                        {item.versatilityScore}/10
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-[#1A1A1A] truncate pr-2">{item.name}</h3>
                    <p className="font-semibold text-[#1A1A1A]">₹{item.price}</p>
                </div>
                <p className="text-xs text-[#6B6B6B] mb-4">{item.brand}</p>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg border-[#E5E5E5] text-xs h-9">
                        Details
                    </Button>
                    {item.link && (
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-[#F5F5F5] text-[#1A1A1A]">
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default WishlistPage;
