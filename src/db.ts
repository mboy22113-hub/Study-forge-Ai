import { UserProfile, StudyPlan, Flashcard, Quiz, FocusSession, Achievement, CoachMessage } from './types';

// Pre-seeded Achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'streak_3', title: 'Consistent Mind', description: 'Maintain a 3-day study streak', xpReward: 500, category: 'streak', targetValue: 3, unlocked: true, unlockedAt: new Date().toISOString() },
  { id: 'streak_10', title: 'Scholar Ritual', description: 'Maintain a 10-day study streak', xpReward: 1000, category: 'streak', targetValue: 10, unlocked: true, unlockedAt: new Date().toISOString() },
  { id: 'focus_5', title: 'State of Flow', description: 'Complete 5 Pomodoro focus sessions', xpReward: 600, category: 'focus', targetValue: 5, unlocked: true, unlockedAt: new Date().toISOString() },
  { id: 'focus_10', title: 'Deep Work Master', description: 'Complete 10 Pomodoro focus sessions', xpReward: 1500, category: 'focus', targetValue: 10, unlocked: false },
  { id: 'quiz_3', title: 'Brain Gym', description: 'Complete 3 AI interactive quizzes with score > 80%', xpReward: 800, category: 'quiz', targetValue: 3, unlocked: false },
  { id: 'planner_1', title: 'Architect of Mind', description: 'Generate your first personalized AI study plan', xpReward: 400, category: 'planner', targetValue: 1, unlocked: true, unlockedAt: new Date().toISOString() }
];

// Pre-seeded Study Plans
const DEFAULT_PLANS: StudyPlan[] = [
  {
    id: 'advanced_physics',
    subject: 'Advanced Physics',
    targetDate: '2026-06-15',
    durationWeeks: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    progress: 45,
    milestones: [
      {
        id: 'phys_m1',
        title: 'Quantum Mechanics Fundamentals',
        description: 'Understand the blackbody radiation problem, photoelectric effect, and Bohr model of the atom.',
        completed: false,
        tasks: [
          { id: 'phys_m1_t1', title: 'Explain standard UV catastrophe', durationMinutes: 45, completed: true },
          { id: 'phys_m1_t2', title: 'Review photoelectric threshold formulation', durationMinutes: 30, completed: true },
          { id: 'phys_m1_t3', title: 'Derive Bohr atom energy stages', durationMinutes: 60, completed: true },
          { id: 'phys_m1_t4', title: 'Complete AI Practice Quiz on Blackbody Radiation', durationMinutes: 20, completed: false, aiSuggestedQuizId: 'blackbody_quiz' }
        ]
      },
      {
        id: 'phys_m2',
        title: 'Wave-Particle Duality Recap',
        description: 'Master de Broglie waves, double-slit patterns of electrons, and Heisenberg uncertainly mechanics.',
        completed: false,
        tasks: [
          { id: 'phys_m2_t1', title: 'Analyze de Broglie wavelength for matter waves', durationMinutes: 40, completed: true },
          { id: 'phys_m2_t2', title: 'Calculate electron dual-slit spacing parameters', durationMinutes: 50, completed: false },
          { id: 'phys_m2_t3', title: 'Derive position-momentum boundaries', durationMinutes: 45, completed: false }
        ]
      },
      {
        id: 'phys_m3',
        title: "Schrödinger's Equation Analysis",
        description: 'Apply step potentials, infinite deep wells, and standard particle wave function normalization.',
        completed: false,
        tasks: [
          { id: 'phys_m3_t1', title: 'Normalize 1D particle wave functions in an infinite well', durationMinutes: 60, completed: false },
          { id: 'phys_m3_t2', title: 'Simulate barriers transmission behaviors', durationMinutes: 50, completed: false }
        ]
      }
    ]
  }
];

// Pre-seeded Flashcards
const DEFAULT_FLASHCARDS: Flashcard[] = [
  { id: 'fc_1', subject: 'Advanced Physics', front: 'What is the photoelectric work function?', back: 'The minimum photon energy required to extract an electron from a solid into a vacuum state.', nextReviewDate: new Date().toISOString(), intervalDays: 1, easeFactor: 2.5 },
  { id: 'fc_2', subject: 'Advanced Physics', front: 'State Heisenbergs Uncertainty Relation', back: 'Δx * Δp >= h-bar / 2. Suggesting position and momentum cannot be simultaneously measured to high precision.', nextReviewDate: new Date().toISOString(), intervalDays: 1, easeFactor: 2.5 },
  { id: 'fc_3', subject: 'Advanced Physics', front: 'What is the normalization condition of wave functions?', back: 'The integral from minus infinity to plus infinity of |ψ(x)|² dx must equal 1 (representing a 100% chance the particle is somewhere in space).', nextReviewDate: new Date().toISOString(), intervalDays: 3, easeFactor: 2.6 }
];

// Pre-seeded Focus Sessions
const DEFAULT_FOCUS_SESSIONS: FocusSession[] = [
  { id: 'fs_1', durationMinutes: 25, type: 'pomodoro', completedAt: new Date(Date.now() - 3600000).toISOString(), xpAwarded: 150 },
  { id: 'fs_2', durationMinutes: 45, type: 'custom_deep', completedAt: new Date(Date.now() - 86400000).toISOString(), xpAwarded: 300 },
  { id: 'fs_3', durationMinutes: 25, type: 'pomodoro', completedAt: new Date(Date.now() - 86400000 * 2).toISOString(), xpAwarded: 150 }
];

// Pre-seeded Coach Messages
const DEFAULT_COACH_MESSAGES: CoachMessage[] = [
  { id: 'msg_1', sender: 'coach', text: "I've noticed you're styling and studying probability density functions. Should we generate a 5-minute deep-dive quiz?", timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
  { id: 'msg_2', sender: 'user', text: "Yes, please, focusing on the wave function normalization constant as well as de Broglie wavelengths.", timestamp: new Date(Date.now() - 60000 * 4).toISOString() },
  { id: 'msg_3', sender: 'coach', text: "Excellent choice! Normalizing particle wave functions is highly tested. I am ready to generate custom problem items for you. Click 'Generate Quiz' on your workspace when you are ready to forge!", timestamp: new Date(Date.now() - 60000 * 3).toISOString() }
];

const KEYS = {
  PROFILE: 'studyforge_userprofile',
  PLANS: 'studyforge_plans',
  FLASHCARDS: 'studyforge_flashcards',
  QUIZZES: 'studyforge_quizzes',
  FOCUS: 'studyforge_focussessions',
  ACHIEVEMENTS: 'studyforge_achievements',
  COACH: 'studyforge_coachmessages'
};

// Initialization helper
export function initDB() {
  if (!localStorage.getItem(KEYS.PROFILE)) {
    const defaultProfile: UserProfile = {
      name: 'Alex',
      xp: 12450,
      level: 24,
      streak: 14,
      lastActiveDate: new Date().toISOString().split('T')[0],
      isPro: false
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(defaultProfile));
    localStorage.setItem(KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(DEFAULT_FLASHCARDS));
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify([]));
    localStorage.setItem(KEYS.FOCUS, JSON.stringify(DEFAULT_FOCUS_SESSIONS));
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(DEFAULT_ACHIEVEMENTS));
    localStorage.setItem(KEYS.COACH, JSON.stringify(DEFAULT_COACH_MESSAGES));
  }
}

// Getters & Setters
export function getUserProfile(): UserProfile {
  initDB();
  const raw = localStorage.getItem(KEYS.PROFILE);
  return raw ? JSON.parse(raw) : { name: 'Alex', xp: 12450, level: 24, streak: 14, lastActiveDate: '', isPro: false };
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

// LEVEL CONVERSION FORMULA
// Level = floor(xp / 500) + 1
export function calculateLevel(xp: number): { level: number; nextLevelXP: number; previousLevelXP: number } {
  const level = Math.floor(xp / 500) + 1;
  const previousLevelXP = (level - 1) * 500;
  const nextLevelXP = level * 500;
  return { level, nextLevelXP, previousLevelXP };
}

export function addXP(amount: number): { newXP: number; levelUp: boolean } {
  const profile = getUserProfile();
  const oldLevel = profile.level;
  const newXP = profile.xp + amount;
  
  const { level: newLevel } = calculateLevel(newXP);
  const levelUp = newLevel > oldLevel;
  
  profile.xp = newXP;
  profile.level = newLevel;
  
  saveUserProfile(profile);
  return { newXP, levelUp };
}

export function updateStreak(): void {
  const profile = getUserProfile();
  const todayStr = new Date().toISOString().split('T')[0];
  if (!profile.lastActiveDate) {
    profile.streak = 1;
    profile.lastActiveDate = todayStr;
    saveUserProfile(profile);
    return;
  }

  const lastDate = new Date(profile.lastActiveDate);
  const todayDate = new Date(todayStr);
  const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    profile.streak += 1;
    profile.lastActiveDate = todayStr;
    saveUserProfile(profile);
  } else if (diffDays > 1) {
    profile.streak = 1; // streak broke
    profile.lastActiveDate = todayStr;
    saveUserProfile(profile);
  }
}

export function getPlans(): StudyPlan[] {
  initDB();
  const raw = localStorage.getItem(KEYS.PLANS);
  return raw ? JSON.parse(raw) : [];
}

export function savePlans(plans: StudyPlan[]): void {
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
}

export function addPlan(plan: StudyPlan): void {
  const plans = getPlans();
  plans.unshift(plan);
  savePlans(plans);
  addXP(400); // 400 XP rewarded for forged planner
  triggerAchievement('planner_1');
}

export function updatePlanProgress(planId: string): void {
  const plans = getPlans();
  const planIndex = plans.findIndex(p => p.id === planId);
  if (planIndex === -1) return;
  
  const plan = plans[planIndex];
  let totalTasks = 0;
  let completedTasks = 0;
  
  // Calculate milestone status and total tasks
  plan.milestones = plan.milestones.map(milestone => {
    const tasksCount = milestone.tasks.length;
    const completedCount = milestone.tasks.filter(t => t.completed).length;
    totalTasks += tasksCount;
    completedTasks += completedCount;
    
    // Auto-mark milestone completed if all tasks inside are completed
    return {
      ...milestone,
      completed: tasksCount > 0 && completedCount === tasksCount
    };
  });
  
  plan.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  plans[planIndex] = plan;
  savePlans(plans);
}

export function getFlashcards(): Flashcard[] {
  initDB();
  const raw = localStorage.getItem(KEYS.FLASHCARDS);
  return raw ? JSON.parse(raw) : [];
}

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
}

export function addFlashcard(card: Flashcard): void {
  const cards = getFlashcards();
  cards.push(card);
  saveFlashcards(cards);
}

export function scoreFlashcard(cardId: string, rating: number): void {
  // Simple SuperMemo interval algorithm simulation
  const cards = getFlashcards();
  const idx = cards.findIndex(c => c.id === cardId);
  if (idx === -1) return;
  
  const card = cards[idx];
  // Calculate new Ease Factor
  card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
  
  if (rating < 3) {
    card.intervalDays = 1; // Repeat soon
  } else {
    card.intervalDays = Math.ceil(card.intervalDays * card.easeFactor);
  }
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + card.intervalDays);
  card.nextReviewDate = nextDate.toISOString();
  
  cards[idx] = card;
  saveFlashcards(cards);
  addXP(25); // 25 XP awarded for flashcard answers
}

export function getQuizzes(): Quiz[] {
  initDB();
  const raw = localStorage.getItem(KEYS.QUIZZES);
  return raw ? JSON.parse(raw) : [];
}

export function addQuiz(quiz: Quiz): void {
  const quizzes = getQuizzes();
  quizzes.unshift(quiz);
  localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
}

export function completeQuiz(quizId: string, score: number): void {
  const quizzes = getQuizzes();
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  if (quizIndex !== -1) {
    quizzes[quizIndex].score = score;
    quizzes[quizIndex].completedAt = new Date().toISOString();
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
    
    // Award 250 XP for quizzes + additional accuracy modifier
    const xpEarned = 150 + Math.round(score * 2.5);
    addXP(xpEarned);
    
    if (score >= 80) {
      // track high performance
      const totalHighScores = quizzes.filter(q => q.score && q.score >= 80).length;
      if (totalHighScores >= 3) {
        triggerAchievement('quiz_3');
      }
    }
  }
}

export function getFocusSessions(): FocusSession[] {
  initDB();
  const raw = localStorage.getItem(KEYS.FOCUS);
  return raw ? JSON.parse(raw) : [];
}

export function addFocusSession(mins: number, type: FocusSession['type']): void {
  const sessions = getFocusSessions();
  const xpAwarded = mins * 6; // 6 XP per minute focused
  
  const session: FocusSession = {
    id: 'f_' + Math.random().toString(36).substr(2, 9),
    durationMinutes: mins,
    type,
    completedAt: new Date().toISOString(),
    xpAwarded
  };
  
  sessions.unshift(session);
  localStorage.setItem(KEYS.FOCUS, JSON.stringify(sessions));
  
  addXP(xpAwarded);
  
  // Update achievements
  const totalFocusSessions = sessions.filter(s => s.type === 'pomodoro' || s.type === 'custom_deep').length;
  if (totalFocusSessions >= 5) {
    triggerAchievement('focus_5');
  }
  if (totalFocusSessions >= 10) {
    triggerAchievement('focus_10');
  }
}

export function getAchievements(): Achievement[] {
  initDB();
  const raw = localStorage.getItem(KEYS.ACHIEVEMENTS);
  return raw ? JSON.parse(raw) : [];
}

export function triggerAchievement(achievementId: string): void {
  const list = getAchievements();
  const idx = list.findIndex(a => a.id === achievementId);
  if (idx === -1 || list[idx].unlocked) return;
  
  list[idx].unlocked = true;
  list[idx].unlockedAt = new Date().toISOString();
  localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(list));
  addXP(list[idx].xpReward);
}

export function getCoachMessages(): CoachMessage[] {
  initDB();
  const raw = localStorage.getItem(KEYS.COACH);
  return raw ? JSON.parse(raw) : [];
}

export function saveCoachMessages(msgs: CoachMessage[]): void {
  localStorage.setItem(KEYS.COACH, JSON.stringify(msgs));
}

export function clearAllLocalData(): void {
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.PLANS);
  localStorage.removeItem(KEYS.FLASHCARDS);
  localStorage.removeItem(KEYS.QUIZZES);
  localStorage.removeItem(KEYS.FOCUS);
  localStorage.removeItem(KEYS.ACHIEVEMENTS);
  localStorage.removeItem(KEYS.COACH);
  initDB();
}
