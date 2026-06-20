// Presentational-only constants (labels/colors). All escalation data itself
// now comes from the server — see escalation.api.ts.

export const SEVERITY_DISPLAY: Record<string, { label: string; badgeStyle: string }> = {
  P0: {
    label: "P0 Critical",
    badgeStyle:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
  },
  P1: {
    label: "P1 High",
    badgeStyle:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
  },
  P2: {
    label: "P2 Medium",
    badgeStyle:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
  },
  P3: {
    label: "P3 Low",
    badgeStyle:
      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  },
  P4: {
    label: "P4 Info",
    badgeStyle:
      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  },
};

export const DEFAULT_TIMEOUT_MATRIX: Record<string, number[]> = {
  P0: [5, 10, 20],
  P1: [10, 20],
  P2: [30, 60],
  P3: [240],
};
