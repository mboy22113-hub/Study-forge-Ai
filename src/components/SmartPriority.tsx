import React, { useState } from 'react';
import { AlertTriangle, Sparkles, BookOpen, Clock, Activity, ChevronRight, Zap, Target } from 'lucide-react';
import { AcademicSubject } from '../types';

interface SmartPriorityProps {
  subjects: AcademicSubject[];
  onAddSubject: (subject: Partial<AcademicSubject>) => void;
  awardXp: (amount: number) => void;
  showToast: (msg: string) => void;
}

export default function SmartPriority({
  subjects,
  onAddSubject,
  awardXp,
  showToast
}: SmartPriorityProps) {
  // New Subject form states
  const [subjectTitle, setSubjectTitle] = useState("");
  const [importances, setImportances] = useState<Record<string, number>>({}); // subjectId -> importance (1-5)
  const [weaknesses, setWeaknesses] = useState<Record<string, number>>({});   // subjectId -> weakness (1-5)
  const [weightages, setWeightages] = useState<Record<string, number>>({});   // subjectId -> weightage (1-5)
  
  // Custom formula variables
  const [customExamDate, setCustomExamDate] = useState("2026-06-20");
  const [newSubDifficulty, setNewSubDifficulty] = useState<'Hard' | 'Medium' | 'Easy'>('Medium');
  const [newSubLessons, setNewSubLessons] = useState(12);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTitle.trim()) {
      showToast("⚠️ Specify a valid academic subject name.");
      return;
    }

    const syllabusCompletion = Math.floor(Math.random() * 40) + 10; // random 10-50% to start
    onAddSubject({
      title: subjectTitle.trim(),
      level: 'Undergraduate',
      difficulty: newSubDifficulty,
      chapters: ["Section 1: Axioms", "Section 2: Practical Derivations", "Section 3: Mock Papers"],
      remainingLessons: newSubLessons,
      importantTopics: ["Wavefunction Norms", "Hermitian Proofs", "UV Probability Models"],
      previousMarks: 72,
      confidenceLevel: newSubDifficulty === 'Hard' ? 30 : newSubDifficulty === 'Medium' ? 60 : 85,
      dailyStudyHours: newSubDifficulty === 'Hard' ? 5 : newSubDifficulty === 'Medium' ? 3 : 1.5,
      examDate: customExamDate,
      syllabusCompletionPercent: syllabusCompletion
    });

    setSubjectTitle("");
    awardXp(80);
    showToast(`📚 Subject "${subjectTitle.trim()}" integrated into Subject Intelligence! +80 XP`);
  };

  // 1. PHASE 5 Formula calculations
  const calculateTopicScore = (subj: AcademicSubject) => {
    const imp = importances[subj.id] || 3;
    const weak = weaknesses[subj.id] || 3;
    const weight = weightages[subj.id] || 3;
    
    let diffScore = 1;
    if (subj.difficulty === 'Hard') diffScore = 5;
    else if (subj.difficulty === 'Medium') diffScore = 3;

    return diffScore + imp + weak + weight;
  };

  const getPriorityClassification = (score: number) => {
    if (score >= 14) return { label: "High Priority", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (score >= 9) return { label: "Medium Priority", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "Low Priority", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  // 2. PHASE 4 Exam Crisis Calculations
  const calculateRiskScore = () => {
    if (subjects.length === 0) return { score: 0, level: '🟢 Safe', desc: "No core exams loaded yet. Build your subjects list!" };
    
    let totalRiskPoints = 0;
    let maxPossiblePoints = subjects.length * 10;

    subjects.forEach((subj) => {
      // 1. Exam dates near
      if (subj.examDate) {
        const daysLeft = Math.ceil((new Date(subj.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 15) totalRiskPoints += 4;
        else if (daysLeft < 30) totalRiskPoints += 2;
      }
      
      // 2. Large syllabus pending
      if (subj.syllabusCompletionPercent < 45) {
        totalRiskPoints += 3;
      }

      // 3. Hard subjects
      if (subj.difficulty === 'Hard') {
        totalRiskPoints += 3;
      }
    });

    const riskPercent = maxPossiblePoints > 0 ? (totalRiskPoints / maxPossiblePoints) * 100 : 0;
    
    if (riskPercent >= 60) return { score: Math.round(riskPercent), level: '🔴 High Risk', desc: "Massive upcoming targets with light completions. Trigger Survival Strategy!" };
    if (riskPercent >= 35) return { score: Math.round(riskPercent), level: '🟡 Moderate', desc: "Approaching landmarks require steady daily study allocation." };
    return { score: Math.round(riskPercent), level: '🟢 Safe', desc: "Milestones are successfully managed. Maintain steady focus beats!" };
  };

  const crisis = calculateRiskScore();

  return (
    <div className="space-y-8">
      {/* Risk indicators banner */}
      <div className="bg-[#09090B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold text-rose-400 mb-1">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>EXAM CRISIS PANEL</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Crisis Management & Priorities</h3>
          <p className="text-slate-400 text-sm">
            Dynamically tracks remaining days to exams, difficulty parameters, syllabus completion weightages, and weak chapters.
          </p>
          <div className="pt-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border ${
              crisis.level.includes('High') ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              crisis.level.includes('Moderate') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              Status: {crisis.level} (Score: {crisis.score}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 italic mt-3">{crisis.desc}</p>
        </div>

        {/* Dynamic score ring */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
              <circle cx="48" cy="48" r="40" 
                stroke={crisis.level.includes('High') ? '#F43F5E' : crisis.level.includes('Moderate') ? '#F59E0B' : '#10B981'} 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * crisis.score) / 100}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-black text-white">{crisis.score}%</span>
          </div>
          <span className="text-[10px] uppercase text-slate-500 font-extrabold tracking-widest mt-1">Crisis Risk Index</span>
        </div>
      </div>

      {/* AI Action Items Banner on High Risk */}
      {crisis.score > 25 && (
        <div className="p-5 bg-gradient-to-r from-rose-950/20 to-amber-950/20 border border-rose-500/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">AI SURVIVAL STRATEGY ACTIVATED</h4>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li><strong>Syllabus Reduction:</strong> Cut secondary derivations. Prioritize top weighted chapters in revision sessions.</li>
            <li><strong>Study Reallocations:</strong> Automated priority calculations shifted {crisis.level.includes('High') ? '5' : '3'} extra focus sessions to High score topics.</li>
            <li><strong>Active Recall Boost:</strong> Spaced repetition decks for weakest chapters are auto-rescheduled to twice-daily recall intervals.</li>
          </ul>
        </div>
      )}

      {/* Grid containing create subject and weightage scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation of academic subject model */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl h-fit space-y-4">
          <h4 className="text-sm font-bold text-slate-200">Catalog Academic Syllabus</h4>
          
          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Subject Title</label>
              <input
                type="text"
                placeholder="e.g. Statistical Thermodynamics"
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Difficulty</label>
                <select
                  value={newSubDifficulty}
                  onChange={(e) => setNewSubDifficulty(e.target.value as any)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-2 py-2.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Hard">🔴 Hard</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Easy">🟢 Easy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Lessons</label>
                <input
                  type="number"
                  min={1}
                  value={newSubLessons}
                  onChange={(e) => setNewSubLessons(parseInt(e.target.value, 10))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2.5 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Exam Date Target</label>
              <input 
                type="date"
                value={customExamDate}
                onChange={(e) => setCustomExamDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-xl shadow-rose-600/10"
            >
              Add Subject Nodes
            </button>
          </form>
        </div>

        {/* Smart priority list engine with sliders */}
        <div className="lg:col-span-2 bg-[#09090B]/40 p-5 rounded-2xl border border-white/5 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Syllabus Multi-Criteria Weighting Calculations</span>
          </h4>

          {subjects.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Add subjects to model priority multipliers.</p>
          ) : (
            <div className="space-y-4">
              {subjects.map((subj) => {
                const topicScore = calculateTopicScore(subj);
                const priority = getPriorityClassification(topicScore);
                
                // Adjust parameters on the fly
                const currentImp = importances[subj.id] || 3;
                const currentWeak = weaknesses[subj.id] || 3;
                const currentWeight = weightages[subj.id] || 3;

                return (
                  <div key={subj.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-black text-white">{subj.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded border ${
                            subj.difficulty === 'Hard' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' :
                            subj.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                            'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                          }`}>
                            Difficulty: {subj.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-400">Chapters remaining: <strong>{subj.remainingLessons}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${priority.color}`}>
                          {priority.label} ({topicScore})
                        </span>
                      </div>
                    </div>

                    {/* Matrix Slider adjusters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-widest">
                          <span>Importance</span>
                          <span className="text-white font-bold">{currentImp}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={currentImp}
                          onChange={(e) => setImportances(prev => ({ ...prev, [subj.id]: parseInt(e.target.value, 10) }))}
                          className="w-full accent-amber-400 h-1 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-widest">
                          <span>Weakness</span>
                          <span className="text-white font-bold">{currentWeak}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={currentWeak}
                          onChange={(e) => setWeaknesses(prev => ({ ...prev, [subj.id]: parseInt(e.target.value, 10) }))}
                          className="w-full accent-rose-400 h-1 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-widest">
                          <span>Weightage</span>
                          <span className="text-white font-bold">{currentWeight}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={currentWeight}
                          onChange={(e) => setWeightages(prev => ({ ...prev, [subj.id]: parseInt(e.target.value, 10) }))}
                          className="w-full accent-blue-400 h-1 rounded"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
