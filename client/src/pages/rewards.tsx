import { Link } from "wouter";
import { useGameProgress } from "@/hooks/use-game-progress";
import BadgeCard from "@/components/badge-card";

const badgeDefinitions = [
  { id: 'first-steps', name: 'First Steps', description: 'Learned about 5 crab species!', emoji: '🌟', earned: true },
  { id: 'crab-expert', name: 'Crab Expert', description: 'Earned 1000+ total XP!', emoji: '🦀', earned: true },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintained a 7-day learning streak!', emoji: '🔥', earned: true },
  { id: 'species-collector', name: 'Species Collector', description: 'Learned about 10 different crab species!', emoji: '🧠', earned: true },
  { id: 'level-5', name: 'Level 5 Hero', description: 'Reached level 5!', emoji: '🌊', earned: true },
  { id: 'crab-master', name: 'Crab Master', description: 'Complete all available quests', emoji: '🏆', earned: false },
];

export default function Rewards() {
  const { data: progress } = useGameProgress();

  const earnedBadges = badgeDefinitions.map(badge => ({
    ...badge,
    earned: progress?.badges?.includes(badge.id) || false
  }));

  const currentLevel = progress?.level || 1;
  const currentXp = progress?.totalXp || 0;
  const nextLevelXp = currentLevel * 200;
  const progressPercent = ((currentXp % 200) / 200) * 100;
  const xpToNext = nextLevelXp - (currentXp % 200);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-sunny-600 mb-4">🏆 Your Amazing Rewards! 🏆</h2>
        <p className="text-xl text-gray-600">Look at all the badges you've earned!</p>
      </div>

      {/* Stats Overview */}
      <div className="bg-gradient-to-r from-sunny-400 to-sunny-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-5xl font-bold mb-2">{progress?.totalXp || 0}</div>
            <div className="text-sunny-100">Total XP</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">{progress?.currentStreak || 0}</div>
            <div className="text-sunny-100">Day Streak</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">{progress?.badges?.length || 0}</div>
            <div className="text-sunny-100">Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Badge Collection */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">🎖️ Badge Collection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {earnedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📈 Level Progress</h3>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold text-gray-700">Level {currentLevel}</div>
            <div className="text-lg font-semibold text-gray-700">{currentXp} / {nextLevelXp} XP</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className="bg-gradient-to-r from-ocean-400 to-ocean-600 h-6 rounded-full transition-all duration-1000 relative"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              {xpToNext > 0 ? (
                <>Only <span className="font-bold text-ocean-600">{xpToNext} XP</span> until Level {currentLevel + 1}!</>
              ) : (
                <span className="font-bold text-ocean-600">Level {currentLevel} complete!</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/">
          <button className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors shadow-lg">
            🏠 Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}