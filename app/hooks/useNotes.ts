// src/hooks/useNotes.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { Note, StoredData, DateRange } from "@/app/types";
import { STORAGE_KEY } from "@/app/constants";
import { toDateKey } from "@/app/lib/dateUtils";

interface UseNotesReturn {
  currentNote: string;
  setCurrentNote: (content: string) => void;
  allNotes: Note[];
  deleteNote: (id: string) => void;
  isSaving: boolean;
}

function getRangeKey(range: DateRange, currentDate: Date): string {
  if (range.start && range.end) {
    return `${toDateKey(range.start)}|${toDateKey(range.end)}`;
  } else if (range.start) {
    return `${toDateKey(range.start)}|${toDateKey(range.start)}`;
  }
  return `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
}

export function useNotes(selectedRange: DateRange, currentDate: Date): UseNotesReturn {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const currentKey = getRangeKey(selectedRange, currentDate);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes initially
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Partial<StoredData>;
        if (parsed.notes) {
          setAllNotes(parsed.notes);
        }
      }
    } catch (e) {
      console.error("Failed to parse notes from local storage", e);
    }
  }, []); // Only once on mount

  // Sync current note text when range changes
  useEffect(() => {
    const existingNote = allNotes.find(n => {
      if (selectedRange.start && selectedRange.end) {
        return n.rangeStart === toDateKey(selectedRange.start) && n.rangeEnd === toDateKey(selectedRange.end);
      } else if (selectedRange.start) {
        return n.rangeStart === toDateKey(selectedRange.start) && n.rangeEnd === toDateKey(selectedRange.start);
      } else {
        return n.rangeStart === null && n.rangeEnd === `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      }
    });
    setCurrentNote(existingNote ? existingNote.content : "");
  }, [selectedRange, currentDate, allNotes]);

  const saveNoteToStorage = useCallback((content: string, notes: Note[]) => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed: StoredData = data ? JSON.parse(data) : { notes: [], dayStatuses: {} };
      const updatedNotes = [...notes];
      
      const start = selectedRange.start ? toDateKey(selectedRange.start) : null;
      const end = selectedRange.end ? toDateKey(selectedRange.end) : 
                  (selectedRange.start ? toDateKey(selectedRange.start) : `${currentDate.getFullYear()}-${currentDate.getMonth()}`);

      const existingIndex = updatedNotes.findIndex(n => n.rangeStart === start && n.rangeEnd === end);
      
      if (!content.trim()) {
        if (existingIndex >= 0) updatedNotes.splice(existingIndex, 1);
      } else {
        if (existingIndex >= 0) {
          updatedNotes[existingIndex] = { ...updatedNotes[existingIndex], content, createdAt: new Date().toISOString() };
        } else {
          updatedNotes.push({
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            content,
            createdAt: new Date().toISOString(),
            rangeStart: start,
            rangeEnd: end,
          });
        }
      }

      parsed.notes = updatedNotes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setAllNotes(updatedNotes);
      setIsSaving(false);
    } catch (e) {
      console.error("Failed to save note", e);
      setIsSaving(false);
    }
  }, [selectedRange, currentDate]);

  // Handle Note Content Change with Debounce
  const handleSetCurrentNote = (content: string) => {
    setCurrentNote(content);
    setIsSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // We must pass the LATEST allNotes to saveNoteToStorage, or it gets stale.
    // However, saving it directly handles the merge.
    debounceRef.current = setTimeout(() => {
      setAllNotes(prev => {
        saveNoteToStorage(content, prev);
        return prev;
      });
    }, 500);
  };

  const deleteNote = (id: string) => {
    setAllNotes(prev => {
      const remaining = prev.filter(n => n.id !== id);
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed: StoredData = data ? JSON.parse(data) : { notes: [], dayStatuses: {} };
        parsed.notes = remaining;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {}
      return remaining;
    });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { currentNote, setCurrentNote: handleSetCurrentNote, allNotes, deleteNote, isSaving };
}
