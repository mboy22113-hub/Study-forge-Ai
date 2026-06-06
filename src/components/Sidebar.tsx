import React, { useState } from 'react';
import { 
  Compass, BarChart2, BookOpen, Sparkles, Clock, TrendingUp, Trophy, Settings, 
  Menu, X, Book, FileText, Image as ImageIcon, PenTool, RefreshCw, Flame, 
  Moon, Sun, Target, BellRing, Cloud, ChevronLeft, ChevronRight, Lock, 
  Coins, HelpCircle, Activity
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  strictFocusMode: boolean;
  profile: UserProfile;
  streak: number;
  xp: number;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  strictFocusMode,
  profile,
  streak,
  xp
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // List of all 18 divisions in Sidebars
  const SECTIONS = [
    { id: "landing", label: "Dashboard", icon: Compass, category: 'Main' },
    { id: "coach", label: "AI Coach", icon: Sparkles, category: 'Main' },
    { id: "planner", label: "Study Planner", icon: BookOpen, category: 'Main' },
    { id: "subjects", label: "Subjects", icon: Book, category: 'Syllabus' },
    { id: "pdf_vault", label: "PDF Vault", icon: FileText, category: 'Syllabus' },
    { id: "topic_gallery", label: "Topic Gallery", icon: ImageIcon, category: 'Syllabus' },
    { id: "notes", label: "Notes Track", icon: PenTool, category: 'Syllabus' },
    { id: "focus", label: "Study Timer", icon: Clock, category: 'Focus', badge: 'Active' },
    { id: "revision", label: "Revision Center", icon: RefreshCw, category: 'Focus' },
    { id: "analytics", label: "Analytics", icon: TrendingUp, category: 'Stats' },
    { id: "streaks_display", label: "Streaks", icon: Flame, category: 'Stats' },
    { id: "achievements", label: "Achievements", icon: Trophy, category: 'Stats' },
    { id: "prayer", label: "Prayer Hub", icon: Moon, category: 'Wellness' },
    { id: "wakeup", label: "Wake-Up Hub", icon: Sun, category: 'Wellness' },
    { id: "goals", label: "Goals", icon: Target, category: 'Wellness' },
    { id: "notifications_tab", label: "Notifications", icon: BellRing, category: 'System' },
    { id: "backup", label: "Backup & Restore", icon: Cloud, category: 'System' },
    { id: "settings", label: "Settings", icon: Settings, category: 'System' }
  ];

  const handleTabClick = (tabId: string) => {
    if (strictFocusMode && tabId !== "focus" && tabId !== "settings") {
      alert("⚠️ Strict focus mode active. Unlock focus timer first!");
      return;
    }
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const getLevel = (totalXp: number) => {
    return Math.floor(totalXp / 500) + 1;
  };

  const progressPercent = Math.min((xp % 500) / 5, 100);

  return (
    <>
      {/* DESKTOP GLASSMORPHISM SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col h-screen shrink-0 border-r border-white/5 bg-[#09090b]/95 backdrop-blur-3xl transition-all duration-300 relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Collapse */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#121214] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo and title */}
        <div className={`p-6 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-[#0e0e11] border border-white/10 flex items-center justify-center shrink-0 shadow-lg group-hover:border-cyan-500/35 transition-all">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white uppercase leading-none font-display">
                StudyForge <span className="text-cyan-400 font-mono">AI</span>
              </span>
              <span className="text-[8px] font-bold text-zinc-500 tracking-widest mt-0.5">STUDIO PRESTIGE</span>
            </div>
          )}
        </div>

        {/* Level badge widget container */}
        {!collapsed && (
          <div className="mx-4 p-3.5 bg-zinc-950/40 rounded-2xl border border-white/5 space-y-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-[1.5px] shrink-0">
                <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center font-black text-[11px] text-white">
                  {getLevel(xp)}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Scholar Prestige</p>
                <p className="text-xs font-semibold text-slate-200 truncate">{profile.name || "Alex"}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                <span>LVL {getLevel(xp)}</span>
                <span>{xp % 500} / 500 XP</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Scrolly lists of link locations */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          {/* Group categories together */}
          {['Main', 'Syllabus', 'Focus', 'Stats', 'Wellness', 'System'].map((catName) => {
            const items = SECTIONS.filter(s => s.category === catName);
            return (
              <div key={catName} className="space-y-1">
                {!collapsed && (
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#64748b] block px-2 mb-1.5 font-mono">{catName}</span>
                )}
                {items.map((sec) => {
                  const SecIcon = sec.icon;
                  const isActive = currentTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleTabClick(sec.id)}
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                        isActive
                          ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                      }`}
                      title={sec.label}
                    >
                      <SecIcon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <span className="text-xs tracking-wide">{sec.label}</span>
                      )}
                      {!collapsed && sec.badge && (
                        <span className="ml-auto text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-md">
                          {sec.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION & TOP BAR */}
      <div className="md:hidden flex flex-col fixed inset-0 pointer-events-none z-40">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#060608]/90 backdrop-blur-xl px-4 flex items-center justify-between w-full pointer-events-auto">
          <div className="flex items-center gap-2">
            <X className="hidden" />
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">StudyForge AI</span>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </header>

        {/* Sliding Menu Overlay Drawer */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 top-16 bg-[#060608]/95 backdrop-blur-2xl p-6 pointer-events-auto overflow-y-auto space-y-6 flex flex-col">
            <div className="space-y-4">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-white/10 pb-2">Academic Divisions</p>
              
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map((sec) => {
                  const SecIcon = sec.icon;
                  const isActive = currentTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleTabClick(sec.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <SecIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs truncate">{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Fixed Bottom Quick Menu */}
        <nav className="mt-auto h-16 w-full border-t border-white/10 bg-[#060608]/90 backdrop-blur-xl px-6 flex items-center justify-between pointer-events-auto">
          {[
            { id: "landing", label: "Dashboard", icon: Compass },
            { id: "coach", label: "Coach", icon: Sparkles },
            { id: "focus", label: "Timer", icon: Clock },
            { id: "planner", label: "Planner", icon: BookOpen }
          ].map((quick) => {
            const QuickIcon = quick.icon;
            const isSel = currentTab === quick.id;
            return (
              <button
                key={quick.id}
                onClick={() => handleTabClick(quick.id)}
                className={`flex flex-col items-center justify-center py-1 flex-1 ${
                  isSel ? 'text-blue-400' : 'text-slate-500'
                }`}
              >
                <QuickIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] font-bold tracking-wide uppercase">{quick.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  );
}
