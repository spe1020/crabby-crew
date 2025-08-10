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
  onFlip?: () => void; // New prop for XP tracking
  discoveredCount?: number; // New prop for progress tracking
  totalCount?: number; // New prop for total crabs
}

export default function CrabCard({ crab, onClick, onFlip, discoveredCount, totalCount }: CrabCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [hasEarnedXP, setHasEarnedXP] = React.useState(false);
  const [showXPEffect, setShowXPEffect] = React.useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    const wasFlipped = isFlipped;
    setIsFlipped(!isFlipped);
    
    // Award XP only when flipping from front to back (first time)
    if (!wasFlipped && !hasEarnedXP && onFlip) {
      // Add a small delay to make the XP feel more natural
      setTimeout(() => {
        onFlip();
        setHasEarnedXP(true);
        setShowXPEffect(true);
        
        // Hide the XP effect after animation
        setTimeout(() => setShowXPEffect(false), 2000);
      }, 300);
    }
  };

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const shouldShowImage = crab.imageUrl && !imageError;
  const shouldShowEmoji = !crab.imageUrl || imageError;

  return (
    <div 
      className="relative w-full h-80 perspective-1000 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* XP Earned Effect */}
      {showXPEffect && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg xp-earned">
            +25 XP! 🎉
          </div>
        </div>
      )}

      {/* XP Earned Badge */}
      {hasEarnedXP && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
            ✓ Learned
          </div>
        </div>
      )}

      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side - Name, Picture, Habitat */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl p-6 shadow-lg border-2 border-ocean-200 group-hover:shadow-xl transition-shadow duration-300">
          {/* Image Section */}
          <div className="flex justify-center mb-4">
            {shouldShowImage && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl">{crab.emoji}</div>
                  </div>
                )}
                <img
                  src={crab.imageUrl!}
                  alt={crab.imageAlt || `${crab.name} crab`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {crab.imageSource && (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                    {crab.imageSource}
                  </div>
                )}
              </div>
            )}
            {shouldShowEmoji && (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center">
                <span className="text-4xl">{crab.emoji}</span>
              </div>
            )}
          </div>

          {/* Name and Scientific Name */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{crab.name}</h3>
            <p className="text-sm text-gray-600 italic">{crab.scientificName}</p>
          </div>

          {/* Habitat Info */}
          <div className="bg-ocean-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🏠</span>
              <div className="text-center">
                <div className="text-sm text-gray-500 uppercase tracking-wide">Habitat</div>
                <div className="text-base font-medium text-gray-700">{crab.habitat}</div>
              </div>
            </div>
          </div>

          {/* Click hint */}
          <div className="text-center text-sm text-gray-500">
            {hasEarnedXP ? 'Click to flip for more info' : 'Click to discover and earn XP!'}
          </div>

          {/* Progress Indicator */}
          {discoveredCount !== undefined && totalCount !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{discoveredCount}/{totalCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-ocean-400 to-ocean-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(discoveredCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Back Side - Region, Diet, Size, Fun Facts */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-3xl p-6 shadow-lg border-2 border-ocean-300 rotate-y-180 group-hover:shadow-xl transition-shadow duration-300">
          <div className="h-full flex flex-col justify-between">
            {/* Title */}
            <div className="text-center mb-3">
              <h3 className="text-lg font-bold text-gray-800">{crab.name}</h3>
              <p className="text-xs text-gray-600">More Details</p>
            </div>

            {/* Info Grid - Condensed */}
            <div className="space-y-2 flex-1">
              {/* Region */}
              <div className="bg-white bg-opacity-80 rounded-xl p-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🌍</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Region</div>
                    <div className="text-xs font-medium text-gray-700 truncate">{crab.region}</div>
                  </div>
                </div>
              </div>

              {/* Diet */}
              <div className="bg-white bg-opacity-80 rounded-xl p-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🍽️</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Diet</div>
                    <div className="text-xs font-medium text-gray-700 truncate">{crab.diet}</div>
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="bg-white bg-opacity-80 rounded-xl p-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">📏</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Size</div>
                    <div className="text-xs font-medium text-gray-700 truncate">{crab.size}</div>
                  </div>
                </div>
              </div>

              {/* Fun Fact */}
              <div className="bg-white bg-opacity-80 rounded-xl p-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">💡</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Fun Fact</div>
                    <div className="text-xs font-medium text-gray-700 line-clamp-2">{crab.funFact}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleLearnMoreClick}
                className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-2 px-4 rounded-xl font-medium transition-colors duration-200"
              >
                📚 Learn More
              </button>
              <div className="text-center text-xs text-gray-500">
                Click anywhere to flip back
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}