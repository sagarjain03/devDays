// src/hooks/useDateRange.ts
import { useState, useCallback } from "react";
import { DateRange } from "@/app/types";
import { isSameDay } from "@/app//lib/dateUtils";

interface UseDateRangeReturn {
  selectedRange: DateRange;
  selectDate: (date: Date) => void;
  clearRange: () => void;
  isRangeComplete: boolean;
}

export function useDateRange(): UseDateRangeReturn {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  const selectDate = useCallback((date: Date) => {
    setSelectedRange((prev) => {
      const { start, end } = prev;

      // Case 1: Nothing selected → set start
      if (!start) {
        return { start: date, end: null };
      }

      // Case 2: Toggle off — clicked on existing start
      if (isSameDay(date, start)) {
        return { start: null, end: null };
      }

      // Case 3: End is already set → restart selection
      if (end) {
        return { start: date, end: null };
      }

      // Case 4: Clicked before start → swap, complete the range backwards
      if (date < start) {
        return { start: date, end: start };
      }

      // Case 5: Valid end date → complete the range
      return { start, end: date };
    });
  }, []);

  const clearRange = useCallback(() => {
    setSelectedRange({ start: null, end: null });
  }, []);

  const isRangeComplete = !!(selectedRange.start && selectedRange.end);

  return { selectedRange, selectDate, clearRange, isRangeComplete };
}