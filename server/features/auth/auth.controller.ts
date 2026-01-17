import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { fromZodError } from "zod-validation-error";
import { registerUserSchema } from "@shared/schema";
import storage from "../../storage";
import { AuthService } from "./auth.service";
import { logger } from "../../utils/logger";
import { User as SelectUser } from "@shared/schema";

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate and sanitize request body using schema
            const validationResult = registerUserSchema.safeParse(req.body);

            if (!validationResult.success) {
                const error = fromZodError(validationResult.error);
                return res.status(400).json({ message: error.message });
            }

            const validatedData = validationResult.data;

            // Check if user already exists
            const existingUser = await storage.getUserByUsername(validatedData.username);
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            // Create user with validated data only
            const user = await storage.createUser({
                username: validatedData.username,
                password: await AuthService.hashPassword(validatedData.password),
                name: validatedData.name || null,
                email: validatedData.email || null,
                profilePicture: validatedData.profilePicture || null,
            });

            // Remove password from the response
            const userResponse = { ...user } as any;
            delete userResponse.password;

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(userResponse);
            });
        } catch (error) {
            next(error);
        }
    }

    static login(req: Request, res: Response, next: NextFunction) {
        passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
            if (err) return next(err);
            if (!user) {
                // info usually contains the failure message from the strategy
                logger.warn(`Login failed: ${info?.message || "Invalid credentials"}`);
                return res.status(401).json({ message: "Invalid username or password" });
            }

            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);

                // Remove password from the response
                const userResponse = { ...user } as any;
                delete userResponse.password;

                res.status(200).json(userResponse);
            });
        })(req, res, next);
    }

    static logout(req: Request, res: Response, next: NextFunction) {
        req.logout((err) => {
            if (err) return next(err);
            res.status(200).json({ message: "Logged out successfully" });
        });
    }

    static getUser(req: Request, res: Response) {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        // Remove password from the response
        const userResponse = { ...req.user } as any;
        delete userResponse.password;

        res.json(userResponse);
    }

    static async updateUser(req: Request, res: Response) {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        try {
            const userId = req.user!.id;
            const { id, password, role, ...updateData } = req.body;

            // Only allow updates to safe profile fields
            const safeUpdateData: Record<string, any> = {};
            const allowedFields = ['name', 'email', 'profilePicture'];

            for (const field of allowedFields) {
                if (field in updateData) {
                    safeUpdateData[field] = updateData[field];
                }
            }

            const updatedUser = await storage.updateUser(userId, safeUpdateData);

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            const userResponse = { ...updatedUser } as any;
            delete userResponse.password;

            req.login(updatedUser, (err) => {
                if (err) {
                    logger.error("Failed to update session after user update", err);
                    return res.status(500).json({ message: "Failed to update session" });
                }
                res.json(userResponse);
            });
        } catch (error) {
            logger.error({ err: error }, "Failed to update user profile");
            res.status(500).json({ message: "Failed to update user profile" });
        }
    }

    static async changePassword(req: Request, res: Response) {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: "Current password and new password are required" });
            }

            const user = await storage.getUser(req.user!.id);
            if (!user || !(await AuthService.comparePasswords(currentPassword, user.password))) {
                return res.status(401).json({ message: "Current password is incorrect" });
            }

            const hashedPassword = await AuthService.hashPassword(newPassword);
            const updatedUser = await storage.updateUser(req.user!.id, { password: hashedPassword });

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            const userResponse = { ...updatedUser } as any;
            delete userResponse.password;

            req.login(updatedUser, (err) => {
                if (err) {
                    logger.error("Failed to update session after password change", err);
                    return res.status(500).json({ message: "Failed to update session" });
                }
                res.json({ message: "Password successfully changed" });
            });
        } catch (error) {
            logger.error({ err: error }, "Failed to change password");
            res.status(500).json({ message: "Failed to change password" });
        }
    }

    static async resetPasswordRequest(req: Request, res: Response) {
        try {
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ message: "Username is required" });
            }

            const user = await storage.getUserByUsername(username);

            if (!user) {
                return res.status(200).json({ message: "If an account exists, a password reset link will be sent" });
            }

            // Simulation of email sending
            logger.info(`Password reset requested for user: ${username}`);

            res.status(200).json({
                message: "If an account exists, a password reset link will be sent"
            });
        } catch (error) {
            logger.error({ err: error }, "Internal server error during password reset request");
            res.status(500).json({ message: "Internal server error" });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { username, newPassword } = req.body;

            if (!username || !newPassword) {
                return res.status(400).json({ message: "Username and new password are required" });
            }

            const user = await storage.getUserByUsername(username);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const hashedPassword = await AuthService.hashPassword(newPassword);
            const updatedUser = await storage.updateUser(user.id, { password: hashedPassword });

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ message: "Password has been reset successfully" });
        } catch (error) {
            logger.error({ err: error }, "Failed to reset password");
            res.status(500).json({ message: "Failed to reset password" });
        }
    }
}
