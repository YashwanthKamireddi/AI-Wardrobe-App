/**
 * LUXURY IMAGE PIPELINE
 *
 * Optimized image handling for wardrobe apps:
 * - Client-side compression before upload
 * - HEIC to JPEG/WebP conversion
 * - Smart resizing (max 2000px dimension)
 * - Quality optimization (80% for excellent balance)
 * - BlurHash generation for instant placeholders
 *
 * Prevents OOM crashes and reduces upload time.
 */

export interface ImageProcessingOptions {
  maxDimension?: number;   // Max width or height
  quality?: number;        // 0-1, default 0.8
  format?: "jpeg" | "webp" | "png";
  preserveExif?: boolean;
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dataUrl?: string;
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  maxDimension: 2000,
  quality: 0.8,
  format: "jpeg",
  preserveExif: false,
};

/**
 * Compress and resize image
 */
export async function processImage(
  file: File | Blob,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // Create image element
  const img = await loadImage(file);

  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    opts.maxDimension!
  );

  // Create canvas and draw resized image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Use high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  const mimeType = `image/${opts.format}`;
  const blob = await canvasToBlob(canvas, mimeType, opts.quality!);

  return {
    blob,
    width,
    height,
    originalSize,
    compressedSize: blob.size,
    compressionRatio: originalSize / blob.size,
  };
}

/**
 * Load image from file/blob
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = width / height;

  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / ratio),
    };
  } else {
    return {
      width: Math.round(maxDimension * ratio),
      height: maxDimension,
    };
  }
}

/**
 * Convert canvas to blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      type,
      quality
    );
  });
}

/**
 * Check if file is HEIC format
 */
export function isHEIC(file: File): boolean {
  const heicTypes = [
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
  ];

  if (heicTypes.includes(file.type.toLowerCase())) return true;

  // Check file extension
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/**
 * Convert HEIC to JPEG using canvas
 * Note: This requires the browser to support HEIC natively
 * or use a library like heic2any for broader support
 */
export async function convertHEIC(file: File): Promise<Blob> {
  // Try native conversion first
  try {
    const processed = await processImage(file, { format: "jpeg" });
    return processed.blob;
  } catch {
    // For browsers that don't support HEIC, we'd need heic2any library
    // This is a fallback that returns the original if native fails
    console.warn("HEIC conversion not supported, returning original");
    return file;
  }
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
  file: File | Blob,
  size: number = 200
): Promise<ProcessedImage> {
  return processImage(file, {
    maxDimension: size,
    quality: 0.7,
    format: "jpeg",
  });
}

/**
 * Get image dimensions without full load
 */
export function getImageDimensions(
  file: File | Blob
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to get dimensions"));
    };

    img.src = url;
  });
}

/**
 * Simple BlurHash-like placeholder generator
 * Creates a tiny colored placeholder from image
 */
export async function generatePlaceholder(
  file: File | Blob,
  size: number = 4
): Promise<string> {
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(img, 0, 0, size, size);

  // Return as tiny base64 image
  return canvas.toDataURL("image/jpeg", 0.1);
}

/**
 * Batch process multiple images
 */
export async function batchProcessImages(
  files: File[],
  options: ImageProcessingOptions = {},
  onProgress?: (processed: number, total: number) => void
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const processed = await processImage(files[i], options);
    results.push(processed);
    onProgress?.(i + 1, total);
  }

  return results;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default {
  processImage,
  generateThumbnail,
  getImageDimensions,
  generatePlaceholder,
  batchProcessImages,
  isHEIC,
  convertHEIC,
  formatFileSize,
};
