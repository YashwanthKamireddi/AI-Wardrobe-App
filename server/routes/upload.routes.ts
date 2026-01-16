/**
 * Upload Routes Module
 * Handles image upload operations
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadImage, base64ToBuffer } from "../lib/supabase-storage";
import { uploadRateLimiter } from "../middleware";

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    }
});

// POST /api/upload-image - Upload image to storage
router.post("/upload-image", uploadRateLimiter, upload.single('image'), async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Check if file was provided via multipart/form-data
        if (req.file) {
            const result = await uploadImage(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype,
                req.user!.id
            );

            if (!result.success) {
                return res.status(500).json({ message: result.error || "Upload failed" });
            }

            return res.json({ url: result.url });
        }

        // Check if base64 data URL was provided in body
        if (req.body.dataUrl) {
            const parsed = base64ToBuffer(req.body.dataUrl);
            if (!parsed) {
                return res.status(400).json({ message: "Invalid base64 data URL" });
            }

            const result = await uploadImage(
                parsed.buffer,
                `upload-${Date.now()}.jpg`,
                parsed.contentType,
                req.user!.id
            );

            if (!result.success) {
                return res.status(500).json({ message: result.error || "Upload failed" });
            }

            return res.json({ url: result.url });
        }

        return res.status(400).json({ message: "No image provided. Send either a file or dataUrl." });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Failed to upload image" });
    }
});

export default router;
