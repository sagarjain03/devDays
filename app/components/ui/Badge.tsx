
interface BadgeProps {
  label: string;
  color?: "violet" | "green" | "red" | "zinc";
  dot?: boolean;
}

export function Badge({ label, color = "violet", dot = false }: BadgeProps) {
  const colors = {
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red:    "bg-red-500/10 text-red-400 border-red-500/20",
    zinc:   "bg-zinc-700/50 text-zinc-400 border-zinc-600/20",
  };

  const dotColors = {
    violet: "bg-violet-400",
    green:  "bg-emerald-400",
    red:    "bg-red-400",
    zinc:   "bg-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${colors[color]}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`} />
      )}
      {label}
    </span>
  );
}