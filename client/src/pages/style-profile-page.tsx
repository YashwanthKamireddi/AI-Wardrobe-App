import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Sparkles, Palette, Scissors, ArrowRight, Check } from "lucide-react";
import { useStyleProfile, useSubmitStyleQuiz } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";

export function StyleProfilePage() {
    const { data: profile } = useStyleProfile();
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                <motion.header
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Personal Stylist</p>
                    <h1
                        className="text-[#1A1A1A] mb-4"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2.5rem, 6vw, 4rem)",
                            lineHeight: 1.1
                        }}
                    >
                        Style <span className="italic font-light">DNA</span>
                    </h1>
                </motion.header>

                {/* Profile Overview or Quiz Prompt */}
                {(!profile || !profile.styleType) ? (
                    <motion.div
                        className="bg-[#1A1A1A] text-white rounded-3xl p-8 md:p-12 text-center overflow-hidden relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#80163A] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#E6B0AA]" />
                            <h2 className="text-3xl md:text-4xl font-playfair mb-4">Discover Your Signature Look</h2>
                            <p className="text-white/70 mb-8 text-lg">
                                Take our advanced style diagnostic to understand your unique aesthetic, color season, and fit preferences.
                            </p>
                            <Button
                                onClick={() => setIsQuizOpen(true)}
                                className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-lg"
                            >
                                Start Style Quiz
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Results Display - Mocked for now if profile exists but we just built the backend */}
                        <ProfileCard
                            title="Your Aesthetic"
                            value={profile.styleType || "Minimalist Chic"}
                            icon={<Scissors className="w-6 h-6" />}
                            description="Clean lines, neutral palette, and functional elegance define your wardrobe."
                        />
                        <ProfileCard
                            title="Color Season"
                            value={profile.colorSeason || "Deep Autumn"}
                            icon={<Palette className="w-6 h-6" />}
                            description="Rich, warm, and earthy tones compliment your complexion best."
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ProfileCard({ title, value, icon, description }: any) {
    return (
        <motion.div
            className="bg-white p-8 rounded-3xl border border-[#E5E5E5]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="w-12 h-12 bg-[#F9F9F7] rounded-full flex items-center justify-center text-[#1A1A1A] mb-6">
                {icon}
            </div>
            <h3 className="text-sm uppercase tracking-wider text-[#9A9A9A] mb-2 font-bold">{title}</h3>
            <div className="text-3xl font-playfair text-[#1A1A1A] mb-4">{value}</div>
            <p className="text-[#6B6B6B] leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

export default StyleProfilePage;
