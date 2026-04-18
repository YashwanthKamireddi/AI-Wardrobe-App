/**
 * Style DNA controller
 *
 * GET  /api/style-dna         → cached-or-fresh style profile (24h TTL)
 * POST /api/style-dna/refresh → force-recompute + persist
 */

import { Request, Response } from "express";
import storage from "../storage";
import { computeStyleProfile, STYLE_PROFILE_TTL_MS } from "../services/style-dna";
import { logger } from "../utils/logger";

async function computeAndPersist(userId: number) {
    const items = await storage.getWardrobeItems(userId);
    const profile = computeStyleProfile(items);
    if (storage.upsertStyleProfile) {
        try {
            const persisted = await storage.upsertStyleProfile(userId, profile);
            return persisted;
        } catch (e) {
            logger.warn({ err: e instanceof Error ? e : new Error(String(e)) }, 'Style profile persist failed — returning fresh compute');
        }
    }
    return { ...profile, userId };
}

export const getStyleDna = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
        const userId = req.user!.id;

        const cached = storage.getStyleProfile ? await storage.getStyleProfile(userId) : undefined;

        if (cached && cached.computedAt) {
            const age = Date.now() - new Date(cached.computedAt).getTime();
            if (age < STYLE_PROFILE_TTL_MS) {
                return res.json({ ...cached, stale: false });
            }
        }

        const fresh = await computeAndPersist(userId);
        res.json({ ...fresh, stale: false });
    } catch (error) {
        logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'getStyleDna failed');
        res.status(500).json({ message: "Failed to compute style profile" });
    }
};

export const refreshStyleDna = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
        const userId = req.user!.id;
        const fresh = await computeAndPersist(userId);
        res.json({ ...fresh, stale: false });
    } catch (error) {
        logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'refreshStyleDna failed');
        res.status(500).json({ message: "Failed to refresh style profile" });
    }
};
