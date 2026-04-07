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
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <span className="font-fredoka text-white text-xl sm:text-2xl tracking-wide cursor-pointer select-none hover:opacity-80 transition-opacity">
              Crabby Crew <span className="inline-block landing-crab">🦀</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated && progress && (
              <>
                <div className="stat-pill hidden sm:flex items-center gap-1.5">
                  <span className="text-sm">⭐</span>
                  <span className="text-white/90 text-sm font-semibold">{progress.totalXp || 0} XP</span>
                </div>
                <div className="stat-pill hidden sm:flex items-center gap-1.5">
                  <span className="text-sm">🔥</span>
                  <span className="text-white/90 text-sm font-semibold">{progress.currentStreak || 0}</span>
                </div>
              </>
            )}

            {isAuthenticated ? (
              <>
                <div className="stat-pill flex items-center gap-1.5">
                  <span className="text-sm">{(user as any)?.avatarEmoji || "🦀"}</span>
                  <span className="text-white/90 text-sm font-semibold hidden sm:inline">
                    {(user as any)?.displayName || (user as any)?.username || "Explorer"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/50 hover:text-white/80 text-xs font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className="cta-coral font-fredoka text-sm px-5 py-2 rounded-full">
                  Start Exploring
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
