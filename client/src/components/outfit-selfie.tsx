/**
 * OUTFIT SELFIE COMPONENT - "THE MIRROR"
 *
 * Design Philosophy: Fashion Editorial Photobooth meets Luxury Lookbook.
 * - Typography: Playfair Display, minimal uppercase labels
 * - Layout: Clean, cinematic capture experience
 * - Aesthetic: High-fashion magazine selfie booth
 *
 * Features:
 * - Camera capture or upload
 * - Associate with wear log
 * - Mood/feeling tracking
 * - View history grid
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera, Upload, X, Check, Image as ImageIcon,
    Star, Smile, Meh, Frown, Heart, Sparkles
} from "lucide-react";
import { format } from "date-fns";

export interface OutfitSelfie {
    id: string;
    imageUrl: string;
    date: Date;
    mood: "great" | "good" | "okay" | "meh";
    notes?: string;
    wearLogId?: number;
}

interface OutfitSelfieCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (selfie: Omit<OutfitSelfie, "id">) => void;
    wearLogId?: number;
}

const MOODS = [
    { id: "great", label: "Exceptional", icon: Star, color: "#D4AF37" },
    { id: "good", label: "Confident", icon: Smile, color: "#10B981" },
    { id: "okay", label: "Comfortable", icon: Meh, color: "#6B7280" },
    { id: "meh", label: "Not Today", icon: Frown, color: "#80163A" },
] as const;

export function OutfitSelfieCapture({ isOpen, onClose, onCapture, wearLogId }: OutfitSelfieCaptureProps) {
    const [step, setStep] = useState<"capture" | "mood">("capture");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selectedMood, setSelectedMood] = useState<OutfitSelfie["mood"] | null>(null);
    const [notes, setNotes] = useState("");
    const [isUsingCamera, setIsUsingCamera] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsUsingCamera(true);
        } catch (err) {
            console.error("Camera access denied:", err);
            // Fallback to file upload
            fileInputRef.current?.click();
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsUsingCamera(false);
    };

    const captureFromCamera = () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
                setCapturedImage(imageUrl);
                stopCamera();
                setStep("mood");
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
                setStep("mood");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleComplete = () => {
        if (capturedImage && selectedMood) {
            onCapture({
                imageUrl: capturedImage,
                date: new Date(),
                mood: selectedMood,
                notes: notes || undefined,
                wearLogId,
            });
            handleReset();
            onClose();
        }
    };

    const handleReset = () => {
        setCapturedImage(null);
        setSelectedMood(null);
        setNotes("");
        setStep("capture");
        stopCamera();
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className="bg-[#FAF9F6] w-full max-w-lg mx-4 overflow-hidden relative"
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
                                    <Camera className="w-3 h-3" />
                                    The Mirror
                                </p>
                                <h2
                                    className="text-2xl text-[#1A1A1A]"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {step === "capture" ? (
                                        <>Capture Your <span className="italic text-[#6B6B6B]">Look</span></>
                                    ) : (
                                        <>How Do You <span className="italic text-[#6B6B6B]">Feel</span>?</>
                                    )}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-[#1A1A1A]" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step === "capture" && !capturedImage && (
                            <div className="space-y-6">
                                {/* Camera Preview */}
                                {isUsingCamera && (
                                    <motion.div
                                        className="relative aspect-[3/4] bg-black overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Editorial Frame Overlay */}
                                        <div className="absolute inset-4 border border-white/30 pointer-events-none" />
                                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50" />
                                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50" />

                                        {/* Capture Button */}
                                        <button
                                            onClick={captureFromCamera}
                                            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-white flex items-center justify-center group hover:bg-white/20 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white group-hover:bg-[#80163A] transition-colors" />
                                        </button>
                                    </motion.div>
                                )}

                                {/* Capture Options */}
                                {!isUsingCamera && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.button
                                            onClick={startCamera}
                                            className="aspect-square flex flex-col items-center justify-center gap-4 border border-[#E5E5E5] hover:border-[#80163A] bg-white hover:bg-[#80163A]/5 transition-all group"
                                            whileHover={{ y: -4 }}
                                        >
                                            <div className="w-16 h-16 border border-[#E5E5E5] group-hover:border-[#80163A] flex items-center justify-center transition-colors">
                                                <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#80163A] transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-[#1A1A1A]">Take Photo</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Use Camera</p>
                                            </div>
                                        </motion.button>

                                        <motion.button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square flex flex-col items-center justify-center gap-4 border border-[#E5E5E5] hover:border-[#D4AF37] bg-white hover:bg-[#D4AF37]/5 transition-all group"
                                            whileHover={{ y: -4 }}
                                        >
                                            <div className="w-16 h-16 border border-[#E5E5E5] group-hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-[#1A1A1A]">Upload</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">From Gallery</p>
                                            </div>
                                        </motion.button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {step === "mood" && capturedImage && (
                            <div className="space-y-6">
                                {/* Preview */}
                                <motion.div
                                    className="relative aspect-[3/4] overflow-hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <img
                                        src={capturedImage}
                                        alt="Outfit selfie"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Editorial Overlay */}
                                    <div className="absolute inset-4 border border-white/30 pointer-events-none" />

                                    {/* Retake Button */}
                                    <button
                                        onClick={() => setStep("capture")}
                                        className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-widest hover:bg-white transition-colors"
                                    >
                                        Retake
                                    </button>

                                    {/* Date Stamp */}
                                    <div className="absolute bottom-4 left-4 text-white text-[10px] uppercase tracking-widest">
                                        {format(new Date(), "dd MMM yyyy")}
                                    </div>
                                </motion.div>

                                {/* Mood Selection */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">
                                        Mood Check
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {MOODS.map(mood => {
                                            const MoodIcon = mood.icon;
                                            const isSelected = selectedMood === mood.id;
                                            return (
                                                <motion.button
                                                    key={mood.id}
                                                    onClick={() => setSelectedMood(mood.id as OutfitSelfie["mood"])}
                                                    className={`py-4 flex flex-col items-center gap-2 transition-all border ${isSelected
                                                        ? 'bg-[#1A1A1A] border-[#1A1A1A]'
                                                        : 'bg-white border-[#E5E5E5] hover:border-[#1A1A1A]'
                                                        }`}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <MoodIcon
                                                        className="w-6 h-6"
                                                        style={{ color: isSelected ? "#FAF9F6" : mood.color }}
                                                    />
                                                    <span className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-500'
                                                        }`}>
                                                        {mood.label}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                                        Quick Note <span className="text-gray-300">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Felt confident today, loved this combination..."
                                        className="w-full p-4 border border-[#E5E5E5] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] bg-white placeholder:text-gray-300"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                        rows={2}
                                    />
                                </div>

                                {/* Save Button */}
                                <motion.button
                                    onClick={handleComplete}
                                    disabled={!selectedMood}
                                    className={`w-full py-4 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 transition-all ${selectedMood
                                        ? 'bg-[#1A1A1A] text-white hover:bg-[#80163A]'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    whileTap={selectedMood ? { scale: 0.98 } : {}}
                                >
                                    <Check className="w-4 h-4" />
                                    Save to Lookbook
                                </motion.button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Selfie Grid - "The Lookbook"
 * Editorial display of outfit selfie history
 */
interface SelfieGridProps {
    selfies: OutfitSelfie[];
    onSelfieClick?: (selfie: OutfitSelfie) => void;
}

export function SelfieGrid({ selfies, onSelfieClick }: SelfieGridProps) {
    if (selfies.length === 0) {
        return (
            <motion.div
                className="text-center py-16 border border-dashed border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="w-20 h-20 mx-auto border border-gray-200 flex items-center justify-center mb-6">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
                <h3
                    className="text-xl text-[#1A1A1A] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Your Lookbook <span className="italic text-[#6B6B6B]">Awaits</span>
                </h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                    Start capturing your outfits
                </p>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-1">
            {selfies.map((selfie, index) => {
                const moodConfig = MOODS.find(m => m.id === selfie.mood);

                return (
                    <motion.button
                        key={selfie.id}
                        onClick={() => onSelfieClick?.(selfie)}
                        className="relative aspect-[3/4] bg-gray-100 overflow-hidden group"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <img
                            src={selfie.imageUrl}
                            alt="Outfit selfie"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-white text-[10px] uppercase tracking-widest">
                                {format(new Date(selfie.date), "MMM d, yyyy")}
                            </p>
                            {moodConfig && (
                                <div className="flex items-center gap-1 mt-1">
                                    <moodConfig.icon className="w-3 h-3" style={{ color: moodConfig.color }} />
                                    <span className="text-white/80 text-[9px] uppercase tracking-wider">
                                        {moodConfig.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Favorite badge */}
                        {selfie.mood === "great" && (
                            <div className="absolute top-2 right-2">
                                <Heart className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

/**
 * Compact Selfie Button for integration into other components
 */
interface SelfieTriggerButtonProps {
    onClick: () => void;
    className?: string;
}

export function SelfieTriggerButton({ onClick, className = "" }: SelfieTriggerButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] hover:border-[#80163A] bg-white hover:bg-[#80163A]/5 transition-all ${className}`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <Camera className="w-4 h-4 text-[#80163A]" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#1A1A1A]">
                Capture Look
            </span>
        </motion.button>
    );
}

export default OutfitSelfieCapture;
