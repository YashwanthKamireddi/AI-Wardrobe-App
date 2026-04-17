/**
 * Image AI Hook
 * Provides React hooks for AI image processing features:
 * - Background removal
 * - Color detection
 * - Smart categorization
 */

import { useState, useCallback } from "react";
import {
    removeImageBackground,
    processImageFromUrl,
    detectColors,
    detectCategory,
    processWardrobeImage,
    BackgroundRemovalResult,
    ColorResult,
    CategoryResult,
    AIProcessingResult,
} from "@/lib/image-ai";
import { processImage, generateThumbnail, ProcessedImage } from "@/lib/image-pipeline";

/**
 * Hook for background removal
 */
export function useBackgroundRemoval() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<BackgroundRemovalResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const removeBackground = useCallback(async (file: File | Blob) => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const result = await removeImageBackground(file, setProgress);
            setResult(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Background removal failed');
            setError(error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setProgress(0);
        setError(null);
    }, []);

    return {
        removeBackground,
        result,
        isProcessing,
        progress,
        error,
        reset,
    };
}

/**
 * Hook for color detection
 */
export function useColorDetection() {
    const [isDetecting, setIsDetecting] = useState(false);
    const [colors, setColors] = useState<ColorResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const detect = useCallback(async (imageUrl: string) => {
        setIsDetecting(true);
        setError(null);

        try {
            const result = await detectColors(imageUrl);
            setColors(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Color detection failed');
            setError(error);
            throw error;
        } finally {
            setIsDetecting(false);
        }
    }, []);

    return {
        detect,
        colors,
        isDetecting,
        error,
    };
}

/**
 * Hook for smart category detection
 */
export function useCategoryDetection() {
    const [isDetecting, setIsDetecting] = useState(false);
    const [category, setCategory] = useState<CategoryResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const detect = useCallback(async (imageUrl: string) => {
        setIsDetecting(true);
        setError(null);

        try {
            const result = await detectCategory(imageUrl);
            setCategory(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Category detection failed');
            setError(error);
            throw error;
        } finally {
            setIsDetecting(false);
        }
    }, []);

    return {
        detect,
        category,
        isDetecting,
        error,
    };
}

/**
 * Complete AI processing pipeline hook
 * Combines: background removal + color detection + category suggestion
 */
export function useAIImageProcessing() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<{ stage: string; percent: number }>({ stage: '', percent: 0 });
    const [result, setResult] = useState<AIProcessingResult | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const process = useCallback(async (file: File, options?: { removeBg?: boolean }) => {
        setIsProcessing(true);
        setProgress({ stage: 'Initializing...', percent: 0 });
        setError(null);

        try {
            const result = await processWardrobeImage(
                file,
                (stage, percent) => setProgress({ stage, percent }),
                { removeBg: options?.removeBg ?? true }
            );
            setResult(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('AI processing failed');
            setError(error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const processUrl = useCallback(async (url: string) => {
        setIsProcessing(true);
        setProgress({ stage: 'Fetching image...', percent: 0 });
        setError(null);

        try {
            const { processedUrl, processedBlob } = await processImageFromUrl(
                url,
                (stage, percent) => setProgress({ stage, percent })
            );

            // Now detect colors and category
            setProgress({ stage: 'Analyzing colors...', percent: 70 });
            const colors = await detectColors(processedUrl);

            setProgress({ stage: 'Identifying category...', percent: 85 });
            const category = await detectCategory(processedUrl);

            const result: AIProcessingResult = {
                processedImageUrl: processedUrl,
                processedImageBlob: processedBlob,
                colors,
                category,
            };

            setResult(result);
            setProgress({ stage: 'Complete', percent: 100 });
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('URL processing failed');
            setError(error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setProgress({ stage: '', percent: 0 });
        setError(null);
    }, []);

    return {
        process,
        processUrl,
        result,
        isProcessing,
        progress,
        error,
        reset,
    };
}

/**
 * Hook for image optimization (compression, resizing)
 */
export function useImageOptimization() {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [result, setResult] = useState<ProcessedImage | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const optimize = useCallback(async (
        file: File | Blob,
        options?: { maxDimension?: number; quality?: number; format?: 'jpeg' | 'webp' | 'png' }
    ) => {
        setIsOptimizing(true);
        setError(null);

        try {
            const result = await processImage(file, options);
            setResult(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Image optimization failed');
            setError(error);
            throw error;
        } finally {
            setIsOptimizing(false);
        }
    }, []);

    const createThumbnail = useCallback(async (file: File | Blob, size?: number) => {
        setIsOptimizing(true);
        setError(null);

        try {
            const result = await generateThumbnail(file, size);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Thumbnail generation failed');
            setError(error);
            throw error;
        } finally {
            setIsOptimizing(false);
        }
    }, []);

    return {
        optimize,
        createThumbnail,
        result,
        isOptimizing,
        error,
    };
}
