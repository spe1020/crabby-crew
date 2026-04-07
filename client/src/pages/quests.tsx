import { useState } from "react";
import { Link } from "wouter";
import QuizInterface from "@/components/quiz-interface";
import quizzesData from "@/data/quizzes.json";

const themeColors: Record<number, { glow: string; border: string }> = {
  1: { glow: "rgba(126,200,200,0.3)", border: "rgba(126,200,200,0.5)" },
  2: { glow: "rgba(255,107,74,0.3)", border: "rgba(255,107,74,0.5)" },
  3: { glow: "rgba(245,230,200,0.35)", border: "rgba(245,230,200,0.5)" },
};

export default function Quests() {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  if (activeQuiz) {
    const quiz = quizzesData.find(q => q.id === activeQuiz);
    if (quiz) {
      return <QuizInterface quiz={quiz} onComplete={() => setActiveQuiz(null)} />;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="section-title text-3xl sm:text-4xl mb-3">⚔️ Crab Quest Challenges!</h2>
        <p className="section-subtitle text-lg">Test your crab knowledge and earn XP!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quizzesData.map((quiz) => {
          const theme = themeColors[quiz.difficulty] || themeColors[1];
          const emoji = quiz.id === 'crab-basics' ? '🦀' : quiz.id === 'ocean-explorer' ? '🌊' : '🔬';

          return (
            <div
              key={quiz.id}
              className="glass-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]"
              style={{ ["--glow" as any]: theme.glow, ["--bdr" as any]: theme.border }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${theme.glow}`;
                (e.currentTarget as HTMLElement).style.borderColor = theme.border;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "";
                (e.currentTarget as HTMLElement).style.borderColor = "";
              }}
              onClick={() => setActiveQuiz(quiz.id)}
            >
              <div className="text-4xl mb-3">{emoji}</div>
              <h3 className="font-fredoka text-white text-lg mb-1">{quiz.title}</h3>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">{quiz.description}</p>
              <div className="flex items-center justify-between">
                <span className="cta-coral text-xs font-semibold px-3 py-1 rounded-full">
                  +{quiz.xpReward} XP
                </span>
                <span className="text-white/60 text-sm font-semibold">Start &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link href="/">
          <button className="cta-glass font-semibold px-8 py-3 rounded-full">
            🏠 Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
