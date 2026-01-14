/**
 * AI Image Processing Utilities
 * All processing happens in the browser - completely free, no API costs!
 */

import { removeBackground } from '@imgly/background-removal';

// ============================================
// BACKGROUND REMOVAL
// ============================================

export interface BackgroundRemovalResult {
  blob: Blob;
  url: string;
}

/**
 * Remove background from an image
 * Uses @imgly/background-removal - runs entirely in browser
 */
export async function removeImageBackground(
  imageFile: File | Blob,
  onProgress?: (progress: number) => void
): Promise<BackgroundRemovalResult> {
  try {
    const blob = await removeBackground(imageFile, {
      progress: (key, current, total) => {
        if (onProgress && total > 0) {
          onProgress(Math.round((current / total) * 100));
        }
      },
      // Use isnet model - works well for clothing
      model: 'isnet',
      output: {
        format: 'image/png',
        quality: 0.9,
      },
    });

    const url = URL.createObjectURL(blob);
    return { blob, url };
  } catch (error) {
    console.error('Background removal failed, using original:', error);
    // Fallback: return original image if background removal fails
    const url = URL.createObjectURL(imageFile);
    return { blob: imageFile as Blob, url };
  }
}

// ============================================
// COLOR DETECTION
// ============================================

export interface ColorResult {
  dominant: string;
  palette: string[];
  colorName: string;
}

// Color name mapping for fashion
const COLOR_NAMES: Record<string, { range: [number, number, number, number, number, number]; name: string }[]> = {
  reds: [
    { range: [150, 255, 0, 80, 0, 80], name: 'Red' },
    { range: [100, 150, 0, 60, 0, 60], name: 'Maroon' },
    { range: [200, 255, 100, 150, 100, 150], name: 'Coral' },
  ],
  pinks: [
    { range: [200, 255, 100, 180, 150, 220], name: 'Pink' },
    { range: [200, 255, 0, 100, 100, 180], name: 'Hot Pink' },
    { range: [255, 255, 180, 210, 200, 230], name: 'Light Pink' },
  ],
  oranges: [
    { range: [200, 255, 100, 180, 0, 80], name: 'Orange' },
    { range: [200, 255, 150, 200, 100, 150], name: 'Peach' },
  ],
  yellows: [
    { range: [200, 255, 200, 255, 0, 100], name: 'Yellow' },
    { range: [200, 255, 180, 220, 100, 150], name: 'Gold' },
  ],
  greens: [
    { range: [0, 100, 100, 200, 0, 100], name: 'Green' },
    { range: [100, 180, 150, 220, 100, 180], name: 'Mint' },
    { range: [0, 80, 60, 120, 0, 60], name: 'Forest Green' },
    { range: [100, 150, 180, 220, 100, 150], name: 'Sage' },
    { range: [0, 80, 80, 130, 0, 80], name: 'Olive' },
  ],
  blues: [
    { range: [0, 100, 0, 100, 150, 255], name: 'Blue' },
    { range: [0, 50, 0, 80, 80, 150], name: 'Navy' },
    { range: [100, 180, 180, 230, 220, 255], name: 'Light Blue' },
    { range: [0, 80, 100, 160, 150, 200], name: 'Teal' },
  ],
  purples: [
    { range: [100, 180, 0, 100, 150, 255], name: 'Purple' },
    { range: [180, 230, 130, 200, 200, 255], name: 'Lavender' },
    { range: [80, 130, 0, 60, 80, 140], name: 'Plum' },
  ],
  browns: [
    { range: [100, 180, 60, 120, 0, 80], name: 'Brown' },
    { range: [180, 230, 140, 190, 100, 150], name: 'Tan' },
    { range: [200, 240, 170, 210, 140, 180], name: 'Beige' },
    { range: [60, 100, 40, 70, 20, 50], name: 'Chocolate' },
    { range: [160, 200, 80, 120, 50, 90], name: 'Camel' },
  ],
  neutrals: [
    { range: [220, 255, 220, 255, 220, 255], name: 'White' },
    { range: [0, 40, 0, 40, 0, 40], name: 'Black' },
    { range: [80, 180, 80, 180, 80, 180], name: 'Gray' },
    { range: [200, 240, 200, 240, 200, 240], name: 'Off-White' },
    { range: [230, 255, 230, 255, 200, 230], name: 'Cream' },
    { range: [40, 80, 40, 80, 40, 80], name: 'Charcoal' },
  ],
};

function getColorName(r: number, g: number, b: number): string {
  // Check each color category
  for (const category of Object.values(COLOR_NAMES)) {
    for (const color of category) {
      const [rMin, rMax, gMin, gMax, bMin, bMax] = color.range;
      if (r >= rMin && r <= rMax && g >= gMin && g <= gMax && b >= bMin && b <= bMax) {
        return color.name;
      }
    }
  }

  // Fallback: determine by dominant channel
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  // Check for grayscale
  if (diff < 30) {
    if (max < 50) return 'Black';
    if (max > 200) return 'White';
    return 'Gray';
  }

  // Determine by hue
  if (r === max) {
    if (g > b) return r > 200 ? 'Orange' : 'Brown';
    return 'Red';
  }
  if (g === max) {
    if (b > r * 0.8) return 'Teal';
    return 'Green';
  }
  if (b === max) {
    if (r > g) return 'Purple';
    return 'Blue';
  }

  return 'Multi-color';
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Detect dominant colors from an image
 * Uses canvas-based color extraction - no external dependencies
 */
export async function detectColors(imageUrl: string): Promise<ColorResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        // Create canvas for pixel analysis
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Scale down for faster processing
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Count colors (grouped into buckets)
        const colorCounts: Map<string, { count: number; r: number; g: number; b: number }> = new Map();

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels (background removed)
          if (a < 128) continue;

          // Skip very light/white pixels (likely background remnants)
          if (r > 240 && g > 240 && b > 240) continue;

          // Group into color buckets (reduce precision for grouping)
          const bucketR = Math.round(r / 32) * 32;
          const bucketG = Math.round(g / 32) * 32;
          const bucketB = Math.round(b / 32) * 32;
          const key = `${bucketR},${bucketG},${bucketB}`;

          const existing = colorCounts.get(key);
          if (existing) {
            existing.count++;
            // Average the actual colors
            existing.r = Math.round((existing.r * (existing.count - 1) + r) / existing.count);
            existing.g = Math.round((existing.g * (existing.count - 1) + g) / existing.count);
            existing.b = Math.round((existing.b * (existing.count - 1) + b) / existing.count);
          } else {
            colorCounts.set(key, { count: 1, r, g, b });
          }
        }

        // Sort by frequency
        const sortedColors = Array.from(colorCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        if (sortedColors.length === 0) {
          resolve({
            dominant: '#808080',
            palette: ['#808080'],
            colorName: 'Gray'
          });
          return;
        }

        const dominant = sortedColors[0];
        const dominantHex = rgbToHex(dominant.r, dominant.g, dominant.b);
        const colorName = getColorName(dominant.r, dominant.g, dominant.b);

        const palette = sortedColors.map(c => rgbToHex(c.r, c.g, c.b));

        resolve({
          dominant: dominantHex,
          palette,
          colorName
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

// ============================================
// SMART CATEGORIZATION
// ============================================

export interface CategoryResult {
  category: string;
  subcategory?: string;
  confidence: number;
  suggestions: string[];
}

// Category detection based on image aspect ratio and color patterns
// This is a simplified version - for more accuracy, would need TensorFlow.js
const CATEGORY_HINTS = {
  tops: ['shirt', 'blouse', 'top', 't-shirt', 'sweater', 'hoodie', 'cardigan', 'tank'],
  bottoms: ['pants', 'jeans', 'shorts', 'skirt', 'trousers', 'leggings'],
  dresses: ['dress', 'gown', 'romper', 'jumpsuit'],
  outerwear: ['jacket', 'coat', 'blazer', 'vest', 'parka', 'windbreaker'],
  shoes: ['sneakers', 'heels', 'boots', 'sandals', 'flats', 'loafers'],
  accessories: ['hat', 'scarf', 'belt', 'bag', 'jewelry', 'watch', 'sunglasses'],
  activewear: ['sports bra', 'leggings', 'shorts', 'tank', 'joggers'],
};

/**
 * Smart categorization based on image analysis
 * Uses aspect ratio and color analysis for basic categorization
 */
export async function detectCategory(imageUrl: string): Promise<CategoryResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const aspectRatio = img.width / img.height;

        // Basic heuristics based on aspect ratio
        let category = 'tops';
        let subcategory: string | undefined;
        let confidence = 0.6;
        let suggestions: string[] = [];

        // Very wide images are often accessories (belts, scarves laid flat)
        if (aspectRatio > 2.5) {
          category = 'accessories';
          suggestions = ['belt', 'scarf', 'tie'];
          confidence = 0.5;
        }
        // Square-ish images could be tops, bags, or shoes
        else if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
          // Could be top, bag, or shoes
          category = 'tops';
          subcategory = 't-shirts';
          suggestions = ['t-shirt', 'sweater', 'bag', 'shoes'];
          confidence = 0.5;
        }
        // Tall/portrait images are often full items (dresses, pants)
        else if (aspectRatio < 0.7) {
          category = 'dresses';
          suggestions = ['dress', 'pants', 'jeans', 'maxi skirt'];
          confidence = 0.55;
        }
        // Landscape but not too wide - tops, outerwear
        else if (aspectRatio > 1.2 && aspectRatio <= 2.5) {
          category = 'tops';
          subcategory = 'shirts';
          suggestions = ['shirt', 'blouse', 'jacket', 'sweater'];
          confidence = 0.6;
        }

        resolve({
          category,
          subcategory,
          confidence,
          suggestions
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for categorization'));
    img.src = imageUrl;
  });
}

// ============================================
// COMBINED AI PROCESSING
// ============================================

export interface AIProcessingResult {
  processedImageUrl: string;
  processedImageBlob: Blob;
  colors: ColorResult;
  category: CategoryResult;
}

/**
 * Full AI processing pipeline for wardrobe items
 * 1. Remove background
 * 2. Detect colors
 * 3. Suggest category
 */
export async function processWardrobeImage(
  imageFile: File,
  onProgress?: (stage: string, progress: number) => void
): Promise<AIProcessingResult> {
  // Stage 1: Remove background
  onProgress?.('Removing background...', 10);
  const bgResult = await removeImageBackground(imageFile, (p) => {
    onProgress?.('Removing background...', 10 + (p * 0.5));
  });

  // Stage 2: Detect colors from processed image
  onProgress?.('Analyzing colors...', 65);
  const colors = await detectColors(bgResult.url);

  // Stage 3: Detect category
  onProgress?.('Categorizing item...', 85);
  const category = await detectCategory(bgResult.url);

  onProgress?.('Complete!', 100);

  return {
    processedImageUrl: bgResult.url,
    processedImageBlob: bgResult.blob,
    colors,
    category
  };
}
