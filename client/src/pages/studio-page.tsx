import { useState, useCallback } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Camera,
    Sparkles,
    Wand2,
    Check,
    X,
    Grid3X3,
    ArrowRight,
} from "lucide-react";
import FileUpload from "@/components/file-upload";
import { processWardrobeImage, AIProcessingResult } from "@/lib/image-ai";
import { useAddWardrobeItem } from "@/hooks/use-wardrobe";
import { Progress } from "@/components/ui/progress";
import { AIProcessingOverlay } from "@/components/ui/ai-processing-overlay";
import { BeforeAfterComparison } from "@/components/ui/before-after-comparison";

/**
 * STUDIO PAGE - AI WARDROBE PROCESSING HUB
 *
 * Purpose: Dedicated space for AI-powered image processing
 * Features: Batch upload, background removal, AI tagging, bulk add to wardrobe
 * Design: Luxury, clean, efficient workflow
 */

interface ProcessedItem {
    id: string;
    file: File;
    originalUrl: string;
    processedUrl?: string;
    result?: AIProcessingResult;
    status: 'pending' | 'processing' | 'complete' | 'error';
    name?: string;
    category?: string;
    color?: string;
}

export function StudioPage() {
    const [items, setItems] = useState<ProcessedItem[]>([]);
    const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(null);
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);
    const [beforeAfterItem, setBeforeAfterItem] = useState<ProcessedItem | null>(null);

    const addItem = useAddWardrobeItem();

    const handleFileSelect = async (file: File) => {
        const newItem: ProcessedItem = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            originalUrl: URL.createObjectURL(file),
            status: 'pending'
        };

        setItems(prev => [...prev, newItem]);
        processItem(newItem);
    };

    const processItem = async (item: ProcessedItem) => {
        setCurrentlyProcessing(item.id);
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' as const } : i));

        try {
            const result = await processWardrobeImage(item.file, () => { }, { removeBg: true });

            const suggestedName = `${result.colors.colorName} ${result.category.category.slice(0, -1)}`;

            setItems(prev => prev.map(i =>
                i.id === item.id
                    ? {
                        ...i,
                        result,
                        processedUrl: result.processedImageUrl,
                        status: 'complete' as const,
                        name: suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1),
                        category: result.category.category,
                        color: result.colors.colorName
                    }
                    : i
            ));
        } catch (error) {
            console.error('Processing failed:', error);
            setItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, status: 'error' as const } : i
            ));
        } finally {
            setCurrentlyProcessing(null);
        }
    };

    const handleBulkAddToWardrobe = async () => {
        const completedItems = items.filter(i => i.status === 'complete' && i.result);

        for (const item of completedItems) {
            if (!item.result) continue;

            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(item.result!.processedImageBlob);
            });

            const base64 = await base64Promise;

            await addItem.mutateAsync({
                name: item.name || 'Untitled',
                category: item.category || 'tops',
                color: item.color,
                imageUrl: base64,
                tags: ['studio-processed'],
                favorite: false,
                wearCount: 0,
                status: 'available'
            });
        }

        // Clear items after adding
        setItems([]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const viewBeforeAfter = (item: ProcessedItem) => {
        setBeforeAfterItem(item);
        setShowBeforeAfter(true);
    };

    const completedCount = items.filter(i => i.status === 'complete').length;
    const processingCount = items.filter(i => i.status === 'processing').length;

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">The Studio</p>
                    <h1
                        className="text-[#1A1A1A] mb-4"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2rem, 5vw, 3rem)",
                            lineHeight: 1.1
                        }}
                    >
                        AI Processing <span className="italic font-light">Lab</span>
                    </h1>
                    <p className="text-[#6B6B6B] text-lg max-w-2xl">
                        Upload multiple items for automatic background removal, AI tagging, and instant wardrobe integration.
                    </p>
                </motion.header>

                {/* Upload Zone */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <FileUpload
                        value=""
                        onChange={() => { }}
                        onFileSelect={handleFileSelect}
                        accept="image/*"
                    />
                </motion.div>

                {/* Processing Queue */}
                {items.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Bar */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E5E5E5]">
                            <div className="flex items-center gap-6 text-sm">
                                <span className="text-[#6B6B6B]">
                                    {items.length} item{items.length > 1 ? 's' : ''}
                                </span>
                                {processingCount > 0 && (
                                    <span className="flex items-center gap-2 text-[#80163A]">
                                        <div className="w-2 h-2 rounded-full bg-[#80163A] animate-pulse" />
                                        Processing {processingCount}
                                    </span>
                                )}
                                {completedCount > 0 && (
                                    <span className="flex items-center gap-2 text-green-600">
                                        <Check className="w-4 h-4" />
                                        {completedCount} Complete
                                    </span>
                                )}
                            </div>

                            {completedCount > 0 && (
                                <motion.button
                                    onClick={handleBulkAddToWardrobe}
                                    className="h-10 px-6 bg-[#1A1A1A] text-white text-sm font-medium rounded-full flex items-center gap-2"
                                    whileHover={{ backgroundColor: "#80163A" }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={addItem.isPending}
                                >
                                    <Check className="w-4 h-4" />
                                    {addItem.isPending ? 'Adding...' : `Add ${completedCount} to Wardrobe`}
                                </motion.button>
                            )}
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] bg-[#F5F5F5]">
                                        <img
                                            src={item.processedUrl || item.originalUrl}
                                            alt={item.name || 'Processing'}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Status Overlay */}
                                        {item.status === 'processing' && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Wand2 className="w-8 h-8 text-white mx-auto mb-2 animate-pulse" />
                                                    <p className="text-white text-xs">Processing...</p>
                                                </div>
                                            </div>
                                        )}

                                        {item.status === 'complete' && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium text-[#1A1A1A] truncate">
                                            {item.name || 'Processing...'}
                                        </h3>
                                        {item.category && (
                                            <p className="text-xs text-[#6B6B6B] capitalize mt-1">
                                                {item.category}
                                            </p>
                                        )}
                                        {item.status === 'complete' && item.processedUrl && (
                                            <button
                                                onClick={() => viewBeforeAfter(item)}
                                                className="mt-2 text-xs text-[#80163A] hover:underline"
                                            >
                                                View Before/After
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {items.length === 0 && (
                    <motion.div
                        className="py-24 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-8 h-8 text-[#D5D5D5]" />
                        </div>
                        <h3
                            className="text-xl text-[#1A1A1A] mb-3"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Ready for Processing
                        </h3>
                        <p className="text-sm text-[#6B6B6B] mb-8 max-w-sm mx-auto">
                            Upload your clothing items to automatically remove backgrounds and extract details
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Before/After Comparison */}
            {beforeAfterItem && (
                <BeforeAfterComparison
                    isOpen={showBeforeAfter}
                    before={beforeAfterItem.originalUrl}
                    after={beforeAfterItem.processedUrl || ''}
                    onClose={() => setShowBeforeAfter(false)}
                />
            )}
        </AppLayout>
    );
}

export default StudioPage;
