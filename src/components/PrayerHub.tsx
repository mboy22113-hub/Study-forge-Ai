import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, CheckCircle, Flame, Gift, Bell, Clock, Activity } from 'lucide-react';
import { PrayerDay } from '../types';

interface PrayerHubProps {
  prayerRecords: PrayerDay[];
  onTogglePrayer: (date: string, prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => void;
  onPauseStudyTimer: () => void;
  awardXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  showToast: (msg: string) => void;
}

export default function PrayerHub({
  prayerRecords,
  onTogglePrayer,
  onPauseStudyTimer,
  awardXp,
  addCoins,
  showToast
}: PrayerHubProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Current day's prayer state
  const currentRecord = prayerRecords.find((r) => r.date === selectedDate) || {
    date: selectedDate,
    prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  };

  // Calculations for Streaks & Completion
  const calculateStreak = () => {
    let currentStreak = 0;
    // Sort records descending
    const sorted = [...prayerRecords].sort((a, b) => b.date.localeCompare(a.date));
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sorted.length; i++) {
      const rec = sorted[i];
      const allDone = Object.values(rec.prayers).every(p => p);
      if (allDone) {
        currentStreak++;
      } else {
        // If it's today and not fully done yet, don't break streak immediately
        if (rec.date === today) continue;
        break;
      }
    }
    return currentStreak;
  };

  const getWeeklyPercentage = () => {
    if (prayerRecords.length === 0) return 0;
    let totalDone = 0;
    let totalPossible = prayerRecords.length * 5;
    
    prayerRecords.forEach((r) => {
      Object.values(r.prayers).forEach(p => { if (p) totalDone++; });
    });
    
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  };

  const handleToggle = (prayerName: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    const wasCompleted = currentRecord.prayers[prayerName];
    onTogglePrayer(selectedDate, prayerName);

    if (!wasCompleted) {
      // Award premium points
      awardXp(50);
      addCoins(10);
      showToast(`📿 Logged ${prayerName.toUpperCase()} prayer successfully! +50 XP, +10 Coins`);
      
      // Auto-pause study timer for prayer time
      onPauseStudyTimer();
    }
  };

  const getPrayerTimeDescription = (name: string) => {
    switch (name) {
      case 'fajr': return 'Dawn (Pre-Sunrise)';
      case 'dhuhr': return 'Midday / Noon';
      case 'asr': return 'Late Afternoon';
      case 'maghrib': return 'Sunset';
      case 'isha': return 'Night';
      default: return '';
    }
  };

  return (
    <div className="bg-[#09090B]/60 backdrop-blur-xl border border-white/5 p-6 rounded-3xl space-y-6 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 mb-2 font-mono">
            <Moon className="w-3.5 h-3.5 animate-pulse" />
            <span>Spiritual Center</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white font-display">Prayer & Focus Hub</h3>
          <p className="text-slate-400 text-sm">
            Maintain high-vibrational spirituality. Logging any prayer automatically pauses active study timers to respect prayer slots.
          </p>
        </div>

        {/* Streaks metrics widgets */}
        <div className="flex gap-3 font-mono">
          <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-2xl flex items-center gap-3">
            <Flame className="w-6 h-6 text-cyan-400 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prayer Streak</p>
              <p className="text-lg font-black text-white">{calculateStreak()} Days</p>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consistency</p>
              <p className="text-lg font-black text-white">{getWeeklyPercentage()}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date selector picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Select Target Date:</span>
        <input 
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white uppercase tracking-wider outline-none focus:border-cyan-500/50 font-mono"
        />
      </div>

      {/* Prayer checkboxes layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((pr) => {
          const isDone = currentRecord.prayers[pr];
          return (
            <button
              key={pr}
              onClick={() => handleToggle(pr)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden cursor-pointer ${
                isDone
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-cyan-500/20 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-black uppercase tracking-widest font-mono">{pr}</span>
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-cyan-500/40 transition-colors" />
                )}
              </div>
              <div>
                <p className={`text-[10px] transition-colors ${isDone ? 'text-cyan-400/70 font-semibold' : 'text-slate-500'}`}>
                  {getPrayerTimeDescription(pr)}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Premium quote and micro motivation lines */}
      <div className="p-4 bg-cyan-950/10 border border-cyan-500/10 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0 animate-pulse" />
        <p className="text-xs text-slate-300 italic leading-relaxed">
          "Indeed, prayer protects from immorality and wrongdoing, and remembrance of God is truly the greatest strength." Maintain your spiritual foundations while building intellectual strength.
        </p>
      </div>
    </div>
  );
}
