import { 
  type User, 
  type CreateUser,
  type UpdateProfile,
  type GameProgress, 
  type InsertGameProgress, 
  type QuizAttempt, 
  type InsertQuizAttempt,
  type Leaderboard,
  type InsertLeaderboard,
  type PublicAchievement,
  type InsertPublicAchievement,
  type WeeklyChallenge,
  type InsertWeeklyChallenge,
  type ChallengeParticipant,
  type InsertChallengeParticipant
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: CreateUser): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;
  updateProfile(userId: string, updates: UpdateProfile): Promise<User | undefined>;
  
  getGameProgress(userId: string): Promise<GameProgress | undefined>;
  createGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  updateGameProgress(userId: string, updates: Partial<GameProgress>): Promise<GameProgress | undefined>;
  
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  
  // Leaderboard methods
  getLeaderboards(category?: string, limit?: number): Promise<Leaderboard[]>;
  updateLeaderboard(entry: InsertLeaderboard): Promise<Leaderboard>;
  getUserRank(userId: string, category: string): Promise<number | null>;
  
  // Social features
  getPublicAchievements(limit?: number): Promise<(PublicAchievement & { user: User })[]>;
  createPublicAchievement(achievement: InsertPublicAchievement): Promise<PublicAchievement>;
  
  // Weekly challenges
  getActiveWeeklyChallenges(): Promise<WeeklyChallenge[]>;
  createWeeklyChallenge(challenge: InsertWeeklyChallenge): Promise<WeeklyChallenge>;
  getChallengeParticipant(userId: string, challengeId: string): Promise<ChallengeParticipant | undefined>;
  updateChallengeParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  getTopUsersThisWeek(limit?: number): Promise<(User & { weeklyXp: number })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameProgress: Map<string, GameProgress>;
  private quizAttempts: Map<string, QuizAttempt>;
  private leaderboards: Map<string, Leaderboard>;
  private publicAchievements: Map<string, PublicAchievement>;
  private weeklyChallenges: Map<string, WeeklyChallenge>;
  private challengeParticipants: Map<string, ChallengeParticipant>;

  constructor() {
    this.users = new Map();
    this.gameProgress = new Map();
    this.quizAttempts = new Map();
    this.leaderboards = new Map();
    this.publicAchievements = new Map();
    this.weeklyChallenges = new Map();
    this.challengeParticipants = new Map();
    
    // Initialize some sample weekly challenges and demo data
    this.initializeWeeklyChallenges();
    this.initializeDemoData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: CreateUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: userData.username,
      displayName: userData.displayName || userData.username,
      avatarEmoji: userData.avatarEmoji || "🦀",
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    
    // Create initial game progress
    await this.createGameProgress({ userId: id });
    
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const existing = await this.getUser(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async updateProfile(userId: string, updates: UpdateProfile): Promise<User | undefined> {
    const existing = await this.getUser(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async getGameProgress(userId: string): Promise<GameProgress | undefined> {
    return Array.from(this.gameProgress.values()).find(
      (progress) => progress.userId === userId,
    );
  }

  async createGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    const id = randomUUID();
    const progress: GameProgress = {
      id,
      userId: insertProgress.userId || null,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      badges: [] as string[],
      completedQuizzes: [] as string[],
      learnedSpecies: [] as string[],
      watchedVideos: [] as string[],
      flippedCrabs: [] as string[],
      lastActivityDate: null,
      difficultyLevel: 1,
      ...insertProgress,
    };
    this.gameProgress.set(id, progress);
    return progress;
  }

  async updateGameProgress(userId: string, updates: Partial<GameProgress>): Promise<GameProgress | undefined> {
    const existing = await this.getGameProgress(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.gameProgress.set(existing.id, updated);
    return updated;
  }

  async createQuizAttempt(insertAttempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = randomUUID();
    const attempt: QuizAttempt = { 
      id, 
      userId: insertAttempt.userId || null,
      quizId: insertAttempt.quizId,
      score: insertAttempt.score,
      totalQuestions: insertAttempt.totalQuestions,
      xpEarned: insertAttempt.xpEarned,
      completedAt: insertAttempt.completedAt
    };
    this.quizAttempts.set(id, attempt);
    return attempt;
  }

  async getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter(
      (attempt) => attempt.userId === userId,
    );
  }

  // Initialize sample weekly challenges
  private initializeWeeklyChallenges() {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const challenge1: WeeklyChallenge = {
      id: randomUUID(),
      title: "Crab Master Challenge",
      description: "Learn 5 new crab species this week!",
      targetMetric: "species_learned",
      targetValue: 5,
      xpReward: 100,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isActive: true
    };

    const challenge2: WeeklyChallenge = {
      id: randomUUID(),
      title: "Quiz Champion",
      description: "Complete 3 quizzes with 80% or higher score!",
      targetMetric: "quizzes_completed",
      targetValue: 3,
      xpReward: 150,
      startDate: startOfWeek,
      endDate: endOfWeek,
      isActive: true
    };

    this.weeklyChallenges.set(challenge1.id, challenge1);
    this.weeklyChallenges.set(challenge2.id, challenge2);
  }

  // Initialize demo data for multiplayer features
  private initializeDemoData() {
    // Create demo users for leaderboards
    const demoUsers = [
      { username: "CrabWhisperer", displayName: "Crab Whisperer", avatarEmoji: "🦀", totalXp: 850, learnedSpecies: 8 },
      { username: "OceanExplorer", displayName: "Ocean Explorer", avatarEmoji: "🌊", totalXp: 720, learnedSpecies: 6 },
      { username: "MarineBiologist", displayName: "Marine Biologist", avatarEmoji: "🔬", totalXp: 680, learnedSpecies: 7 },
      { username: "ShellSeeker", displayName: "Shell Seeker", avatarEmoji: "🐚", totalXp: 540, learnedSpecies: 5 },
      { username: "TidePooler", displayName: "Tide Pooler", avatarEmoji: "🏖️", totalXp: 420, learnedSpecies: 4 },
    ];

    for (const userData of demoUsers) {
      const userId = randomUUID();
      const user: User = {
        id: userId,
        username: userData.username,
        displayName: userData.displayName,
        avatarEmoji: userData.avatarEmoji,
        isOnline: Math.random() > 0.5,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(userId, user);

      // Create game progress
      const progress: GameProgress = {
        id: randomUUID(),
        userId,
        totalXp: userData.totalXp,
        currentStreak: Math.floor(Math.random() * 10),
        longestStreak: Math.floor(Math.random() * 15) + 5,
        level: Math.floor(userData.totalXp / 200) + 1,
        badges: ["first-steps", "species-collector"],
        completedQuizzes: ["hermit-crab", "blue-crab"],
        learnedSpecies: Array.from({length: userData.learnedSpecies}, (_, i) => `species-${i}`),
        watchedVideos: [],
        flippedCrabs: [],
        lastActivityDate: new Date().toISOString().split('T')[0],
        difficultyLevel: 1
      };
      this.gameProgress.set(progress.id, progress);

      // Add to leaderboards
      this.leaderboards.set(randomUUID(), {
        id: randomUUID(),
        userId,
        category: "total_xp",
        score: userData.totalXp,
        rank: null,
        lastUpdated: new Date()
      });

      this.leaderboards.set(randomUUID(), {
        id: randomUUID(),
        userId,
        category: "species_collector",
        score: userData.learnedSpecies,
        rank: null,
        lastUpdated: new Date()
      });

      // Add some public achievements
      if (Math.random() > 0.3) {
        this.publicAchievements.set(randomUUID(), {
          id: randomUUID(),
          userId,
          badgeId: "species-collector",
          earnedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
          isShared: true
        });
      }
    }
  }

  // Leaderboard methods
  async getLeaderboards(category?: string, limit: number = 10): Promise<Leaderboard[]> {
    let entries = Array.from(this.leaderboards.values());
    
    if (category) {
      entries = entries.filter(entry => entry.category === category);
    }
    
    // Sort by score descending and take top entries
    return entries
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  async updateLeaderboard(entry: InsertLeaderboard): Promise<Leaderboard> {
    // Find existing entry or create new one
    const existingEntry = Array.from(this.leaderboards.values())
      .find(l => l.userId === entry.userId && l.category === entry.category);
    
    if (existingEntry && existingEntry.score >= entry.score) {
      return existingEntry; // Don't update if score isn't better
    }

    const leaderboardEntry: Leaderboard = {
      id: existingEntry?.id || randomUUID(),
      ...entry,
      rank: null,
      lastUpdated: new Date()
    };

    this.leaderboards.set(leaderboardEntry.id, leaderboardEntry);
    return leaderboardEntry;
  }

  async getUserRank(userId: string, category: string): Promise<number | null> {
    const leaderboard = await this.getLeaderboards(category, 1000);
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry?.rank || null;
  }

  // Social features
  async getPublicAchievements(limit: number = 20): Promise<(PublicAchievement & { user: User })[]> {
    const achievements = Array.from(this.publicAchievements.values())
      .filter(achievement => achievement.isShared)
      .sort((a, b) => new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime())
      .slice(0, limit);

    const achievementsWithUsers = [];
    for (const achievement of achievements) {
      const user = await this.getUser(achievement.userId);
      if (user) {
        achievementsWithUsers.push({ ...achievement, user });
      }
    }

    return achievementsWithUsers;
  }

  async createPublicAchievement(achievement: InsertPublicAchievement): Promise<PublicAchievement> {
    const id = randomUUID();
    const publicAchievement: PublicAchievement = {
      id,
      ...achievement,
      earnedAt: new Date()
    };
    this.publicAchievements.set(id, publicAchievement);
    return publicAchievement;
  }

  // Weekly challenges
  async getActiveWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const currentDate = new Date();
    return Array.from(this.weeklyChallenges.values())
      .filter(challenge => 
        challenge.isActive && 
        challenge.startDate <= currentDate && 
        challenge.endDate >= currentDate
      );
  }

  async createWeeklyChallenge(challenge: InsertWeeklyChallenge): Promise<WeeklyChallenge> {
    const id = randomUUID();
    const weeklyChallenge: WeeklyChallenge = { id, ...challenge };
    this.weeklyChallenges.set(id, weeklyChallenge);
    return weeklyChallenge;
  }

  async getChallengeParticipant(userId: string, challengeId: string): Promise<ChallengeParticipant | undefined> {
    return Array.from(this.challengeParticipants.values())
      .find(participant => 
        participant.userId === userId && participant.challengeId === challengeId
      );
  }

  async updateChallengeParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const existing = await this.getChallengeParticipant(participant.userId, participant.challengeId);
    
    if (existing) {
      const updated = { ...existing, ...participant };
      this.challengeParticipants.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newParticipant: ChallengeParticipant = { id, ...participant };
      this.challengeParticipants.set(id, newParticipant);
      return newParticipant;
    }
  }

  async getTopUsersThisWeek(limit: number = 10): Promise<(User & { weeklyXp: number })[]> {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Calculate weekly XP from quiz attempts this week
    const weeklyProgress = new Map<string, number>();
    
    for (const attempt of this.quizAttempts.values()) {
      if (attempt.userId && new Date(attempt.completedAt) >= startOfWeek) {
        const currentXp = weeklyProgress.get(attempt.userId) || 0;
        weeklyProgress.set(attempt.userId, currentXp + attempt.xpEarned);
      }
    }

    const topUsers = [];
    for (const [userId, weeklyXp] of weeklyProgress.entries()) {
      const user = await this.getUser(userId);
      if (user) {
        topUsers.push({ ...user, weeklyXp });
      }
    }

    return topUsers
      .sort((a, b) => b.weeklyXp - a.weeklyXp)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
