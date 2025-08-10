export interface GameState {
  totalXp: number;
  currentStreak: number;
  level: number;
  badges: string[];
  learnedSpecies: string[];
  completedQuizzes: string[];
}

export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 200) + 1;
}

export function getXpForNextLevel(currentLevel: number): number {
  return currentLevel * 200;
}

export function checkForNewBadges(gameState: GameState): string[] {
  const newBadges: string[] = [];
  
  // First Steps - Learn 5 species
  if (gameState.learnedSpecies.length >= 5 && !gameState.badges.includes('first-steps')) {
    newBadges.push('first-steps');
  }
  
  // Species Collector - Learn 10 species
  if (gameState.learnedSpecies.length >= 10 && !gameState.badges.includes('species-collector')) {
    newBadges.push('species-collector');
  }
  
  // Crab Expert - Earn 1000+ XP
  if (gameState.totalXp >= 1000 && !gameState.badges.includes('crab-expert')) {
    newBadges.push('crab-expert');
  }
  
  // Streak Master - 7 day streak
  if (gameState.currentStreak >= 7 && !gameState.badges.includes('streak-master')) {
    newBadges.push('streak-master');
  }
  
  // Level 5 Hero - Reach level 5
  if (gameState.level >= 5 && !gameState.badges.includes('level-5')) {
    newBadges.push('level-5');
  }
  
  return newBadges;
}

export function updateStreak(lastActivityDate: string | null): number {
  const today = new Date().toISOString().split('T')[0];
  
  if (!lastActivityDate) {
    return 1; // First day
  }
  
  if (lastActivityDate === today) {
    return 0; // Already active today, no change
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (lastActivityDate === yesterdayStr) {
    return 1; // Consecutive day, increment streak
  }
  
  return -1; // Reset streak
}

export function getAdaptiveDifficulty(
  correctAnswers: number, 
  totalAnswers: number, 
  currentDifficulty: number
): number {
  if (totalAnswers < 5) {
    return currentDifficulty; // Need more data
  }
  
  const accuracy = correctAnswers / totalAnswers;
  
  if (accuracy >= 0.8 && currentDifficulty < 3) {
    return currentDifficulty + 1; // Increase difficulty
  }
  
  if (accuracy < 0.5 && currentDifficulty > 1) {
    return currentDifficulty - 1; // Decrease difficulty
  }
  
  return currentDifficulty;
}
