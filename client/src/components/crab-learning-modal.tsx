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
      
      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
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
            <p className="text-sm text-gray-500 mt-4">Closing automatically...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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