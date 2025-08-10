import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameProgressSchema, insertQuizAttemptSchema, updateProfileSchema, createUserSchema } from "@shared/schema";
import session from "express-session";

// Simple session-based auth (in-memory for demo)
const activeUsers = new Map<string, string>(); // sessionId -> userId

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session middleware
  app.use(session({
    secret: 'crabby-crew-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, createNew } = req.body;
      
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      let user = await storage.getUserByUsername(username);
      
      if (!user && createNew) {
        // Create new user
        user = await storage.createUser({ 
          username,
          displayName: username,
          avatarEmoji: "🦀"
        });
      } else if (!user) {
        return res.status(404).json({ message: "User not found. Try creating a new account." });
      }

      // Set session
      (req.session as any).userId = user.id;
      activeUsers.set(req.sessionID, user.id);
      
      // Update user online status
      await storage.updateUser(user.id, { isOnline: true, lastSeen: new Date() });
      
      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (userId) {
        await storage.updateUser(userId, { isOnline: false, lastSeen: new Date() });
        activeUsers.delete(req.sessionID);
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Profile management
  app.put('/api/profile', async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateProfile(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });
  // Game progress routes
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let progress = await storage.getGameProgress(userId);
      
      // If progress doesn't exist, create it
      if (!progress) {
        progress = await storage.createGameProgress({
          userId,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          badges: [],
          completedQuizzes: [],
          learnedSpecies: [],
          lastActivityDate: null,
          difficultyLevel: 1
        });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  app.post("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const progress = await storage.updateGameProgress(userId, updates);
      
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Quiz attempt routes
  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      // Check if user is authenticated
      const sessionUserId = (req.session as any)?.userId;
      if (!sessionUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertQuizAttemptSchema.parse(req.body);
      
      // Ensure the quiz attempt is for the authenticated user
      if (validatedData.userId !== sessionUserId) {
        return res.status(403).json({ message: "Not authorized to submit quiz for this user" });
      }
      
      const attempt = await storage.createQuizAttempt(validatedData);
      
      // Update user's game progress
      let currentProgress = await storage.getGameProgress(validatedData.userId!);
      if (!currentProgress) {
        // Create initial progress if it doesn't exist
        currentProgress = await storage.createGameProgress({
          userId: validatedData.userId!,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          badges: [],
          completedQuizzes: [],
          learnedSpecies: [],
          lastActivityDate: null,
          difficultyLevel: 1
        });
      }
      
      if (currentProgress) {
        const newTotalXp = currentProgress.totalXp + validatedData.xpEarned;
        const newLevel = Math.floor(newTotalXp / 200) + 1; // 200 XP per level
        const today = new Date().toISOString().split('T')[0];
        
        let newStreak = currentProgress.currentStreak;
        if (currentProgress.lastActivityDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (currentProgress.lastActivityDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }
        
        const newBadges = [...currentProgress.badges];
        // Check for new badges
        if (newTotalXp >= 1000 && !newBadges.includes("crab-expert")) {
          newBadges.push("crab-expert");
        }
        if (newStreak >= 7 && !newBadges.includes("streak-master")) {
          newBadges.push("streak-master");
        }
        if (newLevel >= 5 && !newBadges.includes("level-5")) {
          newBadges.push("level-5");
        }
        
        await storage.updateGameProgress(validatedData.userId!, {
          totalXp: newTotalXp,
          level: newLevel,
          currentStreak: newStreak,
          longestStreak: Math.max(currentProgress.longestStreak, newStreak),
          badges: newBadges,
          lastActivityDate: today,
          completedQuizzes: [...currentProgress.completedQuizzes, validatedData.quizId],
        });
      }
      
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ message: "Invalid quiz attempt data" });
    }
  });

  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const attempts = await storage.getQuizAttempts(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get quiz attempts" });
    }
  });

  // Mark species as learned
  app.post("/api/learn-species/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { speciesId } = req.body;
      
      // Check if user is authenticated and matches the requested userId
      const sessionUserId = (req.session as any)?.userId;
      if (!sessionUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (sessionUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this user's progress" });
      }
      
      let currentProgress = await storage.getGameProgress(userId);
      if (!currentProgress) {
        // Create initial progress if it doesn't exist
        currentProgress = await storage.createGameProgress({
          userId,
          totalXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          badges: [],
          completedQuizzes: [],
          learnedSpecies: [],
          lastActivityDate: null,
          difficultyLevel: 1
        });
      }
      
      // Check if species is already learned
      const alreadyLearned = currentProgress.learnedSpecies.includes(speciesId);
      
      if (alreadyLearned) {
        // Species already learned, don't award XP again
        return res.json(currentProgress);
      }
      
      const learnedSpecies = [...currentProgress.learnedSpecies, speciesId];
      
      const newBadges = [...currentProgress.badges];
      const newBadgeIds: string[] = [];
      
      if (learnedSpecies.length >= 5 && !newBadges.includes("first-steps")) {
        newBadges.push("first-steps");
        newBadgeIds.push("first-steps");
      }
      if (learnedSpecies.length >= 10 && !newBadges.includes("species-collector")) {
        newBadges.push("species-collector");
        newBadgeIds.push("species-collector");
      }
      
      const newXp = currentProgress.totalXp + 25;
      
      const progress = await storage.updateGameProgress(userId, {
        learnedSpecies,
        badges: newBadges,
        totalXp: newXp,
      });

      // Update leaderboards
      await storage.updateLeaderboard({
        userId,
        category: "total_xp",
        score: newXp
      });

      await storage.updateLeaderboard({
        userId,
        category: "species_collector",
        score: learnedSpecies.length
      });

      // Create public achievements for new badges
      for (const badgeId of newBadgeIds) {
        await storage.createPublicAchievement({
          userId,
          badgeId,
          isShared: true
        });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update learned species" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboards", async (req, res) => {
    try {
      const { category, limit } = req.query;
      const leaderboards = await storage.getLeaderboards(
        category as string, 
        limit ? parseInt(limit as string) : 10
      );
      
      // Fetch user details for each leaderboard entry
      const leaderboardsWithUsers = [];
      for (const entry of leaderboards) {
        const user = await storage.getUser(entry.userId);
        if (user) {
          leaderboardsWithUsers.push({
            ...entry,
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarEmoji: user.avatarEmoji
            }
          });
        }
      }
      
      res.json(leaderboardsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboards" });
    }
  });

  app.get("/api/user/:userId/rank/:category", async (req, res) => {
    try {
      const { userId, category } = req.params;
      const rank = await storage.getUserRank(userId, category);
      res.json({ rank });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });

  // Social features
  app.get("/api/public-achievements", async (req, res) => {
    try {
      const { limit } = req.query;
      const achievements = await storage.getPublicAchievements(
        limit ? parseInt(limit as string) : 20
      );
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public achievements" });
    }
  });

  // Weekly challenges
  app.get("/api/weekly-challenges", async (req, res) => {
    try {
      const challenges = await storage.getActiveWeeklyChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly challenges" });
    }
  });

  app.get("/api/weekly-challenges/:challengeId/participant/:userId", async (req, res) => {
    try {
      const { challengeId, userId } = req.params;
      const participant = await storage.getChallengeParticipant(userId, challengeId);
      res.json(participant || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenge participant" });
    }
  });

  // Top users this week
  app.get("/api/top-users-week", async (req, res) => {
    try {
      const { limit } = req.query;
      const topUsers = await storage.getTopUsersThisWeek(
        limit ? parseInt(limit as string) : 10
      );
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
