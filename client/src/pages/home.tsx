import { Link } from "wouter";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/hooks/useAuth";

// Landing page components
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import CoreFeatures from "@/components/landing/CoreFeatures";
import WhySection from "@/components/landing/WhySection";
import LandingFooter from "@/components/landing/LandingFooter";
import Bubbles from "@/components/landing/Bubbles";

export default function Home() {
  const { data: progress } = useGameProgress();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AuthenticatedHome progress={progress} />;
}

/* ────────────────────────────────────────────
   Landing page (unauthenticated visitors)
   ──────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="landing-bg">
      <Bubbles />
      <LandingHeader />
      <HeroSection />
      <CoreFeatures />
      <WhySection />
      <LandingFooter />
    </div>
  );
}

/* ────────────────────────────────────────────
   Authenticated dashboard (existing users)
   ──────────────────────────────────────────── */

const dashTiles = [
  { emoji: "📖", title: "Learn", desc: "Discover amazing crab species", href: "/learn", glow: "rgba(126,200,200,0.3)" },
  { emoji: "⚔️", title: "Quests", desc: "Test your knowledge with quizzes", href: "/quests", glow: "rgba(255,107,74,0.3)" },
  { emoji: "🏆", title: "Rewards", desc: "Check badges and achievements", href: "/rewards", glow: "rgba(245,230,200,0.35)" },
  { emoji: "📊", title: "Leaderboard", desc: "Compete with other explorers", href: "/leaderboards", glow: "rgba(126,200,200,0.3)" },
  { emoji: "📹", title: "Videos", desc: "Watch educational crab videos", href: "/videos", glow: "rgba(255,107,74,0.2)" },
];

function AuthenticatedHome({ progress }: { progress: any }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome */}
      <section className="text-center mb-10">
        <h2 className="section-title text-3xl sm:text-4xl mb-2">Welcome Back, Explorer!</h2>
        <p className="section-subtitle text-lg mb-6">Ready to dive into your crab adventure?</p>

        <div className="glass-card-lg inline-flex items-center gap-8 px-8 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{progress?.totalXp || 0}</div>
            <div className="text-white/40 text-xs">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{progress?.learnedSpecies?.length || 0}</div>
            <div className="text-white/40 text-xs">Species Learned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{progress?.badges?.length || 0}</div>
            <div className="text-white/40 text-xs">Badges</div>
          </div>
        </div>
      </section>

      {/* Nav tiles */}
      <section className="grid gap-5 mb-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {dashTiles.map((tile) => (
          <Link key={tile.title} href={tile.href}>
            <div
              className="feature-tile p-6 text-center h-full"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${tile.glow}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              <div className="text-4xl mb-3">{tile.emoji}</div>
              <h3 className="font-fredoka text-white text-lg mb-1">{tile.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{tile.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="glass-card p-6">
        <h3 className="font-fredoka text-white text-xl mb-5 flex items-center gap-2">
          <span className="text-2xl">📈</span> Recent Activity
        </h3>
        <div className="space-y-3">
          {progress?.totalXp ? (
            <>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="text-white font-semibold text-sm">Great progress learning about crabs!</p>
                  <p className="text-white/40 text-xs">Total XP: {progress.totalXp}</p>
                </div>
              </div>
              {progress.currentStreak > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Amazing {progress.currentStreak} day streak!</p>
                    <p className="text-white/40 text-xs">Keep up the great work!</p>
                  </div>
                </div>
              )}
              {progress.badges && progress.badges.length > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <span className="text-2xl">🏅</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Earned {progress.badges.length} badge{progress.badges.length !== 1 ? 's' : ''}!</p>
                    <p className="text-white/40 text-xs">Check your rewards page to see them all</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🌊</div>
              <p className="text-white/50">Start your crab adventure by exploring the Learn section!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
