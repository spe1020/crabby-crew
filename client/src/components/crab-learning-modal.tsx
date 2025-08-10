import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface CrabLearningModalProps {
  crab: {
    id: string;
    name: string;
    scientificName: string;
    habitat: string;
    region: string;
    diet: string;
    size: string;
    funFact: string;
    image: string;
  };
  isOpen: boolean;
  onClose: () => void;
  isAlreadyLearned: boolean;
}

export default function CrabLearningModal({ crab, isOpen, onClose, isAlreadyLearned }: CrabLearningModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = (user as any)?.id;

  const learnSpeciesMutation = useMutation({
    mutationFn: (speciesId: string) => {
      if (!userId) {
        throw new Error("Please sign in to save your progress");
      }
      return apiRequest(`/api/learn-species/${userId}`, "POST", { speciesId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', userId] });
      setShowSuccess(true);
      
      // Auto-close success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleLearnComplete = () => {
    learnSpeciesMutation.mutate(crab.id);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Great Job!</h3>
            <p className="text-gray-600 mb-4">You learned about the {crab.name}!</p>
            <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-4">
              <div className="text-3xl font-bold text-green-600">+25 XP</div>
              <div className="text-sm text-green-700">Species learned!</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ocean-600">
            {crab.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crab Image and Basic Info */}
          <div className="text-center">
            <div className="text-8xl mb-4">{crab.image}</div>
            <h3 className="text-2xl font-semibold text-gray-800">{crab.name}</h3>
            <p className="text-lg text-gray-600 italic">{crab.scientificName}</p>
          </div>

          {/* Region Map Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border-4 border-blue-200">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🌍</div>
              <h4 className="text-xl font-bold text-blue-700">Where in the world?</h4>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-center mb-3">
                <p className="text-lg font-semibold text-gray-800 mb-2">{crab.region}</p>
                <p className="text-sm text-gray-600">{crab.habitat}</p>
              </div>
              
              {/* Simple World Map with Star */}
              <div className="relative w-full h-32 bg-gradient-to-b from-blue-200 to-blue-300 rounded-xl overflow-hidden">
                {/* Continents (simplified shapes) */}
                <div className="absolute top-4 left-4 w-16 h-8 bg-green-400 rounded-full opacity-60"></div>
                <div className="absolute top-8 right-8 w-20 h-10 bg-green-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-green-400 rounded-full opacity-60"></div>
                
                {/* Star indicating region */}
                <div className="absolute text-2xl animate-pulse" style={{
                  top: getRegionStarPosition(crab.region).top,
                  left: getRegionStarPosition(crab.region).left
                }}>
                  ⭐
                </div>
              </div>
            </div>
          </div>

          {/* Fact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Habitat */}
            <div className="bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-3xl p-6 border-4 border-ocean-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🏠</div>
                <h4 className="text-xl font-bold text-ocean-700">Where do they live?</h4>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-700 leading-relaxed">{crab.habitat}</p>
              </div>
            </div>

            {/* Diet */}
            <div className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-3xl p-6 border-4 border-coral-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🍽️</div>
                <h4 className="text-xl font-bold text-coral-700">What do they eat?</h4>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-700 leading-relaxed">{crab.diet}</p>
              </div>
            </div>

            {/* Size */}
            <div className="bg-gradient-to-br from-sunny-50 to-sunny-100 rounded-3xl p-6 border-4 border-sunny-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">📏</div>
                <h4 className="text-xl font-bold text-sunny-700">How big are they?</h4>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-700 leading-relaxed">{crab.size}</p>
              </div>
            </div>

            {/* Fun Fact */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 border-4 border-green-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✨</div>
                <h4 className="text-xl font-bold text-green-700">Amazing fact!</h4>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-gray-700 leading-relaxed">{crab.funFact}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button 
              variant="outline"
              onClick={onClose}
              className="px-8 py-3 text-lg"
            >
              Close
            </Button>
            {!isAlreadyLearned && (
              <Button 
                onClick={handleLearnComplete}
                disabled={learnSpeciesMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
              >
                {learnSpeciesMutation.isPending ? "Saving..." : "Cool! (+25 XP)"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to position the star on the map based on region
function getRegionStarPosition(region: string): { top: string; left: string } {
  if (region.includes("North America") || region.includes("Atlantic Coast")) {
    return { top: "20%", left: "25%" };
  } else if (region.includes("Pacific") || region.includes("Japan")) {
    return { top: "25%", left: "75%" };
  } else if (region.includes("Caribbean") || region.includes("Central America")) {
    return { top: "45%", left: "30%" };
  } else if (region.includes("Tropical") || region.includes("Subtropical")) {
    return { top: "60%", left: "50%" };
  } else if (region.includes("Arctic") || region.includes("North Atlantic")) {
    return { top: "10%", left: "50%" };
  } else if (region.includes("Indian") || region.includes("Indo-Pacific")) {
    return { top: "55%", left: "70%" };
  } else {
    // Default position
    return { top: "50%", left: "50%" };
  }
}