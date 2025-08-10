import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      if (!userId) {
        throw new Error("Please sign in to save your quiz progress");
      }
      const response = await apiRequest('/api/quiz-attempts', 'POST', {
        userId: userId,
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
      toast({
        title: "Quiz Complete! 🎉",
        description: `You earned ${Math.floor((score / quiz.questions.length) * quiz.xpReward)} XP!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      submitQuizMutation.mutate(score + (isCorrect ? 1 : 0));
    }
  };

  const handleCompleteQuiz = () => {
    onComplete();
  };

  if (quizCompleted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center p-12">
          <CardContent>
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-4xl font-fredoka text-ocean-600 mb-4">Quiz Complete!</h2>
            <p className="text-2xl text-gray-600 mb-6">
              You scored {score} out of {quiz.questions.length}
            </p>
            <div className="bg-sunny-100 p-6 rounded-2xl mb-8 max-w-md mx-auto">
              <div className="text-3xl font-bold text-sunny-700">
                +{Math.floor((score / quiz.questions.length) * quiz.xpReward)} XP
              </div>
              <div className="text-sunny-600">XP Earned!</div>
            </div>
            <Button 
              onClick={handleCompleteQuiz}
              className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-4 text-xl"
            >
              Back to Quests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-coral-600 mb-4">🎯 {quiz.title} 🎯</h2>
        <p className="text-xl text-gray-600">{quiz.description}</p>
      </div>

      <Card className="p-8 mb-8">
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <div className="bg-sunny-100 px-4 py-2 rounded-full">
                <span className="text-sunny-700 font-semibold">⚡ +{quiz.xpReward} XP</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-coral-400 to-coral-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question}</h3>
            
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  className={`w-full p-4 text-left border-2 rounded-2xl transition-all duration-200 ${
                    selectedAnswer === option.id
                      ? 'bg-ocean-100 border-ocean-400'
                      : 'bg-gray-50 hover:bg-ocean-50 border-gray-200 hover:border-ocean-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedAnswer === option.id ? 'bg-ocean-400 text-white' : 'bg-gray-200'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-coral-500 hover:bg-coral-600 text-white px-12 py-4 text-xl font-bold disabled:opacity-50"
            >
              🚀 Submit Answer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-md mx-4">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">{isCorrect ? '🎉' : '😅'}</div>
            <h3 className="text-3xl font-bold mb-4">
              {isCorrect ? 'Correct!' : 'Not quite right!'}
            </h3>
            <p className="text-lg text-gray-600 mb-6">{currentQuestion.explanation}</p>
            {isCorrect && (
              <div className="bg-sunny-100 p-4 rounded-2xl mb-6">
                <div className="text-2xl font-bold text-sunny-700">+{Math.floor(quiz.xpReward / quiz.questions.length)} XP</div>
                <div className="text-sm text-sunny-600">XP Earned!</div>
              </div>
            )}
            <Button
              onClick={handleNextQuestion}
              className="bg-ocean-500 hover:bg-ocean-600 text-white px-8 py-3 font-bold"
            >
              {currentQuestionIndex + 1 < quiz.questions.length ? 'Next Question →' : 'Complete Quiz 🎯'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}