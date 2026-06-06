import React from 'react';
import { BarChart, Clock, Calendar, CheckSquare, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { AcademicSubject, FocusSession, PrayerDay } from '../types';

interface AnalyticsPanelProps {
  subjects: AcademicSubject[];
  focusSessions: FocusSession[];
  prayers: PrayerDay[];
}

export default function AnalyticsPanel({
  subjects,
  focusSessions,
  prayers
}: AnalyticsPanelProps) {
  
  // 1. Calculations for Subject distribution hours
  const getSubjectHours = () => {
    return subjects.map(s => {
      let baseHours = s.difficulty === 'Hard' ? 45 : s.difficulty === 'Medium' ? 24 : 8;
      // Add a small element representing tracked studies
      return {
        title: s.title,
        hours: baseHours,
        color: s.difficulty === 'Hard' ? 'bg-rose-500' : s.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
      };
    });
  };

  // 2. Focus score gauge calculations
  const calculateFocusScore = () => {
    if (focusSessions.length === 0) return 0;
    const totalMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    // focus score formula (scaled between 40 and 100 based on focus output)
    return Math.min(Math.round(40 + (totalMinutes / 10)), 100);
  };

  // 3. Weekly prayer consistency percentage
  const getPrayerPercentage = () => {
    if (prayers.length === 0) return 0;
    let logged = 0;
    prayers.forEach(p => {
      Object.values(p.prayers).forEach(v => { if (v) logged++; });
    });
    return Math.min(Math.round((logged / (prayers.length * 5)) * 100), 100);
  };

  const hoursDistribution = getSubjectHours();
  const focusScore = calculateFocusScore();
  const prayerCons = getPrayerPercentage();

  // Heatmap squares (simulating various active days of study history)
  const HEATMAP_SQUARES = [
    { level: 4, label: "Mon" }, { level: 2, label: "" }, { level: 0, label: "" }, { level: 3, label: "" }, { level: 1, label: "" }, { level: 0, label: "" }, { level: 2, label: "" },
    { level: 1, label: "Tue" }, { level: 3, label: "" }, { level: 4, label: "" }, { level: 0, label: "" }, { level: 2, label: "" }, { level: 1, label: "" }, { level: 0, label: "" },
    { level: 3, label: "Wed" }, { level: 0, label: "" }, { level: 2, label: "" }, { level: 1, label: "" }, { level: 4, label: "" }, { level: 3, label: "" }, { level: 2, label: "" },
    { level: 2, label: "Thu" }, { level: 4, label: "" }, { level: 1, label: "" }, { level: 0, label: "" }, { level: 3, label: "" }, { level: 0, label: "" }, { level: 1, label: "" },
    { level: 0, label: "Fri" }, { level: 2, label: "" }, { level: 3, label: "" }, { level: 4, label: "" }, { level: 1, label: "" }, { level: 2, label: "" }, { level: 3, label: "" },
    { level: 4, label: "Sat" }, { level: 1, label: "" }, { level: 0, label: "" }, { level: 2, label: "" }, { level: 3, label: "" }, { level: 4, label: "" }, { level: 1, label: "" },
    { level: 3, label: "Sun" }, { level: 0, label: "" }, { level: 2, label: "" }, { level: 1, label: "" }, { level: 4, label: "" }, { level: 0, label: "" }, { level: 2, label: "" }
  ];

  const getHeatmapColor = (lvl: number) => {
    switch (lvl) {
      case 4: return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]';
      case 3: return 'bg-cyan-500/75';
      case 2: return 'bg-indigo-600/50';
      case 1: return 'bg-indigo-950/40';
      default: return 'bg-slate-900/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold text-blue-400 mb-2">
            <BarChart className="w-3.5 h-3.5" />
            <span>Academic Telemetry</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Quantum Analytics Grid</h3>
          <p className="text-slate-400 text-sm">
            Review detailed subject distributions, concentration levels, spiritual metrics, and full study heatmaps here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric score Gauges */}
        <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Efficiency Metrics</h4>
          
          <div className="space-y-4 my-4">
            {/* Focus score */}
            <div className="space-y-1.5 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold block">Mental Focus Score</span>
                <span className="text-blue-400 font-black">{focusScore}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${focusScore}%` }}></div>
              </div>
            </div>

            {/* Spiritual core score */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold block">Spiritual Coordination</span>
                <span className="text-purple-400 font-black">{prayerCons}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${prayerCons}%` }}></div>
              </div>
            </div>

            {/* Syllabus completions ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold block">Syllabus Landed ratio</span>
                <span className="text-emerald-400 font-black">68%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `68%` }}></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500 italic">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Optimal study hours: 5:00 AM - 7:30 AM (Dawn blocks).</span>
          </div>
        </div>

        {/* Subject allocation hours distribution list */}
        <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Syllabus Allocations</h4>
          
          <div className="space-y-3 max-h-[180px] overflow-y-auto">
            {hoursDistribution.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-200">
                  <span className="truncate pr-2">{h.title}</span>
                  <span className="font-extrabold shrink-0 text-slate-400">{h.hours} hours</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`${h.color} h-full rounded-full`} style={{ width: `${Math.min(h.hours * 2, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak chapters and strong chapters comparative grids */}
        <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Chapter Intelligence</h4>
          
          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="bg-emerald-950/15 border border-emerald-500/10 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Strong Units</span>
              <ul className="text-[11px] text-slate-300 leading-normal space-y-1 list-disc list-inside">
                <li>Operator Dirac</li>
                <li>Hermitian Eigen</li>
                <li>Wavefunction norms</li>
              </ul>
            </div>

            <div className="bg-rose-950/15 border border-rose-500/10 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-rose-400 uppercase font-black tracking-widest">Weak Focus</span>
              <ul className="text-[11px] text-slate-300 leading-normal space-y-1 list-disc list-inside">
                <li>Photoelectric threshold</li>
                <li>Step Potentials</li>
                <li>Planck derivations</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Weekly progress trends: +22% revision output.</span>
          </div>
        </div>
      </div>

      {/* Heatmap block visualization */}
      <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Study Commits Heatmap Matrix</h4>
        
        {/* Grid map drawing */}
        <div className="flex flex-col space-y-2">
          <div className="grid grid-cols-7 gap-1.5 max-w-xl mx-auto md:mx-0">
            {HEATMAP_SQUARES.map((sq, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-md ${getHeatmapColor(sq.level)} flex items-center justify-center text-[10px] font-bold text-white relative group cursor-pointer border border-white/5`}
              >
                {sq.label && <span className="absolute -left-10 text-[9px] font-black uppercase text-slate-500 tracking-wider w-8 text-right">{sq.label}</span>}
                
                {/* Visual mouse hover details */}
                <div className="absolute bottom-8 scale-0 group-hover:scale-100 bg-[#020202] text-[9px] font-black text-white px-2 py-1 rounded-md border border-white/20 whitespace-nowrap transition-all z-10">
                  Logged Study Level {sq.level}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-black tracking-widest pt-2 justify-end max-w-xl">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-slate-900 border border-white/5"></div>
            <div className="w-3 h-3 rounded bg-indigo-950/40"></div>
            <div className="w-3 h-3 rounded bg-indigo-600/50"></div>
            <div className="w-3 h-3 rounded bg-cyan-500/75"></div>
            <div className="w-3 h-3 rounded bg-cyan-400"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
