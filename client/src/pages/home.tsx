import { Link } from "wouter";
import { useGameProgress } from "@/hooks/use-game-progress";

export default function Home() {
  const { data: progress } = useGameProgress();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <div className="wave-bg rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Floating elements */}
          <div className="absolute top-4 left-4 text-4xl animate-float opacity-70">🐠</div>
          <div className="absolute top-8 right-8 text-3xl animate-bubble opacity-60">🫧</div>
          <div className="absolute bottom-4 left-1/4 text-3xl animate-float opacity-50" style={{animationDelay: '1s'}}>🌊</div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-fredoka mb-4">Welcome Back, Ocean Explorer!</h2>
            <p className="text-xl md:text-2xl opacity-90 mb-6">Ready to dive into your crab adventure?</p>
            
            {/* Progress Overview */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{progress?.totalXp || 0}</div>
                  <div className="text-sm opacity-80">Total XP Earned</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{progress?.learnedSpecies?.length || 0}</div>
                  <div className="text-sm opacity-80">Crab Species Learned</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{progress?.badges?.length || 0}</div>
                  <div className="text-sm opacity-80">Badges Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Learn Card */}
        <Link href="/learn">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-ocean-100 hover:border-ocean-300">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle">🦀</div>
              <h3 className="text-2xl font-bold text-ocean-600 mb-2">Learn</h3>
              <p className="text-gray-600 mb-4">Discover amazing crab species and their secrets!</p>
              <div className="bg-ocean-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                6 Species to Explore
              </div>
            </div>
          </div>
        </Link>

        {/* Quests Card */}
        <Link href="/quests">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-coral-100 hover:border-coral-300">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle" style={{animationDelay: '0.5s'}}>🎯</div>
              <h3 className="text-2xl font-bold text-coral-600 mb-2">Quests</h3>
              <p className="text-gray-600 mb-4">Test your knowledge with fun quizzes!</p>
              <div className="bg-coral-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                3 Quiz Categories
              </div>
            </div>
          </div>
        </Link>

        {/* Rewards Card */}
        <Link href="/rewards">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-sunny-100 hover:border-sunny-300">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle" style={{animationDelay: '1s'}}>🏆</div>
              <h3 className="text-2xl font-bold text-sunny-600 mb-2">Rewards</h3>
              <p className="text-gray-600 mb-4">Check your badges and achievements!</p>
              <div className="bg-sunny-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {progress?.badges?.length || 0} Badges Earned
              </div>
            </div>
          </div>
        </Link>

        {/* Leaderboards Card */}
        <Link href="/leaderboards">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-purple-100 hover:border-purple-300">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle" style={{animationDelay: '1.5s'}}>👑</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-2">Leaderboards</h3>
              <p className="text-gray-600 mb-4">Compete with other ocean explorers!</p>
              <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Community Rankings
              </div>
            </div>
          </div>
        </Link>

        {/* Videos Card */}
        <Link href="/videos">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-4 border-gray-100 hover:border-gray-300 opacity-75">
            <div className="p-6 text-center">
              <div className="text-6xl mb-4 animate-bounce-gentle" style={{animationDelay: '1.5s'}}>📹</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">Videos</h3>
              <p className="text-gray-600 mb-4">Watch educational crab videos!</p>
              <div className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Recent Activity */}
      <section className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-ocean-600 mb-6 flex items-center">
          <span className="text-3xl mr-3">📈</span>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {progress?.totalXp ? (
            <>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm">
                <div className="text-2xl">🌟</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Great progress learning about crabs!</p>
                  <p className="text-sm text-gray-500">Total XP: {progress.totalXp}</p>
                </div>
              </div>
              {progress.currentStreak > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-2xl">🔥</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Amazing {progress.currentStreak} day streak!</p>
                    <p className="text-sm text-gray-500">Keep up the great work!</p>
                  </div>
                </div>
              )}
              {progress.badges && progress.badges.length > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-2xl">🏅</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Earned {progress.badges.length} badge{progress.badges.length !== 1 ? 's' : ''}!</p>
                    <p className="text-sm text-gray-500">Check your rewards page to see them all</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌊</div>
              <p className="text-gray-600 text-lg">Start your crab adventure by exploring the Learn section!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}