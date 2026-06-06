import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, BookOpen, Trophy, Award, Activity, Flame, Coins, 
  ChevronRight, ChevronLeft, Plus, Trash2, Bell, BellRing, Brain, 
  Play, Check, AlertTriangle, ShieldCheck, CheckCircle2, ListChecks, Calendar, Upload, FileText, User, Star, Eye,
  Coffee, Moon, Sun, Utensils
} from 'lucide-react';
import { StudyPlan, PdfFile, Quest, Achievement } from '../types';
import { generateConflictFreeTimetable, minutesToTime12, TimetableBlock } from '../utils/timetable';

interface SmartPlannerProps {
  routineData: any;
  setRoutineData: (data: any) => void;
  subjectsList: any[];
  setSubjectsList: (list: any[]) => void;
  studyPlans: StudyPlan[];
  setStudyPlans: React.Dispatch<React.SetStateAction<StudyPlan[]>>;
  selectedPlanDetail: StudyPlan | null;
  setSelectedPlanDetail: (plan: StudyPlan | null) => void;
  showNewAssessment: boolean;
  setShowNewAssessment: (show: boolean) => void;
  isGeneratingPlan: boolean;
  setIsGeneratingPlan: (val: boolean) => void;
  showToast: (msg: string) => void;
  activeReportTab: string;
  setActiveReportTab: (tab: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  pdfs: PdfFile[];
  setPdfs: React.Dispatch<React.SetStateAction<PdfFile[]>>;
  xp: number;
  setXp: any;
  coins: number;
  setCoins: any;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  onTriggerNotification?: (title: string, message: string) => void;
}

export default function SmartPlanner({
  routineData,
  setRoutineData,
  subjectsList,
  setSubjectsList,
  studyPlans,
  setStudyPlans,
  selectedPlanDetail,
  setSelectedPlanDetail,
  showNewAssessment,
  setShowNewAssessment,
  isGeneratingPlan,
  setIsGeneratingPlan,
  showToast,
  activeReportTab,
  setActiveReportTab,
  userName,
  setUserName,
  pdfs,
  setPdfs,
  xp,
  setXp,
  coins,
  setCoins,
  streak,
  setStreak,
  quests,
  setQuests,
  onTriggerNotification
}: SmartPlannerProps) {

  // Questionnaire Wizard Stage
  const [wizardStep, setWizardStep] = useState(1);
  const [semester, setSemester] = useState(() => localStorage.getItem("sf_semester") || "Semester 1");
  const [preferredStudyHours, setPreferredStudyHours] = useState(() => Number(localStorage.getItem("sf_preferred_hours")) || 4);
  const [preferredRewardActivity, setPreferredRewardActivity] = useState(() => localStorage.getItem("sf_preferred_reward") || "Gaming");

  // Local state for exam dates list
  const [exams, setExams] = useState<Array<{ id: string; name: string; date: string }>>(() => {
    const saved = localStorage.getItem("sf_planner_exams");
    return saved ? JSON.parse(saved) : [{ id: "exam-1", name: "Final Term Exam S1", date: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0] }];
  });

  // Local state for active reward session
  const [rewardActive, setRewardActive] = useState(false);
  const [rewardCountdown, setRewardCountdown] = useState(0);
  const [rewardDurationClaimed, setRewardDurationClaimed] = useState(0);
  const [rewardTypeClaimed, setRewardTypeClaimed] = useState("");

  // Local Simulated Notification Alerts
  const [localNotifications, setLocalNotifications] = useState<Array<{ id: string; msg: string; time: string; type: string }>>([]);

  // Generate conflict-free timetable dynamically
  const timetableBlocks = React.useMemo(() => {
    try {
      const formattedSubjects = subjectsList.map(s => ({
        name: s.name,
        examDate: s.examDate || '',
        totalChapters: Number(s.totalChapters) || 10,
        completedChapters: Number(s.completedChapters) || 0,
        importantChapters: s.importantChapters || '',
        difficultyLevel: (s.difficultyLevel === 'Hard' || s.difficultyLevel === 'Medium' || s.difficultyLevel === 'Easy') ? s.difficultyLevel : 'Medium',
        confidenceLevel: Number(s.confidenceLevel) || 5,
        previousMarks: Number(s.previousMarks) || 75,
        topicImportance: (s.topicImportance === 'High' || s.topicImportance === 'Medium' || s.topicImportance === 'Low') ? s.topicImportance : 'Medium'
      }));
      return generateConflictFreeTimetable(routineData, formattedSubjects as any);
    } catch (e) {
      console.error("Error generating timetable", e);
      return [];
    }
  }, [routineData, subjectsList]);

  // Compute Wake minutes to filter sleep blocks
  const wakeMins = React.useMemo(() => {
    const parts = (routineData.wakeUpTime || "05:00").split(":");
    return (parseInt(parts[0], 10) || 5) * 60 + (parseInt(parts[1], 10) || 0);
  }, [routineData.wakeUpTime]);

  const morningBlocks = React.useMemo(() => {
    return timetableBlocks.filter(b => b.startMins < 720 && b.type !== 'sleep');
  }, [timetableBlocks]);

  const afternoonBlocks = React.useMemo(() => {
    return timetableBlocks.filter(b => b.startMins >= 720 && b.startMins < 1020);
  }, [timetableBlocks]);

  const eveningBlocks = React.useMemo(() => {
    return timetableBlocks.filter(b => b.startMins >= 1020 && b.startMins < 1200);
  }, [timetableBlocks]);

  const nightBlocks = React.useMemo(() => {
    return timetableBlocks.filter(b => b.startMins >= 1200 || b.startMins < wakeMins || b.type === 'sleep');
  }, [timetableBlocks, wakeMins]);

  // Save exams to localstorage
  useEffect(() => {
    localStorage.setItem("sf_planner_exams", JSON.stringify(exams));
    localStorage.setItem("sf_semester", semester);
    localStorage.setItem("sf_preferred_hours", String(preferredStudyHours));
    localStorage.setItem("sf_preferred_reward", preferredRewardActivity);
  }, [exams, semester, preferredStudyHours, preferredRewardActivity]);

  // Handle active reward countdown timer
  useEffect(() => {
    let timer: any;
    if (rewardActive && rewardCountdown > 0) {
      timer = setInterval(() => {
        setRewardCountdown((prev) => {
          if (prev <= 1) {
            setRewardActive(false);
            showToast("🎮 Reward time over! Return to your study focus loop.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [rewardActive, rewardCountdown]);

  // Priority formula: Higher priority if: Exam is near, Previous marks are low, Difficulty is high, Confidence is low, Topic importance is high
  const calculateIntelligentPriorityScore = (sub: any) => {
    // 1. Difficulty level: Easy = 5, Medium = 10, Hard = 20
    const diffScore = sub.difficultyLevel === "Hard" ? 20 : sub.difficultyLevel === "Medium" ? 10 : 5;
    
    // 2. Confidence Level: (11 - confidenceLevel_1_to_10) * 2.5
    const confidenceScore = (11 - Math.max(1, Math.min(10, sub.confidenceLevel || 5))) * 2.5;

    // 3. Low Previous Marks: (100 - previousMarks) * 0.25
    const marksScore = (100 - Math.max(0, Math.min(100, sub.previousMarks || 75))) * 0.25;

    // 4. Topic Importance: High = 20, Medium = 10, Low = 3
    const importanceLevel = sub.topicImportance || "Medium";
    const importanceScore = importanceLevel === "High" ? 20 : importanceLevel === "Medium" ? 10 : 3;

    // 5. Exam Urgency Factor
    const daysRem = sub.examDate ? Math.max(1, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
    let urgencyScore = 2;
    if (daysRem <= 3) urgencyScore = 30;
    else if (daysRem <= 7) urgencyScore = 20;
    else if (daysRem <= 14) urgencyScore = 15;
    else if (daysRem <= 30) urgencyScore = 8;
    else urgencyScore = 3;

    // 6. Chapter Deficit Point addition
    const chapterDeficit = Math.max(0, (sub.totalChapters || 1) - (sub.completedChapters || 0)) * 1.5;

    return Math.round(diffScore + confidenceScore + marksScore + importanceScore + urgencyScore + chapterDeficit);
  };

  // Syllabus completed calculation
  const getSubjectIncompleteChapters = (sub: any) => {
    return Math.max(0, (sub.totalChapters || 1) - (sub.completedChapters || 0));
  };

  const getSubjectCompletionPct = (sub: any) => {
    const total = Math.max(1, sub.totalChapters || 1);
    const completed = sub.completedChapters || 0;
    return Math.min(100, Math.round((completed / total) * 100));
  };

  const renderBlockCard = (b: TimetableBlock) => {
    let cardStyle = "p-2.5 rounded-xl border transition-all duration-200 ";
    let badgeStyle = "text-[9px] uppercase font-black tracking-wider block mb-1 ";
    let icon = "📚";

    switch (b.type) {
      case "sleep":
        cardStyle += "bg-slate-950/25 border-slate-900/50 text-slate-500";
        badgeStyle += "text-slate-600";
        icon = "💤";
        break;
      case "wakeup":
        cardStyle += "bg-amber-500/5 border-amber-500/10 text-amber-300";
        badgeStyle += "text-amber-400";
        icon = "🌅";
        break;
      case "meal":
        cardStyle += "bg-orange-500/5 border-orange-500/10 text-orange-300";
        badgeStyle += "text-orange-400";
        icon = "🥞";
        break;
      case "prayer":
        cardStyle += "bg-purple-500/5 border-purple-500/10 text-purple-300";
        badgeStyle += "text-purple-400 font-extrabold";
        icon = "📿";
        break;
      case "study":
        cardStyle += "bg-indigo-950/30 border-indigo-500/30 text-white font-semibold shadow-[0_0_10px_rgba(99,102,241,0.05)]";
        badgeStyle += "text-indigo-400";
        icon = "📚";
        break;
      case "break":
        cardStyle += "bg-emerald-500/5 border-emerald-500/10 text-emerald-300";
        badgeStyle += "text-emerald-400";
        icon = "☕";
        break;
      default:
        cardStyle += "bg-zinc-900 border-zinc-800 text-zinc-300";
        badgeStyle += "text-zinc-500";
        icon = "⏳";
    }

    const start12 = minutesToTime12(b.startMins);
    const end12 = minutesToTime12(b.endMins);

    return (
      <div key={b.id} className={`${cardStyle} hover:bg-white/[0.02] hover:border-indigo-500/15 text-left`}>
        <div className="flex justify-between items-start gap-1">
          <span className={badgeStyle}>{start12} - {end12}</span>
          <span className="text-xs shrink-0">{icon}</span>
        </div>
        <span className="text-xs font-bold block leading-snug">{b.label}</span>
        {b.subLabel && <span className="text-[9px] text-slate-400 block mt-1 font-mono leading-none">{b.subLabel}</span>}
      </div>
    );
  };

  // Form Validation and Multi-step Wizard Navigation
  const validateStep1 = () => {
    if (!userName.trim()) {
      showToast("⚠️ Student Name is required!");
      return false;
    }
    if (!routineData.wakeUpTime || !routineData.sleepTime) {
      showToast("⚠️ Wake-up and Sleep times are required!");
      return false;
    }

    // Verify sequences
    if (routineData.wakeUpTime >= routineData.sleepTime) {
      showToast("⚠️ Wake-up time must be earlier than Sleep time!");
      return false;
    }

    // Ensure lunch values protect boundary sequences
    if (routineData.lunchStart && routineData.lunchEnd && routineData.lunchStart >= routineData.lunchEnd) {
      showToast("⚠️ Lunch start must precede Lunch end!");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (exams.length === 0) {
      showToast("⚠️ Please specify at least one Exam!");
      return false;
    }
    for (const ex of exams) {
      if (!ex.name.trim()) {
        showToast("⚠️ Exam name cannot be blank!");
        return false;
      }
      if (!ex.date) {
        showToast(`⚠️ Exam date is missing for ${ex.name}`);
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    if (subjectsList.length === 0) {
      showToast("⚠️ Please add at least one Subject!");
      return false;
    }
    for (const sub of subjectsList) {
      if (!sub.name.trim()) {
        showToast("⚠️ Subject Name is mandatory.");
        return false;
      }
      if (!sub.examDate) {
        showToast(`⚠️ Please bind an Exam Date for ${sub.name}`);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (validateStep1()) setWizardStep(2);
    } else if (wizardStep === 2) {
      if (validateStep2()) setWizardStep(3);
    }
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(1, prev - 1));
  };

  // Simulated PDF uploader trigger
  const triggerPdfUploadSimulation = (index: number) => {
    const randomId = `pdf-${Date.now()}`;
    const mockFile: PdfFile = {
      id: randomId,
      subjectId: `subject-${index}`,
      name: `${subjectsList[index].name}_Chapter_Overview.pdf`,
      uploadDate: new Date().toISOString().split('T')[0],
      totalPages: Math.floor(Math.random() * 25) + 10,
      currentPage: 0,
      readingTime: Math.floor(Math.random() * 60) + 30
    };
    
    setPdfs(prev => [mockFile, ...prev]);

    const updated = [...subjectsList];
    updated[index].pdfLinked = mockFile.name;
    setSubjectsList(updated);
    
    showToast(`Successfully linked Simulated PDF: ${mockFile.name}`);
  };

  // Complete synthesis trigger
  const handleSynthesizeRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsGeneratingPlan(true);
    try {
      // Collect primary routine and multi exam payload
      const payload = {
        subjectsList: subjectsList.map(sub => {
          const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
          return {
            ...sub,
            daysRemaining: daysRem,
            priorityScore: calculateIntelligentPriorityScore(sub)
          };
        }),
        routine: {
          ...routineData,
          semester,
          preferredStudyHours,
          preferredRewardActivity,
          activeExams: exams
        }
      };

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assessment_study_plan",
          payload
        }),
      });

      let freshResult;
      if (response.ok) {
        freshResult = await response.json();
      } else {
        throw new Error("Unable to contact study service, fallback enabled");
      }

      const totalChapters = subjectsList.reduce((acc, s) => acc + (s.totalChapters || 0), 0);
      const completedChapters = subjectsList.reduce((acc, s) => acc + (s.completedChapters || 0), 0);
      const syllabusCompletionPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      
      const minDaysRem = exams.reduce((min, ex) => {
        const d = Math.max(0, Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / 86400000));
        return min === null || d < min ? d : min;
      }, null as number | null) || 15;

      const clientReadinessScore = Math.max(15, Math.min(100, Math.round(
        (syllabusCompletionPct * 0.4) +
        (subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length) * 4.0) +
        (subjectsList.reduce((acc, s) => acc + (s.previousMarks || 75), 0) / Math.max(1, subjectsList.length) * 0.2)
      )));

      // Built standard prioritized rankings
      const computedRankings = subjectsList.map((sub) => {
        const score = calculateIntelligentPriorityScore(sub);
        const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
        const subIncomplete = getSubjectIncompleteChapters(sub);
        let risk = "safe";
        if (daysRem < 14 && subIncomplete > 3) risk = "high";
        else if (daysRem < 30 && subIncomplete > 1) risk = "moderate";

        return {
          subjectName: sub.name,
          priorityScore: score,
          riskStatus: risk,
          daysRemaining: daysRem,
          reason: `Intelligent priority factor of ${score} triggers automatic revision blocks. Difficulty index: ${sub.difficultyLevel}.`
        };
      }).sort((a, b) => b.priorityScore - a.priorityScore);

      const computedCountdowns = exams.map((ex) => {
        const days = Math.max(0, Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / 86400000));
        return {
          subjectName: ex.name,
          daysLeft: days,
          riskStatus: days < 14 ? "high" : days < 30 ? "moderate" : "safe",
          isCrisis: days < 14,
          syllabusIncompletePercent: 100 - syllabusCompletionPct
        };
      });

      const planObject: StudyPlan = {
        id: `intelligent-planner-${Date.now()}`,
        subject: subjectsList.map(s => s.name).join(", "),
        level: semester,
        overview: `Synchronized High-Retention Cognitive Roadmap for ${userName}. Semester: ${semester}.`,
        proTip: `Hard subjects receive customized Spaced Repetition blocks and earlier scheduling slots during hours of high focus.`,
        milestones: [
          {
            week: "Week 1 Core Sprint",
            title: "Peak Mental Energy Allocation Blocks",
            topics: subjectsList.map(s => `${s.name} critical topics.`),
            estimatedHours: preferredStudyHours * 7,
            quizAvailable: true,
            completed: false
          }
        ],
        createdAt: new Date().toISOString(),
        progress: syllabusCompletionPct,
        assessmentData: {
          course: semester,
          subjects: subjectsList.map(s => s.name).join(", "),
          startDate: exams[0]?.date || new Date().toISOString().split('T')[0],
          chaptersTotal: totalChapters,
          chaptersCompleted: completedChapters,
          subjectsList: [...subjectsList],
          routine: { ...routineData }
        },
        assessmentResult: {
          daysRemaining: minDaysRem,
          completionPercent: syllabusCompletionPct,
          difficultyScore: Math.round(subjectsList.reduce((acc, s) => acc + (s.difficultyLevel === "Hard" ? 9 : s.difficultyLevel === "Medium" ? 6 : 3), 0) / Math.max(1, subjectsList.length)),
          weaknessScore: Math.round(10 - (subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length))),
          confidenceScore: Math.round(subjectsList.reduce((acc, s) => acc + (s.confidenceLevel || 5), 0) / Math.max(1, subjectsList.length)),
          revisionRequirement: "Tackle weak subjects after 1, 3, and 7 days periodically.",
          readinessScore: clientReadinessScore,
          riskScore: computedRankings.some(r => r.riskStatus === "high") ? "high" : "moderate",
          dailyStudyPlan: freshResult?.dailyStudyPlan || `
### 🌅 Morning Bracket (High Cognitive Energy)
*   **06:00 AM - 08:30 AM**: 📚 Deep Focus block for **Hard subjects** (Feynman Technique).

### 🍕 Afternoon Bracket (Medium Focus)
*   **02:00 PM - 03:30 PM**: Active recall practices on moderate units.

### 🌙 Evening & Night (Spaced Revision)
*   **07:00 PM - 08:30 PM**: Solving Past exams / Mock Simulator review.
*   **09:00 PM - 10:00 PM**: Active memory flashcards & Reflection loops.
`,
          weeklyStudyPlan: freshResult?.weeklyStudyPlan || "Focus daily on high-marks syllabus chapters first.",
          monthlyStudyPlan: freshResult?.monthlyStudyPlan || "Strategic checkpoint sprints across exam timelines.",
          revisionSchedule: freshResult?.revisionSchedule || "Spaced recall triggers: 3-day intervals for hard topics.",
          examCrisisPlan: freshResult?.examCrisisPlan || "Emergency syllabus compress plan: focus on critical markers.",
          priorityTopics: freshResult?.priorityTopics || subjectsList.map(s => `${s.name}: Focus on chapter ${s.totalChapters} key concepts`),
          aiRecommendations: freshResult?.aiRecommendations || [
            "Structure Pomodoro focus triggers under continuous feedback loops.",
            "Protect sleeping and meal thresholds strictly.",
            "Complete continuous revision quizzes to double confidence metrics."
          ],
          priorityRanking: computedRankings,
          subjectCountdowns: computedCountdowns
        }
      };

      setStudyPlans((prev) => [planObject, ...prev]);
      setSelectedPlanDetail(planObject);
      setShowNewAssessment(false);
      showToast("🎇 Spectacular Cognitive Study Master Plan Synthesized Successfully!");

      // Update quests
      setQuests(prev => prev.map(q => q.targetType === 'study_session' ? { ...q, currentValue: Math.min(q.currentValue + 1, q.targetValue) } : q));

    } catch (err: any) {
      console.error(err);
      showToast("⚠️ Could not synthesize study schedule. Try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Claim study session complete reward triggers
  const handleClaimReward = (type: string, durationMin: number) => {
    if (xp < 50) {
      showToast("⚠️ You need at least 50 XP to trigger active Free Time rewards!");
      return;
    }
    setXp((prev: number) => Math.max(0, prev - 30));
    setCoins((prev: number) => prev + 15);
    setRewardCountdown(durationMin * 60);
    setRewardDurationClaimed(durationMin);
    setRewardTypeClaimed(type);
    setRewardActive(true);
    showToast(`🎉 Claimed ${durationMin} mins of ${type}! Timer initiated.`);
  };

  const handleManualChapterComplete = (subjectIdx: number) => {
    const updated = [...subjectsList];
    const sub = updated[subjectIdx];
    if (sub.completedChapters < sub.totalChapters) {
      sub.completedChapters += 1;
      setSubjectsList(updated);

      // Award XP
      const xpGained = sub.difficultyLevel === "Hard" ? 50 : sub.difficultyLevel === "Medium" ? 30 : 15;
      setXp((prev: number) => prev + xpGained);
      setCoins((prev: number) => prev + 10);
      showToast(`🏆 Chapter complete! Gained +${xpGained} XP & +10 Study Coins!`);

      // Update active study plans milestones
      if (selectedPlanDetail) {
        const total = updated.reduce((acc, s) => acc + (s.totalChapters || 0), 0);
        const completed = updated.reduce((acc, s) => acc + (s.completedChapters || 0), 0);
        const pct = Math.round((completed / total) * 100);
        
        const modified = {
          ...selectedPlanDetail,
          progress: pct,
          assessmentResult: {
            ...selectedPlanDetail.assessmentResult!,
            completionPercent: pct
          }
        };
        setSelectedPlanDetail(modified);
        setStudyPlans(prev => prev.map(p => p.id === selectedPlanDetail.id ? modified : p));
      }
    } else {
      showToast("✨ Beautiful! All chapters in this subject are fully completed.");
    }
  };

  const activePlan = selectedPlanDetail || studyPlans[0];

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Header Card */}
      <div className="bg-gradient-to-tr from-indigo-950/80 via-[#0d1022]/90 to-purple-950/70 border border-indigo-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-black text-indigo-300">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>StudyForge Cognitive Planning Engine</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              AI Study Planner & Strategy Operating System
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Dynamically links school curricula, exams timelines, meals checkpoints, and cognitive focus variables to schedule overlap-guarded schedules.
            </p>
          </div>

          <div className="flex gap-2">
            {studyPlans.length > 0 && (
              <button
                onClick={() => {
                  setShowNewAssessment(true);
                  setWizardStep(1);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:scale-[1.02] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                🔄 Redesign Timetable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reward active banner widget */}
      {rewardActive && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">🎮 Free Time Reward Active</h4>
              <p className="text-[10px] text-slate-300">Enjoy {rewardTypeClaimed} and recharge cognitive power!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase text-slate-400 font-extrabold block">Time Remaining</span>
            <span className="text-lg font-black font-mono text-yellow-400">
              {Math.floor(rewardCountdown / 60)}:{(rewardCountdown % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* REPORT DASHBOARD OR STEPS WIZARD SECTION */}
      {showNewAssessment || studyPlans.length === 0 ? (
        
        /* MULTI-STEP WIZARD */
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
          
          {/* Header step tracker */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black tracking-widest text-slate-400 uppercase">
              <span>Step {wizardStep} of 3</span>
              <span className="text-indigo-400">
                {wizardStep === 1 ? "👤 Step 1: Student Profile" : wizardStep === 2 ? "📅 Step 2: Exams Timetable" : "📚 Step 3: Academic Subjects"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(wizardStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSynthesizeRoadmap} className="space-y-6 pt-2">
            
            {/* STEP 1: STUDENT PROFILE */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/10">
                  <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Student Profile Details
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Provide basic identifiers and sleep/wake boundary constraints. Meals and prayers will establish safety zones preventing system overload.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">👤 Student Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">🎓 Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50"
                    >
                      <option value="Semester 1">Semester 1 (Freshman Core)</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3 (Mid-Tier Special)</option>
                      <option value="Semester 4">Semester 4 (Candidate Major)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">⏰ Study Hours/Day</label>
                      <input
                        type="number"
                        min="2"
                        max="12"
                        value={preferredStudyHours}
                        onChange={(e) => setPreferredStudyHours(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">🎮 Preferred Reward</label>
                      <select
                        value={preferredRewardActivity}
                        onChange={(e) => setPreferredRewardActivity(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2.5 text-xs text-white"
                      >
                        <option value="Gaming">Gaming 🎮</option>
                        <option value="Movie">Movie 🍿</option>
                        <option value="Social Media">Social Media 📱</option>
                        <option value="Music">Music 🎧</option>
                        <option value="Sleep">Sleeping 💤</option>
                        <option value="Walking">Walking 🚶‍♂️</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">🌅 Wake-Up Time</label>
                    <input
                      type="time"
                      value={routineData.wakeUpTime || "05:00"}
                      onChange={(e) => setRoutineData({ ...routineData, wakeUpTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white color-scheme-dark"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">🌙 Night Sleep Time</label>
                    <input
                      type="time"
                      value={routineData.sleepTime || "22:00"}
                      onChange={(e) => setRoutineData({ ...routineData, sleepTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white color-scheme-dark"
                      required
                    />
                  </div>
                </div>

                {/* MEAL LIMITS */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-white/5 pb-1 flex items-center gap-1.5">
                    🥐 Meal Bounds
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <label className="text-[9px] font-extrabold uppercase text-slate-300">🍳 Breakfast Hours</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={routineData.breakfastStart || "08:00"}
                          onChange={(e) => setRoutineData({ ...routineData, breakfastStart: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                        />
                        <span className="text-[10px] text-slate-500">to</span>
                        <input
                          type="time"
                          value={routineData.breakfastEnd || "08:30"}
                          onChange={(e) => setRoutineData({ ...routineData, breakfastEnd: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <label className="text-[9px] font-extrabold uppercase text-slate-300">🍕 Lunch Break (FIXED SAVE)</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={routineData.lunchStart || "13:00"}
                          onChange={(e) => setRoutineData({ ...routineData, lunchStart: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                        />
                        <span className="text-[10px] text-slate-500">to</span>
                        <input
                          type="time"
                          value={routineData.lunchEnd || "14:00"}
                          onChange={(e) => setRoutineData({ ...routineData, lunchEnd: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <label className="text-[9px] font-extrabold uppercase text-slate-300">🍱 Dinner Break</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="time"
                          value={routineData.dinnerStart || "20:00"}
                          onChange={(e) => setRoutineData({ ...routineData, dinnerStart: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                        />
                        <span className="text-[10px] text-slate-500">to</span>
                        <input
                          type="time"
                          value={routineData.dinnerEnd || "21:00"}
                          onChange={(e) => setRoutineData({ ...routineData, dinnerEnd: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRAYER BLOCKS */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-wider border-b border-indigo-500/10 pb-1 flex items-center gap-1.5">
                    📿 Spiritual Prayer Start & End Timestamps (No study overlaps allowed!)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                      { name: "Fajr", startKey: "fajrStart", endKey: "fajrEnd", fallbackKey: "fajrTime", defStart: "04:30", defEnd: "05:00" },
                      { name: "Dhuhr", startKey: "dhuhrStart", endKey: "dhuhrEnd", fallbackKey: "dhuhrTime", defStart: "12:30", defEnd: "13:00" },
                      { name: "Asr", startKey: "asrStart", endKey: "asrEnd", fallbackKey: "asrTime", defStart: "16:00", defEnd: "16:30" },
                      { name: "Maghrib", startKey: "maghribStart", endKey: "maghribEnd", fallbackKey: "maghribTime", defStart: "19:00", defEnd: "19:30" },
                      { name: "Isha", startKey: "ishaStart", endKey: "ishaEnd", fallbackKey: "ishaTime", defStart: "20:30", defEnd: "21:00" },
                    ].map((item) => {
                      return (
                        <div key={item.name} className="p-3 bg-purple-950/20 border border-purple-500/10 rounded-xl text-center">
                          <label className="text-[9px] font-black uppercase text-purple-300 block">{item.name} Range</label>
                          <div className="flex flex-col gap-1 mt-1.5">
                            <input
                              type="time"
                              value={routineData[item.startKey] || routineData[item.fallbackKey] || item.defStart}
                              onChange={(e) => setRoutineData({ ...routineData, [item.startKey]: e.target.value, [item.fallbackKey]: e.target.value })}
                              className="w-full bg-black/40 text-center border border-white/10 rounded px-2 py-0.5 text-xs text-white color-scheme-dark"
                            />
                            <span className="text-[8px] text-slate-500">to</span>
                            <input
                              type="time"
                              value={routineData[item.endKey] || item.defEnd}
                              onChange={(e) => setRoutineData({ ...routineData, [item.endKey]: e.target.value })}
                              className="w-full bg-black/40 text-center border border-white/10 rounded px-2 py-0.5 text-xs text-white color-scheme-dark"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2: EXAMS TIMELINE */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/10 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      Exam Period Timelines
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Specify dates for multiple upcoming test papers to compute countdown clocks and Priority Scores.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExams([...exams, { id: `exam-${Date.now()}`, name: "", date: "" }]);
                    }}
                    className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-lg uppercase transition-all"
                  >
                    ➕ Register Exam
                  </button>
                </div>

                <div className="space-y-3">
                  {exams.map((ex, idx) => {
                    const days = ex.date ? Math.max(0, Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / 86400000)) : null;
                    return (
                      <div key={ex.id} className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Exam Title Name</label>
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => {
                                const updated = [...exams];
                                updated[idx].name = e.target.value;
                                setExams(updated);
                              }}
                              placeholder="e.g. Mathematics Advanced"
                              className="w-full bg-[#07080a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Examination Date</label>
                            <input
                              type="date"
                              value={ex.date}
                              onChange={(e) => {
                                const updated = [...exams];
                                updated[idx].date = e.target.value;
                                setExams(updated);
                              }}
                              className="w-full bg-[#07080a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white color-scheme-dark"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {days !== null && (
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 block uppercase">Countdown</span>
                              <span className={`text-xs font-black px-2 py-0.5 rounded ${days < 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>
                                {days} Days Left
                              </span>
                            </div>
                          )}

                          {exams.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setExams(exams.filter(item => item.id !== ex.id));
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: SUBJECTS SETUP */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/10 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      Cognitive Academic Subjects
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Determine individual scopes, confidence parameters, syllabus chapters, and PDFs uploaded to configure algorithms.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubjectsList([
                        ...subjectsList,
                        {
                          name: "",
                          examDate: exams[0]?.date || "",
                          totalChapters: 8,
                          completedChapters: 0,
                          importantChapters: "",
                          difficultyLevel: "Medium",
                          confidenceLevel: 5,
                          previousMarks: 70,
                          desiredDailyHours: 2,
                          notes: "",
                          pdfLinked: ""
                        }
                      ]);
                    }}
                    className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-lg uppercase transition-all"
                  >
                    ➕ Add Subject Model
                  </button>
                </div>

                <div className="space-y-6 leading-relaxed">
                  {subjectsList.map((subject, index) => {
                    const linked = subject.pdfLinked;
                    return (
                      <div key={index} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 relative space-y-4">
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-purple-400" />
                            Subject #{index + 1}: {subject.name || "Untitled"}
                          </span>
                          
                          {subjectsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSubjectsList(subjectsList.filter((_, idx) => idx !== index));
                              }}
                              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 uppercase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Subject Name</label>
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) => {
                                const updated = [...subjectsList];
                                updated[index].name = e.target.value;
                                setSubjectsList(updated);
                              }}
                              placeholder="e.g. Mathematics"
                              className="w-full bg-[#07080a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Link Exam Syllabus</label>
                            <select
                              value={subject.examDate || ""}
                              onChange={(e) => {
                                const updated = [...subjectsList];
                                updated[index].examDate = e.target.value;
                                setSubjectsList(updated);
                              }}
                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                              required
                            >
                              <option value="">-- Choose registered exam --</option>
                              {exams.map(e => (
                                <option key={e.id} value={e.date}>{e.name} ({e.date})</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Total chapters</label>
                              <input
                                type="number"
                                min="1"
                                value={subject.totalChapters !== undefined && subject.totalChapters !== "" && !isNaN(subject.totalChapters) ? subject.totalChapters : ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...subjectsList];
                                  updated[index].totalChapters = val === "" ? "" : Math.max(1, parseInt(val, 10));
                                  setSubjectsList(updated);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Completed</label>
                              <input
                                type="number"
                                min="0"
                                max={subject.totalChapters || 10}
                                value={subject.completedChapters !== undefined && subject.completedChapters !== "" && !isNaN(subject.completedChapters) ? subject.completedChapters : ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...subjectsList];
                                  updated[index].completedChapters = val === "" ? "" : Math.max(0, parseInt(val, 10));
                                  setSubjectsList(updated);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400 font-bold block">Weights & Priority</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 block uppercase mb-1">Difficulty</label>
                                <select
                                  value={subject.difficultyLevel || "Medium"}
                                  onChange={(e) => {
                                    const updated = [...subjectsList];
                                    updated[index].difficultyLevel = e.target.value;
                                    setSubjectsList(updated);
                                  }}
                                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
                                >
                                  <option value="Easy">Easy 😊</option>
                                  <option value="Medium">Medium ⚙️</option>
                                  <option value="Hard">Hard 🔥</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-500 block uppercase mb-1">Importance</label>
                                <select
                                  value={subject.topicImportance || "Medium"}
                                  onChange={(e) => {
                                    const updated = [...subjectsList];
                                    updated[index].topicImportance = e.target.value;
                                    setSubjectsList(updated);
                                  }}
                                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white"
                                >
                                  <option value="Low">Low 😴</option>
                                  <option value="Medium">Medium 🎯</option>
                                  <option value="High">High 🚀</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] font-black uppercase text-slate-400">Confidence Scale</label>
                              <span className="text-[10px] font-black text-indigo-300">{(subject.confidenceLevel || 5)}/10</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={subject.confidenceLevel || 5}
                              onChange={(e) => {
                                const updated = [...subjectsList];
                                updated[index].confidenceLevel = parseInt(e.target.value, 10);
                                setSubjectsList(updated);
                              }}
                              className="w-full accent-indigo-500 h-1 bg-white/10 appearance-none rounded cursor-pointer mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Last Test Marks %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={subject.previousMarks !== undefined && subject.previousMarks !== "" && !isNaN(subject.previousMarks) ? subject.previousMarks : ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...subjectsList];
                                  updated[index].previousMarks = val === "" ? "" : Math.max(0, parseInt(val, 10));
                                  setSubjectsList(updated);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400">Desired Mins PDF</label>
                              <input
                                type="number"
                                min="10"
                                value={subject.readingTime !== undefined && subject.readingTime !== "" && !isNaN(subject.readingTime) ? subject.readingTime : ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...subjectsList];
                                  updated[index].readingTime = val === "" ? "" : Math.max(10, parseInt(val, 10));
                                  setSubjectsList(updated);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Important topics to secure</label>
                            <input
                              type="text"
                              value={subject.importantChapters || ""}
                              onChange={(e) => {
                                const updated = [...subjectsList];
                                updated[index].importantChapters = e.target.value;
                                setSubjectsList(updated);
                              }}
                              placeholder="e.g. Calculus integrations, Newton axioms"
                              className="w-full bg-[#07080a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                            />
                          </div>

                          {/* Interactive PDF Link uploader */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-slate-400">Link reference book PDF</label>
                            <div className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={() => triggerPdfUploadSimulation(index)}
                                className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/20 rounded-lg flex items-center gap-1.5 cursor-pointer max-w-full truncate"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span className="truncate">{linked ? `✓ Linked: ${linked}` : "Upload Simulated Syllabus PDF"}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BUTTONS ROW */}
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={wizardStep === 1 || isGeneratingPlan}
                className="px-5 py-2 border border-white/10 hover:bg-white/5 text-slate-300 disabled:opacity-30 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Prev Step
              </button>

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isGeneratingPlan}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.25)]"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Linking Cognitive Matrix...
                    </>
                  ) : (
                    "Synthesize Cognitive Roadmap"
                  )}
                </button>
              )}
            </div>

          </form>

        </div>

      ) : (

        /* HIGH POWER COGNITIVE PLATFORM VIEW (Steps 4 to 10!) */
        <div className="space-y-6">
          
          {/* Active plan select and reset */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/40 p-4 border border-white/10 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#93c5fd] block">Active Strategic Roadmap</span>
              <p className="text-white text-xs font-black">
                {activePlan.subject} Study Plan (Semester: {activePlan.level})
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewAssessment(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-extrabold rounded-xl uppercase transition-all"
              >
                🔄 Redo Core Assessment
              </button>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Countdown / Remaining */}
            <div className="bg-slate-950/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Exam Timeline</span>
              <div className="my-auto">
                <span className="text-3xl font-black text-rose-400 leading-none">
                  {activePlan.assessmentResult?.daysRemaining}
                </span>
                <span className="text-[10px] text-slate-300 block uppercase font-extrabold mt-1">Days Remaining</span>
              </div>
            </div>

            {/* Syllabus Coverage */}
            <div className="bg-slate-950/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-sans">Syllabus Covered</span>
              <div className="my-auto">
                <span className="text-3xl font-black text-emerald-400 leading-none">
                  {activePlan.assessmentResult?.completionPercent || 0}%
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold mt-1">
                  Average Chapter Cover Index
                </span>
              </div>
            </div>

            {/* Exam Readiness Indicator */}
            <div className="bg-slate-950/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-sans">Exam Readiness</span>
              <div className="my-auto">
                <span className="text-3xl font-black text-purple-400 leading-none">
                  {activePlan.assessmentResult?.readinessScore || 70}%
                </span>
                
                {/* Risk colored flag indicator */}
                <div className="mt-1 flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    activePlan.assessmentResult?.riskScore === "high" ? "bg-rose-500" : activePlan.assessmentResult?.riskScore === "moderate" ? "bg-amber-400" : "bg-emerald-400"
                  }`}></div>
                  <span className="text-[10px] text-slate-300 font-bold uppercase shrink-0">
                    {activePlan.assessmentResult?.riskScore === "high" ? "High Risk" : activePlan.assessmentResult?.riskScore === "moderate" ? "Moderate Risk" : "Excellent Mode"}
                  </span>
                </div>
              </div>
            </div>

            {/* Coins logged */}
            <div className="bg-slate-950/40 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/5 rounded-full blur-xl"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-sans">Power Tokens</span>
              <div className="my-auto">
                <span className="text-3xl font-black text-yellow-400 leading-none flex items-center gap-1.5">
                  <Coins className="w-7 h-7 text-yellow-400 shrink-0" />
                  {coins}
                </span>
                <span className="text-[10px] text-slate-500 block uppercase font-extrabold mt-1">Earned Balance</span>
              </div>
            </div>

          </div>

          {/* MAIN TABS SELECTORS */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar bg-slate-950/40 p-2 gap-1 select-none">
              {[
                { id: "priority_rankings", label: "📊 Subject Analysis", icon: Activity },
                { id: "timetable_schedule", label: "📅 AI Timetable", icon: Clock },
                { id: "chapters_tracker", label: "📖 Chapter Planner", icon: ListChecks },
                { id: "notification_triggers", label: "🔔 Smart Alerts", icon: BellRing },
                { id: "gamification_rewards", label: "🎮 Reward Claim", icon: Trophy },
                { id: "coach_mentoring", label: "🧠 AI Study Coach", icon: Brain }
              ].map((item) => {
                const active = activeReportTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveReportTab(item.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT BLOCK */}
            <div className="p-6 min-h-[300px]">
              
              {/* TAB 1: SUBJECT RANKING & TECHNIQUES */}
              {activeReportTab === "priority_rankings" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">📊 AI Subject Priority Score Calculation</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Algorithm: <code className="text-indigo-300 font-mono">Priority Score = Difficulty × Exam Urgency × Chapters count × Weakness</code>. High-scoring hard subjects automatically receive larger daily focus brackets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">Prioritized Subject Slots</h4>
                      
                      <div className="space-y-3">
                        {subjectsList.map((sub, idx) => {
                          const pScore = calculateIntelligentPriorityScore(sub);
                          const daysRem = sub.examDate ? Math.max(0, Math.ceil((new Date(sub.examDate).getTime() - new Date().getTime()) / 86400000)) : 30;
                          return (
                            <div key={idx} className="bg-slate-950/50 p-4 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                              <div className="space-y-1 min-w-0">
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Rank #{idx + 1}</span>
                                <h5 className="text-sm font-black text-white truncate">{sub.name}</h5>
                                <div className="flex flex-wrap gap-2 text-[9px] uppercase font-bold text-slate-400">
                                  <span>Diff: {sub.difficultyLevel}</span>
                                  <span>•</span>
                                  <span>Marks: {sub.previousMarks}%</span>
                                  <span>•</span>
                                  <span>Days: {daysRem}d</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[9px] font-extrabold text-[#93c5fd] uppercase block">Priority Weight</span>
                                <span className={`text-lg font-black ${pScore > 40 ? 'text-rose-400' : pScore > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {pScore} PTS
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">🚨 AI Recommended Study Techniques</h4>
                      
                      <div className="space-y-3 text-xs leading-relaxed">
                        {subjectsList.map((sub, idx) => {
                          const method = sub.difficultyLevel === "Hard" ? "Feynman Principle + Deep Focus" : sub.difficultyLevel === "Medium" ? "Pomodoro + Active Recall" : "Blurting Method + Spaced Recall";
                          const why = sub.difficultyLevel === "Hard" ? "High difficulty spikes mental exhaustion; breaking down concepts to elementary levels secures highest rapid retention." : "Moderate scope allows structured active question blocks with continuous micro feedback loops.";
                          
                          return (
                            <div key={idx} className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl">
                              <div className="flex gap-2 items-center text-white font-extrabold pb-1.5 border-b border-indigo-500/10">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <span>{sub.name} Best Study Strategy</span>
                              </div>
                              <p className="text-[11px] text-amber-300 font-extrabold mt-2 uppercase">Method: {method}</p>
                              <p className="text-[10px] text-slate-300 mt-1">{why}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERLAP GUARD TIMETABLE */}
              {activeReportTab === "timetable_schedule" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-3 bg-[#0f111a] p-4 rounded-2xl border border-indigo-500/10">
                    <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                        🕒 Conflict-Free Dynamic Scheduling Active
                        <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase">100% Lockout Overlaps</span>
                      </h4>
                      <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                        Your timetable is mathematically resolved: zero overlaps between sleep (<span className="text-indigo-300">{minutesToTime12(wakeMins)}</span> onwards), meals (breakfast, lunch, dinner ranges), and daily spiritual prayers (Fajr, Dhuhr, Asr, Maghrib, Isha ranges). Corrected study sessions are automatically spaced with short breaks.
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Dashboard Panel for study blocks */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-indigo-950/25 border border-indigo-500/15 rounded-xl flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Total Daily Study</span>
                        <span className="text-sm font-black text-slate-100 font-mono">
                          {((timetableBlocks.filter(b => b.type === "study").reduce((acc, b) => acc + (b.endMins - b.startMins), 0)) / 60).toFixed(1)} Hours
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-950/25 border border-purple-500/15 rounded-xl flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Prayer Allocations</span>
                        <span className="text-sm font-black text-slate-100 font-mono">
                          {timetableBlocks.filter(b => b.type === "prayer").length} Slots Protected
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-950/25 border border-emerald-500/15 rounded-xl flex items-center gap-2.5">
                      <Coffee className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Scheduled Breaks</span>
                        <span className="text-sm font-black text-slate-100 font-mono">
                          {timetableBlocks.filter(b => b.type === "break").length} Fatigue Breaks
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-950/25 border border-orange-500/15 rounded-xl flex items-center gap-2.5">
                      <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Avg Subject Priority</span>
                        <span className="text-sm font-black text-slate-100 font-mono">
                          {subjectsList.length > 0 ? Math.round(subjectsList.reduce((acc, s) => acc + calculateIntelligentPriorityScore(s), 0) / subjectsList.length) : 0} IQ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* Morning Bracket */}
                    <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-3 flex flex-col">
                      <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                        <span>🌅 Morning (6am - 12pm)</span>
                        <span className="text-[9px] font-mono text-slate-400 px-1 rounded bg-orange-500/10">{morningBlocks.length} items</span>
                      </h4>
                      <div className="space-y-2 flex-grow md:max-h-[580px] md:overflow-y-auto pr-1 no-scrollbar">
                        {morningBlocks.map((b) => renderBlockCard(b))}
                        {morningBlocks.length === 0 && (
                          <div className="p-3 text-center border border-dashed border-white/5 rounded-xl text-slate-500 text-[10px]">
                            No morning activities scheduled.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Afternoon Bracket */}
                    <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-3 flex flex-col">
                      <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                        <span>🍕 Afternoon (12pm - 5pm)</span>
                        <span className="text-[9px] font-mono text-slate-400 px-1 rounded bg-cyan-500/10">{afternoonBlocks.length} items</span>
                      </h4>
                      <div className="space-y-2 flex-grow md:max-h-[580px] md:overflow-y-auto pr-1 no-scrollbar">
                        {afternoonBlocks.map((b) => renderBlockCard(b))}
                        {afternoonBlocks.length === 0 && (
                          <div className="p-3 text-center border border-dashed border-white/5 rounded-xl text-slate-500 text-[10px]">
                            No afternoon activities scheduled.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Evening Bracket */}
                    <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-3 flex flex-col">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                        <span>🍱 Evening (5pm - 8pm)</span>
                        <span className="text-[9px] font-mono text-slate-400 px-1 rounded bg-indigo-500/10">{eveningBlocks.length} items</span>
                      </h4>
                      <div className="space-y-2 flex-grow md:max-h-[580px] md:overflow-y-auto pr-1 no-scrollbar">
                        {eveningBlocks.map((b) => renderBlockCard(b))}
                        {eveningBlocks.length === 0 && (
                          <div className="p-3 text-center border border-dashed border-white/5 rounded-xl text-slate-500 text-[10px]">
                            No evening activities scheduled.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Night Bracket */}
                    <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-3 flex flex-col">
                      <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                        <span>🌙 Night (8pm onwards)</span>
                        <span className="text-[9px] font-mono text-slate-400 px-1 rounded bg-purple-500/10">{nightBlocks.length} items</span>
                      </h4>
                      <div className="space-y-2 flex-grow md:max-h-[580px] md:overflow-y-auto pr-1 no-scrollbar">
                        {nightBlocks.map((b) => renderBlockCard(b))}
                        {nightBlocks.length === 0 && (
                          <div className="p-3 text-center border border-dashed border-white/5 rounded-xl text-slate-500 text-[10px]">
                            No nightly activities scheduled.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: DYNAMIC CHAPTER TRACKER */}
              {activeReportTab === "chapters_tracker" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">📖 Interactive Chapters Progress Engine</h3>
                    <p className="text-[10px] text-slate-400">
                      Toggling chapters completes active milestones. Completed chapters increase confidence levels, elevate profile levels, and unlock premium coins!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjectsList.map((sub, sIdx) => {
                      const completedCount = sub.completedChapters || 0;
                      const hasLinked = sub.pdfLinked;
                      return (
                        <div key={sIdx} className="bg-slate-950/40 border border-white/10 p-5 rounded-2xl relative space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-black text-white">{sub.name}</h4>
                              <span className="text-[10px] text-slate-400 block mt-0.5 uppercase">Chapters Remaining: <span className="text-indigo-400 font-extrabold">{sub.totalChapters - completedCount}</span></span>
                            </div>
                            <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-300 font-black">
                              {getSubjectCompletionPct(sub)}% Done
                            </span>
                          </div>

                          {/* Linear visual loading progress ring */}
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${getSubjectCompletionPct(sub)}%` }}
                            ></div>
                          </div>

                          <div className="flex gap-2 items-center justify-between text-xs pt-2">
                            <span className="text-[10px] text-slate-500 font-medium">Chapters: {completedCount}/{sub.totalChapters}</span>
                            
                            <button
                              onClick={() => handleManualChapterComplete(sIdx)}
                              disabled={completedCount >= sub.totalChapters}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-black uppercase tracking-wider transition-all rounded-lg disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Log Chapter Done</span>
                            </button>
                          </div>

                          {hasLinked && (
                            <div className="mt-1 bg-indigo-950/20 px-3 py-2 border border-indigo-500/15 rounded-xl flex items-center gap-2 text-[10px] text-indigo-300 font-extrabold animate-fadeIn">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span>Linked PDF: {hasLinked}</span>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: ACTIVE NOTIFICATIONS HUB */}
              {activeReportTab === "notification_triggers" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">🔔 Active Smart Notifications Dispatcher</h3>
                    <p className="text-[10px] text-slate-400">
                      Schedules local alerts right into the browser session loop. Alerts act as personal mentors, prompting studies or protecting prayer and meals.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                    
                    <div className="bg-slate-950/40 p-5 border border-white/10 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-300 uppercase">Configuration</span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                          ● Running Online
                        </span>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => {
                            if ("Notification" in window) {
                              Notification.requestPermission().then(perm => {
                                showToast(`Notification status requested: ${perm.toUpperCase()}`);
                              });
                            } else {
                              showToast("⚠️ Browser notification is not supported in this sandbox.");
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <BellRing className="w-4 h-4" />
                          <span>Request Browser Permission</span>
                        </button>

                        {/* Simulate Alert Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const sampleAlerts = [
                              "🎯 Wake-up schedule lock: Rise & shine Scholar! Tackle Math first.",
                              "📿 spiritual Prayer boundary is active. Pause studying for Maghrib.",
                              "🍕 Meal hours block: Dinner is served! Protect cognitive downtime.",
                              "📚 High Focus Hour initiated! Let's cover Physics critical chapters."
                            ];
                            const randomAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
                            
                            // Send real notification
                            if (onTriggerNotification) {
                              onTriggerNotification("StudyForge Coach Alert", randomAlert);
                            } else if ("Notification" in window && Notification.permission === "granted") {
                              try {
                                new Notification("StudyForge Coach Alert", { body: randomAlert });
                              } catch (e) {}
                            }
                            
                            // Add to local panel
                            setLocalNotifications(prev => [
                              { id: String(Date.now()), msg: randomAlert, time: new Date().toLocaleTimeString(), type: "Coach Monitor" },
                              ...prev
                            ]);

                            showToast("🔔 Simulated push notification sent!");
                          }}
                          className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Test Push Dispatch</span>
                        </button>
                      </div>
                    </div>

                    {/* Alert timeline logs */}
                    <div className="bg-slate-950/40 p-5 border border-white/10 rounded-2xl space-y-3">
                      <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">Real-time Push Notifications Log</h4>
                      
                      {localNotifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No alerts dispatched during this session yet. Click "Test Push" to simulate coach triggers.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[180px] overflow-y-auto">
                          {localNotifications.map((al) => (
                            <div key={al.id} className="p-2.5 bg-indigo-950/10 border border-indigo-500/10 rounded-xl text-[11px] text-slate-300 space-y-1">
                              <div className="flex justify-between font-bold text-[9px] text-[#93c5fd]">
                                <span>TYPE: {al.type}</span>
                                <span>{al.time}</span>
                              </div>
                              <p>{al.msg}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 5: GAMIFICATION & FREE TIME REWARD RECHARGE (Step 9) */}
              {activeReportTab === "gamification_rewards" && (
                <div className="space-y-6 animate-fadeIn font-sans">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">🎮 Gamification & Spaced Reward Claiming Center</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      Complete study sessions or log completed chapters to gain valuable XP and coins. Redeem XP below to secure locked Free Time slots.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* XP Progress Ring display */}
                    <div className="bg-slate-950/50 p-5 border border-white/10 rounded-3xl space-y-4 flex flex-col justify-between">
                      <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-black block">Preserve Prestige Level</span>
                          <span className="text-sm font-black text-white">Level: {Math.floor(xp / 500) + 1} ({xp % 500} / 500 XP)</span>
                        </div>
                        <Award className="w-6 h-6 text-indigo-400 animate-bounce" />
                      </div>

                      {/* Progression bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all" style={{ width: `${(xp % 500) / 5}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold shrink-0">
                          <span>Progress to Next Rank</span>
                          <span>{500 - (xp % 500)} XP needed</span>
                        </div>
                      </div>

                      {/* Daily Streak Indicator */}
                      <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                          <span className="text-xs font-black text-slate-200 uppercase">Study Streak</span>
                        </div>
                        <span className="text-lg font-black text-orange-400 font-mono">{streak} DAYS SECURED</span>
                      </div>
                    </div>

                    {/* Reward Activator Panel */}
                    <div className="bg-slate-950/40 p-5 border border-white/10 rounded-2xl space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-1">Cognitive Reward Selector</h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Calculated safe recharge quotas: costs <span className="text-indigo-400 font-extrabold">30 XP</span> per claimed block. Limits excessive dopamine burnout!
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "Gaming", name: "Gaming Block", duration: 15, tag: "🎮 Fast win" },
                          { id: "Movie", name: "Streaming / Net", duration: 25, tag: "🍿 Episode claim" },
                          { id: "Social Media", name: "Social network", duration: 10, tag: "📱 Focus scroll" },
                          { id: "Sleeping", name: "Power Nap Rest", duration: 20, tag: "💤 Mind refresh" },
                          { id: "Walking", name: "Cardio stroll", duration: 12, tag: "🚶‍♂️ Blood flow" }
                        ].map((reward) => (
                          <div key={reward.id} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all flex flex-col justify-between">
                            <div>
                              <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-wide block">{reward.tag}</span>
                              <h5 className="text-xs font-black text-white mt-0.5">{reward.name}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{reward.duration} mins Free</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleClaimReward(reward.name, reward.duration)}
                              className="mt-2 text-center w-full bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase rounded-lg py-1 transition-all cursor-pointer"
                            >
                              Redeem Block
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 6: AI STUDY COACH STRATEGIC ADVISOR */}
              {activeReportTab === "coach_mentoring" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">🧠 AI Study Coach & Personal Cognitive Mentor</h3>
                    <p className="text-[10px] text-slate-400">
                      Continuously evaluates course timelines, remaining chapters, difficulty configurations, and predicted exam readiness levels.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Insights Block 1: Readiness */}
                    <div className="bg-[#0b0c10]/40 border border-[#22c55e]/20 p-5 rounded-2xl relative space-y-3">
                      <div className="text-xs bg-[#22c55e]/10 text-emerald-400 border border-[#22c55e]/20 px-2 py-0.5 rounded-full font-bold inline-block uppercase">
                        Syllabus Integrity Safe
                      </div>
                      <h4 className="text-sm font-black text-white font-display">Predicted Exam Readiness</h4>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Your completion trajectory indicates a predicted exam score range of <span className="text-[#22c55e] font-extrabold">82% - 88%</span> if study consistency is secured. Keep revision timers active!
                      </p>
                    </div>

                    {/* Insights Block 1: Fatigue Monitor */}
                    <div className="bg-[#0b0c10]/40 border border-purple-500/20 p-5 rounded-2xl relative space-y-3">
                      <div className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold inline-block uppercase">
                        Overload Shield Active
                      </div>
                      <h4 className="text-sm font-black text-white font-display">Fatigue & Cognitive Capacity</h4>
                      <p className="text-slate-300 text-xs">
                        Routine boundaries completed: meal rest hours prevent burn-out. Sleep hours guarantee high synapse repair indexes nightly.
                      </p>
                    </div>

                    {/* Insights Block 3: Crisis Check */}
                    <div className="bg-[#0b0c10]/40 border border-[#ef4444]/20 p-5 rounded-2xl relative space-y-3">
                      <div className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold inline-block uppercase">
                        Critical Risk Checkpoints
                      </div>
                      <h4 className="text-sm font-black text-rose-300 font-display">Active Weak Area warnings</h4>
                      <p className="text-slate-300 text-xs">
                        {subjectsList.some(s => s.difficultyLevel === "Hard") ? (
                          <span>
                            Critical Warning: Hard subject blocks found. Prioritize active recall flashcards before breakfast sessions daily!
                          </span>
                        ) : (
                          <span>Excellent! All registered subject slots are currently sitting in safe confidence boundaries.</span>
                        )}
                      </p>
                    </div>

                  </div>

                  {/* AI Recommendations Gallery */}
                  <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-5 space-y-3 font-sans">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-1">AI Coach Diagnostic Checklist</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                      {activePlan.assessmentResult?.aiRecommendations?.map((rec: string, idx: number) => (
                        <div key={idx} className="flex gap-2.5 bg-indigo-950/10 p-4 border border-indigo-500/15 rounded-xl">
                          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 select-none mt-0.5" />
                          <p className="text-slate-300 font-semibold">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      )}

    </div>
  );
}
