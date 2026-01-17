/**
 * Advanced Features Routes
 */

import { Router } from "express";
import * as advancedController from "../controllers/advanced-features-controller";

const router = Router();

// Capsule Wardrobes
router.get("/capsules", advancedController.getCapsules);
router.post("/capsules", advancedController.createCapsule);
router.put("/capsules/:id", advancedController.updateCapsule);
router.delete("/capsules/:id", advancedController.deleteCapsule);

// Shopping Wishlist
router.get("/wishlist", advancedController.getWishlist);
router.post("/wishlist", advancedController.addToWishlist);
router.delete("/wishlist/:id", advancedController.removeFromWishlist);

// Style Profile & Quiz
router.get("/style-profile", advancedController.getStyleProfile);
router.post("/style-quiz", advancedController.submitStyleQuiz);

export default router;
