import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertGameProgressSchema, insertQuizAttemptSchema, updateProfileSchema, createUserSchema } from '../shared/schema';

// Simple in-memory session storage for serverless functions
const activeUsers = new Map<string, string>(); // sessionId -> userId

// Helper function to get user from session
function getUserFromSession(req: VercelRequest): string | null {
  const sessionId = req.headers.cookie?.match(/crabby-crew-session=([^;]+)/)?.[1];
  if (sessionId && activeUsers.has(sessionId)) {
    return activeUsers.get(sessionId)!;
  }
  return null;
}

// Helper function to set session
function setUserSession(res: VercelResponse, userId: string): string {
  const sessionId = Math.random().toString(36).substring(2, 15);
  activeUsers.set(sessionId, userId);
  
  // Set cookie
  res.setHeader('Set-Cookie', `crabby-crew-session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  
  return sessionId;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  const path = pathname.replace('/api', '');

  try {
    // Health check endpoint
    if (path === '/health' && req.method === 'GET') {
      return res.json({ 
        status: 'ok', 
        message: 'Crabby Crew API is running', 
        timestamp: new Date().toISOString() 
      });
    }

    // Auth routes
    if (path === '/auth/login' && req.method === 'POST') {
      const { username, createNew } = req.body;
      
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      let user = await storage.getUserByUsername(username);
      
      if (!user && createNew) {
        user = await storage.createUser({ 
          username,
          displayName: username,
          avatarEmoji: "🦀"
        });
      } else if (!user) {
        return res.status(404).json({ message: "User not found. Try creating a new account." });
      }

      const sessionId = setUserSession(res, user.id);
      await storage.updateUser(user.id, { isOnline: true, lastSeen: new Date() });
      
      return res.json({ user, message: "Login successful" });
    }

    if (path === '/auth/user' && req.method === 'GET') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(user);
    }

    if (path === '/auth/logout' && req.method === 'POST') {
      const userId = getUserFromSession(req);
      if (userId) {
        await storage.updateUser(userId, { isOnline: false, lastSeen: new Date() });
        // Clear session
        const sessionId = req.headers.cookie?.match(/crabby-crew-session=([^;]+)/)?.[1];
        if (sessionId) {
          activeUsers.delete(sessionId);
        }
      }
      
      return res.json({ message: "Logout successful" });
    }

    // Profile management
    if (path === '/profile' && req.method === 'PUT') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateProfile(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json(updatedUser);
    }

    // Game progress routes
    if (path.match(/^\/progress\/(.+)$/) && req.method === 'GET') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const progressUserId = path.split('/')[2];
      if (userId !== progressUserId) {
        return res.status(403).json({ message: "Not authorized to access this progress" });
      }
      
      let progress = await storage.getGameProgress(userId);
      
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
      
      return res.json(progress);
    }

    if (path.match(/^\/progress\/(.+)$/) && req.method === 'POST') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const progressUserId = path.split('/')[2];
      if (userId !== progressUserId) {
        return res.status(403).json({ message: "Not authorized to update this progress" });
      }
      
      const updates = req.body;
      const progress = await storage.updateGameProgress(userId, updates);
      
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      return res.json(progress);
    }

    // Quiz attempt routes
    if (path === '/quiz-attempts' && req.method === 'POST') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertQuizAttemptSchema.parse(req.body);
      const quizAttempt = await storage.createQuizAttempt({
        ...validatedData,
        userId
      });
      
      return res.json(quizAttempt);
    }

    // Crab flipped endpoint
    if (path === '/crab-flipped' && req.method === 'POST') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { crabId, xpGained } = req.body;
      
      // Update user progress
      const progress = await storage.getGameProgress(userId);
      if (progress) {
        await storage.updateGameProgress(userId, {
          totalXp: (progress.totalXp || 0) + (xpGained || 10),
          learnedSpecies: [...(progress.learnedSpecies || []), crabId].filter((v, i, a) => a.indexOf(v) === i)
        });
      }
      
      return res.json({ message: "Crab discovery recorded", progress });
    }

    // Video complete endpoint
    if (path === '/video-complete' && req.method === 'POST') {
      const userId = getUserFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { videoId, xpGained } = req.body;
      
      // Update user progress
      const progress = await storage.getGameProgress(userId);
      if (progress) {
        await storage.updateGameProgress(userId, {
          totalXp: (progress.totalXp || 0) + (xpGained || 15)
        });
      }
      
      return res.json({ message: "Video marked as complete", progress });
    }

    // Weekly challenges endpoint
    if (path === '/weekly-challenges' && req.method === 'GET') {
      const challenges = await storage.getWeeklyChallenges();
      return res.json(challenges);
    }

    // Leaderboards endpoint
    if (path === '/leaderboards' && req.method === 'GET') {
      const leaderboards = await storage.getLeaderboards();
      return res.json(leaderboards);
    }

    // Public achievements endpoint
    if (path === '/public-achievements' && req.method === 'GET') {
      const achievements = await storage.getPublicAchievements();
      return res.json(achievements);
    }

    // Top users week endpoint
    if (path === '/top-users-week' && req.method === 'GET') {
      const topUsers = await storage.getTopUsersWeek();
      return res.json(topUsers);
    }

    // If no route matches
    return res.status(404).json({ message: "API endpoint not found" });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
