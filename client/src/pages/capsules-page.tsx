import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Archive, Calendar, Sun, ArrowRight } from "lucide-react";
import { useCapsules } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";

export function CapsulesPage() {
    const { data: capsules } = useCapsules();

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                <motion.header
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Curated Collections</p>
                        <h1
                            className="text-[#1A1A1A]"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                                lineHeight: 1.1
                            }}
                        >
                            Capsule <span className="italic font-light">Wardrobes</span>
                        </h1>
                    </div>
                    <Button className="rounded-full bg-[#1A1A1A] text-white px-6 h-12 hover:bg-[#80163A] transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        New Capsule
                    </Button>
                </motion.header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <motion.button
                        className="group relative aspect-[4/5] rounded-3xl border-2 border-dashed border-[#E5E5E5] hover:border-[#80163A] hover:bg-[#80163A]/5 transition-all flex flex-col items-center justify-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 0.98 }}
                    >
                        <div className="w-16 h-16 rounded-full bg-[#F5F5F5] group-hover:bg-[#80163A]/10 flex items-center justify-center transition-colors">
                            <Plus className="w-8 h-8 text-[#9A9A9A] group-hover:text-[#80163A]" />
                        </div>
                        <p className="text-[#6B6B6B] font-medium group-hover:text-[#80163A]">Create New Collection</p>
                    </motion.button>

                    {/* Example/Real Capsules */}
                    {(!capsules || capsules.length === 0) ? (
                        // Demo Capsule if none exist
                        <CapsuleCard
                            title="Spring Essentials"
                            items={12}
                            type="Seasonal"
                            season="Spring 2024"
                            imageURL="/demo-capsule-1.jpg" // Placeholder logic handled in card
                        />
                    ) : (
                        capsules.map((capsule: any) => (
                            <CapsuleCard
                                key={capsule.id}
                                title={capsule.name}
                                items={capsule.items.length}
                                type={capsule.type}
                                season={capsule.season}
                            />
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function CapsuleCard({ title, items, type, season, imageURL }: any) {
    return (
        <motion.div
            className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#F5F5F5] cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ y: -8 }}
        >
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-[#E5E5E5]">
                {/* In a real app we'd display a collage of items here */}
                <div className="w-full h-full flex items-center justify-center text-[#D5D5D5]">
                    <Archive className="w-12 h-12" />
                </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-2 opacity-80">
                    {season && <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> {season}</span>}
                    {type && <span className="w-1 h-1 bg-white rounded-full" />}
                    {type}
                </div>
                <h3 className="text-2xl font-playfair mb-2">{title}</h3>
                <div className="flex items-center justify-between">
                    <p className="text-sm opacity-80">{items} Items</p>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default CapsulesPage;
