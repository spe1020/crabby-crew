import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-16 sm:pt-14 sm:pb-20 max-w-3xl mx-auto">
      {/* Animated crab */}
      <div
        className="text-6xl sm:text-7xl landing-crab fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        🦀
      </div>

      {/* Headline */}
      <h1
        className="font-fredoka text-white fade-in-up mt-6"
        style={{
          fontSize: "clamp(1.75rem, 5vw, 3rem)",
          lineHeight: 1.15,
          animationDelay: "0.25s",
        }}
      >
        Learn Crabs. Play Quests.
        <br />
        Earn Rewards.
      </h1>

      {/* Subline */}
      <p
        className="text-white/75 max-w-md mt-4 fade-in-up"
        style={{
          fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
          animationDelay: "0.4s",
        }}
      >
        Explore ocean life, take quizzes, and become part of the Crabby&nbsp;Crew.
      </p>

      {/* CTAs */}
      <div
        className="flex flex-wrap items-center justify-center gap-4 mt-8 fade-in-up"
        style={{ animationDelay: "0.55s" }}
      >
        <Link href="/login">
          <button className="cta-coral font-fredoka px-8 py-3 rounded-full text-base sm:text-lg">
            Start Exploring 🦀
          </button>
        </Link>
        <a href="#how-it-works">
          <button className="cta-glass font-semibold px-6 py-3 rounded-full text-sm sm:text-base">
            How It Works
          </button>
        </a>
      </div>
    </section>
  );
}
