import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      if (!userId) throw new Error("Please sign in to save your progress");
      return apiRequest(`/api/learn-species/${userId}`, "POST", { speciesId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', userId] });
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onClose(); }, 2000);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save progress.", variant: "destructive" });
    }
  });

  useEffect(() => { if (isOpen) setShowSuccess(false); }, [isOpen]);

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm bg-[#0a4d6e] border border-white/10 text-white">
          <div className="text-center py-6">
            <div className="text-5xl mb-3 animate-bounce">🎉</div>
            <h3 className="font-fredoka text-xl text-[#7ec8c8] mb-2">Great Job!</h3>
            <p className="text-white/60 text-sm mb-4">You learned about the {crab.name}!</p>
            <div className="rounded-xl p-3 bg-[#7ec8c8]/10 border border-[#7ec8c8]/20">
              <div className="text-2xl font-bold text-[#7ec8c8]">+25 XP</div>
              <div className="text-[#7ec8c8]/60 text-xs">Species learned!</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#062a3e] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-fredoka text-xl text-white">{crab.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Hero */}
          <div className="text-center">
            <div className="text-7xl mb-3">{crab.image}</div>
            <h3 className="text-xl font-semibold text-white">{crab.name}</h3>
            <p className="text-white/40 italic text-sm">{crab.scientificName}</p>
          </div>

          {/* Region */}
          <div className="glass-card p-5">
            <div className="text-center mb-3">
              <span className="text-3xl">🌍</span>
              <h4 className="font-fredoka text-white mt-1">Where in the world?</h4>
            </div>
            <div className="rounded-xl p-3 bg-white/5 text-center">
              <p className="text-white font-semibold text-sm mb-1">{crab.region}</p>
              <p className="text-white/40 text-xs">{crab.habitat}</p>
            </div>
          </div>

          {/* Fact grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "🏠", title: "Where do they live?", text: crab.habitat },
              { icon: "🍽️", title: "What do they eat?", text: crab.diet },
              { icon: "📏", title: "How big are they?", text: crab.size },
              { icon: "✨", title: "Amazing fact!", text: crab.funFact },
            ].map((card) => (
              <div key={card.title} className="glass-card p-4">
                <div className="text-center mb-2">
                  <span className="text-2xl">{card.icon}</span>
                  <h4 className="font-fredoka text-white text-sm mt-1">{card.title}</h4>
                </div>
                <div className="rounded-lg p-3 bg-white/5">
                  <p className="text-white/70 text-xs leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={onClose} className="cta-glass font-semibold px-6 py-2.5 rounded-full text-sm">Close</button>
            {!isAlreadyLearned && (
              <button
                onClick={() => learnSpeciesMutation.mutate(crab.id)}
                disabled={learnSpeciesMutation.isPending}
                className="cta-coral font-semibold px-6 py-2.5 rounded-full text-sm disabled:opacity-40"
              >
                {learnSpeciesMutation.isPending ? "Saving..." : "Cool! (+25 XP)"}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

