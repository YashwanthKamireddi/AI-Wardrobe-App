/**
 * Social Features Controller
 *
 * Handles outfit sharing, follows, likes, and community features
 */

import { Request, Response } from "express";
import storage from "../storage";
import { randomBytes } from "crypto";

/**
 * POST /api/social/follow/:userId
 * Follow another user
 */
export const followUser = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const followerId = req.user!.id;
        const followingId = parseInt(req.params.userId);

        if (followerId === followingId) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        // TODO: Implement in storage layer
        // await storage.followUser(followerId, followingId);

        res.json({ success: true, message: "Followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to follow user" });
    }
};

/**
 * DELETE /api/social/unfollow/:userId
 * Unfollow a user
 */
export const unfollowUser = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const followerId = req.user!.id;
        const followingId = parseInt(req.params.userId);

        // TODO: Implement in storage layer
        // await storage.unfollowUser(followerId, followingId);

        res.json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to unfollow user" });
    }
};

/**
 * GET /api/social/feed
 * Get community feed of public outfits
 */
export const getCommunityFeed = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        // TODO: Implement community feed logic
        // For now, return empty array
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch community feed" });
    }
};

/**
 * POST /api/outfits/:id/like
 * Like an outfit
 */
export const likeOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const outfitId = parseInt(req.params.id);

        // TODO: Implement in storage layer
        // await storage.likeOutfit(outfitId, userId);

        res.json({ success: true, liked: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to like outfit" });
    }
};

/**
 * DELETE /api/outfits/:id/like
 * Unlike an outfit
 */
export const unlikeOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const outfitId = parseInt(req.params.id);

        // TODO: Implement in storage layer
        // await storage.unlikeOutfit(outfitId, userId);

        res.json({ success: true, liked: false });
    } catch (error) {
        res.status(500).json({ message: "Failed to unlike outfit" });
    }
};

/**
 * POST /api/outfits/:id/share
 * Generate share link for outfit
 */
export const shareOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const outfitId = parseInt(req.params.id);
        const { platform } = req.body;

        // Get the outfit
        const outfit = await storage.getOutfit(outfitId);
        if (!outfit || outfit.userId !== userId) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        // Generate unique share link
        const shareLink = randomBytes(16).toString('hex');
        const shareUrl = `${req.protocol}://${req.get('host')}/share/${shareLink}`;

        // TODO: Save to database
        // await storage.createOutfitShare({ outfitId, userId, shareLink, platform });

        res.json({
            shareUrl,
            platform: platform || 'link',
            message: "Share link generated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate share link" });
    }
};

/**
 * GET /api/challenges
 * Get active challenges
 */
export const getChallenges = async (req: Request, res: Response) => {
    try {
        // TODO: Implement challenges logic
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch challenges" });
    }
};

/**
 * POST /api/challenges/:id/submit
 * Submit outfit to challenge
 */
export const submitToChallenge = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const challengeId = parseInt(req.params.id);
        const { outfitId } = req.body;

        // TODO: Implement challenge submission
        // await storage.submitToChallenge({ challengeId, userId, outfitId });

        res.json({ success: true, message: "Submitted to challenge" });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit to challenge" });
    }
};
