import { useState, useMemo, useRef } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import {
    Frame,
    Download,
    Share2,
    Layers,
    Grid3X3,
    Heart,
    User,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Check,
    Image as ImageIcon,
    Square,
    RectangleVertical,
    Circle,
    Hexagon,
    Star,
    Palette,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import { useToast } from "@/hooks/use-toast";

/**
 * FRAMING PAGE - EDITORIAL OUTFIT SHOWCASE
 *
 * Design: Elegant outfit presentation frames
 * Focus: Creating shareable, beautiful outfit displays
 */

interface FrameStyle {
    id: string;
    name: string;
    icon: React.ElementType;
    borderStyle: string;
    background: string;
    shadow: string;
    aspectRatio: string;
}

interface BackgroundOption {
    id: string;
    name: string;
    value: string;
    preview: string;
}

const FRAME_STYLES: FrameStyle[] = [
    {
        id: "minimal",
        name: "Minimal",
        icon: Square,
        borderStyle: "border-2 border-[#1A1A1A]",
        background: "bg-white",
        shadow: "shadow-lg",
        aspectRatio: "aspect-[3/4]",
    },
    {
        id: "elegant",
        name: "Elegant",
        icon: RectangleVertical,
        borderStyle: "border-8 border-[#1A1A1A]",
        background: "bg-[#F9F9F7]",
        shadow: "shadow-2xl",
        aspectRatio: "aspect-[3/4]",
    },
    {
        id: "gallery",
        name: "Gallery",
        icon: Frame,
        borderStyle: "border-[16px] border-white ring-1 ring-[#E5E5E5]",
        background: "bg-[#FAFAFA]",
        shadow: "shadow-[0_25px_60px_rgba(0,0,0,0.15)]",
        aspectRatio: "aspect-[3/4]",
    },
    {
        id: "polaroid",
        name: "Polaroid",
        icon: ImageIcon,
        borderStyle: "border-8 border-b-[48px] border-white",
        background: "bg-white",
        shadow: "shadow-xl rotate-[-2deg]",
        aspectRatio: "aspect-[3/4]",
    },
    {
        id: "circle",
        name: "Circle",
        icon: Circle,
        borderStyle: "border-4 border-[#D4AF37] rounded-full overflow-hidden",
        background: "bg-white",
        shadow: "shadow-[0_0_40px_rgba(212,175,55,0.3)]",
        aspectRatio: "aspect-square",
    },
    {
        id: "luxury",
        name: "Luxury",
        icon: Hexagon,
        borderStyle: "border-4 border-[#D4AF37]",
        background: "bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A]",
        shadow: "shadow-[0_30px_60px_rgba(0,0,0,0.3)]",
        aspectRatio: "aspect-[3/4]",
    },
];

const BACKGROUNDS: BackgroundOption[] = [
    { id: "white", name: "Pure White", value: "#FFFFFF", preview: "bg-white" },
    { id: "cream", name: "Warm Cream", value: "#F9F9F7", preview: "bg-[#F9F9F7]" },
    { id: "black", name: "Deep Black", value: "#1A1A1A", preview: "bg-[#1A1A1A]" },
    { id: "burgundy", name: "Burgundy", value: "#80163A", preview: "bg-[#80163A]" },
    { id: "gradient1", name: "Sunset", value: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)", preview: "bg-gradient-to-br from-amber-400 to-red-500" },
    { id: "gradient2", name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", preview: "bg-gradient-to-br from-indigo-400 to-purple-500" },
];

const OVERLAYS = [
    { id: "none", name: "None" },
    { id: "vignette", name: "Vignette" },
    { id: "grain", name: "Film Grain" },
    { id: "dust", name: "Dust & Scratches" },
];

export function FramingPage() {
    const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
    const { data: outfits, isLoading: outfitsLoading } = useOutfits();
    const { toast } = useToast();
    const frameRef = useRef<HTMLDivElement>(null);

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFrame, setSelectedFrame] = useState<FrameStyle>(FRAME_STYLES[0]);
    const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(BACKGROUNDS[0]);
    const [selectedOverlay, setSelectedOverlay] = useState("none");
    const [showTitle, setShowTitle] = useState(true);
    const [frameTitle, setFrameTitle] = useState("Today's Look");
    const [step, setStep] = useState<"select" | "customize" | "export">("select");

    const isLoading = wardrobeLoading || outfitsLoading;

    const toggleItem = (itemId: number) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : prev.length < 5
                    ? [...prev, itemId]
                    : prev
        );
    };

    const selectedItemsData = useMemo(() => {
        if (!wardrobeItems) return [];
        return wardrobeItems.filter((item) => selectedItems.includes(item.id));
    }, [wardrobeItems, selectedItems]);

    const handleExport = async () => {
        if (!frameRef.current) return;

        try {
            const canvas = await html2canvas(frameRef.current, {
                scale: 2, // High resolution
                useCORS: true, // Allow cross-origin images
                backgroundColor: null,
            });

            const link = document.createElement("a");
            link.download = `framed-style-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            toast({
                title: "Frame Saved!",
                description: "Your masterpiece has been downloaded.",
            });
        } catch (error) {
            console.error("Export failed:", error);
            toast({
                title: "Export Failed",
                description: "Could not save the image. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleShare = async () => {
        if (!frameRef.current) return;

        try {
            const canvas = await html2canvas(frameRef.current, { scale: 2, useCORS: true });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], "outfit.png", { type: "image/png" });

                // If Web Share API is available and can share files
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'My Style Frame',
                        text: 'Check out this outfit I curated!',
                        files: [file]
                    });
                } else {
                    // Fallback to clipboard
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    toast({
                        title: "Copied to Clipboard!",
                        description: "Image copied. Paste it anywhere.",
                    });
                }
            });
        } catch (error) {
            toast({
                title: "Share Failed",
                description: "Could not share the image.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AppLayout>
            {/* Navigation */}

            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Showcase</p>
                    <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
                        Frame Your Style
                    </h1>
                    <p className="text-[#6B6B6B] text-lg">Create beautiful outfit presentations</p>
                </motion.header>

                {/* Progress Steps */}
                <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="flex items-center justify-center gap-4">
                        {[
                            { key: "select", label: "Select Items" },
                            { key: "customize", label: "Customize Frame" },
                            { key: "export", label: "Export & Share" },
                        ].map((s, i) => (
                            <div key={s.key} className="flex items-center gap-4">
                                <motion.button
                                    onClick={() => setStep(s.key as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step === s.key
                                        ? "bg-[#1A1A1A] text-white"
                                        : "bg-white border border-[#E5E5E5] text-[#6B6B6B]"
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs uppercase tracking-wider hidden md:inline">{s.label}</span>
                                </motion.button>
                                {i < 2 && <div className="w-8 h-px bg-[#E5E5E5] hidden md:block" />}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Panel - Controls */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <AnimatePresence mode="wait">
                            {/* Step 1: Select Items */}
                            {step === "select" && (
                                <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <h2 className="text-xl text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Select Items ({selectedItems.length}/5)
                                    </h2>
                                    <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-4 max-h-[50vh] overflow-y-auto">
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                            {wardrobeItems?.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedItems.includes(item.id)
                                                        ? "border-[#1A1A1A]"
                                                        : "border-transparent hover:border-[#E5E5E5]"
                                                        }`}
                                                    onClick={() => toggleItem(item.id)}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    {selectedItems.includes(item.id) && (
                                                        <div className="absolute inset-0 bg-[#1A1A1A]/40 flex items-center justify-center">
                                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                                <Check className="w-5 h-5 text-[#1A1A1A]" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                        {(!wardrobeItems || wardrobeItems.length === 0) && (
                                            <div className="py-12 text-center text-[#9A9A9A]">
                                                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Add items to your wardrobe first</p>
                                            </div>
                                        )}
                                    </div>
                                    <motion.button
                                        className="mt-4 w-full py-4 rounded-xl bg-[#1A1A1A] text-white text-sm tracking-wider disabled:opacity-50"
                                        disabled={selectedItems.length === 0}
                                        onClick={() => setStep("customize")}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        CONTINUE TO CUSTOMIZE
                                    </motion.button>
                                </motion.div>
                            )}

                            {/* Step 2: Customize Frame */}
                            {step === "customize" && (
                                <motion.div key="customize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                    {/* Frame Style */}
                                    <div>
                                        <h3 className="text-sm font-medium text-[#1A1A1A] mb-3 uppercase tracking-wider">Frame Style</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {FRAME_STYLES.map((frame) => (
                                                <motion.button
                                                    key={frame.id}
                                                    className={`p-4 rounded-xl border-2 transition-all text-center ${selectedFrame.id === frame.id
                                                        ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                                                        : "border-[#E5E5E5] bg-white text-[#6B6B6B] hover:border-[#9A9A9A]"
                                                        }`}
                                                    onClick={() => setSelectedFrame(frame)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <frame.icon className="w-5 h-5 mx-auto mb-2" />
                                                    <span className="text-xs">{frame.name}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Background */}
                                    <div>
                                        <h3 className="text-sm font-medium text-[#1A1A1A] mb-3 uppercase tracking-wider">Background</h3>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {BACKGROUNDS.map((bg) => (
                                                <motion.button
                                                    key={bg.id}
                                                    className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 ${bg.preview} ${selectedBackground.id === bg.id ? "border-[#1A1A1A] ring-2 ring-[#1A1A1A]/20" : "border-[#E5E5E5]"
                                                        }`}
                                                    onClick={() => setSelectedBackground(bg)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title={bg.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-[#1A1A1A] uppercase tracking-wider">Title</h3>
                                            <button
                                                className={`text-xs px-3 py-1 rounded-full transition-colors ${showTitle ? "bg-[#1A1A1A] text-white" : "bg-[#E5E5E5] text-[#6B6B6B]"
                                                    }`}
                                                onClick={() => setShowTitle(!showTitle)}
                                            >
                                                {showTitle ? "ON" : "OFF"}
                                            </button>
                                        </div>
                                        {showTitle && (
                                            <input
                                                type="text"
                                                value={frameTitle}
                                                onChange={(e) => setFrameTitle(e.target.value)}
                                                placeholder="Enter a title..."
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A]"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            />
                                        )}
                                    </div>

                                    {/* Overlay Effect */}
                                    <div>
                                        <h3 className="text-sm font-medium text-[#1A1A1A] mb-3 uppercase tracking-wider">Overlay Effect</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {OVERLAYS.map((overlay) => (
                                                <motion.button
                                                    key={overlay.id}
                                                    className={`px-4 py-2 rounded-full text-xs transition-all ${selectedOverlay === overlay.id
                                                        ? "bg-[#1A1A1A] text-white"
                                                        : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A]"
                                                        }`}
                                                    onClick={() => setSelectedOverlay(overlay.id)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {overlay.name}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <motion.button
                                            className="flex-1 py-4 rounded-xl bg-white border border-[#E5E5E5] text-[#1A1A1A] text-sm tracking-wider"
                                            onClick={() => setStep("select")}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            BACK
                                        </motion.button>
                                        <motion.button
                                            className="flex-1 py-4 rounded-xl bg-[#1A1A1A] text-white text-sm tracking-wider"
                                            onClick={() => setStep("export")}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            CONTINUE
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Export */}
                            {step === "export" && (
                                <motion.div key="export" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-6">
                                        <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                                        <h3 className="text-xl text-[#1A1A1A] text-center mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            Your Frame is Ready!
                                        </h3>
                                        <p className="text-sm text-[#6B6B6B] text-center mb-6">
                                            Save it to your gallery or share with friends
                                        </p>

                                        <div className="space-y-3">
                                            <motion.button
                                                className="w-full py-4 rounded-xl bg-[#1A1A1A] text-white text-sm tracking-wider flex items-center justify-center gap-2"
                                                onClick={handleExport}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <Download className="w-4 h-4" />
                                                SAVE TO GALLERY
                                            </motion.button>
                                            <motion.button
                                                className="w-full py-4 rounded-xl bg-white border border-[#E5E5E5] text-[#1A1A1A] text-sm tracking-wider flex items-center justify-center gap-2"
                                                onClick={handleShare}
                                                whileHover={{ scale: 1.01, borderColor: "#1A1A1A" }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <Share2 className="w-4 h-4" />
                                                SHARE LINK
                                            </motion.button>
                                        </div>
                                    </div>

                                    <motion.button
                                        className="w-full py-4 rounded-xl bg-white border border-[#E5E5E5] text-[#6B6B6B] text-sm tracking-wider"
                                        onClick={() => setStep("customize")}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        ← EDIT FRAME
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Right Panel - Preview */}
                    <motion.div
                        className="sticky top-24"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-xl text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Preview
                        </h2>
                        <div
                            className="rounded-3xl p-8 flex items-center justify-center min-h-[400px]"
                            style={{
                                background: selectedBackground.value.includes("gradient")
                                    ? selectedBackground.value
                                    : selectedBackground.value,
                                backgroundColor: !selectedBackground.value.includes("gradient") ? selectedBackground.value : undefined,
                            }}
                        >
                            <div
                                ref={frameRef}
                                className={`relative ${selectedFrame.borderStyle} ${selectedFrame.shadow} ${selectedFrame.aspectRatio} w-full max-w-[280px] overflow-hidden transition-all duration-300`}
                            >
                                {/* Inner content */}
                                <div className={`absolute inset-0 ${selectedFrame.background}`}>
                                    {selectedItemsData.length > 0 ? (
                                        <div className={`h-full ${selectedItemsData.length === 1 ? "" : "grid gap-1"}`} style={{
                                            gridTemplateColumns: selectedItemsData.length <= 2 ? "1fr" : selectedItemsData.length === 3 ? "1fr 1fr" : "1fr 1fr",
                                            gridTemplateRows: selectedItemsData.length <= 2 ? selectedItemsData.length === 1 ? "1fr" : "1fr 1fr" : "1fr 1fr",
                                        }}>
                                            {selectedItemsData.map((item, i) => (
                                                <div
                                                    key={item.id}
                                                    className={`relative overflow-hidden ${selectedItemsData.length === 3 && i === 0 ? "row-span-2" : ""
                                                        } ${selectedItemsData.length === 5 && i === 0 ? "row-span-2 col-span-1" : ""}`}
                                                >
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[#9A9A9A]">
                                            <div className="text-center p-6">
                                                <Frame className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                                <p className="text-sm">Select items to preview</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay Effects */}
                                    {selectedOverlay === "vignette" && (
                                        <div className="absolute inset-0 pointer-events-none" style={{
                                            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)"
                                        }} />
                                    )}
                                    {selectedOverlay === "grain" && (
                                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                        }} />
                                    )}
                                </div>

                                {/* Title Overlay */}
                                {showTitle && frameTitle && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                        <p className="text-white text-center text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {frameTitle}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
        </AppLayout>
    );
}

export default FramingPage;
