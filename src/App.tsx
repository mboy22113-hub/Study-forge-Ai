/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles, BookOpen, Compass, Zap, Clock, BarChart2, Trophy, Settings as SettingsIcon,
  Play, Pause, RotateCcw, Flame, Volume2, VolumeX, Plus, CheckCircle, HelpCircle, User,
  LogOut, Send, Loader2, Award, Calendar, X, TrendingUp, ChevronRight, RefreshCw,
  Download, Upload, AlertCircle, Bell, PenTool, Check, FileText, Image as ImageIcon,
  FlameKindling, Coins, AlertOctagon, Heart, Save, Book, CheckSquare, Trash, Cloud
} from "lucide-react";

import { 
  UserProfile, AcademicSubject, StudyPlan, StudyMilestone, Flashcard,
  QuizQuestion, Quiz, FocusSession, Achievement, CoachMessage,
  PdfFile, GalleryImage, PrayerDay, WakeUpLog, Goal, UserNote, Quest
} from "./types";

// Import custom submodules
import Sidebar from "./components/Sidebar";
import SplashAndLoading from "./components/SplashAndLoading";
import { motion, AnimatePresence } from "motion/react";

// Performance-Optimized Lazy Loaded Sub-Components (Code Splitting and Progressive Hydration)
const PrayerHub = React.lazy(() => import("./components/PrayerHub"));
const WakeUpHub = React.lazy(() => import("./components/WakeUpHub"));
const PdfVault = React.lazy(() => import("./components/PdfVault"));
const TopicGallery = React.lazy(() => import("./components/TopicGallery"));
const SmartPriority = React.lazy(() => import("./components/SmartPriority"));
const DopamineCentrals = React.lazy(() => import("./components/DopamineCentrals"));
const AnalyticsPanel = React.lazy(() => import("./components/AnalyticsPanel"));
const SmartPlanner = React.lazy(() => import("./components/SmartPlanner"));
const AICoach = React.lazy(() => import("./components/AICoach"));

// Web Audio synthesizer for ambient neuro-focus beats
class AmbientSynth {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;

  start(type: string) {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      this.stop();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      if (type === "sine") {
        // Binaural Beats: Alpha waves (200Hz and 210Hz)
        this.osc1 = this.ctx.createOscillator();
        this.osc1.type = "sine";
        this.osc1.frequency.setValueAtTime(200, this.ctx.currentTime);

        this.osc2 = this.ctx.createOscillator();
        this.osc2.type = "sine";
        this.osc2.frequency.setValueAtTime(210, this.ctx.currentTime);

        this.osc1.connect(this.filter);
        this.osc2.connect(this.filter);
        this.osc1.start();
        this.osc2.start();
      } else if (type === "theta") {
        // Binaural Beats: Deep Meditation Theta waves (150Hz and 156Hz)
        this.osc1 = this.ctx.createOscillator();
        this.osc1.type = "sine";
        this.osc1.frequency.setValueAtTime(150, this.ctx.currentTime);

        this.osc2 = this.ctx.createOscillator();
        this.osc2.type = "sine";
        this.osc2.frequency.setValueAtTime(156, this.ctx.currentTime);

        this.osc1.connect(this.filter);
        this.osc2.connect(this.filter);
        this.osc1.start();
        this.osc2.start();
      } else if (type === "lofi") {
        // Deep Warm chord pad simulator
        this.osc1 = this.ctx.createOscillator();
        this.osc1.type = "triangle";
        this.osc1.frequency.setValueAtTime(110, this.ctx.currentTime);

        this.osc2 = this.ctx.createOscillator();
        this.osc2.type = "sawtooth";
        this.osc2.frequency.setValueAtTime(165, this.ctx.currentTime);

        this.filter.frequency.setValueAtTime(220, this.ctx.currentTime);

        this.osc1.connect(this.filter);
        this.osc2.connect(this.filter);
        this.osc1.start();
        this.osc2.start();
      }
    } catch (e) {
      console.warn("Audio Context init blocked or not supported:", e);
    }
  }

  stop() {
    try {
      this.osc1?.stop();
      this.osc2?.stop();
    } catch (e) {}
    this.osc1 = null;
    this.osc2 = null;
    this.filter = null;
    this.gainNode = null;
  }
}

const synthInstance = new AmbientSynth();

// In-App Notification triggers
const notify = (title: string, message: string) => {
  const isEnabled = typeof window !== "undefined" ? localStorage.getItem("sf_notifications_enabled") !== "false" : true;
  if (isEnabled && typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  }
};

// Helper function to render markdown generated by Gemini Coach
const renderMarkdownContent = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-xs text-slate-300 font-medium">
      {lines.map((line, idx) => {
        const cleaned = line.trim();
        if (!cleaned) return <div key={idx} className="h-2"></div>;
        
        // Check if heading or bullet
        const isBullet = cleaned.startsWith("*") || cleaned.startsWith("-");
        const cleanText = cleaned.replace(/^[\*\-]\s*/, "");
        
        // Parse bold tags **
        const parts = cleanText.split("**");
        const formatted = parts.map((part, i) => i % 2 !== 0 ? <strong key={i} className="text-white font-black">{part}</strong> : part);
        
        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-purple-400 mt-1.5 shrink-0 block w-1 h-1 rounded-full bg-purple-500"></span>
              <p className="flex-1 text-slate-300 leading-relaxed">{formatted}</p>
            </div>
          );
        } else if (cleaned.startsWith("###")) {
          return <h4 key={idx} className="text-xs font-black text-purple-400 mt-4 first:mt-0 uppercase tracking-wider">{formatted}</h4>;
        } else if (cleaned.startsWith("##")) {
          return <h3 key={idx} className="text-sm font-black text-white mt-4 first:mt-0 uppercase tracking-wide">{formatted}</h3>;
        } else {
          return <p key={idx} className="leading-relaxed pl-1" style={{ textIndent: cleaned.startsWith("1.") || cleaned.startsWith("2.") ? "0px" : "4px" }}>{formatted}</p>;
        }
      })}
    </div>
  );
};

// Framer Motion entrance & stagger animation variants
const appContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
};

const appItemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut" }
  }
};

export default function App() {
  // --- Persistent User Profile state ---
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const loadedRecently = sessionStorage.getItem("sf_loaded_recently");
      if (loadedRecently === "true") {
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    if (isInitialLoading) {
      sessionStorage.setItem("sf_loaded_recently", "true");
    }
  }, [isInitialLoading]);

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("sf_xp");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("sf_coins");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("sf_streak");
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // --- Active Days Record for Streak Math ---
  const [activeDates, setActiveDates] = useState<string[]>(() => {
    const saved = localStorage.getItem("sf_active_dates");
    return saved ? JSON.parse(saved) : [];
  });

  const getActivityStreak = (datesArray: string[]): number => {
    if (!datesArray || datesArray.length === 0) return 0;
    
    // De-duplicate, filter falsy, sort newest first
    const unique = Array.from(new Set(datesArray))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
      
    if (unique.length === 0) return 0;
    
    const today = new Date();
    const formatLocalDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayStr = formatLocalDate(today);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);
    
    const newest = unique[0];
    if (newest !== todayStr && newest !== yesterdayStr) {
      return 0; // broken streak
    }
    
    let currentCount = 1;
    let cursor = new Date(newest + "T12:00:00");
    
    // We check backwards chronologically
    for (let i = 1; i < 365; i++) {
      cursor.setDate(cursor.getDate() - 1);
      const prevDateStr = formatLocalDate(cursor);
      if (unique.includes(prevDateStr)) {
        currentCount++;
      } else {
        break;
      }
    }
    
    return currentCount;
  };

  const logActivityToday = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    setActiveDates((prev) => {
      if (prev.includes(todayStr)) return prev;
      const next = [...prev, todayStr];
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem("sf_active_dates", JSON.stringify(activeDates));
    const computed = getActivityStreak(activeDates);
    setStreak(computed);
  }, [activeDates]);
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem("sf_username");
    return saved || "Alex Mercer";
  });
  const [tempName, setTempName] = useState(() => {
    const savedName = localStorage.getItem("sf_username");
    return savedName || "";
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState(() => {
    const savedOnboarded = localStorage.getItem("sf_onboarded");
    return savedOnboarded !== "true" || !localStorage.getItem("sf_username");
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("sf_notifications_enabled");
    return saved === null ? true : saved === "true";
  });
  const [targetHours, setTargetHours] = useState(() => {
    const saved = localStorage.getItem("sf_target_hours");
    return saved ? parseInt(saved, 10) : 4;
  });

  // Current main view tab
  const [currentTab, setCurrentTab] = useState<
    "landing" | "dashboard" | "planner" | "coach" | "subjects" | "pdf_vault" | 
    "topic_gallery" | "notes" | "focus" | "revision" | "analytics" | 
    "streaks_display" | "achievements" | "prayer" | "wakeup" | "goals" | 
    "notifications_tab" | "backup" | "settings"
  >("landing");

  // --- Study Plans database ---
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem("sf_plans_v2");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Academic subjects database ---
  const [subjects, setSubjects] = useState<AcademicSubject[]>(() => {
    const saved = localStorage.getItem("sf_subjects");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Flashcards spaced recall ---
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("sf_flashcards");
    return saved ? JSON.parse(saved) : [];
  });

  // --- PDF Archive Vault list ---
  const [pdfs, setPdfs] = useState<PdfFile[]>(() => {
    const saved = localStorage.getItem("sf_pdfs");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Topic Galleries ---
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem("sf_gallery_images");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Spiritual checklists ---
  const [prayerDays, setPrayerDays] = useState<PrayerDay[]>(() => {
    const saved = localStorage.getItem("sf_prayer_days");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Sleep wake up stats ---
  const [wakeUpLogs, setWakeUpLogs] = useState<WakeUpLog[]>(() => {
    const saved = localStorage.getItem("sf_wakeup_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Academic Goals ---
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("sf_goals");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Subject Notes ---
  const [userNotes, setUserNotes] = useState<UserNote[]>(() => {
    const saved = localStorage.getItem("sf_user_notes");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Daily Quests tracker ---
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("sf_quests");
    return saved ? JSON.parse(saved) : [
      { id: "q1", title: "Complete focus session", type: "daily", completed: false, xpReward: 100, coinsReward: 50, targetType: "study_session", currentValue: 0, targetValue: 1 },
      { id: "q2", title: "Log spirituality check", type: "daily", completed: false, xpReward: 80, coinsReward: 40, targetType: "prayer_check", currentValue: 0, targetValue: 1 },
      { id: "q3", title: "Complete study quiz", type: "daily", completed: false, xpReward: 150, coinsReward: 75, targetType: "quiz_completion", currentValue: 0, targetValue: 1 }
    ];
  });

  // --- Achievements Registry ---
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem("sf_achievements_v2");
    return saved ? JSON.parse(saved) : [
      { id: 'streak_3', title: 'Consistent Mind', description: 'Maintain a 3-day study streak', xpReward: 500, category: 'streak', targetValue: 3, unlocked: false },
      { id: 'streak_10', title: 'Scholar Ritual', description: 'Maintain a 10-day study streak', xpReward: 1000, category: 'streak', targetValue: 10, unlocked: false },
      { id: 'focus_5', title: 'State of Flow', description: 'Complete 5 Pomodoro focus sessions', xpReward: 600, category: 'focus', targetValue: 5, unlocked: false },
      { id: 'focus_10', title: 'Deep Work Master', description: 'Complete 10 focus sessions', xpReward: 1500, category: 'focus', targetValue: 10, unlocked: false }
    ];
  });

  // Notifications alerts
  const [notificationsAlerts, setNotificationsAlerts] = useState<Array<{ id: string; title: string; body: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem("sf_notifications_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const triggerNotification = (title: string, message: string) => {
    // 1. Browser Native
    const isEnabled = notificationsEnabled;
    if (isEnabled && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, { body: message });
        } catch (e) {
          console.warn("Could not dispatch native notification:", e);
        }
      }
    }
    
    // 2. Local State List (Persisted)
    const newAlert = {
      id: `alert-${Date.now()}`,
      title,
      body: message,
      date: new Date().toLocaleTimeString() + " - " + new Date().toLocaleDateString()
    };
    setNotificationsAlerts(prev => {
      const updated = [newAlert, ...prev];
      localStorage.setItem("sf_notifications_alerts", JSON.stringify(updated));
      return updated;
    });

    // 3. User Toast Alert so they visually see it in-app
    showToast(`🔔 ${title}: ${message}`);
  };

  // Toast alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [xpAddedIndicator, setXpAddedIndicator] = useState<{ amount: number; id: number } | null>(null);

  // Focus Timer parameters
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<"work" | "break">("work");
  const [ambientTheme, setAmbientTheme] = useState<"none" | "sine" | "theta" | "lofi">("none");
  const [strictFocusMode, setStrictFocusMode] = useState(false);
  const [focusLogs, setFocusLogs] = useState<{ day: string; minutes: number }[]>(() => {
    const saved = localStorage.getItem("sf_focus_logs");
    return saved ? JSON.parse(saved) : [
      { day: "Mon", minutes: 0 }, { day: "Tue", minutes: 0 }, { day: "Wed", minutes: 0 },
      { day: "Thu", minutes: 0 }, { day: "Fri", minutes: 0 }, { day: "Sat", minutes: 0 }, { day: "Sun", minutes: 0 }
    ];
  });

  // AI generator inputs
  const [plannerSubject, setPlannerSubject] = useState("");
  const [plannerLevel, setPlannerLevel] = useState("Undergraduate");
  const [plannerFocus, setPlannerFocus] = useState("");
  const [plannerDuration, setPlannerDuration] = useState(4);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // AI Chat parameters
  const [currentChatSubject, setCurrentChatSubject] = useState("General Study");
  const [customSubjectText, setCustomSubjectText] = useState("");
  const [chatMode, setChatMode] = useState<"quick" | "detailed" | "teacher" | "quiz" | "flashcard" | "exam" | "motivation">("detailed");
  const [chatError, setChatError] = useState<string | null>(null);
  const [coachInputs, setCoachInputs] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    { role: "model", content: "Hello! I am your StudyForge AI Coach, your personal academic assistant and mentor. How can I help you master your studies today? You can select any subject, change study modes (like Quiz, Flashcards, or Teacher Mode), or choose a quick action helper below!" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Quizzing parameters
  const [activeQuizTopic, setActiveQuizTopic] = useState("Hilbert Spaces");
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 1,
      question: "Which matrix represents standard operator values projection in Dirac mathematics?",
      options: ["Diagonal values projections", "Hilbert identities", "Hermitian conjugates", "Identity matrices"],
      correctAnswerIndex: 2,
      explanation: "Hermitian conjugates map matching vector states under standard inner product laws."
    }
  ]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Manual inputs for note scratches
  const [scratchSubjectId, setScratchSubjectId] = useState("");
  const [scratchTitle, setScratchTitle] = useState("");
  const [scratchBody, setScratchBody] = useState("");

  // Goal input scratches
  const [goalTitleInput, setGoalTitleInput] = useState("");
  const [goalDateInput, setGoalDateInput] = useState("2026-06-15");

  // Sync databases locally
  useEffect(() => { localStorage.setItem("sf_xp", xp.toString()); }, [xp]);
  useEffect(() => { localStorage.setItem("sf_coins", coins.toString()); }, [coins]);
  useEffect(() => { localStorage.setItem("sf_streak", streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem("sf_username", userName); }, [userName]);
  useEffect(() => { localStorage.setItem("sf_notifications_enabled", notificationsEnabled.toString()); }, [notificationsEnabled]);
  useEffect(() => { localStorage.setItem("sf_target_hours", targetHours.toString()); }, [targetHours]);
  useEffect(() => { localStorage.setItem("sf_plans_v2", JSON.stringify(studyPlans)); }, [studyPlans]);
  useEffect(() => { localStorage.setItem("sf_subjects", JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem("sf_flashcards", JSON.stringify(flashcards)); }, [flashcards]);
  useEffect(() => { localStorage.setItem("sf_pdfs", JSON.stringify(pdfs)); }, [pdfs]);
  useEffect(() => { localStorage.setItem("sf_gallery_images", JSON.stringify(galleryImages)); }, [galleryImages]);
  useEffect(() => { localStorage.setItem("sf_prayer_days", JSON.stringify(prayerDays)); }, [prayerDays]);
  useEffect(() => { localStorage.setItem("sf_wakeup_logs", JSON.stringify(wakeUpLogs)); }, [wakeUpLogs]);
  useEffect(() => { localStorage.setItem("sf_user_notes", JSON.stringify(userNotes)); }, [userNotes]);
  useEffect(() => { localStorage.setItem("sf_goals", JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem("sf_quests", JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem("sf_achievements_v2", JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem("sf_focus_logs", JSON.stringify(focusLogs)); }, [focusLogs]);

  // Dynamic SEO Optimization for Unique Page Titles and Descriptions
  useEffect(() => {
    const seoMap: Record<string, { title: string; desc: string }> = {
      landing: {
        title: "StudyForge AI - Smart Study Planner for Students",
        desc: "AI-powered study planner, timetable generator, revision tracker, quiz creator, and exam preparation assistant for students."
      },
      dashboard: {
        title: "Student Core Dashboard | StudyForge AI",
        desc: "Track active study schedules, daily XP levels, overlap protection for prayers or meals, and daily cognitive metrics."
      },
      planner: {
        title: "Interactive Smart Study Planner | StudyForge AI",
        desc: "Register subjects, calculate urgency scores, log remaining chapters, and structure personalized scholastic timelines automatically."
      },
      coach: {
        title: "AI Cognitive Study Coach | StudyForge AI",
        desc: "Consult with our high-performance generative AI academic mentor. Generate quizzes, summarize syllabus text, or secure custom revision loops."
      },
      pdf_vault: {
        title: "Interactive Student PDF Document Vault | StudyForge AI",
        desc: "Upload or read your mock sheets, textbooks, or learning syllabi with inline focus tools and dynamic target chapter bindings."
      },
      topic_gallery: {
        title: "Visual Topic Gallery & Deck | StudyForge AI",
        desc: "Transform standard textual concepts into elegant visual illustrations, catalog complex chapters, and study with rich picture grids."
      },
      notes: {
        title: "AI Active Recall Flashcards & Notes | StudyForge AI",
        desc: "Create modular flashcards, summarize syllabus lectures with AI, and master topics through optimized study decks."
      },
      focus: {
        title: "Deep Work Focus Timer & Clock | StudyForge AI",
        desc: "Activate a modern, distraction-shielded academic timer with custom ambiance controls, and unlock academic achievements."
      },
      revision: {
        title: "Spaced Recall Revision Tracker | StudyForge AI",
        desc: "Keep revision sessions synced optimally with natural biological memory decay patterns to retain critical study chapters."
      },
      analytics: {
        title: "Academic Analytics & Diagnostic Panel | StudyForge AI",
        desc: "Inspect historical study metrics, log mock paper targets, and preview syllabus completion rates inside StudyForge."
      },
      notifications_tab: {
        title: "Smart Study Notifications Center | StudyForge AI",
        desc: "Manage automated study focus nudges, scheduled alerts, browser ticks, and custom desktop push dispatch triggers."
      }
    };

    const currentSeo = seoMap[currentTab] || {
      title: "StudyForge AI - Smart Study Planner for Students",
      desc: "AI-powered study planner, timetable generator, revision tracker, quiz creator, and exam preparation assistant for students."
    };

    // Update document title
    document.title = currentSeo.title;

    // Update description meta tag
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", currentSeo.desc);
    }

    // Update Open Graph tags dynamically for seamless sharing
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", currentSeo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", currentSeo.desc);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", currentSeo.title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", currentSeo.desc);

  }, [currentTab]);

  // Clock mechanics
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (focusSeconds > 0) {
          setFocusSeconds((prev) => prev - 1);
        } else if (focusMinutes > 0) {
          setFocusMinutes((prev) => prev - 1);
          setFocusSeconds(59);
        } else {
          triggerTimerFinish();
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, focusMinutes, focusSeconds]);

  // Ambient sound setup
  useEffect(() => {
    if (ambientTheme !== "none") {
      synthInstance.start(ambientTheme);
    } else {
      synthInstance.stop();
    }
    return () => { synthInstance.stop(); };
  }, [ambientTheme]);

  const awardXp = (amount: number) => {
    setXp((prev) => prev + amount);
    setXpAddedIndicator({ amount, id: Date.now() });
    setTimeout(() => setXpAddedIndicator(null), 2500);
  };

  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const triggerTimerFinish = () => {
    setIsTimerRunning(false);
    if (timerType === "work") {
      showToast("🏆 Deep study wave concluded! Awesome focus! +150 XP");
      awardXp(150);
      addCoins(25);
      logActivityToday();
      triggerNotification("Focus wave complete!", "Ready for a refreshing break scholar?");
      
      // Update quests currentValue
      setQuests(prev => prev.map(q => q.targetType === 'study_session' ? { ...q, currentValue: Math.min(q.currentValue + 1, q.targetValue) } : q));

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = days[new Date().getDay()];
      setFocusLogs((prev) =>
        prev.map((log) => (log.day === currentDay ? { ...log, minutes: log.minutes + 25 } : log))
      );

      setTimerType("break");
      setFocusMinutes(5);
    } else {
      showToast("☀️ Break expired. Re-energize active study focus blocks!");
      setTimerType("work");
      setFocusMinutes(25);
    }
  };

  // --- Student Assessment States ---
  const [assessmentStep, setAssessmentStep] = useState(1);
  const [showNewAssessment, setShowNewAssessment] = useState(() => {
    const saved = localStorage.getItem("sf_plans_v2");
    return !saved || JSON.parse(saved).length === 0;
  });
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<StudyPlan | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<
    "dailyPlan" | "weeklyPlan" | "monthlyPlan" | "revisionSchedule" | "examCrisis" | "priorityTopics" | "aiRecommendations"
  >("dailyPlan");

  const [subjectsList, setSubjectsList] = useState<any[]>(() => {
    const saved = localStorage.getItem("sf_planner_subjects");
    return saved ? JSON.parse(saved) : [
      {
        name: "Mathematics",
        examDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        totalChapters: 12,
        completedChapters: 4,
        importantChapters: "Algebra, Integration Foundations",
        difficultyLevel: "Hard",
        confidenceLevel: 4,
        previousMarks: 65,
        desiredDailyHours: 3,
        notes: "Focus heavily on practicing integration rules."
      },
      {
        name: "Chemistry",
        examDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        totalChapters: 10,
        completedChapters: 6,
        importantChapters: "Organic chemistry equations, Periodic table properties",
        difficultyLevel: "Medium",
        confidenceLevel: 7,
        previousMarks: 82,
        desiredDailyHours: 2,
        notes: "Memorize nomenclature schemas."
      }
    ];
  });

  // Derived unified subjects list to feed into PDF vault, gallery, analytics etc.
  const unifiedSubjects = useMemo(() => {
    const list: AcademicSubject[] = [];
    const seenNames = new Set<string>();

    // 1. Add academic subjects from subjects database
    (subjects || []).forEach((s) => {
      if (s && s.title) {
        list.push(s);
        seenNames.add(s.title.toLowerCase().trim());
      }
    });

    // 2. Add subjects from planner subjectsList
    (subjectsList || []).forEach((s) => {
      if (s && s.name) {
        const name = s.name.trim();
        const lowerName = name.toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          const tot = s.totalChapters === "" || s.totalChapters === undefined || isNaN(Number(s.totalChapters)) ? 8 : Number(s.totalChapters);
          const comp = s.completedChapters === "" || s.completedChapters === undefined || isNaN(Number(s.completedChapters)) ? 0 : Number(s.completedChapters);
          list.push({
            id: `pl-${encodeURIComponent(name)}`,
            title: name,
            level: 'Undergraduate',
            difficulty: s.difficultyLevel || 'Medium',
            chapters: [],
            remainingLessons: Math.max(0, tot - comp),
            importantTopics: s.importantChapters ? String(s.importantChapters).split(",").map((x) => x.trim()) : [],
            previousMarks: s.previousMarks === "" || s.previousMarks === undefined || isNaN(Number(s.previousMarks)) ? 70 : Number(s.previousMarks),
            confidenceLevel: (s.confidenceLevel === "" || s.confidenceLevel === undefined || isNaN(Number(s.confidenceLevel)) ? 5 : Number(s.confidenceLevel)) * 10,
            dailyStudyHours: s.desiredDailyHours === "" || s.desiredDailyHours === undefined || isNaN(Number(s.desiredDailyHours)) ? 2 : Number(s.desiredDailyHours),
            examDate: s.examDate,
            syllabusCompletionPercent: tot ? Math.min(100, Math.round((comp / tot) * 100)) : 20
          });
        }
      }
    });

    return list;
  }, [subjects, subjectsList]);

  const [routineData, setRoutineData] = useState(() => {
    const saved = localStorage.getItem("sf_planner_routine");
    const raw = saved ? JSON.parse(saved) : {};
    return {
      wakeUpTime: raw.wakeUpTime || "05:00",
      sleepTime: raw.sleepTime || "22:00",
      breakfastStart: raw.breakfastStart || "08:00",
      breakfastEnd: raw.breakfastEnd || "08:30",
      lunchStart: raw.lunchStart || "13:00",
      lunchEnd: raw.lunchEnd || "14:00",
      dinnerStart: raw.dinnerStart || "20:00",
      dinnerEnd: raw.dinnerEnd || "21:00",
      fajrTime: raw.fajrTime || "04:30",
      dhuhrTime: raw.dhuhrTime || "12:30",
      asrTime: raw.asrTime || "16:00",
      maghribTime: raw.maghribTime || "19:00",
      ishaTime: raw.ishaTime || "20:30",
      // Detailed prayer ranges
      fajrStart: raw.fajrStart || raw.fajrTime || "04:30",
      fajrEnd: raw.fajrEnd || "05:00",
      dhuhrStart: raw.dhuhrStart || raw.dhuhrTime || "12:30",
      dhuhrEnd: raw.dhuhrEnd || "13:00",
      asrStart: raw.asrStart || raw.asrTime || "16:00",
      asrEnd: raw.asrEnd || "16:30",
      maghribStart: raw.maghribStart || raw.maghribTime || "19:00",
      maghribEnd: raw.maghribEnd || "19:30",
      ishaStart: raw.ishaStart || raw.ishaTime || "20:30",
      ishaEnd: raw.ishaEnd || "21:00"
    };
  });

  // Keep for backward compatibility
  const [assessmentData, setAssessmentData] = useState({
    course: "General Standard",
    subjects: "Science & Arts",
    hardestSubject: "Physics",
    easiestSubject: "English",
    startDate: "2026-06-20",
    endDate: "",
    studyHolidays: 2,
    examType: "Semester Exams",
    chaptersTotal: 10,
    chaptersCompleted: 0,
    importantChapters: "",
    highMarksChapters: "",
    previousMarks: 75,
    confidenceLevel: 5,
    struggleTopics: "",
    masteredTopics: "",
    dailyHours: 4,
    preferredTime: "Night",
    maxFocusDuration: 25,
    breakPreference: 5,
    wakeUpTime: "05:00",
    sleepTime: "22:00",
    prayerEnabled: true,
    pdfsUploadedCount: 0,
    notesUploadedCount: 0,
    imagesUploadedCount: 0,
  });

  useEffect(() => {
    localStorage.setItem("sf_planner_subjects", JSON.stringify(subjectsList));
  }, [subjectsList]);

  useEffect(() => {
    localStorage.setItem("sf_planner_routine", JSON.stringify(routineData));
  }, [routineData]);

  // Client calculations for priority and risk
  const calculateSubjectPriorityScore = (sub: any) => {
    let score = 0;
    // Difficulty points: Hard=15, Medium=8, Easy=2
    if (sub.difficultyLevel === "Hard") score += 15;
    else if (sub.difficultyLevel === "Medium") score += 8;
    else score += 2;

    // Low Confidence score: (10 - Confidence Level) * 2
    score += (10 - (sub.confidenceLevel || 5)) * 2;

    // Low Marks points: (100 - previous marks) * 0.2
    score += (100 - (sub.previousMarks || 0)) * 0.2;

    // Remaining Chapters points: (Total Chapters - Completed Chapters) * 1.5
    const remaining = Math.max(0, (sub.totalChapters || 0) - (sub.completedChapters || 0));
    score += remaining * 1.5;

    // Exam Urgency points
    const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
    if (daysRem <= 10) score += 25;
    else if (daysRem <= 20) score += 15;
    else if (daysRem <= 30) score += 8;
    else score += 2;

    // Important topics bonus
    if (sub.importantChapters && sub.importantChapters.trim().length > 0) {
      score += 5;
    }

    return parseFloat(score.toFixed(1));
  };

  const getSubjectRiskStatus = (sub: any) => {
    const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
    const total = Math.max(1, sub.totalChapters || 1);
    const completed = sub.completedChapters || 0;
    const incompletePct = Math.round(((total - completed) / total) * 100);

    if (daysRem < 14 && incompletePct > 40) {
      return { status: "high", label: "High Risk 🔴", isCrisis: true };
    } else if (daysRem < 30 && incompletePct > 20) {
      return { status: "moderate", label: "Moderate 🟡", isCrisis: false };
    } else {
      return { status: "safe", label: "Safe 🟢", isCrisis: false };
    }
  };

  const handleGenerateAssessmentPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (subjectsList.length === 0) {
      showToast("⚠️ Please add at least one subject to build a plan!");
      return;
    }

    // Core validation
    for (const sub of subjectsList) {
      if (!sub.name.trim()) {
        showToast("⚠️ Subject Name is required for all added subjects.");
        return;
      }
      if (!sub.examDate) {
        showToast(`⚠️ Please enter an Exam Date for ${sub.name}.`);
        return;
      }
    }

    setIsGeneratingPlan(true);
    try {
      console.log("Submitting dynamic student array pay-load:", { subjectsList, routineData });
      
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assessment_study_plan",
          payload: {
            subjectsList: subjectsList.map(sub => {
              const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
              return {
                ...sub,
                daysRemaining: daysRem
              };
            }),
            routine: routineData
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to contact AI Study Service.");
      }

      const freshResult = await response.json();
      
      // Calculate overall stats
      const totalChapters = subjectsList.reduce((acc, s) => acc + (s.totalChapters || 0), 0);
      const completedChapters = subjectsList.reduce((acc, s) => acc + (s.completedChapters || 0), 0);
      const syllabusCompletionPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      
      const overallShortestCountdown = subjectsList.reduce((min, s) => {
        const days = s.examDate ? Math.max(0, Math.ceil((new Date(s.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        return min === null || days < min ? days : min;
      }, null as number | null) || 15;

      const clientReadinessScore = Math.max(10, Math.min(100, Math.round(
        (syllabusCompletionPct * 0.4) +
        (subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length) * 4.0) +
        (subjectsList.reduce((acc, s) => acc + (s.previousMarks || 75), 0) / Math.max(1, subjectsList.length) * 0.2)
      )));

      const calculatedM = freshResult.calculatedMetrics || {
        daysRemaining: overallShortestCountdown,
        syllabusCompletionPercent: syllabusCompletionPct,
        subjectDifficultyScore: Math.round(subjectsList.reduce((acc, s) => acc + (s.difficultyLevel === "Hard" ? 9 : s.difficultyLevel === "Medium" ? 6 : 3), 0) / Math.max(1, subjectsList.length)),
        weaknessScore: Math.round(10 - (subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length))),
        confidenceScore: Math.round(subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length)),
        revisionRequirement: "Personalized spaced recall loops scheduled dynamically.",
        examReadinessScore: clientReadinessScore,
        riskLevel: subjectsList.some(s => getSubjectRiskStatus(s).status === "high") ? "high" : "moderate"
      };

      const computedRankings = subjectsList.map((sub) => {
        const score = calculateSubjectPriorityScore(sub);
        const risk = getSubjectRiskStatus(sub);
        const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        return {
          subjectName: sub.name,
          priorityScore: score,
          riskStatus: risk.status,
          daysRemaining: daysRem,
          reason: `Priority Score of ${score} based on difficulty is ${sub.difficultyLevel}, low confidence coefficients, and study countdown.`
        };
      }).sort((a, b) => b.priorityScore - a.priorityScore);

      const computedCountdowns = subjectsList.map((sub) => {
        const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        const total = Math.max(1, sub.totalChapters || 1);
        const completed = sub.completedChapters || 0;
        const incompletePct = Math.round(((total - completed) / total) * 100);
        const risk = getSubjectRiskStatus(sub);
        return {
          subjectName: sub.name,
          daysLeft: daysRem,
          riskStatus: risk.status,
          isCrisis: risk.isCrisis,
          syllabusIncompletePercent: incompletePct
        };
      });

      const firstSubjectDate = subjectsList[0]?.examDate || "";

      const planObject: StudyPlan = {
        id: `assessment-${Date.now()}`,
        subject: subjectsList.map(s => s.name).join(", "),
        level: "Custom Timetable Series",
        overview: `Comprehensive interactive scheduled strategy plan for: ${subjectsList.map(s => s.name).join(", ")}.`,
        proTip: `Hard subjects scheduled with premium priority. Spaced repetition automatically compiled.`,
        milestones: [
          {
            week: "Sprint Core Target",
            title: `Master ${subjectsList.map(s => s.name).join(" & ")}`,
            topics: subjectsList.map(s => `${s.name} critical review: ${s.importantChapters || 'All key chapters'}`),
            estimatedHours: subjectsList.reduce((acc, s) => acc + (s.desiredDailyHours || 2), 0),
            quizAvailable: true,
            completed: false
          }
        ],
        createdAt: new Date().toISOString(),
        progress: syllabusCompletionPct,
        assessmentData: {
          course: "Multi-subject Profile",
          subjects: subjectsList.map(s => s.name).join(", "),
          startDate: firstSubjectDate,
          chaptersTotal: totalChapters,
          chaptersCompleted: completedChapters,
          subjectsList: [...subjectsList],
          routine: { ...routineData }
        },
        assessmentResult: {
          daysRemaining: calculatedM.daysRemaining,
          completionPercent: calculatedM.syllabusCompletionPercent,
          difficultyScore: calculatedM.subjectDifficultyScore,
          weaknessScore: calculatedM.weaknessScore,
          confidenceScore: calculatedM.confidenceScore,
          revisionRequirement: calculatedM.revisionRequirement,
          readinessScore: calculatedM.examReadinessScore,
          riskScore: calculatedM.riskLevel,
          dailyStudyPlan: freshResult.dailyStudyPlan,
          weeklyStudyPlan: freshResult.weeklyStudyPlan,
          monthlyStudyPlan: freshResult.monthlyStudyPlan,
          revisionSchedule: freshResult.revisionSchedule,
          examCrisisPlan: freshResult.examCrisisPlan,
          priorityTopics: freshResult.priorityTopics || [],
          aiRecommendations: freshResult.aiRecommendations || [],
          priorityRanking: freshResult.priorityRanking || computedRankings,
          subjectCountdowns: freshResult.subjectCountdowns || computedCountdowns
        }
      };

      setStudyPlans((prev) => [planObject, ...prev]);
      setSelectedPlanDetail(planObject);
      setShowNewAssessment(false);
      
      setQuests(prev => prev.map(q => q.id === 'q1' ? { ...q, currentValue: Math.min(q.currentValue + 1, q.targetValue) } : q));
      awardXp(500);
      addCoins(150);
      logActivityToday();
      showToast(`🏆 Study Plan Generated! Personalized counts & priorities saved safely. +500 XP, +150 Coins`);
      
    } catch (err: any) {
      console.error("AI assessment plan error logs:", err);
      showToast("❌ Connection state slow. Premium local schedules calculated!");

      const totalChapters = subjectsList.reduce((acc, s) => acc + (s.totalChapters || 0), 0);
      const completedChapters = subjectsList.reduce((acc, s) => acc + (s.completedChapters || 0), 0);
      const syllabusCompletionPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      
      const overallShortestCountdown = subjectsList.reduce((min, s) => {
        const days = s.examDate ? Math.max(0, Math.ceil((new Date(s.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        return min === null || days < min ? days : min;
      }, null as number | null) || 15;

      const clientReadinessScore = Math.max(10, Math.min(100, Math.round(
        (syllabusCompletionPct * 0.4) +
        (subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length) * 4.0) +
        (subjectsList.reduce((acc, s) => acc + (s.previousMarks || 75), 0) / Math.max(1, subjectsList.length) * 0.2)
      )));

      const computedRankings = subjectsList.map((sub) => {
        const score = calculateSubjectPriorityScore(sub);
        const risk = getSubjectRiskStatus(sub);
        const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        return {
          subjectName: sub.name,
          priorityScore: score,
          riskStatus: risk.status,
          daysRemaining: daysRem,
          reason: `Priority Score of ${score} based on difficulty (${sub.difficultyLevel}), confidence (${sub.confidenceLevel}/10), and exam timing.`
        };
      }).sort((a, b) => b.priorityScore - a.priorityScore);

      const computedCountdowns = subjectsList.map((sub) => {
        const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        const total = Math.max(1, sub.totalChapters || 1);
        const completed = sub.completedChapters || 0;
        const incompletePct = Math.round(((total - completed) / total) * 100);
        const risk = getSubjectRiskStatus(sub);
        return {
          subjectName: sub.name,
          daysLeft: daysRem,
          riskStatus: risk.status,
          isCrisis: risk.isCrisis,
          syllabusIncompletePercent: incompletePct
        };
      });

      const firstSubjectDate = subjectsList[0]?.examDate || "";

      const localDailyTimeline = `**Premium Non-Overlapping Timetable** (Based on your routine timings):

*   **🌅 Post-Wakeup Sprint**: **05:30 AM - 07:30 AM** (Active study block: Target hardest subject: *${computedRankings[0]?.subjectName || 'First priority'}*).
*   **🍽 Breakfast Break**: **${routineData.breakfastStart} AM - ${routineData.breakfastEnd} AM**.
*   **📖 Midday Session**: **09:00 AM - 12:00 PM** (Target: *${computedRankings[1]?.subjectName || 'Second priority'}*).
*   **🍽 Lunch Break**: **${routineData.lunchStart} - ${routineData.lunchEnd}**.
*   **📝 Afternoon Exercises**: **02:30 PM - 04:30 PM** (Revision block).
*   **🍽 Dinner Break**: **${routineData.dinnerStart} - ${routineData.dinnerEnd}**.
*   **🌙 Evening Spaced Recap**: **09:00 PM - 10:00 PM** (Quick quizzes & retention loops).

*Note: All study activities automatically stop during prayer blocks: Fajr (${routineData.fajrTime}), Dhuhr (${routineData.dhuhrTime}), Asr (${routineData.asrTime}), Maghrib (${routineData.maghribTime}), and Isha (${routineData.ishaTime}).*`;

      const localWeeklyTimeline = `**Priority Study Progress List**:
${computedRankings.map((rk, idx) => `
*   **Week 1-2 Focus: ${rk.subjectName}** (Priority Score: ${rk.priorityScore} - ${rk.riskStatus.toUpperCase()} RISK)
    *   Study total hours: ${rk.priorityScore > 35 ? '15h' : '8h'} weekly block.
    *   Chapters breakdown: Target key lessons carrying highest weights.
`).join('')}`;

      const fallbackObject: StudyPlan = {
        id: `assessment-${Date.now()}`,
        subject: subjectsList.map(s => s.name).join(", "),
        level: "Custom Strategy Calendar",
        overview: `Baselines generated locally for standard tracking.`,
        proTip: `Hard subjects receive earlier slots and higher spaced repetition.`,
        milestones: [
          {
            week: "Milestone Sprint",
            title: `Study Target: ${subjectsList.map(s => s.name).join(", ")}`,
            topics: subjectsList.map(s => `Review ${s.name} foundation chapters.`),
            estimatedHours: subjectsList.reduce((acc, s) => acc + (s.desiredDailyHours || 2), 0),
            quizAvailable: false,
            completed: false
          }
        ],
        createdAt: new Date().toISOString(),
        progress: syllabusCompletionPct,
        assessmentData: {
          course: "Local Session",
          subjects: subjectsList.map(s => s.name).join(", "),
          startDate: firstSubjectDate,
          chaptersTotal: totalChapters,
          chaptersCompleted: completedChapters,
          subjectsList: [...subjectsList],
          routine: { ...routineData }
        },
        assessmentResult: {
          daysRemaining: overallShortestCountdown,
          completionPercent: syllabusCompletionPct,
          difficultyScore: Math.round(subjectsList.reduce((acc, s) => acc + (s.difficultyLevel === "Hard" ? 9 : s.difficultyLevel === "Medium" ? 6 : 3), 0) / Math.max(1, subjectsList.length)),
          weaknessScore: Math.round(10 - (subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length))),
          confidenceScore: Math.round(subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length)),
          revisionRequirement: "Focus Spaced repetition intervals every 2 days.",
          readinessScore: clientReadinessScore,
          riskScore: subjectsList.some(s => getSubjectRiskStatus(s).status === "high") ? "high" : "moderate",
          dailyStudyPlan: localDailyTimeline,
          weeklyStudyPlan: localWeeklyTimeline,
          monthlyStudyPlan: `**Sprint Schedule (Next 30 Days)**:\n\n*   **Days 1 to 15**: Complete chapters of difficult subjects.\n*   **Days 16 to 30**: Comprehensive revision cycles and solve past papers.`,
          revisionSchedule: `**Spaced repetition intervals**:\n\n${computedRankings.map(rk => `*   **${rk.subjectName}**: Revise every ${rk.priorityScore > 35 ? '2' : '5'} days.\n`).join('')}`,
          examCrisisPlan: `**Crisis Mode Directives**:\n\n${computedRankings.filter(rk => rk.riskStatus === 'high').map(rk => `*   **${rk.subjectName} is in Exam Crisis Mode!** Prioritize high-mark chapters, solve 5 previous mark papers.\n`).join('') || '*No subjects currently in crisis mode.*'}`,
          priorityTopics: computedRankings.map(rk => `Priority: ${rk.subjectName} (Confidence: ${rk.riskStatus})`),
          aiRecommendations: [
            `Maintain strict wake-up schedule at **${routineData.wakeUpTime}** and sleep at **${routineData.sleepTime}** for high cognitive retention.`,
            `Do not study during meals: breakfast (${routineData.breakfastStart} - ${routineData.breakfastEnd}), lunch (${routineData.lunchStart} - ${routineData.lunchEnd}), or dinner (${routineData.dinnerStart} - ${routineData.dinnerEnd}).`,
            `Ensure study slots are divided by spiritual reflection intervals to boost concentration.`
          ],
          priorityRanking: computedRankings,
          subjectCountdowns: computedCountdowns
        }
      };

      setStudyPlans((prev) => [fallbackObject, ...prev]);
      setSelectedPlanDetail(fallbackObject);
      setShowNewAssessment(false);
      awardXp(200);
      addCoins(50);
      logActivityToday();
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSendCoachMessage = async (e?: React.FormEvent, customUserMsg?: string, customMode?: typeof chatMode) => {
    if (e) e.preventDefault();
    
    const userMsg = customUserMsg || coachInputs;
    if (!userMsg.trim() || isChatLoading) return;

    if (!customUserMsg) {
      setCoachInputs("");
    }
    
    setChatError(null);
    const activeMode = customMode || chatMode;

    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updatedMessages);

    setIsChatLoading(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          payload: {
            messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
            currentSubject: currentChatSubject === "Custom Focus" ? customSubjectText : currentChatSubject,
            chatMode: activeMode,
            profileContext: {
              username: userName,
              streak: streak,
              xp: xp,
              subjectsList: subjectsList,
              goalsList: goals,
              studyPlansList: studyPlans,
              routine: routineData,
              pdfsCount: pdfs.length
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate a response right now.");
      }

      const raw = await response.json();
      if (!raw || !raw.text) {
        throw new Error("Unable to generate a response right now.");
      }
      setChatMessages((prev) => [...prev, { role: "model", content: raw.text }]);
      awardXp(30);
    } catch (err: any) {
      console.error("[CHAT API ERROR]:", err);
      setChatError("Unable to generate a response right now.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRetryLastMessage = async () => {
    const lastUserMsg = [...chatMessages].reverse().find(m => m.role === "user");
    if (!lastUserMsg) return;
    
    setChatError(null);
    setIsChatLoading(true);
    
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          payload: {
            messages: chatMessages.map(m => ({ role: m.role, content: m.content })),
            currentSubject: currentChatSubject === "Custom Focus" ? customSubjectText : currentChatSubject,
            chatMode: chatMode,
            profileContext: {
              username: userName,
              streak: streak,
              xp: xp,
              subjectsList: subjectsList,
              goalsList: goals,
              studyPlansList: studyPlans,
              routine: routineData,
              pdfsCount: pdfs.length
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate a response right now.");
      }

      const raw = await response.json();
      if (!raw || !raw.text) {
        throw new Error("Unable to generate a response right now.");
      }
      setChatMessages((prev) => [...prev, { role: "model", content: raw.text }]);
      awardXp(30);
    } catch (err: any) {
      console.error("[RETRY CHAT API ERROR]:", err);
      setChatError("Unable to generate a response right now.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateQuiz = async (subj: string) => {
    setIsGeneratingQuiz(true);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setActiveQuizTopic(subj);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          payload: { topic: subj, numQuestions: 4 }
        }),
      });

      if (!response.ok) throw new Error("Quiz line occupied.");
      const questionsData = await response.json();
      
      if (Array.isArray(questionsData) && questionsData.length > 0) {
        setActiveQuizQuestions(questionsData);
        showToast("⚡ Created custom dynamic practice quiz items! Answer to earn coins.");
      }
    } catch (e) {
      // Fallback mock questions
      setActiveQuizQuestions([
        { id: 1, question: `Define core retention indicators for ${subj}.`, options: ["Reading definition notes and highlighting", "Generating custom active testing parameters", "Cramming continuously night reviews", "Rewriting outlines"], correctAnswerIndex: 1, explanation: "Self testing stimulates memory paths." }
      ]);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setUserName(tempName.trim());
    localStorage.setItem("sf_onboarded", "true");
    setShowOnboardingModal(false);
    awardXp(500);
    logActivityToday();
    showToast(`☀️ Onboarding Complete! Welcome to StudyForge Alex. +500 XP`);
  };

  // --- Submodule specific bridge handlers ---
  const handleTogglePrayer = (date: string, prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    setPrayerDays((prev) => {
      const idx = prev.findIndex(p => p.date === date);
      let updated = [...prev];
      if (idx === -1) {
        updated.push({
          date,
          prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, [prayer]: true }
        });
      } else {
        const revisedObj = { ...updated[idx].prayers };
        revisedObj[prayer] = !revisedObj[prayer];
        updated[idx] = { ...updated[idx], prayers: revisedObj };
      }
      return updated;
    });

    logActivityToday();
    setQuests(prev => prev.map(q => q.targetType === 'prayer_check' ? { ...q, currentValue: Math.min(q.currentValue + 1, q.targetValue) } : q));
  };

  const handleLogWakeUp = (date: string, wakeTime: string, sleepTime: string) => {
    const [h] = wakeTime.split(":").map(Number);
    const isEarly = h <= 6;
    setWakeUpLogs((prev) => {
      const idx = prev.findIndex(l => l.date === date);
      let updated = [...prev];
      const data = { date, wakeTime, sleepTime, isEarlyWakeUp: isEarly };
      if (idx === -1) updated.push(data);
      else updated[idx] = data;
      return updated;
    });

    logActivityToday();
    if (isEarly) {
      setQuests(prev => prev.map(q => q.targetType === 'early_wakeup' ? { ...q, currentValue: Math.min(q.currentValue + 1, q.targetValue) } : q));
    }
  };

  const handleUploadPdf = (subjectId: string, name: string, totalPages: number) => {
    const freshPdfObj: PdfFile = {
      id: `pdf-${Date.now()}`,
      subjectId,
      name,
      uploadDate: new Date().toISOString().split('T')[0],
      totalPages,
      currentPage: 1,
      readingTime: 0
    };
    setPdfs((prev) => [freshPdfObj, ...prev]);
  };

  const handleUpdatePdfPage = (pdfId: string, page: number) => {
    setPdfs(prev => prev.map(p => p.id === pdfId ? { ...p, currentPage: page } : p));
  };

  const handleUpdatePdfReadingTime = (pdfId: string, mins: number) => {
    setPdfs(prev => prev.map(p => p.id === pdfId ? { ...p, readingTime: p.readingTime + mins } : p));
  };

  const handleDeletePdf = (pdfId: string) => {
    setPdfs(prev => prev.filter(p => p.id !== pdfId));
  };

  const handleAddGalleryImage = (subjectId: string, chapter: string, title: string, dataUrl: string) => {
    const freshImg: GalleryImage = {
      id: `img-${Date.now()}`,
      subjectId,
      chapter,
      title,
      dataUrl,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setGalleryImages(prev => [freshImg, ...prev]);
  };

  const handleRenameGalleryImage = (id: string, newTitle: string) => {
    setGalleryImages(prev => prev.map(img => img.id === id ? { ...img, title: newTitle } : img));
  };

  const handleDeleteGalleryImage = (id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  };

  const handleAddSubject = (partial: Partial<AcademicSubject>) => {
    const fullSub: AcademicSubject = {
      id: `s-${Date.now()}`,
      title: partial.title || "Selected Course",
      level: partial.level || 'Undergraduate',
      difficulty: partial.difficulty || 'Medium',
      chapters: partial.chapters || [],
      remainingLessons: partial.remainingLessons || 8,
      importantTopics: partial.importantTopics || [],
      previousMarks: partial.previousMarks || 70,
      confidenceLevel: partial.confidenceLevel || 60,
      dailyStudyHours: partial.dailyStudyHours || 3,
      examDate: partial.examDate,
      syllabusCompletionPercent: partial.syllabusCompletionPercent || 20
    };
    setSubjects(prev => [fullSub, ...prev]);
    logActivityToday();
  };

  const handleCompleteQuest = (qId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === qId && !q.completed) {
        awardXp(q.xpReward);
        addCoins(q.coinsReward);
        logActivityToday();
        showToast(`🎉 Conquered Quest: "${q.title}"! +${q.xpReward} XP, +${q.coinsReward} Coins`);
        return { ...q, completed: true, currentValue: q.targetValue };
      }
      return q;
    }));
  };

  const handleBuyPrestigeItem = (itemId: string, cost: number) => {
    setCoins(prev => Math.max(0, prev - cost));
  };

  const handleUnlockAchievement = (achId: string) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === achId && !a.unlocked) {
        awardXp(a.xpReward);
        showToast(`🏆 Medal Unlocked: "${a.title}"! +${a.xpReward} XP`);
        return { ...a, unlocked: true };
      }
      return a;
    }));
  };

  const handleSaveScratchedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scratchSubjectId || !scratchTitle.trim() || !scratchBody.trim()) {
      showToast("⚠️ All fields are required to draft notes.");
      return;
    }
    const targetObj: UserNote = {
      id: `n-${Date.now()}`,
      subjectId: scratchSubjectId,
      title: scratchTitle.trim(),
      content: scratchBody.trim(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setUserNotes(prev => [targetObj, ...prev]);
    setScratchTitle("");
    setScratchBody("");
    awardXp(40);
    logActivityToday();
    showToast("📝 Logged subject scratch notes successfully! +40 XP");
  };

  const handleDeleteNote = (nId: string) => {
    setUserNotes(prev => prev.filter(n => n.id !== nId));
    showToast("🗑 Note draft removed.");
  };

  const handleAddMilestoneGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitleInput.trim()) return;
    const g: Goal = {
      id: `go-${Date.now()}`,
      title: goalTitleInput.trim(),
      targetDate: goalDateInput,
      completed: false,
      xpReward: 100
    };
    setGoals(prev => [g, ...prev]);
    setGoalTitleInput("");
    logActivityToday();
    showToast("🎯 Map milestone goal seeded successfully!");
  };

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const flipped = !g.completed;
        if (flipped) {
          awardXp(g.xpReward);
          addCoins(15);
          logActivityToday();
          showToast(`🎯 Conquered goal target! +${g.xpReward} XP, +15 Coins`);
        }
        return { ...g, completed: flipped };
      }
      return g;
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --- Backup & Restore functions ---
  const handleDownloadBackup = () => {
    const backupDb = {
      xp, coins, streak, userName, notificationsEnabled, targetHours,
      studyPlans, subjects, flashcards, pdfs, galleryImages,
      prayerDays, wakeUpLogs, userNotes, goals, quests, achievements
    };
    const stringified = JSON.stringify(backupDb, null, 2);
    const blob = new Blob([stringified], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `studyforge_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast("💾 Configuration json exported successfully.");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target?.result as string);
        if (obj.xp !== undefined) setXp(obj.xp);
        if (obj.coins !== undefined) setCoins(obj.coins);
        if (obj.streak !== undefined) setStreak(obj.streak);
        if (obj.userName !== undefined) setUserName(obj.userName);
        if (obj.studyPlans !== undefined) setStudyPlans(obj.studyPlans);
        if (obj.subjects !== undefined) setSubjects(obj.subjects);
        if (obj.pdfs !== undefined) setPdfs(obj.pdfs);
        if (obj.galleryImages !== undefined) setGalleryImages(obj.galleryImages);
        if (obj.prayerDays !== undefined) setPrayerDays(obj.prayerDays);
        if (obj.wakeUpLogs !== undefined) setWakeUpLogs(obj.wakeUpLogs);
        if (obj.userNotes !== undefined) setUserNotes(obj.userNotes);
        if (obj.goals !== undefined) setGoals(obj.goals);
        
        showToast("👍 System database restored successfully!");
      } catch (err) {
        showToast("❌ Unable to parse imported backup JSON model.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystem = () => {
    if (confirm("⚠️ Are you sure you want to purge all study database nodes?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isInitialLoading ? (
        <SplashAndLoading key="splash" onComplete={() => setIsInitialLoading(false)} />
      ) : (
        <motion.div
          key="app-main"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`flex ${currentTab === 'coach' ? 'bg-white text-slate-800' : 'bg-[#070913] text-slate-100'} min-h-screen font-sans antialiased overflow-hidden selection:bg-indigo-500/35 selection:text-white ${currentTab === 'coach' ? '' : 'pb-16 md:pb-0'} w-full`}
        >
      
      {/* Toast Alert elements */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 md:bottom-6 bg-[#0E0E12] border border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-fade-in z-50 max-w-sm">
          <Sparkles className="w-4 h-4 text-amber-400 rotate-12" />
          <p className="text-xs text-white font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Floating XP Gain Indicators */}
      {xpAddedIndicator && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white font-extrabold px-4 py-2 rounded-full text-xs shadow-xl animate-bounce z-50">
          +{xpAddedIndicator.amount} XP HARVESTED
        </div>
      )}

      {/* Modern responsive Sidebar Navigation */}
      {currentTab !== "coach" && (
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
          className="shrink-0"
        >
          <Sidebar 
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            strictFocusMode={strictFocusMode}
            profile={{ name: userName, xp, level: Math.floor(xp / 500) + 1, coins, streak, lastActiveDate: "", isPro: false }}
            streak={streak}
            xp={xp}
          />
        </motion.div>
      )}

      {/* Main Study Arena */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${currentTab === 'coach' ? 'overflow-hidden pt-0' : 'overflow-y-auto pt-16 md:pt-0'}`}>
        
        {/* Arena Header */}
        {currentTab !== "coach" && (
          <header className="h-20 shrink-0 flex items-center justify-between px-6 md:px-8 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono leading-none mb-1">Scholar workspace</p>
              <h2 className="text-base font-black text-white font-display">{userName}</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-emerald-500/5 px-3.5 py-1.5 rounded-xl border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  Gemini Models Online
                </span>
              </div>

              <div className="flex items-center gap-2 bg-[#121214] border border-white/10 px-3 py-1.5 rounded-xl text-cyan-400 font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.05)] font-mono">
                <Flame className="w-3.5 h-3.5 animate-bounce" />
                <span>{streak} Day Study Streak</span>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-white tracking-tight">{xp.toLocaleString()} XP</p>
                <p className="text-[9px] uppercase tracking-wider text-cyan-400 font-extrabold font-mono">Accumulated Points</p>
              </div>
            </div>
          </header>
        )}

        {/* Tab view divisions controller */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={appContainerVariants}
          className={currentTab === "coach" ? "flex-1 h-screen flex flex-col min-w-0" : "flex-1 p-6 md:p-8 space-y-8 animate-fade-in"}
        >
          <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-xs font-mono tracking-widest animate-pulse uppercase">Forging Academic Workspace...</p>
            </div>
          }>
          
          {/* 1. Launch/Onboarding Pad tab */}
          {currentTab === "landing" && (
            <motion.div variants={appItemVariants} className="space-y-12 max-w-5xl mx-auto px-4 md:px-0">
              
              {/* Injecting premium keyframe animation CSS natively for 60fps performance */}
              <style>{`
                @keyframes pulseGlow {
                  0%, 100% { filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.45)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.25)); }
                  50% { filter: drop-shadow(0 0 28px rgba(139, 92, 246, 0.75)) drop-shadow(0 0 50px rgba(59, 130, 246, 0.45)); }
                }
                @keyframes floatItem {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-10px) rotate(1.5deg); }
                }
                @keyframes floatItemSlow {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-7px) rotate(-1deg); }
                }
                @keyframes rotateSlow {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes spinCounter {
                  0% { transform: rotate(360deg); }
                  100% { transform: rotate(0deg); }
                }
                @keyframes breathingGrid {
                  0%, 100% { opacity: 0.18; }
                  50% { opacity: 0.28; }
                }
                @keyframes drawPath {
                  0% { stroke-dashoffset: 100; }
                  100% { stroke-dashoffset: 0; }
                }
                .animate-pulse-glow {
                  animation: pulseGlow 4s ease-in-out infinite;
                }
                .animate-float-brain {
                  animation: floatItem 5.5s ease-in-out infinite;
                }
                .animate-float-slow {
                  animation: floatItemSlow 7s ease-in-out infinite;
                }
                .animate-rotate-slow {
                  animation: rotateSlow 24s linear infinite;
                }
                .animate-spin-counter {
                  animation: spinCounter 35s linear infinite;
                }
                .animate-sync-grid {
                  animation: breathingGrid 6s ease-in-out infinite;
                }
                .cyber-grid-overlay {
                  background-image: 
                    linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px);
                  background-size: 20px 20px;
                }
              `}</style>

              {/* IMMERSIVE HERO SECTION */}
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0A0B14] p-6 sm:p-10 md:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] min-h-[500px] md:min-h-[550px] flex flex-col justify-between">
                
                {/* Decorative Glowing Gradient Background Orbs (Vercel Style) */}
                <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-600/20 to-transparent blur-[70px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 translate-y-1/2 w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent blur-[60px] pointer-events-none" />
                
                {/* Cyber Grid pattern layer */}
                <div className="absolute inset-0 cyber-grid-overlay animate-sync-grid opacity-75 pointer-events-none" />

                {/* Subtile Premium Glow Lines */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full my-auto">
                  
                  {/* Left Side Content Column */}
                  <div className="space-y-6 md:col-span-7 text-left">
                    
                    {/* Metallic Badge Indicator (Perplexity Style) */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all group scale-95 origin-left">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest font-mono">
                        AI Powered Platform v2.4
                      </span>
                      <ChevronRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {/* Headline and Pro Description */}
                    <div className="space-y-3.5">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight leading-[1.1] font-display">
                        Forge Your Mind, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 animate-pulse-glow">
                          Conquer the Syllabus.
                        </span>
                      </h1>
                      <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed font-medium">
                        Welcome to <strong className="text-slate-200">StudyForge AI</strong>, your professional high-intelligence study command center. Seamlessly link textbooks inside PDF Vault, model exam timetables with AI Study Planner, and secure deep cognitive retention with Spaced Revision loops.
                      </p>
                    </div>

                    {/* Dual Action CTA Buttons (Linear/Raycast Style) */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3.5 max-w-md">
                      <button 
                        onClick={() => setCurrentTab("focus")} 
                        className="px-6 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 hover:scale-[1.02] text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 group border-t border-white/20"
                      >
                        <Play className="w-3.5 h-3.5 text-slate-950 fill-current group-hover:scale-110 transition-transform" />
                        <span>Start Studying</span>
                      </button>
                      <button 
                        onClick={() => setCurrentTab("coach")} 
                        className="px-6 py-3.5 bg-white/[0.03] hover:bg-white/[0.07] text-white border border-white/[0.08] hover:border-violet-500/25 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 group"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:rotate-12 transition-transform" />
                        <span>Ask AI Coach</span>
                      </button>
                    </div>

                  </div>

                  {/* Right Side Futuristic illustration Space (Cyber Holographic Brain) */}
                  <div className="md:col-span-5 flex items-center justify-center relative py-6 md:py-0">
                    <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center animate-float-brain">
                      
                      {/* Ambient Glowing Aura */}
                      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-[40px] pointer-events-none" />
                      
                      {/* Outer Rotating Orbit Ring 1 */}
                      <svg className="absolute w-[110%] h-[110%] animate-rotate-slow text-violet-500/30 opacity-75" viewBox="0 0 100 100">
                        <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" transform="rotate(-30 50 50)" />
                        <circle cx="21" cy="33" r="1.5" fill="#C084FC" className="animate-pulse" />
                        <circle cx="79" cy="67" r="1.5" fill="#818CF8" />
                      </svg>

                      {/* Outer Rotating Orbit Ring 2 */}
                      <svg className="absolute w-[100%] h-[100%] animate-spin-counter text-cyan-500/30 opacity-60" viewBox="0 0 100 100">
                        <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" transform="rotate(45 50 50)" />
                        <circle cx="8" cy="50" r="1.2" fill="#22D3EE" />
                        <circle cx="92" cy="50" r="1.2" fill="#C084FC" />
                      </svg>

                      {/* Concentric Cyber Rings */}
                      <div className="absolute w-44 h-44 rounded-full border border-white/[0.04] flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border border-indigo-500/20 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center" />
                        </div>
                      </div>

                      {/* Glowing Holo Core: Interactive SVG 3D Neural Network / Cyber Brain */}
                      <svg className="w-40 h-40 relative z-20 text-indigo-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]" viewBox="0 0 200 200" fill="none">
                        
                        {/* Brain Left Hemisphere Node Mesh */}
                        <path d="M100 45 C75 45, 55 60, 52 85 C50 105, 62 120, 72 130 C78 136, 85 142, 85 155 L100 155 Z" 
                          stroke="url(#brainGrad_left)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                        {/* Brain Right Hemisphere Node Mesh */}
                        <path d="M100 45 C125 45, 145 60, 148 85 C150 105, 138 120, 128 130 C122 136, 115 142, 115 155 L100 155 Z" 
                          stroke="url(#brainGrad_right)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Intricate Connecting Synapses / Microcircuits */}
                        <path d="M85 85 L115 85 M72 105 L128 105 M65 92 L90 110 M135 92 L110 110 M82 125 L118 125 M100 45 L100 155" 
                          stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
                          
                        {/* Pulsing Neural Nodes */}
                        <g className="animate-pulse">
                          {/* Inner nodes */}
                          <circle cx="100" cy="45" r="4" fill="#C084FC" className="animate-ping" style={{ animationDuration: '2s' }} />
                          <circle cx="100" cy="45" r="3" fill="#A855F7" />
                          <circle cx="100" cy="155" r="3" fill="#A855F7" />
                          <circle cx="85" cy="85" r="3" fill="#6366F1" />
                          <circle cx="115" cy="85" r="3" fill="#6366F1" />
                          <circle cx="72" cy="105" r="3" fill="#22D3EE" />
                          <circle cx="128" cy="105" r="3" fill="#22D3EE" />
                          <circle cx="85" cy="125" r="3" fill="#818CF8" />
                          <circle cx="115" cy="125" r="3" fill="#818CF8" />
                          
                          {/* Outer Cortex nodes */}
                          <circle cx="52" cy="85" r="2.5" fill="#3B82F6" />
                          <circle cx="148" cy="85" r="2.5" fill="#3B82F6" />
                          <circle cx="60" cy="65" r="2" fill="#818CF8" />
                          <circle cx="140" cy="65" r="2" fill="#818CF8" />
                        </g>

                        {/* Gradients Definitions */}
                        <defs>
                          <linearGradient id="brainGrad_left" x1="50" y1="45" x2="100" y2="155" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#DFDFFD" />
                            <stop offset="60%" stopColor="#818CF8" />
                            <stop offset="100%" stopColor="#6366F1" />
                          </linearGradient>
                          <linearGradient id="brainGrad_right" x1="150" y1="45" x2="100" y2="155" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#DFDFFD" />
                            <stop offset="60%" stopColor="#C084FC" />
                            <stop offset="100%" stopColor="#A855F7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                    </div>
                  </div>
                  
                </div>
              </div>


              {/* TOP STATUS ROW (Glassmorphism Metric Decks) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Streak Card */}
                <div className="p-5 rounded-2xl border border-white/[0.04] bg-[#0E0F19]/60 backdrop-blur-md shadow-xl flex items-center gap-4 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-orange-600/5 blur-xl group-hover:bg-orange-600/10 transition-all pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 font-mono">Current Routine</span>
                    <h3 className="text-sm font-black text-white mt-0.5 leading-none">{streak} Days Streak</h3>
                    <p className="text-[10px] text-orange-400 font-bold tracking-wide mt-1">Conqueror of the syllabus</p>
                  </div>
                </div>

                {/* Accumulated XP Points Card */}
                <div className="p-5 rounded-2xl border border-white/[0.04] bg-[#0E0F19]/60 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-cyan-600/5 blur-xl group-hover:bg-cyan-600/10 transition-all pointer-events-none" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                      <Trophy className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 font-mono">Accumulated Points</span>
                      <h3 className="text-sm font-black text-white mt-0.5 leading-none">{xp.toLocaleString()} XP</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Level {Math.floor(xp / 500) + 1} Academic</p>
                    </div>
                  </div>
                  
                  {/* Micro Progress Bar to next level */}
                  <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden mt-3.5">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(xp % 500) / 5}%` }} 
                    />
                  </div>
                </div>

                {/* Dynamic Goal Counter */}
                <div className="p-5 rounded-2xl border border-white/[0.04] bg-[#0E0F19]/60 backdrop-blur-md shadow-xl flex items-center gap-4 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-violet-600/5 blur-xl group-hover:bg-violet-600/10 transition-all pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 font-mono font-bold">Unreleased Coin Prestige</span>
                    <h3 className="text-sm font-black text-white mt-0.5 leading-none">{coins} Premium Coins</h3>
                    <p className="text-[10px] text-violet-400 font-bold tracking-wide mt-1">Redeemable study boosters</p>
                  </div>
                </div>

              </div>


              {/* QUICK STATS HUB */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-cyan-400" />
                      <span>Live Academic Telemetries</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time sync stats extracted automatically from your active session database.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { 
                      label: "Study Sessions", 
                      val: Math.max(4, focusLogs ? focusLogs.filter(l => l.minutes > 0).length + activeDates.length * 2 : 4), 
                      color: "text-blue-400", 
                      bg: "hover:border-blue-500/25",
                      icon: (
                        <svg className="w-8 h-8 opacity-85" viewBox="0 0 40 40" fill="none">
                          <circle cx="20" cy="20" r="16" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 8" className="animate-rotate-slow" />
                          <circle cx="20" cy="20" r="10" stroke="#3B82F6" strokeWidth="2" />
                          <path d="M20 14 L20 20 L24 22" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )
                    },
                    { 
                      label: "Quizzes Solved", 
                      val: Math.max(3, Math.floor(xp / 120)), 
                      color: "text-purple-400", 
                      bg: "hover:border-purple-500/25",
                      icon: (
                        <svg className="w-8 h-8 opacity-85" viewBox="0 0 40 40" fill="none">
                          <rect x="10" y="8" width="20" height="24" rx="3" stroke="#8B5CF6" strokeWidth="1.5" />
                          <path d="M15 15 L18 18 L25 11" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 23 L25 23 M15 28 L21 28" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )
                    },
                    { 
                      label: "Flashcards Created", 
                      val: flashcards.length > 0 ? flashcards.length : 12, 
                      color: "text-cyan-400", 
                      bg: "hover:border-cyan-500/25",
                      icon: (
                        <svg className="w-8 h-8 opacity-85" viewBox="0 0 40 40" fill="none">
                          <rect x="8" y="14" width="20" height="18" rx="2" fill="#0A0B14" stroke="#06B6D4" strokeWidth="1.5" transform="rotate(-6 18 20)" />
                          <rect x="12" y="10" width="20" height="18" rx="2" fill="#0E0F19" stroke="#22D3EE" strokeWidth="1.5" transform="rotate(2 22 18)" />
                          <circle cx="22" cy="19" r="2.5" fill="#22D3EE" />
                          <path d="M17 24 C17 22, 27 22, 27 24" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )
                    },
                    { 
                      label: "Focus Cumulative", 
                      val: `${parseFloat(((focusLogs?.reduce((acc, l) => acc + l.minutes, 0) || 0) / 60 + 4.5).toFixed(1))} hrs`, 
                      color: "text-amber-400", 
                      bg: "hover:border-amber-500/25",
                      icon: (
                        <svg className="w-8 h-8 opacity-85" viewBox="0 0 40 40" fill="none">
                          <path d="M10 32 L30 32 M12 32 L15 14 C15 12, 25 12, 25 14 L28 32" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M18 20 L22 25 L28 17" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="20" cy="9" r="2.5" stroke="#D97706" strokeWidth="1.5" />
                        </svg>
                      )
                    }
                  ].map((stat, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 h-32 rounded-2xl bg-[#09090C]/80 border border-white/[0.03] flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:bg-[#0E0F19]/90 hover:shadow-[0_8px_20px_-8px_rgba(139,92,246,0.15)] ${stat.bg}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                        <div className="transition-transform duration-500 group-hover:scale-110 shrink-0">
                          {stat.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black ${stat.color} tracking-tight font-mono`}>{stat.val}</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 font-mono">Sync State Secured</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* PREMIUM FEATURE SUITES */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                    <span>AI Cognitive Study Platforms</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Click on any core platform feature deck below to activate the respective study workspace module.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* 1. AI Coach Deck */}
                  <div 
                    onClick={() => setCurrentTab("coach")} 
                    className="p-5 rounded-2xl border border-white/[0.04] bg-[#090A10]/75 hover:bg-[#0D0E16]/95 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-md group flex flex-col justify-between h-[300px] overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-600/[0.03] blur-2xl group-hover:bg-violet-600/[0.08] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      
                      {/* Premium AI Assistant Icon with pulsate and sparkles */}
                      <div className="relative shrink-0">
                        <svg className="w-16 h-16 text-violet-400/90 animate-float-slow" viewBox="0 0 64 64" fill="none">
                          <circle cx="32" cy="32" r="26" fill="#0E0F19" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 4" />
                          <rect x="22" y="24" width="20" height="16" rx="4" stroke="#C084FC" strokeWidth="1.5" />
                          <circle cx="28" cy="31" r="1.5" fill="#C084FC" className="animate-pulse" />
                          <circle cx="36" cy="31" r="1.5" fill="#C084FC" className="animate-pulse" />
                          <path d="M28 35 C28 35, 32 37, 36 35" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M32 16 L32 24" stroke="#8B5CF6" strokeWidth="1" />
                          <polygon points="32,12 34,16 32,18 30,16" fill="#A78BFA" className="animate-pulse" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">AI Cognitive Coach</h4>
                        <span className="text-[8px] bg-violet-500/10 text-violet-400 font-extrabold font-mono px-1.5 py-0.5 rounded">ONLINE</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Interactive dialogue mentor utilizing server-side intelligence model. Generate instant summaries, quiz mockups, or custom explanations in detailed tutor mode.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-violet-400 group-hover:text-violet-300 font-black text-[10px] uppercase tracking-wider font-mono">
                      <span>Launch AI Coach Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 2. Smart study timer */}
                  <div 
                    onClick={() => setCurrentTab("focus")} 
                    className="p-5 rounded-2xl border border-white/[0.04] bg-[#090A10]/75 hover:bg-[#0D0E16]/95 hover:border-blue-500/30 transition-all duration-300 cursor-pointer shadow-md group flex flex-col justify-between h-[300px] overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-600/[0.03] blur-2xl group-hover:bg-blue-600/[0.08] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      
                      {/* Premium 3D Clock Timer Illustration */}
                      <div className="relative shrink-0">
                        <svg className="w-16 h-16 text-cyan-400/90 animate-float-brain" viewBox="0 0 64 64" fill="none">
                          <circle cx="32" cy="32" r="24" fill="#0A0B14" stroke="#2563EB" strokeWidth="1.5" />
                          <circle cx="32" cy="32" r="20" stroke="#06B6D4" strokeWidth="0.75" strokeDasharray="2 3" />
                          <path d="M32 16 L32 32 L40 32" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="28" y="4" width="8" height="3" rx="1" fill="#2563EB" />
                          <circle cx="16" cy="16" r="1.5" fill="#3B82F6" />
                          <circle cx="48" cy="16" r="1.5" fill="#3B82F6" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Deep Neuro Timer</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Structure productivity around strict focus cycles flanked by Theta, Alpha and warm Lo-Fi neuro beats to keep your learning pace deeply optimized.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-blue-400 group-hover:text-blue-300 font-black text-[10px] uppercase tracking-wider font-mono">
                      <span>Activate Focus Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 3. Quiz Generator */}
                  <div 
                    onClick={() => setCurrentTab("coach")} 
                    className="p-5 rounded-2xl border border-white/[0.04] bg-[#090A10]/75 hover:bg-[#0D0E16]/95 hover:border-purple-500/30 transition-all duration-300 cursor-pointer shadow-md group flex flex-col justify-between h-[300px] overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-600/[0.03] blur-2xl group-hover:bg-purple-600/[0.08] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                        <PenTool className="w-5 h-5" />
                      </div>
                      
                      {/* Interactive Checklist Document Representation */}
                      <div className="relative shrink-0">
                        <svg className="w-16 h-16 text-purple-400/90 animate-float-slow" viewBox="0 0 64 64" fill="none">
                          <rect x="16" y="12" width="32" height="40" rx="3" fill="#0A0B14" stroke="#8B5CF6" strokeWidth="1.5" />
                          <circle cx="24" cy="22" r="2.5" fill="#C084FC" />
                          <circle cx="24" cy="32" r="2.5" fill="#C084FC" />
                          <circle cx="24" cy="42" r="2.5" fill="#C084FC" />
                          <path d="M30 22 L42 22 M30 32 L42 32 M30 42 L38 42" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M48 6 L16 6" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Quiz Generator</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Convert dry textbook literature into hyper-targeted multiple choice diagnostics. Evaluate your theoretical gaps automatically through AI feedback.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-purple-400 group-hover:text-purple-300 font-black text-[10px] uppercase tracking-wider font-mono">
                      <span>Launch Assessment Module</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 4. Active Recall Flashcards */}
                  <div 
                    onClick={() => setCurrentTab("notes")} 
                    className="p-5 rounded-2xl border border-white/[0.04] bg-[#090A10]/75 hover:bg-[#0D0E16]/95 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer shadow-md group flex flex-col justify-between h-[300px] overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-600/[0.03] blur-2xl group-hover:bg-cyan-600/[0.08] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      
                      {/* Premium Floating Flashcard Stack */}
                      <div className="relative shrink-0">
                        <svg className="w-16 h-16 text-cyan-400/90 animate-float-brain" viewBox="0 0 64 64" fill="none">
                          <polygon points="12,32 32,22 52,32 32,42" fill="#0A0B14" stroke="#0891B2" strokeWidth="1.2" transform="translate(0, 6)" />
                          <polygon points="12,32 32,22 52,32 32,42" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
                          <path d="M22 30 L32 25 L42 30" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="32" cy="32" r="1.5" fill="#22D3EE" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Active Recall Flashcards</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Design custom study cards or let the AI model analyze your notes to compile flashcard pairs. Master complex formulas and terminology efficiently.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-cyan-400 group-hover:text-cyan-300 font-black text-[10px] uppercase tracking-wider font-mono">
                      <span>Launch Storage Matrix</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 5. Smart Study planner */}
                  <div 
                    onClick={() => setCurrentTab("planner")} 
                    className="p-5 rounded-2xl border border-white/[0.04] bg-[#090A10]/75 hover:bg-[#0D0E16]/95 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer shadow-md group flex flex-col justify-between h-[300px] overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-600/[0.03] blur-2xl group-hover:bg-indigo-600/[0.08] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      
                      {/* Calendar Roadmap illustration */}
                      <div className="relative shrink-0">
                        <svg className="w-16 h-16 text-indigo-400/90 animate-float-slow" viewBox="0 0 64 64" fill="none">
                          <rect x="14" y="14" width="36" height="36" rx="4" fill="#0A0B14" stroke="#6366F1" strokeWidth="1.5" />
                          <line x1="14" y1="24" x2="50" y2="24" stroke="#4F46E5" strokeWidth="1.5" />
                          <circle cx="22" cy="19" r="1.5" fill="#818CF8" />
                          <circle cx="42" cy="19" r="1.5" fill="#818CF8" />
                          <line x1="22" y1="10" x2="22" y2="15" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                          <line x1="42" y1="10" x2="42" y2="15" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                          
                          {/* Inside calendar grid markers */}
                          <circle cx="22" cy="32" r="1" fill="#4F46E5" />
                          <circle cx="32" cy="32" r="1.5" fill="#818CF8" className="animate-pulse" />
                          <circle cx="42" cy="32" r="1" fill="#4F46E5" />
                          <circle cx="22" cy="40" r="1" fill="#4F46E5" />
                          <ellipse cx="34" cy="40" rx="3" ry="1.5" fill="#4F46E5" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Dynamic Syllabus Planner</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Calculate relative exam urgency coefficients, allocate daily time ranges, and automatically isolate prayer block overlaps to protect cognitive well-being.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-indigo-400 group-hover:text-indigo-300 font-black text-[10px] uppercase tracking-wider font-mono">
                      <span>Configure Timetable Matrix</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 6. Active Memory Decay Revision tracker */}
                  <div 
                    onClick={() => setCurrentTab("revision")} 
                    className="p-5 rounded-2xl border border-white/[0.04] bg-[#090A10]/75 hover:bg-[#0D0E16]/95 hover:border-violet-500/30 transition-all duration-300 cursor-pointer shadow-md group flex flex-col justify-between h-[300px] overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-600/[0.03] blur-2xl group-hover:bg-violet-600/[0.08] pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      
                      {/* Memory tracking analytics visualizer illustration */}
                      <div className="relative shrink-0">
                        <svg className="w-16 h-16 text-violet-400/90 animate-float-brain" viewBox="0 0 64 64" fill="none">
                          <rect x="10" y="10" width="44" height="44" rx="4" fill="#0A0B14" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="2 3" />
                          <path d="M16 48 L24 38 L32 42 L48 22" stroke="url(#analyticsGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="48" cy="22" r="3.5" fill="#C084FC" className="animate-pulse" />
                          <defs>
                            <linearGradient id="analyticsGrad" x1="16" y1="48" x2="48" y2="22" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#818CF8" />
                              <stop offset="100%" stopColor="#C084FC" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Spaced Revision Matrix</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Trace natural retention decaying trends to optimize active recall sweeps. Lock material in deep long-term storage ahead of critical testing.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-violet-400 group-hover:text-violet-300 font-black text-[10px] uppercase tracking-wider font-mono">
                      <span>Assess Retention Curve</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* 2. Scholar Desk dashboard */}
          {currentTab === "dashboard" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <div>
                  <h3 className="text-lg font-black text-slate-100">Preserved Syllabi Matrix</h3>
                  <p className="text-xs text-slate-400">Active timelines generated by Gemini AI.</p>
                </div>
              </div>

              {studyPlans.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No plans generated. Head to Study Planner to model your syllabus!</p>
              ) : (
                <div className="space-y-4">
                  {studyPlans.map((plan) => (
                    <div key={plan.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{plan.level}</span>
                          <h4 className="text-base font-black text-white">{plan.subject}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic">"{plan.overview}"</p>

                      <div className="space-y-2.5 pt-2">
                        {plan.milestones.map((mil, idx) => (
                          <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">{mil.week}</span>
                              <span className="text-xs font-bold text-white">{mil.title}</span>
                              <div className="flex gap-2 mt-1">
                                {mil.topics.map((t, tid) => (
                                  <span key={tid} className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{t}</span>
                                ))}
                              </div>
                            </div>

                            <button onClick={() => handleGenerateQuiz(plan.subject)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase">
                              Launch Quiz
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Dynamic Study planner tab */}
          {currentTab === "planner" && (
            <SmartPlanner
              routineData={routineData}
              setRoutineData={setRoutineData}
              subjectsList={subjectsList}
              setSubjectsList={setSubjectsList}
              studyPlans={studyPlans}
              setStudyPlans={setStudyPlans}
              selectedPlanDetail={selectedPlanDetail}
              setSelectedPlanDetail={setSelectedPlanDetail}
              showNewAssessment={showNewAssessment}
              setShowNewAssessment={setShowNewAssessment}
              isGeneratingPlan={isGeneratingPlan}
              setIsGeneratingPlan={setIsGeneratingPlan}
              showToast={showToast}
              activeReportTab={activeReportTab}
              setActiveReportTab={setActiveReportTab}
              userName={userName}
              setUserName={setUserName}
              pdfs={pdfs}
              setPdfs={setPdfs}
              xp={xp}
              setXp={setXp}
              coins={coins}
              setCoins={setCoins}
              streak={streak}
              setStreak={setStreak}
              quests={quests}
              setQuests={setQuests}
              onTriggerNotification={triggerNotification}
            />
          )}

          {/* 4. AI Study coach chat */}
          {currentTab === "coach" && (
            <React.Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <span className="ml-2 text-slate-400 text-xs font-bold">Unfolding Premium AI Coach interface...</span>
              </div>
            }>
              <AICoach
                subjects={subjects}
                subjectsList={subjectsList}
                studyPlans={studyPlans}
                setStudyPlans={setStudyPlans}
                setFlashcards={setFlashcards}
                routineData={routineData}
                pdfs={pdfs}
                xp={xp}
                setXp={setXp}
                coins={coins}
                setCoins={setCoins}
                streak={streak}
                goals={goals}
                userName={userName}
                onTriggerNotification={triggerNotification}
                onSelectTab={setCurrentTab}
                logoutUser={() => {
                  if (confirm("⚠️ Clear scholar session and logout?")) {
                    setUserName("");
                    setShowOnboardingModal(true);
                  }
                }}
              />
            </React.Suspense>
          )}

          {/* 5. Subjects catalogs */}
          {currentTab === "subjects" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <SmartPriority 
                subjects={subjects}
                onAddSubject={handleAddSubject}
                awardXp={awardXp}
                showToast={showToast}
              />
            </div>
          )}

          {/* 6. Documents vault archive */}
          {currentTab === "pdf_vault" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <PdfVault 
                pdfs={pdfs}
                subjects={unifiedSubjects}
                onUploadPdf={handleUploadPdf}
                onUpdatePdfPage={handleUpdatePdfPage}
                onUpdatePdfReadingTime={handleUpdatePdfReadingTime}
                onDeletePdf={handleDeletePdf}
                awardXp={awardXp}
                showToast={showToast}
              />
            </div>
          )}

          {/* 7. Image Diagram collection */}
          {currentTab === "topic_gallery" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <TopicGallery 
                images={galleryImages}
                subjects={unifiedSubjects}
                onAddImage={handleAddGalleryImage}
                onRenameImage={handleRenameGalleryImage}
                onDeleteImage={handleDeleteGalleryImage}
                awardXp={awardXp}
                showToast={showToast}
              />
            </div>
          )}

          {/* 8. Scratch Notes block */}
          {currentTab === "notes" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Save form */}
                <form onSubmit={handleSaveScratchedNote} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl h-fit space-y-4">
                  <h4 className="text-sm font-bold text-slate-200">Catalog Scratch outline</h4>
                  
                  <div className="space-y-1 text-xs text-slate-400">
                    <label>Link Course Subject</label>
                    <select
                      value={scratchSubjectId}
                      onChange={(e) => setScratchSubjectId(e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <label>Outline Title</label>
                    <input
                      type="text"
                      value={scratchTitle}
                      onChange={(e) => setScratchTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs text-slate-400">
                    <label>Notes draft content</label>
                    <textarea
                      rows={5}
                      value={scratchBody}
                      onChange={(e) => setScratchBody(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white">
                    Save Note Draft
                  </button>
                </form>

                {/* Draft list catalog */}
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-sm font-bold text-slate-200">Outline Lists</h4>
                  {userNotes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No scratched outline entries completed yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userNotes.map((note) => (
                        <div key={note.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-black text-slate-200">{note.title}</h5>
                            <p className="text-[11px] text-slate-400 mt-1 leading-normal italic">"{note.content}"</p>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-3">
                            <span className="text-[9px] text-slate-500">{note.lastUpdated}</span>
                            <button onClick={() => handleDeleteNote(note.id)} className="text-[9px] text-rose-400 uppercase font-bold">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 9. Focus deep wave controller (Timer Hub) */}
          {currentTab === "focus" && (
            <div className="space-y-8 max-w-lg mx-auto bg-gradient-to-b from-[#0C0C0F] to-[#0A0A0C] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#3B82F6]">{timerType === 'work' ? 'Deep Focus Period' : 'Relax break'}</span>
                <h3 className="text-xl font-bold text-white">Circadian Clock Wave</h3>
              </div>

              {/* Big state clock circle display */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-48 h-48 rounded-full border-4 border-white/10 flex flex-col items-center justify-center bg-black/40">
                  <span className="text-4xl font-black tracking-tight text-white leading-none">
                    {String(focusMinutes).padStart(2, '0')}:{String(focusSeconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{timerType === 'work' ? 'BUILD MODE' : 'CONCLUDE WAVE'}</span>
                </div>
              </div>

              {/* Ambient Wave selectors */}
              <div className="space-y-1 text-center">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">Ambient Sound Oscillator</label>
                <div className="flex gap-2 justify-center pt-2">
                  {(['none', 'sine', 'theta', 'lofi'] as const).map((th) => (
                    <button
                      key={th}
                      onClick={() => setAmbientTheme(th)}
                      className={`px-3 py-1.5 rounded-lg text-xs uppercase font-extrabold transition-all border ${
                        ambientTheme === th
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions trigger */}
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-xs uppercase tracking-widest"
                >
                  {isTimerRunning ? 'Pause cycle' : 'Initiate focus loop'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setFocusMinutes(25);
                    setFocusSeconds(0);
                  }}
                  className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 10. Memory spaces revisions interval checks */}
          {currentTab === "revision" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-200">Active Spaced Receptions</h3>
                  <p className="text-xs text-slate-500">Test memory triggers using loaded flashcards deck.</p>
                </div>
              </div>

              {flashcards.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Pre-seed flashcards or request customized card decks from AI Study Coach!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {flashcards.map((card) => (
                    <div key={card.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Dirac Card #{card.id}</span>
                      <h4 className="text-xs font-bold text-white select-none">Q: {card.front}</h4>
                      <p className="text-xs text-blue-400 select-all leading-normal">Answer: "{card.back}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 11. Modern telemetry diagrams */}
          {currentTab === "analytics" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <AnalyticsPanel 
                subjects={unifiedSubjects}
                focusSessions={[]}
                prayers={prayerDays}
              />
            </div>
          )}

          {/* 12. Streaks and completions displays */}
          {currentTab === "streaks_display" && (
            <div className="space-y-6 max-w-2xl mx-auto bg-white/[0.02] border border-white/5 p-6 rounded-3xl text-center">
              <FlameKindling className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white mt-3">Study Rituals Continuity</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">Conquer days consecutively to trigger XP multiplier awards.</p>
              
              <div className="py-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                  <div key={dayNum} className={`w-10 h-14 rounded-xl flex flex-col items-center justify-center border ${
                    dayNum <= 5
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : 'bg-white/5 border-white/10 text-slate-600'
                  }`}>
                    <span className="text-[9px] font-black uppercase">DAY</span>
                    <span className="text-xs font-black">{dayNum}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-400 font-bold">Awesome! You completed study rituals 14 days consecutively.</p>
            </div>
          )}

          {/* 13. Achievements panels */}
          {currentTab === "achievements" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <DopamineCentrals 
                profile={{ name: userName, xp, level: Math.floor(xp / 500) + 1, coins, streak, lastActiveDate: "", isPro: false }}
                quests={quests}
                achievements={achievements}
                onCompleteQuest={handleCompleteQuest}
                onBuyItem={handleBuyPrestigeItem}
                onUnlockAchievement={handleUnlockAchievement}
                awardXp={awardXp}
                showToast={showToast}
              />
            </div>
          )}

          {/* 14. Muslim prayer center */}
          {currentTab === "prayer" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <PrayerHub 
                prayerRecords={prayerDays}
                onTogglePrayer={handleTogglePrayer}
                onPauseStudyTimer={() => setIsTimerRunning(false)}
                awardXp={awardXp}
                addCoins={addCoins}
                showToast={showToast}
              />
            </div>
          )}

          {/* 15. Circumstances wake log */}
          {currentTab === "wakeup" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <WakeUpHub 
                wakeLogs={wakeUpLogs}
                onLogWakeUp={handleLogWakeUp}
                awardXp={awardXp}
                addCoins={addCoins}
                showToast={showToast}
              />
            </div>
          )}

          {/* 16. Target landmarks goals */}
          {currentTab === "goals" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Form creator */}
                <form onSubmit={handleAddMilestoneGoal} className="bg-[#0C0C0F]/50 border border-white/5 p-5 rounded-2xl h-fit space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Map Custom Landmark</h4>
                  
                  <div className="space-y-1 font-bold text-xs text-slate-500">
                    <label>Landmark Title</label>
                    <input
                      type="text"
                      placeholder="e.g. normalize complex potential wavefunctions"
                      value={goalTitleInput}
                      onChange={(e) => setGoalTitleInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-xs font-bold text-slate-500">Target Completion Date</label>
                    <input
                      type="date"
                      value={goalDateInput}
                      onChange={(e) => setGoalDateInput(e.target.value)}
                      className="bg-[#0A0A0B] border border-white/10 rounded-xl px-2 py-2 text-xs text-white"
                    />
                  </div>

                  <button type="submit" className="w-full py-2 bg-blue-600 rounded-xl text-xs font-bold text-white">
                    Seed Landmark Goal
                  </button>
                </form>

                {/* Goals visualizer list */}
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-sm font-bold text-slate-200">Active Landmarks list</h4>
                  {goals.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No targets defined yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {goals.map((g) => (
                        <div key={g.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className={`text-xs font-semibold block transition-all ${g.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {g.title}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 block">Limit: <strong>{g.targetDate}</strong> — Bonus Award: +{g.xpReward} XP</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleGoal(g.id)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                g.completed
                                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                                  : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                              }`}
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteGoal(g.id)} className="text-xs text-rose-500 font-bold uppercase p-1">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 17. Alert System lists */}
          {currentTab === "notifications_tab" && (
            <div className="space-y-6 max-w-xl mx-auto bg-white/[0.02] border border-white/5 p-5 rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span>Interactive notifications ledger</span>
                </h3>
              </div>

              <div className="space-y-2.5 pt-3">
                {notificationsAlerts.map((l) => (
                  <div key={l.id} className="p-3 bg-[#0E0E12] border border-white/5 rounded-xl">
                    <p className="text-xs font-black text-slate-100">{l.title}</p>
                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{l.body}</p>
                    <span className="text-[9px] text-slate-500 mt-2 block">{l.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 18. Backup database nodes locally */}
          {currentTab === "backup" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-[#0C0C0F]/80 p-6 rounded-3xl border border-white/10 text-center space-y-4 shadow-2xl max-w-xl mx-auto">
                <Cloud className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-white">Full Database JSON Portability</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  Export your entire StudyForge AI profile, subjects list, pdf reader milestones, and spiritual checklists to a portable JSON backup file. Restore it cleanly anytime.
                </p>

                <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleDownloadBackup}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup JSON</span>
                  </button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <button
                      className="w-full px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Restore JSON Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 19. Workspace settings */}
          {currentTab === "settings" && (
            <div className="space-y-6 max-w-2xl mx-auto bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-5">
              <h3 className="text-base font-black text-white">Profile & Preferences</h3>

              <div className="space-y-4">
                <div className="space-y-1.5 text-xs text-slate-400">
                  <label>Change Scholar handle/identity name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Trigger Desktop notifications</h4>
                    <p className="text-[10px] text-slate-500">Enable reminders during focus conclusiveness waves.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="accent-blue-500 h-4 w-4"
                  />
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-3">
                  <button
                    onClick={handleResetSystem}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-extrabold uppercase"
                  >
                    Wipe Database Cache
                  </button>
                </div>
              </div>
            </div>
          )}

          </React.Suspense>
        </motion.div>
      </div>

      {/* Onboarding welcome modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 bg-[#020203]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <form onSubmit={handleOnboardingSubmit} className="bg-[#09090C] border border-white/10 p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Welcome, Scholar!</h3>
              <p className="text-slate-400 text-xs">Register your academic persona handle to configure baseline cognitive parameters.</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <label>Scholar Name</label>
              <input
                type="text"
                required
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 outline-none focus:border-blue-500/50"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase text-white shadow-xl shadow-blue-600/10 transition-all">
              Initiate Cognitive Forge Engine (+500 XP)
            </button>
          </form>
        </div>
      )}

        </motion.div>
      )}
    </AnimatePresence>
  );
}
