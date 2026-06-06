import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, Terminal, ShieldAlert } from "lucide-react";

interface SplashAndLoadingProps {
  onComplete: () => void;
  key?: string;
}

export default function SplashAndLoading({ onComplete }: SplashAndLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("🧠 Initializing AI Coach...");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Loading animation sequence (approx 3 seconds total)
  useEffect(() => {
    const messages = [
      "🧠 Initializing AI Coach...",
      "📚 Loading Study Planner...",
      "📊 Preparing Analytics...",
      "🎯 Optimizing Learning Experience...",
      "🚀 Launching StudyForge..."
    ];

    let currentMessageIndex = 0;

    // Rotate Messages every 600ms (so all 5 show up in 3 seconds)
    const messageInterval = setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % messages.length;
      setLoadingMessage(messages[currentMessageIndex]);
    }, 600);

    // Ultra-smooth 60fps loaded progress
    const startTime = Date.now();
    const duration = 2800; // 2.8s of smooth active scale-up duration

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        
        // Wait briefly at 100% for smooth premium feel
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 16);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  // Floating background particles using lightweight GPU-accelerated HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Re-adjust on resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes structure
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      hue: number;
    }

    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height + height * 0.1, // Start spread or below
        size: Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1), // Drift upwards slowly
        speedX: Math.random() * 0.2 - 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 260 : 190 // Purple or Teal accent Hues
      });
    }

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Soft deep mesh gradients behind canvas
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width * 0.7
      );
      grad.addColorStop(0, "rgba(9, 9, 13, 0.95)");
      grad.addColorStop(0.5, "rgba(5, 5, 8, 0.98)");
      grad.addColorStop(1, "rgba(2, 2, 4, 1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw and drift particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around bottom if floated out of top frame
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20 || p.x > width + 20) {
          p.speedX *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${p.opacity})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = `hsla(${p.hue}, 85%, 65%, 0.4)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black font-sans select-none">
      {/* Canvas Particle Grid Background */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />

      {/* Radiant Glow Blurs Behind UI Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Central Glassmorphic Dashboard Card */}
      <div className="relative flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] w-[90%] max-w-sm text-center">
        
        {/* Glowing glass gloss shimmer shine running across */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent skew-x-12"
            animate={{ x: ["-50%", "50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* LOGO ANIMATION SEQUENCE */}
        <div className="relative mb-6">
          {/* AI Pulse breathing ring (Bonus Effect) */}
          <motion.div
            className="absolute -inset-4 rounded-full border border-purple-500/20 bg-purple-500/[0.02]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.9, 1.4, 0.9], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-8 rounded-full border border-cyan-500/10 bg-cyan-500/[0.01]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 1.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Core Brand Forge Logo Container */}
          <motion.div
            className="relative w-24 h-24 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black/90 border border-white/10 flex items-center justify-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
            animate={{ opacity: 1, scale: [0.3, 1.1, 1], rotate: 0 }}
            transition={{ 
              opacity: { duration: 0.8 },
              scale: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
              rotate: { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
            }}
          >
            {/* Gloss reflection glow sliding across Logo badge */}
            <motion.div
              className="absolute -inset-x-full h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent skew-x-12"
              animate={{ left: ["100%", "-100%"] }}
              transition={{ delay: 1.0, duration: 1.8, repeat: Infinity, repeatDelay: 1.5 }}
            />

            {/* Glowing animated SVG of StudyForge Logo with beautiful paths */}
            <svg 
              className="w-12 h-12 text-purple-400 drop-shadow-[0_0_12px_rgba(147,51,234,0.6)]" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              {/* Custom abstract anvil/flame forge linepath */}
              <motion.path 
                d="M12 2L2 7l10 5 10-5-10-5z"
                stroke="url(#logoGrad)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
              />
              <motion.path 
                d="M2 17l10 5 10-5"
                stroke="url(#logoGrad)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
              />
              <motion.path 
                d="M2 12l10 5 10-5"
                stroke="url(#logoGrad)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Text Title (slides upward) */}
        <div className="overflow-hidden mb-1 py-0.5">
          <motion.h1
            className="text-2xl font-black text-white tracking-widest uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            StudyForge AI
          </motion.h1>
        </div>

        {/* Subtitle ("Forge Your Future" fades in) */}
        <motion.p
          className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-[0.25em] mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          Forge Your Future
        </motion.p>

        {/* PROGRESS BAR & PERCENTAGE INDICATORS */}
        <div className="w-full space-y-2 mt-4">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1">
            <span className="text-[9px] uppercase tracking-wide">Synthesizing System</span>
            <span className="font-bold text-white transition-all bg-white/5 py-0.5 px-2 rounded-md">{progress}%</span>
          </div>

          {/* Smooth custom-built progress rail */}
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* ROTATING LOADING STATUS MESSAGE TEXT */}
        <div className="h-6 mt-4 flex items-center justify-center">
          <motion.span
            key={loadingMessage}
            className="text-xs font-semibold text-slate-400 tracking-wide block"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
          >
            {loadingMessage}
          </motion.span>
        </div>

        {/* Developer Credit Signature Tag */}
        <motion.div
          className="mt-10 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">By</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 font-display">NEXA Labs</span>
        </motion.div>

      </div>
    </div>
  );
}
