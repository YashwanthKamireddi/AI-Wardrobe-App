import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Search, Grid3X3, LayoutList, X, Edit, Trash2, Sparkles, Loader2, Wand2, User, Layers, Heart, Filter, Link as LinkIcon, Globe, Camera, Upload, Image as ImageIcon, Shirt, Sun, Edit2, FolderOpen } from "lucide-react";
import { useCapsules, useDeleteCapsule } from "@/hooks/use-advanced";
import { CapsuleDialog } from "@/components/capsule-dialog";
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
import { processWardrobeImage, AIProcessingResult, processImageFromUrl } from "@/lib/image-ai";
import { Progress } from "@/components/ui/progress";
import { WardrobeGridSkeleton } from "@/components/ui/wardrobe-skeletons";
import { AIProcessingOverlay } from "@/components/ui/ai-processing-overlay";
import { BeforeAfterComparison } from "@/components/ui/before-after-comparison";
import { FilterCategoryTabs } from "@/components/ui/filter-category-tabs";
import { useMultiSelectWardrobe } from "@/hooks/use-multi-select";
import { OutfitSelectionDialog } from "@/components/ui/outfit-selection-dialog";
import { MultiSelectToolbar } from "@/components/ui/multi-select-toolbar";

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

import { useToast } from "@/hooks/use-toast";

export function WardrobePage() {
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WardrobeItemType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Tab for Items vs Collections
    const [activeTab, setActiveTab] = useState<'items' | 'collections'>('items');

    // Capsules/Collections state
    const { data: capsules, isLoading: capsulesLoading } = useCapsules();
    const deleteCapsule = useDeleteCapsule();
    const [capsuleDialogOpen, setCapsuleDialogOpen] = useState(false);
    const [editingCapsule, setEditingCapsule] = useState<any>(null);

    // AI Processing states
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [aiProgress, setAiProgress] = useState(0);
    const [aiStage, setAiStage] = useState('');
    const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);

    // Luxury UI states
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

    // Multi-select - REAL FUNCTIONAL HOOK (not zombie state!)
    const multiSelect = useMultiSelectWardrobe();
    const [showOutfitDialog, setShowOutfitDialog] = useState(false);

    // Import from Web State
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    // Background removal is always enabled for clean item images

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
        setAiStage('Preparing image...');

        // Store original image for before/after comparison
        const originalUrl = URL.createObjectURL(file);
        setOriginalImageUrl(originalUrl);

        try {
            const result = await processWardrobeImage(file, (stage, progress) => {
                setAiStage(stage);
                setAiProgress(progress);
            }, { removeBg: true }); // Always remove background for clean images

            setAiResult(result);

            // Store processed image for before/after
            setProcessedImageUrl(result.processedImageUrl);

            // Auto-fill form
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

            setIsAIProcessing(false);

            // Show before/after comparison after brief delay
            setTimeout(() => {
                setShowBeforeAfter(true);
            }, 500);

        } catch (error) {
            console.error('AI processing failed:', error);
            toast({
                title: " AI Analysis Failed", // Space for alignment if needed
                description: "Could not process image. Using original instead.",
                variant: "destructive"
            });
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

            // Process the imported image through AI to get real color/category
            if (data.imageUrl) {
                setAiStage('Analyzing style...');
                const { detectColors, detectCategory } = await import('@/lib/image-ai');

                // Use the image URL directly (assuming CORS is handled or using proxy)
                const colors = await detectColors(data.imageUrl);
                const category = await detectCategory(data.imageUrl);

                form.setValue('color', colors.colorName);
                if (!form.getValues('category')) {
                    form.setValue('category', category.category);
                }

                setAiResult({
                    processedImageUrl: data.imageUrl, // Web images usually clean
                    processedImageBlob: new Blob(), // Placeholder format
                    colors,
                    category
                } as any);
            }

            toast({
                title: "Import Successful",
                description: `Found ${data.name || 'item'} from ${new URL(importUrl).hostname}`,
            });

        } catch (error) {
            console.error('Import failed:', error);
            toast({
                title: "Import Failed",
                description: "Could not fetch product details. Try a different URL.",
                variant: "destructive"
            });
        } finally {
            setIsImporting(false);
        }
    };

    // Handle processing a URL (paste direct image URL with background removal)
    const handleProcessUrl = async (url: string) => {
        if (!url || !url.startsWith('http')) return;

        setIsAIProcessing(true);
        setAiProgress(0);
        setAiStage('Processing URL...');

        try {
            const result = await processImageFromUrl(url, (stage, progress) => {
                setAiStage(stage);
                setAiProgress(progress);
            });

            // Convert blob to base64 for storage
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                form.setValue('imageUrl', base64);
            };
            reader.readAsDataURL(result.processedBlob);

            // Also run color/category detection
            const { detectColors, detectCategory } = await import('@/lib/image-ai');
            const colors = await detectColors(result.processedUrl);
            const category = await detectCategory(result.processedUrl);

            form.setValue('color', colors.colorName);
            form.setValue('category', category.category);

            setAiResult({
                processedImageUrl: result.processedUrl,
                processedImageBlob: result.processedBlob,
                colors,
                category
            } as AIProcessingResult);

        } catch (error) {
            console.error('URL processing failed:', error);
            // Fallback: just use the original URL
            form.setValue('imageUrl', url);
        } finally {
            setIsAIProcessing(false);
            setAiProgress(0);
            setAiStage('');
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
                wearCount: 0,
                status: 'available', // Added missing status
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
            <AppLayout>
                <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                    <div className="mb-8 space-y-4">
                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <WardrobeGridSkeleton />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FDFBF7] pb-24 md:pb-12"> {/* Added pb-24 for mobile bottom bar */}

                {/* V2.0: MOBILE HEADER (Sticky) */}
                <motion.header
                    className="md:hidden sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-black/5"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="px-4 h-14 flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-[#151515] font-playfair text-lg font-bold leading-none">Wardrobe</h1>
                            <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                                {activeTab === 'items' ? `${filteredItems.length} ITEMS` : `${capsules?.length || 0} COLLECTIONS`}
                            </span>
                        </div>
                        <motion.button
                            onClick={() => activeTab === 'items' ? setIsAddDialogOpen(true) : setCapsuleDialogOpen(true)}
                            className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center text-white"
                            whileTap={{ scale: 0.9 }}
                        >
                            <Plus className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Tab Bar */}
                    <div className="px-4 py-2 flex gap-2">
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'items'
                                ? 'bg-[#1A1A1A] text-white'
                                : 'bg-white border border-gray-200 text-gray-500'
                                }`}
                        >
                            <Shirt className="w-3 h-3" />
                            Items
                        </button>
                        <button
                            onClick={() => setActiveTab('collections')}
                            className={`flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'collections'
                                ? 'bg-[#1A1A1A] text-white'
                                : 'bg-white border border-gray-200 text-gray-500'
                                }`}
                        >
                            <FolderOpen className="w-3 h-3" />
                            Collections
                        </button>
                    </div>
                </motion.header>

                <div className="max-w-[1920px] mx-auto md:px-10 md:py-8">

                    {/* DESKTOP HEADER (Hidden on Mobile) */}
                    <div className="hidden md:block mb-8 px-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">Your Wardrobe</p>
                                <h1 className="text-4xl md:text-5xl font-playfair text-[#151515]">
                                    {activeTab === 'items' ? 'All Items' : 'Collections'}
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Tab Switcher */}
                                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab('items')}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${activeTab === 'items'
                                            ? 'bg-white text-[#1A1A1A] shadow-sm'
                                            : 'text-gray-500 hover:text-[#1A1A1A]'
                                            }`}
                                    >
                                        <Shirt className="w-3 h-3" />
                                        Items
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('collections')}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 ${activeTab === 'collections'
                                            ? 'bg-white text-[#1A1A1A] shadow-sm'
                                            : 'text-gray-500 hover:text-[#1A1A1A]'
                                            }`}
                                    >
                                        <FolderOpen className="w-3 h-3" />
                                        Collections
                                    </button>
                                </div>
                                <button
                                    onClick={() => activeTab === 'items' ? setIsAddDialogOpen(true) : setCapsuleDialogOpen(true)}
                                    className="px-6 py-3 bg-[#151515] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                                >
                                    + {activeTab === 'items' ? 'Add Item' : 'New Collection'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP SEARCH & FILTERS (Hidden on Mobile - Moved to Bottom Bar) */}
                    <div className="hidden md:block px-6 mb-8">
                        <div className="flex gap-4">
                            <div className="flex-1 relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search archive..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-100 text-sm text-[#151515] placeholder:text-gray-300 focus:outline-none focus:border-black/10 transition-colors"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`h-10 px-6 border text-xs font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-[#151515] text-white border-[#151515]' : 'bg-white border-gray-100 text-[#151515] hover:border-black/10'
                                    }`}
                            >
                                Filter
                            </button>
                        </div>
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden bg-white border-b border-gray-100"
                                >
                                    <div className="flex flex-wrap gap-2 p-4">
                                        <button onClick={() => setCategoryFilter('all')} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${categoryFilter === 'all' ? 'bg-[#151515] text-white border-[#151515]' : 'bg-white border-gray-100'}`}>All</button>
                                        {clothingCategories.map(cat => (
                                            <button key={cat.value} onClick={() => setCategoryFilter(cat.value)} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${categoryFilter === cat.value ? 'bg-[#151515] text-white border-[#151515]' : 'bg-white border-gray-100 hover:border-black/10'}`}>{cat.label}</button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* CONTENT AREA - Switches between Items and Collections */}
                    <div className="px-0 md:px-6">

                        {/* ==================== ITEMS VIEW ==================== */}
                        {activeTab === 'items' && (
                            <>
                                {filteredItems.length > 0 ? (
                                    <>
                                        {/* Mobile Grid */}
                                        <div className="grid grid-cols-2 gap-[1px] md:hidden">
                                            {filteredItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setEditingItem(item)}
                                                    className="aspect-[3/4] relative bg-white overflow-hidden active:opacity-90 transition-opacity"
                                                >
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50"><Shirt className="w-6 h-6 text-gray-200" /></div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/20 to-transparent">
                                                        <p className="text-[10px] font-medium text-white truncate drop-shadow-sm">{item.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Masonry */}
                                        <div className="hidden md:block columns-2 lg:columns-4 gap-4 space-y-4">
                                            {filteredItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setEditingItem(item)}
                                                    className="break-inside-avoid group relative bg-white border border-gray-100 cursor-pointer hover:border-black/10 transition-all duration-300"
                                                >
                                                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-50">
                                                        {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-500" />}
                                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-2 bg-white text-black hover:bg-black hover:text-white transition-colors"><Edit className="w-3 h-3" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-3 h-3" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="font-playfair text-sm text-[#151515] truncate">{item.name}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">{item.category}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-24 text-center">
                                        <Grid3X3 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-playfair text-[#151515] mb-2">Archive Empty</h3>
                                        <p className="text-gray-400 text-xs">Start building your collection.</p>
                                        <button onClick={() => setIsAddDialogOpen(true)} className="mt-6 px-6 py-2 bg-[#151515] text-white text-[10px] font-bold uppercase tracking-widest">Add First Item</button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ==================== COLLECTIONS VIEW ==================== */}
                        {activeTab === 'collections' && (
                            <>
                                {/* Mobile Grid */}
                                <div className="md:hidden">
                                    {capsules && capsules.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                                            {capsules.map((capsule: any, index: number) => (
                                                <motion.div
                                                    key={capsule.id}
                                                    onClick={() => { setEditingCapsule(capsule); setCapsuleDialogOpen(true); }}
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

                                                    {/* Info Overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                                                        <p className="text-white text-sm font-playfair italic truncate drop-shadow-sm">{capsule.name}</p>
                                                        <p className="text-white/70 text-[10px] font-mono uppercase tracking-wider">{capsule.items?.length || 0} items</p>
                                                    </div>

                                                    {/* Season Badge */}
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                                        <Sun className="w-2.5 h-2.5 text-[#D4AF37]" />
                                                        {capsule.season || "SS25"}
                                                    </div>

                                                    {/* Index Number */}
                                                    <div className="absolute top-2 left-2 text-white/30 font-playfair text-2xl font-light">
                                                        0{index + 1}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-24 text-center px-6">
                                            <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-playfair text-[#151515] mb-2">No Collections</h3>
                                            <p className="text-gray-400 text-xs mb-6">Create capsule wardrobes to organize your items.</p>
                                            <button onClick={() => setCapsuleDialogOpen(true)} className="px-6 py-2 bg-[#151515] text-white text-[10px] font-bold uppercase tracking-widest">Create Collection</button>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Grid */}
                                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                    {/* Blueprint Card */}
                                    <motion.button
                                        onClick={() => { setEditingCapsule(null); setCapsuleDialogOpen(true); }}
                                        className="group relative aspect-[3/4] border border-dashed border-[#1A1A1A]/20 hover:border-[#80163A] bg-[#FAF9F6] transition-all flex flex-col items-center justify-center gap-6 overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="absolute inset-0 opacity-[0.03]"
                                            style={{ backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                        </div>
                                        <div className="w-20 h-20 rounded-full border border-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 bg-white z-10">
                                            <Plus className="w-8 h-8 text-[#1A1A1A]" strokeWidth={1} />
                                        </div>
                                        <div className="text-center z-10">
                                            <p className="text-lg font-playfair italic text-[#1A1A1A] mb-2">New Collection</p>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Start Blank Canvas</p>
                                        </div>
                                    </motion.button>

                                    {/* Collection Cards */}
                                    {capsules && capsules.map((capsule: any, index: number) => (
                                        <motion.div
                                            key={capsule.id}
                                            className="group cursor-pointer relative"
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.6 }}
                                        >
                                            <div className="relative aspect-[3/4] bg-[#E5E5E5] overflow-hidden mb-6">
                                                {capsule.items && capsule.items.length > 0 && capsule.resolvedItems ? (
                                                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#1A1A1A]">
                                                        {capsule.resolvedItems.slice(0, 4).map((item: any, i: number) => (
                                                            <div key={i} className="relative overflow-hidden bg-white">
                                                                {item?.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA]">
                                                                        <Sparkles className="w-6 h-6 text-gray-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
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

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => { setEditingCapsule(capsule); setCapsuleDialogOpen(true); }}
                                                        className="px-6 py-3 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
                                                    >
                                                        Edit Collection
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Delete "${capsule.name}"?`)) {
                                                                deleteCapsule.mutate(capsule.id);
                                                            }
                                                        }}
                                                        className="w-10 h-10 bg-red-500/90 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Season Badge */}
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                                    <Sun className="w-3 h-3 text-[#D4AF37]" />
                                                    {capsule.season || "SS25"}
                                                </div>
                                            </div>

                                            {/* Typography */}
                                            <div className="border-t border-[#1A1A1A] pt-4">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h3 className="text-2xl text-[#1A1A1A] font-playfair italic group-hover:text-[#80163A] transition-colors">
                                                        {capsule.name}
                                                    </h3>
                                                    <span className="text-4xl font-light text-gray-200 font-playfair">0{index + 1}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-400 font-mono uppercase tracking-widest">
                                                    <span>{capsule.items?.length || 0} Items</span>
                                                    <span>{capsule.type || "Curated"}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* V2.0: MOBILE THUMB ZONE (Fixed Bottom Bar) - Only show for Items tab */}
                {activeTab === 'items' && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-black/5 pb-safe">
                        {/* Search/Filter Context Bar (Collapsible or just integrated icons) */}
                        {showFilters && (
                            <div className="flex overflow-x-auto gap-2 p-2 border-b border-gray-100 bg-gray-50/50">
                                <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap border ${categoryFilter === 'all' ? 'bg-[#151515] text-white border-[#151515]' : 'bg-white border-gray-200'}`}>All</button>
                                {clothingCategories.map(cat => (
                                    <button key={cat.value} onClick={() => setCategoryFilter(cat.value)} className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap border ${categoryFilter === cat.value ? 'bg-[#151515] text-white border-[#151515]' : 'bg-white border-gray-200'}`}>{cat.label}</button>
                                ))}
                            </div>
                        )}

                        <div className="h-14 flex items-center justify-around px-2">
                            <button onClick={() => setShowFilters(!showFilters)} className={`flex flex-col items-center justify-center w-14 h-full  gap-1 ${showFilters ? 'text-[#151515]' : 'text-gray-400'}`}>
                                <Filter className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[9px] font-medium">FILTER</span>
                            </button>

                            {/* Center Search Input */}
                            <div className="flex-1 px-2">
                                <div className="h-9 bg-gray-100/50 rounded-full flex items-center px-3 border border-gray-200/50 focus-within:border-black/10 focus-within:bg-white transition-all">
                                    <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
                                    <input
                                        className="bg-transparent border-none outline-none text-xs w-full placeholder:text-gray-400"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
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
                            {/* AI Processing Status - Celura Theme */}
                            <AnimatePresence>
                                {isAIProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF9F6] to-[#F5F4F0] border border-gray-200 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-[#80163A] flex items-center justify-center">
                                                    <Wand2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="absolute inset-0 rounded-full bg-[#80163A] animate-ping opacity-20" />
                                            </div>
                                            <div>
                                                <p className="text-[#1A1A1A] font-medium text-sm">{aiStage}</p>
                                                <p className="text-gray-400 text-xs">Auto background removal enabled</p>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-[#80163A] rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${aiProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* AI Results - Celura Theme */}
                            {aiResult && !isAIProcessing && (
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF9F6] to-[#F5F4F0] border border-[#80163A]/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-[#80163A]" />
                                        <span className="text-sm font-medium text-[#80163A]">AI Analysis Complete</span>
                                    </div>
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow"
                                                style={{ backgroundColor: aiResult.colors.dominant }}
                                            />
                                            <span className="text-[#1A1A1A]">{aiResult.colors.colorName}</span>
                                        </div>
                                        <div className="text-[#1A1A1A] capitalize">{aiResult.category.category}</div>
                                    </div>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Tabs
                                                defaultValue="browse"
                                                className="w-full"
                                                onValueChange={(val) => {
                                                    if (val === 'camera') {
                                                        startCamera();
                                                    } else {
                                                        stopCamera();
                                                    }
                                                }}
                                            >
                                                {/* Simple 2-Tab Header */}
                                                <TabsList className="w-full grid grid-cols-2 mb-4 bg-[#EDEDE9] rounded-xl p-1 h-11">
                                                    <TabsTrigger value="browse" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2">
                                                        <Upload className="w-4 h-4" />
                                                        Upload
                                                    </TabsTrigger>
                                                    <TabsTrigger value="camera" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2">
                                                        <Camera className="w-4 h-4" />
                                                        Camera
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Browse/Upload Tab - Background removal is automatic */}
                                                <TabsContent value="browse" className="mt-0 space-y-3">
                                                    <div className="flex items-center gap-2 px-1 py-1.5 bg-[#F5F5F5] rounded-lg">
                                                        <Sparkles className="w-4 h-4 text-[#80163A]" />
                                                        <span className="text-xs text-gray-600">Auto background removal enabled</span>
                                                    </div>
                                                    <FileUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onFileSelect={handleAIProcess}
                                                        onUrlProcess={handleProcessUrl}
                                                        accept="image/*"
                                                    />
                                                </TabsContent>

                                                {/* Camera Tab */}
                                                <TabsContent value="camera" className="mt-0">
                                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                                                        <video
                                                            ref={videoRef}
                                                            autoPlay
                                                            playsInline
                                                            muted
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <canvas ref={canvasRef} className="hidden" />

                                                        {/* Capture Button */}
                                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                                            <motion.button
                                                                type="button"
                                                                onClick={capturePhoto}
                                                                className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-[#80163A]" />
                                                            </motion.button>
                                                        </div>

                                                        {/* Camera Not Active Overlay */}
                                                        {!isCameraActive && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white/60 gap-2">
                                                                <Camera className="w-10 h-10" />
                                                                <p className="text-xs">Starting camera...</p>
                                                            </div>
                                                        )}
                                                    </div>
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



            {/* Multi-Select Toolbar */}
            <MultiSelectToolbar
                selectedCount={multiSelect.selectedCount}
                onAddToOutfit={() => setShowOutfitDialog(true)}
                onMarkFavorites={multiSelect.handleBatchFavorites}
                onDelete={multiSelect.handleBatchDelete}
                onCancel={multiSelect.clearSelection}
            />

            {/* Outfit Selection Dialog */}
            <OutfitSelectionDialog
                isOpen={showOutfitDialog}
                onClose={() => setShowOutfitDialog(false)}
                onSelect={multiSelect.handleAddToOutfit}
                selectedCount={multiSelect.selectedCount}
            />

            {/* Capsule/Collection Dialog */}
            <CapsuleDialog
                isOpen={capsuleDialogOpen}
                onClose={() => {
                    setCapsuleDialogOpen(false);
                    setEditingCapsule(null);
                }}
                capsule={editingCapsule}
            />
        </AppLayout >
    );
}

export default WardrobePage;
