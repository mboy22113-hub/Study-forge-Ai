export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  coins: number;
  streak: number; // study streak
  lastActiveDate: string; // YYYY-MM-DD
  isPro: boolean;
}

export interface AcademicSubject {
  id: string;
  title: string;
  level: 'High School' | 'Undergraduate' | 'Postgraduate' | 'Ph.D. Scholar';
  difficulty: 'Hard' | 'Medium' | 'Easy';
  chapters: string[];
  remainingLessons: number;
  importantTopics: string[];
  previousMarks: number;
  confidenceLevel: number; // 0 to 100
  dailyStudyHours: number;
  examDate?: string;
  syllabusCompletionPercent: number; // 0 to 100
}

export interface StudyPlan {
  id: string;
  subject: string;
  level: string;
  overview: string;
  proTip: string;
  milestones: StudyMilestone[];
  createdAt: string;
  progress: number; // 0 to 100
  assessmentData?: any;
  assessmentResult?: {
    daysRemaining: number;
    completionPercent: number;
    difficultyScore: number;
    weaknessScore: number;
    confidenceScore: number;
    revisionRequirement: string;
    readinessScore: number;
    riskScore: string;
    dailyStudyPlan: string;
    weeklyStudyPlan: string;
    monthlyStudyPlan: string;
    revisionSchedule: string;
    examCrisisPlan: string;
    priorityTopics: string[];
    aiRecommendations: string[];
  };
}

export interface StudyMilestone {
  week: string;
  title: string;
  topics: string[];
  estimatedHours: number;
  quizAvailable: boolean;
  completed?: boolean;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
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
  category: 'focus' | 'quiz' | 'planner' | 'streak' | 'general' | 'prayer' | 'wakeup';
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

export interface PdfFile {
  id: string;
  subjectId: string;
  name: string;
  uploadDate: string;
  totalPages: number;
  currentPage: number;
  readingTime: number; // minutes
  lastOpened?: string;
  dataUrl?: string; // base64 or inline data
}

export interface GalleryImage {
  id: string;
  subjectId: string;
  chapter: string;
  title: string;
  dataUrl: string; // base64
  uploadDate: string;
}

export interface PrayerDay {
  date: string; // YYYY-MM-DD
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export interface WakeUpLog {
  date: string; // YYYY-MM-DD
  wakeTime: string; // HH:MM
  sleepTime: string; // HH:MM
  isEarlyWakeUp: boolean;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  xpReward: number;
}

export interface UserNote {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface Quest {
  id: string;
  title: string;
  type: 'daily' | 'weekly';
  completed: boolean;
  xpReward: number;
  coinsReward: number;
  targetType: 'study_session' | 'prayer_check' | 'quiz_completion' | 'pdf_read' | 'early_wakeup';
  currentValue: number;
  targetValue: number;
}
