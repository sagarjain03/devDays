// src/types/index.ts

// Represents a single day cell in the calendar grid
export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
}

// The selected date range (start and end can be null before selection)
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

// Status a developer can assign to a day
export type DayStatus = "productive" | "missed" | "rest" | null;

// Animation direction for the page flip
export type AnimationDirection = "left" | "right";

// A single note entry tied to a date range or month
export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO string for safe localStorage serialization
  rangeStart: string | null; // ISO date string
  rangeEnd: string | null;   // ISO date string
}

// The shape of all persisted data in localStorage
export interface StoredData {
  notes: Note[];
  dayStatuses: Record<string, DayStatus>; // key: "YYYY-MM-DD"
}

// Props shape for CalendarContainer's context (passed down to children)
export interface CalendarState {
  currentDate: Date;         // The month/year being viewed
  selectedRange: DateRange;
  dayStatuses: Record<string, DayStatus>;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  handleDayClick: (date: Date) => void;
  handleDayStatus: (dateKey: string, status: DayStatus) => void;
}