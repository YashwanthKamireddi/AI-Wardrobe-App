import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Sparkles, Upload, Scan, CheckCircle2, Loader2, X } from "lucide-react";
import { processWardrobeImage, AIProcessingResult } from "@/lib/image-ai";

export function InteractiveIngestion() {
    const [status, setStatus] = useState<"idle" | "processing" | "complete">("idle");
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState("");
    const [result, setResult] = useState<AIProcessingResult | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setOriginalPreview(URL.createObjectURL(file));
        setStatus("processing");
        setProgress(0);

        try {
            const result = await processWardrobeImage(file, (currentStage, currentProgress) => {
                setStage(currentStage);
                setProgress(currentProgress);
            });
            setResult(result);
            setStatus("complete");
        } catch (error) {
            console.error(error);
            setStatus("idle");
            setOriginalPreview(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        disabled: status === "processing"
    });

    const reset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus("idle");
        setResult(null);
        setOriginalPreview(null);
    };

    return (
        <div className="w-full max-w-md mx-auto relative">
            <AnimatePresence mode="wait">
                {status === "idle" ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full aspect-square relative"
                    >
                        <div
                            {...getRootProps()}
                            className={`w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${isDragActive
                                ? "border-[#80163a] bg-[#80163a]/5"
                                : "border-[#1a1a1a]/10 bg-white hover:border-[#80163a]/30 hover:bg-[#80163a]/5"
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="p-8 text-center space-y-4 relative z-10">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors duration-300 ${isDragActive ? "bg-[#80163a] text-white" : "bg-[#F3EFEA] text-[#1a1a1a]/40 group-hover:bg-[#80163a] group-hover:text-white"}`}>
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-playfair text-2xl mb-2 text-[#1a1a1a]">Drop Image to Analyze</p>
                                    <p className="text-xs text-[#999] uppercase tracking-wider">or click to upload</p>
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-0 right-0 text-center">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#80163a]/60">Run Live on Browser Architecture</span>
                            </div>


                            {/* Decor */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                                style={{ backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full aspect-square relative rounded-2xl overflow-hidden bg-[#F5F5F5] shadow-xl border border-white/50"
                    >
                        {/* Results View */}
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            {status === "processing" ? (
                                <div className="text-center w-full">
                                    <div className="w-full aspect-[3/4] max-h-[300px] mx-auto mb-6 relative rounded-lg overflow-hidden shadow-sm">
                                        {originalPreview && (
                                            <img src={originalPreview} alt="Processing" className="w-full h-full object-cover opacity-50 blur-sm scale-110" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full border-4 border-white border-t-[#80163a] animate-spin shadow-lg" />
                                        </div>
                                    </div>
                                    <p className="font-bold text-[#80163a] uppercase text-xs tracking-widest mb-1">{stage}</p>
                                    <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                                        <motion.div
                                            className="h-full bg-[#80163a]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center group">
                                    {result && (
                                        <motion.img
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            src={result.processedImageUrl}
                                            alt="Processed"
                                            className="max-w-full max-h-[80%] object-contain drop-shadow-2xl"
                                        />
                                    )}

                                    {/* Reset Button */}
                                    <button
                                        onClick={reset}
                                        className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-[#1a1a1a] shadow-sm backdrop-blur-sm transition-all hover:scale-110 z-20"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    {/* Result Overlay Stats */}
                                    {result && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg"
                                        >
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Detected Style</p>
                                                    <p className="text-sm font-bold capitalize text-[#1a1a1a]">{result.category.category}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {result.colors.palette.map((color, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full shadow-sm border border-gray-100" style={{ backgroundColor: color }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
