import { useState } from "react";
import { useGameProgress } from "@/hooks/use-game-progress";
import CrabLearningModal from "./crab-learning-modal";

interface CrabCardProps {
  crab: {
    id: string;
    name: string;
    scientificName: string;
    habitat: string;
    diet: string;
    size: string;
    funFact: string;
    image: string;
  };
}

export default function CrabCard({ crab }: CrabCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: progress } = useGameProgress();
  
  const isLearned = progress?.learnedSpecies?.includes(crab.id) || false;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full bg-white rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 border-4 ${
          isLearned ? 'border-green-300 bg-green-50' : 'border-ocean-100'
        } p-6 relative`}
      >
        {/* Crab Image/Emoji - Large and Prominent */}
        <div className="text-center mb-4">
          <div className="text-8xl mb-4 relative">
            {crab.image}
            {isLearned && (
              <div className="absolute -top-2 -right-2 text-3xl">✅</div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-ocean-600 mb-2">{crab.name}</h3>
          <p className="text-gray-500 italic text-lg">{crab.scientificName}</p>
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

        {/* Learn Status */}
        <div className={`text-lg font-semibold ${
          isLearned ? 'text-green-600' : 'text-ocean-600'
        }`}>
          {isLearned ? 'Learned! Tap to review' : 'Tap to learn (+25 XP)'}
        </div>
      </button>

      <CrabLearningModal 
        crab={crab}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isAlreadyLearned={isLearned}
      />
    </>
  );
}