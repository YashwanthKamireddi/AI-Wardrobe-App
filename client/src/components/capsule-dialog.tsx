/**
 * Capsule Dialog Component
 *
 * Create and edit capsule wardrobes.
 * Follows Vessura "Quiet Luxury" design system.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useCreateCapsule, useUpdateCapsule, useDeleteCapsule } from "@/hooks/use-advanced";
import { useToast } from "@/hooks/use-toast";

interface CapsuleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    capsule?: any; // Existing capsule for edit mode
}

const CAPSULE_TYPES = [
    { value: "work", label: "Work" },
    { value: "weekend", label: "Weekend" },
    { value: "vacation", label: "Vacation" },
    { value: "seasonal", label: "Seasonal" },
    { value: "minimalist", label: "Minimalist" },
    { value: "custom", label: "Custom" },
];

const SEASONS = [
    { value: "SS24", label: "Spring/Summer 24" },
    { value: "FW24", label: "Fall/Winter 24" },
    { value: "SS25", label: "Spring/Summer 25" },
    { value: "FW25", label: "Fall/Winter 25" },
    { value: "all", label: "All Seasons" },
];

export function CapsuleDialog({ isOpen, onClose, capsule }: CapsuleDialogProps) {
    const { toast } = useToast();
    const { data: wardrobeItems } = useWardrobeItems();
    const createCapsule = useCreateCapsule();
    const updateCapsule = useUpdateCapsule();
    const deleteCapsule = useDeleteCapsule();

    const isEditMode = !!capsule;

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("seasonal");
    const [season, setSeason] = useState("SS25");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [step, setStep] = useState<"details" | "items">("details");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load existing capsule data
    useEffect(() => {
        if (capsule) {
            setName(capsule.name || "");
            setDescription(capsule.description || "");
            setType(capsule.type || "seasonal");
            setSeason(capsule.season || "SS25");
            setSelectedItems(capsule.items || []);
        } else {
            // Reset form
            setName("");
            setDescription("");
            setType("seasonal");
            setSeason("SS25");
            setSelectedItems([]);
            setStep("details");
        }
    }, [capsule, isOpen]);

    const toggleItem = (itemId: number) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast({ title: "Name required", description: "Please enter a collection name.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const capsuleData = {
                name: name.trim(),
                description: description.trim(),
                type,
                season,
                items: selectedItems,
                isActive: true,
            };

            if (isEditMode) {
                await updateCapsule.mutateAsync({ id: capsule.id, ...capsuleData });
                toast({ title: "Collection Updated", description: `"${name}" has been updated.` });
            } else {
                await createCapsule.mutateAsync(capsuleData);
                toast({ title: "Collection Created", description: `"${name}" is now ready.` });
            }

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save collection. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!capsule) return;

        if (!confirm(`Delete "${capsule.name}"? This action cannot be undone.`)) return;

        try {
            await deleteCapsule.mutateAsync(capsule.id);
            toast({ title: "Collection Deleted", description: `"${capsule.name}" has been removed.` });
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete collection.", variant: "destructive" });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                {/* Dialog */}
                <motion.div
                    className="relative w-full max-w-2xl max-h-[90vh] bg-[#FAF9F6] overflow-hidden mx-4"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#1A1A1A] flex items-center justify-center">
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-playfair text-[#1A1A1A]">
                                    {isEditMode ? "Edit Collection" : "New Collection"}
                                </h2>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">
                                    {step === "details" ? "Details" : "Select Items"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {step === "details" ? (
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                        Collection Name
                                    </label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Spring Essentials"
                                        className="border-b border-[#1A1A1A]/20 rounded-none px-0 h-12 bg-transparent focus:outline-none focus:border-[#80163a] font-playfair text-xl placeholder:text-[#1A1A1A]/20"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="A curated selection for..."
                                        className="w-full border-b border-[#1A1A1A]/20 px-0 py-2 bg-transparent focus:outline-none focus:border-[#80163a] font-light text-[#1A1A1A] placeholder:text-[#1A1A1A]/20 resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">
                                        Collection Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CAPSULE_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setType(t.value)}
                                                className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${type === t.value
                                                        ? "bg-[#1A1A1A] text-white"
                                                        : "bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#1A1A1A]"
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Season */}
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">
                                        Season
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {SEASONS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => setSeason(s.value)}
                                                className={`px-4 py-2 text-xs uppercase tracking-widest transition-all ${season === s.value
                                                        ? "bg-[#80163A] text-white"
                                                        : "bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:border-[#80163A]"
                                                    }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Selected: <span className="font-medium text-[#1A1A1A]">{selectedItems.length} items</span>
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {wardrobeItems?.map((item: any) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`relative aspect-square overflow-hidden transition-all ${selectedItems.includes(item.id)
                                                    ? "ring-2 ring-[#80163A] ring-offset-2"
                                                    : "opacity-70 hover:opacity-100"
                                                }`}
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {selectedItems.includes(item.id) && (
                                                <div className="absolute inset-0 bg-[#80163A]/20 flex items-center justify-center">
                                                    <Check className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-[#E5E5E5] bg-white">
                        <div>
                            {isEditMode && (
                                <Button
                                    variant="ghost"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {step === "items" && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("details")}
                                    className="border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white uppercase tracking-widest text-xs"
                                >
                                    Back
                                </Button>
                            )}
                            {step === "details" ? (
                                <Button
                                    onClick={() => setStep("items")}
                                    className="bg-[#1A1A1A] text-white hover:bg-[#80163A] uppercase tracking-widest text-xs px-8"
                                >
                                    Select Items
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-[#1A1A1A] text-white hover:bg-[#80163A] uppercase tracking-widest text-xs px-8"
                                >
                                    {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create Collection"}
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default CapsuleDialog;
