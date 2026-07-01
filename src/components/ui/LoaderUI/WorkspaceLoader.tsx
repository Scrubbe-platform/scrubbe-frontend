"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadingStep {
  id: string;
  label: string;
  durationMs: number;
}

interface WorkspaceLoaderProps {
  companyName?: string;
  logo?: React.ReactNode;
  steps?: LoadingStep[];
  onComplete?: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_STEPS: LoadingStep[] = [
  { id: "auth", label: "Authentication complete", durationMs: 1400 },
  { id: "profile", label: "User profile loaded", durationMs: 1000 },
  { id: "security", label: "Security policies applied", durationMs: 900 },
  { id: "workspace", label: "Workspace configuration set", durationMs: 1200 },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useWorkspaceLoader(steps: LoadingStep[], onComplete?: () => void) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentLabel, setCurrentLabel] = useState("Initialising...");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let elapsed = 0;
    let stepElapsed = 0;
    let stepIndex = 0;

    const totalMs = steps.reduce((s, step) => s + step.durationMs, 0);
    const TICK_MS = 30;

    const ticker = setInterval(() => {
      if (cancelled) return;
      elapsed += TICK_MS;
      stepElapsed += TICK_MS;

      setProgress(Math.min((elapsed / totalMs) * 100, 98));

      if (
        stepIndex < steps.length &&
        stepElapsed >= steps[stepIndex].durationMs
      ) {
        const step = steps[stepIndex];
        setCompletedSteps((prev) => new Set([...prev, step.id]));
        const next = steps[stepIndex + 1];
        setCurrentLabel(
          next
            ? `Loading ${next.label.toLowerCase().split(" ")[0]}...`
            : "Finalising...",
        );
        stepElapsed = 0;
        stepIndex++;

        if (stepIndex === steps.length) {
          clearInterval(ticker);
          setTimeout(() => {
            if (!cancelled) {
              setProgress(100);
              setCurrentLabel("Ready.");
              setDone(true);
              onComplete?.();
            }
          }, 500);
        }
      }
    }, TICK_MS);

    setCurrentLabel(
      `Loading ${steps[0]?.label.toLowerCase().split(" ")[0] ?? "workspace"}...`,
    );
    return () => {
      cancelled = true;
      clearInterval(ticker);
    };
  }, []);

  return { completedSteps, currentLabel, progress, done };
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  const COLS = 40;
  const filled = Math.round((pct / 100) * COLS);
  const empty = COLS - filled;

  return (
    <div className="space-y-3">
      {/* Block-char bar */}
      <div className="flex items-center gap-4">
        <div className="font-mono text-xl leading-none tracking-tight select-none flex-1">
          <span className="text-emerald-500 dark:text-emerald-400">
            {"█".repeat(filled)}
          </span>
          <span className="text-zinc-200 dark:text-zinc-700">
            {"░".repeat(empty)}
          </span>
        </div>
        <span className="font-mono text-2xl font-bold tabular-nums text-zinc-800 dark:text-zinc-100 w-16 text-right flex-shrink-0">
          {Math.round(pct)}%
        </span>
      </div>

      {/* Smooth CSS bar underneath */}
      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────

function StepRow({
  label,
  done,
  index,
}: {
  label: string;
  done: boolean;
  index: number;
}) {
  return (
    <div
      className="flex items-center gap-4"
      style={{
        opacity: done ? 1 : 0.22,
        transform: done ? "translateY(0)" : "translateY(6px)",
        transition: `opacity 0.45s ease ${index * 60}ms, transform 0.45s ease ${index * 60}ms`,
      }}
    >
      {/* Circle tick */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-400 ${
          done
            ? "bg-emerald-500 dark:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
            : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        }`}
      >
        {done ? (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2.5 6.5L5.5 9.5L10.5 4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        )}
      </div>

      {/* Label */}
      <span
        className={`text-base font-medium tracking-tight transition-colors duration-300 ${
          done
            ? "text-zinc-800 dark:text-zinc-100"
            : "text-zinc-400 dark:text-zinc-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin text-emerald-500 dark:text-emerald-400"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M8 2A6 6 0 0 1 14 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkspaceLoader({
  companyName = "Scrubbe",
  logo,
  steps = DEFAULT_STEPS,
  onComplete,
}: WorkspaceLoaderProps) {
  const { completedSteps, currentLabel, progress, done } = useWorkspaceLoader(
    steps,
    onComplete,
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-10">
        {/* ── Brand ── */}
        <div className="flex items-center justify-center gap-3 mx-auto w-full">
          <motion.div
            key="logo-full"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-7 w-[160px] shrink-0 relative"
          >
            <Image
              src="/blacklogo.png"
              alt="scrubbe"
              fill
              className="object-contain"
            />
          </motion.div>
          {/* <span className="font-bold text-base tracking-widest text-zinc-900 dark:text-zinc-100 uppercase">
            {companyName}
          </span> */}
        </div>

        {/* ── Heading ── */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
            Preparing your
            <br />
            workspace
          </h2>
          <p className="text-base text-zinc-400 dark:text-zinc-500">
            Hang tight — this only takes a moment.
          </p>
        </div>

        {/* ── Progress ── */}
        <div className="space-y-4 py-2">
          <ProgressBar pct={progress} />

          {/* Status label */}
          <div className="flex items-center gap-2.5 min-h-[22px]">
            {done ? (
              <>
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path
                      d="M1.5 5L3.5 7L7.5 2.5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  All systems ready
                </span>
              </>
            ) : (
              <>
                <Spinner />
                <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                  {currentLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* ── Steps ── */}
        <div className="space-y-5">
          {steps.map((step, i) => (
            <StepRow
              key={step.id}
              label={step.label}
              done={completedSteps.has(step.id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
