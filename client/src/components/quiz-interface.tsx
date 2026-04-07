import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Question {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  xpReward: number;
  questions: Question[];
}

interface QuizInterfaceProps {
  quiz: Quiz;
  onComplete: () => void;
}

export default function QuizInterface({ quiz, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = (user as any)?.id;

  const submitQuizMutation = useMutation({
    mutationFn: async (finalScore: number) => {
      if (!userId) throw new Error("Please sign in to save your quiz progress");
      const response = await apiRequest('/api/quiz-attempts', 'POST', {
        userId,
        quizId: quiz.id,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        xpEarned: Math.floor((finalScore / quiz.questions.length) * quiz.xpReward),
        completedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', userId] });
      toast({ title: "Quiz Complete! 🎉", description: `You earned ${Math.floor((score / quiz.questions.length) * quiz.xpReward)} XP!` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save quiz progress.", variant: "destructive" });
    },
  });

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      submitQuizMutation.mutate(score + (isCorrect ? 1 : 0));
    }
  };

  // ── Completed ──
  if (quizCompleted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="glass-card-lg p-10">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="font-fredoka text-white text-3xl mb-3">Quiz Complete!</h2>
          <p className="text-white/60 text-lg mb-6">You scored {score} out of {quiz.questions.length}</p>
          <div className="rounded-xl p-5 mb-8 bg-[#ff6b4a]/10 border border-[#ff6b4a]/20">
            <div className="text-2xl font-bold text-[#ff6b4a]">+{Math.floor((score / quiz.questions.length) * quiz.xpReward)} XP</div>
            <div className="text-[#ff6b4a]/60 text-sm">Earned!</div>
          </div>
          <button onClick={onComplete} className="cta-glass font-semibold px-8 py-3 rounded-full">
            Back to Quests
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz in progress ──
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="section-title text-2xl sm:text-3xl mb-2">⚔️ {quiz.title}</h2>
        <p className="section-subtitle">{quiz.description}</p>
      </div>

      <div className="glass-card-lg p-6 sm:p-8 mb-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm font-semibold">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ff6b4a]/15 text-[#ff6b4a]">⚡ +{quiz.xpReward} XP</span>
          </div>
          <div className="progress-track h-2.5">
            <div className="progress-fill h-2.5" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <h3 className="text-white text-xl font-bold mb-6">{currentQuestion.question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => setSelectedAnswer(option.id)}
              className={`w-full p-4 text-left rounded-xl transition-all ${
                selectedAnswer === option.id
                  ? "bg-[#ff6b4a]/15 border border-[#ff6b4a]/40"
                  : "bg-white/5 border border-white/5 hover:bg-white/8 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  selectedAnswer === option.id ? "bg-[#ff6b4a] text-white" : "bg-white/10 text-white/50"
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-white/90">{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="cta-coral font-fredoka px-10 py-3 rounded-full text-base disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        </div>
      </div>

      {/* Result dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-sm mx-4 bg-[#0a4d6e] border border-white/10 text-white">
          <div className="text-center p-4">
            <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😅'}</div>
            <h3 className="font-fredoka text-2xl mb-3">{isCorrect ? 'Correct!' : 'Not quite!'}</h3>
            <p className="text-white/60 text-sm mb-5">{currentQuestion.explanation}</p>
            {isCorrect && (
              <div className="rounded-xl p-3 mb-5 bg-[#ff6b4a]/10 border border-[#ff6b4a]/20">
                <div className="text-xl font-bold text-[#ff6b4a]">+{Math.floor(quiz.xpReward / quiz.questions.length)} XP</div>
              </div>
            )}
            <button onClick={handleNextQuestion} className="cta-coral font-semibold px-8 py-2.5 rounded-full text-sm">
              {currentQuestionIndex + 1 < quiz.questions.length ? 'Next Question →' : 'Complete Quiz 🎯'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
