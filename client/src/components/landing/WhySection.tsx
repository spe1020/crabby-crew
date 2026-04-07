const items = [
  "Discover fun and surprising crab facts",
  "Take quizzes and challenges that actually feel like games",
  "Earn badges and rewards as you learn",
  "Become part of the Crabby Crew",
];

export default function WhySection() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 px-6 pb-20 max-w-[440px] mx-auto fade-in-up"
      style={{ animationDelay: "0.9s" }}
    >
      <h2
        className="font-fredoka text-white text-center mb-8"
        style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.6rem)" }}
      >
        Why Kids Love Crabby Crew
      </h2>

      <ol className="flex flex-col gap-3">
        {items.map((text, i) => (
          <li key={i} className="why-row flex items-center gap-4 px-4 py-3.5">
            {/* Gradient number circle */}
            <span
              className="flex-shrink-0 flex items-center justify-center rounded-full font-fredoka text-white text-sm"
              style={{
                width: 32,
                height: 32,
                background: `linear-gradient(135deg, #ff6b4a ${i * 15}%, #7ec8c8 100%)`,
              }}
            >
              {i + 1}
            </span>
            <span className="text-white/80 text-sm leading-snug">{text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
