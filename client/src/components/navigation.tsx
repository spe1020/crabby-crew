import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Navigation() {
  const { data: progress } = useGameProgress();
  const { user, isAuthenticated } = useAuth();



  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      // Refresh the page to update auth state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-4 border-ocean-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-4xl animate-bounce-gentle">🦀</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-fredoka text-ocean-600">Crabby Crew</h1>
                  <p className="text-xs text-ocean-400 hidden md:block">Ocean Learning Adventure</p>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* XP and Streak Display - only show if authenticated */}
            {isAuthenticated && progress && (
              <>
                <div className="bg-sunny-100 px-3 py-2 rounded-full border-2 border-sunny-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-semibold text-sunny-700">
                      {progress.totalXp || 0} XP
                    </span>
                  </div>
                </div>
                <div className="bg-coral-100 px-3 py-2 rounded-full border-2 border-coral-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔥</span>
                    <span className="font-semibold text-coral-700">
                      {progress.currentStreak || 0} Day Streak
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 bg-ocean-100 px-3 py-2 rounded-full border-2 border-ocean-300">
                    <span className="text-lg">{user?.avatarEmoji || "🦀"}</span>
                    <span className="font-semibold text-ocean-700 text-sm">
                      {user?.displayName || user?.username || "Explorer"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-full border-2 border-red-300 font-semibold text-sm transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <button className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-2 rounded-full font-semibold text-sm transition-colors transform hover:scale-105">
                    Start Adventure
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}