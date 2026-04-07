import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { insertQuizAttemptSchema, updateProfileSchema } from '../shared/schema';
import { generateKeypair, buildProfileEvent, publishToRelay, stripPrivkey } from '../server/nostr';

// In-memory session store (resets on cold start — acceptable for demo)
const activeUsers = new Map<string, string>();

function getUserId(req: VercelRequest): string | null {
  const sid = req.headers.cookie?.match(/crabby-crew-session=([^;]+)/)?.[1];
  return sid ? activeUsers.get(sid) ?? null : null;
}

function setSession(res: VercelResponse, userId: string) {
  const sid = Math.random().toString(36).slice(2, 15) + Date.now().toString(36);
  activeUsers.set(sid, userId);
  res.setHeader('Set-Cookie', `crabby-crew-session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  const path = pathname.replace('/api', '');

  try {
    // ── Health ──
    if (path === '/health' && req.method === 'GET') {
      return res.json({ status: 'ok', message: 'Crabby Crew API is running', timestamp: new Date().toISOString() });
    }

    // ── Auth: login ──
    if (path === '/auth/login' && req.method === 'POST') {
      const { username, createNew } = req.body;
      if (!username || username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });

      let user = await storage.getUserByUsername(username);
      if (!user && createNew) {
        user = await storage.createUser({ username, displayName: username, avatarEmoji: "🦀" });
        const { privkeyHex, pubkeyHex } = generateKeypair();
        const relayUrl = process.env.NOSTR_RELAY_URL || 'wss://relay.damus.io';
        await storage.updateUser(user.id, { nostrPubkey: pubkeyHex, nostrPrivkey: privkeyHex, nostrRelayUrl: relayUrl });
        const evt = buildProfileEvent(privkeyHex, { name: username, display_name: username, about: 'Crabby Crew explorer' });
        publishToRelay(evt, relayUrl).catch(() => {});
        user = (await storage.getUser(user.id))!;
      } else if (!user) {
        return res.status(404).json({ message: "User not found. Try creating a new account." });
      }

      // Backfill Nostr identity for existing users
      if (user && !user.nostrPubkey) {
        const { privkeyHex, pubkeyHex } = generateKeypair();
        const relayUrl = process.env.NOSTR_RELAY_URL || 'wss://relay.damus.io';
        await storage.updateUser(user.id, { nostrPubkey: pubkeyHex, nostrPrivkey: privkeyHex, nostrRelayUrl: relayUrl });
        const evt = buildProfileEvent(privkeyHex, { name: user.username, display_name: user.displayName || user.username, about: (user as any).bio || 'Crabby Crew explorer' });
        publishToRelay(evt, relayUrl).catch(() => {});
        user = (await storage.getUser(user.id))!;
      }

      setSession(res, user.id);
      await storage.updateUser(user.id, { isOnline: true, lastSeen: new Date() });
      return res.json({ user: stripPrivkey(user), message: "Login successful" });
    }

    // ── Auth: check ──
    if (path === '/auth/user' && req.method === 'GET') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(stripPrivkey(user));
    }

    // ── Auth: logout ──
    if (path === '/auth/logout' && req.method === 'POST') {
      const userId = getUserId(req);
      if (userId) {
        await storage.updateUser(userId, { isOnline: false, lastSeen: new Date() });
        const sid = req.headers.cookie?.match(/crabby-crew-session=([^;]+)/)?.[1];
        if (sid) activeUsers.delete(sid);
      }
      res.setHeader('Set-Cookie', 'crabby-crew-session=; Path=/; HttpOnly; Max-Age=0');
      return res.json({ message: "Logout successful" });
    }

    // ── Profile ──
    if (path === '/profile' && req.method === 'PUT') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const data = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateProfile(userId, data);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      if (updatedUser.nostrPrivkey) {
        const evt = buildProfileEvent(updatedUser.nostrPrivkey, {
          name: updatedUser.username,
          display_name: updatedUser.displayName || updatedUser.username,
          about: updatedUser.bio || 'Crabby Crew explorer',
        });
        publishToRelay(evt, updatedUser.nostrRelayUrl || undefined).catch(() => {});
      }

      return res.json(stripPrivkey(updatedUser));
    }

    // ── Progress GET ──
    const progressMatch = path.match(/^\/progress\/(.+)$/);
    if (progressMatch && req.method === 'GET') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      if (userId !== progressMatch[1]) return res.status(403).json({ message: "Forbidden" });

      let progress = await storage.getGameProgress(userId);
      if (!progress) {
        progress = await storage.createGameProgress({
          userId, totalXp: 0, currentStreak: 0, longestStreak: 0, level: 1,
          badges: [], completedQuizzes: [], learnedSpecies: [], lastActivityDate: null, difficultyLevel: 1,
        });
      }
      return res.json(progress);
    }

    // ── Progress POST ──
    if (progressMatch && req.method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      if (userId !== progressMatch[1]) return res.status(403).json({ message: "Forbidden" });
      const progress = await storage.updateGameProgress(userId, req.body);
      return progress ? res.json(progress) : res.status(404).json({ message: "Progress not found" });
    }

    // ── Quiz attempts ──
    if (path === '/quiz-attempts' && req.method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const data = insertQuizAttemptSchema.parse(req.body);
      if (data.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const attempt = await storage.createQuizAttempt(data);

      // Update progress (mirrors Express route logic)
      let prog = await storage.getGameProgress(userId);
      if (!prog) prog = await storage.createGameProgress({ userId, totalXp: 0, currentStreak: 0, longestStreak: 0, level: 1, badges: [], completedQuizzes: [], learnedSpecies: [], lastActivityDate: null, difficultyLevel: 1 });

      const newXp = prog.totalXp + data.xpEarned;
      const today = new Date().toISOString().split('T')[0];
      let streak = prog.currentStreak;
      if (prog.lastActivityDate !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        streak = prog.lastActivityDate === y.toISOString().split('T')[0] ? streak + 1 : 1;
      }
      const badges = [...prog.badges];
      if (newXp >= 1000 && !badges.includes("crab-expert")) badges.push("crab-expert");
      if (streak >= 7 && !badges.includes("streak-master")) badges.push("streak-master");
      const newLevel = Math.floor(newXp / 200) + 1;
      if (newLevel >= 5 && !badges.includes("level-5")) badges.push("level-5");

      await storage.updateGameProgress(userId, {
        totalXp: newXp, level: newLevel, currentStreak: streak,
        longestStreak: Math.max(prog.longestStreak, streak),
        badges, lastActivityDate: today,
        completedQuizzes: [...prog.completedQuizzes, data.quizId],
      });

      return res.json(attempt);
    }

    // ── Learn species ──
    const learnMatch = path.match(/^\/learn-species\/(.+)$/);
    if (learnMatch && req.method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      if (userId !== learnMatch[1]) return res.status(403).json({ message: "Forbidden" });
      const { speciesId } = req.body;

      let prog = await storage.getGameProgress(userId);
      if (!prog) prog = await storage.createGameProgress({ userId, totalXp: 0, currentStreak: 0, longestStreak: 0, level: 1, badges: [], completedQuizzes: [], learnedSpecies: [], lastActivityDate: null, difficultyLevel: 1 });
      if (prog.learnedSpecies.includes(speciesId)) return res.json(prog);

      const learned = [...prog.learnedSpecies, speciesId];
      const badges = [...prog.badges];
      if (learned.length >= 5 && !badges.includes("first-steps")) badges.push("first-steps");
      if (learned.length >= 10 && !badges.includes("species-collector")) badges.push("species-collector");

      const updated = await storage.updateGameProgress(userId, { learnedSpecies: learned, badges, totalXp: prog.totalXp + 25 });
      return res.json(updated);
    }

    // ── Crab flipped ──
    if (path === '/crab-flipped' && req.method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { crabId } = req.body;
      if (!crabId) return res.status(400).json({ message: "Crab ID required" });

      let prog = await storage.getGameProgress(userId);
      if (!prog) prog = await storage.createGameProgress({ userId, totalXp: 0, currentStreak: 0, longestStreak: 0, level: 1, badges: [], completedQuizzes: [], learnedSpecies: [], lastActivityDate: null, difficultyLevel: 1 });

      if (prog.flippedCrabs?.includes(crabId)) {
        return res.json({ message: "Already discovered", progress: prog, xpEarned: 0 });
      }

      const newXp = prog.totalXp + 25;
      const flipped = [...(prog.flippedCrabs || []), crabId];
      const updated = await storage.updateGameProgress(userId, { totalXp: newXp, flippedCrabs: flipped, lastActivityDate: new Date().toISOString() });
      return res.json({ message: "Crab discovery recorded", progress: updated, xpEarned: 25 });
    }

    // ── Video complete ──
    if (path === '/video-complete' && req.method === 'POST') {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { videoId } = req.body;
      if (!videoId) return res.status(400).json({ message: "Video ID required" });

      let prog = await storage.getGameProgress(userId);
      if (!prog) prog = await storage.createGameProgress({ userId, totalXp: 0, currentStreak: 0, longestStreak: 0, level: 1, badges: [], completedQuizzes: [], learnedSpecies: [], watchedVideos: [], lastActivityDate: null, difficultyLevel: 1 });

      if (prog.watchedVideos?.includes(videoId)) return res.status(400).json({ message: "Already completed" });

      const watched = [...(prog.watchedVideos || []), videoId];
      const newXp = prog.totalXp + 50;
      const updated = await storage.updateGameProgress(userId, { watchedVideos: watched, totalXp: newXp, lastActivityDate: new Date().toISOString() });
      return res.json({ message: "Video marked as complete", progress: updated, xpEarned: 50 });
    }

    // ── Leaderboards ──
    if (path === '/leaderboards' && req.method === 'GET') {
      const category = (req.query.category as string) || undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const entries = await storage.getLeaderboards(category, limit);

      const withUsers = [];
      for (const entry of entries) {
        const user = await storage.getUser(entry.userId);
        if (user) withUsers.push({ ...entry, user: { id: user.id, username: user.username, displayName: user.displayName, avatarEmoji: user.avatarEmoji } });
      }
      return res.json(withUsers);
    }

    // ── Weekly challenges ──
    if (path === '/weekly-challenges' && req.method === 'GET') {
      return res.json(await storage.getActiveWeeklyChallenges());
    }

    // ── Public achievements ──
    if (path === '/public-achievements' && req.method === 'GET') {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      return res.json(await storage.getPublicAchievements(limit));
    }

    // ── Top users week ──
    if (path === '/top-users-week' && req.method === 'GET') {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      return res.json(await storage.getTopUsersThisWeek(limit));
    }

    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
