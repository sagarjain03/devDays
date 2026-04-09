// src/components/calendar/CalendarGrid.tsx
import { DateCell } from "./DateCell";
import { DAYS_OF_WEEK } from "@/app/constants";
import { DayCell, DateRange, DayStatus } from "@/app/types";

interface CalendarGridProps {
  days: DayCell[];
  selectedRange: DateRange;
  dayStatuses: Record<string, DayStatus>;
  onDayClick: (date: Date) => void;
  onDayStatus: (dateKey: string) => void;  // ← new
}

export function CalendarGrid({
  days,
  selectedRange,
  dayStatuses,
  onDayClick,
  onDayStatus,
}: CalendarGridProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 mb-2 flex-shrink-0">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center py-2 text-xs font-mono text-zinc-600 uppercase tracking-widest"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0">
        {days.map((day) => (
          <DateCell
            key={day.date.toISOString()}
            day={day}
            selectedRange={selectedRange}
            dayStatuses={dayStatuses}
            onClick={onDayClick}
            onStatusCycle={onDayStatus}   // ← new
          />
        ))}
      </div>
    </div>
  );
}