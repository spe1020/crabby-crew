import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Star, TrendingUp, Users, Target } from "lucide-react";

interface LeaderboardEntry {
  id: string; userId: string; category: string; score: number; rank: number;
  user: { id: string; username: string; displayName: string | null; avatarEmoji: string };
}
interface PublicAchievement {
  id: string; userId: string; badgeId: string; earnedAt: string; isShared: boolean;
  user: { id: string; username: string; displayName: string | null; avatarEmoji: string };
}
interface WeeklyChallenge {
  id: string; title: string; description: string; targetMetric: string; targetValue: number; xpReward: number; startDate: string; endDate: string; isActive: boolean;
}
interface TopUser {
  id: string; username: string; displayName: string | null; avatarEmoji: string; weeklyXp: number;
}

const categories = [
  { id: "total_xp", name: "Total XP", icon: Star },
  { id: "species_collector", name: "Species", icon: Target },
  { id: "quiz_master", name: "Quizzes", icon: Trophy },
  { id: "streak_champion", name: "Streaks", icon: TrendingUp },
];

const badgeConfig: Record<string, { name: string; emoji: string }> = {
  "first-steps": { name: "First Steps", emoji: "👶" },
  "species-collector": { name: "Species Collector", emoji: "🦀" },
  "crab-expert": { name: "Crab Expert", emoji: "🔬" },
  "streak-master": { name: "Streak Master", emoji: "🔥" },
  "level-5": { name: "Level 5", emoji: "⭐" },
  "perfect-score": { name: "Perfect Score", emoji: "💯" },
  "quiz-master": { name: "Quiz Master", emoji: "🧠" },
};

export default function Leaderboards() {
  const [selectedCategory, setSelectedCategory] = useState("total_xp");

  const { data: leaderboards, isLoading: lbLoading } = useQuery({
    queryKey: ["/api/leaderboards", selectedCategory],
    queryFn: () => fetch(`/api/leaderboards?category=${selectedCategory}&limit=10`).then(r => r.json()) as Promise<LeaderboardEntry[]>,
  });
  const { data: publicAchievements, isLoading: achLoading } = useQuery({
    queryKey: ["/api/public-achievements"],
    queryFn: () => fetch("/api/public-achievements?limit=10").then(r => r.json()) as Promise<PublicAchievement[]>,
  });
  const { data: weeklyChallenges, isLoading: chLoading } = useQuery({
    queryKey: ["/api/weekly-challenges"],
    queryFn: () => fetch("/api/weekly-challenges").then(r => r.json()) as Promise<WeeklyChallenge[]>,
  });
  const { data: topUsersWeek, isLoading: tuLoading } = useQuery({
    queryKey: ["/api/top-users-week"],
    queryFn: () => fetch("/api/top-users-week?limit=5").then(r => r.json()) as Promise<TopUser[]>,
  });

  const rankIcon = (r: number) => {
    if (r === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (r === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (r === 3) return <Medal className="h-5 w-5 text-amber-500" />;
    return <span className="text-sm font-bold text-white/40">#{r}</span>;
  };

  const unitLabel = selectedCategory === "total_xp" ? "XP" : selectedCategory === "species_collector" ? "Species" : selectedCategory === "quiz_master" ? "Quizzes" : "Days";

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-lg animate-pulse ${className}`} style={{ background: "rgba(255,255,255,0.05)" }} />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className="h-7 w-7 text-[#7ec8c8]" />
          <h1 className="section-title text-3xl sm:text-4xl">Crabby Crew Community</h1>
        </div>
        <p className="section-subtitle text-lg">Compete with fellow marine explorers!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leaderboard */}
          <div className="glass-card-lg p-6">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h2 className="font-fredoka text-white text-lg">Leaderboards</h2>
            </div>
            <p className="text-white/40 text-sm mb-4">See who's leading in different categories</p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      active ? "bg-[#ff6b4a] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {c.name}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="space-y-2">
              {lbLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)
              ) : leaderboards && leaderboards.length > 0 ? (
                leaderboards.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                    <div className="flex items-center gap-3">
                      {rankIcon(entry.rank)}
                      <span className="text-xl">{entry.user.avatarEmoji}</span>
                      <div>
                        <div className="text-white font-semibold text-sm">{entry.user.displayName || entry.user.username}</div>
                        <div className="text-white/30 text-xs">@{entry.user.username}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#ff6b4a]">{entry.score.toLocaleString()}</div>
                      <div className="text-white/30 text-xs">{unitLabel}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-white/40">No leaderboard data yet. Be the first!</p>
              )}
            </div>
          </div>

          {/* Weekly Challenges */}
          <div className="glass-card-lg p-6">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-[#7ec8c8]" />
              <h2 className="font-fredoka text-white text-lg">Weekly Challenges</h2>
            </div>
            <p className="text-white/40 text-sm mb-4">Complete challenges for bonus XP</p>

            <div className="space-y-3">
              {chLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20" />)
              ) : weeklyChallenges && weeklyChallenges.length > 0 ? (
                weeklyChallenges.map((ch) => (
                  <div key={ch.id} className="rounded-xl p-4 bg-white/5 border border-white/5">
                    <h3 className="text-white font-semibold mb-1">{ch.title}</h3>
                    <p className="text-white/50 text-sm mb-2">{ch.description}</p>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7ec8c8]/15 text-[#7ec8c8]">Target: {ch.targetValue}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a]">+{ch.xpReward} XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-white/40 text-sm">No active challenges this week.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Top This Week */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-[#ff6b4a]" />
              <h3 className="font-fredoka text-white text-base">Top This Week</h3>
            </div>
            <p className="text-white/40 text-xs mb-3">Weekly XP leaders</p>
            <div className="space-y-2">
              {tuLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)
              ) : topUsersWeek && topUsersWeek.length > 0 ? (
                topUsersWeek.map((u, i) => (
                  <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/30">#{i + 1}</span>
                      <span className="text-sm">{u.avatarEmoji}</span>
                      <span className="text-white text-xs font-medium">{u.displayName || u.username}</span>
                    </div>
                    <span className="text-[#ff6b4a] text-xs font-bold">{u.weeklyXp} XP</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-3 text-white/40 text-xs">No weekly activity yet</p>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-[#f5e6c8]" />
              <h3 className="font-fredoka text-white text-base">Recent Achievements</h3>
            </div>
            <p className="text-white/40 text-xs mb-3">Community wins</p>
            <div className="space-y-2">
              {achLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)
              ) : publicAchievements && publicAchievements.length > 0 ? (
                publicAchievements.map((a) => {
                  const badge = badgeConfig[a.badgeId];
                  if (!badge) return null;
                  return (
                    <div key={a.id} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white/5">
                      <span className="text-sm">{a.user.avatarEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{a.user.displayName || a.user.username}</div>
                        <div className="text-white/40 text-[10px]">earned {badge.emoji} {badge.name}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-3 text-white/40 text-xs">No recent achievements</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
