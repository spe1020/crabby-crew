import { useGameProgress } from "@/hooks/use-game-progress";

export default function Navigation() {
  const { data: progress } = useGameProgress();

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-4 border-ocean-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl animate-bounce-gentle">🦀</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-fredoka text-ocean-600">Crabby Crew</h1>
              <p className="text-xs text-ocean-400 hidden md:block">Ocean Learning Adventure</p>
            </div>
          </div>
          
          {/* XP and Streak Display */}
          <div className="flex items-center space-x-4">
            <div className="bg-sunny-100 px-3 py-2 rounded-full border-2 border-sunny-300">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⭐</span>
                <span className="font-semibold text-sunny-700">
                  {progress?.totalXp || 0} XP
                </span>
              </div>
            </div>
            <div className="bg-coral-100 px-3 py-2 rounded-full border-2 border-coral-300">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔥</span>
                <span className="font-semibold text-coral-700">
                  {progress?.currentStreak || 0} Day Streak
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}