import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertChallengeSchema, insertUserChallengeSchema, insertAchievementSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get all challenges (with active filter option)
router.get('/challenges', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const challenges = await storage.getChallenges(activeOnly);
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Get a specific challenge
router.get('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const challenge = await storage.getChallenge(id);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

// Create a new challenge (admin only)
router.post('/challenges', async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const challengeData = insertChallengeSchema.parse(req.body);
    const challenge = await storage.createChallenge(challengeData);
    res.status(201).json(challenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Update a challenge (admin only)
router.patch('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const challenge = await storage.getChallenge(id);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    // Validate the request body as a partial schema
    const challengeData = insertChallengeSchema.partial().parse(req.body);
    const updatedChallenge = await storage.updateChallenge(id, challengeData);
    res.json(updatedChallenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating challenge:', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

// Get user's active challenges
router.get('/user-challenges', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userChallenges = await storage.getUserChallenges(req.user!.id);
    res.json(userChallenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Failed to fetch user challenges' });
  }
});

// Accept a challenge
router.post('/user-challenges', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { challengeId } = req.body;
    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }
    
    // Check if challenge exists
    const challenge = await storage.getChallenge(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    // Check if user already accepted this challenge
    const userChallenges = await storage.getUserChallenges(req.user!.id);
    const existingChallenge = userChallenges.find(uc => uc.challengeId === challengeId);
    
    if (existingChallenge) {
      return res.status(409).json({ 
        error: 'Challenge already accepted',
        userChallenge: existingChallenge
      });
    }
    
    // Create user challenge with required fields
    const userChallenge = await storage.createUserChallenge({
      userId: req.user!.id,
      challengeId,
      maxProgress: 100, // Default max progress is 100%
      progress: 0,
      completed: false
    });
    
    res.status(201).json(userChallenge);
  } catch (error) {
    console.error('Error accepting challenge:', error);
    res.status(500).json({ error: 'Failed to accept challenge' });
  }
});

// Update user challenge progress
router.patch('/user-challenges/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const id = parseInt(req.params.id);
    const userChallenge = await storage.getUserChallenge(id);
    
    if (!userChallenge) {
      return res.status(404).json({ error: 'User challenge not found' });
    }
    
    // Make sure the user owns this challenge
    if (userChallenge.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this challenge' });
    }
    
    // Validate request body
    const userData = insertUserChallengeSchema.partial().pick({
      progress: true
    }).parse(req.body);
    
    const updatedUserChallenge = await storage.updateUserChallenge(id, userData);
    res.json(updatedUserChallenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating user challenge:', error);
    res.status(500).json({ error: 'Failed to update user challenge' });
  }
});

// Complete a user challenge
router.post('/user-challenges/:id/complete', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const id = parseInt(req.params.id);
    const userChallenge = await storage.getUserChallenge(id);
    
    if (!userChallenge) {
      return res.status(404).json({ error: 'User challenge not found' });
    }
    
    // Make sure the user owns this challenge
    if (userChallenge.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to complete this challenge' });
    }
    
    // If already completed, just return it
    if (userChallenge.completed) {
      return res.json(userChallenge);
    }
    
    // Complete the challenge
    const completedChallenge = await storage.completeUserChallenge(id);
    res.json(completedChallenge);
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

// Get user achievements
router.get('/achievements', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const achievements = await storage.getAchievements(req.user!.id);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Grant an achievement
router.post('/achievements', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Validate the request body
    const achievementData = insertAchievementSchema.parse({
      ...req.body,
      userId: req.user!.id
    });
    
    // Check if user already has this achievement (by name)
    const userAchievements = await storage.getAchievements(req.user!.id);
    const existingAchievement = userAchievements.find(a => a.name === achievementData.name);
    
    if (existingAchievement) {
      return res.status(409).json({ 
        error: 'Achievement already unlocked',
        achievement: existingAchievement
      });
    }
    
    // Create the achievement
    const achievement = await storage.createAchievement(achievementData);
    
    // Update user stats
    const userStats = await storage.getUserStats(req.user!.id);
    if (userStats) {
      // Use null coalescing for possibly null values
      await storage.updateUserStats(req.user!.id, {
        achievementsUnlocked: (userStats.achievementsUnlocked ?? 0) + 1
      });
      // Use pointsAwarded from achievement data
      await storage.addUserPoints(req.user!.id, achievementData.pointsAwarded ?? 50);
    }
    
    res.status(201).json(achievement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error granting achievement:', error);
    res.status(500).json({ error: 'Failed to grant achievement' });
  }
});

// Get user stats
router.get('/user-stats', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    let userStats = await storage.getUserStats(req.user!.id);
    
    // If no stats exist, create them
    if (!userStats) {
      userStats = await storage.createUserStats({ userId: req.user!.id });
    }
    
    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

export default router;