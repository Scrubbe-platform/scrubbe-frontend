// Exact color tokens from the design blueprint's :root — used as Tailwind
// arbitrary values (bg-[var]) throughout this module and as raw hex for
// recharts, which cannot consume CSS custom properties in some browsers.
export const COLORS = {
  paper: "#FBFBF9",
  surface: "#FFFFFF",
  surface2: "#F6F6F3",
  surface3: "#F1F0EB",
  ink: "#15151A",
  ink2: "#52525B",
  ink3: "#8A8A93",
  ink4: "#B5B5BC",
  line: "#E7E6E0",
  line2: "#F0EFEA",
  accent: "#2540F2",
  accentPress: "#1B30C4",
  accent050: "#EEF0FF",
  accent100: "#DCE0FF",
  live: "#0EA47F",
  live050: "#E5F6F0",
  live700: "#0A7A5E",
  crit: "#E5484D",
  crit050: "#FDECEC",
  crit700: "#B42A30",
  warn: "#E0890B",
  warn050: "#FBF1DF",
  warn700: "#9C5E06",
  med: "#B9890A",
  med050: "#FAF3DC",
} as const;

export const TAG_CLASS: Record<string, string> = {
  "t-crit": "bg-[#FDECEC] dark:bg-red-500/10 text-[#B42A30] dark:text-red-400",
  "t-warn": "bg-[#FBF1DF] dark:bg-amber-500/10 text-[#9A6206] dark:text-amber-400",
  "t-acc": "bg-[#EEF0FF] dark:bg-blue-500/10 text-[#1B30C4] dark:text-blue-400",
  "t-neu": "bg-[#F1F0EB] dark:bg-zinc-800 text-[#52525B] dark:text-zinc-400",
};
export const RAIL_CLASS: Record<string, string> = {
  "r-crit": "bg-[#E5484D]",
  "r-warn": "bg-[#E0890B]",
  "r-acc": "bg-[#2540F2]",
  "r-neu": "bg-[#B5B5BC]",
};
