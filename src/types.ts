export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  isPro: boolean;
}

export interface StudyPlan {
  id: string;
  subject: string;
  targetDate: string;
  durationWeeks: number;
  createdAt: string;
  milestones: StudyMilestone[];
  progress: number; // 0 to 100
}

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  tasks: StudyTask[];
}

export interface StudyTask {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  aiSuggestedQuizId?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  nextReviewDate: string; // ISO string
  intervalDays: number; // For spaced repetition
  easeFactor: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  type: 'pomodoro' | 'short_break' | 'long_break' | 'custom_deep';
  completedAt: string;
  xpAwarded: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  category: 'focus' | 'quiz' | 'planner' | 'streak' | 'general';
  targetValue: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string; // ISO string
}
