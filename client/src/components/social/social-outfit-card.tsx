import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, User, MessageCircle } from "lucide-react";
import { useLikeOutfit, useUnlikeOutfit, useShareOutfit } from "@/hooks/use-social";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialOutfitCardProps {
    outfit: any;
    showAuthor?: boolean;
}

export function SocialOutfitCard({ outfit, showAuthor = true }: SocialOutfitCardProps) {
    const { toast } = useToast();
    const likeMutation = useLikeOutfit();
    const unlikeMutation = useUnlikeOutfit();
    const shareMutation = useShareOutfit();

    // Optimistic UI state
    const [isLiked, setIsLiked] = useState(outfit.isLiked);
    const [likesCount, setLikesCount] = useState(outfit.likesCount || 0);

    const handleLike = () => {
        if (isLiked) {
            setIsLiked(false);
            setLikesCount((prev: number) => Math.max(0, prev - 1));
            unlikeMutation.mutate(outfit.id);
        } else {
            setIsLiked(true);
            setLikesCount((prev: number) => prev + 1);
            likeMutation.mutate(outfit.id);
        }
    };

    const handleShare = () => {
        shareMutation.mutate({ outfitId: outfit.id }, {
            onSuccess: (data: any) => {
                navigator.clipboard.writeText(data.shareUrl);
                toast({
                    title: "Link Copied",
                    description: "Share link copied to clipboard",
                });
            }
        });
    };

    // Get main image (dress > top > first item)
    const items = outfit.items || [];
    const mainItem = items.find((i: any) => i.category === 'dresses') ||
        items.find((i: any) => i.category === 'tops') ||
        items[0];

    return (
        <motion.div
            className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#80163A]/20 transition-all shadow-sm"
            whileHover={{ y: -4 }}
            layout
        >
            {/* Header */}
            {showAuthor && (
                <div className="p-3 flex items-center gap-3 border-b border-[#F5F5F5]">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-[#E5E5E5]">
                        <User className="w-4 h-4 text-[#80163A]" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{outfit.authorName || "Style Icon"}</p>
                        <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider">{outfit.createdAt ? new Date(outfit.createdAt).toLocaleDateString() : 'Just now'}</p>
                    </div>
                </div>
            )}

            {/* Image */}
            <div className="relative aspect-[4/5] bg-[#F9F9F7]">
                {mainItem ? (
                    <img
                        src={mainItem.imageUrl}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D5D5D5]">
                        No Preview
                    </div>
                )}

                {/* Overlay details on hover could go here */}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50"
                            onClick={handleLike}
                        >
                            <Heart
                                className={cn("w-5 h-5 transition-colors", isLiked ? "fill-[#80163A] text-[#80163A]" : "text-[#1A1A1A]")}
                            />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageCircle className="w-5 h-5 text-[#1A1A1A]" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleShare}
                        >
                            <Share2 className="w-5 h-5 text-[#1A1A1A]" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                        {likesCount} likes
                    </p>
                    <p className="text-sm text-[#1A1A1A]">
                        <span className="font-medium mr-1">{outfit.name}</span>
                        <span className="text-[#6B6B6B] font-light">{outfit.description}</span>
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {outfit.occasion && (
                        <span className="text-xs text-[#80163A] bg-[#80163A]/5 px-2 py-0.5 rounded-full">#{outfit.occasion}</span>
                    )}
                    {outfit.season && (
                        <span className="text-xs text-[#80163A] bg-[#80163A]/5 px-2 py-0.5 rounded-full">#{outfit.season}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
