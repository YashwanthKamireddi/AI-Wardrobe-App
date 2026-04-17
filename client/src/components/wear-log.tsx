/**
 * WEAR LOG COMPONENT
 *
 * Premium wear tracking interface following Celura Design System.
 * Allows users to log what they wore today with outfit/item selection.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, subDays } from "date-fns";
import {
    Calendar,
    Plus,
    X,
    Star,
    Sun,
    Cloud,
    CloudRain,
    Snowflake,
    CheckCircle2,
    Clock,
    Shirt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWearLogs, useCreateWearLog, WearLog, CreateWearLogInput } from "@/hooks/use-wear-logs";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

interface WearLogDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WearLogDialog({ isOpen, onClose }: WearLogDialogProps) {
    const [step, setStep] = useState<'type' | 'select' | 'details'>('type');
    const [logType, setLogType] = useState<'outfit' | 'items'>('items');
    const [selectedOutfitId, setSelectedOutfitId] = useState<number | null>(null);
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [occasion, setOccasion] = useState("");
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [wornDate, setWornDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: items } = useWardrobeItems();
    const { data: outfits } = useOutfits();
    const createLog = useCreateWearLog();

    const occasions = [
        "Work", "Casual", "Date Night", "Party", "Formal", "Workout", "Travel", "Other"
    ];

    const handleSubmit = async () => {
        const data: CreateWearLogInput = {
            wornDate,
            occasion: occasion || undefined,
            rating: rating || undefined,
            notes: notes || undefined,
        };

        if (logType === 'outfit' && selectedOutfitId) {
            data.outfitId = selectedOutfitId;
        } else if (selectedItemIds.length > 0) {
            data.wardrobeItemIds = selectedItemIds;
        }

        try {
            await createLog.mutateAsync(data);
            onClose();
            // Reset state
            setStep('type');
            setSelectedOutfitId(null);
            setSelectedItemIds([]);
            setOccasion("");
            setRating(0);
            setNotes("");
        } catch (error) {
            console.error("Failed to create wear log:", error);
        }
    };

    const toggleItem = (id: number) => {
        setSelectedItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white w-full md:max-w-lg md:rounded-2xl md:shadow-2xl overflow-hidden"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="border-b border-gray-100 p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-playfair italic text-[#1A1A1A]">Log Your Look</h2>
                            <p className="text-xs text-gray-400 mt-1">Track what you wore today</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {step === 'type' && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 mb-4">What did you wear?</p>

                                <button
                                    onClick={() => { setLogType('outfit'); setStep('select'); }}
                                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-[#80163A] hover:bg-[#80163A]/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#80163A] to-[#D4AF37] rounded-xl flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[#1A1A1A]">Saved Outfit</h3>
                                            <p className="text-xs text-gray-400">Choose from your outfits</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setLogType('items'); setStep('select'); }}
                                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-[#80163A] hover:bg-[#80163A]/5 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] rounded-xl flex items-center justify-center">
                                            <Shirt className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[#1A1A1A]">Individual Items</h3>
                                            <p className="text-xs text-gray-400">Select specific pieces</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {step === 'select' && logType === 'outfit' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={() => setStep('type')} className="text-sm text-gray-400 hover:text-[#80163A]">
                                        ← Back
                                    </button>
                                    <p className="text-sm text-gray-600">Select an outfit</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {outfits?.map(outfit => (
                                        <button
                                            key={outfit.id}
                                            onClick={() => { setSelectedOutfitId(outfit.id); setStep('details'); }}
                                            className={`p-3 border rounded-xl text-left transition-all ${selectedOutfitId === outfit.id
                                                    ? 'border-[#80163A] bg-[#80163A]/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-medium text-sm truncate">{outfit.name}</p>
                                            <p className="text-xs text-gray-400">{outfit.items?.length || 0} items</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 'select' && logType === 'items' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={() => setStep('type')} className="text-sm text-gray-400 hover:text-[#80163A]">
                                        ← Back
                                    </button>
                                    <p className="text-sm text-gray-600">
                                        {selectedItemIds.length} selected
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {items?.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${selectedItemIds.includes(item.id)
                                                    ? 'border-[#80163A] ring-2 ring-[#80163A]/20'
                                                    : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <Shirt className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                            {selectedItemIds.includes(item.id) && (
                                                <div className="absolute inset-0 bg-[#80163A]/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {selectedItemIds.length > 0 && (
                                    <Button
                                        onClick={() => setStep('details')}
                                        className="w-full bg-[#1A1A1A] text-white hover:bg-[#333]"
                                    >
                                        Continue
                                    </Button>
                                )}
                            </div>
                        )}

                        {step === 'details' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={() => setStep('select')} className="text-sm text-gray-400 hover:text-[#80163A]">
                                        ← Back
                                    </button>
                                    <p className="text-sm text-gray-600">Add details</p>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                                    <input
                                        type="date"
                                        value={wornDate}
                                        onChange={e => setWornDate(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#80163A]"
                                    />
                                </div>

                                {/* Occasion */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Occasion</label>
                                    <div className="flex flex-wrap gap-2">
                                        {occasions.map(occ => (
                                            <button
                                                key={occ}
                                                onClick={() => setOccasion(occ)}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${occasion === occ
                                                        ? 'bg-[#1A1A1A] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {occ}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">How did you feel?</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="p-1"
                                            >
                                                <Star
                                                    className={`w-8 h-8 transition-all ${star <= rating
                                                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                                                            : 'text-gray-200'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Notes (optional)</label>
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="How was your outfit today?"
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#80163A] resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {step === 'details' && (
                        <div className="border-t border-gray-100 p-6">
                            <Button
                                onClick={handleSubmit}
                                disabled={createLog.isPending}
                                className="w-full bg-gradient-to-r from-[#80163A] to-[#D4AF37] text-white hover:opacity-90 h-12"
                            >
                                {createLog.isPending ? "Saving..." : "Log This Look"}
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Compact Wear Log Button for quick access
 */
export function WearLogButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#80163A] to-[#D4AF37] shadow-lg shadow-[#80163A]/30 flex items-center justify-center hover:scale-105 transition-transform"
            >
                <Plus className="w-6 h-6 text-white" />
            </button>
            <WearLogDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

/**
 * Wear History Timeline
 */
export function WearHistoryTimeline() {
    const { data: logs, isLoading } = useWearLogs();

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                <Clock className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg text-[#1A1A1A] mb-2 font-playfair italic">No Wear History</h3>
                <p className="text-sm text-gray-400 mb-4">Start logging your outfits to build your style diary</p>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM d, yyyy');
    };

    return (
        <div className="space-y-4">
            {logs.slice(0, 10).map((log, index) => (
                <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                >
                    {/* Date */}
                    <div className="text-center min-w-[60px]">
                        <p className="text-xs text-gray-400 font-medium">{formatDate(log.wornDate)}</p>
                    </div>

                    {/* Items preview */}
                    <div className="flex -space-x-2">
                        {(log.itemDetails || []).slice(0, 4).map(item => (
                            <div
                                key={item.id}
                                className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                            >
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Shirt className="w-4 h-4 text-gray-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        {log.occasion && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                {log.occasion}
                            </span>
                        )}
                        {log.notes && (
                            <p className="text-sm text-gray-500 truncate mt-1">{log.notes}</p>
                        )}
                    </div>

                    {/* Rating */}
                    {log.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-sm font-medium">{log.rating}</span>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

export default WearLogDialog;
