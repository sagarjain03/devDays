// src/hooks/useCalendar.ts
import { useState, useMemo, useRef } from "react";
import { generateCalendarDays, shiftMonth } from "@/app/lib/dateUtils";
import { DayCell } from "@/app/types";

export type NavigationDirection = "prev" | "next" | null;

interface UseCalendarReturn {
  currentDate: Date;
  days: DayCell[];
  direction: NavigationDirection;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

export function useCalendar(): UseCalendarReturn {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [direction, setDirection] = useState<NavigationDirection>(null);

  const days = useMemo<DayCell[]>(
    () => generateCalendarDays(
      currentDate.getFullYear(),
      currentDate.getMonth()
    ),
    [currentDate]
  );

  const goToPrevMonth = () => {
    setDirection("prev");
    setCurrentDate((d) => shiftMonth(d, -1));
  };

  const goToNextMonth = () => {
    setDirection("next");
    setCurrentDate((d) => shiftMonth(d, +1));
  };

  const goToToday = () => {
    const now = new Date();
    // Determine direction relative to current view
    const target = new Date(now.getFullYear(), now.getMonth(), 1);
    setDirection(target > currentDate ? "next" : "prev");
    setCurrentDate(target);
  };

  return { currentDate, days, direction, goToPrevMonth, goToNextMonth, goToToday };
}