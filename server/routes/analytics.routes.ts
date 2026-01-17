/**
 * Analytics Routes
 *
 * Routes for wardrobe analytics and insights
 */

import { Router } from "express";
import * as analyticsController from "../controllers/analytics-controller";

const router = Router();

// Wardrobe statistics dashboard
router.get("/wardrobe-stats", analyticsController.getWardrobeStats);

// Cost per wear analytics
router.get("/cost-per-wear", analyticsController.getCostPerWear);

// Most worn items
router.get("/most-worn", analyticsController.getMostWorn);

// Least worn items
router.get("/least-worn", analyticsController.getLeastWorn);

// Never worn items
router.get("/never-worn", analyticsController.getNeverWorn);

// Style patterns and insights
router.get("/style-patterns", analyticsController.getStylePatterns);

export default router;
