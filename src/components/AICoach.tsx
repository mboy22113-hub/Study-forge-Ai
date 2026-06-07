import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit, 
  Download, 
  Share2, 
  MoreVertical, 
  Send, 
  RotateCcw, 
  AlertOctagon, 
  RefreshCw, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  GraduationCap, 
  Brain, 
  Target, 
  HelpCircle, 
  Activity, 
  Layers, 
  Clipboard, 
  Lightbulb, 
  Menu, 
  X,
  Volume2,
  Calendar,
  Zap,
  Flame,
  ArrowRight,
  Image,
  Mic,
  FileText,
  Paperclip,
  Compass,
  User,
  LogOut,
  Settings,
  PenTool,
  TrendingUp,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AcademicSubject, StudyPlan, QuizQuestion, Flashcard } from "../types";

// ChatSession schema for unlimited history and automatic persistence
interface ChatSession {
  id: string;
  title: string;
  subject: string;
  chatMode: "quick" | "detailed" | "teacher" | "quiz" | "flashcard" | "exam" | "motivation";
  customSubjectText?: string;
  messages: Array<{ 
    role: "user" | "model"; 
    content: string; 
    timestamp: string; 
    imageUrl?: string;
  }>;
  isPinned: boolean;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

// ================= PREMIUM INTERACTIVE CHAT WIDGETS =================

function FlashcardDeckWidget({ 
  cards, 
  onAddCard 
}: { 
  cards: Array<{ front: string; back: string }>; 
  onAddCard: (card: { front: string; back: string }) => void;
  key?: any;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  const card = cards[idx];
  if (!card) return null;

  return (
    <div className="w-full max-w-md my-4 bg-[#0F1017]/90 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
      
      <div className="flex justify-between items-center mb-4 text-[10px] uppercase font-black tracking-widest text-[#a5b4fc] select-none">
        <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> StudyForge Active Recall</span>
        <span className="font-mono bg-white/5 px-2 py-0.5 rounded-md">{idx + 1} of {cards.length}</span>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={() => setFlipped(!flipped)}
        className="w-full h-44 cursor-pointer relative perspective-1000 mb-5 select-none"
      >
        <motion.div 
          className="w-full h-full duration-500 transform-style-3d relative"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full bg-[#161824] border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center backface-hidden shadow-lg">
            <span className="absolute top-3 left-4 text-[9px] uppercase tracking-wider font-extrabold bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full">Query Trigger</span>
            <p className="text-sm font-bold text-slate-100 leading-relaxed px-2">{card.front}</p>
            <span className="absolute bottom-3 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest animate-pulse">Touch to Flip</span>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full bg-[#11131c] border border-indigo-500/20 rounded-xl p-5 flex flex-col items-center justify-center text-center backface-hidden shadow-lg rotateY-180">
            <span className="absolute top-3 left-4 text-[9px] uppercase tracking-wider font-extrabold bg-[#10b981]/15 text-[#10b981] px-2.5 py-0.5 rounded-full">Recall Verification</span>
            <p className="text-sm font-semibold text-indigo-300 leading-relaxed px-2 italic">"{card.back}"</p>
            <span className="absolute bottom-3 text-[9px] text-emerald-500/80 font-bold uppercase tracking-widest">Active Learned</span>
          </div>
        </motion.div>
      </div>

      {/* Actions and Progress bar */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-1.5">
          <button 
            disabled={idx === 0}
            onClick={() => { setIdx(idx - 1); setFlipped(false); }}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/5 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={idx === cards.length - 1}
            onClick={() => { setIdx(idx + 1); setFlipped(false); }}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/5 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            onAddCard(card);
            setAddedIds({...addedIds, [idx]: true});
          }}
          disabled={addedIds[idx]}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            addedIds[idx] 
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/15"
          }`}
        >
          {addedIds[idx] ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added to Vault
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Save to Revision
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function QuizDeckWidget({ 
  questions, 
  onAwardRecall 
}: { 
  questions: QuizQuestion[]; 
  onAwardRecall: (xp: number, coins: number) => void;
  key?: any;
}) {
  const [cur, setCur] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[cur];

  const handleOptionSelect = (idx: number) => {
    if (checked) return;
    setSelectedOpt(idx);
  };

  const handleCheck = () => {
    if (selectedOpt === null) return;
    setChecked(true);
    if (selectedOpt === q.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (cur < questions.length - 1) {
      setCur(c => c + 1);
      setSelectedOpt(null);
      setChecked(false);
    } else {
      setFinished(true);
      const passed = score >= Math.ceil(questions.length / 2);
      if (passed) {
        onAwardRecall(120, 30);
      }
    }
  };

  const handleReset = () => {
    setCur(0);
    setSelectedOpt(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const passed = score >= Math.ceil(questions.length / 2);
    return (
      <div className="w-full max-w-lg my-4 bg-[#0F1017]/95 border border-white/10 rounded-2xl p-6 shadow-2xl relative text-center backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 font-black text-xl font-mono">
          {score}/{questions.length}
        </div>

        <h4 className="text-base font-black text-white uppercase tracking-wider">Academic Quiz Report</h4>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-xs mx-auto">
          {passed 
            ? "🏆 Outstanding intellectual performance! You completed the quiz with high-fidelity recall: +120 XP, +30 Coins" 
            : "📚 Recommended: study formulas and lecture outlines before retaking standard diagnostic examinations."}
        </p>

        <div className="mt-5 flex gap-3 justify-center">
          <button 
            onClick={handleReset}
            className="px-4.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] uppercase font-black tracking-wider rounded-xl cursor-pointer border border-white/5"
          >
            Train Again
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="w-full max-w-lg my-4 bg-[#0F1017]/95 border border-white/10 rounded-2xl p-5 shadow-2xl relative backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      
      <div className="flex justify-between items-center mb-4 text-[10px] font-mono font-black tracking-widest text-indigo-400 select-none">
        <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Academic Evaluation</span>
        <span className="bg-white/5 px-2 py-0.5 rounded-md">Question {cur + 1} of {questions.length}</span>
      </div>

      <p className="text-xs sm:text-sm font-bold text-white leading-relaxed mb-4">{q.question}</p>

      {/* Options Panel */}
      <div className="space-y-2 mb-4">
        {q.options.map((opt, oI) => {
          let optStyle = "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-slate-300";
          if (selectedOpt === oI) {
            optStyle = "bg-[#6366f1]/10 border-[#6366f1]/40 text-indigo-200";
          }
          if (checked) {
            if (oI === q.correctAnswerIndex) {
              optStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold";
            } else if (selectedOpt === oI) {
              optStyle = "bg-rose-500/10 border-rose-500/30 text-rose-400";
            } else {
              optStyle = "bg-white/[0.005] border-white/5 text-slate-600 cursor-not-allowed opacity-40";
            }
          }

          return (
            <button
              key={oI}
              onClick={() => handleOptionSelect(oI)}
              disabled={checked}
              className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold leading-relaxed flex items-center justify-between cursor-pointer ${optStyle}`}
            >
              <span>{opt}</span>
              {checked && oI === q.correctAnswerIndex && (
                <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">Verified Solution</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation drawer inside active quiz context */}
      <AnimatePresence>
        {checked && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 bg-slate-900/50 border border-white/5 rounded-xl p-3.5 text-[10px] leading-relaxed text-slate-400 font-medium text-left"
          >
            <span className="font-bold text-slate-200 uppercase tracking-wider block mb-1 font-mono text-[8px] text-[#818cf8]">Solution Explanation</span>
            {q.explanation}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-2 border-t border-white/5">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedOpt === null}
            className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-[9px] uppercase tracking-wider rounded-xl cursor-pointer shadow-lg"
          >
            Verify Choice
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4.5 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-black text-[9px] uppercase tracking-wider rounded-xl cursor-pointer shadow-lg"
          >
            {cur === questions.length - 1 ? "Complete Quiz" : "Advance Question"}
          </button>
        )}
      </div>
    </div>
  );
}

function StudyPlanPreviewWidget({ 
  plan, 
  onApplyPlan 
}: { 
  plan: any; 
  onApplyPlan: (plan: any) => void;
  key?: any;
}) {
  const [applied, setApplied] = useState(false);

  return (
    <div className="w-full max-w-md my-4 bg-[#0F1017]/95 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
      
      <div className="mb-4 text-[10px] uppercase font-mono font-black tracking-widest text-[#f59e0b] select-none flex items-center gap-1.5 animate-pulse">
        <Target className="w-3.5 h-3.5" /> High-Fidelity Study Blueprint
      </div>

      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">Course: {plan.subject || "Academic Curricula"}</h4>
      <p className="text-[11.5px] mt-2.5 text-slate-400 leading-normal font-medium">{plan.overview}</p>
      
      {plan.proTip && (
        <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-[10px] text-yellow-300 leading-normal tracking-wide font-medium mt-3">
          💡 <strong>Pro Strategy:</strong> {plan.proTip}
        </div>
      )}

      {/* Structured study milestones timeline */}
      <div className="my-5 relative pl-4 border-l border-white/5 space-y-4 text-left select-none">
        {plan.milestones?.map((ml: any, mI: number) => (
          <div key={mI} className="relative">
            <span className="absolute -left-[20.5px] top-1 w-3 h-3 rounded-full border border-yellow-500/45 bg-[#0F1017]" />
            <h5 className="text-[11px] font-black text-slate-200 uppercase tracking-wide">{ml.week} · {ml.title}</h5>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {ml.topics?.map((topic: string, tIdx: number) => (
                <span key={tIdx} className="text-[9px] bg-white/5 text-slate-400 border border-white/[0.03] px-2 py-0.5 rounded font-semibold">{topic}</span>
              ))}
            </div>
            <span className="text-[9px] text-amber-500 font-extrabold uppercase mt-1.5 block font-mono">Allocation: {ml.estimatedHours} study hours</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          onApplyPlan(plan);
          setApplied(true);
        }}
        disabled={applied}
        className={`w-full py-2.5 text-[9px] uppercase tracking-widest font-black rounded-xl transition-all cursor-pointer ${
          applied 
            ? "bg-[#10b981]/15 border border-[#10b981]/20 text-[#10b981]" 
            : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg hover:shadow-amber-500/15"
        }`}
      >
        {applied ? "✓ Study Plan Activated!" : "Apply Timetable to Study Planner"}
      </button>
    </div>
  );
}

interface AICoachProps {
  subjects: AcademicSubject[];
  subjectsList: any[];
  studyPlans: StudyPlan[];
  setStudyPlans: React.Dispatch<React.SetStateAction<StudyPlan[]>>;
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  routineData: any;
  pdfs: any[];
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  goals: any[];
  userName: string;
  onTriggerNotification: (title: string, msg: string) => void;
  onSelectTab?: (tab: string) => void;
  logoutUser?: () => void;
}

export default function AICoach({
  subjects,
  subjectsList,
  studyPlans,
  setStudyPlans,
  setFlashcards,
  routineData,
  pdfs,
  xp,
  setXp,
  coins,
  setCoins,
  streak,
  goals,
  userName,
  onTriggerNotification,
  onSelectTab,
  logoutUser
}: AICoachProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 1. Core Conversations State & Hydration
  const [conversations, setConversations] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("sf_ai_conversations_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading sf_ai_conversations_v3 from localStorage", e);
    }

    // Default Starting Conversation to pre-populate beautifully
    const introSession: ChatSession = {
      id: "sf_session_init",
      title: "🎓 Welcome to StudyForge AI Coach!",
      subject: "General Study",
      chatMode: "detailed",
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "model",
          content: "Hello! I am your StudyForge AI Coach, your personal academic assistant and mentor. How can I help you master your studies today? You can select any subject, change study modes (like Quiz, Flashcards, or Teacher Mode), or choose a quick action helper below!",
          timestamp: new Date().toISOString()
        }
      ]
    };
    return [introSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    if (conversations.length > 0) {
      return conversations[0].id;
    }
    return "sf_session_init";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [coachInput, setCoachInput] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For three-dots dropdown
  const [copiedMessageIdx, setCopiedMessageIdx] = useState<number | null>(null);
  const [activeVoiceMessageIdx, setActiveVoiceMessageIdx] = useState<number | null>(null);

  // Focus and quick custom subject text
  const [customSubjectText, setCustomSubjectText] = useState("");

  // Voice dictation and PDF attachments functionality
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [attachedPdfId, setAttachedPdfId] = useState<string | null>(null);
  const [showPdfPicker, setShowPdfPicker] = useState(false);

  // Computed attached PDF object
  const attachedPdf = useMemo(() => {
    return pdfs.find((p) => p.id === attachedPdfId) || null;
  }, [pdfs, attachedPdfId]);

  // Speech Recognition dictation toggle handler using standard Web Speech API
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onTriggerNotification(
        "Unsupported Browser",
        "🎙️ Speech recognition is not natively supported in this browser version. Try Chrome or Safari!"
      );
      return;
    }

    if (isRecording) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        onTriggerNotification(
          "Listening Mode Active",
          "🎙️ Listened audio is being translated to study text... Speak clearly!"
        );
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setCoachInput((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognition.start();
      setRecognitionInstance(recognition);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // AI Vision states & Handlers
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string>("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check type: JPG, PNG, WEBP
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      onTriggerNotification("Invalid Format", "⚠️ StudyForge AI Coach only parses JPG, PNG, and WEBP image assets.");
      return;
    }
    
    // Size check matching 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      onTriggerNotification("File Too Large", "⚠️ Image size must be smaller than 10MB to optimize analytical parsing.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageBase64(reader.result as string);
      setUploadedImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      onTriggerNotification("Invalid Format", "⚠️ StudyForge AI Coach only parses JPG, PNG, and WEBP image assets.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageBase64(reader.result as string);
      setUploadedImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active Session object computed
  const activeSession = useMemo(() => {
    return conversations.find((c) => c.id === activeSessionId) || conversations[0];
  }, [conversations, activeSessionId]);

  // Sync to localStorage automatically
  useEffect(() => {
    localStorage.setItem("sf_ai_conversations_v3", JSON.stringify(conversations));
  }, [conversations]);

  // Click outside listener to close the three-dots dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages?.length, isChatLoading]);

  // XP and coin rewards
  const awardXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem("sf_xp", next.toString());
      return next;
    });
  };

  const addCoins = (amount: number) => {
    setCoins((prev) => {
      const next = prev + amount;
      localStorage.setItem("sf_coins", next.toString());
      return next;
    });
  };

  // Preset prompts for key study coach features
  const presetFeatures = [
    {
      title: "Explain Concepts",
      desc: "Get simple explanations & intuitive analogies",
      prompt: "Can you explain the main theories of this topic using a real-world analogy first, and then map it into academic details?",
      icon: <Layers className="w-4 h-4 text-purple-400" />
    },
    {
      title: "Generate Quizzes",
      desc: "Challenge your model with recall questions",
      prompt: "Please generate an active recall multiple-choice quiz with 5 key conceptual questions. Include four options (A,B,C,D) for each, but do not outline the explanations until I try to answer them!",
      icon: <HelpCircle className="w-4 h-4 text-blue-400" />
    },
    {
      title: "Create Flashcards",
      desc: "Build front-and-back study decks",
      prompt: "Generate a set of 5 highly useful Flashcard style question/answer pairs for today's active recall revision.",
      icon: <Brain className="w-4 h-4 text-emerald-400" />
    },
    {
      title: "Create Study Plans",
      desc: "Map outstanding syllabus elements",
      prompt: "Create an adaptive scholastic study plan timeline for this topic. Give estimated hour allocations, specific focus concepts, and a strategic master overview.",
      icon: <Calendar className="w-4 h-4 text-amber-400" />
    },
    {
      title: "Analyze Weakspots",
      desc: "Spot knowledge gaps & exam risks",
      prompt: "Help me analyze my potential weakspots in this topic. What are the common points of misunderstanding or exam slip-ups students usually struggle with?",
      icon: <Activity className="w-4 h-4 text-rose-400" />
    },
    {
      title: "Step-by-Step Solver",
      desc: "Trace and solve formula problems",
      prompt: "Please act as a meticulous step-by-step math and science problem solver. Walk me through resolving a standard numerical or conceptual formula step by step.",
      icon: <Zap className="w-4 h-4 text-indigo-400" />
    },
    {
      title: "Exam Strategies",
      desc: "Get optimal grade weighting hacks",
      prompt: "Provide a rigorous exam preparation checklist. Suggest specific strategies on how to maximize marks under timed stress.",
      icon: <Target className="w-4 h-4 text-pink-400" />
    },
    {
      title: "Study Techniques",
      desc: "Learn active recall & Pomodoro loops",
      prompt: "What scientific learning techniques (e.g. Feynman technique, spaced recall, Pomodoro cycles) would work best to digest this material quickly?",
      icon: <Lightbulb className="w-4 h-4 text-teal-400" />
    }
  ];

  // Dynamic grouping helpers for conversations
  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }
    return list;
  }, [conversations, searchQuery]);

  const pinedConversations = useMemo(() => {
    return filteredConversations.filter((c) => c.isPinned);
  }, [filteredConversations]);

  const nonPinnedConversations = useMemo(() => {
    return filteredConversations.filter((c) => !c.isPinned);
  }, [filteredConversations]);

  const groupedConversations = useMemo(() => {
    const today: ChatSession[] = [];
    const thisWeek: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    nonPinnedConversations.forEach((c) => {
      const cDate = new Date(c.updatedAt);
      if (cDate.toDateString() === todayStr) {
        today.push(c);
      } else if (cDate > oneWeekAgo) {
        thisWeek.push(c);
      } else {
        older.push(c);
      }
    });

    // Sort within cohorts by last updated (descending)
    const sorter = (a: ChatSession, b: ChatSession) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

    return {
      today: today.sort(sorter),
      thisWeek: thisWeek.sort(sorter),
      older: older.sort(sorter)
    };
  }, [nonPinnedConversations]);

  // Conversational API Dispatch
  const handleSendCoachMessage = async (
    e?: React.FormEvent,
    customUserMsg?: string,
    forcedMode?: ChatSession["chatMode"]
  ) => {
    if (e) e.preventDefault();

    const userMsg = (customUserMsg || coachInput).trim();
    const hasImage = !!uploadedImageBase64;
    
    if ((!userMsg && !hasImage) || isChatLoading) return;

    let finalMsg = userMsg || (hasImage ? "Please analyze this uploaded visual material." : "");
    if (attachedPdf) {
      finalMsg += `\n\n[CONTEXT INTEGRATION: The student attached a study PDF file named "${attachedPdf.name}". The document content includes: ${attachedPdf.desc || "curriculum chapters"} metadata with registered pages: ${attachedPdf.totalPages}. Please answer the student question referencing the concepts, questions, formula derivations, and lessons from "${attachedPdf.name}".]`;
    }

    if (!customUserMsg) {
      setCoachInput("");
    }

    // Capture uploaded image reference and clear immediately for clean UI
    const capturedImage = uploadedImageBase64;
    setUploadedImageBase64(null);
    setUploadedImageName("");

    setChatError(null);
    const activeSessionObj = activeSession;
    const activeSubject = activeSessionObj.subject;
    const activeMode = forcedMode || activeSessionObj.chatMode;

    const userMessageObj = {
      role: "user" as const,
      content: finalMsg,
      timestamp: new Date().toISOString(),
      ...(capturedImage ? { imageUrl: capturedImage } : {})
    };

    // Append message to active session
    const updatedMessages = [...activeSessionObj.messages, userMessageObj];

    // Optimistically update conversation and refresh updatedAt timestamp
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeSessionObj.id
          ? {
              ...c,
              messages: updatedMessages,
              chatMode: activeMode,
              updatedAt: new Date().toISOString(),
              // If it's a first real message title generator we can auto rename it later or preserve
              title: c.title === "New Conversation" || c.id === "sf_session_init" && c.title === "🎓 Welcome to StudyForge AI Coach!"
                ? generateShortTitle(finalMsg)
                : c.title
            }
          : c
      )
    );

    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          payload: {
            messages: updatedMessages.map((m) => ({ 
              role: m.role, 
              content: m.content,
              imageUrl: m.imageUrl || null
            })),
            currentSubject: activeSubject === "Custom Focus" ? (activeSessionObj.customSubjectText || customSubjectText || "Custom Academic Topic") : activeSubject,
            chatMode: activeMode,
            profileContext: {
              username: userName || "Scholar",
              streak: streak,
              xp: xp,
              subjectsList: subjectsList,
              goalsList: goals,
              studyPlansList: studyPlans,
              routine: routineData,
              pdfsCount: pdfs.length
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error("Unable to obtain a response from StudyForge AI server.");
      }

      const data = await response.json();
      if (!data || !data.text) {
        throw new Error("AI core returned empty output.");
      }

      const modelMessageObj = {
        role: "model" as const,
        content: data.text,
        timestamp: new Date().toISOString()
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeSessionObj.id
            ? {
                ...c,
                messages: [...c.messages, modelMessageObj],
                updatedAt: new Date().toISOString()
              }
            : c
        )
      );

      // Award XP for learning dialogue
      awardXp(30);
      addCoins(10);
      onTriggerNotification(
        "AI Coach Insight",
        "🧠 Coach feedback digested successfully! +30 XP +10 Coins"
      );

    } catch (err: any) {
      console.error("[CHAT LOG ERROR]:", err);
      setChatError(err.message || "An error occurred. Check your network or API settings.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Title generator helper for aesthetic previews
  const generateShortTitle = (msg: string): string => {
    const clean = msg.replace(/^\[.*?\]\s*-\s*/, "").trim();
    if (clean.length <= 26) return clean;
    return clean.substring(0, 24) + "...";
  };

  // Conversational Retry Handler
  const handleRetryLastMessage = async () => {
    const messages = activeSession.messages;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;

    const realIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[realIdx].content;

    // Remove any model messages trailing behind
    const slicedMessages = messages.slice(0, realIdx + 1);

    setChatError(null);
    setIsChatLoading(true);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeSession.id
          ? {
              ...c,
              messages: slicedMessages,
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          payload: {
            messages: slicedMessages.map((m) => ({ 
              role: m.role, 
              content: m.content,
              imageUrl: m.imageUrl || null
            })),
            currentSubject: activeSession.subject === "Custom Focus" ? (activeSession.customSubjectText || customSubjectText) : activeSession.subject,
            chatMode: activeSession.chatMode,
            profileContext: {
              username: userName || "Scholar",
              streak: streak,
              xp: xp,
              subjectsList: subjectsList,
              goalsList: goals,
              studyPlansList: studyPlans,
              routine: routineData,
              pdfsCount: pdfs.length
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error("Unable to obtain a response from StudyForge AI server.");
      }

      const data = await response.json();
      if (!data || !data.text) {
        throw new Error("AI core returned empty output.");
      }

      const modelMessageObj = {
        role: "model" as const,
        content: data.text,
        timestamp: new Date().toISOString()
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeSession.id
            ? {
                ...c,
                messages: [...c.messages, modelMessageObj],
                updatedAt: new Date().toISOString()
              }
            : c
        )
      );

      awardXp(30);
    } catch (err: any) {
      console.error("[RETRY LOG ERROR]:", err);
      setChatError(err.message || "An error occurred during retry.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Session Manager Actions
  const handleCreateNewChat = (customSubject?: string) => {
    const newSession: ChatSession = {
      id: "sf_session_" + Date.now(),
      title: customSubject ? `🎓 ${customSubject} Study` : "New Conversation",
      subject: customSubject || "General Study",
      chatMode: "detailed",
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: "model",
          content: `Hi there ${userName || "Scholar"}! I have structured a dedicated study environment for "${customSubject || "General study queries"}". Tell me, what formulas, concepts, or assignments shall we tackle next?`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setConversations((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsMobileSidebarOpen(false);
    setChatError(null);
  };

  const handleTogglePin = (sessionId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === sessionId ? { ...c, isPinned: !c.isPinned, updatedAt: new Date().toISOString() } : c))
    );
    setActiveMenuId(null);
  };

  const handleDeleteChat = (sessionId: string) => {
    if (conversations.length <= 1) {
      alert("⚠️ You must retain at least one conversation in your study log.");
      return;
    }
    const filtered = conversations.filter((c) => c.id !== sessionId);
    setConversations(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
    setActiveMenuId(null);
  };

  const startRenameSession = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitleText(currentTitle);
    setActiveMenuId(null);
  };

  const finishRenameSession = (sessionId: string) => {
    if (editTitleText.trim() === "") return;
    setConversations((prev) =>
      prev.map((c) => (c.id === sessionId ? { ...c, title: editTitleText.trim(), updatedAt: new Date().toISOString() } : c))
    );
    setEditingSessionId(null);
  };

  const handleClearConversation = (sessionId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === sessionId
          ? {
              ...c,
              messages: [
                {
                  role: "model",
                  content: "Conversation history cleared successfully. Select a subject & study mode to begin a fresh learning stream!",
                  timestamp: new Date().toISOString()
                }
              ],
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );
    setActiveMenuId(null);
    setChatError(null);
  };

  // Export Chat Logic (Markdown vs JSON)
  const handleExportChat = (sessionId: string, format: "markdown" | "json") => {
    const target = conversations.find((c) => c.id === sessionId);
    if (!target) return;

    let content = "";
    let fileExtension = "";
    let mimeType = "";

    if (format === "markdown") {
      content = `# StudyForge AI Chat Log: ${target.title}\n`;
      content += `*Active Subject: ${target.subject}* | *Mode: ${target.chatMode}*\n`;
      content += `*Timestamps: Created ${new Date(target.createdAt).toLocaleString()} | Updated ${new Date(target.updatedAt).toLocaleString()}*\n\n`;
      content += `-------\n\n`;

      target.messages.forEach((m) => {
        const title = m.role === "user" ? `🧑 Student (${userName || "Scholar"})` : "🧠 StudyForge AI Coach";
        content += `### ${title} - [${new Date(m.timestamp).toLocaleTimeString()}]\n\n${m.content}\n\n`;
      });

      fileExtension = "md";
      mimeType = "text/markdown;charset=utf-8;";
    } else {
      content = JSON.stringify(target, null, 2);
      fileExtension = "json";
      mimeType = "application/json;charset=utf-8;";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `studyforge_chat_${target.title.replace(/\s+/g, "_").toLowerCase()}.${fileExtension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveMenuId(null);
  };

  // Direct context helper prompts from three-dots menu
  const handleActionOnTopMsg = (actionKey: "summary" | "quiz" | "flashcards" | "notes") => {
    if (isChatLoading) return;
    setActiveMenuId(null);

    let query = "";
    switch (actionKey) {
      case "summary":
        query = "[Generate Summary] - Please examine our current conversation history above and provide a concise, structured master summary detailing the core definitions, concepts, and key equations we addressed.";
        break;
      case "quiz":
        query = "[Generate Quiz From Chat] - Let's test my recall! Please create a brand new 3-question multiple choice challenge (A, B, C, D) based only on the facts and information we have discussed in this conversation.";
        break;
      case "flashcards":
        query = "[Create Flashcards From Chat] - Generate a set of card pairs (Question on front, Answer on back) derived directly from our focus subject discussion today so I can index them.";
        break;
      case "notes":
        query = "[Convert Chat To Notes] - Transform our dialogue into an elegant, bulleted cheat-sheet revision brief. Include bold categories, key formulas, and helpful mnemonics.";
        break;
    }

    handleSendCoachMessage(undefined, query);
  };

  // Message Actions
  const handleCopyMessageText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIdx(index);
    setTimeout(() => setCopiedMessageIdx(null), 2000);
  };

  const handleShareClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`Studying with StudyForge AI! Master concepts with active recall guides inside: ${url}`);
    alert("🔗 Share link representing your study space was copied to your clipboard!");
    setActiveMenuId(null);
  };

  // Mock Text-to-Speech simulation helper
  const handleSpeakTextAlert = (text: string, index: number) => {
    if (activeVoiceMessageIdx === index) {
      // Toggle off if clicking same message
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveVoiceMessageIdx(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop playing anything else
      // Clean markdown characters for voice synthesis
      const cleanText = text
        .replace(/[\*\#\`\-\_]/g, "")
        .replace(/\[.*?\]/g, "")
        .substring(0, 300); // Read first 300 chars for mock previews
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => {
        setActiveVoiceMessageIdx(null);
      };
      utterance.onerror = () => {
        setActiveVoiceMessageIdx(null);
      };
      setActiveVoiceMessageIdx(index);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("🔊 Speech synthesis is not supported in this browser version.");
    }
  };

  // Subject selector updating active session parameters
  const updateSessionSubject = (sub: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeSessionId
          ? {
              ...c,
              subject: sub,
              customSubjectText: sub === "Custom Focus" ? customSubjectText : undefined,
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );
  };

  const updateSessionMode = (mode: ChatSession["chatMode"]) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeSessionId
          ? {
              ...c,
              chatMode: mode,
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );
  };

  // Custom renderer for robust student-grade markdown with embedded syntax codeblocks, tables, and lists
  const renderRichMarkdown = (text: string) => {
    if (!text) return null;

    // Split blocks based on triple backticks for code block visualization
    const blocks = text.split(/(\`\`\`[a-zA-Z0-9-]*\n[\s\S]*?\n\`\`\`)/);

    return (
      <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-[1.7] select-text font-normal">
        {blocks.map((block, bIdx) => {
          if (block.startsWith("```")) {
            const match = block.match(/^\`\`\`([a-zA-Z0-9-]*)\n([\s\S]*?)\n\`\`\`$/);
            const language = match ? (match[1] || "code").toLowerCase() : "code";
            const codeContent = match ? match[2] : block.replace(/^\`\`\`|\`\`\`$/g, "");

            // 1. Dynamic Flashcards Deck
            if (language === "flashcard-deck" || language === "flashcards-deck") {
              try {
                const parsedCards = JSON.parse(codeContent.trim());
                if (Array.isArray(parsedCards) && parsedCards.length > 0) {
                  return (
                    <FlashcardDeckWidget 
                      key={bIdx}
                      cards={parsedCards} 
                      onAddCard={(card) => {
                        setFlashcards(prev => {
                          const nextId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
                          return [...prev, { id: nextId, front: card.front, back: card.back }];
                        });
                        awardXp(15);
                        addCoins(5);
                        onTriggerNotification("Flashcard Saved", "🎓 Card appended to Spaced Revision! +15 XP +5 Coins");
                      }}
                    />
                  );
                }
              } catch (e) {
                console.error("Failed to parse flashcard JSON from code block", e);
              }
            }

            // 2. Dynamic Practice MCQs Quiz
            if (language === "quiz-deck" || language === "quizzes-deck" || language === "practice-quiz") {
              try {
                const parsedQuiz = JSON.parse(codeContent.trim());
                if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
                  return (
                    <QuizDeckWidget 
                      key={bIdx}
                      questions={parsedQuiz} 
                      onAwardRecall={(earnedXp, earnedCoins) => {
                        awardXp(earnedXp);
                        addCoins(earnedCoins);
                        onTriggerNotification("Quiz Finished", "🏆 Active quiz training successfully processed!");
                      }}
                    />
                  );
                }
              } catch (e) {
                console.error("Failed to parse quiz JSON from code block", e);
              }
            }

            // 3. Dynamic Custom Weekly Study Timetable Planner
            if (language === "study-plan-deck" || language === "study-plan") {
              try {
                const parsedPlan = JSON.parse(codeContent.trim());
                if (parsedPlan && (parsedPlan.milestones || parsedPlan.overview)) {
                  return (
                    <StudyPlanPreviewWidget 
                      key={bIdx}
                      plan={parsedPlan} 
                      onApplyPlan={(appliedPlan) => {
                        setStudyPlans(prev => {
                          const newPlanObj = {
                            id: `ai-${Date.now()}`,
                            subject: appliedPlan.subject || "AI Recommended",
                            level: "Strategic Blueprint",
                            overview: appliedPlan.overview || "",
                            proTip: appliedPlan.proTip || "",
                            milestones: (appliedPlan.milestones || []).map((m: any) => ({
                              week: m.week,
                              title: m.title,
                              topics: m.topics || [],
                              estimatedHours: m.estimatedHours || 4,
                              quizAvailable: true
                            })),
                            progress: 0,
                            createdAt: new Date().toISOString()
                          };
                          const nextPlans = [newPlanObj, ...prev];
                          localStorage.setItem("sf_plans_v2", JSON.stringify(nextPlans));
                          return nextPlans;
                        });
                        awardXp(100);
                        addCoins(25);
                        onTriggerNotification("Study Plan Saved", "🎯 Custom strategic blueprint loaded into Study Planner successfully!");
                      }}
                    />
                  );
                }
              } catch (e) {
                console.error("Failed to parse study plan JSON from code block", e);
              }
            }

            return (
              <div key={bIdx} className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/90 my-4 font-mono shadow-lg">
                <div className="flex bg-white/[0.04] px-4 py-2 text-xs text-slate-400 items-center justify-between border-b border-white/5 uppercase tracking-wider font-extrabold text-[10px]">
                  <span>💻 {language}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeContent)}
                    className="flex gap-1.5 hover:text-white transition-all text-slate-500 font-bold cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[13px] text-indigo-300 select-text leading-relaxed whitespace-pre font-mono scrollbar-thin">{codeContent}</pre>
              </div>
            );
          }

          // Otherwise parse regular lines (lists, tables, headers)
          const lines = block.split("\n");
          let inTable = false;
          let tableRows: string[][] = [];

          const parseInlineFormatting = (inputText: string) => {
            const partsForCode = inputText.split(/(\`[^\`]+\`)/);
            return partsForCode.map((part, pI) => {
              if (part.startsWith("`") && part.endsWith("`")) {
                return (
                  <code key={pI} className="bg-white/10 border border-white/5 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs font-semibold">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              const partsForBold = part.split("**");
              return partsForBold.map((sub, i) =>
                i % 2 !== 0 ? (
                  <strong key={i} className="text-white font-extrabold text-[#f1f5f9]">
                    {sub}
                  </strong>
                ) : (
                  sub
                )
              );
            });
          };

          const elements: React.ReactNode[] = [];

          for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx];
            const trimmed = line.trim();

            if (!trimmed) {
              if (inTable) {
                elements.push(renderTableHelper(tableRows, elements.length));
                inTable = false;
                tableRows = [];
              }
              elements.push(<div key={`blank-${idx}`} className="h-2"></div>);
              continue;
            }

            // Check if table row: Starts and ends with |
            if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
              inTable = true;
              const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
              // Filter out markdown spacer rows like |---|---|
              const isSpacer = cells.every(c => c.startsWith("-") || c.startsWith(":-") || c.endsWith("-"));
              if (!isSpacer) {
                tableRows.push(cells);
              }
              continue;
            } else if (inTable) {
              elements.push(renderTableHelper(tableRows, elements.length));
              inTable = false;
              tableRows = [];
            }

            // Check for list triggers
            const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ");
            const isNumbered = /^\d+\.\s+/.test(trimmed);

            if (isBullet) {
              const cleanText = trimmed.replace(/^(\*\s*|-\s*|•\s*)/, "");
              elements.push(
                <div key={idx} className="flex items-start gap-2.5 pl-4 sm:pl-6 my-2">
                  <span className="text-purple-400 mt-2 shrink-0 block w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
                  <p className="flex-1 text-slate-300 leading-[1.7]">{parseInlineFormatting(cleanText)}</p>
                </div>
              );
            } else if (isNumbered) {
              const match = trimmed.match(/^(\d+)\.\s+(.*)/);
              const num = match ? match[1] : "1";
              const cleanText = match ? match[2] : trimmed;
              elements.push(
                <div key={idx} className="flex items-start gap-2.5 pl-4 sm:pl-6 my-2">
                  <span className="text-indigo-400 font-mono text-[13px] font-black shrink-0 w-5 text-right mt-0.5">{num}.</span>
                  <p className="flex-1 text-slate-300 leading-[1.7]">{parseInlineFormatting(cleanText)}</p>
                </div>
              );
            } else if (trimmed.startsWith("###")) {
              const cleanText = trimmed.replace(/^###\s*/, "");
              elements.push(
                <h4 key={idx} className="text-sm font-black text-purple-400 mt-6 mb-2 first:mt-0 uppercase tracking-widest border-l-2 border-purple-500/50 pl-2">
                  {parseInlineFormatting(cleanText)}
                </h4>
              );
            } else if (trimmed.startsWith("##")) {
              const cleanText = trimmed.replace(/^##\s*/, "");
              elements.push(
                <h3 key={idx} className="text-base font-black text-slate-100 mt-8 mb-3 first:mt-0 tracking-wide border-b border-white/5 pb-1 select-none">
                  {parseInlineFormatting(cleanText)}
                </h3>
              );
            } else if (trimmed.startsWith("#")) {
              const cleanText = trimmed.replace(/^#\s*/, "");
              elements.push(
                <h2 key={idx} className="text-lg font-black text-white mt-10 mb-4 first:mt-0 tracking-tight select-none">
                  {parseInlineFormatting(cleanText)}
                </h2>
              );
            } else {
              elements.push(
                <p key={idx} className="leading-[1.7] text-slate-355 select-text my-2.5 pl-1">
                  {parseInlineFormatting(trimmed)}
                </p>
              );
            }
          }

          // Render remaining table if loop ends in table
          if (inTable && tableRows.length > 0) {
            elements.push(renderTableHelper(tableRows, elements.length));
          }

          return <div key={bIdx} className="space-y-1">{elements}</div>;
        })}
      </div>
    );
  };

  // Helper inside AICoach to render markdown tables inside horizontally-scrollable wrappers properly
  const renderTableHelper = (rows: string[][], key: number | string) => {
    if (rows.length === 0) return null;
    const headers = rows[0];
    const dataRows = rows.slice(1);

    return (
      <div key={key} className="w-full my-4 overflow-x-auto rounded-xl border border-white/10 shadow-lg bg-slate-900/60 scrollbar-thin">
        <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-white/[0.04] border-b border-white/10">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-extrabold text-white uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {dataRows.map((row, rI) => (
              <tr key={rI} className="hover:bg-white/[0.02] transition-colors leading-[1.6]">
                {row.map((cell, cI) => (
                  <td key={cI} className="px-4 py-2.5 text-slate-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Computed time strings
  const getUpdateFormattedDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  // Helper to extract clean text and attached PDF info from messages
  const parseUserMessageDisplay = (text: string) => {
    if (!text) return { cleanText: "", pdfName: null };
    const match = text.match(/\[CONTEXT INTEGRATION: The student attached a study PDF file named "(.*?)"\./);
    const pdfName = match ? match[1] : null;
    const cleanText = text.split("\n\n[CONTEXT INTEGRATION:")[0];
    return { cleanText, pdfName };
  };

  return (
    <div id="ai-coach-full-width-adaptive" className="w-full h-full flex flex-col md:flex-row bg-[#FFFFFF] overflow-hidden relative text-slate-800">
      
      {/* ================= BAR BUTTON MOBILE TRIGGER ============== */}
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 outline-none active:bg-slate-50"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* ================= SIDEBAR (LEFT SECTION) ================= */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-76 bg-[#F8FAFC] border-r border-slate-200 p-5 flex flex-col transform transition-all duration-300 ease-in-out shrink-0 md:relative md:scale-100 ${
          isSidebarCollapsed 
            ? "-translate-x-full md:w-0 md:p-0 md:border-r-0 md:translate-x-0" 
            : "translate-x-0 md:w-76"
        } ${
          isMobileSidebarOpen 
            ? "translate-x-0 z-50 shadow-2xl" 
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Mobile Sidebar Close Button */}
        <div className="flex md:hidden justify-end mb-2">
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand / Premium Identity */}
        <div className="flex flex-col space-y-3 mb-4 select-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 border border-[#2563EB]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> StudyForge Coach
            </span>
            <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ONLINE
            </span>
          </div>

          <div className="bg-white border border-slate-200/60 p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-slate-400">Personal workspace</p>
            <p className="text-sm font-black text-slate-900 mt-0.5 truncate">🎓 {userName || "Premium Scholar"}</p>
            <div className="flex items-center gap-3 mt-1.5 font-mono text-[9px] text-slate-500">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-[#2563EB]" /> {xp.toLocaleString()} XP</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#2563EB]" /> {streak}d streak</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-200/50 my-3 shrink-0" />

        {/* Premium Workspace Master Navigation (The 8 requested options) */}
        <div className="space-y-0.5 mb-2-5 select-none shrink-0 border-b border-slate-200/50 pb-2.5">
          <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest pl-2 mb-1.5">Premium Workspace</p>
          {[
            { id: "landing", label: "Dashboard", icon: <Compass className="w-4 h-4" /> },
            { id: "planner", label: "Study Planner", icon: <BookOpen className="w-4 h-4" /> },
            { id: "goals", label: "Tasks", icon: <CheckSquare className="w-4 h-4" /> },
            { id: "notes", label: "Notes", icon: <PenTool className="w-4 h-4" /> },
            { id: "analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
            { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
            { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => {
                setIsMobileSidebarOpen(false);
                const targetTab = nav.id === "profile" ? "settings" : nav.id;
                onSelectTab?.(targetTab);
              }}
              className="w-full text-left p-1.5 px-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-semibold text-slate-600 hover:text-[#2563EB] hover:bg-slate-200/50 cursor-pointer"
            >
              <div className="text-slate-400 group-hover:text-[#2563EB] transition-colors">{nav.icon}</div>
              <span>{nav.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              logoutUser?.();
            }}
            className="w-full text-left p-1.5 px-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>

        {/* Chat History Title and New Chat Trigger */}
        <div className="flex justify-between items-center mb-2 pl-1 select-none shrink-0">
          <span className="text-[8px] uppercase font-black text-slate-400 tracking-widest">
            Study Dialogues
          </span>
          <button
            onClick={() => handleCreateNewChat()}
            className="text-xs font-black text-[#2563EB] hover:bg-[#2563EB]/10 p-1 px-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="w-3.5 h-3.5" /> Start New
          </button>
        </div>

        {/* Search bar inside Sidebar */}
        <div className="relative mb-3.5 shrink-0 select-none">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study dialogues..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#2563EB]/60 focus:ring-2 focus:ring-[#2563EB]/5 transition-all font-medium"
          />
        </div>

        {/* Scrolling Conversations Cohorts */}
        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-none pr-0.5">
          {/* Pinned Section */}
          {pinedConversations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-1 pl-1 select-none">
                <Pin className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB]" /> Pinned dialogues
              </span>
              <div className="space-y-1">
                {pinedConversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveSessionId(c.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all text-xs font-bold ${
                      activeSessionId === c.id
                        ? "bg-[#2563EB]/5 border-[#2563EB]/15 text-[#2563EB]"
                        : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1 truncate pr-2">
                      {editingSessionId === c.id ? (
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && finishRenameSession(c.id)}
                          onBlur={() => finishRenameSession(c.id)}
                          autoFocus
                          className="w-full bg-white text-slate-800 border-b border-[#2563EB] outline-none py-0.5 text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="truncate flex items-center gap-1.5">
                          <span className="shrink-0 text-slate-400">💬</span>
                          <span className="truncate">{c.title}</span>
                        </div>
                      )}
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider font-mono">
                        {c.subject} · {c.messages.length} log
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(c.id);
                        }}
                        title="Unpin"
                        className="p-1 hover:bg-white text-slate-400 hover:text-[#2563EB] rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Pin className="w-3 h-3 text-[#2563EB] fill-[#2563EB]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(c.id);
                        }}
                        title="Delete"
                        className="p-1 hover:bg-white text-slate-400 hover:text-rose-500 rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today Cohort */}
          {groupedConversations.today.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB] pl-1 block select-none">
                Today
              </span>
              <div className="space-y-1">
                {groupedConversations.today.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveSessionId(c.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all text-xs font-bold ${
                      activeSessionId === c.id
                        ? "bg-[#2563EB]/5 border-[#2563EB]/15 text-[#2563EB]"
                        : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      {editingSessionId === c.id ? (
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && finishRenameSession(c.id)}
                          onBlur={() => finishRenameSession(c.id)}
                          autoFocus
                          className="w-full bg-white text-slate-800 border-b border-[#2563EB] outline-none py-0.5 text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="truncate flex items-center gap-1.5">
                          <span className="shrink-0 text-slate-400">💬</span>
                          <span className="truncate">{c.title}</span>
                        </div>
                      )}
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider font-mono">
                        {c.subject} · {c.messages.length} log
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(c.id);
                        }}
                        title="Pin Chat"
                        className="p-1 hover:bg-white text-slate-400 hover:text-[#2563EB] rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(c.id);
                        }}
                        title="Delete Chat"
                        className="p-1 hover:bg-white text-slate-400 hover:text-rose-500 rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* This Week Cohort */}
          {groupedConversations.thisWeek.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB] pl-1 block select-none">
                This Week
              </span>
              <div className="space-y-1">
                {groupedConversations.thisWeek.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveSessionId(c.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all text-xs font-bold ${
                      activeSessionId === c.id
                        ? "bg-[#2563EB]/5 border-[#2563EB]/15 text-[#2563EB]"
                        : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      {editingSessionId === c.id ? (
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && finishRenameSession(c.id)}
                          onBlur={() => finishRenameSession(c.id)}
                          autoFocus
                          className="w-full bg-white text-slate-800 border-b border-[#2563EB] outline-none py-0.5 text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="truncate flex items-center gap-1.5">
                          <span className="shrink-0 text-slate-400">💬</span>
                          <span className="truncate">{c.title}</span>
                        </div>
                      )}
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider font-mono">
                        {c.subject} · {c.messages.length} log
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(c.id);
                        }}
                        title="Pin Chat"
                        className="p-1 hover:bg-white text-slate-400 hover:text-[#2563EB] rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(c.id);
                        }}
                        title="Delete Chat"
                        className="p-1 hover:bg-white text-slate-400 hover:text-rose-500 rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Older Cohort */}
          {groupedConversations.older.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB] pl-1 block select-none">
                Older
              </span>
              <div className="space-y-1">
                {groupedConversations.older.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveSessionId(c.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all text-xs font-bold ${
                      activeSessionId === c.id
                        ? "bg-[#2563EB]/5 border-[#2563EB]/15 text-[#2563EB]"
                        : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                       {editingSessionId === c.id ? (
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && finishRenameSession(c.id)}
                          onBlur={() => finishRenameSession(c.id)}
                          autoFocus
                          className="w-full bg-white text-slate-800 border-b border-[#2563EB] outline-none py-0.5 text-xs font-bold"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="truncate flex items-center gap-1.5">
                          <span className="shrink-0 text-slate-400">💬</span>
                          <span className="truncate">{c.title}</span>
                        </div>
                      )}
                      <div className="text-[9px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider font-mono">
                        {c.subject} · {c.messages.length} log
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(c.id);
                        }}
                        title="Pin Chat"
                        className="p-1 hover:bg-white text-slate-400 hover:text-[#2563EB] rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(c.id);
                        }}
                        title="Delete Chat"
                        className="p-1 hover:bg-white text-slate-400 hover:text-rose-500 rounded transition-all shadow-sm border border-slate-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {filteredConversations.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">
              😭 No conversations found
            </div>
          )}
        </div>

        {/* ================= QUICK ACCESS SEGMENTS ================= */}
        <div className="border-t border-slate-100 pt-3 mt-4 space-y-3 shrink-0">
          {/* 1. Revision / Register Subjects Index */}
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1 block mb-1">
              Subject Focus Hub
            </span>
            <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-none">
              <button
                onClick={() => handleCreateNewChat("General Study Tips")}
                className="w-full text-left p-1.5 hover:bg-[#2563EB]/5 rounded-lg text-[11px] text-[#2563EB] font-bold truncate flex items-center gap-1.5 border border-[#2563EB]/10 bg-white"
              >
                🎓 General Study Tips
              </button>
              {Array.from(new Set([
                ...subjects.map(s => s.title),
                ...subjectsList.map(s => s.name)
              ])).filter(Boolean).map((subjName) => (
                <button
                  key={subjName}
                  onClick={() => handleCreateNewChat(subjName)}
                  className="w-full text-left p-1.5 hover:bg-[#2563EB]/5 rounded-lg text-[11px] text-slate-600 hover:text-[#2563EB] font-semibold truncate flex items-center gap-1.5 border border-slate-100 bg-white"
                >
                  📖 {subjName}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Active Strategy Plans */}
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1 block mb-1">
              Current Micro Strategies
            </span>
            <div className="max-h-20 overflow-y-auto space-y-1 scrollbar-none">
              {studyPlans && studyPlans.length > 0 ? (
                studyPlans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleCreateNewChat(p.subject);
                      setTimeout(() => {
                        handleSendCoachMessage(
                          undefined,
                          `Give me an optimized breakdown of my active Study Plan milestone titles for "${p.subject}". Structure my upcoming week goals.`
                        );
                      }, 200);
                    }}
                    className="w-full text-left p-1.5 hover:bg-[#2563EB]/5 rounded-lg text-[10px] text-slate-700 hover:text-slate-900 font-bold truncate flex items-center gap-1 border border-slate-150 bg-white"
                  >
                    🎯 {p.subject} ({p.progress || 0}% plan progress)
                  </button>
                ))
              ) : (
                <span className="text-[10px] text-slate-400 pl-1 block font-medium">No blueprints active.</span>
              )}
            </div>
          </div>
        </div>

      </aside>

      {/* ========================================================= */}
      {/* ================= CONVERSATION PANEL (MAIN) ============= */}
      {/* ========================================================= */}
      <section className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        
        {/* ================= CONVERSATION HEADER ================= */}
        <header className="px-4 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0 bg-white shadow-sm z-30">
          
          {/* Active Title & Info */}
          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-[#2563EB] shrink-0 hidden sm:block animate-pulse" />
            <div className="truncate">
              <h2 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 truncate">
                {editingSessionId === activeSession.id ? (
                  <input
                    type="text"
                    value={editTitleText}
                    onChange={(e) => setEditTitleText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && finishRenameSession(activeSession.id)}
                    onBlur={() => finishRenameSession(activeSession.id)}
                    autoFocus
                    className="bg-white border border-[#2563EB]/40 rounded-xl px-2 py-1 text-xs text-slate-800 max-w-sm shadow-sm outline-none font-bold"
                  />
                ) : (
                  <span>{activeSession.title}</span>
                )}
                {activeSession.isPinned && (
                  <Pin className="w-3 h-3 text-[#2563EB] fill-[#2563EB] shrink-0" />
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Active subject: </span>
                <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-black text-[9px]">
                  {activeSession.subject}
                </span>
                <span>Mode: </span>
                <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-black text-[9px]">
                  {activeSession.chatMode}
                </span>
              </p>
            </div>
          </div>

          {/* Active Context Selections & 3-Dots Dropdown Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Focus Subject dropdown */}
            <select
              value={activeSession.subject}
              onChange={(e) => {
                const updatedVal = e.target.value;
                updateSessionSubject(updatedVal);
                if (updatedVal !== "Custom Focus") {
                  setCustomSubjectText("");
                }
              }}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 outline-none focus:border-[#2563EB]/40 transition-all font-black"
            >
              <option value="General Study" className="bg-white text-slate-800">🎓 General Study & Habits</option>
              {Array.from(new Set([
                ...subjects.map(s => s.title),
                ...subjectsList.map(s => s.name)
              ])).filter(Boolean).map((subjName) => {
                const sObj = subjects.find(s => s.title === subjName);
                const level = sObj?.level || "Medium";
                return (
                  <option key={subjName} value={subjName} className="bg-white text-slate-800">
                    🎓 {subjName}
                  </option>
                );
              })}
              <option value="Custom Focus" className="bg-white text-[#2563EB] font-extrabold">✍️ Custom Topic focus...</option>
            </select>

            {activeSession.subject === "Custom Focus" && (
              <input
                type="text"
                value={activeSession.customSubjectText || customSubjectText}
                placeholder="Topic text..."
                className="w-28 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] text-slate-800 outline-none focus:border-[#2563EB]/40 animate-fadeIn font-bold shadow-sm"
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomSubjectText(val);
                  setConversations(prev => prev.map(c => c.id === activeSessionId ? { ...c, customSubjectText: val } : c));
                }}
              />
            )}

            {/* Response Mode Selector */}
            <select
              value={activeSession.chatMode}
              onChange={(e) => updateSessionMode(e.target.value as any)}
              className="bg-white border border-[#2563EB]/20 rounded-xl px-2.5 py-1.5 text-[11px] text-[#2563EB] outline-none focus:border-[#2563EB]/40 transition-all font-black capitalize"
            >
              <option value="detailed" className="bg-white text-slate-800">📖 Detailed Explainer</option>
              <option value="quick" className="bg-white text-slate-800">⚡ Quick Answer</option>
              <option value="teacher" className="bg-white text-slate-800">🎓 Analogy / Teacher</option>
              <option value="quiz" className="bg-white text-slate-800">📝 Quiz Mode</option>
              <option value="flashcard" className="bg-white text-slate-800">🧠 Flashcards Matcher</option>
              <option value="exam" className="bg-white text-slate-800">🎯 Exam Prep Mode</option>
              <option value="motivation" className="bg-white text-slate-800">🔥 Motivation Booster</option>
            </select>

            {/* THREE DOTS DROPDOWN CONTAINER */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setActiveMenuId(activeMenuId === activeSession.id ? null : activeSession.id)}
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-pointer transition-all shadow-sm"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {activeMenuId === activeSession.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl p-2 shadow-xl z-50 text-[11px] text-slate-600 space-y-1"
                  >
                    <button
                      onClick={() => handleCreateNewChat()}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-[#2563EB]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Start New Study Chat
                    </button>
                    <button
                      onClick={() => startRenameSession(activeSession.id, activeSession.title)}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-slate-700"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-400" /> Rename Conversation
                    </button>
                    <button
                      onClick={() => handleTogglePin(activeSession.id)}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-slate-700"
                    >
                      <Pin className="w-3.5 h-3.5 text-slate-400" /> {activeSession.isPinned ? "Unpin Study Chat" : "Pin Study Chat"}
                    </button>
                    <button
                      onClick={() => handleShareClipboard()}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-slate-700"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Share Invitation
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    
                    {/* Export Actions */}
                    <button
                      onClick={() => handleExportChat(activeSession.id, "markdown")}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2563EB]" /> Export Chat (.md)
                    </button>
                    <button
                      onClick={() => handleExportChat(activeSession.id, "json")}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-600" /> Export Chat (.json)
                    </button>
                    
                    <button
                      onClick={() => handleClearConversation(activeSession.id)}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 text-amber-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear Discussion
                    </button>
                    
                    <div className="border-t border-slate-100 my-1" />
                    <span className="text-[9px] text-slate-450 font-extrabold uppercase px-2 block py-0.5">Prompt Accelerations</span>
                    <button
                      onClick={() => handleActionOnTopMsg("summary")}
                      className="w-full text-left p-2 hover:bg-indigo-50 text-indigo-700 rounded-lg font-black flex items-center gap-2"
                    >
                      📚 Generate Summary Of Chat
                    </button>
                    <button
                      onClick={() => handleActionOnTopMsg("quiz")}
                      className="w-full text-left p-2 hover:bg-blue-50 text-blue-700 rounded-lg font-black flex items-center gap-2"
                    >
                      📝 Generate Quiz From Session
                    </button>
                    <button
                      onClick={() => handleActionOnTopMsg("flashcards")}
                      className="w-full text-left p-2 hover:bg-emerald-50 text-emerald-700 rounded-lg font-black flex items-center gap-2"
                    >
                      🧠 Create Flashcards From Session
                    </button>
                    <button
                      onClick={() => handleActionOnTopMsg("notes")}
                      className="w-full text-left p-2 hover:bg-pink-50 text-pink-700 rounded-lg font-black flex items-center gap-2"
                    >
                      📄 Convert Chat into Student Notes
                    </button>

                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => handleDeleteChat(activeSession.id)}
                      className="w-full text-left p-2 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-2 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Study Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

        {/* ================= CHAT CONVERSATION HISTORY (MAIN PORTION) ================= */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 overflow-y-auto space-y-6 scroll-smooth bg-slate-50 relative selection:bg-[#2563EB]/10 selection:text-[#2563EB] ${
            isDraggingOver ? "outline-2 outline-dashed outline-[#2563EB]/50 bg-blue-50/50" : ""
          }`}
        >
          {isDraggingOver && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm border border-[#2563EB]/25 rounded-2xl flex flex-col items-center justify-center pointer-events-none z-50 animate-fadeIn">
              <div className="p-4 rounded-full bg-[#2563EB]/10 mb-3 border border-[#2563EB]/20">
                <Image className="w-8 h-8 text-[#2563EB] animate-bounce" />
              </div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-wider pl-1 font-display">Drop file to attach!</p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">StudyForge AI supports JPG, PNG, and WEBP notes & screenshots</p>
            </div>
          )}

          {/* Centering envelope for comfortable standard reading width (ChatGPT alignment) */}
          <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 space-y-6 flex flex-col">
            
            {activeSession.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 max-w-lg mx-auto py-16">
                <Sparkles className="w-10 h-10 text-[#2563EB]/30 mb-4 animate-pulse" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 font-display">Your study dialogue is blank</p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-sm mt-3 leading-6">
                  Ask doubts, formulate physics solvers, analyze notes, or pick one of the core academic tutoring prompt assistants below to jump in!
                </p>
              </div>
            )}

            {/* Render Active messages list */}
            {activeSession.messages.map((m, i) => {
              if (m.role === "user") {
                const { cleanText, pdfName } = parseUserMessageDisplay(m.content);
                return (
                  <div
                    key={i}
                    className="w-full flex flex-col items-end animate-fadeIn"
                  >
                    <div className="max-w-[90%] sm:max-w-[80%] flex flex-col gap-1.5 items-end">
                      {/* User Message Bubble */}
                      <div className="bg-[#2563EB] border border-[#2563EB]/10 text-white rounded-2xl rounded-tr-none px-4.5 py-3 shadow-md text-sm sm:text-base leading-relaxed">
                        
                        {/* Render attached upload Image if present */}
                        {m.imageUrl && (
                          <div className="mb-2.5 relative overflow-hidden rounded-xl border border-white/10 max-h-64 bg-slate-150 flex justify-center items-center shadow-inner">
                            <img 
                              src={m.imageUrl} 
                              alt="Uploaded material" 
                              className="max-h-64 max-w-full object-contain rounded-xl shadow-lg border border-white/5"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        {/* Render attached PDF chip badge inside user bubble */}
                        {pdfName && (
                          <div className="mb-2.5 flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl text-xs text-white font-bold shrink-0 font-mono">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate">📎 Connected Study Source: {pdfName}</span>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap select-text selection:bg-white/25 font-medium">{cleanText}</p>
                      </div>

                      {/* Timestamp & Copy bar row */}
                      <div className="flex gap-3 items-center text-[9px] uppercase font-mono text-slate-400 px-1 select-none">
                        <span>{getUpdateFormattedDate(m.timestamp)}</span>
                        <button
                          onClick={() => handleCopyMessageText(cleanText, i)}
                          className="hover:text-slate-700 transition-all cursor-pointer flex items-center gap-1 font-extrabold"
                          title="Copy text of user message"
                        >
                          {copiedMessageIdx === i ? <span className="text-emerald-500">Copied!</span> : <span>Copy</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Else if Assistant (Model) message
              return (
                <div
                  key={i}
                  className="w-full flex gap-3 sm:gap-4 items-start bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl animate-fadeIn mr-auto shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0 text-xs font-black font-display shadow-sm">
                    SF
                  </div>

                  <div className="flex-1 min-w-0 select-text">
                    <div className="text-slate-800 text-sm sm:text-base leading-relaxed">
                      {renderRichMarkdown(m.content)}
                    </div>
                    
                    {/* Micro actions panels */}
                    <div className="mt-4 flex items-center flex-wrap gap-4 border-t border-slate-100 pt-3.5 text-[10px] uppercase font-black tracking-widest text-[#2563EB] select-none">
                      <span className="font-mono text-slate-400">{getUpdateFormattedDate(m.timestamp)}</span>
                      
                      {/* Copy response */}
                      <button
                        onClick={() => handleCopyMessageText(m.content, i)}
                        className="hover:text-slate-800 text-slate-400 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Copy Response Text"
                      >
                        {copiedMessageIdx === i ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-extrabold">Copied Response!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>

                      {/* Voice Speak synthesis */}
                      <button
                        onClick={() => handleSpeakTextAlert(m.content, i)}
                        className={`hover:text-slate-800 text-slate-400 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          activeVoiceMessageIdx === i ? "text-[#2563EB] font-bold" : ""
                        }`}
                        title="Dictate response speak"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{activeVoiceMessageIdx === i ? "Stop Voice" : "Speak response"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* AI Generation State Container with detailed loader log lines */}
          {isChatLoading && (
            <div className="flex items-start gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 text-xs font-black">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm max-w-md">
                <div className="flex items-center gap-2 text-[#2563EB]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  <span className="font-bold">StudyForge AI Coach is thinking...</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium select-none">
                  Processing academic schema weights, context metadata, and tutoring mode heuristics...
                </p>
                {/* Pulsing Dots typing animation */}
                <div className="flex items-center gap-1.5 mt-3 pl-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce duration-300" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce duration-300" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce duration-300" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Bento guide if chat is just starting for onboarding academic features */}
          {activeSession.messages.length <= 1 && !isChatLoading && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] pl-1 block">
                🧠 Forge Scholastic Excellence (AI Presets)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetFeatures.map((feat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => {
                      const subjectTitle = activeSession.subject === "General Study" ? "all active registry loads" : activeSession.subject;
                      const constructedPrompt = `[${feat.title} request for ${subjectTitle}] - ${feat.prompt}`;
                      handleSendCoachMessage(undefined, constructedPrompt);
                    }}
                    className="p-4 bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-[#2563EB]/20 rounded-2xl text-left transition-all group flex items-start gap-3.5 cursor-pointer disabled:opacity-40 select-none shadow-sm hover:shadow-md"
                  >
                    <div className="p-2.5 bg-slate-50 border border-slate-100 group-hover:border-[#2563EB]/25 rounded-xl transition-all shadow-inner">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-700 group-hover:text-[#2563EB] transition-all uppercase tracking-wide">
                        {feat.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ================= CHAT ERROR STATUS WITH RETRY OPTIONS ============== */}
        {chatError && (
          <div className="px-6 py-3.5 bg-rose-50 border-y border-rose-100 text-rose-700 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <span className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{chatError}</span>
            </span>
            <button
              onClick={handleRetryLastMessage}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black flex items-center gap-1 text-[10px] uppercase tracking-wider cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Last Message
            </button>
          </div>
        )}

        {/* ================= CONVERSATION UTILITIES & QUICK ACTION BUTTONS HUB ================= */}
        <footer className="p-6 bg-white border-t border-slate-100 shrink-0 z-10 space-y-4">
          
          {/* Image Upload Preview Bar */}
          <AnimatePresence>
            {uploadedImageBase64 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    <img src={uploadedImageBase64} alt="Upload thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-700 truncate">{uploadedImageName || "Attached Image"}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready to analyze with AI Coach</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImageBase64(null);
                    setUploadedImageName("");
                  }}
                  className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-[10px] uppercase font-black tracking-widest text-rose-600 transition-all cursor-pointer"
                >
                  Discard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Vision Actions Row (Only visible when image is uploaded) */}
          <AnimatePresence>
            {uploadedImageBase64 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none select-none">
                  {[
                    { label: "Explain Image", icon: "💡", prompt: "Please analyze the visual content of this uploaded material and explain its main core concepts with logical clarity." },
                    { label: "Summarize Notes", icon: "📑", prompt: "Extract and summarize these textbook pages or notes in a clean, comprehensive study guide with bullet points." },
                    { label: "Solve Problem", icon: "📐", prompt: "Perform deep step-by-step problem solving for this visual math/science problem. Lay down the precise calculations." },
                    { label: "Generate Quiz", icon: "📝", prompt: "Based on this uploaded question paper, diagram, or textbook content, create a short active recall quiz." },
                    { label: "OCR Extract Text", icon: "🔍", prompt: "Perform clean, high-fidelity OCR text extraction of all visible words in this image, grouped by visual headers." },
                    { label: "Create Flashcards", icon: "🧠", prompt: "Generate 3 high-yield active recall flashcard pairs (Question-Answer style) based on this educational content." },
                    { label: "Identify Topics", icon: "🎯", prompt: "Identify the top curriculum headings and important academic topics highlighted in this material." },
                    { label: "Find Mistakes", icon: "❌", prompt: "Review any visible answers or worked-out problems here, point out any procedural/logical mistakes, and explain correcting details." },
                    { label: "Suggest Improvements", icon: "📈", prompt: "Analyze this homework or notes page and recommend 3 actionable improvements to score a top-tier academic mark." }
                  ].map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isChatLoading}
                      onClick={() => {
                        handleSendCoachMessage(undefined, act.prompt);
                      }}
                      className="px-3 py-2 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-[#2563EB] hover:text-[#2563EB]/90 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none shadow-sm"
                    >
                      <span>{act.icon}</span>
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick tutor small helpers row (scrollbar inline horizontal slider) */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none overflow-y-hidden">
            {[
              { label: "Explain Chapter", icon: "📚", text: "Walk me through the active parameters to explain this chapter with pristine logical clarity." },
              { label: "Quiz Recalls", icon: "📝", text: "Provide a quick diagnostic recall quiz based on this subject's core concepts." },
              { label: "Derive Formula", icon: "📐", text: "Let's perform a math/science trace derivation of the central formula step-by-step." },
              { label: "Check Weaknesses", icon: "📊", text: "Identify potential exam pitfalls, and give tailored confidence level boosters." },
              { label: "Time management", icon: "📅", text: "Explain how to pair my study time with Fajr early hours wakeup or other prayer intervals." },
              { label: "Study Hacks", icon: "💡", text: "What is a useful scientific active-recall exam shortcut for this exact registry?" }
            ].map((btn, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isChatLoading}
                onClick={() => {
                  const subLabel = activeSession.subject === "General Study" ? "general studies" : activeSession.subject;
                  const formatted = `[${btn.label} helper for ${subLabel}] - ${btn.text}`;
                  handleSendCoachMessage(undefined, formatted);
                }}
                className="px-3.5 py-2 bg-slate-50 hover:bg-[#2563EB]/5 border border-slate-200 hover:border-[#2563EB]/35 rounded-xl text-[11px] text-slate-600 font-bold hover:text-[#2563EB] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none shadow-sm"
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* PDF attachment indicator chip bar if a study item is linked */}
          <AnimatePresence>
            {attachedPdf && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="inline-flex items-center gap-2 bg-[#2563EB]/10 border border-[#2563EB]/25 px-3.5 py-1.5 rounded-xl text-xs text-[#2563EB] font-bold select-none"
              >
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="truncate">Connected Study PDF: {attachedPdf.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedPdfId(null)}
                  className="ml-2 hover:text-[#2563EB] text-slate-400 font-extrabold cursor-pointer text-xs"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render PDF file picker dropdown list if open */}
          {showPdfPicker && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 mt-2 max-h-48 overflow-y-auto shadow-xl animate-fadeIn relative z-25">
              <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-widest font-black select-none">
                <span>Select active recall document source</span>
                <button onClick={() => setShowPdfPicker(false)} className="hover:text-[#2563EB] cursor-pointer hover:underline text-[9px]">✕ Close</button>
              </div>
              {pdfs && pdfs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                  {pdfs.map(pdf => (
                    <button
                      key={pdf.id}
                      type="button"
                      onClick={() => {
                        setAttachedPdfId(pdf.id);
                        setShowPdfPicker(false);
                      }}
                      className="text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all flex items-center gap-2 select-none"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{pdf.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Chapters / total pages: {pdf.totalPages}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic p-1">No vault PDFs uploaded. Upload files first inside PDF Vault!</p>
              )}
            </div>
          )}

          {/* Form Input panel with Enter dispatch listener */}
          <div className="flex gap-2 sm:gap-3">
            <form
              onSubmit={(e) => handleSendCoachMessage(e)}
              className="flex-1 flex gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              
              {/* Button A: Screenshot/Image Upload */}
              <button
                type="button"
                disabled={isChatLoading}
                onClick={() => fileInputRef.current?.click()}
                title="Upload textbook notes page, screenshot, or graph (JPG, PNG, WEBP)"
                className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#2563EB]/40 text-[#2563EB] rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 shadow-sm"
              >
                <Image className="w-4 h-4" />
              </button>

              {/* Button B: PDF Vault Context Connector */}
              <button
                type="button"
                disabled={isChatLoading}
                onClick={() => setShowPdfPicker(!showPdfPicker)}
                title="Attach PDF book chapters context from vault"
                className={`p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#2563EB]/40 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 shadow-sm ${
                  attachedPdfId ? "border-[#2563EB] text-[#2563EB]" : "text-slate-400"
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Button C: Voice speech dictation Mic */}
              <button
                type="button"
                disabled={isChatLoading}
                onClick={handleToggleVoiceInput}
                title="Speak text via vocal voice dictation"
                className={`p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-400 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50 shadow-sm ${
                  isRecording ? "border-rose-500 text-rose-600 animate-pulse bg-rose-50" : "text-slate-400"
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Text Area Box */}
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder={
                  isRecording 
                    ? "Listening to voice dictation... Speak into microphone."
                    : activeSession.subject === "General Study"
                    ? "Ask about active recall, physics solvers, notes summaries..."
                    : activeSession.subject === "Custom Focus"
                    ? `Ask about ${activeSession.customSubjectText || customSubjectText || "your custom topic"}...`
                    : `Ask AI Coach about ${activeSession.subject}...`
                }
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-[#2563EB]/20 focus:border-[#2563EB]/45 transition-all font-medium min-w-0 shadow-sm"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!coachInput.trim() && !uploadedImageBase64) || isChatLoading}
                className="px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-100 disabled:to-slate-100 disabled:bg-slate-100 disabled:text-slate-400 rounded-2xl text-white transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Clear conversation helper button */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to clear conversation history?")) {
                  handleClearConversation(activeSession.id);
                }
              }}
              title="Clear conversation"
              className="p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </footer>

      </section>

    </div>
  );
}
