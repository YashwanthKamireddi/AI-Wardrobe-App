import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { useCommunityFeed, useChallenges } from "@/hooks/use-social";
import { SocialOutfitCard } from "@/components/social/social-outfit-card";
import { Trophy, Flame, Users } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/**
 * SOCIAL FEED PAGE
 *
 * Community hub for outfit inspiration, sharing, and challenges
 * Design: Instagram-style luxurious feed with horizontal stories/challenges
 */

export default function SocialPage() {
    const { data: feed, isLoading: feedLoading } = useCommunityFeed();
    const { data: challenges } = useChallenges();

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1
                        className="text-[#1A1A1A]"
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem" }}
                    >
                        Community
                    </h1>
                    <div className="flex gap-4">
                        <Users className="w-6 h-6 text-[#1A1A1A]" />
                    </div>
                </div>

                {/* Active Challenges (Stories style) */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-[#80163A]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Active Challenges</h2>
                    </div>

                    <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                        <div className="flex flex-nowrap w-max space-x-4 p-1">
                            {/* Create Challenge Card */}
                            <motion.div
                                className="w-32 h-44 rounded-xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center bg-[#F9F9F7] shrink-0 cursor-pointer hover:border-[#80163A]/50 transition-colors"
                                whileHover={{ scale: 0.98 }}
                            >
                                <div className="w-8 h-8 rounded-full bg-[#80163A] flex items-center justify-center mb-2">
                                    <Flame className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-[#1A1A1A]">Join</span>
                            </motion.div>

                            {/* Challenge Cards */}
                            {challenges?.map((challenge) => (
                                <motion.div
                                    key={challenge.id}
                                    className="w-32 h-44 rounded-xl relative overflow-hidden shrink-0 cursor-pointer group"
                                    whileHover={{ scale: 0.98 }}
                                >
                                    <img src={challenge.coverImage || "/placeholder-challenge.jpg"} className="w-full h-full object-cover" alt={challenge.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                                        <p className="text-white text-xs font-bold whitespace-normal line-clamp-2">{challenge.title}</p>
                                        <p className="text-white/80 text-[10px]">{challenge.participants} joined</p>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-[#80163A] text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                                        {challenge.daysLeft}d left
                                    </div>
                                </motion.div>
                            ))}

                            {/* Placeholder Data if empty */}
                            {(!challenges || challenges.length === 0) && (
                                <>
                                    <div className="w-32 h-44 rounded-xl bg-gray-200 shrink-0 animate-pulse" />
                                    <div className="w-32 h-44 rounded-xl bg-gray-200 shrink-0 animate-pulse" />
                                </>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                </div>

                {/* Main Feed */}
                <div className="space-y-8">
                    {feedLoading ? (
                        // Skeleton Loaders
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl h-[500px] border border-[#E5E5E5] animate-pulse" />
                        ))
                    ) : feed && feed.length > 0 ? (
                        feed.map((outfit) => (
                            <SocialOutfitCard key={outfit.id} outfit={outfit} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-[#E5E5E5]">
                            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-[#D5D5D5]" />
                            </div>
                            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">Community is growing</h3>
                            <p className="text-sm text-[#6B6B6B] max-w-xs mx-auto">
                                Be the first to share your outfit! Create an outfit and make it public.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
