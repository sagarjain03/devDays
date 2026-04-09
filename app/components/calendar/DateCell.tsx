// src/components/calendar/DateCell.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DayCell, DateRange, DayStatus } from "@/app/types";
import { isSameDay, isInRange, toDateKey } from "@/app/lib/dateUtils";

interface DateCellProps {
  day: DayCell;
  selectedRange: DateRange;
  dayStatuses: Record<string, DayStatus>;
  onClick: (date: Date) => void;
  onStatusCycle: (dateKey: string) => void;
}

const STATUS_LABELS: Record<NonNullable<DayStatus>, string> = {
  productive: "✔ Productive",
  missed:     "✘ Missed",
  rest:       "◎ Rest day",
};

const STATUS_COLORS: Record<NonNullable<DayStatus>, string> = {
  productive: "bg-emerald-400",
  missed:     "bg-red-400",
  rest:       "bg-zinc-500",
};

export function DateCell({
  day,
  selectedRange,
  dayStatuses,
  onClick,
  onStatusCycle,
}: DateCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { date, isCurrentMonth, isToday, dayOfMonth } = day;
  const { start, end } = selectedRange;

  const isStart  = !!(start && isSameDay(date, start));
  const isEnd    = !!(end && isSameDay(date, end));
  const isSelected = isStart || isEnd;
  const isMiddle = !!(
    start && end &&
    isInRange(date, start, end) &&
    !isStart && !isEnd
  );

  const dateKey = toDateKey(date);
  const status  = dayStatuses[dateKey] ?? null;

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault(); // suppress browser context menu
    onStatusCycle(dateKey);
  };

  // --- Base classes ---
  const cellBase =
    "relative flex flex-col items-center justify-center w-full h-full text-sm font-mono transition-all duration-150 cursor-pointer select-none";

  const cellShape = isMiddle ? "rounded-none" : "rounded-xl";

  const cellColor = isSelected
    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40 scale-105 z-10"
    : isMiddle
    ? "bg-violet-500/15"
    : isToday
    ? "ring-2 ring-violet-500 ring-offset-1 ring-offset-zinc-900"
    : isCurrentMonth
    ? "hover:bg-zinc-800"
    : "opacity-40 hover:opacity-60 hover:bg-zinc-800/50";

  const textColor = isSelected
    ? "text-white"
    : isMiddle
    ? "text-violet-300"
    : isToday
    ? "text-violet-300"
    : isCurrentMonth
    ? "text-zinc-200"
    : "text-zinc-500";

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onClick(date)}
        onContextMenu={handleRightClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${cellBase} ${cellShape} ${cellColor} w-full`}
        aria-label={`${date.toDateString()}${status ? ` — ${STATUS_LABELS[status]}` : ""}`}
        aria-pressed={isSelected}
      >
        {/* Range background for middle cells */}
        {isMiddle && (
          <span className="absolute inset-0 bg-violet-500/15" />
        )}

        {/* Day number */}
        <span className={`relative z-10 font-semibold leading-none ${textColor}`}>
          {dayOfMonth}
        </span>

        {/* Status dot */}
        {status && (
          <span
            className={`relative z-10 mt-1 w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`}
          />
        )}

        {/* Today pulse ring */}
        {isToday && !isSelected && (
          <span className="absolute inset-0 rounded-xl ring-2 ring-violet-500/50 animate-pulse" />
        )}
      </motion.button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && isCurrentMonth && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none max-w-[200px]"
          >
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono shadow-xl whitespace-nowrap text-center">
              {status ? (
                <span className={
                  status === "productive" ? "text-emerald-400" :
                  status === "missed"     ? "text-red-400"     :
                                            "text-zinc-400"
                }>
                  {STATUS_LABELS[status]}
                </span>
              ) : (
                <span className="text-zinc-500">right-click to mark</span>
              )}
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}