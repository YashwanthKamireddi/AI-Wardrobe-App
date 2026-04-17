import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Sun, Layers, Sparkles, Edit2, Trash2, X, Search } from "lucide-react";
import { useCapsules, useDeleteCapsule } from "@/hooks/use-advanced";
import { Button } from "@/components/ui/button";
import { CapsuleDialog } from "@/components/capsule-dialog";
import { useToast } from "@/hooks/use-toast";

/**
 * CAPSULES PAGE - "THE COLLECTIONS" (Mobile-First V2.0)
 *
 * Design Philosophy: Fashion House Archives.
 * - Mobile-first, native app feel
 * - Editorial typography (Playfair Display)
 * - Clean lines, seasonal indicators
 * - Index numbers on cards
 */

export function CapsulesPage() {
    const { data: capsules, isLoading } = useCapsules();
    const deleteCapsule = useDeleteCapsule();
    const { toast } = useToast();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCapsule, setEditingCapsule] = useState<any>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter capsules based on search
    const filteredCapsules = capsules?.filter(capsule =>
        capsule.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Loading State
    if (isLoading) {
        return (
            <AppLayout>
                <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#80163A]" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Loading Collections...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FDFBF7]">

                {/* ========================================== */}
                {/* MOBILE HEADER - Sticky */}
                {/* ========================================== */}
                <motion.header
                    className="md:hidden sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-black/5"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="px-4 h-14 flex items-center justify-between">
                        <div>
                            <h1 className="text-[#1A1A1A] font-playfair text-lg font-bold leading-none">Collections</h1>
                            <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                                {filteredCapsules.length} CAPSULES
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-[#1A1A1A]"
                            >
                                {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                            </button>
                            <motion.button
                                onClick={handleCreateNew}
                                className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white"
                                whileTap={{ scale: 0.9 }}
                            >
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile Search Bar - Expandable */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-black/5"
                            >
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Search collections..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1A1A1A]"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.header>

                {/* ========================================== */}
                {/* DESKTOP HEADER - Editorial Style */}
                {/* ========================================== */}
                <div className="hidden md:block max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">
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
                </div>

                {/* ========================================== */}
                {/* COLLECTION GRID */}
                {/* ========================================== */}
                <div className="px-0 md:px-12 md:max-w-[1400px] md:mx-auto pb-24 md:pb-12">

                    {/* Desktop Grid */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">

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

                        {/* Collection Cards */}
                        {filteredCapsules.map((capsule: any, i: number) => (
                            <CapsuleCard
                                key={capsule.id}
                                capsule={capsule}
                                index={i + 1}
                                onEdit={() => handleEdit(capsule)}
                                onDelete={() => handleDelete(capsule)}
                            />
                        ))}
                    </div>

                    {/* Mobile Grid - 2 columns, edge-to-edge */}
                    <div className="md:hidden">
                        {filteredCapsules.length > 0 ? (
                            <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                                {filteredCapsules.map((capsule: any, i: number) => (
                                    <MobileCapsuleCard
                                        key={capsule.id}
                                        capsule={capsule}
                                        index={i + 1}
                                        onEdit={() => handleEdit(capsule)}
                                        onDelete={() => handleDelete(capsule)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState onCreateNew={handleCreateNew} />
                        )}
                    </div>

                    {/* Desktop Empty State */}
                    {filteredCapsules.length === 0 && (
                        <div className="hidden md:block">
                            <EmptyState onCreateNew={handleCreateNew} />
                        </div>
                    )}
                </div>

                {/* ========================================== */}
                {/* MOBILE FAB - Create New */}
                {/* ========================================== */}
                <motion.button
                    onClick={handleCreateNew}
                    className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-[#1A1A1A] text-white shadow-2xl flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                >
                    <Plus className="w-6 h-6" />
                </motion.button>
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

// ============================================================
// MOBILE CAPSULE CARD - Native App Feel
// ============================================================
interface CapsuleCardProps {
    capsule: any;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

function MobileCapsuleCard({ capsule, index, onEdit, onDelete }: CapsuleCardProps) {
    return (
        <motion.div
            onClick={onEdit}
            className="bg-white aspect-[3/4] relative overflow-hidden active:opacity-90 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
        >
            {/* Image Grid */}
            {capsule.items && capsule.items.length > 0 && capsule.resolvedItems ? (
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#1A1A1A]">
                    {capsule.resolvedItems.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="relative overflow-hidden bg-white">
                            {item?.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA]">
                                    <Sparkles className="w-4 h-4 text-gray-200" />
                                </div>
                            )}
                        </div>
                    ))}
                    {/* Fill remaining slots */}
                    {Array.from({ length: Math.max(0, 4 - (capsule.resolvedItems?.length || 0)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-[#FAFAFA] flex items-center justify-center">
                            <Plus className="w-3 h-3 text-gray-200" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-[9px] uppercase tracking-widest text-gray-400">Add Items</span>
                </div>
            )}

            {/* Info Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                <p className="text-white text-sm font-playfair italic truncate drop-shadow-sm">{capsule.name}</p>
                <p className="text-white/70 text-[10px] font-mono uppercase tracking-wider">
                    {capsule.items?.length || 0} items
                </p>
            </div>

            {/* Season Badge */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <Sun className="w-2.5 h-2.5 text-[#D4AF37]" />
                {capsule.season || "SS25"}
            </div>

            {/* Index Number */}
            <div className="absolute top-2 left-2 text-white/30 font-playfair text-2xl font-light">
                0{index}
            </div>
        </motion.div>
    );
}

// ============================================================
// DESKTOP CAPSULE CARD - Editorial Style
// ============================================================
function CapsuleCard({ capsule, index, onEdit, onDelete }: CapsuleCardProps) {
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
                {/* Real Item Images Grid or Placeholder */}
                {capsule.items && capsule.items.length > 0 && capsule.resolvedItems ? (
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#1A1A1A]">
                        {capsule.resolvedItems.slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="relative overflow-hidden bg-white">
                                {item?.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA]">
                                        <Sparkles className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Fill remaining slots if less than 4 items */}
                        {Array.from({ length: Math.max(0, 4 - (capsule.resolvedItems?.length || 0)) }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-[#FAFAFA] flex items-center justify-center">
                                <Plus className="w-4 h-4 text-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700">
                        <Sparkles className="w-12 h-12 text-white opacity-50 mb-4" />
                        <span className="text-[10px] uppercase tracking-widest text-white/50">Add Items</span>
                    </div>
                )}

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

                {/* Action Menu */}
                {showActions && (
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

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
    return (
        <motion.div
            className="py-24 md:py-32 text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl md:text-3xl text-[#1A1A1A] mb-3 font-playfair italic">
                Your Collections Await
            </h3>
            <p className="text-gray-500 text-sm md:text-base mb-8 max-w-sm mx-auto">
                Create your first capsule wardrobe to organize outfits by season, occasion, or style.
            </p>
            <Button
                onClick={onCreateNew}
                className="bg-[#1A1A1A] text-white hover:bg-[#80163A] px-8 h-12 uppercase tracking-widest text-xs"
            >
                <Plus className="w-4 h-4 mr-2" />
                Draft First Collection
            </Button>
        </motion.div>
    );
}

export default CapsulesPage;
