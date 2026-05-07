"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Code, QrCode, Workflow } from "lucide-react";
import { MdLoop } from "react-icons/md";
import { BsStars } from "react-icons/bs";

// ─────────────────────────────────────────────────────────────────
// Problem data
// ─────────────────────────────────────────────────────────────────

const PROBLEMS = [
  {
    id: 0,
    icon: <Code size={18} className=" text-emerald-500" />,
    title: "Reactive, manual incident response",
    desc: "Engineering teams are stuck in reactive fire-fighting mode — incidents are discovered late, triaged manually, and resolved through heroic individual effort rather than systematic process. There's no intelligent automation to accelerate detection-to-resolution.",
  },
  {
    id: 1,
    icon: <QrCode size={18} className=" text-emerald-500" />,
    title: "No governance or accountability in remediation",
    desc: "When AI or automation takes action during an incident, there's no policy guardrail controlling what it's allowed to do, under what conditions, or with whose approval. Actions happen without audit trails, creating compliance and accountability gaps.",
  },
  {
    id: 2,
    icon: <Workflow size={18} className=" text-emerald-500" />,
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
    icon: <MdLoop size={18} className=" text-emerald-500" />,
    title: "No learning loop from past incidents",
    desc: "Post-mortems happen in isolation. Findings aren't fed back into the system to improve future detection, playbook selection, or automation confidence. Every incident starts from scratch rather than building institutional intelligence.",
  },
  {
    id: 5,
    icon: <BsStars size={18} className=" text-emerald-500" />,
    title: "AI action without trust or explainability",
    desc: "Enterprise teams won't adopt AI-driven remediation if they can't see why an agent proposed an action, what policy governed it, and what the audit trail looks like. The absence of explainable, governed AI is the core adoption barrier in high-stakes engineering environments.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Problem row item
// ─────────────────────────────────────────────────────────────────

function ProblemItem({
  item,
  index,
  inView,
}: {
  item: (typeof PROBLEMS)[0];
  index: number;
  inView: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="border-b border-gray-100 last:border-0"
    >
      {/* Title row — hover or click to reveal */}
      <button
        className="w-full flex items-center gap-3.5 py-5 text-left bg-transparent border-none cursor-pointer group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
      >
        {/* Icon box */}
        <div
          className="shrink-0 w-8 h-8 rounded flex items-center justify-center"
          style={{ border: "1.5px solid #bbf7d0", background: "#f0fdf4" }}
        >
          {item.icon}
        </div>

        {/* Title */}
        <h3 className="text-[20px] font-bold text-gray-900 leading-snug tracking-tight group-hover:text-emerald-600 transition-colors duration-200">
          {item.title}
        </h3>
      </button>

      {/* Expandable description */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="desc"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
// Main section
// ─────────────────────────────────────────────────────────────────

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

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

        {/* Problem list */}
        <div>
          {PROBLEMS.map((item, i) => (
            <ProblemItem key={item.id} item={item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
