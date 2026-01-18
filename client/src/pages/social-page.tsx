import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Heart, Share2, MessageCircle, Trophy, Users, Award, Sparkles, Camera } from "lucide-react";
import { useCommunityFeed, useChallenges, useLikeOutfit, useUnlikeOutfit } from "@/hooks/use-social";
import { Button } from "@/components/ui/button";

/**
 * SOCIAL PAGE - "THE FRONT ROW"
 *
 * Design Philosophy: High-Fashion Community.
 * - Layout: Masonry Grid (Pinterest/Tumblr style)
 * - Visuals: Polaroid Frames, subtle rotations, white borders.
 * - Vibe: Exclusive, Curated, Backstage.
 */

export function SocialPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'challenges'>('feed');
    const { data: feed } = useCommunityFeed();
    const { data: challenges } = useChallenges();
    const likeOutfit = useLikeOutfit();
    const unlikeOutfit = useUnlikeOutfit();

    return (
        <AppLayout>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">

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
                        Curated looks from the Celura collective. <br className="hidden md:block" /> Join the discourse and showcase your signature style.
                    </p>
                </motion.header>

                {/* 2. NAVIGATION */}
                <div className="flex justify-center mb-16 md:mb-24 sticky top-24 z-30">
                    <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-lg shadow-black/5">
                        {['feed', 'challenges'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 relative ${activeTab === tab
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
                    {activeTab === 'feed' ? (
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
                                {feed?.map((post: any, index: number) => (
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
                                                <div className="w-8 h-8 rounded-full bg-gray-100 ring-1 ring-gray-100 flex items-center justify-center text-[10px] font-bold">
                                                    {post.userName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">{post.userName}</p>
                                                    <p className="text-[10px] text-gray-400">Parisian Chic</p>
                                                </div>
                                                <button className="ml-auto text-gray-300 hover:text-[#80163A] transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Image Frame */}
                                            <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-4 relative cursor-pointer">
                                                {/* Placeholder for no image */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                                                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                                                    <span className="text-[10px] tracking-widest uppercase">Image Preview</span>
                                                </div>
                                                {/* Actual Image if available */}
                                                {/* <img src={post.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> */}

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                                    <button
                                                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#80163A] hover:text-white transition-colors shadow-xl"
                                                        onClick={() => likeOutfit.mutate(post.id)}
                                                    >
                                                        <Heart className="w-5 h-5" fill={post.isLiked ? "currentColor" : "none"} />
                                                    </button>
                                                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors shadow-xl">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Caption */}
                                            <div className="mt-2 text-center">
                                                <p className="text-lg font-playfair italic text-[#1A1A1A] mb-2">"{post.caption}"</p>
                                                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                                                    <span>{post.likes} Admirers</span>
                                                    <span>•</span>
                                                    <span>{Math.floor(Math.random() * 20)} Comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="challenges"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-24"
                        >
                            {/* ACTIVE CHALLENGE - "THE FEATURE" */}
                            <div className="relative bg-[#1A1A1A] text-[#F9F9F7] overflow-hidden min-h-[500px] flex items-center group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-1000 transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

                                <div className="relative z-10 px-8 md:px-16 w-full md:w-1/2">
                                    <div className="flex items-center gap-2 text-[#D4AF37] mb-6">
                                        <Award className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Editor's Challenge</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl mb-6 leading-[0.9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        The <br /> <span className="italic font-light text-white/50">Monochrome</span> <br /> Edit
                                    </h2>
                                    <p className="text-lg text-white/80 font-light mb-8 max-w-sm">
                                        Master the art of single-hue styling. Create a compelling look using varying shades of a single color.
                                    </p>
                                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        <Button className="bg-[#FAF9F6] text-[#1A1A1A] hover:bg-white px-8 py-6 text-xs uppercase tracking-widest rounded-none border border-transparent hover:border-white transition-all">
                                            Submit Entry
                                        </Button>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Time Remaining</p>
                                            <div className="font-playfair text-2xl">48 : 12 : 00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* HALL OF FAME */}
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h3 className="text-4xl text-[#1A1A1A] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Hall of <span className="italic text-[#80163A]">Fame</span>
                                    </h3>
                                    <p className="text-gray-500 mb-8 max-w-sm">
                                        Celebrating the visionaries who defined the season's aesthetic.
                                    </p>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-6 p-4 border-b border-[#E5E5E5] hover:border-[#1A1A1A] transition-colors group cursor-pointer">
                                                <span className="text-2xl font-playfair text-[#E5E5E5] group-hover:text-[#D4AF37] transition-colors">0{i}</span>
                                                <div>
                                                    <p className="text-lg font-playfair italic text-[#1A1A1A] mb-1">"Date Night in Milan"</p>
                                                    <p className="text-xs uppercase tracking-widest text-gray-400">Winner: @elena_fashion</p>
                                                </div>
                                                <ArrowDiagonal className="ml-auto w-4 h-4 text-gray-300 group-hover:text-[#1A1A1A]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Abstract Winners Visual */}
                                    <div className="aspect-[3/4] bg-[#F5F5F5] translate-y-8"></div>
                                    <div className="aspect-[3/4] bg-[#E5E5E5]"></div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}

const ArrowDiagonal = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
);

export default SocialPage;
