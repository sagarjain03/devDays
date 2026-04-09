// src/lib/dateUtils.ts
import { DayCell } from "@/app/types";

/**
 * Returns the number of days in a given month.
 * Month is 0-indexed (0 = January).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the weekday index of the 1st of the month.
 * Adjusted so Monday = 0, Sunday = 6 (ISO week standard).
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
  return (day + 6) % 7; // Shift: Mon = 0, Sun = 6
}

/**
 * Checks if two dates fall on the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Checks if a date falls within a range (inclusive).
 */
export function isInRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

/**
 * Formats a Date to "YYYY-MM-DD" string.
 * Used as a stable key for localStorage and status maps.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses a "YYYY-MM-DD" string back to a Date object.
 * Uses UTC noon to avoid timezone-shift bugs.
 */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Returns a new Date shifted by the given number of months.
 * Clamps to the last valid day if the target month is shorter.
 * e.g., Jan 31 + 1 month → Feb 28 (not March 3)
 */
export function shiftMonth(date: Date, delta: number): Date {
  const result = new Date(date);
  result.setDate(1); // Clamp first to avoid month-overflow
  result.setMonth(result.getMonth() + delta);
  return result;
}

/**
 * Core function: generates the full calendar grid for a given month.
 * Always returns a flat array of DayCell objects — 35 or 42 cells.
 *
 * Includes trailing days from prev month and leading days from next month
 * so the grid always starts on Monday and ends on Sunday.
 */
export function generateCalendarDays(year: number, month: number): DayCell[] {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month); // 0=Mon, 6=Sun

  const days: DayCell[] = [];

  // --- Previous month's trailing days ---
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDayOffset - 1; i >= 0; i--) {
    const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      dayOfMonth: date.getDate(),
    });
  }

  // --- Current month's days ---
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      dayOfMonth: d,
    });
  }

  // --- Next month's leading days ---
  const remaining = 42 - days.length; // Always fill to 42 (6 rows × 7 cols)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let d = 1; d <= remaining; d++) {
    const date = new Date(nextYear, nextMonth, d);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      dayOfMonth: d,
    });
  }

  return days;
}