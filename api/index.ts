import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

// ── Inline storage (in-memory, resets on cold start) ──
// We inline everything to avoid import path issues on Vercel.

interface User {
  id: string; username: string; displayName: string | null; avatarEmoji: string | null;
  bio: string | null; nostrPubkey: string | null; nostrPrivkey: string | null;
  nostrRelayUrl: string | null; isOnline: boolean | null; lastSeen: Date | null;
  createdAt: Date | null; updatedAt: Date | null;
}
interface GameProgress {
  id: string; userId: string | null; totalXp: number; currentStreak: number;
  longestStreak: number; level: number; badges: string[]; completedQuizzes: string[];
  learnedSpecies: string[]; watchedVideos: string[]; flippedCrabs: string[];
  lastActivityDate: string | null; difficultyLevel: number;
}
interface QuizAttempt {
  id: string; userId: string | null; quizId: string; score: number;
  totalQuestions: number; xpEarned: number; completedAt: string;
}
interface Leaderboard {
  id: string; userId: string; category: string; score: number;
  rank: number | null; lastUpdated: Date | null;
}

const users = new Map<string, User>();
const progress = new Map<string, GameProgress>();
const quizAttempts = new Map<string, QuizAttempt>();
const leaderboards = new Map<string, Leaderboard>();
const sessions = new Map<string, string>();

// ── Demo data ──
function initDemoData() {
  if (users.size > 0) return;
  const demos = [
    { username: "CrabWhisperer", displayName: "Crab Whisperer", avatarEmoji: "🦀", totalXp: 850, species: 8 },
    { username: "OceanExplorer", displayName: "Ocean Explorer", avatarEmoji: "🌊", totalXp: 720, species: 6 },
    { username: "MarineBiologist", displayName: "Marine Biologist", avatarEmoji: "🔬", totalXp: 680, species: 7 },
    { username: "ShellSeeker", displayName: "Shell Seeker", avatarEmoji: "🐚", totalXp: 540, species: 5 },
    { username: "TidePooler", displayName: "Tide Pooler", avatarEmoji: "🏖️", totalXp: 420, species: 4 },
  ];
  for (const d of demos) {
    const uid = randomUUID();
    users.set(uid, { id: uid, username: d.username, displayName: d.displayName, avatarEmoji: d.avatarEmoji, bio: null, nostrPubkey: null, nostrPrivkey: null, nostrRelayUrl: null, isOnline: false, lastSeen: new Date(), createdAt: new Date(), updatedAt: new Date() });
    progress.set(randomUUID(), { id: randomUUID(), userId: uid, totalXp: d.totalXp, currentStreak: Math.floor(Math.random() * 10), longestStreak: Math.floor(Math.random() * 15) + 5, level: Math.floor(d.totalXp / 200) + 1, badges: ["first-steps"], completedQuizzes: [], learnedSpecies: Array.from({ length: d.species }, (_, i) => `species-${i}`), watchedVideos: [], flippedCrabs: [], lastActivityDate: null, difficultyLevel: 1 });
    const lbId = randomUUID();
    leaderboards.set(lbId, { id: lbId, userId: uid, category: "total_xp", score: d.totalXp, rank: null, lastUpdated: new Date() });
  }
}

// ── Nostr (inline, no ws dependency) ──
let nostrTools: any = null;
async function getNostrTools() {
  if (!nostrTools) {
    const pure = await import('nostr-tools/pure');
    const utils = await import('nostr-tools/utils');
    nostrTools = { ...pure, ...utils };
  }
  return nostrTools;
}

async function generateKeypair() {
  const nt = await getNostrTools();
  const sk = nt.generateSecretKey();
  return { privkeyHex: nt.bytesToHex(sk), pubkeyHex: nt.getPublicKey(sk) };
}

async function buildAndPublishProfile(privkeyHex: string, profile: { name: string; display_name?: string; about?: string }, relayUrl: string) {
  try {
    const nt = await getNostrTools();
    const sk = nt.hexToBytes(privkeyHex);
    const evt = nt.finalizeEvent({ kind: 0, created_at: Math.floor(Date.now() / 1000), tags: [], content: JSON.stringify(profile) }, sk);
    // Use global WebSocket (available in Vercel Node 18+)
    if (typeof WebSocket !== 'undefined') {
      const ws = new WebSocket(relayUrl);
      ws.onopen = () => ws.send(JSON.stringify(['EVENT', evt]));
      ws.onmessage = (e: any) => { try { const m = JSON.parse(e.data); if (m[0] === 'OK') ws.close(); } catch {} };
      setTimeout(() => { try { ws.close(); } catch {} }, 5000);
    }
  } catch (e) {
    console.error('Nostr publish failed:', e);
  }
}

function stripPrivkey(user: User) {
  const { nostrPrivkey, ...safe } = user;
  return safe;
}

// ── Helpers ──
function getUserId(req: VercelRequest): string | null {
  const sid = req.headers.cookie?.match(/crabby-crew-session=([^;]+)/)?.[1];
  return sid ? sessions.get(sid) ?? null : null;
}

function setSession(res: VercelResponse, userId: string) {
  const sid = randomUUID();
  sessions.set(sid, userId);
  res.setHeader('Set-Cookie', `crabby-crew-session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
}

function findUser(id: string) { return users.get(id); }
function findByUsername(name: string) { return Array.from(users.values()).find(u => u.username === name); }
function findProgress(uid: string) { return Array.from(progress.values()).find(p => p.userId === uid); }

function createProgress(uid: string): GameProgress {
  const p: GameProgress = { id: randomUUID(), userId: uid, totalXp: 0, currentStreak: 0, longestStreak: 0, level: 1, badges: [], completedQuizzes: [], learnedSpecies: [], watchedVideos: [], flippedCrabs: [], lastActivityDate: null, difficultyLevel: 1 };
  progress.set(p.id, p);
  return p;
}

// ── Handler ──
export default async function handler(req: VercelRequest, res: VercelResponse) {
  initDemoData();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
  const path = pathname.replace('/api', '');

  try {
    // Health
    if (path === '/health') return res.json({ status: 'ok', timestamp: new Date().toISOString() });

    // ── Login ──
    if (path === '/auth/login' && req.method === 'POST') {
      const { username, createNew } = req.body;
      if (!username || username.length < 3) return res.status(400).json({ message: "Username must be at least 3 characters" });

      let user = findByUsername(username);
      if (!user && createNew) {
        const id = randomUUID();
        user = { id, username, displayName: username, avatarEmoji: "🦀", bio: null, nostrPubkey: null, nostrPrivkey: null, nostrRelayUrl: null, isOnline: true, lastSeen: new Date(), createdAt: new Date(), updatedAt: new Date() };
        users.set(id, user);
        createProgress(id);

        // Generate Nostr identity
        try {
          const kp = await generateKeypair();
          const relayUrl = 'wss://relay.damus.io';
          user.nostrPubkey = kp.pubkeyHex;
          user.nostrPrivkey = kp.privkeyHex;
          user.nostrRelayUrl = relayUrl;
          buildAndPublishProfile(kp.privkeyHex, { name: username, display_name: username, about: 'Crabby Crew explorer' }, relayUrl);
        } catch {}
      } else if (!user) {
        return res.status(404).json({ message: "User not found. Try creating a new account." });
      }

      // Backfill Nostr for existing users
      if (user && !user.nostrPubkey) {
        try {
          const kp = await generateKeypair();
          user.nostrPubkey = kp.pubkeyHex;
          user.nostrPrivkey = kp.privkeyHex;
          user.nostrRelayUrl = 'wss://relay.damus.io';
          buildAndPublishProfile(kp.privkeyHex, { name: user.username, display_name: user.displayName || user.username, about: user.bio || 'Crabby Crew explorer' }, 'wss://relay.damus.io');
        } catch {}
      }

      user.isOnline = true;
      user.lastSeen = new Date();
      setSession(res, user.id);
      return res.json({ user: stripPrivkey(user), message: "Login successful" });
    }

    // ── Auth check ──
    if (path === '/auth/user') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      const user = findUser(uid);
      return user ? res.json(stripPrivkey(user)) : res.status(404).json({ message: "User not found" });
    }

    // ── Logout ──
    if (path === '/auth/logout' && req.method === 'POST') {
      const uid = getUserId(req);
      if (uid) { const u = findUser(uid); if (u) { u.isOnline = false; u.lastSeen = new Date(); } }
      const sid = req.headers.cookie?.match(/crabby-crew-session=([^;]+)/)?.[1];
      if (sid) sessions.delete(sid);
      res.setHeader('Set-Cookie', 'crabby-crew-session=; Path=/; HttpOnly; Max-Age=0');
      return res.json({ message: "Logout successful" });
    }

    // ── Profile ──
    if (path === '/profile' && req.method === 'PUT') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      const user = findUser(uid);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { displayName, avatarEmoji, bio } = req.body;
      if (displayName !== undefined) user.displayName = displayName;
      if (avatarEmoji !== undefined) user.avatarEmoji = avatarEmoji;
      if (bio !== undefined) user.bio = bio;
      user.updatedAt = new Date();
      if (user.nostrPrivkey) {
        buildAndPublishProfile(user.nostrPrivkey, { name: user.username, display_name: user.displayName || user.username, about: user.bio || 'Crabby Crew explorer' }, user.nostrRelayUrl || 'wss://relay.damus.io');
      }
      return res.json(stripPrivkey(user));
    }

    // ── Progress ──
    const pm = path.match(/^\/progress\/(.+)$/);
    if (pm && req.method === 'GET') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      if (uid !== pm[1]) return res.status(403).json({ message: "Forbidden" });
      const p = findProgress(uid) || createProgress(uid);
      return res.json(p);
    }
    if (pm && req.method === 'POST') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      if (uid !== pm[1]) return res.status(403).json({ message: "Forbidden" });
      const p = findProgress(uid);
      if (!p) return res.status(404).json({ message: "Progress not found" });
      Object.assign(p, req.body);
      return res.json(p);
    }

    // ── Quiz attempts ──
    if (path === '/quiz-attempts' && req.method === 'POST') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      const { quizId, score, totalQuestions, xpEarned, completedAt } = req.body;
      const attempt: QuizAttempt = { id: randomUUID(), userId: uid, quizId, score, totalQuestions, xpEarned, completedAt };
      quizAttempts.set(attempt.id, attempt);

      const p = findProgress(uid) || createProgress(uid);
      p.totalXp += xpEarned;
      p.level = Math.floor(p.totalXp / 200) + 1;
      const today = new Date().toISOString().split('T')[0];
      if (p.lastActivityDate !== today) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        p.currentStreak = p.lastActivityDate === y.toISOString().split('T')[0] ? p.currentStreak + 1 : 1;
      }
      p.longestStreak = Math.max(p.longestStreak, p.currentStreak);
      if (p.totalXp >= 1000 && !p.badges.includes("crab-expert")) p.badges.push("crab-expert");
      if (p.currentStreak >= 7 && !p.badges.includes("streak-master")) p.badges.push("streak-master");
      if (p.level >= 5 && !p.badges.includes("level-5")) p.badges.push("level-5");
      p.lastActivityDate = today;
      p.completedQuizzes = [...p.completedQuizzes, quizId];
      return res.json(attempt);
    }

    // ── Learn species ──
    const lm = path.match(/^\/learn-species\/(.+)$/);
    if (lm && req.method === 'POST') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      if (uid !== lm[1]) return res.status(403).json({ message: "Forbidden" });
      const { speciesId } = req.body;
      const p = findProgress(uid) || createProgress(uid);
      if (p.learnedSpecies.includes(speciesId)) return res.json(p);
      p.learnedSpecies.push(speciesId);
      p.totalXp += 25;
      if (p.learnedSpecies.length >= 5 && !p.badges.includes("first-steps")) p.badges.push("first-steps");
      if (p.learnedSpecies.length >= 10 && !p.badges.includes("species-collector")) p.badges.push("species-collector");
      return res.json(p);
    }

    // ── Crab flipped ──
    if (path === '/crab-flipped' && req.method === 'POST') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      const { crabId } = req.body;
      if (!crabId) return res.status(400).json({ message: "Crab ID required" });
      const p = findProgress(uid) || createProgress(uid);
      if (p.flippedCrabs.includes(crabId)) return res.json({ message: "Already discovered", progress: p, xpEarned: 0 });
      p.flippedCrabs.push(crabId);
      p.totalXp += 25;
      p.lastActivityDate = new Date().toISOString();
      return res.json({ message: "Crab discovery recorded", progress: p, xpEarned: 25 });
    }

    // ── Video complete ──
    if (path === '/video-complete' && req.method === 'POST') {
      const uid = getUserId(req);
      if (!uid) return res.status(401).json({ message: "Not authenticated" });
      const { videoId } = req.body;
      if (!videoId) return res.status(400).json({ message: "Video ID required" });
      const p = findProgress(uid) || createProgress(uid);
      if (p.watchedVideos.includes(videoId)) return res.status(400).json({ message: "Already completed" });
      p.watchedVideos.push(videoId);
      p.totalXp += 50;
      p.lastActivityDate = new Date().toISOString();
      return res.json({ message: "Video complete", progress: p, xpEarned: 50 });
    }

    // ── Leaderboards ──
    if (path === '/leaderboards') {
      const cat = (req.query.category as string) || undefined;
      const lim = req.query.limit ? parseInt(req.query.limit as string) : 10;
      let entries = Array.from(leaderboards.values());
      if (cat) entries = entries.filter(e => e.category === cat);
      entries.sort((a, b) => b.score - a.score);
      const result = entries.slice(0, lim).map((e, i) => {
        const u = findUser(e.userId);
        return { ...e, rank: i + 1, user: u ? { id: u.id, username: u.username, displayName: u.displayName, avatarEmoji: u.avatarEmoji } : null };
      });
      return res.json(result);
    }

    // ── Weekly challenges ──
    if (path === '/weekly-challenges') return res.json([]);
    if (path === '/public-achievements') return res.json([]);
    if (path === '/top-users-week') return res.json([]);

    return res.status(404).json({ message: "Not found" });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
