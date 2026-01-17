import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authRateLimiter } from "../../middleware/rate-limiter";

const router = Router();

// Apply auth rate limiter to sensitive endpoints
// Note: We're applying it here specifically, but it's also in app.ts globally for these paths.
// We should eventually consolidate. For now, redundancy is safe.

router.post("/register", authRateLimiter, AuthController.register);
router.post("/login", authRateLimiter, AuthController.login);
router.post("/logout", AuthController.logout);

router.get("/user", AuthController.getUser);
router.patch("/user", AuthController.updateUser);
router.post("/user/change-password", AuthController.changePassword);

router.post("/reset-password-request", AuthController.resetPasswordRequest);
router.post("/reset-password", AuthController.resetPassword);

export default router;
