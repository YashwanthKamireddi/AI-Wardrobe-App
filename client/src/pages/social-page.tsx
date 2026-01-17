import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Heart, Share2, MessageCircle, Trophy, Users, Award } from "lucide-react";
import { useCommunityFeed, useChallenges, useLikeOutfit, useUnlikeOutfit } from "@/hooks/use-social";
import { Button } from "@/components/ui/button";

export function SocialPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'challenges'>('feed');
    const { data: feed } = useCommunityFeed();
    const { data: challenges } = useChallenges();
    const likeOutfit = useLikeOutfit();
    const unlikeOutfit = useUnlikeOutfit();

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Community</p>
                    <h1
                        className="text-[#1A1A1A] mb-4"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2.5rem, 6vw, 4rem)",
                            lineHeight: 1.1
                        }}
                    >
                        Style <span className="italic font-light">Network</span>
                    </h1>
                </motion.header>

                {/* Tabs */}
                <div className="flex justify-center mb-12 border-b border-[#E5E5E5]">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'feed' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A]'
                                }`}
                        >
                            Community Feed
                            {activeTab === 'feed' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'challenges' ? 'text-[#1A1A1A]' : 'text-[#9A9A9A]'
                                }`}
                        >
                            Style Challenges
                            {activeTab === 'challenges' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]"
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'feed' ? (
                        <motion.div
                            key="feed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Empty State for now if no feed */}
                            {(!feed || feed.length === 0) && (
                                <div className="text-center py-20 bg-[#F9F9F7] rounded-3xl">
                                    <Users className="w-12 h-12 mx-auto text-[#D5D5D5] mb-4" />
                                    <h3 className="text-xl font-medium text-[#1A1A1A] mb-2 font-playfair">
                                        Community Feed Quiet
                                    </h3>
                                    <p className="text-[#6B6B6B]">
                                        Be the first to share your outfit!
                                    </p>
                                </div>
                            )}

                            {/* Feed Items Mapping (Mock structure for visual if empty) */}
                            {feed?.map((post: any) => (
                                <div key={post.id} className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
                                    <div className="p-4 flex items-center gap-3 border-b border-[#F5F5F5]">
                                        <div className="w-10 h-10 rounded-full bg-[#F5F5F5]" />
                                        <div>
                                            <p className="font-medium text-[#1A1A1A]">{post.userName}</p>
                                            <p className="text-xs text-[#6B6B6B]">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="aspect-[4/5] bg-[#F5F5F5]">
                                        {/* Image would go here */}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center gap-4 mb-3">
                                            <button className="hover:text-[#80163A] transition-colors">
                                                <Heart className="w-6 h-6" />
                                            </button>
                                            <button className="hover:text-[#80163A] transition-colors">
                                                <MessageCircle className="w-6 h-6" />
                                            </button>
                                            <button className="hover:text-[#80163A] transition-colors ml-auto">
                                                <Share2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <p className="text-[#1A1A1A] font-medium mb-1">{post.likes} likes</p>
                                        <p className="text-[#6B6B6B] text-sm"><span className="text-[#1A1A1A] font-medium">{post.userName}</span> {post.caption}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="challenges"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {/* Always show a sample challenge even if API empty for demo */}
                            <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium mb-4 backdrop-blur-sm">
                                        <Award className="w-3 h-3" />
                                        Active Challenge
                                    </div>
                                    <h3 className="text-2xl font-playfair mb-2">Summer Minimalist</h3>
                                    <p className="text-white/60 text-sm mb-6 line-clamp-2">
                                        Create a stunning outfit using only neutral colors and maximum 3 items.
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-white/40">Ends in 2 days</div>
                                        <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6">
                                            Join Now
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Challenges */}
                            <div className="bg-[#F9F9F7] rounded-3xl p-8 border border-[#E5E5E5]">
                                <h3 className="text-xl font-playfair text-[#1A1A1A] mb-4">Past Winners</h3>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-[#E5E5E5]">
                                            <div className="w-12 h-12 bg-[#F5F5F5] rounded-lg" />
                                            <div>
                                                <p className="font-medium text-[#1A1A1A] text-sm">Date Night Chic</p>
                                                <p className="text-xs text-[#6B6B6B]">Winner: @sarah_style</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}

export default SocialPage;
