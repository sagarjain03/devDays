

const QUOTES: string[] = [
  "Code. Debug. Repeat.",
  "First, solve the problem. Then, write the code.",
  "Consistency beats intensity.",
  "Ship it before you're ready.",
  "Make it work, make it right, make it fast.",
  "Every expert was once a beginner.",
  "The best code is the code you don't write.",
  "Done is better than perfect.",
  "Read the docs. All of them.",
  "Refactor early, refactor often.",
  "Your future self will thank you for that comment.",
  "One PR a day keeps the tech debt away.",
  "Premature optimization is the root of all evil.",
  "Write code for humans, not machines.",
  "Always code as if the person maintaining it is a violent psychopath.",
  "Simplicity is the soul of efficiency.",
  "Test in prod? Bold strategy.",
  "git commit -m 'fix: finally'",
  "The compiler is always right.",
  "Rubber duck debugging: underrated.",
];


export function getQuoteForDate(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return QUOTES[dayOfYear % QUOTES.length];
}