// src/components/calendar/CalendarContainer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeroSection } from "@/app/components/hero/HeroSection";
import { MonthNavigator } from "./MonthNavigator";
import { CalendarGrid } from "./CalendarGrid";
import { NotesPanel } from "@/app/components/notes/NotesPanel";
import { useCalendar } from "@/app/hooks/useCalendar";
import { useDateRange } from "@/app/hooks/useDateRange";
import { DayStatus, AnimationDirection } from "@/app/types";
import { toDateKey } from "@/app/lib/dateUtils";
import { STORAGE_KEY } from "@/app/constants";

// Page-flip animation variants
// direction: "left" = going forward (next month)
//            "right" = going backward (prev month)
const pageVariants = {
  enter: (direction: AnimationDirection) => ({
    rotateX: direction === "left" ? -90 : 90,
    opacity: 0,
    y: direction === "left" ? -20 : 20,
    originY: 0, // pivot from top
  }),
  center: {
    rotateX: 0,
    opacity: 1,
    y: 0,
    originY: 0,
  },
  exit: (direction: AnimationDirection) => ({
    rotateX: direction === "left" ? 90 : -90,
    opacity: 0,
    y: direction === "left" ? 20 : -20,
    originY: 0,
  }),
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  duration: 0.35,
};

export function CalendarContainer() {
  const { currentDate, days, goToPrevMonth, goToNextMonth, goToToday } =
    useCalendar();

  const { selectedRange, selectDate, clearRange } = useDateRange();

  // Track animation direction separately from navigation
  const [direction, setDirection] = useState<AnimationDirection>("left");

  // Day productivity statuses — keyed by "YYYY-MM-DD"
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({});
  const isInitialMount = useRef(true);

  // Load day statuses from localStorage on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.dayStatuses) {
          setDayStatuses(parsed.dayStatuses);
        }
      }
    } catch (e) {
      console.error("Failed to parse StoredData", e);
    }
  }, []);

  // Save day statuses to localStorage on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : { notes: [], dayStatuses: {} };
      parsed.dayStatuses = dayStatuses;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.error("Failed to save day statuses", e);
    }
  }, [dayStatuses]);

  // Wrap navigation to set direction before changing month
  const handlePrev = () => {
    setDirection("right");
    goToPrevMonth();
    clearRange(); // Clear selection on month change — avoids cross-month range confusion
  };

  const handleNext = () => {
    setDirection("left");
    goToNextMonth();
    clearRange();
  };

  const handleToday = () => {
    const now = new Date();
    const isFuture =
      currentDate > new Date(now.getFullYear(), now.getMonth(), 1);
    setDirection(isFuture ? "right" : "left");
    goToToday();
    clearRange();
  };

  // Cycle through statuses on right-click / long-press
  const handleDayStatus = (dateKey: string) => {
    setDayStatuses((prev) => {
      const current = prev[dateKey];
      const cycle: (DayStatus)[] = ["productive", "missed", "rest", null];
      const currentIndex = cycle.indexOf(current ?? null);
      const next = cycle[(currentIndex + 1) % cycle.length];

      if (next === null) {
        const updated = { ...prev };
        delete updated[dateKey];
        return updated;
      }

      return { ...prev, [dateKey]: next };
    });
  };

  // Use currentDate as the animation key — changes trigger AnimatePresence
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  return (
    <div className="h-screen bg-zinc-950 p-4 lg:p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8 h-full">

          {/* Left — Hero and Notes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6 h-full min-h-0"
          >
            <HeroSection currentDate={currentDate} dayStatuses={dayStatuses} />
            <NotesPanel selectedRange={selectedRange} currentDate={currentDate} />
          </motion.div>

          {/* Right — Calendar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-6 h-full min-h-0"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden relative">
              <MonthNavigator
                currentDate={currentDate}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
              />

              <div className="flex-1 relative min-h-0">
                <AnimatePresence>
                  <motion.div
                    key={monthKey}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={pageTransition}
                    style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
                    className="absolute inset-0"
                  >
                    <CalendarGrid
                      days={days}
                      selectedRange={selectedRange}
                      dayStatuses={dayStatuses}
                      onDayClick={selectDate}
                      onDayStatus={handleDayStatus}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Range info bar */}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Inline sub-component: shows selected range summary ---
interface RangeInfoBarProps {
  selectedRange: { start: Date; end: Date | null };
  onClear: () => void;
}

function RangeInfoBar({ selectedRange, onClear }: RangeInfoBarProps) {
  const { start, end } = selectedRange;

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const dayCount = end
    ? Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mt-4 flex items-center justify-between px-4 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl"
    >
      <div className="flex items-center gap-3 font-mono text-sm">
        <span className="text-violet-400">{fmt(start)}</span>
        {end && (
          <>
            <span className="text-zinc-600">→</span>
            <span className="text-violet-400">{fmt(end)}</span>
          </>
        )}
        <span className="text-zinc-500 text-xs">
          {dayCount} {dayCount === 1 ? "day" : "days"}
        </span>
      </div>

      <button
        onClick={onClear}
        className="text-zinc-500 hover:text-zinc-200 text-xs font-mono transition-colors"
      >
        ✕ clear
      </button>
    </motion.div>
  );
}