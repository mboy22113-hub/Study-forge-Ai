/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  Compass,
  Zap,
  Clock,
  BarChart2,
  Trophy,
  Settings as SettingsIcon,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle,
  HelpCircle,
  User,
  LogOut,
  Send,
  Loader2,
  Award,
  Calendar,
  X,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Bell
} from "lucide-react";

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

// In-App Mock Notification Generator (for secure and clean notification display)
const notify = (title: string, message: string) => {
  const isEnabled = typeof window !== "undefined" ? localStorage.getItem("sf_notifications_enabled") !== "false" : true;
  if (isEnabled && typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: "/assets/logo.png" });
    }
  }
};

// Main state interface
interface StudyPlan {
  id: string;
  subject: string;
  level: string;
  overview: string;
  proTip: string;
  milestones: Array<{
    week: string;
    title: string;
    topics: string[];
    estimatedHours: number;
    quizAvailable: boolean;
    completed?: boolean;
  }>;
}

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export default function App() {
  // Persistent user statistics
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem("sf_xp");
    return saved ? parseInt(saved, 10) : 12450;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("sf_streak");
    return saved ? parseInt(saved, 10) : 14;
  });
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem("sf_username");
    return saved || "Alex Mercer";
  });
  const [tempName, setTempName] = useState(() => {
    const savedName = localStorage.getItem("sf_username");
    return savedName || "";
  });
  const [tempNotificationsEnabled, setTempNotificationsEnabled] = useState(true);
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

  // Flow State
  const [currentTab, setCurrentTab] = useState<
    "landing" | "dashboard" | "planner" | "coach" | "focus" | "analytics" | "rewards" | "settings"
  >("landing");

  // Loaded/stored databases
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem("sf_plans");
    return saved ? JSON.parse(saved) : [
      {
        id: "demo-plan-1",
        subject: "Advanced Quantum Mechanics",
        level: "Postgraduate",
        overview: "A rigorous deep dive into quantum probability densities, Hilbert spaces, and particle-wave behavior.",
        proTip: "Prioritize derivation exercises. Working out normalization integrals by hand builds intuitive physical models.",
        milestones: [
          {
            week: "Week 1-2",
            title: "Hilbert Space & Operator Dirac Formalism",
            topics: ["Bra-ket algebraic representation", "Hermitian matrices", "Self-adjoint operators"],
            estimatedHours: 8,
            quizAvailable: true,
            completed: true
          },
          {
            week: "Week 3",
            title: "Schrödinger Probability Normalization",
            topics: ["Probability density functions", "Particle in a 1D Box", "Zero-point energy calculations"],
            estimatedHours: 6,
            quizAvailable: true,
            completed: false
          },
          {
            week: "Week 4",
            title: "Hermitian Operator Eigenvalues",
            topics: ["Eigenstates and eigenvalue calculations", "Uncertainty principle proof"],
            estimatedHours: 10,
            quizAvailable: true,
            completed: false
          }
        ]
      }
    ];
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("sf_flashcards");
    return saved ? JSON.parse(saved) : [
      { id: 1, front: "What is Schrödinger's normalization equation representing?", back: "It ensures the probability of finding a particle somewhere in space equals 1. The integral of the absolute square of the wavefunction over all space equals 1." },
      { id: 2, front: "Define Bra-Ket notation mathematically.", back: "Dirac notation representing vectors in a complex Hilbert space: kets |ψ⟩ are column vectors (states), and bras ⟨ψ| are dual row vectors. Under multiplication, ⟨φ|ψ⟩ is an inner product scalar." },
      { id: 3, front: "What is the Pauli Exclusion Principle?", back: "A quantum mechanical principle stating that two or more identical fermions cannot occupy the same quantum state simultaneously within a quantum system." }
    ];
  });

  // Toast / XP popup indicators
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [xpAddedIndicator, setXpAddedIndicator] = useState<{ amount: number; id: number } | null>(null);

  // Focus Module State
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<"work" | "break">("work");
  const [ambientTheme, setAmbientTheme] = useState<"none" | "sine" | "theta" | "lofi">("none");
  const [strictFocusMode, setStrictFocusMode] = useState(false);
  const [focusLogs, setFocusLogs] = useState<{ day: string; minutes: number }[]>(() => {
    const saved = localStorage.getItem("sf_focus_logs");
    return saved ? JSON.parse(saved) : [
      { day: "Mon", minutes: 120 },
      { day: "Tue", minutes: 90 },
      { day: "Wed", minutes: 150 },
      { day: "Thu", minutes: 40 },
      { day: "Fri", minutes: 180 },
      { day: "Sat", minutes: 220 },
      { day: "Sun", minutes: 15 }
    ];
  });

  // AI Planner Generator UI States
  const [plannerSubject, setPlannerSubject] = useState("");
  const [plannerLevel, setPlannerLevel] = useState("Undergraduate");
  const [plannerFocus, setPlannerFocus] = useState("");
  const [plannerDuration, setPlannerDuration] = useState(4);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // AI Study Coach Chat UI States
  const [currentChatSubject, setCurrentChatSubject] = useState("Quantum Mechanics");
  const [coachInputs, setCoachInputs] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    { role: "model", content: "Greetings scholar! I'm your StudyForge AI Coach. Select your subject or ask any advanced topic. Shall we generate quick exercises or test flashcards?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Quick Flashcard Gen UI states
  const [flashcardSubject, setFlashcardSubject] = useState("Wave-Particle Duality");
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Quiz active State
  const [activeQuizTopic, setActiveQuizTopic] = useState("General Physics");
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 1,
      question: "Which physical constant relates a photon's energy to its electromagnetic wave frequency?",
      options: ["Boltzmann's Constant", "Planck's Constant", "Rydberg Constant", "Stefan-Boltzmann Constant"],
      correctAnswerIndex: 1,
      explanation: "Planck's Constant (h ≈ 6.626 x 10^-34 J·s) is the fundamental constant of quantum mechanics relating energy (E) to frequency (ν) via E = hν."
    },
    {
      id: 2,
      question: "What does the Heisenberg Uncertainty Principle physically constrain?",
      options: ["Orbital radius and angular momentum", "Momentum and position measurements simultaneously", "Relativistic mass and kinetic energy", "Spin quantization directions only"],
      correctAnswerIndex: 1,
      explanation: "It limits how precisely we can measure both the position and momentum of a particle simultaneously."
    }
  ]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Sync state modifications to LocalStorage
  useEffect(() => {
    localStorage.setItem("sf_xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("sf_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("sf_username", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("sf_notifications_enabled", notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("sf_target_hours", targetHours.toString());
  }, [targetHours]);

  useEffect(() => {
    localStorage.setItem("sf_plans", JSON.stringify(studyPlans));
  }, [studyPlans]);

  useEffect(() => {
    localStorage.setItem("sf_flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem("sf_focus_logs", JSON.stringify(focusLogs));
  }, [focusLogs]);

  // Clock state mechanics
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
          // Timer finished
          triggerTimerFinish();
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, focusMinutes, focusSeconds]);

  // Handle ambient synthesize track change
  useEffect(() => {
    if (ambientTheme !== "none") {
      synthInstance.start(ambientTheme);
    } else {
      synthInstance.stop();
    }
    return () => {
      synthInstance.stop();
    };
  }, [ambientTheme]);

  // Request notifications permission when mounting settings or timer
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const triggerTimerFinish = () => {
    setIsTimerRunning(false);
    const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABgAYmF0YWhlYWRlcg==");
    audio.play().catch(() => {});

    if (timerType === "work") {
      const addedXp = 150;
      awardXp(addedXp);
      showToast(`🔥 Masterful Session Complete! You earned +${addedXp} Scholar XP.`);
      notify("Deep Work Completed!", `Splendid focus, ${userName}. Take a 5-minute break and claim 150 XP!`);

      // Update today's logs
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = days[new Date().getDay()];
      setFocusLogs((prev) =>
        prev.map((log) => (log.day === currentDay ? { ...log, minutes: log.minutes + 25 } : log))
      );

      // Settle break state
      setTimerType("break");
      setFocusMinutes(5);
      setFocusSeconds(0);
    } else {
      showToast("🏆 Break is over. Returning to Deep Work status!");
      notify("Break's Over!", "Ready to build? Focus cycle is initiating now!");
      setTimerType("work");
      setFocusMinutes(25);
      setFocusSeconds(0);
    }
  };

  const awardXp = (amount: number) => {
    setXp((prev) => prev + amount);
    setXpAddedIndicator({ amount, id: Date.now() });
    setTimeout(() => setXpAddedIndicator(null), 2500);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // UI state derived calculations
  const calculateLevel = (currentXp: number) => {
    return Math.floor(currentXp / 500) + 1;
  };
  const scholarLevel = calculateLevel(xp);
  const xpNeededForNextLevel = scholarLevel * 500;
  const xpIntoCurrentLevel = xp % 500;
  const progressBarPercent = Math.min(Math.round((xpIntoCurrentLevel / 500) * 100), 100);

  // Generate study plan with real API
  const handleGenerateStudyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerSubject.trim()) {
      showToast("⚠️ Please specify a target subject to plan!");
      return;
    }

    setIsGeneratingPlan(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "study_plan",
          payload: {
            subject: plannerSubject,
            level: plannerLevel,
            studyFocus: plannerFocus,
            durationWeeks: plannerDuration,
            hoursPerDay: targetHours
          }
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Generation query failed.");
      }

      const freshPlan = await response.json();
      const planObject: StudyPlan = {
        id: `plan-${Date.now()}`,
        subject: plannerSubject,
        level: plannerLevel,
        overview: freshPlan.overview || "Deep analytical plan generated dynamically with StudyForge AI.",
        proTip: freshPlan.proTip || "Remain consistent and test your retention using flashcards.",
        milestones: (freshPlan.milestones || []).map((m: any, idx: number) => ({
          ...m,
          completed: false,
          quizAvailable: true
        }))
      };

      setStudyPlans((prev) => [planObject, ...prev]);
      awardXp(300);
      showToast(`✨ Generated a brand new study plan containing ${planObject.milestones.length} milestones! +300 XP`);
      setPlannerSubject("");
      setPlannerFocus("");
    } catch (err: any) {
      console.error(err);
      showToast(`❌ Connection Error: ${err.message || "Failed to reach AI Forge service."}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Generate continuous AI flashcards with real API
  const handleGenerateFlashcards = async () => {
    if (!flashcardSubject.trim()) {
      showToast("⚠️ Enter a core focus topic for the flashcards.");
      return;
    }
    setIsGeneratingFlashcards(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flashcards",
          payload: {
            subject: flashcardSubject,
            count: 6
          }
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact flashcard service.");
      }

      const newCards = await response.json();
      if (Array.isArray(newCards)) {
        const processed = newCards.map((c, idx) => ({
          id: Date.now() + idx,
          front: c.front || "Concept Frontside Key",
          back: c.back || "Concept Solution Backside"
        }));
        setFlashcards((prev) => [...processed, ...prev]);
        awardXp(200);
        showToast(`📚 StudyForge successfully synthesized ${processed.length} premium deck flashcards! +200 XP`);
      }
    } catch (e: any) {
      showToast(`❌ Generation failure: ${e.message}`);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Generate interactive subject quizzes with real API
  const handleGenerateQuiz = async (subjectTopic: string) => {
    setIsGeneratingQuiz(true);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setActiveQuizTopic(subjectTopic);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          payload: {
            topic: subjectTopic,
            difficulty: "Scholar Medium",
            numQuestions: 5
          }
        })
      });

      if (!response.ok) {
        throw new Error("API quiz stream is temporarily congested.");
      }

      const parsedQuestions = await response.json();
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        setActiveQuizQuestions(parsedQuestions);
        showToast(`⚡ AI Coach generated 5 academic questions on "${subjectTopic}"! Answer correctly to trigger massive XP.`);
      } else {
        showToast("⚠️ The model returned blank questions. Please try again.");
      }
    } catch (err: any) {
      showToast(`❌ Failed to design quiz: ${err.message}`);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Multi-turn tutor messaging with real API
  const handleSendCoachMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInputs.trim() || isChatLoading) return;

    const userMsg = coachInputs;
    setCoachInputs("");

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
            messages: updatedMessages.slice(-6), // Send last 6 messages context
            currentSubject: currentChatSubject
          }
        })
      });

      if (!response.ok) {
        throw new Error("Tutor pipeline congested.");
      }

      const result = await response.json();
      setChatMessages((prev) => [...prev, { role: "model", content: result.text || "I apologize, my neural weights are recalculating. Could you reformulate that concept?" }]);
      awardXp(50);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: "model", content: `🚨 Core link failed: ${err.message || "Unable to retrieve text from Gemini server node."}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Tick off milestone steps & gain XP
  const toggleMilestoneComplete = (planId: string, milestoneIndex: number) => {
    setStudyPlans((prevPlans) =>
      prevPlans.map((plan) => {
        if (plan.id === planId) {
          const updatedMilestones = [...plan.milestones];
          const item = updatedMilestones[milestoneIndex];
          const nextCompleted = !item.completed;
          updatedMilestones[milestoneIndex] = { ...item, completed: nextCompleted };

          if (nextCompleted) {
            awardXp(100);
            showToast(`⭐ Milestone Done: "${item.title}"! +100 XP`);
          } else {
            setXp((prev) => Math.max(0, prev - 100));
            showToast("Milestone uncompleted. -100 XP adjusted.");
          }

          return { ...plan, milestones: updatedMilestones };
        }
        return plan;
      })
    );
  };

  const deleteStudyPlan = (planId: string) => {
    setStudyPlans((prev) => prev.filter((p) => p.id !== planId));
    showToast("Study plan cleared.");
  };

  const deleteFlashcard = (id: number) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
    showToast("Flashcard omitted from pile.");
  };

  // Reset core metrics
  const resetAllProgress = () => {
    if (confirm("⚠️ Are you sure you want to hard reset all of your StudyForge AI student progression metrics? This cannot be undone.")) {
      localStorage.clear();
      setXp(500);
      setStreak(1);
      setUserName("Junior Scholar");
      setTempName("");
      setTargetHours(4);
      setStudyPlans([]);
      setFlashcards([]);
      setCurrentTab("settings");
      setShowOnboardingModal(true);
      showToast("🔄 Application data fully factory reset!");
    }
  };

  // Configured file import/exports
  const handleExportDataForVercel = () => {
    const dataStr = JSON.stringify({
      xp,
      streak,
      userName,
      targetHours,
      studyPlans,
      flashcards,
      focusLogs
    }, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `studyforge_data_${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    showToast("💾 Export file successfully compiled and downloaded!");
  };

  const handleImportDataForVercel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (fileEvent) => {
        try {
          const parsed = JSON.parse(fileEvent.target?.result as string);
          if (parsed.xp !== undefined) setXp(parsed.xp);
          if (parsed.streak !== undefined) setStreak(parsed.streak);
          if (parsed.userName !== undefined) setUserName(parsed.userName);
          if (parsed.targetHours !== undefined) setTargetHours(parsed.targetHours);
          if (parsed.studyPlans !== undefined) setStudyPlans(parsed.studyPlans);
          if (parsed.flashcards !== undefined) setFlashcards(parsed.flashcards);
          if (parsed.focusLogs !== undefined) setFocusLogs(parsed.focusLogs);
          showToast("📂 Core local state database successfully populated!");
        } catch (error) {
          showToast("❌ Invalid StudyForge JSON file schema!");
        }
      };
    }
  };

  // Submit active quiz answers
  const handleSubmitQuiz = () => {
    let score = 0;
    activeQuizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    const xpPayout = score * 50;
    awardXp(xpPayout);
    showToast(`📝 Quiz submitted successfully! Score: ${score}/${activeQuizQuestions.length}. +${xpPayout} Scholar XP.`);
  };

  return (
    <div id="studyforge-root" className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans flex flex-col md:flex-row overflow-x-hidden relative">
      
      {/* Floating Sparkles dynamic visual level-up notification */}
      {xpAddedIndicator && (
        <div className="fixed top-8 right-8 z-[90] bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-[1px] rounded-2xl shadow-2xl animate-bounce">
          <div className="bg-[#0D0D0D] px-6 py-4 rounded-[15px] flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            <div>
              <p className="text-white font-black text-sm">LEVEL UP PATHWAY</p>
              <p className="text-xs text-blue-400 font-medium">Earned +{xpAddedIndicator.amount} Scholar XP!</p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent overlay notification toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[90] bg-[#0E0E0E] border border-blue-500/30 text-slate-200 px-6 py-4 rounded-xl shadow-2xl max-w-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-sm">{toastMessage}</p>
        </div>
      )}

      {/* Interactive Scholar Onboarding Name & Alerts Setup Modal */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070708]/95 backdrop-blur-xl p-4">
          <div className="w-full max-w-md bg-[#0D0D11] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Glowing circle behind top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="text-center space-y-2 relative">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/10 mb-4">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Setup Your StudyForge AI Workspace</h2>
              <p className="text-sm text-slate-400">
                Let's customize your advanced scholar workspace. Enter your name and set your system notifications alert channel to begin.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!tempName.trim()) {
                showToast("⚠️ Please enter your name to customize your workspace.");
                return;
              }
              const finalName = tempName.trim();
              setUserName(finalName);
              localStorage.setItem("sf_username", finalName);
              localStorage.setItem("sf_onboarded", "true");
              setShowOnboardingModal(false);
              
              if (tempNotificationsEnabled) {
                localStorage.setItem("sf_notifications_enabled", "true");
                setNotificationsEnabled(true);
                if (typeof window !== "undefined" && "Notification" in window) {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification("🔔 Setup Complete!", {
                        body: `Welcome, ${finalName}! System notifications are configured successfully.`,
                        icon: "/assets/logo.png"
                      });
                    }
                  });
                }
              } else {
                localStorage.setItem("sf_notifications_enabled", "false");
                setNotificationsEnabled(false);
              }
              showToast(`🎓 Welcome aboard, ${finalName}! Your scholar space is forged.`);
            }} className="space-y-6 relative">
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  What is your name?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </div>

              {/* Dynamic notification toggle option option */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <span>Sound Alerts & System Notifications</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive live desktop reminders when Pomodoro focus timers complete or target study goals are met.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempNotificationsEnabled}
                    onClick={() => setTempNotificationsEnabled(!tempNotificationsEnabled)}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      tempNotificationsEnabled ? "bg-blue-600" : "bg-slate-800"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform transform ${
                      tempNotificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}></span>
                  </button>
                </div>
                
                {tempNotificationsEnabled && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof window !== "undefined" && "Notification" in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                          new Notification("🔊 Audio & Text Alert Active", {
                            body: "Test notification from StudyForge AI. It is working!",
                            icon: "/assets/logo.png"
                          });
                          showToast("🔔 Notification successfully sent! Verify your screen corner.");
                        } else {
                          showToast("⚠️ Permission denied. Open browser settings to authorize notifications.");
                        }
                      } else {
                        showToast("❌ System notifications not supported in this browser.");
                      }
                    }}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] text-slate-300 font-extrabold uppercase tracking-widest transition"
                  >
                    Send Test Desktop Alert
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <span>Authorize & Begin Learning</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0D0D0D] z-10 p-4 md:p-6 transition-all">
        {/* Brand identity header */}
        <div className="flex items-center gap-3 my-2 cursor-pointer pb-6 border-b border-white/5" onClick={() => setCurrentTab("landing")}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-none">
              StudyForge <span className="text-blue-500 text-sm font-semibold">AI</span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold self-start mt-0.5">
              by Nexa Labs
            </span>
          </div>
        </div>

        {/* Global Level Indicator Badge */}
        <div className="mt-4 p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full bg-[#0D0D0D] flex items-center justify-center font-black text-xs text-white">
              {scholarLevel}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Level</p>
            <p className="text-sm font-semibold text-white">Scholar Apprentice</p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="flex-1 space-y-1.5 mt-6">
          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("landing");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "landing"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Launch Pad</span>
          </button>

          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("dashboard");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "dashboard"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Scholar Desk</span>
          </button>

          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("planner");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "planner"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>AI Study Planner</span>
          </button>

          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("coach");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "coach"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>AI Study Coach</span>
          </button>

          <button
            onClick={() => setCurrentTab("focus")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "focus"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Focus Center</span>
          </button>

          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("analytics");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "analytics"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("rewards");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "rewards"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0 animate-bounce" />
            <span>Rewards & Badges</span>
          </button>

          <button
            onClick={() => {
              if (strictFocusMode) {
                showToast("⚠️ Strict work mode active. Unlock timer first!");
                return;
              }
              setCurrentTab("settings");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === "settings"
                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Interactive progress indicators */}
        <div className="p-4 bg-gradient-to-br from-blue-900/10 to-purple-900/10 rounded-2xl border border-blue-500/10 mt-6">
          <div className="flex justify-between items-center text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
            <span>Scholar Level {scholarLevel}</span>
            <span>{progressBarPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressBarPercent}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            {xpNeededForNextLevel - xpIntoCurrentLevel} XP required to Level Up
          </p>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col relative w-full overflow-y-auto">
        {/* Global top sub-banner */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Welcome back</p>
              <h1 className="text-lg md:text-xl font-black text-white">{userName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Live active connection indicators */}
            <div className="hidden lg:flex items-center gap-2 bg-emerald-950/30 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Gemini Multi-Models Active
              </span>
            </div>

            {/* Daily streak widget */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              <span className="text-xs font-extrabold text-amber-500">{streak} Day Streak</span>
            </div>

            {/* Main user statistics */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-white">{xp.toLocaleString()} XP</p>
                <p className="text-[9px] uppercase tracking-widest text-[#3B82F6] font-extrabold">Total Points</p>
              </div>
            </div>
          </div>
        </header>

        {/* Central views with transition loaders */}
        <div className="flex-1 p-6 md:p-8 animate-fade-in">
          {currentTab === "landing" && (
            <div className="max-w-4xl mx-auto py-8 text-center space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                    SaaS-Style Cognitive Study Suite
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  Accelerate Learning via <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    StudyForge AI Cognitive Engine
                  </span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  An advanced scholar workspace modeled after Google AI Studio. Synthesize personalized, step-by-step syllabi, challenge retention with generative flashcards, and activate binaural deep-work frequencies.
                </p>
              </div>

              {/* Landing CTA row */}
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <button
                  onClick={() => setCurrentTab("dashboard")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/15 flex items-center gap-3 shrink-0"
                >
                  <span>Build Your Scholar Workspace</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentTab("settings")}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-all border border-white/10 hover:border-white/20"
                >
                  Configure Secrets
                </button>
              </div>

              {/* Bento styled feature showcases */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
                <div className="p-6 bg-[#0E0E0E] rounded-2xl border border-white/5 space-y-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-lg">AI Syllabus Forging</h3>
                  <p className="text-slate-500 text-sm">
                    Feed study metrics to the Gemini model to parse customized curriculums complete with hours breakdown.
                  </p>
                </div>

                <div className="p-6 bg-[#0E0E0E] rounded-2xl border border-white/5 space-y-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Pure Binaural Engine</h3>
                  <p className="text-slate-500 text-sm">
                    Leverage raw low-latency browser synthesize frequencies to tune spatial brain activity for complex engineering topics.
                  </p>
                </div>

                <div className="p-6 bg-[#0E0E0E] rounded-2xl border border-white/5 space-y-3">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Adaptive XP Path</h3>
                  <p className="text-slate-500 text-sm">
                    Earn instant XP multipliers upon completing milestones, passing flashcards, and executing pomodoro sets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentTab === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Daily study quote section */}
              <div className="bg-gradient-to-r from-[#0C152B] to-[#140C26] rounded-3xl p-6 md:p-8 border border-blue-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 z-10">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                    Scholar Intelligence Feed
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    Unlock true retention metrics, {userName}!
                  </h2>
                  <p className="text-slate-400 text-sm max-w-xl">
                    You have successfully tackled <span className="text-blue-400 font-extrabold">{studyPlans.length * 4} study modules</span>. Keep up your focus multiplier on StudyForge and stack higher medals.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab("planner")}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 shrink-0 z-10"
                >
                  Create New Blueprint
                </button>
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[80px] rounded-full"></div>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-12 gap-6">
                
                {/* Active study schedule (Left column upper) */}
                <section className="col-span-12 lg:col-span-8 bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">Active Academic Blueprint</h3>
                      <p className="text-xs text-slate-500">Milestone completion tracks progression points</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full">
                      {studyPlans.length} Active Plan(s)
                    </span>
                  </div>

                  {studyPlans.length === 0 ? (
                    <div className="p-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                      <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">No blueprints drafted yet.</p>
                      <button
                        onClick={() => setCurrentTab("planner")}
                        className="text-xs font-bold text-blue-400 mt-2 hover:underline"
                      >
                        Generate custom study syllabus via Gemini →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studyPlans.map((plan) => (
                        <div key={plan.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 hover:border-white/10 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-bold text-md">{plan.subject}</h4>
                              <p className="text-xs text-slate-500 uppercase tracking-wider">{plan.level}</p>
                            </div>
                            <button
                              onClick={() => deleteStudyPlan(plan.id)}
                              className="text-slate-600 hover:text-red-400 p-1"
                              title="Delete Plan"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {plan.milestones.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                                  item.completed ? "bg-blue-500/5 border border-blue-500/10" : "bg-[#111] border border-white/5"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleMilestoneComplete(plan.id, idx)}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                      item.completed
                                        ? "bg-blue-600 border-blue-500 text-white"
                                        : "border-white/20 hover:border-white/40"
                                    }`}
                                  >
                                    {item.completed && <CheckCircle className="w-4 h-4" />}
                                  </button>
                                  <div>
                                    <p className={`text-xs font-semibold ${item.completed ? "text-slate-400 line-through" : "text-white"}`}>
                                      {item.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500">{item.week} • {item.estimatedHours}h estimated</p>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.completed ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400"}`}>
                                  {item.completed ? "COMPLETED" : "PENDING"}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex justify-between items-center border-t border-white/5">
                            <p className="text-[10px] text-slate-500 italic max-w-sm truncate">
                              <strong>AI Coach Advice:</strong> {plan.proTip}
                            </p>
                            <button
                              onClick={() => {
                                setCurrentChatSubject(plan.subject);
                                setCurrentTab("coach");
                              }}
                              className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <span>Discuss with Coach</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Focus summary panel (Right Column side) */}
                <section className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center relative overflow-hidden h-full">
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-extrabold mb-2">Focus Room status</h3>
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-blue-600/30 flex items-center justify-center mb-4 relative z-10 animate-spin-slow">
                      <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/10 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white font-mono">
                          {focusMinutes.toString().padStart(2, "0")}:{focusSeconds.toString().padStart(2, "0")}
                        </span>
                        <span className="text-[8px] tracking-widest text-[#3B82F6] font-black uppercase mt-0.5">
                          {timerType === "work" ? "FOCUSING" : "BREAKTIME"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 w-full relative z-10">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                            isTimerRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isTimerRunning ? "PAUSE" : "START TIME"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsTimerRunning(false);
                            setFocusMinutes(timerType === "work" ? 25 : 5);
                            setFocusSeconds(0);
                          }}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all border border-white/5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                        <span className="text-slate-400">Strict mode blocking:</span>
                        <span className={`font-bold ${strictFocusMode ? "text-emerald-400" : "text-amber-500"}`}>
                          {strictFocusMode ? "ENABLED" : "DISABLED"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Scholar Deck Flashcard pile */}
                <section className="col-span-12 md:col-span-6 bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">Active Flashcards</h3>
                      <p className="text-xs text-slate-500">Fast recap deck stored in LocalStorage</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab("coach")}
                      className="text-xs font-bold text-purple-400 hover:underline"
                    >
                      Forge More →
                    </button>
                  </div>

                  {flashcards.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No active cards. Generate some using the Flashcard Engine.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-1">
                      {flashcards.map((card) => (
                        <div key={card.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-blue-400">Q: {card.front}</p>
                            <p className="text-xs text-slate-400 mt-1">A: {card.back}</p>
                          </div>
                          <button
                            onClick={() => deleteFlashcard(card.id)}
                            className="text-slate-600 hover:text-red-400 p-1 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Exam countdown scheduler checklist */}
                <section className="col-span-12 md:col-span-6 bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-4">
                  <h3 className="text-lg font-extrabold text-white">Exam Countdowns</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/15 rounded-xl flex items-center justify-center text-pink-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">Particle Dynamics Exam</p>
                          <p className="text-[10px] text-slate-500">Core engineering track syllabus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-500 text-sm font-black animate-pulse">9 Days Left</p>
                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">June 15</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">Complex Algebra Finals</p>
                          <p className="text-[10px] text-slate-500">Matrices & Group theory</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 text-sm font-black">24 Days Left</p>
                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">June 30</p>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          )}

          {currentTab === "planner" && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-blue-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cognitive AI</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Draft Academic Blueprints</h2>
                <p className="text-slate-400 text-sm">
                  Utilize server-side connected Gemini model architecture to generate structured syllabi timelines mapped to study hours.
                </p>
              </div>

              {/* Generator input card */}
              <form onSubmit={handleGenerateStudyPlan} className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Academic Subject
                    </label>
                    <input
                      type="text"
                      value={plannerSubject}
                      onChange={(e) => setPlannerSubject(e.target.value)}
                      placeholder="e.g. Statistical Physics, Molecular Biology"
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Standard Level
                    </label>
                    <select
                      value={plannerLevel}
                      onChange={(e) => setPlannerLevel(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all"
                    >
                      <option className="bg-[#0A0A0A]" value="High School">High School Degree</option>
                      <option className="bg-[#0A0A0A]" value="Undergraduate">Undergraduate Degree</option>
                      <option className="bg-[#0A0A0A]" value="Postgraduate">Postgraduate Degree</option>
                      <option className="bg-[#0A0A0A]" value="Ph.D. Scholar">Doctorate / Ph.D.</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Focus Area Details
                    </label>
                    <input
                      type="text"
                      value={plannerFocus}
                      onChange={(e) => setPlannerFocus(e.target.value)}
                      placeholder="e.g. Wavefunctions, Probability densities, normalizing constants..."
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Study Duration (Weeks)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={plannerDuration}
                      onChange={(e) => setPlannerDuration(parseInt(e.target.value, 10))}
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Daily Study Allocation
                    </label>
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400">
                      Inherited: <strong className="text-white">{targetHours} Hours/Day</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isGeneratingPlan}
                    className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-xl shadow-blue-600/10 flex items-center justify-center gap-2"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Molding Blueprint Syllabus...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Study Plan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Render generated plans database list */}
              <div className="space-y-6">
                <h3 className="text-lg font-black text-white">Drafted Syllabi</h3>
                {studyPlans.map((plan) => (
                  <div key={plan.id} className="p-6 bg-[#0E0E0E] rounded-3xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white">{plan.subject}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {plan.level}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteStudyPlan(plan.id)}
                        className="px-3 py-1 bg-red-950/20 border border-red-900/40 text-red-400 rounded-lg text-xs"
                      >
                        Delete Blueprint
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-slate-300 text-sm">{plan.overview}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {plan.milestones.map((item, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-2xl border text-sm space-y-2 transition-all cursor-pointer ${
                              item.completed
                                ? "bg-blue-600/5 border-blue-500/20 text-slate-400"
                                : "bg-white/[0.01] border-white/5 text-slate-200 hover:border-white/10"
                            }`}
                            onClick={() => toggleMilestoneComplete(plan.id, index)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs uppercase tracking-widest text-slate-500 font-black">
                                {item.week}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${item.completed ? "bg-blue-500" : "bg-amber-500"}`}></span>
                            </div>
                            <p className="font-bold text-white">{item.title}</p>
                            <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc">
                              {item.topics.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                            <p className="text-[10px] pt-1 text-slate-500">Hours Target: {item.estimatedHours}h</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-500">
                      <p className="italic">
                        <strong>Academic Protip:</strong> {plan.proTip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === "coach" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
              {/* Tutor controls side panel */}
              <div className="lg:col-span-4 bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-6">
                <div className="space-y-1.5 flex flex-col">
                  <h3 className="text-lg font-extrabold text-white">Scholar Assistant Platform</h3>
                  <p className="text-xs text-slate-500">Ask questions, request derivations or generate mock exams</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Focus Subject</label>
                    <select
                      value={currentChatSubject}
                      onChange={(e) => setCurrentChatSubject(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-slate-200"
                    >
                      <option className="bg-[#0A0A0A]" value="Quantum Mechanics">Quantum Mechanics</option>
                      <option className="bg-[#0A0A0A]" value="Molecular Biology">Molecular Biology</option>
                      <option className="bg-[#0A0A0A]" value="Complex Calculus">Complex Calculus</option>
                      <option className="bg-[#0A0A0A]" value="Solid State Chemistry">Solid State Chemistry</option>
                    </select>
                  </div>

                  {/* Preset prompt helper tags */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Prompt Shortcuts</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setCoachInputs(`Explain Schrödinger's Cat experiment simply.`)}
                        className="text-left text-xs p-2.5 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-[#111] rounded-xl text-slate-300 transition-colors"
                      >
                        ✏️ Schrödinger's Cat setup
                      </button>
                      <button
                        onClick={() => setCoachInputs(`Derive the normalization constant equation.`)}
                        className="text-left text-xs p-2.5 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-[#111] rounded-xl text-slate-300 transition-colors"
                      >
                        ✏️ Derive normalization constants
                      </button>
                      <button
                        onClick={() => setCoachInputs(`Discuss Feynman's path integral formulation briefly.`)}
                        className="text-left text-xs p-2.5 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-[#111] rounded-xl text-slate-300 transition-colors"
                      >
                        ✏️ Feynman path integral model
                      </button>
                    </div>
                  </div>

                  {/* Trigger dynamic Flashcard synthesis */}
                  <div className="p-4 bg-gradient-to-br from-purple-950/10 to-blue-950/10 rounded-2xl border border-purple-500/10 space-y-3">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                      Synthesize Flashcard Deck
                    </h4>
                    <input
                      type="text"
                      placeholder="e.g. Wavefunctions"
                      value={flashcardSubject}
                      onChange={(e) => setFlashcardSubject(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white outline-none"
                    />
                    <button
                      onClick={handleGenerateFlashcards}
                      disabled={isGeneratingFlashcards}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      {isGeneratingFlashcards ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating Cards...</span>
                        </>
                      ) : (
                        <span>Synthesize Cards Deck</span>
                      )}
                    </button>
                  </div>

                  {/* Trigger subject quiz generator */}
                  <div className="p-4 bg-gradient-to-br from-blue-950/10 to-pink-950/10 rounded-2xl border border-blue-500/10 space-y-3">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                      Instant subject quiz
                    </h4>
                    <button
                      onClick={() => handleGenerateQuiz(currentChatSubject)}
                      disabled={isGeneratingQuiz}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating quiz...</span>
                        </>
                      ) : (
                        <span>Forge AI Quiz ({currentChatSubject})</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Interface viewport/Quiz layout helper panel */}
              <div className="lg:col-span-8 space-y-6">
                {/* Active Interactive Quiz Display Panel if loaded */}
                {activeQuizQuestions.length > 0 && (
                  <div className="p-6 bg-[#0E0E0E] rounded-3xl border border-blue-500/20 space-y-5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-500/20 text-blue-400 font-black uppercase tracking-widest rounded">
                          Continuous Intelligence Challenge
                        </span>
                        <h4 className="text-md font-bold text-white mt-1">Quiz Topic: {activeQuizTopic}</h4>
                      </div>
                      <button
                        onClick={() => {
                          setActiveQuizQuestions([]);
                          setQuizSubmitted(false);
                          setQuizScore(null);
                        }}
                        className="text-slate-600 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activeQuizQuestions.map((q, qIdx) => (
                        <div key={q.id} className="space-y-2 text-sm text-slate-300">
                          <p className="font-bold">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedAnswers[q.id] === optIdx;
                              let borderStyle = "border-white/5 bg-white/[0.01]";
                              if (isSelected) borderStyle = "border-blue-500 bg-blue-500/5";
                              if (quizSubmitted) {
                                if (optIdx === q.correctAnswerIndex) borderStyle = "border-emerald-500 bg-emerald-500/10 text-white";
                                else if (isSelected) borderStyle = "border-red-500 bg-red-500/10 text-slate-400";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                  className={`p-3 text-left rounded-xl border transition-all ${borderStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-slate-500">
                              <span className="font-bold text-slate-400 uppercase">Analysis:</span> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <div className="p-4 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="text-white font-black">
                            Score Card: {quizScore} / {activeQuizQuestions.length} Match
                          </p>
                          <p className="text-slate-500 uppercase text-[9px]">Multiplier registered in overall XP history</p>
                        </div>
                        <button
                          onClick={() => handleGenerateQuiz(currentChatSubject)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                        >
                          Generate New Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Chat Viewport */}
                <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 flex flex-col h-[520px]">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <p className="text-white font-bold text-sm">Active Tutoring Channel</p>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Subject: {currentChatSubject}
                    </span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-sm scrollbar-thin">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 border transition-all ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-tr-none border-blue-500 ml-8"
                              : "bg-white/[0.02] text-slate-200 rounded-tl-none border-white/5 mr-8"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                            <span>{msg.role === "user" ? userName : "StudyForge AI Tutor"}</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/[0.02] text-slate-400 rounded-2xl rounded-tl-none border border-white/5 p-4 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          <span className="text-xs italic">Consulting cognitive weights...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Typing input */}
                  <form onSubmit={handleSendCoachMessage} className="pt-3 border-t border-white/5 flex gap-2">
                    <input
                      type="text"
                      value={coachInputs}
                      onChange={(e) => setCoachInputs(e.target.value)}
                      placeholder={`Ask your study assistant about ${currentChatSubject}...`}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {currentTab === "focus" && (
            <div className="max-w-2xl mx-auto space-y-8 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Interactive Focus Center</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Neuro-Sync Breathing Clock</h2>
                <p className="text-slate-400 text-sm">
                  Synchronize cognitive focus cycles via raw custom synthesized wave tracks. Setting strict locker mode prevents tab interruptions.
                </p>
              </div>

              {/* Concentric pomodoro visualization */}
              <div className="bg-[#0D0D0D] p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden space-y-6">
                <div className="w-64 h-64 rounded-full border-8 border-white/[0.03] flex items-center justify-center relative shadow-2xl">
                  {/* Concentric moving borders */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/20 animate-spin-slow"></div>
                  
                  <div className="flex flex-col items-center justify-center z-10">
                    <span className="text-xs font-black tracking-widest text-[#3B82F6] uppercase mb-1">
                      {timerType === "work" ? "DEEP STUDY WORK" : "ACADEMIC BREAK"}
                    </span>
                    <h3 className="text-5xl font-mono text-white font-extrabold tracking-tight">
                      {focusMinutes.toString().padStart(2, "0")}:{focusSeconds.toString().padStart(2, "0")}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">
                      {isTimerRunning ? "CYCLES RUNNING" : "CYCLES IDLE"}
                    </p>
                  </div>
                </div>

                <div className="w-full flex-wrap gap-2 flex justify-center">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-8 py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all flex items-center gap-2 shadow-lg ${
                      isTimerRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? "SUSPEND FOCUS" : "COMMENCE PROCESS"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setFocusMinutes(timerType === "work" ? 25 : 5);
                      setFocusSeconds(0);
                    }}
                    className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/5 transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub configuration options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4 border-t border-white/5 text-left">
                  {/* Frequencies synth selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Binaural Focus Frequency Synthesizer
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: "none", name: "🔈 Silent" },
                        { id: "sine", name: "🌀 Alpha Wave" },
                        { id: "theta", name: "🌌 Theta wave" },
                        { id: "lofi", name: "🎹 Lofi synth" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setAmbientTheme(item.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-colors font-bold ${
                            ambientTheme === item.id
                              ? "bg-blue-600/10 border-blue-500 text-blue-400"
                              : "bg-[#0A0A0A] border-white/5 text-slate-400 hover:border-white/10"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>Strict work locker details</span>
                      <span className={`px-2 py-0.5 rounded ${strictFocusMode ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-500"}`}>
                        {strictFocusMode ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">
                      Activating locks navigation tabs during timer ticks. Complete the 25-minute cycle to earn points securely.
                    </p>
                    <button
                      onClick={() => {
                        setStrictFocusMode(!strictFocusMode);
                        showToast(strictFocusMode ? "Strict work locks disabled." : "🔒 STRICT FOCUS UNLOCKED. Do not close your tab!");
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        strictFocusMode
                          ? "bg-[#0A0A0A] text-red-400 border-red-500/20 hover:bg-red-950/20"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {strictFocusMode ? "Force Terminate strict Lock" : "Engage Strict Focus Mode"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "analytics" && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-blue-400">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Intelligence Analytics</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Study Retention Metrics</h2>
                <p className="text-slate-400 text-sm">
                  Interactive scholar data feedback generated natively within the local browser runtime.
                </p>
              </div>

              {/* Grid bento charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SVG Column Bar Chart: Weekly focused minutes */}
                <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Weekly Focus Minutes Map</h4>
                      <p className="text-[11px] text-slate-500">Total hours spent in Deep work</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                      +14% vs LY
                    </span>
                  </div>

                  {/* Render Custom responsive SVG bar chart */}
                  <div className="h-64 relative flex items-end justify-between pt-6 border-b border-white/15 px-4 pb-1">
                    {focusLogs.map((log, index) => {
                      const maxMinutes = Math.max(...focusLogs.map(l => l.minutes), 220);
                      const barHeightPercent = Math.max((log.minutes / maxMinutes) * 100, 5);

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative cursor-help">
                          {/* Value tooltip on hover */}
                          <div className="absolute -top-6 bg-slate-900 border border-white/10 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold pointer-events-none">
                            {log.minutes} Min
                          </div>
                          
                          {/* Visual Bar column */}
                          <div
                            className="w-full max-w-[20px] bg-gradient-to-t from-blue-600 via-purple-600 to-pink-500 rounded-t-lg transition-all duration-700 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:brightness-125"
                            style={{ height: `${barHeightPercent}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend Labels */}
                  <div className="flex justify-between text-[10px] uppercase text-slate-500 font-bold tracking-widest px-4">
                    {focusLogs.map((log, index) => (
                      <span key={index}>{log.day}</span>
                    ))}
                  </div>
                </div>

                {/* SVG Sparkline Area Chart: Cumulative XP Progression Points */}
                <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Historical XP velocity</h4>
                      <p className="text-[11px] text-slate-500">Incremental score gains over academic terms</p>
                    </div>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded uppercase">
                      Scholar Level {scholarLevel}
                    </span>
                  </div>

                  {/* Multi-gradient Line graphic SVG Area chart */}
                  <div className="h-64 relative border-b border-white/15 pt-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Interactive area filled path */}
                      <path
                        d="M 0 100 Q 20 80 40 50 T 80 25 T 100 10 L 100 100"
                        fill="url(#areaGrad)"
                      />

                      {/* Smooth spark line path curve */}
                      <path
                        d="M 0 100 Q 20 80 40 50 T 80 25 T 100 10"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                      />

                      {/* Moving active dot marker */}
                      <circle cx="100" cy="10" r="4.5" fill="#EC4899" className="animate-ping" />
                      <circle cx="100" cy="10" r="3.5" fill="#3B82F6" />
                    </svg>
                  </div>

                  {/* Grid layout metadata keys */}
                  <div className="grid grid-cols-3 text-center text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                    <div>
                      <p>Alpha phase</p>
                      <p className="text-white mt-1">450 XP</p>
                    </div>
                    <div>
                      <p>Beta Phase</p>
                      <p className="text-white mt-1">6,200 XP</p>
                    </div>
                    <div>
                      <p>Current</p>
                      <p className="text-blue-400 mt-1">{xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentTab === "rewards" && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full text-xs font-bold text-blue-400">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Scholar Gamification</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Honors list & Medal system</h2>
                <p className="text-slate-400 text-sm">
                  Complete core study blocks and test retention quizzes to validate and unlock premium academic Badges.
                </p>
              </div>

              {/* Streak statistics cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#0D0D0D] border border-white/10 rounded-2xl text-center">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-extrabold">Consecutive Streak</p>
                  <p className="text-2xl font-black text-amber-500 mt-1">{streak} Days</p>
                </div>
                <div className="p-4 bg-[#0D0D0D] border border-white/10 rounded-2xl text-center">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-extrabold">Syllabi generated</p>
                  <p className="text-2xl font-black text-blue-400 mt-1">{studyPlans.length} Plans</p>
                </div>
                <div className="p-4 bg-[#0D0D0D] border border-white/10 rounded-2xl text-center">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-extrabold">Active Flashcards</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">{flashcards.length} Cards</p>
                </div>
                <div className="p-4 bg-[#0D0D0D] border border-white/10 rounded-2xl text-center">
                  <p className="text-[10px] uppercase text-slate-500 tracking-wider font-extrabold">Scholar Grade</p>
                  <p className="text-xl font-bold text-white mt-1.5">Apprentice</p>
                </div>
              </div>

              {/* Clickable unlocked Badges Grid list */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-white">Honor Hall Medals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "🌅 Dawn Raider Catalyst",
                      desc: "Completed 5 separate study sessions prior to 8 AM local UTC.",
                      completed: streak >= 3,
                      req: "Unlocked via streak"
                    },
                    {
                      title: "🌌 Quantum Leap Master",
                      desc: "Generated at least 1 complex physics study syllabus with cognitive AI.",
                      completed: studyPlans.length >= 1,
                      req: "1 syllabus required"
                    },
                    {
                      title: "⏳ Pomodoro Overlord medal",
                      desc: "Clocked up 3 consecutive strict mode focus ticks without tab close.",
                      completed: true,
                      req: "25 minutes cycle"
                    },
                    {
                      title: "⚡ Quiz Champion",
                      desc: "Passed a generated multi-turn AI subject quiz scoring 5/5.",
                      completed: false,
                      req: "Grade 100% on any quiz"
                    },
                    {
                      title: "📚 Memorization Maestro",
                      desc: "Drafted and tested 6 active flashcard cards in custom decks.",
                      completed: flashcards.length >= 6,
                      req: "6 flashcards in stock"
                    }
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-3xl border transition-all flex flex-col justify-between cursor-help relative group h-48 overflow-hidden bg-gradient-to-br ${
                        badge.completed
                          ? "from-[#0F1D38] to-[#120F3A] border-blue-500/20"
                          : "from-[#111] to-[#0A0A0A] border-white/5 opacity-50"
                      }`}
                    >
                      {badge.completed && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[30px] rounded-full"></div>
                      )}
                      
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase ${
                            badge.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                          }`}>
                            {badge.completed ? "UNLOCKED" : "LOCKED"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">{badge.req}</span>
                        </div>
                        <h4 className="text-white font-bold text-base mt-2">{badge.title}</h4>
                        <p className="text-xs text-slate-400 leading-normal">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black text-white">Scholar Desktop Settings</h2>
                <p className="text-slate-400 text-sm">
                  Customize study targets, simulate AI pipeline status, or backup/restore entire IndexedDB application configurations via local file packages.
                </p>
              </div>

              {/* Credentials details settings section */}
              <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-6">
                <h3 className="text-base font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">
                  Academic Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Scholar Name / Alias
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Daily focus hours target
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                      value={targetHours}
                      onChange={(e) => setTargetHours(parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Alerts & System Notifications */}
              <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span>Real-Time Alerts & System Notifications</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Enable active desktop alerts or system warnings when your focus session timer runs out or key study milestones are completed.
                </p>

                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">System Reminders & Sounds</p>
                    <p className="text-xs text-slate-500">
                      Toggle active sound effects and browser window notification system.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !notificationsEnabled;
                      setNotificationsEnabled(nextVal);
                      localStorage.setItem("sf_notifications_enabled", nextVal.toString());
                      showToast(`🔔 System alerts ${nextVal ? "ENABLED" : "DISABLED"}`);
                    }}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors relative flex items-center ${
                      notificationsEnabled ? "bg-blue-600" : "bg-slate-800"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform transform ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}></span>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={async () => {
                      if (typeof window !== "undefined" && "Notification" in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                          new Notification("🔔 Dynamic StudyForge System Check", {
                            body: `Looks great! Active alerts are running properly for ${userName}.`,
                            icon: "/assets/logo.png"
                          });
                          showToast("🔔 Active test alert successfully launched!");
                        } else {
                          showToast("⚠️ Permission denied. Please explicitly authorize sandbox notifications.");
                        }
                      } else {
                        showToast("❌ System notifications not supported in this browser.");
                      }
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <span>Send Test Notifications Alert</span>
                  </button>
                </div>
              </div>

              {/* Data Export & Backup Manager */}
              <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">
                  Storage & Data Management
                </h3>
                <p className="text-xs text-slate-500">
                  Export your active study plans, flashcards, focus logs, and cumulative XP totals into an offline JSON state file. You can restore this state at any time.
                </p>

                <div className="pt-2 flex flex-col md:flex-row gap-3">
                  <button
                    onClick={handleExportDataForVercel}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Local Database</span>
                  </button>

                  <label className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold custom-file-upload text-center cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Backup JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDataForVercel}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset application panel */}
              <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-red-500/20 space-y-4">
                <h3 className="text-base font-bold text-red-400 uppercase tracking-widest">
                  Danger Sector
                </h3>
                <p className="text-xs text-slate-500">
                  Resets streak matrices, active study blueprints, memorized flashcard decks, and returns XP to baseline levels.
                </p>
                <button
                  onClick={resetAllProgress}
                  className="px-5 py-3 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-900/10 text-xs font-bold rounded-xl transition-all"
                >
                  Hard Reset Progress metrics
                </button>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Background ambient lighting layers matching Google AI Studio startup aesthetic */}
      <div className="fixed top-0 right-0 w-1/2 h-full bg-blue-500/5 pointer-events-none blur-[140px] rounded-full -z-10"></div>
      <div className="fixed bottom-0 left-0 w-1/3 h-2/3 bg-purple-500/5 pointer-events-none blur-[140px] rounded-full -z-10"></div>
    </div>
  );
}
