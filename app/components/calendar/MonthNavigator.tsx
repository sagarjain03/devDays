
"use client";

import { MONTHS } from "@/app/constants";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface MonthNavigatorProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function MonthNavigator({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: MonthNavigatorProps) {
  const month = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  
  const now = new Date();
  const isCurrentMonth = 
    currentDate.getMonth() === now.getMonth() && 
    currentDate.getFullYear() === now.getFullYear();

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Month/Year display */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 font-mono">
          {month} {year}
        </h2>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onToday}
          disabled={isCurrentMonth}
          className={`px-3 py-2 rounded-lg bg-zinc-800 transition-colors text-sm font-mono ${
            isCurrentMonth 
              ? "opacity-50 cursor-not-allowed text-zinc-600" 
              : "hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          }`}
          aria-label="Go to today"
        >
          <RotateCcw className="w-4 h-4 inline mr-1" />
          Today
        </button>

        <button
          onClick={onNext}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}