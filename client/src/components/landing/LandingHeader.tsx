import { Link } from "wouter";

export default function LandingHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
      <Link href="/">
        <span className="font-fredoka text-white text-xl sm:text-2xl tracking-wide cursor-pointer select-none">
          Crabby Crew <span className="inline-block landing-crab">🦀</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/login">
          <span className="text-white/70 hover:text-white text-sm font-semibold transition-colors cursor-pointer">
            Sign In
          </span>
        </Link>
        <Link href="/login">
          <button className="cta-coral font-fredoka text-sm px-5 py-2 rounded-full">
            Start Exploring
          </button>
        </Link>
      </div>
    </header>
  );
}
