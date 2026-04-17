import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Camera, Link, AlertCircle, Loader2, Sparkles } from "lucide-react";

import { LuxuryButton } from "@/components/ui/luxury-button";
import { LuxuryInput } from "@/components/ui/luxury-input";
import { useToast } from "@/hooks/use-toast";
import { HapticFeedback } from "@/lib/haptics";
import { processImage, generatePlaceholder } from "@/lib/image-pipeline";
import { processWardrobeImage, AIProcessingResult } from "@/lib/image-ai";

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onFileSelect?: (file: File) => void; // New: expose raw file for AI processing
    onUrlProcess?: (url: string) => void; // New: process URL with background removal
    onAIProcess?: (result: AIProcessingResult) => void; // Full AI pipeline: bg removal + colors + category
    accept?: string;
    maxSize?: number;
    showAIBadge?: boolean; // Show AI processing badge
    enableAI?: boolean; // Enable AI processing (background removal, color detection)
}

export default function FileUpload({
    value,
    onChange,
    onFileSelect,
    onUrlProcess,
    onAIProcess,
    accept = "image/*",
    maxSize = MAX_FILE_SIZE,
    showAIBadge = false,
    enableAI = false
}: FileUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [aiProgress, setAiProgress] = useState<{ stage: string; progress: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }

        // Check file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            return `File too large. Maximum size: ${maxSizeMB}MB`;
        }

        return null;
    };

    const processFile = useCallback(async (file: File) => {
        setError(null);

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            toast({
                title: "Upload failed",
                description: validationError,
                variant: "destructive",
            });
            return;
        }

        // If onFileSelect is provided, call it with the raw file for AI processing
        if (onFileSelect) {
            onFileSelect(file);
            return; // Let the parent handle the rest
        }

        // AI Processing: background removal + color detection + category suggestion
        if (enableAI && onAIProcess) {
            setIsLoading(true);
            setAiProgress({ stage: 'Initializing AI...', progress: 5 });

            try {
                const result = await processWardrobeImage(
                    file,
                    (stage, progress) => setAiProgress({ stage, progress }),
                    { removeBg: true }
                );

                onAIProcess(result);
                setAiProgress(null);
                setIsLoading(false);

                toast({
                    title: "AI Processing Complete",
                    description: `Detected: ${result.colors.colorName} ${result.category.category}`,
                });
                return;
            } catch (aiError) {
                console.error('AI processing failed:', aiError);
                setAiProgress(null);
                // Fall through to standard upload
            }
        }

        setIsLoading(true);
        try {
            // Upload to server endpoint
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload-image', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Upload failed');
            }

            const data = await response.json();

            if (data.url) {
                onChange(data.url);
                setError(null);
                toast({
                    title: "Image uploaded",
                    description: "Your image has been uploaded successfully.",
                });
            } else {
                throw new Error('No URL returned from server');
            }
        } catch (error) {
            console.error("Upload failed:", error);
            const message = error instanceof Error ? error.message : "Upload failed";
            setError(message);
            toast({
                title: "Upload failed",
                description: message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [onChange, onFileSelect, maxSize, toast]);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    }, [processFile]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    }, [processFile]);

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            // Basic URL validation
            try {
                new URL(urlInput.trim());

                // If onUrlProcess is provided, use it for background removal
                if (onUrlProcess) {
                    onUrlProcess(urlInput.trim());
                } else {
                    onChange(urlInput.trim());
                }

                setUrlInput("");
                setShowUrlInput(false);
                setError(null);
            } catch {
                setError("Please enter a valid URL");
                toast({
                    title: "Invalid URL",
                    description: "Please enter a valid image URL",
                    variant: "destructive",
                });
            }
        }
    };

    const handleClear = () => {
        onChange("");
        setError(null);
        HapticFeedback.light();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (value) {
        return (
            <div className="relative rounded-md overflow-hidden border">
                <img
                    src={value}
                    alt="Uploaded"
                    className="w-full aspect-square object-cover"
                />
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-2 right-2 p-1.5 bg-background/90 border rounded-full hover:bg-background transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                aria-label="Upload image file"
            />

            {/* Upload area with drag and drop */}
            <label
                htmlFor="file-upload"
                className={`border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${isDragging
                    ? 'border-primary bg-primary/5'
                    : error
                        ? 'border-destructive/50 bg-destructive/5'
                        : 'hover:bg-muted/50 hover:border-primary/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full border-2 border-[#80163A]/20 border-t-[#80163A] animate-spin" />
                        {aiProgress ? (
                            <div className="mt-3 w-full max-w-[150px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="h-3 w-3 text-[#80163A]" />
                                    <p className="text-[10px] font-medium text-[#80163A] tracking-wide uppercase">{aiProgress.stage}</p>
                                </div>
                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#80163A] to-[#D4AF37] transition-all duration-300"
                                        style={{ width: `${aiProgress.progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs font-medium text-[#80163A] mt-3 tracking-wide uppercase">Adding to Studio...</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={`rounded-full p-3 mb-3 ${error ? 'bg-destructive/10' : 'bg-muted'}`}>
                            {error ? (
                                <AlertCircle className="h-6 w-6 text-destructive" />
                            ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                        </div>
                        <p className="text-sm font-medium">
                            {isDragging ? 'Drop image here' : 'Upload image'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP, GIF (max {(maxSize / (1024 * 1024)).toFixed(0)}MB)
                        </p>
                    </>
                )}
            </label>

            {/* Error message */}
            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
                <LuxuryButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                        HapticFeedback.selection();
                        fileInputRef.current?.click();
                    }}
                    disabled={isLoading}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse
                </LuxuryButton>
                <LuxuryButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                        HapticFeedback.selection();
                        setShowUrlInput(!showUrlInput);
                    }}
                    disabled={isLoading}
                >
                    <Link className="h-4 w-4 mr-2" />
                    URL
                </LuxuryButton>
            </div>

            {/* URL input */}
            {showUrlInput && (
                <div className="flex gap-2">
                    <LuxuryInput
                        type="url"
                        placeholder="Paste image URL..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                    />
                    <LuxuryButton type="button" size="sm" onClick={handleUrlSubmit}>
                        Add
                    </LuxuryButton>
                </div>
            )}
        </div>
    );
}
