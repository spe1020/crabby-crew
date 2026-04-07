import { Link } from "wouter";

const tiles = [
  {
    emoji: "📖",
    title: "Learn",
    description: "Discover amazing crab species and ocean secrets.",
    href: "/learn",
    theme: "learn",
  },
  {
    emoji: "⚔️",
    title: "Quests",
    description: "Test your knowledge with fun, bite-sized quizzes.",
    href: "/quests",
    theme: "quests",
  },
  {
    emoji: "🏆",
    title: "Rewards",
    description: "Earn badges and unlock achievements as you go.",
    href: "/rewards",
    theme: "rewards",
  },
  {
    emoji: "📊",
    title: "Leaderboard",
    description: "Compete with other ocean explorers worldwide.",
    href: "/leaderboards",
    theme: "leaderboard",
  },
] as const;

export default function CoreFeatures() {
  return (
    <section
      className="relative z-10 px-6 pb-20 max-w-5xl mx-auto fade-in-up"
      style={{ animationDelay: "0.7s" }}
    >
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {tiles.map((tile) => (
          <Link key={tile.title} href={tile.href}>
            <div className="feature-tile p-6 text-center h-full" data-theme={tile.theme}>
              <div className="text-4xl mb-3">{tile.emoji}</div>
              <h3 className="font-fredoka text-white text-lg mb-2">{tile.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{tile.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
