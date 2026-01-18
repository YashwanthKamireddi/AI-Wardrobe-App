/**
 * Supabase Storage Helper
 *
 * Handles image uploads to Supabase Storage for wardrobe items.
 * If Supabase is not configured, falls back to storing base64 data URLs.
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { logger } from '../utils';
import { randomUUID } from 'crypto';
import fs from 'fs';

const WARDROBE_BUCKET = 'wardrobe-images';

export interface UploadResult {
    success: boolean;
    url: string;
    error?: string;
}

/**
 * Initialize the wardrobe images bucket if it doesn't exist
 */
export async function ensureBucketExists(): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await client.storage.listBuckets();

        if (listError) {
            logger.error({ err: listError }, 'Error listing buckets');
            return false;
        }

        const bucketExists = buckets?.some(b => b.name === WARDROBE_BUCKET);

        if (!bucketExists) {
            // Create the bucket
            const { error: createError } = await client.storage.createBucket(WARDROBE_BUCKET, {
                public: true,
                fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            });

            if (createError) {
                logger.error({ err: createError }, 'Error creating bucket');
                return false;
            }

            logger.info(`Created storage bucket: ${WARDROBE_BUCKET}`);
        }

        return true;
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ err: error }, 'Error ensuring bucket exists');
        return false;
    }
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(
    file: Buffer,
    filename: string,
    contentType: string,
    userId: number
): Promise<UploadResult> {
    // If Supabase is not configured, we can't upload
    if (!isSupabaseConfigured()) {
        logger.warn('Supabase not configured - image upload not available');
        return {
            success: false,
            url: '',
            error: 'Storage not configured. Please configure Supabase.'
        };
    }

    const client = getSupabaseClient();
    if (!client) {
        return {
            success: false,
            url: '',
            error: 'Failed to get Supabase client'
        };
    }

    try {
        // Ensure bucket exists
        await ensureBucketExists();

        // Generate unique filename with user ID prefix for organization
        const ext = filename.split('.').pop() || 'jpg';
        const uniqueFilename = `${userId}/${randomUUID()}.${ext}`;

        // Upload the file
        const { data, error } = await client.storage
            .from(WARDROBE_BUCKET)
            .upload(uniqueFilename, file, {
                contentType,
                upsert: false
            });

        if (error) {
            logger.error({ err: error }, 'Error uploading image');
            return {
                success: false,
                url: '',
                error: error.message
            };
        }

        // Get public URL
        const { data: urlData } = client.storage
            .from(WARDROBE_BUCKET)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl
        };
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ err: error }, 'Error in uploadImage');
        return {
            success: false,
            url: '',
            error: error.message
        };
    }
}

/**
 * Upload an image from a local file path to Supabase Storage
 */
export async function uploadImageFromPath(
    filePath: string,
    filename: string,
    contentType: string,
    userId: number
): Promise<UploadResult> {
    // If Supabase is not configured, we can't upload
    if (!isSupabaseConfigured()) {
        logger.warn('Supabase not configured - image upload not available');
        return {
            success: false,
            url: '',
            error: 'Storage not configured. Please configure Supabase.'
        };
    }

    const client = getSupabaseClient();
    if (!client) {
        return {
            success: false,
            url: '',
            error: 'Failed to get Supabase client'
        };
    }

    try {
        // Ensure bucket exists
        await ensureBucketExists();

        // Generate unique filename with user ID prefix for organization
        const ext = filename.split('.').pop() || 'jpg';
        const uniqueFilename = `${userId}/${randomUUID()}.${ext}`;

        const fileStream = fs.createReadStream(filePath);

        // Upload the file
        // @ts-ignore - Supabase client supports streams in Node environment
        const { data, error } = await client.storage
            .from(WARDROBE_BUCKET)
            .upload(uniqueFilename, fileStream, {
                contentType,
                upsert: false,
                duplex: 'half'
            });

        if (error) {
            logger.error({ err: error }, 'Error uploading image');
            return {
                success: false,
                url: '',
                error: error.message
            };
        }

        // Get public URL
        const { data: urlData } = client.storage
            .from(WARDROBE_BUCKET)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl
        };
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ err: error }, 'Error in uploadImageFromPath');
        return {
            success: false,
            url: '',
            error: error.message
        };
    }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        // Extract the path from the URL
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/wardrobe-images\/(.+)/);

        if (!pathMatch) {
            logger.warn({ url: imageUrl }, 'Could not extract path from image URL');
            return false;
        }

        const path = pathMatch[1];

        const { error } = await client.storage
            .from(WARDROBE_BUCKET)
            .remove([path]);

        if (error) {
            logger.error({ err: error }, 'Error deleting image');
            return false;
        }

        return true;
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error({ err: error }, 'Error in deleteImage');
        return false;
    }
}

/**
 * Convert a base64 data URL to a Buffer for upload
 */
export function base64ToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } | null {
    try {
        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return null;

        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        return { buffer, contentType };
    } catch {
        return null;
    }
}

export default {
    uploadImage,
    uploadImageFromPath,
    deleteImage,
    ensureBucketExists,
    base64ToBuffer
};
