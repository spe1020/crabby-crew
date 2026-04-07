import { Link } from "wouter";
import { useGameProgress } from "@/hooks/use-game-progress";
import BadgeCard from "@/components/badge-card";

const badgeDefinitions = [
  { id: 'first-steps', name: 'First Steps', description: 'Learned about 5 crab species!', emoji: '🌟' },
  { id: 'crab-expert', name: 'Crab Expert', description: 'Earned 1000+ total XP!', emoji: '🦀' },
  { id: 'streak-master', name: 'Streak Master', description: 'Maintained a 7-day learning streak!', emoji: '🔥' },
  { id: 'species-collector', name: 'Species Collector', description: 'Learned about 10 different crab species!', emoji: '🧠' },
  { id: 'level-5', name: 'Level 5 Hero', description: 'Reached level 5!', emoji: '🌊' },
  { id: 'crab-master', name: 'Crab Master', description: 'Complete all available quests', emoji: '🏆' },
];

export default function Rewards() {
  const { data: progress } = useGameProgress();

  const earnedBadges = badgeDefinitions.map(badge => ({
    ...badge,
    earned: progress?.badges?.includes(badge.id) || false,
  }));

  const currentLevel = progress?.level || 1;
  const currentXp = progress?.totalXp || 0;
  const nextLevelXp = currentLevel * 200;
  const progressPercent = ((currentXp % 200) / 200) * 100;
  const xpToNext = nextLevelXp - (currentXp % 200);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="section-title text-3xl sm:text-4xl mb-3">🏆 Your Amazing Rewards!</h2>
        <p className="section-subtitle text-lg">Look at all the badges you've earned!</p>
      </div>

      {/* Stats Overview */}
      <div className="glass-card-lg p-6 sm:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-1">{currentXp}</div>
            <div className="text-white/50 text-sm">Total XP</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">{progress?.currentStreak || 0}</div>
            <div className="text-white/50 text-sm">Day Streak</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">{progress?.badges?.length || 0}</div>
            <div className="text-white/50 text-sm">Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Badge Collection */}
      <div className="mb-8">
        <h3 className="font-fredoka text-white text-xl text-center mb-6">🎖️ Badge Collection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {earnedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Level Progress */}
      <div className="glass-card p-6 mb-8">
        <h3 className="font-fredoka text-white text-xl text-center mb-6">📈 Level Progress</h3>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 font-semibold">Level {currentLevel}</span>
            <span className="text-white/60 text-sm">{currentXp} / {nextLevelXp} XP</span>
          </div>
          <div className="progress-track h-5">
            <div
              className="progress-fill h-5"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-center mt-4 text-white/60 text-sm">
            {xpToNext > 0 ? (
              <>Only <span className="font-bold text-[#ff6b4a]">{xpToNext} XP</span> until Level {currentLevel + 1}!</>
            ) : (
              <span className="font-bold text-[#7ec8c8]">Level {currentLevel} complete!</span>
            )}
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/">
          <button className="cta-glass font-semibold px-8 py-3 rounded-full">
            🏠 Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
