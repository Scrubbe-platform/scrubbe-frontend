"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Code, QrCode, Workflow } from "lucide-react";
import { MdLoop } from "react-icons/md";
import { BsStars } from "react-icons/bs";

// ─────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────

const ITEM_DURATION = 10_000; // 10s per item

// ─────────────────────────────────────────────────────────────────
// Problem data
// ─────────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    id: 0,
    icon: <Code size={18} className="text-emerald-500" />,
    title: "Reactive, manual incident response",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
  },
  {
    id: 1,
    icon: <QrCode size={18} className="text-emerald-500" />,
    title: "No governance or accountability in remediation",
    desc: "When AI or automation takes action during an incident, there's no policy guardrail controlling what it's allowed to do, under what conditions, or with whose approval. Actions happen without audit trails, creating compliance and accountability gaps.",
  },
  {
    id: 2,
    icon: <Workflow size={18} className="text-emerald-500" />,
    title: "Fragmented tooling with no unified intelligence",
    desc: "Incident signals live across dozens of disconnected tools — PagerDuty, Datadog, GitHub, Jira, Slack, etc. Teams context-switch constantly, losing time and signal fidelity. There's no single plane that aggregates, correlates, and reasons across all of them.",
  },
  {
    id: 3,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect
          x="3"
          y="5"
          width="12"
          height="9"
          rx="1.5"
          stroke="#16a34a"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M7 5V4a2 2 0 014 0v1"
          stroke="#16a34a"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx="9"
          cy="10"
          r="1.5"
          stroke="#16a34a"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    ),
    title: "Blast radius blindness",
    desc: "Teams make remediation decisions without understanding the downstream service dependency impact of an action. A fix applied to one service can cascade into broader outages because nobody mapped the risk before executing.",
  },
  {
    id: 4,
    icon: <MdLoop size={18} className="text-emerald-500" />,
    title: "No learning loop from past incidents",
    desc: "Post-mortems happen in isolation. Findings aren't fed back into the system to improve future detection, playbook selection, or automation confidence. Every incident starts from scratch rather than building institutional intelligence.",
  },
  {
    id: 5,
    icon: <BsStars size={18} className="text-emerald-500" />,
    title: "AI action without trust or explainability",
    desc: "Enterprise teams won't adopt AI-driven remediation if they can't see why an agent proposed an action, what policy governed it, and what the audit trail looks like. The absence of explainable, governed AI is the core adoption barrier in high-stakes engineering environments.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Timer bar — animates from 0→100% over ITEM_DURATION
// Key resets the animation when active index changes
// ─────────────────────────────────────────────────────────────────

function TimerBar({ active, paused }: { active: boolean; paused: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-100 overflow-hidden">
      <motion.div
        key={`bar-${paused}`}
        className="h-full bg-emerald-500 origin-left"
        initial={{ scaleX: 0 }}
        animate={paused ? undefined : { scaleX: 1 }}
        transition={
          paused
            ? { duration: 0 }
            : { duration: ITEM_DURATION / 1000, ease: "linear" }
        }
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Problem row
// ─────────────────────────────────────────────────────────────────

function ProblemItem({
  item,
  index,
  inView,
  isActive,
  paused,
  onActivate,
  onMouseEnter,
  onMouseLeave,
}: {
  item: (typeof PROBLEMS)[0];
  index: number;
  inView: boolean;
  isActive: boolean;
  paused: boolean;
  onActivate: (i: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.07 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative border-b border-gray-100 last:border-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Clickable header row */}
      <button
        className="w-full flex items-center gap-3.5 py-5 text-left bg-transparent border-none cursor-pointer group"
        onClick={() => onActivate(index)}
      >
        {/* Icon box */}
        <div
          className="shrink-0 w-8 h-8 rounded flex items-center justify-center transition-colors duration-300"
          style={{
            border: `1.5px solid ${isActive ? "#6ee7b7" : "#d1fae5"}`,
            background: isActive ? "#ecfdf5" : "#f0fdf4",
          }}
        >
          {item.icon}
        </div>

        {/* Title */}
        <h3
          className="text-[20px] font-bold leading-snug tracking-tight transition-colors duration-300"
          style={{ color: isActive ? "#059669" : "#111827" }}
        >
          {item.title}
        </h3>

        {/* Active dot indicator */}
        {isActive && (
          <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </button>

      {/* Expandable description — auto-shown when active */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="desc"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[15px] text-gray-500 leading-relaxed pb-5 max-w-2xl">
              {item.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Advance to next item
  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % PROBLEMS.length);
  }, []);

  // Auto-cycle
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(advance, ITEM_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, advance]);

  // Manual jump — reset the interval
  const handleActivate = (index: number) => {
    setActiveIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(advance, ITEM_DURATION);
    }
  };

  return (
    <section ref={ref} className="w-full bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold text-gray-950 leading-[1.1] tracking-[-0.03em] text-center mb-6"
          style={{ fontSize: "clamp(32px, 3vw, 56px)" }}
        >
          Modern systems generate signals.
          <br />
          They do not generate answers.
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-gray-500 text-[15px] leading-relaxed mb-16 max-w-xl mx-auto"
        >
          Teams have alerts, dashboards, and logs. What they still lack is a
          system that understands what caused the issue, decides the right
          action, and executes safely.
        </motion.p>

        {/* Step dots — quick jump nav */}

        {/* Problem list */}
        <div>
          {PROBLEMS.map((item, i) => (
            <ProblemItem
              key={item.id}
              item={item}
              index={i}
              inView={inView}
              isActive={activeIndex === i}
              paused={paused}
              onActivate={handleActivate}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            />
          ))}
        </div>

        {/* Pause / play hint */}
      </div>
    </section>
  );
}
