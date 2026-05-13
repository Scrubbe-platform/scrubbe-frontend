"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { card } from "@heroui/react";

// ─────────────────────────────────────────────────────────────────
// Slide data — 3 sections
// ─────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 0,
    headline: ["Systems detect failure.", "They still can't fix it."],
    accent: "Intelligently.",
    sub: "A governed control loop for understanding incidents, choosing the right action, and moving toward resolution safely.",
    card: "Scrubbe detects disruption early across distributed services and immediately coordinates response. Agents isolate the issue and propose a safe fix within minutes. Policies validate every step before execution. Systems recover before customer impact spreads.",
  },
  {
    id: 1,
    headline: ["From incident to resolution.", "Intelligently."],
    accent: "Automatically.",
    sub: "AI agents correlate signals across your entire stack — logs, metrics, traces — and surface the real cause in seconds, not hours.",
    card: "Scrubbe ingests signals from every layer of your infrastructure. Agents cross-reference patterns, deployment history, and service dependencies to pinpoint the root cause before engineers even open a terminal.",
  },
  {
    id: 2,
    headline: ["Scrubbe analyzes incidents,", "understands root cause."],
    accent: "Governed.",
    sub: "Every remediation action is validated against your policies before it runs. No blind automation. No surprises. Just safe, auditable execution.",
    card: "Scrubbe's policy engine checks every proposed fix against your governance rules. Approvals are routed to the right people. Every action is logged, traceable, and reversible — so your team stays in control.",
  },
];

const SLIDE_DURATION = 6000; // ms per slide

// ─────────────────────────────────────────────────────────────────
// World Map SVG Background
// ─────────────────────────────────────────────────────────────────

function generateDotCluster(
  x: number,
  y: number,
  w: number,
  h: number,
  density: number
) {
  const dots: { x: number; y: number; o: number }[] = [];
  const spacing = 9;
  for (let dx = 0; dx < w; dx += spacing) {
    for (let dy = 0; dy < h; dy += spacing) {
      const hash = Math.sin(x + dx * 0.3 + y + dy * 0.7) * 0.5 + 0.5;
      if (hash < density) {
        dots.push({ x: x + dx, y: y + dy, o: 0.25 + hash * 0.45 });
      }
    }
  }
  return dots;
}

const NODES = [
  { cx: 210, cy: 95 },
  { cx: 390, cy: 75 },
  { cx: 560, cy: 60 },
  { cx: 700, cy: 90 },
  { cx: 240, cy: 260 },
  { cx: 400, cy: 210 },
  { cx: 560, cy: 200 },
  { cx: 720, cy: 310 },
  { cx: 150, cy: 350 },
  { cx: 800, cy: 140 },
];

function WorldMapBackground() {
  return (
    <div className="absolute top-0 right-0 bottom-0 overflow-hidden pointer-events-none select-none">
      {/* Grid lines */}
      <img src="/IMS/globe.svg" className="h-[90%] w-full" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Timer progress bar — one segment per slide
// ─────────────────────────────────────────────────────────────────

interface TimerBarProps {
  index: number;
  active: number;
  paused: boolean;
  onClick: (i: number) => void;
}

function TimerBar({ index, active, paused, onClick }: TimerBarProps) {
  const isActive = index === active;
  const isDone = index < active;

  return (
    <button
      onClick={() => onClick(index)}
      className="relative h-[6px] rounded-full overflow-hidden cursor-pointer border-none p-0 bg-transparent"
      style={{ width: isActive ? 40 : 20 }}
      aria-label={`Go to slide ${index + 1}`}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full bg-gray-200" />
      {/* Fill */}
      {isDone && <div className="absolute inset-0 rounded-full bg-gray-800" />}
      {isActive && (
        <motion.div
          key={`bar-${active}-${paused}`}
          className="absolute inset-y-0 left-0 rounded-full bg-gray-800"
          initial={{ width: "0%" }}
          animate={{ width: paused ? undefined : "100%" }}
          transition={
            paused
              ? { duration: 0 }
              : { duration: SLIDE_DURATION / 1000, ease: "linear" }
          }
        />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Floating info card
// ─────────────────────────────────────────────────────────────────

function FloatingCard({ text }: { text: string }) {
  return (
    <div
      className="absolute bg-white/95 backdrop-blur-sm rounded-lg p-7 max-w-[300px]"
      style={{
        right: "10%",
        top: "50%",
        transform: "translateY(-50%)",
        border: "1.5px dashed #22c55e",
        boxShadow: "0 8px 40px rgba(0,0,0,0.09)",
      }}
    >
      <div
        className="absolute left-0 top-6 bottom-6 w-[3px] bg-emerald-500 rounded-full"
        style={{ left: -1 }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[14.5px] text-gray-700 leading-[1.8] font-normal"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CTA Button
// ─────────────────────────────────────────────────────────────────

function CTAButton() {
  useEffect(() => {
    (async () => {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi({ namespace: "hero-demo" });
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#10b981" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <motion.button
      data-cal-namespace="hero-demo"
      data-cal-link="scrubbe/decision-system-demo"
      data-cal-config='{"layout":"month_view","theme":"light"}'
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-flex items-center gap-2 px-7 py-4 rounded-md font-semibold text-white text-[15px] tracking-tight overflow-hidden cursor-pointer border-none"
      style={{
        background:
          "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
        boxShadow: "0 2px 20px rgba(34,197,94,0.2)",
      }}
    >
      Book a decision-system demo
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pipeline breadcrumb
// ─────────────────────────────────────────────────────────────────

function PipelineBreadcrumb() {
  const steps = ["Signals", "Root Cause", "Decision", "Safe Execution"];
  return (
    <div className="flex items-center gap-1 mt-6 flex-wrap">
      {steps.map((step, i) => (
        <span key={step} className="flex items-center gap-1">
          <span className="text-[13px] text-gray-400 font-medium">{step}</span>
          <span className="text-gray-300 text-[13px] mx-0.5">→</span>
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Pause / Play icon
// ─────────────────────────────────────────────────────────────────

function PausePlayIcon({
  paused,
  onClick,
}: {
  paused: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 hover:border-gray-500 transition-colors bg-transparent cursor-pointer"
      aria-label={paused ? "Play" : "Pause"}
    >
      {paused ? (
        // Play triangle
        <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
          <path d="M1 1.5L7 4.5L1 7.5V1.5Z" fill="#374151" />
        </svg>
      ) : (
        // Pause bars
        <svg width="8" height="9" viewBox="0 0 8 9" fill="none">
          <rect x="1" y="1.5" width="2" height="6" rx="0.5" fill="#374151" />
          <rect x="5" y="1.5" width="2" height="6" rx="0.5" fill="#374151" />
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Hero Section
// ─────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToNext = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToSlide = useCallback(
    (i: number) => {
      setActive(i);
      // Reset timer on manual nav
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!paused) {
        intervalRef.current = setInterval(goToNext, SLIDE_DURATION);
      }
    },
    [paused, goToNext]
  );

  // Auto-advance timer
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(goToNext, SLIDE_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, goToNext]);

  const slide = SLIDES[active];

  return (
    <section className="relative w-full min-h-[100vh] flex items-center overflow-hidden bg-white">
      <WorldMapBackground />
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="tgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tgrid)" />
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-[1480px] mx-auto px-8 lg:px-16 py-20">
        <div className="max-w-[700px] ">
          {/* Headline */}
          <div className="mb-5" style={{ minHeight: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  className="font-semibold tracking-wide text-gray-950 leading-[1.08] mb-5"
                  style={{ fontSize: "clamp(44px, 4vw, 76px)" }}
                >
                  {slide.headline.map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                  <span className="text-emerald-500">{slide.accent}</span>
                </h1>

                <p className="text-[16px] text-gray-500 leading-relaxed max-w-[440px]">
                  {slide.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Timer bars + pause/play */}
          <div className="flex items-center gap-3 mb-8">
            {SLIDES.map((_, i) => (
              <TimerBar
                key={i}
                index={i}
                active={active}
                paused={paused}
                onClick={goToSlide}
              />
            ))}
            <PausePlayIcon
              paused={paused}
              onClick={() => setPaused((p) => !p)}
            />
          </div>

          {/* CTA */}
          <CTAButton />

          {/* Pipeline breadcrumb */}
          <PipelineBreadcrumb />
        </div>
      </div>

      {/* Floating card */}
      {/* <FloatingCard text={slide.card} /> */}
    </section>
  );
}
