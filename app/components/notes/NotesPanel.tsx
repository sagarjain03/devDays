// src/components/notes/NotesPanel.tsx
"use client";

import { useNotes } from "@/app/hooks/useNotes";
import { DateRange } from "@/app/types";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toDateKey } from "@/app/lib/dateUtils";

interface NotesPanelProps {
  selectedRange: DateRange;
  currentDate: Date;
}

export function NotesPanel({ selectedRange, currentDate }: NotesPanelProps) {
  const { currentNote, setCurrentNote, allNotes, deleteNote, isSaving } = useNotes(selectedRange, currentDate);

  const formatRange = (start: string | null, end: string | null) => {
    if (start && end && start !== end) {
      return `${start} → ${end}`;
    }
    if (start) return start;
    return `Month: ${end}`; // end stores the YYYY-M when no start
  };

  const getLabel = () => {
    if (selectedRange.start && selectedRange.end) {
      return `${toDateKey(selectedRange.start)} to ${toDateKey(selectedRange.end)}`;
    } else if (selectedRange.start) {
      return `Day: ${toDateKey(selectedRange.start)}`;
    }
    return `Month: ${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <div className="flex justify-between items-end mb-2">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
            &gt; Notes for {getLabel()}
          </p>
          <span className="text-xs font-mono text-zinc-600">
            {currentNote.length} chars
          </span>
        </div>
        
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="What's on your mind?..."
          className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4 text-zinc-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 min-h-[120px] transition-all"
        />
        
        <div className="flex justify-end mt-2 h-4">
          {currentNote.trim().length > 0 && (
            <span className={`text-xs font-mono ${isSaving ? "text-amber-500/80" : "text-emerald-500/80"}`}>
              {isSaving ? "saving..." : "saved ✓"}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-6">
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-4">
          &gt; Past notes
        </p>

        {allNotes.length === 0 ? (
          <p className="text-zinc-600 font-mono text-sm">
            &gt; no notes yet. start typing above.
          </p>
        ) : (
          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {allNotes.map((note, index) => (
                <motion.div
                  layout
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-zinc-950 border border-zinc-800/50 rounded-xl p-4 pr-10"
                >
                  <p className="text-violet-400/80 font-mono text-xs mb-2">
                    {formatRange(note.rangeStart, note.rangeEnd)}
                  </p>
                  <p className="text-zinc-400 font-mono text-sm line-clamp-2">
                    {note.content.length > 60 ? note.content.slice(0, 60) + "..." : note.content}
                  </p>
                  
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
