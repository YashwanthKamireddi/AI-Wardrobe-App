import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Sun, Layers, Sparkles, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { useCapsules, useDeleteCapsule } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";
import { CapsuleDialog } from "@/components/capsule-dialog";
import { useToast } from "@/hooks/use-toast";

/**
 * CAPSULES PAGE - "THE COLLECTIONS"
 *
 * Design Philosophy: Fashion House Archives.
 * - Layout: Lookbook Grid.
 * - Typography: Editorial Serifs mixed with Utilitarian Mono.
 * - Visuals: Clean lines, seasonal indicators.
 */

export function CapsulesPage() {
    const { data: capsules, isLoading } = useCapsules();
    const deleteCapsule = useDeleteCapsule();
    const { toast } = useToast();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCapsule, setEditingCapsule] = useState<any>(null);

    const handleCreateNew = () => {
        setEditingCapsule(null);
        setDialogOpen(true);
    };

    const handleEdit = (capsule: any) => {
        setEditingCapsule(capsule);
        setDialogOpen(true);
    };

    const handleDelete = async (capsule: any) => {
        if (!confirm(`Delete "${capsule.name}"? This cannot be undone.`)) return;

        try {
            await deleteCapsule.mutateAsync(capsule.id);
            toast({ title: "Deleted", description: `"${capsule.name}" has been removed.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete collection.", variant: "destructive" });
        }
    };

    return (
        <AppLayout>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">

                {/* 1. HEADER */}
                <motion.header
                    className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 -z-10 opacity-5">
                        <h1 className="text-9xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Editions</h1>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4 border-b border-[#80163A] pb-2 inline-flex">
                            <Layers className="w-4 h-4 text-[#80163A]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#80163A]">Curated Collections</span>
                        </div>
                        <h1
                            className="text-[#1A1A1A] leading-[0.9]"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(3rem, 7vw, 6rem)",
                            }}
                        >
                            Capsule <span className="italic font-light text-[#6B6B6B]">Wardrobes</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Active Season</p>
                            <p className="text-xl font-playfair text-[#1A1A1A]">Spring / Summer 25</p>
                        </div>
                        <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
                        <Button
                            onClick={handleCreateNew}
                            className="rounded-none bg-[#1A1A1A] text-white px-8 h-14 hover:bg-[#80163A] transition-all uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl"
                        >
                            <Plus className="w-4 h-4" />
                            Draft New Collection
                        </Button>
                    </div>
                </motion.header>

                {/* 2. COLLECTION GRID */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">

                    {/* "Create New" Blueprint Card */}
                    <motion.button
                        onClick={handleCreateNew}
                        className="group relative aspect-[3/4] border border-dashed border-[#1A1A1A]/20 hover:border-[#80163A] bg-[#FAF9F6] transition-all flex flex-col items-center justify-center gap-6 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Grid Pattern BG */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>

                        <div className="w-20 h-20 rounded-full border border-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 bg-white z-10">
                            <Plus className="w-8 h-8 text-[#1A1A1A]" strokeWidth={1} />
                        </div>
                        <div className="text-center z-10">
                            <p className="text-lg font-playfair italic text-[#1A1A1A] mb-2">New Concept</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Start Blank Canvas</p>
                        </div>
                    </motion.button>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="col-span-2 flex items-center justify-center py-20">
                            <div className="animate-pulse text-gray-400">Loading collections...</div>
                        </div>
                    )}

                    {/* Collection Cards */}
                    {(!capsules || capsules.length === 0) && !isLoading ? (
                        // Demo Capsule if none exist
                        <CapsuleCard
                            capsule={{ id: 0, name: "Spring Essentials", items: [], type: "Seasonal", season: "SS25" }}
                            index={1}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            isDemo
                        />
                    ) : (
                        capsules?.map((capsule: any, i: number) => (
                            <CapsuleCard
                                key={capsule.id}
                                capsule={capsule}
                                index={i + 1}
                                onEdit={() => handleEdit(capsule)}
                                onDelete={() => handleDelete(capsule)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Capsule Dialog */}
            <CapsuleDialog
                isOpen={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditingCapsule(null);
                }}
                capsule={editingCapsule}
            />
        </AppLayout>
    );
}

interface CapsuleCardProps {
    capsule: any;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    isDemo?: boolean;
}

function CapsuleCard({ capsule, index, onEdit, onDelete, isDemo }: CapsuleCardProps) {
    const [showActions, setShowActions] = useState(false);

    return (
        <motion.div
            className="group cursor-pointer relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-[#E5E5E5] overflow-hidden mb-6">
                {/* Image Placeholder or Actual Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <Sparkles className="w-12 h-12 text-white opacity-50 mb-4" />
                    <span className="text-[10px] uppercase tracking-widest text-white/50">Collection Preview</span>
                </div>

                {/* Info Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="border-white text-white hover:bg-white hover:text-black uppercase tracking-widest text-xs h-12 px-8 bg-transparent"
                    >
                        View Lookbook
                    </Button>
                </div>

                {/* Season Label Absolute */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                    <Sun className="w-3 h-3 text-[#D4AF37]" />
                    {capsule.season || "SS25"}
                </div>

                {/* Action Menu (non-demo only) */}
                {!isDemo && showActions && (
                    <div className="absolute top-4 left-4 flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="w-8 h-8 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-[#80163A] hover:text-white transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-8 h-8 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Typography */}
            <div className="border-t border-[#1A1A1A] pt-4">
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-2xl text-[#1A1A1A] font-playfair italic group-hover:text-[#80163A] transition-colors">
                        {capsule.name}
                    </h3>
                    <span className="text-4xl font-light text-gray-200 font-playfair">0{index}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 font-mono uppercase tracking-widest">
                    <span>{capsule.items?.length || 0} Items</span>
                    <span>{capsule.type || "Curated"}</span>
                </div>
            </div>
        </motion.div>
    );
}

export default CapsulesPage;
