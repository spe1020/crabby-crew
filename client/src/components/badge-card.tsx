interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    earned: boolean;
  };
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div
      className={`glass-card p-6 text-center transition-transform hover:scale-105 ${
        !badge.earned ? "opacity-40 grayscale" : ""
      }`}
    >
      <div className={`text-5xl mb-3 ${!badge.earned ? "grayscale" : ""}`}>{badge.emoji}</div>
      <h4 className={`font-fredoka text-base mb-1 ${badge.earned ? "text-white" : "text-white/50"}`}>
        {badge.name}
      </h4>
      <p className={`text-sm mb-3 ${badge.earned ? "text-white/60" : "text-white/30"}`}>
        {badge.description}
      </p>
      <span
        className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
          badge.earned
            ? "bg-[#ff6b4a]/15 text-[#ff6b4a]"
            : "bg-white/5 text-white/30"
        }`}
      >
        {badge.earned ? "Earned!" : "Locked"}
      </span>
    </div>
  );
}
