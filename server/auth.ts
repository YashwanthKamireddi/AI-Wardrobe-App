import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "chers-closet-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id as number);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req: Request, res: Response, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
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
  });

  app.post("/api/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) {
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
  });

  app.post("/api/logout", (req: Request, res: Response, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    // Remove password from the response
    const userResponse = { ...req.user } as any;
    delete userResponse.password;

    res.json(userResponse);
  });

  app.patch("/api/user", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Get the current user's ID from the session
      const userId = req.user!.id;

      // Make sure to exclude any attempts to change the password directly through this endpoint
      // Password changes should go through a separate dedicated endpoint with proper validation
      const { password, ...updateData } = req.body;

      // Update the user in the database
      const updatedUser = await storage.updateUser(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response for security
      const userResponse = { ...updatedUser } as any;
      delete userResponse.password;

      // Update the session with the new user data
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update session" });
        }
        res.json(userResponse);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Password change endpoint for authenticated users
  app.post("/api/user/change-password", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      // Verify current password
      const user = await storage.getUser(req.user!.id);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(req.user!.id, { password: hashedPassword });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from the response
      const userResponse = { ...updatedUser } as any;
      delete userResponse.password;

      // Update session
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to update session" });
        }
        res.json({ message: "Password successfully changed" });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Password reset request (generates a token)
  app.post("/api/reset-password-request", async (req: Request, res: Response) => {
    try {
      const { username, email } = req.body;
      
      if (!username && !email) {
        return res.status(400).json({ message: "Username or email is required" });
      }

      // Find user by username or email
      const user = username 
        ? await storage.getUserByUsername(username)
        : await storage.getUserByEmail(email);

      if (!user) {
        // For security reasons, don't reveal if the user exists or not
        return res.status(200).json({ message: "If an account exists, a password reset link will be sent" });
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // In a real app, you would:
      // 1. Store this token in the database
      // 2. Send an email with the reset link
      // For demo purposes, just return the token
      
      // For a real implementation:
      // await storage.setPasswordResetToken(user.id, resetToken, tokenExpiry);
      // await sendResetEmail(user.email, resetToken);

      res.status(200).json({ 
        message: "If an account exists, a password reset link will be sent",
        // Remove this in production:
        debug: { resetToken, userId: user.id }
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Password reset with token
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      // In a real app, verify the token and get the associated user
      // const passwordResetInfo = await storage.getPasswordResetByToken(token);
      
      // For demo purposes:
      const passwordResetInfo = { 
        userId: parseInt(req.query.userId as string), 
        expiry: new Date(Date.now() + 3600000) // Mock expiry
      };

      if (!passwordResetInfo || passwordResetInfo.expiry < new Date()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(passwordResetInfo.userId, { password: hashedPassword });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // In a real app, invalidate the used token
      // await storage.deletePasswordResetToken(token);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}