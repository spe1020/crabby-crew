import { useState } from "react";
import { Link } from "wouter";
import QuizInterface from "@/components/quiz-interface";
import quizzesData from "@/data/quizzes.json";

export default function Quests() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  const handleStartQuest = (quizId: string) => {
    setActiveQuiz(quizId);
  };

  const handleCompleteQuiz = () => {
    setActiveQuiz(null);
  };

  if (activeQuiz) {
    const quiz = quizzesData.find(q => q.id === activeQuiz);
    if (quiz) {
      return <QuizInterface quiz={quiz} onComplete={handleCompleteQuiz} />;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-fredoka text-coral-600 mb-4">🎯 Crab Quest Challenges! 🎯</h2>
        <p className="text-xl text-gray-600">Test your crab knowledge and earn XP!</p>
      </div>

      {/* Available Quests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quizzesData.map((quiz) => {
          const colorMap = {
            1: { bg: "bg-gradient-to-br from-ocean-100 to-ocean-200", border: "border-ocean-300", text: "text-ocean-700", button: "bg-ocean-500 hover:bg-ocean-600", buttonText: "text-ocean-600 hover:bg-ocean-50" },
            2: { bg: "bg-gradient-to-br from-coral-100 to-coral-200", border: "border-coral-300", text: "text-coral-700", button: "bg-coral-500 hover:bg-coral-600", buttonText: "text-coral-600 hover:bg-coral-50" },
            3: { bg: "bg-gradient-to-br from-sunny-100 to-sunny-200", border: "border-sunny-300", text: "text-sunny-700", button: "bg-sunny-500 hover:bg-sunny-600", buttonText: "text-sunny-600 hover:bg-sunny-50" }
          };
          
          const colors = colorMap[quiz.difficulty as keyof typeof colorMap] || colorMap[1];
          
          return (
            <div key={quiz.id} className={`${colors.bg} rounded-3xl p-6 border-4 ${colors.border}`}>
              <div className="text-4xl mb-4">
                {quiz.id === 'crab-basics' && '🦀'}
                {quiz.id === 'ocean-explorer' && '🌊'}
                {quiz.id === 'crab-anatomy' && '🔬'}
              </div>
              <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>{quiz.title}</h3>
              <p className={`${colors.text} mb-4`}>{quiz.description}</p>
              <div className="flex items-center justify-between">
                <span className={`${colors.button} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                  +{quiz.xpReward} XP
                </span>
                <button 
                  onClick={() => handleStartQuest(quiz.id)}
                  className={`bg-white ${colors.buttonText} px-4 py-2 rounded-full font-semibold transition-colors`}
                >
                  Start Quest
                </button>
              </div>
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
    </div>
  );
}