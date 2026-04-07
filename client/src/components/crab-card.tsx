import React from 'react';

interface Crab {
  id: string;
  name: string;
  scientificName: string;
  habitat: string;
  region: string;
  diet: string;
  size: string;
  funFact: string;
  image: string;
  emoji: string;
  imageUrl?: string | null;
  imageSource?: string | null;
  imageAlt?: string | null;
}

interface CrabCardProps {
  crab: Crab;
  onClick: () => void;
  onFlip?: () => void;
  discoveredCount?: number;
  totalCount?: number;
}

export default function CrabCard({ crab, onClick, onFlip, discoveredCount, totalCount }: CrabCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [hasEarnedXP, setHasEarnedXP] = React.useState(false);
  const [showXPEffect, setShowXPEffect] = React.useState(false);

  const handleCardClick = () => {
    const wasFlipped = isFlipped;
    setIsFlipped(!isFlipped);
    if (!wasFlipped && !hasEarnedXP && onFlip) {
      setTimeout(() => {
        onFlip();
        setHasEarnedXP(true);
        setShowXPEffect(true);
        setTimeout(() => setShowXPEffect(false), 2000);
      }, 300);
    }
  };

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const shouldShowImage = crab.imageUrl && !imageError;

  return (
    <div className="relative w-full h-80 perspective-1000 cursor-pointer group" onClick={handleCardClick}>
      {/* XP Effect */}
      {showXPEffect && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="cta-coral px-4 py-2 rounded-full font-bold text-base xp-earned">+25 XP! 🎉</div>
        </div>
      )}

      {/* Learned badge */}
      {hasEarnedXP && (
        <div className="absolute top-4 right-4 z-10">
          <div className="text-xs font-semibold px-2 py-1 rounded-full bg-[#7ec8c8] text-[#062a3e]">✓ Learned</div>
        </div>
      )}

      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* ── Front ── */}
        <div className="absolute inset-0 w-full h-full backface-hidden glass-card p-6 group-hover:bg-white/10 transition-colors">
          <div className="flex justify-center mb-4">
            {shouldShowImage ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/5">
                {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center text-3xl">{crab.emoji}</div>}
                <img
                  src={crab.imageUrl!}
                  alt={crab.imageAlt || `${crab.name} crab`}
                  className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="text-4xl">{crab.emoji}</span>
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-white mb-1">{crab.name}</h3>
            <p className="text-xs text-white/40 italic">{crab.scientificName}</p>
          </div>

          <div className="rounded-xl p-3 mb-3 bg-white/5">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🏠</span>
              <div className="text-center">
                <div className="text-[10px] text-white/40 uppercase tracking-wide">Habitat</div>
                <div className="text-xs font-medium text-white/70">{crab.habitat}</div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-white/40">
            {hasEarnedXP ? 'Click to flip for more info' : 'Click to discover and earn XP!'}
          </div>

          {discoveredCount !== undefined && totalCount !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                <span>Progress</span>
                <span>{discoveredCount}/{totalCount}</span>
              </div>
              <div className="progress-track h-1.5">
                <div className="progress-fill h-1.5" style={{ width: `${(discoveredCount / totalCount) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Back ── */}
        <div className="absolute inset-0 w-full h-full backface-hidden glass-card p-6 rotate-y-180 bg-white/10">
          <div className="h-full flex flex-col justify-between">
            <div className="text-center mb-2">
              <h3 className="text-base font-bold text-white">{crab.name}</h3>
              <p className="text-[10px] text-white/40">More Details</p>
            </div>

            <div className="space-y-2 flex-1">
              {[
                { icon: "🌍", label: "Region", value: crab.region },
                { icon: "🍽️", label: "Diet", value: crab.diet },
                { icon: "📏", label: "Size", value: crab.size },
                { icon: "💡", label: "Fun Fact", value: crab.funFact },
              ].map((item) => (
                <div key={item.label} className="rounded-lg p-2 bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-white/30 uppercase tracking-wide">{item.label}</div>
                      <div className="text-xs text-white/70 truncate">{item.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-2">
              <button
                onClick={handleLearnMoreClick}
                className="cta-coral w-full py-2 rounded-xl text-sm font-semibold"
              >
                📚 Learn More
              </button>
              <div className="text-center text-[10px] text-white/30">Click anywhere to flip back</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
