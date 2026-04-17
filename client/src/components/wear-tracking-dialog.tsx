/**
 * WEAR TRACKING DIALOG - "THE JOURNAL"
 *
 * Design Philosophy: Editorial Daily Log meets Fashion Diary.
 * - Typography: Playfair Display headlines, clean labels
 * - Layout: Premium structured form with visual hierarchy
 * - Aesthetic: Luxury fashion house appointment booking
 */

import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, Check, Camera, Calendar, Sparkles, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { OutfitSelfieCapture, OutfitSelfie } from "@/components/outfit-selfie";

interface WearTrackingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: {
        id: number;
        name: string;
        imageUrl: string;
    };
    outfitId?: number;
}

const OCCASIONS = [
    { value: "work", label: "Work", icon: "💼" },
    { value: "casual", label: "Casual", icon: "☀️" },
    { value: "date", label: "Date Night", icon: "❤️" },
    { value: "formal", label: "Formal", icon: "🎩" },
    { value: "party", label: "Party", icon: "🎉" },
    { value: "wedding", label: "Wedding", icon: "💒" },
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "other", label: "Other", icon: "✨" },
];

export function WearTrackingDialog({
    open,
    onOpenChange,
    item,
    outfitId,
}: WearTrackingDialogProps) {
    const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [occasion, setOccasion] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [rating, setRating] = useState<number>(0);
    const [showSelfieCapture, setShowSelfieCapture] = useState(false);
    const [capturedSelfie, setCapturedSelfie] = useState<Omit<OutfitSelfie, "id"> | null>(null);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createWearLog = useMutation({
        mutationFn: async (data: {
            wardrobeItemId?: number;
            outfitId?: number;
            wornDate: string;
            occasion: string;
            notes: string;
            rating: number;
        }) => {
            const response = await fetch("/api/wear-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...data,
                    wornDate: new Date(data.wornDate).toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to log wear");
            }

            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Wear Logged",
                description: item
                    ? `"${item.name}" marked as worn.`
                    : "Outfit marked as worn.",
            });
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
            queryClient.invalidateQueries({ queryKey: ["/api/wear-log"] });
            if (item) {
                queryClient.invalidateQueries({
                    queryKey: [`/api/wardrobe/${item.id}/wear-log`],
                });
            }
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to log wear. Please try again.",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setDate(format(new Date(), "yyyy-MM-dd"));
        setOccasion("");
        setNotes("");
        setRating(0);
        setCapturedSelfie(null);
    };

    const handleSubmit = () => {
        createWearLog.mutate({
            wardrobeItemId: item?.id,
            outfitId: outfitId,
            wornDate: date,
            occasion: occasion,
            notes: notes,
            rating: rating || 0,
        });
    };

    const handleQuickWear = () => {
        createWearLog.mutate({
            wardrobeItemId: item?.id,
            outfitId: outfitId,
            wornDate: format(new Date(), "yyyy-MM-dd"),
            occasion: "",
            notes: "",
            rating: 0,
        });
    };

    const handleSelfieCapture = (selfie: Omit<OutfitSelfie, "id">) => {
        setCapturedSelfie(selfie);
        // Auto-set rating based on mood
        const moodToRating: Record<string, number> = {
            "great": 5,
            "good": 4,
            "okay": 3,
            "meh": 2,
        };
        setRating(moodToRating[selfie.mood] || 0);
        if (selfie.notes) {
            setNotes(selfie.notes);
        }
    };

    if (!open) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onOpenChange(false)}
                >
                    <motion.div
                        className="bg-[#FAF9F6] w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#E5E5E5]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-[#80163A] font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        The Journal
                                    </p>
                                    <h2
                                        className="text-2xl text-[#1A1A1A]"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        Log <span className="italic text-[#6B6B6B]">Wear</span>
                                    </h2>
                                </div>
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#1A1A1A]" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Item Preview */}
                            {item && (
                                <div className="flex items-center gap-4 p-4 bg-white border border-[#E5E5E5]">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-16 h-20 object-cover"
                                    />
                                    <div>
                                        <p
                                            className="text-lg text-[#1A1A1A]"
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        >
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                            Tracking wear
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Wear Button */}
                            <motion.button
                                onClick={handleQuickWear}
                                disabled={createWearLog.isPending}
                                className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 hover:bg-[#80163A] transition-colors disabled:opacity-50"
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check className="w-4 h-4" />
                                Mark as Worn Today
                            </motion.button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-[#E5E5E5]" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#FAF9F6] px-4 text-[10px] uppercase tracking-widest text-gray-400">
                                        Or Add Details
                                    </span>
                                </div>
                            </div>

                            {/* Selfie Capture */}
                            <div>
                                {capturedSelfie ? (
                                    <div className="relative">
                                        <img
                                            src={capturedSelfie.imageUrl}
                                            alt="Outfit selfie"
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                                                <span className="text-white text-[10px] uppercase tracking-widest">
                                                    Selfie Captured
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setCapturedSelfie(null)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-white/90 flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <motion.button
                                        onClick={() => setShowSelfieCapture(true)}
                                        className="w-full py-4 border border-dashed border-[#E5E5E5] hover:border-[#80163A] bg-white hover:bg-[#80163A]/5 transition-all flex items-center justify-center gap-3"
                                        whileHover={{ y: -2 }}
                                    >
                                        <Camera className="w-5 h-5 text-[#80163A]" />
                                        <span className="text-sm text-[#1A1A1A]">Capture Outfit Selfie</span>
                                    </motion.button>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    Date Worn
                                </label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    max={format(new Date(), "yyyy-MM-dd")}
                                    className="border-[#E5E5E5] rounded-none h-12 focus:border-[#1A1A1A] focus:ring-0"
                                />
                            </div>

                            {/* Occasion */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                                    Occasion
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {OCCASIONS.map((occ) => (
                                        <button
                                            key={occ.value}
                                            onClick={() => setOccasion(occasion === occ.value ? "" : occ.value)}
                                            className={`py-3 text-center transition-all border ${occasion === occ.value
                                                ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                                                : 'bg-white border-[#E5E5E5] hover:border-[#1A1A1A]'
                                                }`}
                                        >
                                            <span className="text-lg block mb-1">{occ.icon}</span>
                                            <span className="text-[9px] uppercase tracking-wider">{occ.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                                    How Did You Feel?
                                </label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star === rating ? 0 : star)}
                                            className="p-2 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${star <= rating
                                                    ? "fill-[#D4AF37] text-[#D4AF37]"
                                                    : "text-gray-200"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                                    Notes <span className="text-gray-300">(Optional)</span>
                                </label>
                                <textarea
                                    placeholder="Any thoughts about wearing this..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-4 border border-[#E5E5E5] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] bg-white placeholder:text-gray-300"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#E5E5E5] flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={createWearLog.isPending}
                                className="flex-1 h-12 rounded-none text-[10px] uppercase tracking-widest"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createWearLog.isPending}
                                className="flex-1 h-12 rounded-none bg-[#1A1A1A] hover:bg-[#80163A] text-[10px] uppercase tracking-widest"
                            >
                                {createWearLog.isPending ? "Saving..." : "Log Wear"}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Selfie Capture Modal */}
            <OutfitSelfieCapture
                isOpen={showSelfieCapture}
                onClose={() => setShowSelfieCapture(false)}
                onCapture={handleSelfieCapture}
            />
        </>
    );
}

export default WearTrackingDialog;
