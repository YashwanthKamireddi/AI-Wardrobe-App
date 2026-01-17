/**
 * Social Features Routes
 */

import { Router } from "express";
import * as socialController from "../controllers/social-controller";

const router = Router();

// Follow/Unfollow
router.post("/follow/:userId", socialController.followUser);
router.delete("/unfollow/:userId", socialController.unfollowUser);

// Community Feed
router.get("/feed", socialController.getCommunityFeed);

// Outfit Likes
router.post("/outfits/:id/like", socialController.likeOutfit);
router.delete("/outfits/:id/like", socialController.unlikeOutfit);

// Outfit Sharing
router.post("/outfits/:id/share", socialController.shareOutfit);

// Challenges
router.get("/challenges", socialController.getChallenges);
router.post("/challenges/:id/submit", socialController.submitToChallenge);

export default router;
