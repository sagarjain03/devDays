// src/lib/streakUtils.ts
import { DayStatus } from "@/app/types";
import { toDateKey, fromDateKey } from "./dateUtils";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export function calculateStreak(
  dayStatuses: Record<string, DayStatus>,
  today: Date = new Date()
): StreakData {
  let currentStreak = 0;
  let longestStreak = 0;

  const checkDate = new Date(today);
  const todayKey = toDateKey(checkDate);
  const todayStatus = dayStatuses[todayKey];

  // If today is completely unmarked, the user still has time to complete it.
  // We check from yesterday backwards so they don't lose their streak in the morning.
  // If today is actively marked as "missed", we'll process it and break immediately.
  if (!todayStatus) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // 1. Calculate Current Streak (walking backward)
  while (true) {
    const key = toDateKey(checkDate);
    const status = dayStatuses[key];

    if (status === "productive") {
      currentStreak++;
    } else if (status === "rest") {
      // Do nothing, preserved
    } else {
      // "missed" or completely unmarked
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  // 2. Calculate Longest Streak (walking forward from first recorded date)
  const keys = Object.keys(dayStatuses).sort();
  if (keys.length > 0) {
    const firstDate = fromDateKey(keys[0]);
    const endIterator = new Date(today);
    let tempStreak = 0;
    
    // Safety clamp (in case there is a rogue date from years ago)
    // we just iterate from first date to today
    let iterDate = new Date(firstDate);
    while (iterDate <= endIterator) {
      const key = toDateKey(iterDate);
      const status = dayStatuses[key];

      if (status === "productive") {
        tempStreak++;
      } else if (status === "rest") {
        // preserved
      } else {
        tempStreak = 0; // missed or unmarked breaks it
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      iterDate.setDate(iterDate.getDate() + 1);
    }
  }

  return { currentStreak, longestStreak: Math.max(currentStreak, longestStreak) };
}
