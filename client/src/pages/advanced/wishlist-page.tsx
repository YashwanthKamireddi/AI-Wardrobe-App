import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/use-advanced";
import { ShoppingBag, Plus, Sparkles, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * WISHLIST PAGE
 *
 * Smart shopping list with versatility scoring
 */

export default function WishlistPage() {
    const { data: wishlist, isLoading } = useWishlist();
    const { mutate: addToWishlist } = useAddToWishlist();
    const { mutate: removeFromWishlist } = useRemoveFromWishlist();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    // Form state
    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        category: "tops",
        link: "",
        brand: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addToWishlist({
            ...newItem,
            price: parseFloat(newItem.price) || 0,
            imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" // Placeholder
        }, {
            onSuccess: (data: any) => {
                setIsOpen(false);
                toast({
                    title: "Added to Wishlist",
                    description: `Versatility Score: ${data.versatilityScore}/10`,
                });
                setNewItem({ name: "", price: "", category: "tops", link: "", brand: "" });
            },
            onError: () => {
                toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
            }
        });
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Shopping</p>
                        <h1
                            className="text-[#1A1A1A]"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem" }}
                        >
                            Smart <span className="italic font-light">Wishlist</span>
                        </h1>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#1A1A1A] text-white rounded-full px-6 h-12 hover:bg-[#80163A] transition-colors">
                                <Plus className="w-5 h-5 mr-2" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#F9F9F7] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>Add to Wishlist</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Silk Blouse" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Price</Label>
                                        <Input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Brand</Label>
                                        <Input value={newItem.brand} onChange={e => setNewItem({ ...newItem, brand: e.target.value })} placeholder="Brand" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="tops">Tops</option>
                                        <option value="bottoms">Bottoms</option>
                                        <option value="shoes">Shoes</option>
                                        <option value="dresses">Dresses</option>
                                        <option value="outerwear">Outerwear</option>
                                        <option value="accessories">Accessories</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Link (Optional)</Label>
                                    <Input value={newItem.link} onChange={e => setNewItem({ ...newItem, link: e.target.value })} placeholder="https://..." />
                                </div>
                                <Button type="submit" className="w-full bg-[#1A1A1A]">Calculate Versatility & Add</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-[#80163A]/20 border-t-[#80163A] animate-spin" /></div>
                ) : !wishlist || wishlist.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-[#E5E5E5] flex flex-col items-center">
                        <ShoppingBag className="w-12 h-12 text-[#D5D5D5] mb-4" />
                        <h3 className="text-xl font-serif text-[#1A1A1A]">Your wishlist is empty</h3>
                        <p className="text-[#6B6B6B] mt-2 max-w-sm">Add items you're eyeing to see how well they'll fit into your existing wardrobe.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden group hover:border-[#80163A] transition-colors"
                            >
                                <div className="relative aspect-square bg-[#F5F5F5]">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2">
                                        <Badge className={`
                                            ${(item.versatilityScore || 0) >= 7 ? 'bg-green-500' : (item.versatilityScore || 0) >= 4 ? 'bg-amber-500' : 'bg-red-500'}
                                            text-white shadow-sm border-0
                                        `}>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Score: {item.versatilityScore || 0}/10
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium text-[#1A1A1A]">{item.name}</h3>
                                            <p className="text-sm text-[#6B6B6B]">{item.brand}</p>
                                        </div>
                                        <span className="font-serif italic text-lg">₹{item.price}</span>
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-[#F5F5F5]">
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                <Button variant="outline" className="w-full text-xs h-8">
                                                    <ExternalLink className="w-3 h-3 mr-1" /> Visit
                                                </Button>
                                            </a>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-3"
                                            onClick={() => removeFromWishlist(item.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>

                                    {(item.versatilityScore || 0) >= 8 && (
                                        <div className="mt-3 bg-green-50 text-green-700 text-xs p-2 rounded flex items-center">
                                            <Sparkles className="w-3 h-3 mr-2" />
                                            Great buy! Matches many items.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
