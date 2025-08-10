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
      console.log('Starting crab flip mutation for:', crabId);
      try {
        const response = await apiRequest('/api/crab-flipped', 'POST', { crabId });
        console.log('API response received:', response);
        const data = await response.json();
        console.log('Parsed response data:', data);
        return data;
      } catch (error) {
        console.error('Error in mutationFn:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded with data:', data);
      try {
        // Invalidate the game progress query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/progress', userId] });
        
        // Show progress update animation
        setShowProgressUpdate(true);
        setTimeout(() => setShowProgressUpdate(false), 600);
        
        // Only show XP toast if XP was actually earned
        if (data.xpEarned > 0) {
          // Add a small delay to make the XP feel more natural after the card flip
          setTimeout(() => {
            toast({
              title: "XP Earned! 🎉",
              description: `You earned ${data.xpEarned} XP for discovering a new crab!`,
              variant: "default",
              duration: 4000, // Show for 4 seconds
            });
          }, 500);
        }
      } catch (error) {
        console.error('Error in onSuccess callback:', error);
        // Don't show error toast here, just log it
      }
    },
    onError: (error) => {
      console.error('Mutation failed with error:', error);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-ocean-600 mb-4">🦀 Meet the Crab Crew! 🦀</h2>
        <p className="text-xl text-gray-600">Discover amazing crab species from around the world</p>
        
        {/* Progress Summary */}
        {progress && (
          <div className={`mt-6 bg-gradient-to-r from-ocean-100 to-ocean-200 rounded-2xl p-4 inline-block ${showProgressUpdate ? 'progress-update' : ''}`}>
            <div className="flex items-center space-x-6 text-ocean-700">
              <div className="text-center">
                <div className="text-2xl font-bold">{progress.totalXp}</div>
                <div className="text-sm">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {progress.flippedCrabs?.length || 0}
                  <span className="text-lg text-ocean-600">/15</span>
                </div>
                <div className="text-sm">Crabs Discovered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{progress.level}</div>
                <div className="text-sm">Level</div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {progress && progress.flippedCrabs && progress.flippedCrabs.length === 15 && (
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg inline-block">
              🎉 All Crabs Discovered! You're a Crab Master! 🦀
            </div>
          </div>
        )}
      </div>

      {/* Crab Species Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {crabsData.map((crab) => {
          const isDiscovered = progress?.flippedCrabs?.includes(crab.id) || false;
          return (
            <div key={crab.id} className="relative">
              <CrabCard 
                crab={crab} 
                onClick={() => handleCrabClick(crab)}
                onFlip={() => handleCrabFlip(crab.id)}
                discoveredCount={progress?.flippedCrabs?.length || 0}
                totalCount={15}
              />
              {isDiscovered && (
                <div className="absolute top-4 right-4 text-3xl z-10">✅</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link href="/">
          <button className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 rounded-full text-xl font-bold transition-colors shadow-lg">
            🏠 Back to Home
          </button>
        </Link>
      </div>

      {/* Learning Modal */}
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