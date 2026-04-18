/**
 * Social Features Controller
 *
 * Handles outfit sharing, follows, likes, challenges, and community feed.
 * Backed by migration 004_social.sql.
 */

import { Request, Response } from "express";
import storage from "../storage";
import { randomBytes } from "crypto";

/**
 * POST /api/social/follow/:userId
 */
export const followUser = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const followerId = req.user!.id;
        const followingId = parseInt(req.params.userId);

        if (!Number.isFinite(followingId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        if (followerId === followingId) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const target = await storage.getUser(followingId);
        if (!target) return res.status(404).json({ message: "User not found" });

        const ok = await storage.followUser!(followerId, followingId);
        if (!ok) return res.status(500).json({ message: "Failed to follow user" });

        res.json({ success: true, following: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to follow user" });
    }
};

/**
 * DELETE /api/social/unfollow/:userId
 */
export const unfollowUser = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const followerId = req.user!.id;
        const followingId = parseInt(req.params.userId);
        if (!Number.isFinite(followingId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        await storage.unfollowUser!(followerId, followingId);
        res.json({ success: true, following: false });
    } catch (error) {
        res.status(500).json({ message: "Failed to unfollow user" });
    }
};

/**
 * GET /api/social/feed
 * Community feed: newest outfits from other users, enriched with like/follow state.
 */
export const getCommunityFeed = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const userId = req.user!.id;

        // Prefer a public feed (others' outfits). Fall back to own outfits so demo accounts aren't empty.
        let rawOutfits = await (storage.getCommunityOutfits?.(limit, userId) ?? Promise.resolve([]));
        if (rawOutfits.length === 0) {
            rawOutfits = (await storage.getOutfits(userId)).slice(0, limit);
        }

        const outfitIds = rawOutfits.map(o => o.id);
        const likeCounts = await (storage.getLikeCountsForOutfits?.(outfitIds) ?? Promise.resolve({} as Record<number, number>));
        const likedSet = await (storage.getLikedOutfitIdsForUser?.(userId, outfitIds) ?? Promise.resolve(new Set<number>()));

        // Cache user + first-item image lookups so we avoid duplicate round-trips
        const userCache = new Map<number, any>();
        const itemCache = new Map<number, any>();

        const feed = await Promise.all(rawOutfits.map(async (outfit: any) => {
            let imageUrl: string | null = null;
            if (outfit.items && outfit.items.length > 0) {
                const firstItemId = outfit.items[0];
                if (!itemCache.has(firstItemId)) {
                    itemCache.set(firstItemId, await storage.getWardrobeItem(firstItemId));
                }
                const item = itemCache.get(firstItemId);
                if (item) imageUrl = item.imageUrl;
            }

            if (!userCache.has(outfit.userId)) {
                userCache.set(outfit.userId, await storage.getUser(outfit.userId));
            }
            const user = userCache.get(outfit.userId);

            return {
                id: outfit.id,
                type: "outfit",
                userId: outfit.userId,
                userName: user?.name || user?.username || "Style Curator",
                userAvatar: user?.profilePicture || null,
                caption: outfit.name || "Untitled Look",
                description: outfit.description || null,
                imageUrl,
                likes: likeCounts[outfit.id] || 0,
                isLiked: likedSet.has(outfit.id),
                comments: 0,
                createdAt: outfit.createdAt || new Date(),
            };
        }));

        res.json(feed);
    } catch (error) {
        console.error("Error fetching community feed:", error);
        res.status(500).json({ message: "Failed to fetch community feed" });
    }
};

/**
 * POST /api/social/outfits/:id/like
 */
export const likeOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const outfitId = parseInt(req.params.outfitId);
        if (!Number.isFinite(outfitId)) return res.status(400).json({ message: "Invalid outfit id" });

        const outfit = await storage.getOutfit(outfitId);
        if (!outfit) return res.status(404).json({ message: "Outfit not found" });

        const ok = await storage.likeOutfit!(outfitId, userId);
        if (!ok) return res.status(500).json({ message: "Failed to like outfit" });

        const count = await (storage.getOutfitLikeCount?.(outfitId) ?? Promise.resolve(0));
        res.json({ success: true, liked: true, likes: count });
    } catch (error) {
        res.status(500).json({ message: "Failed to like outfit" });
    }
};

/**
 * DELETE /api/social/outfits/:id/like
 */
export const unlikeOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const outfitId = parseInt(req.params.outfitId);
        if (!Number.isFinite(outfitId)) return res.status(400).json({ message: "Invalid outfit id" });

        await storage.unlikeOutfit!(outfitId, userId);
        const count = await (storage.getOutfitLikeCount?.(outfitId) ?? Promise.resolve(0));
        res.json({ success: true, liked: false, likes: count });
    } catch (error) {
        res.status(500).json({ message: "Failed to unlike outfit" });
    }
};

/**
 * POST /api/social/outfits/:id/share
 * Generate a durable share link persisted to the DB.
 */
export const shareOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const outfitId = parseInt(req.params.outfitId);
        if (!Number.isFinite(outfitId)) return res.status(400).json({ message: "Invalid outfit id" });

        const { platform } = req.body || {};

        const outfit = await storage.getOutfit(outfitId);
        if (!outfit || outfit.userId !== userId) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        const shareLink = randomBytes(16).toString('hex');
        const host = req.get('host');
        const proto = req.protocol;
        const shareUrl = `${proto}://${host}/share/${shareLink}`;

        await (storage.createOutfitShare?.(outfitId, userId, shareLink, platform) ?? Promise.resolve());

        res.json({
            shareUrl,
            shareLink,
            platform: platform || 'link',
            message: "Share link generated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate share link" });
    }
};

/**
 * GET /api/social/challenges
 * Returns active challenges with participant counts and the current user's submission state.
 */
export const getChallenges = async (req: Request, res: Response) => {
    try {
        const userId = req.isAuthenticated() ? req.user!.id : null;
        const rows = await (storage.getChallenges?.('active') ?? Promise.resolve([]));

        const enriched = await Promise.all(rows.map(async (c: any) => {
            const participants = await (storage.getChallengeSubmissionCount?.(c.id) ?? Promise.resolve(0));
            const submitted = userId
                ? await (storage.hasUserSubmittedToChallenge?.(c.id, userId) ?? Promise.resolve(false))
                : false;
            return {
                id: c.id,
                name: c.name,
                description: c.description,
                prize: c.prize,
                endDate: c.endDate,
                status: c.status,
                participants,
                submitted,
            };
        }));

        res.json(enriched);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        res.status(500).json({ message: "Failed to fetch challenges" });
    }
};

/**
 * POST /api/social/challenges/:id/submit
 */
export const submitToChallenge = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const challengeId = parseInt(req.params.challengeId);
        const { outfitId } = req.body || {};

        if (!Number.isFinite(challengeId)) return res.status(400).json({ message: "Invalid challenge id" });
        if (!Number.isFinite(outfitId)) return res.status(400).json({ message: "outfitId required" });

        const challenge = await (storage.getChallenge?.(challengeId) ?? Promise.resolve(undefined));
        if (!challenge) return res.status(404).json({ message: "Challenge not found" });
        if (challenge.status !== 'active') return res.status(400).json({ message: "Challenge is not active" });

        const outfit = await storage.getOutfit(outfitId);
        if (!outfit || outfit.userId !== userId) {
            return res.status(404).json({ message: "Outfit not found or not yours" });
        }

        try {
            await storage.submitToChallenge!(challengeId, userId, outfitId);
        } catch (e: any) {
            if (/already submitted/i.test(e?.message || "")) {
                return res.status(409).json({ message: "You have already submitted to this challenge" });
            }
            throw e;
        }

        res.json({ success: true, message: "Submitted to challenge" });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit to challenge" });
    }
};
