import React from 'react';
import { Trophy, Gift, Award, Check, Play, Lock, ShieldAlert, Sparkles, Flame, Coins } from 'lucide-react';
import { Quest, Achievement, UserProfile } from '../types';

interface DopamineCentralsProps {
  profile: UserProfile;
  quests: Quest[];
  achievements: Achievement[];
  onCompleteQuest: (questId: string) => void;
  onBuyItem: (itemId: string, cost: number) => void;
  onUnlockAchievement: (id: string) => void;
  awardXp: (amount: number) => void;
  showToast: (msg: string) => void;
}

export default function DopamineCentrals({
  profile,
  quests,
  achievements,
  onCompleteQuest,
  onBuyItem,
  onUnlockAchievement,
  awardXp,
  showToast
}: DopamineCentralsProps) {
  
  // Available shop assets
  const SHOP_ITEMS = [
    { id: "streak_shield", name: "Streak Protect Shield", desc: "Automated streak preservation, guards if you skip a day.", cost: 100, icon: ShieldAlert, countOwned: 1 },
    { id: "lofi_pad", name: "Ambient Lofi Pad Oscillator", desc: "Unlock deep warm triangles in your Focus Center.", cost: 150, icon: Play, countOwned: 0 },
    { id: "double_xp", name: "Double XP Elixir (1 hour)", desc: "Triggers 2x multipliers for focused session logs.", cost: 200, icon: Sparkles, countOwned: 0 }
  ];

  const handlePurchase = (itemId: string, cost: number) => {
    if (profile.coins < cost) {
      showToast("⚠️ Insufficient coins balance. Complete daily quests to earn more!");
      return;
    }
    onBuyItem(itemId, cost);
    showToast(`🎁 Successfully purchased "${itemId.toUpperCase()}" for ${cost} coins!`);
  };

  return (
    <div className="space-y-8">
      {/* Visual profile level indicator */}
      <div className="bg-[#09090B]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold text-yellow-400 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Scholar Prestige Status</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white">Prestige Rewards & Store</h3>
          <p className="text-slate-400 text-sm">
            Spend study coins logged from focus timers, prayer checklists, and quiz achievements to protect streaks!
          </p>
        </div>

        {/* Coins indicator */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-center gap-4.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-bounce">
            <Coins className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available Balance</span>
            <p className="text-2xl font-black text-yellow-400 leading-tight">{profile.coins} COINS</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quests Display Column */}
        <div className="space-y-4">
          <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest">Daily Quests</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">Resets daily</span>
            </div>

            <div className="space-y-2.5">
              {quests.map((q) => {
                const progressPercent = Math.min(Math.round((q.currentValue / q.targetValue) * 100), 100);
                return (
                  <div key={q.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-black text-slate-100">{q.title}</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">Reward: <span className="text-purple-400 font-bold">+{q.xpReward} XP</span>, <span className="text-yellow-400 font-bold">+{q.coinsReward} Coins</span></p>
                      </div>
                      {q.completed ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <button
                          onClick={() => onCompleteQuest(q.id)}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold uppercase text-white"
                        >
                          Complete
                        </button>
                      )}
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-500">
                        <span>Progress</span>
                        <span>{q.currentValue}/{q.targetValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shop display Column */}
        <div className="space-y-4">
          <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-1">Prestige Shop</h4>
            
            <div className="space-y-3">
              {SHOP_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-yellow-500 shrink-0 mt-0.5">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-black text-white">{item.name}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                      
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-[10px] text-yellow-400 font-extrabold flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          <span>{item.cost} Coins</span>
                        </span>
                        
                        <button
                          onClick={() => handlePurchase(item.id, item.cost)}
                          className="px-2.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Achievement panel Column */}
        <div className="space-y-4">
          <div className="bg-[#0C0C0E]/80 border border-white/5 p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-1">Badges Catalog</h4>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-3 relative overflow-hidden ${
                    ach.unlocked
                      ? 'bg-purple-500/5 border-purple-500/20'
                      : 'bg-white/[0.01] border-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-xl border shrink-0 ${
                    ach.unlocked
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 animate-pulse'
                      : 'bg-white/5 border-white/5 text-slate-600'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-xs font-black leading-tight ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-normal truncate">{ach.description}</p>
                    <span className="text-[8px] font-semibold text-purple-400 uppercase tracking-widest block mt-1">Reward: +{ach.xpReward} XP</span>
                  </div>
                  {!ach.unlocked && (
                    <button
                      onClick={() => onUnlockAchievement(ach.id)}
                      className="absolute right-2 top-2 p-1 text-[8px] font-extrabold uppercase text-slate-500 bg-white/5 rounded border border-white/5"
                    >
                      Grant
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
