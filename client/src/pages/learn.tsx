import { useState } from "react";
import { Link } from "wouter";
import CrabCard from "@/components/crab-card";
import CrabLearningModal from "@/components/crab-learning-modal";
import { useGameProgress } from "@/hooks/use-game-progress";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import crabsData from "@/data/crabs.json";

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

export default function Learn() {
  const [selectedCrab, setSelectedCrab] = useState<Crab | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const { data: progress } = useGameProgress();
  const { user } = useAuth();
  const userId = (user as any)?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const markCrabFlipped = useMutation({
    mutationFn: async (crabId: string) => {
      const response = await apiRequest('/api/crab-flipped', 'POST', { crabId });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', userId] });
      setShowProgressUpdate(true);
      setTimeout(() => setShowProgressUpdate(false), 600);
      if (data.xpEarned > 0) {
        setTimeout(() => {
          toast({
            title: "XP Earned! 🎉",
            description: `You earned ${data.xpEarned} XP for discovering a new crab!`,
          });
        }, 500);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record your discovery. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCrabClick = (crab: Crab) => {
    setSelectedCrab(crab);
    setIsModalOpen(true);
  };

  const handleCrabFlip = (crabId: string) => {
    markCrabFlipped.mutate(crabId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCrab(null);
  };

  const discovered = progress?.flippedCrabs?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="section-title text-3xl sm:text-4xl mb-3">🦀 Meet the Crab Crew!</h2>
        <p className="section-subtitle text-lg">Discover amazing crab species from around the world</p>

        {/* Progress Summary */}
        {progress && (
          <div className={`mt-6 glass-card inline-flex items-center gap-6 px-6 py-3 ${showProgressUpdate ? 'progress-update' : ''}`}>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{progress.totalXp}</div>
              <div className="text-xs text-white/50">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {discovered}<span className="text-sm text-white/50">/15</span>
              </div>
              <div className="text-xs text-white/50">Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{progress.level}</div>
              <div className="text-xs text-white/50">Level</div>
            </div>
          </div>
        )}

        {/* Completion */}
        {discovered === 15 && (
          <div className="mt-4">
            <span className="cta-coral inline-block font-fredoka px-6 py-2 rounded-full text-base">
              🎉 All Crabs Discovered! You're a Crab Master! 🦀
            </span>
          </div>
        )}
      </div>

      {/* Crab Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {crabsData.map((crab) => {
          const isDiscovered = progress?.flippedCrabs?.includes(crab.id) || false;
          return (
            <div key={crab.id} className="relative">
              <CrabCard
                crab={crab}
                onClick={() => handleCrabClick(crab)}
                onFlip={() => handleCrabFlip(crab.id)}
                discoveredCount={discovered}
                totalCount={15}
              />
              {isDiscovered && (
                <div className="absolute top-4 right-4 text-2xl z-10">✅</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back */}
      <div className="text-center">
        <Link href="/">
          <button className="cta-glass font-semibold px-8 py-3 rounded-full">
            🏠 Back to Home
          </button>
        </Link>
      </div>

      {/* Modal */}
      {selectedCrab && (
        <CrabLearningModal
          crab={selectedCrab}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isAlreadyLearned={progress?.flippedCrabs?.includes(selectedCrab.id) || false}
        />
      )}
    </div>
  );
}
