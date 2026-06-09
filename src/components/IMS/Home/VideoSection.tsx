"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Video data
// ─────────────────────────────────────────────────────────────────

const VIDEOS = [
  {
    id: 1,
    title: "Configuring policies & automation levels",
    desc: "Set maxAutomationLevel per environment. See how EAL is computed and enforced at the gate.",
    duration: "6:24",
    tag: "Getting started",
    src: "/IMS/videos/policies-automation.mp4",
    poster: "/IMS/images/videos/thumb-policies.png",
  },
  {
    id: 2,
    title: "Ezra dual-view intelligence output",
    desc: "See the Analyst view (line chart + typewriter) vs Leadership view (bar chart + business language).",
    duration: "8:11",
    tag: "Deep dive",
    src: "/IMS/videos/ezra-dual-view.mp4",
    poster: "/IMS/images/videos/thumb-ezra.png",
  },
  {
    id: 3,
    title: "Audit trail & compliance reporting",
    desc: "Every state transition, policy version, and actor logged immutably. Export-ready for SOC 2 reviewers.",
    duration: "4:55",
    tag: "Compliance",
    src: "/IMS/videos/audit-trail.mp4",
    poster: "/IMS/images/videos/thumb-audit.png",
  },
];

// ─────────────────────────────────────────────────────────────────
// Play button circle
// ─────────────────────────────────────────────────────────────────

function PlayCircle({ size = 52 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.12)",
        border: "1.5px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Offset triangle for optical centering */}
      <svg
        width={size * 0.38}
        height={size * 0.38}
        viewBox="0 0 16 16"
        fill="none"
        style={{ marginLeft: "10%" }}
      >
        <path d="M4 2.5l10 5.5-10 5.5V2.5z" fill="white" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function VideoSection() {
  const [activeId, setActiveId] = useState(1);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const active = VIDEOS.find((v) => v.id === activeId)!;

  const handleSelect = (id: number) => {
    if (id === activeId) return;
    setActiveId(id);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  return (
    <section
      ref={ref}
      className="w-full py-16 px-6"
      style={{ background: "#0a0a0a" }}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* ── Heading ── */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-white leading-[1.08] tracking-[-0.03em] mb-4"
          style={{ fontSize: "clamp(30px, 4vw, 56px)" }}
        >
          See the pipeline
          <br />
          in motion.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-[14.5px] leading-relaxed mb-10 max-w-sm"
          style={{ color: "#9ca3af" }}
        >
          Watch how Scrubbe takes an incident from raw signal to governed
          resolution — end to end, no narration required.
        </motion.p>

        {/* ── Main card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid #1f2937" }}
        >
          {/* ── Large player ── */}
          <div
            className="relative w-full"
            style={{ background: "#0d1117", aspectRatio: "16/7" }}
          >
            {/* LIVE DEMO badge */}
            <div className="absolute top-4 left-4 z-20">
              <span
                className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Live Demo
              </span>
            </div>

            {/* Duration */}
            <div className="absolute top-4 right-4 z-20">
              <span
                className="text-[11px] font-mono"
                style={{ color: "#6b7280" }}
              >
                {active.duration}
              </span>
            </div>

            {/* Video element */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={active.poster}
                  controls={playing}
                  playsInline
                  onEnded={() => setPlaying(false)}
                >
                  <source src={active.src} type="video/mp4" />
                </video>
              </motion.div>
            </AnimatePresence>

            {/* Play overlay — hidden once playing */}
            {!playing && (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex items-center justify-center z-10 border-none bg-transparent cursor-pointer"
                aria-label="Play video"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayCircle size={56} />
                </motion.div>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
