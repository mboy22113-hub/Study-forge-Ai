import React, { useState } from 'react';
import { Sun, Moon, Flame, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { WakeUpLog } from '../types';

interface WakeUpHubProps {
  wakeLogs: WakeUpLog[];
  onLogWakeUp: (date: string, wakeTime: string, sleepTime: string) => void;
  awardXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  showToast: (msg: string) => void;
}

export default function WakeUpHub({
  wakeLogs,
  onLogWakeUp,
  awardXp,
  addCoins,
  showToast
}: WakeUpHubProps) {
  const [wakeTimeInput, setWakeTimeInput] = useState("05:30");
  const [sleepTimeInput, setSleepTimeInput] = useState("22:30");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const existingLog = wakeLogs.find(l => l.date === selectedDate);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the wake up hour is considered "early rising" (defined as waking up at or before 6:00 AM)
    const [wakeHour, wakeMin] = wakeTimeInput.split(":").map(Number);
    const isEarly = wakeHour < 6 || (wakeHour === 6 && wakeMin === 0);

    onLogWakeUp(selectedDate, wakeTimeInput, sleepTimeInput);

    // Award rewards based on early rise status vs standard wake ups
    const xpReward = isEarly ? 100 : 40;
    const coinsReward = isEarly ? 20 : 5;

    awardXp(xpReward);
    addCoins(coinsReward);

    if (isEarly) {
      showToast(`🌅 Brilliant Early Rising! Logged early wake-up at ${wakeTimeInput}! +100 XP, +20 Coins`);
    } else {
      showToast(`☀️ Logged wake-up at ${wakeTimeInput}. Keep consistent! +40 XP, +5 Coins`);
    }
  };

  // Streaks calculations
  const calculateEarlyStreak = () => {
    let streak = 0;
    const sorted = [...wakeLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (const log of sorted) {
      if (log.isEarlyWakeUp) streak++;
      else break;
    }
    return streak;
  };

  const calculateWakeStreak = () => {
    return wakeLogs.length;
  };

  return (
    <div className="bg-[#09090B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-6 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400 mb-2">
            <Sun className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Circadian Rhythm</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Wake-Up & Sleep Hub</h3>
          <p className="text-slate-400 text-sm">
            Master your schedule. Maintain an early rising streak for elite cognitive throughput.
          </p>
        </div>

        {/* Circadian state statistics */}
        <div className="flex gap-3">
          <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
            <Sun className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Early Rising</p>
              <p className="text-lg font-black text-white">{calculateEarlyStreak()} Days</p>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Log Streak</p>
              <p className="text-lg font-black text-white">{calculateWakeStreak()} Days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form uploader */}
        <form onSubmit={handleLog} className="space-y-4 md:col-span-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h4 className="text-sm font-bold text-slate-200">Log Sleep Metrics</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Target Date</label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Sleep Time</label>
              <input 
                type="time"
                value={sleepTimeInput}
                onChange={(e) => setSleepTimeInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Wake Up Time</label>
              <input 
                type="time"
                value={wakeTimeInput}
                onChange={(e) => setWakeTimeInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 text-black hover:bg-amber-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2"
            >
              <Sun className="w-4 h-4" />
              <span>Log Sleep & Wake Cycles</span>
            </button>
          </div>
        </form>

        {/* Current status display card */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Day Record Matrix</span>
            <h4 className="text-sm font-bold text-slate-200 mt-1">{selectedDate}</h4>
            
            {existingLog ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Moon className="w-4 h-4 text-slate-500" />
                  <span>Slept: <strong>{existingLog.sleepTime}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>Woke up: <strong>{existingLog.wakeTime}</strong></span>
                </div>
                {existingLog.isEarlyWakeUp ? (
                  <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Conquered Focus Horizon</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-zinc-500/10 border border-zinc-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-400">
                    <span>Healthy Sleep Period</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-4 italic">No circadian records completed for this date yet. Input your hours above!</p>
            )}
          </div>

          <div className="mt-4 p-3 bg-amber-950/10 border border-amber-500/10 rounded-xl flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-slate-300 font-medium">
              "Wake up and conquer today's goals." Maintain momentum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
