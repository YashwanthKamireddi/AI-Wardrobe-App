import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Search, Grid3X3, LayoutList, X, Edit, Trash2, Sparkles, Loader2, Wand2, User, Layers, Heart, Filter, Link as LinkIcon, Globe, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import FileUpload from "@/components/file-upload";
import { useWardrobeItems, useAddWardrobeItem, useDeleteWardrobeItem, useUpdateWardrobeItem, useSeedWardrobeItems } from "@/hooks/use-wardrobe";
import { clothingCategories, seasons, WardrobeItem as WardrobeItemType } from "@shared/schema";
import { processWardrobeImage, AIProcessingResult } from "@/lib/image-ai";
import { Progress } from "@/components/ui/progress";

/**
 * WARDROBE PAGE - EDITORIAL MASONRY
 *
 * Design: Gallery-style presentation with focus on images
 * Typography: Minimal, functional
 * Layout: True masonry grid
 */

const itemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().optional(),
    color: z.string().optional(),
    season: z.string().optional(),
    imageUrl: z.string().min(1, "Image is required"),
    tags: z.string().optional(),
    favorite: z.boolean().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export function WardrobePage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WardrobeItemType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // AI Processing states
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [aiProgress, setAiProgress] = useState(0);
    const [aiStage, setAiStage] = useState('');
    const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);

    // Import from Web State
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [removeBackground, setRemoveBackground] = useState(true);

    // Camera capture state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const { data: wardrobeItems, isLoading } = useWardrobeItems();
    const addItem = useAddWardrobeItem();
    const updateItem = useUpdateWardrobeItem();
    const deleteItem = useDeleteWardrobeItem();
    const seedItems = useSeedWardrobeItems();

    // Handle AI image processing
    const handleAIProcess = async (file: File) => {
        setIsAIProcessing(true);
        setAiProgress(0);
        setAiStage('Starting AI analysis...');

        try {
            const result = await processWardrobeImage(file, (stage, progress) => {
                setAiStage(stage);
                setAiProgress(progress);
            }, { removeBg: removeBackground });

            setAiResult(result);
            form.setValue('imageUrl', result.processedImageUrl);
            form.setValue('color', result.colors.colorName);
            form.setValue('category', result.category.category);
            if (result.category.subcategory) {
                form.setValue('subcategory', result.category.subcategory);
            }

            const suggestedName = `${result.colors.colorName} ${result.category.category.slice(0, -1)}`;
            form.setValue('name', suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1));

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                form.setValue('imageUrl', base64);
            };
            reader.readAsDataURL(result.processedImageBlob);

        } catch (error) {
            console.error('AI processing failed:', error);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                form.setValue('imageUrl', base64);
            };
            reader.readAsDataURL(file);
        } finally {
            setIsAIProcessing(false);
            setAiProgress(0);
            setAiStage('');
        }
    };

    const handleImport = async () => {
        if (!importUrl) return;
        setIsImporting(true);
        try {
            const res = await fetch('/api/scrape-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: importUrl })
            });

            if (!res.ok) throw new Error('Import failed');

            const data = await res.json();

            if (data.imageUrl) {
                form.setValue('imageUrl', data.imageUrl);
            }
            if (data.name) {
                form.setValue('name', data.name);
            }
            if (data.brand) {
                const currentTags = form.getValues('tags');
                const newTag = `brand:${data.brand}`;
                form.setValue('tags', currentTags ? `${currentTags}, ${newTag}` : newTag);
            }

            // Set a mock result to clearly show success to the user
            setAiStage('Imported from web');
            setAiResult({
                colors: { dominant: '#ffffff', palette: [], colorName: 'Web Import' },
                category: { category: 'tops', confidence: 1 }
            } as any);

        } catch (error) {
            console.error('Import failed:', error);
            // Optionally set error state here
        } finally {
            setIsImporting(false);
        }
    };

    // Camera Control Functions
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraStream(stream);
            setIsCameraActive(true);
        } catch (error) {
            console.error('Camera access failed:', error);
            alert('Could not access camera. Please check permissions.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraActive(false);
    }, [cameraStream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                    stopCamera();
                    await handleAIProcess(file);
                }
            }, 'image/jpeg', 0.9);
        }
    }, [stopCamera]);

    // Cleanup camera on dialog close
    useEffect(() => {
        if (!isAddDialogOpen && cameraStream) {
            stopCamera();
        }
    }, [isAddDialogOpen, cameraStream, stopCamera]);

    const form = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: "",
            category: "tops",
            subcategory: "",
            color: "",
            season: "all",
            imageUrl: "",
            tags: "",
            favorite: false,
        },
    });

    const editForm = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
    });

    useEffect(() => {
        if (editingItem) {
            editForm.reset({
                name: editingItem.name,
                category: editingItem.category,
                subcategory: editingItem.subcategory || "",
                color: editingItem.color || "",
                season: editingItem.season || "all",
                imageUrl: editingItem.imageUrl || "",
                tags: editingItem.tags?.join(", ") || "",
                favorite: editingItem.favorite || false,
            });
        }
    }, [editingItem, editForm]);

    const filteredItems = useMemo(() => {
        if (!wardrobeItems) return [];
        return wardrobeItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [wardrobeItems, searchQuery, categoryFilter]);

    const onSubmitAdd = async (data: ItemFormData) => {
        try {
            await addItem.mutateAsync({
                ...data,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
            });
            form.reset();
            setAiResult(null);
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Failed to add item:', error);
        }
    };

    const onSubmitEdit = async (data: ItemFormData) => {
        if (!editingItem) return;
        try {
            await updateItem.mutateAsync({
                id: editingItem.id,
                ...data,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
            });
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteItem.mutateAsync(id);
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const inputClass = `
    w-full h-12 px-4 bg-[#F5F5F5]
    text-[#1A1A1A] text-sm placeholder:text-[#9A9A9A]
    border-0 rounded-lg
    focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none
    transition-all duration-300
  `;

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[#6B6B6B]">Loading your wardrobe...</p>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
                                Collection
                            </p>
                            <h1
                                className="text-[#1A1A1A]"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "clamp(2rem, 5vw, 3rem)",
                                    lineHeight: 1.1
                                }}
                            >
                                Your Wardrobe
                            </h1>
                        </div>
                        <motion.button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="h-12 px-6 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full flex items-center gap-2"
                            whileHover={{ backgroundColor: "#80163A" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Item</span>
                        </motion.button>
                    </div>
                </motion.header>

                {/* Search & Filters */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                            />
                        </div>
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 px-5 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${showFilters || categoryFilter !== 'all'
                                ? 'bg-[#1A1A1A] text-white'
                                : 'bg-white border border-[#E5E5E5] text-[#6B6B6B]'
                                }`}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </motion.button>
                    </div>

                    {/* Filter Pills */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2 pt-4">
                                    <button
                                        onClick={() => setCategoryFilter('all')}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${categoryFilter === 'all'
                                            ? 'bg-[#1A1A1A] text-white'
                                            : 'bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A]'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {clothingCategories.map(cat => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setCategoryFilter(cat.value)}
                                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${categoryFilter === cat.value
                                                ? 'bg-[#1A1A1A] text-white'
                                                : 'bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A]'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    className="flex items-center gap-6 mb-8 text-sm text-[#6B6B6B]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <span>{filteredItems.length} items</span>
                    {categoryFilter !== 'all' && (
                        <span className="flex items-center gap-2">
                            in <span className="text-[#1A1A1A] font-medium capitalize">{categoryFilter}</span>
                            <button
                                onClick={() => setCategoryFilter('all')}
                                className="text-[#9A9A9A] hover:text-[#1A1A1A]"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </motion.div>

                {/* Items Grid - True Masonry */}
                {filteredItems.length > 0 ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="break-inside-avoid"
                            >
                                <motion.div
                                    className="group relative bg-white rounded-2xl overflow-hidden border border-[#E5E5E5]/50 cursor-pointer"
                                    whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                                    onClick={() => setEditingItem(item)}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] bg-[#F5F5F5]">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Grid3X3 className="w-8 h-8 text-[#D5D5D5]" />
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingItem(item);
                                                    }}
                                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Edit className="w-4 h-4 text-[#1A1A1A]" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(item.id);
                                                    }}
                                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-[#B44141]" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</h3>
                                        <p className="text-xs text-[#6B6B6B] capitalize mt-1">{item.category}</p>
                                        {item.color && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-[#E5E5E5]"
                                                    style={{ backgroundColor: item.color.toLowerCase() }}
                                                />
                                                <span className="text-xs text-[#9A9A9A] capitalize">{item.color}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="py-24 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                            <Grid3X3 className="w-8 h-8 text-[#D5D5D5]" />
                        </div>
                        <h3
                            className="text-xl text-[#1A1A1A] mb-3"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            {searchQuery || categoryFilter !== 'all' ? 'No items found' : 'Your wardrobe is empty'}
                        </h3>
                        <p className="text-sm text-[#6B6B6B] mb-8 max-w-sm mx-auto">
                            {searchQuery || categoryFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Start building your collection by adding your first item'}
                        </p>
                        {!searchQuery && categoryFilter === 'all' && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <motion.button
                                    onClick={() => setIsAddDialogOpen(true)}
                                    className="h-12 px-8 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full inline-flex items-center gap-2"
                                    whileHover={{ backgroundColor: "#80163A" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Your First Item
                                </motion.button>
                                <motion.button
                                    onClick={() => seedItems.mutate()}
                                    disabled={seedItems.isPending}
                                    className="h-12 px-8 bg-white border border-[#E5E5E5] text-[#1A1A1A] text-sm font-medium rounded-full inline-flex items-center gap-2 disabled:opacity-50"
                                    whileHover={{ borderColor: "#1A1A1A" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {seedItems.isPending ? "Adding..." : "Add Demo Items"}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Add Item Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-lg bg-[#F9F9F7] border-0 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle
                            className="text-2xl"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Add Item
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-5">
                            {/* AI Processing Status */}
                            {isAIProcessing && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F5F0FF] to-[#F0F5FF] border border-[#E5E0F0]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wand2 className="w-4 h-4 text-[#6B4FBB] animate-pulse" />
                                        <span className="text-sm font-medium text-[#6B4FBB]">{aiStage}</span>
                                    </div>
                                    <Progress value={aiProgress} className="h-1.5" />
                                </div>
                            )}

                            {/* AI Results */}
                            {aiResult && !isAIProcessing && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F0F9F4] to-[#F0F5F9] border border-[#E0F0E5]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-[#2D8B5F]" />
                                        <span className="text-sm font-medium text-[#2D8B5F]">AI Analysis Complete</span>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow"
                                                style={{ backgroundColor: aiResult.colors.dominant }}
                                            />
                                            <span className="text-[#6B6B6B]">{aiResult.colors.colorName}</span>
                                        </div>
                                        <div className="text-[#6B6B6B] capitalize">{aiResult.category.category}</div>
                                    </div>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Image Source</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Tabs defaultValue="browse" className="w-full" onValueChange={(val) => { if (val !== 'camera') stopCamera(); }}>
                                                <TabsList className="grid w-full grid-cols-3 mb-4 bg-[#EDEDE9] rounded-2xl p-1 h-12">
                                                    <TabsTrigger value="camera" className="rounded-xl text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2" onClick={startCamera}>
                                                        <Camera className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Camera</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="browse" className="rounded-xl text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                                                        <Upload className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Browse</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="url" className="rounded-xl text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
                                                        <LinkIcon className="w-4 h-4" />
                                                        <span className="hidden sm:inline">URL</span>
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Camera Tab */}
                                                <TabsContent value="camera" className="mt-0">
                                                    <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] aspect-[4/3]">
                                                        {isCameraActive ? (
                                                            <>
                                                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                                                <canvas ref={canvasRef} className="hidden" />
                                                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                                    <motion.button
                                                                        type="button"
                                                                        onClick={capturePhoto}
                                                                        className="w-16 h-16 rounded-full bg-white border-4 border-white/30 flex items-center justify-center shadow-2xl"
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                    >
                                                                        <div className="w-12 h-12 rounded-full bg-[#80163A]" />
                                                                    </motion.button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4 py-12">
                                                                <Camera className="w-12 h-12" />
                                                                <p className="text-sm">Tap Camera tab to start</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabsContent>

                                                {/* Browse Tab */}
                                                <TabsContent value="browse" className="mt-0">
                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id="remove-bg"
                                                                checked={removeBackground}
                                                                onCheckedChange={setRemoveBackground}
                                                            />
                                                            <Label htmlFor="remove-bg" className="text-xs font-medium text-[#6B6B6B]">Auto Remove Background</Label>
                                                        </div>
                                                        {removeBackground && <span className="text-[10px] text-[#80163A] font-medium flex items-center gap-1"><Sparkles className="w-3 h-3" />On</span>}
                                                    </div>
                                                    <FileUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onFileSelect={handleAIProcess}
                                                        accept="image/*"
                                                    />
                                                </TabsContent>

                                                {/* URL Tab */}
                                                <TabsContent value="url" className="mt-0">
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" />
                                                            <input
                                                                placeholder="Paste product link..."
                                                                className={`${inputClass} pl-10`}
                                                                value={importUrl}
                                                                onChange={(e) => setImportUrl(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImport())}
                                                            />
                                                        </div>
                                                        <motion.button
                                                            type="button"
                                                            onClick={handleImport}
                                                            disabled={isImporting || !importUrl}
                                                            className="px-4 bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                                                        </motion.button>
                                                    </div>
                                                    <p className="text-[10px] text-[#9A9A9A] mt-2">
                                                        Works with Zara, SSENSE, H&M, ASOS, and more.
                                                    </p>
                                                    {field.value && !field.value.startsWith('data:') && (
                                                        <div className="mt-4 rounded-xl overflow-hidden border border-[#E5E5E5] relative aspect-[3/4] w-24">
                                                            <img src={field.value} className="w-full h-full object-contain bg-white" />
                                                            <button
                                                                type="button"
                                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                                                                onClick={() => {
                                                                    form.setValue('imageUrl', '');
                                                                    setImportUrl('');
                                                                }}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Name</FormLabel>
                                        <FormControl>
                                            <input
                                                placeholder="White cotton shirt"
                                                className={inputClass}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-[#F5F5F5] border-0 rounded-lg">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clothingCategories.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Color</FormLabel>
                                            <FormControl>
                                                <input
                                                    placeholder="White"
                                                    className={inputClass}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="season"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Season</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-[#F5F5F5] border-0 rounded-lg">
                                                    <SelectValue placeholder="Select season" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {seasons.map(s => (
                                                    <SelectItem key={s.value} value={s.value}>
                                                        {s.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Tags</FormLabel>
                                        <FormControl>
                                            <input
                                                placeholder="casual, work, favorite"
                                                className={inputClass}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <motion.button
                                type="submit"
                                disabled={addItem.isPending || isAIProcessing}
                                className="w-full h-12 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full disabled:opacity-50"
                                whileHover={{ backgroundColor: "#80163A" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {addItem.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    "Add to Wardrobe"
                                )}
                            </motion.button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="sm:max-w-lg bg-[#F9F9F7] border-0 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle
                            className="text-2xl"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Edit Item
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-5">
                            <FormField
                                control={editForm.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Image</FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                accept="image/*"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Name</FormLabel>
                                        <FormControl>
                                            <input
                                                className={inputClass}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={editForm.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-[#F5F5F5] border-0 rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clothingCategories.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={editForm.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Color</FormLabel>
                                            <FormControl>
                                                <input
                                                    className={inputClass}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={editForm.control}
                                name="season"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Season</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-[#F5F5F5] border-0 rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {seasons.map(s => (
                                                    <SelectItem key={s.value} value={s.value}>
                                                        {s.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-2">
                                <motion.button
                                    type="button"
                                    onClick={() => editingItem && handleDelete(editingItem.id)}
                                    className="flex-1 h-12 bg-[#FEE2E2] text-[#B44141] text-sm font-medium rounded-full"
                                    whileHover={{ backgroundColor: "#FCD5D5" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Delete
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    disabled={updateItem.isPending}
                                    className="flex-1 h-12 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full disabled:opacity-50"
                                    whileHover={{ backgroundColor: "#80163A" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {updateItem.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>



        </AppLayout >
    );
}

export default WardrobePage;
