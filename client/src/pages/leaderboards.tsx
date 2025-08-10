import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, TrendingUp, Users, Target } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  category: string;
  score: number;
  rank: number;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarEmoji: string;
  };
}

interface PublicAchievement {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  isShared: boolean;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarEmoji: string;
  };
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface TopUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarEmoji: string;
  weeklyXp: number;
}

const categories = [
  { id: "total_xp", name: "Total XP", icon: Star },
  { id: "species_collector", name: "Species Collector", icon: Target },
  { id: "quiz_master", name: "Quiz Master", icon: Trophy },
  { id: "streak_champion", name: "Streak Champion", icon: TrendingUp },
];

const badgeConfig = {
  "first-steps": { name: "First Steps", emoji: "👶", color: "bg-blue-100 text-blue-800" },
  "species-collector": { name: "Species Collector", emoji: "🦀", color: "bg-green-100 text-green-800" },
  "crab-expert": { name: "Crab Expert", emoji: "🔬", color: "bg-purple-100 text-purple-800" },
  "streak-master": { name: "Streak Master", emoji: "🔥", color: "bg-orange-100 text-orange-800" },
  "level-5": { name: "Level 5", emoji: "⭐", color: "bg-yellow-100 text-yellow-800" },
  "perfect-score": { name: "Perfect Score", emoji: "💯", color: "bg-pink-100 text-pink-800" },
  "quiz-master": { name: "Quiz Master", emoji: "🧠", color: "bg-indigo-100 text-indigo-800" },
};

export default function Leaderboards() {
  const [selectedCategory, setSelectedCategory] = useState("total_xp");

  const { data: leaderboards, isLoading: leaderboardsLoading } = useQuery({
    queryKey: ["/api/leaderboards", selectedCategory],
    queryFn: () => fetch(`/api/leaderboards?category=${selectedCategory}&limit=10`)
      .then(res => res.json()) as Promise<LeaderboardEntry[]>,
  });

  const { data: publicAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/public-achievements"],
    queryFn: () => fetch("/api/public-achievements?limit=10")
      .then(res => res.json()) as Promise<PublicAchievement[]>,
  });

  const { data: weeklyChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["/api/weekly-challenges"],
    queryFn: () => fetch("/api/weekly-challenges")
      .then(res => res.json()) as Promise<WeeklyChallenge[]>,
  });

  const { data: topUsersWeek, isLoading: topUsersLoading } = useQuery({
    queryKey: ["/api/top-users-week"],
    queryFn: () => fetch("/api/top-users-week?limit=5")
      .then(res => res.json()) as Promise<TopUser[]>,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Crabby Crew Community
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Compete with fellow marine explorers and celebrate achievements together!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboards */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Leaderboards
                </CardTitle>
                <CardDescription>
                  See who's leading in different categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>

                {/* Leaderboard List */}
                <div className="space-y-3">
                  {leaderboardsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : leaderboards && leaderboards.length > 0 ? (
                    leaderboards.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {getRankIcon(entry.rank)}
                          <div className="text-2xl">{entry.user.avatarEmoji}</div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {entry.user.displayName || entry.user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{entry.user.username}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedCategory === "total_xp" ? "XP" : 
                             selectedCategory === "species_collector" ? "Species" :
                             selectedCategory === "quiz_master" ? "Quizzes" : "Days"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No leaderboard data available yet. Be the first to start learning!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenges */}
            <Card className="shadow-lg border-2 border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="h-6 w-6 text-green-600" />
                  Weekly Challenges
                </CardTitle>
                <CardDescription>
                  Complete challenges to earn bonus XP and badges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {challengesLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : weeklyChallenges && weeklyChallenges.length > 0 ? (
                  weeklyChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-green-800 text-lg">
                            {challenge.title}
                          </h3>
                          <p className="text-green-700 mt-1">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Target: {challenge.targetValue}
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Reward: {challenge.xpReward} XP
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active challenges this week. Check back soon!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top This Week */}
            <Card className="shadow-lg border-2 border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Top This Week
                </CardTitle>
                <CardDescription>
                  Weekly XP leaders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topUsersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : topUsersWeek && topUsersWeek.length > 0 ? (
                  topUsersWeek.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="text-lg">{user.avatarEmoji}</span>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {user.displayName || user.username}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-orange-600">
                        {user.weeklyXp} XP
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No weekly activity yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="shadow-lg border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate community wins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievementsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : publicAchievements && publicAchievements.length > 0 ? (
                  publicAchievements.map((achievement) => {
                    const badge = badgeConfig[achievement.badgeId as keyof typeof badgeConfig];
                    if (!badge) return null;
                    
                    return (
                      <div
                        key={achievement.id}
                        className="p-3 bg-white rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{achievement.user.avatarEmoji}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {achievement.user.displayName || achievement.user.username}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm">earned</span>
                              <Badge className={badge.color}>
                                {badge.emoji} {badge.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No recent achievements
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}