// src/components/hero/HeroSection.tsx
import { motion, AnimatePresence } from "framer-motion";
import { MONTHS } from "@/app/constants";
import { getQuoteForDate } from "@/app/lib/quotes";
import { DayStatus } from "@/app/types";
import { calculateStreak } from "@/app/lib/streakUtils";
import { Badge } from "@/app/components/ui/Badge";

interface HeroSectionProps {
  currentDate: Date;
  dayStatuses?: Record<string, DayStatus>;
}

export function HeroSection({ currentDate, dayStatuses = {} }: HeroSectionProps) {
  const month = MONTHS[currentDate.getMonth()];
  const year  = currentDate.getFullYear();
  const quote = getQuoteForDate(new Date());
  
  const { currentStreak, longestStreak } = calculateStreak(dayStatuses);

  const monthKey = `${year}-${currentDate.getMonth()}`;

  return (
    <div className="relative flex flex-col justify-between min-h-[220px] md:min-h-[260px] rounded-2xl flex-shrink-0 overflow-hidden bg-zinc-900 border border-zinc-800 p-6 md:p-8">

      {/* Geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-violet-900/20 blur-3xl" 
        />
      </div>

      {/* Month display with animation */}
      <div className="relative z-10">
        <p className="text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
          &gt; Current month
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-zinc-100 tracking-tight leading-none">
              {month}
            </h1>
            <p className="text-zinc-500 text-xl mt-1 font-mono">{year}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Terminal quote card */}
      <div className="relative z-10 my-6 lg:my-0">
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 font-mono">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="text-zinc-600 text-xs ml-2">devdays.sh</span>
          </div>
          <p className="text-zinc-500 text-xs mb-1">&gt; today&apos;s motivation</p>
          <p className="text-violet-300 text-sm leading-relaxed">
            &quot;{quote}&quot;
          </p>
        </div>
      </div>

      {/* Bottom date strip & Streak */}
      <div>
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-zinc-600 text-xs font-mono">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
            })}
          </span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="relative z-10 flex items-center justify-center font-mono">
          <AnimatePresence mode="popLayout">
            {currentStreak > 0 ? (
              <motion.div
                key="streak-badge"
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="mb-1">
                  <Badge label={`🔥 ${currentStreak} day streak`} color="violet" />
                </div>
                {longestStreak > currentStreak && (
                  <span className="text-zinc-600 text-[10px] uppercase tracking-widest mt-1">
                    Best: {longestStreak} days
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="no-streak"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-zinc-600 text-xs border border-zinc-800/50 rounded-lg px-3 py-1.5 bg-zinc-900/50"
              >
                &gt; start your streak today
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}