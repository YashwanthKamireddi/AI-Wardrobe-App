import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import {
    Heart, Share2, Trophy, Users, Award, Sparkles, Camera,
    Bookmark, TrendingUp, Sun, Shirt, Clock, Crown, Search, ExternalLink,
    Check, X as XIcon
} from "lucide-react";
import {
    useCommunityFeed, useChallenges, useLikeOutfit, useUnlikeOutfit,
    useShareOutfit, useSubmitToChallenge
} from "@/hooks/use-social";
import { useOutfits } from "@/hooks/use-outfits";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Inspiration, Outfit } from "@shared/schema";

/**
 * SOCIAL PAGE - "THE FRONT ROW"
 *
 * Design Philosophy: High-Fashion Community + Inspiration Hub.
 * - Layout: Masonry Grid (Pinterest/Tumblr style)
 * - Visuals: Polaroid Frames, subtle rotations, white borders.
 * - Vibe: Exclusive, Curated, Backstage.
 *
 * Combines:
 * - Community Feed (user-shared outfits)
 * - Style Challenges (competitions)
 * - Inspiration/Mood Boards (curated collections)
 */

// Featured collections for Inspiration tab
const featuredCollections = [
    { id: 1, title: "Spring Essentials", count: 24, icon: Sun, image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400" },
    { id: 2, title: "Office Chic", count: 18, icon: Shirt, image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400" },
    { id: 3, title: "Weekend Casual", count: 32, icon: Clock, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
    { id: 4, title: "Evening Elegance", count: 15, icon: Crown, image: "https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=400" },
];

// Trending styles
const trendingStyles = [
    { name: "Quiet Luxury", desc: "Understated elegance", tag: "#quietluxury" },
    { name: "Minimalist", desc: "Clean & simple", tag: "#minimalist" },
    { name: "Classic", desc: "Timeless pieces", tag: "#classic" },
    { name: "Smart Casual", desc: "Versatile looks", tag: "#smartcasual" },
    { name: "Parisian Chic", desc: "Effortless style", tag: "#parisian" },
];

type FeedPost = {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string | null;
    caption: string;
    description: string | null;
    imageUrl: string | null;
    likes: number;
    isLiked: boolean;
    comments: number;
    createdAt: string | Date;
};

type ChallengeDTO = {
    id: number;
    name: string;
    description: string | null;
    prize: string | null;
    endDate: string | Date | null;
    status: string;
    participants: number;
    submitted: boolean;
};

function formatTimeRemaining(end: string | Date | null | undefined): string {
    if (!end) return '—';
    const ms = new Date(end).getTime() - Date.now();
    if (ms <= 0) return 'Ended';
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${mins}m`;
}

export function SocialPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'inspiration'>('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [submitDialog, setSubmitDialog] = useState<ChallengeDTO | null>(null);
    const [selectedOutfitId, setSelectedOutfitId] = useState<number | null>(null);
    const { data: feed } = useCommunityFeed();
    const { data: challenges } = useChallenges() as { data?: ChallengeDTO[] };
    const { data: inspirations } = useQuery<Inspiration[], Error>({
        queryKey: ["/api/inspirations"],
    });
    const { data: myOutfits } = useOutfits();
    const likeOutfit = useLikeOutfit();
    const unlikeOutfit = useUnlikeOutfit();
    const shareOutfit = useShareOutfit();
    const submitToChallenge = useSubmitToChallenge();
    const { toast } = useToast();

    const handleToggleLike = (post: FeedPost) => {
        if (post.isLiked) unlikeOutfit.mutate(post.id);
        else likeOutfit.mutate(post.id);
    };

    const handleShare = async (outfitId: number) => {
        try {
            const result = (await shareOutfit.mutateAsync({ outfitId })) as { shareUrl?: string };
            if (result?.shareUrl) {
                await navigator.clipboard.writeText(result.shareUrl);
                toast({ title: "Share link copied", description: "Paste it anywhere." });
            }
        } catch (e) {
            toast({ title: "Could not share", description: "Only your own outfits can be shared.", variant: "destructive" });
        }
    };

    const openSubmitDialog = (challenge: ChallengeDTO) => {
        if (challenge.submitted) {
            toast({ title: "Already submitted", description: "You've entered this challenge." });
            return;
        }
        setSubmitDialog(challenge);
        setSelectedOutfitId(null);
    };

    const handleSubmit = async () => {
        if (!submitDialog || !selectedOutfitId) return;
        try {
            await submitToChallenge.mutateAsync({ challengeId: submitDialog.id, outfitId: selectedOutfitId });
            toast({ title: "Submitted!", description: `Entered "${submitDialog.name}".` });
            setSubmitDialog(null);
            setSelectedOutfitId(null);
        } catch (e: any) {
            const msg = /already submitted/i.test(e?.message || "")
                ? "You've already submitted to this challenge."
                : "Could not submit entry.";
            toast({ title: "Submission failed", description: msg, variant: "destructive" });
        }
    };

    // Filter inspirations by search
    const filteredInspirations = useMemo(() => {
        if (!inspirations) return [];
        if (!searchQuery) return inspirations;
        return inspirations.filter(i =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [inspirations, searchQuery]);

    return (
        <AppLayout>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 pb-28 md:pb-12">

                {/* 1. HEADER */}
                <motion.header
                    className="mb-16 md:mb-24 text-center relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 border border-[#80163A]/20 rounded-full bg-[#80163A]/5">
                        <Camera className="w-3 h-3 text-[#80163A]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#80163A]">Community Access</span>
                    </div>
                    <h1
                        className="text-[#1A1A1A] mb-6 leading-tight"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(3rem, 8vw, 6rem)",
                        }}
                    >
                        The <span className="italic font-light text-[#6B6B6B]">Front Row</span>
                    </h1>
                    <p className="text-[#6B6B6B] max-w-md mx-auto text-sm md:text-base font-light">
                        Curated looks from the Vessura collective. <br className="hidden md:block" /> Join the discourse, find inspiration, and showcase your signature style.
                    </p>
                </motion.header>

                {/* 2. NAVIGATION */}
                <div className="flex justify-center mb-16 md:mb-24 sticky top-24 z-30">
                    <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-lg shadow-black/5">
                        {['feed', 'inspiration', 'challenges'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 md:px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative ${activeTab === tab
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-[#1A1A1A]'
                                    }`}
                            >
                                <span className="relative z-10">{tab}</span>
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabSocial"
                                        className="absolute inset-0 bg-[#1A1A1A] rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. CONTENT AREA */}
                <AnimatePresence mode="wait">
                    {/* FEED TAB */}
                    {activeTab === 'feed' && (
                        <motion.div
                            key="feed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Empty State */}
                            {(!feed || feed.length === 0) && (
                                <div className="text-center py-32 border border-dashed border-gray-200 rounded-[2rem]">
                                    <Sparkles className="w-8 h-8 mx-auto text-[#D5D5D5] mb-4" />
                                    <h3 className="text-2xl text-[#1A1A1A] mb-2 font-playfair italic">
                                        The Runway is Clear
                                    </h3>
                                    <p className="text-gray-400 text-sm tracking-widest uppercase">
                                        Be the first to debut a look
                                    </p>
                                </div>
                            )}

                            {/* MASONRY FEED */}
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                                {(feed as FeedPost[] | undefined)?.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        className="break-inside-avoid mb-8 group"
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        {/* Polaroid Card */}
                                        <div className="bg-white p-4 pb-6 shadow-2xl shadow-black/5 rotate-1 hover:rotate-0 transition-transform duration-500 ease-out border border-gray-100">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 ring-1 ring-gray-100 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                                    {post.userAvatar ? (
                                                        <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        post.userName?.[0] || 'U'
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] truncate">{post.userName}</p>
                                                    {post.description && (
                                                        <p className="text-[10px] text-gray-400 truncate">{post.description}</p>
                                                    )}
                                                </div>
                                                <button
                                                    className="ml-auto min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-300 hover:text-[#80163A] transition-colors"
                                                    aria-label="Share outfit"
                                                    onClick={() => handleShare(post.id)}
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Image Frame */}
                                            <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-4 relative cursor-pointer">
                                                {post.imageUrl ? (
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.caption || "Community outfit"}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                                                        <Camera className="w-8 h-8 mb-2 opacity-50" />
                                                        <span className="text-[10px] tracking-widest uppercase">No Preview</span>
                                                    </div>
                                                )}

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                    <button
                                                        className={`min-w-[44px] min-h-[44px] w-12 h-12 bg-white rounded-full flex items-center justify-center transition-colors shadow-xl ${post.isLiked ? 'text-[#80163A]' : 'text-[#1A1A1A] hover:bg-[#80163A] hover:text-white'}`}
                                                        onClick={() => handleToggleLike(post)}
                                                        aria-label={post.isLiked ? "Unlike outfit" : "Like outfit"}
                                                        aria-pressed={post.isLiked}
                                                    >
                                                        <Heart className="w-5 h-5" fill={post.isLiked ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Caption */}
                                            <div className="mt-2 text-center">
                                                <p className="text-lg font-playfair italic text-[#1A1A1A] mb-2">"{post.caption}"</p>
                                                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                                                    <span>{post.likes} {post.likes === 1 ? 'Admirer' : 'Admirers'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* INSPIRATION TAB */}
                    {activeTab === 'inspiration' && (
                        <motion.div
                            key="inspiration"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-16"
                        >
                            {/* Search */}
                            <div className="max-w-xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search for styles, trends, or looks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-white border border-[#E5E5E5] text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Trending Styles - Horizontal Scroll */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-5 h-5 text-[#80163A]" />
                                    <h2
                                        className="text-2xl text-[#1A1A1A]"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        Trending <span className="italic text-[#6B6B6B]">Now</span>
                                    </h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto py-2 -mx-6 px-6 scrollbar-hide">
                                    {trendingStyles.map((style, i) => (
                                        <motion.button
                                            key={style.name}
                                            className="flex-shrink-0 px-6 py-4 bg-white border border-[#E5E5E5] hover:border-[#1A1A1A] transition-all shadow-lg shadow-black/5"
                                            whileHover={{ y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <p className="font-medium text-[#1A1A1A] mb-1">{style.name}</p>
                                            <p className="text-xs text-gray-400">{style.tag}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Collections - Polaroid Style */}
                            <div>
                                <h2
                                    className="text-2xl text-[#1A1A1A] mb-8"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Curated <span className="italic text-[#6B6B6B]">Collections</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {featuredCollections.map((collection, i) => (
                                        <motion.div
                                            key={collection.id}
                                            className="group cursor-pointer"
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            {/* Polaroid Card */}
                                            <div className={`bg-white p-3 pb-5 shadow-2xl shadow-black/5 border border-gray-100 ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-500`}>
                                                <div className="aspect-[4/5] bg-[#F5F5F5] overflow-hidden mb-3 relative">
                                                    <img
                                                        src={collection.image}
                                                        alt={collection.title}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <collection.icon className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="font-playfair text-lg text-[#1A1A1A] mb-1">{collection.title}</h3>
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">{collection.count} Looks</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Inspiration Grid - Masonry */}
                            <div>
                                <h2
                                    className="text-2xl text-[#1A1A1A] mb-8"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    For <span className="italic text-[#6B6B6B]">You</span>
                                </h2>

                                {filteredInspirations && filteredInspirations.length > 0 ? (
                                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                                        {filteredInspirations.map((inspiration, index) => (
                                            <motion.div
                                                key={inspiration.id}
                                                className="break-inside-avoid mb-8 group"
                                                initial={{ opacity: 0, y: 50 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: index * 0.05 }}
                                            >
                                                {/* Polaroid Card */}
                                                <div className={`bg-white p-4 pb-6 shadow-2xl shadow-black/5 border border-gray-100 ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'} hover:rotate-0 transition-transform duration-500`}>
                                                    {/* Image */}
                                                    <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-4 relative">
                                                        {inspiration.imageUrl && (
                                                            <img
                                                                src={inspiration.imageUrl}
                                                                alt={inspiration.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                loading="lazy"
                                                            />
                                                        )}

                                                        {/* Tags Overlay */}
                                                        {inspiration.tags && inspiration.tags.length > 0 && (
                                                            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                                                {inspiration.tags.slice(0, 2).map(tag => (
                                                                    <span
                                                                        key={tag}
                                                                        className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[9px] uppercase tracking-wider text-[#1A1A1A]"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Actions Overlay */}
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                            <button
                                                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#D4AF37] hover:text-white transition-colors shadow-xl"
                                                                onClick={() => toast({ title: "Saved!", description: "Added to your collection" })}
                                                            >
                                                                <Bookmark className="w-5 h-5" />
                                                            </button>
                                                            {inspiration.source && (
                                                                <a
                                                                    href={inspiration.source}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors shadow-xl"
                                                                >
                                                                    <ExternalLink className="w-5 h-5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Caption */}
                                                    <div className="text-center">
                                                        <p className="text-lg font-playfair italic text-[#1A1A1A] mb-2">"{inspiration.title}"</p>
                                                        {inspiration.description && (
                                                            <p className="text-xs text-gray-400 line-clamp-2">{inspiration.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-32 border border-dashed border-gray-200">
                                        <Sparkles className="w-8 h-8 mx-auto text-[#D5D5D5] mb-4" />
                                        <h3 className="text-2xl text-[#1A1A1A] mb-2 font-playfair italic">
                                            {searchQuery ? "No results found" : "Inspiration awaits"}
                                        </h3>
                                        <p className="text-gray-400 text-sm tracking-widest uppercase">
                                            {searchQuery ? "Try a different search" : "Check back for curated looks"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* CHALLENGES TAB */}
                    {activeTab === 'challenges' && (
                        <motion.div
                            key="challenges"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-16"
                        >
                            {/* FEATURED CHALLENGE — first active one */}
                            {challenges && challenges.length > 0 && (
                                <div className="relative bg-[#1A1A1A] text-[#F9F9F7] overflow-hidden min-h-[420px] flex items-center">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#80163A]/30 to-[#1A1A1A]" />
                                    <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
                                    <div className="relative z-10 px-8 md:px-16 w-full md:w-2/3">
                                        <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                                            <Award className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-[0.3em]">Featured Challenge</span>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl mb-6 leading-[0.95]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {challenges[0].name}
                                        </h2>
                                        {challenges[0].description && (
                                            <p className="text-base md:text-lg text-white/75 font-light mb-8 max-w-xl">
                                                {challenges[0].description}
                                            </p>
                                        )}
                                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                            <Button
                                                className="bg-[#FAF9F6] text-[#1A1A1A] hover:bg-white px-8 py-6 text-xs uppercase tracking-widest rounded-none min-h-[44px] disabled:opacity-60"
                                                onClick={() => openSubmitDialog(challenges[0])}
                                                disabled={challenges[0].submitted}
                                            >
                                                {challenges[0].submitted ? 'Entry Submitted' : 'Submit Entry'}
                                            </Button>
                                            <div className="flex gap-8">
                                                <div>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Time Remaining</p>
                                                    <div className="font-playfair text-2xl">{formatTimeRemaining(challenges[0].endDate)}</div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Participants</p>
                                                    <div className="font-playfair text-2xl flex items-center gap-2">
                                                        <Users className="w-5 h-5 text-[#D4AF37]" />
                                                        {challenges[0].participants}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ALL ACTIVE CHALLENGES */}
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <Trophy className="w-5 h-5 text-[#80163A]" />
                                    <h3 className="text-3xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Open <span className="italic text-[#6B6B6B]">Challenges</span>
                                    </h3>
                                </div>
                                {(!challenges || challenges.length === 0) ? (
                                    <div className="text-center py-20 border border-dashed border-gray-200 rounded-[2rem]">
                                        <Trophy className="w-8 h-8 mx-auto text-[#D5D5D5] mb-4" />
                                        <p className="text-gray-400 text-sm uppercase tracking-widest">No active challenges yet</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {challenges.map((c) => (
                                            <div
                                                key={c.id}
                                                className="bg-white border border-[#E5E5E5] p-8 hover:border-[#1A1A1A] transition-colors shadow-sm flex flex-col"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <Award className="w-6 h-6 text-[#D4AF37]" />
                                                    {c.submitted && (
                                                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                                            <Check className="w-3 h-3" /> Submitted
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-xl font-playfair text-[#1A1A1A] mb-3">{c.name}</h4>
                                                {c.description && (
                                                    <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed">{c.description}</p>
                                                )}
                                                <div className="space-y-3 text-xs uppercase tracking-widest text-gray-400 mb-6">
                                                    {c.prize && (
                                                        <div className="flex items-center gap-2">
                                                            <Crown className="w-3 h-3 text-[#D4AF37]" />
                                                            <span>{c.prize}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3 h-3" />
                                                        <span>{c.participants} {c.participants === 1 ? 'entry' : 'entries'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatTimeRemaining(c.endDate)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => openSubmitDialog(c)}
                                                    disabled={c.submitted}
                                                    className="w-full min-h-[44px] bg-[#1A1A1A] text-white hover:bg-[#80163A] uppercase tracking-widest text-xs rounded-none disabled:opacity-50"
                                                >
                                                    {c.submitted ? 'Already Entered' : 'Enter Challenge'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SUBMIT-TO-CHALLENGE DIALOG */}
                <Dialog open={!!submitDialog} onOpenChange={(open) => !open && setSubmitDialog(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="font-playfair text-2xl">
                                Enter "{submitDialog?.name}"
                            </DialogTitle>
                            <DialogDescription>
                                Pick one of your outfits to submit as your entry.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="max-h-[50vh] overflow-y-auto -mx-2 px-2">
                            {(!myOutfits || myOutfits.length === 0) ? (
                                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                                    <Sparkles className="w-6 h-6 mx-auto text-gray-300 mb-3" />
                                    <p className="text-sm text-gray-500">You don't have any outfits yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">Create one in Outfits first, then come back.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {myOutfits.map((o: Outfit) => {
                                        const picked = selectedOutfitId === o.id;
                                        return (
                                            <button
                                                key={o.id}
                                                type="button"
                                                onClick={() => setSelectedOutfitId(o.id)}
                                                className={`relative text-left p-4 border-2 rounded-xl transition-all min-h-[88px] ${picked ? 'border-[#80163A] bg-[#80163A]/5' : 'border-gray-200 hover:border-gray-400'}`}
                                                aria-pressed={picked}
                                            >
                                                <p className="text-sm font-medium text-[#1A1A1A] truncate">{o.name}</p>
                                                {o.occasion && (
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">{o.occasion}</p>
                                                )}
                                                {picked && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#80163A] text-white flex items-center justify-center">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setSubmitDialog(null)}
                                className="min-h-[44px]"
                            >
                                <XIcon className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedOutfitId || submitToChallenge.isPending}
                                className="min-h-[44px] bg-[#80163A] hover:bg-[#80163A]/90 text-white"
                            >
                                {submitToChallenge.isPending ? 'Submitting…' : 'Submit Entry'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

export default SocialPage;
