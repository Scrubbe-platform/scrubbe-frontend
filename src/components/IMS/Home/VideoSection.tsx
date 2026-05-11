"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────────
// Video data — swap src/poster/transcript with real content
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
    transcript: `[0:00] In this walkthrough we'll configure the maxAutomationLevel for your production environment.

[0:42] Navigate to Settings → Environments and select your production workspace.

[1:15] The EAL (Effective Automation Level) is computed from three factors: risk classification, blast radius score, and the approval matrix you've defined.

[2:30] Setting maxAutomationLevel to 2 means Scrubbe will propose fixes but require human approval before executing in production.

[3:45] We'll walk through what happens when an incident triggers at level 3 — the gate holds and routes to the approver on-call.

[5:10] Finally, we'll verify the policy is enforced by replaying a recent incident through the simulation mode.

[6:10] That's it — your automation governance is now fully configured and auditable.`,
  },
  {
    id: 2,
    title: "Ezra dual-view intelligence output",
    desc: "See the Analyst view (line chart + typewriter) vs Leadership view (bar chart + business language).",
    duration: "8:11",
    tag: "Deep dive",
    src: "/IMS/videos/ezra-dual-view.mp4",
    poster: "/IMS/images/videos/thumb-ezra.png",
    transcript: `[0:00] Ezra surfaces intelligence in two modes depending on who is viewing the incident.

[0:55] The Analyst view renders a real-time line chart of the affected metrics alongside a typewriter-style reasoning trace — you can watch Ezra correlate signals as it works.

[2:30] Switching to Leadership view transforms the output: bar charts replace the time-series, and technical language is translated into business impact statements.

[4:00] Both views share the same underlying evidence. The data is identical — only the presentation layer changes.

[6:20] You can configure which view is default per role in the team settings panel.

[7:50] In the next section we'll look at how the output feeds directly into the approval workflow.`,
  },
  {
    id: 3,
    title: "Audit trail & compliance reporting",
    desc: "Every state transition, policy version, and actor logged immutably. Export-ready for SOC 2 reviewers.",
    duration: "4:55",
    tag: "Compliance",
    src: "/IMS/videos/audit-trail.mp4",
    poster: "/IMS/images/videos/thumb-audit.png",
    transcript: `[0:00] Every action Scrubbe takes — or considers taking — is written to an immutable audit log.

[0:40] The log captures: the incident state at each transition, the policy version that evaluated the action, the approver identity, and the exact timestamp.

[1:30] From the Audit panel, you can filter by incident, date range, actor, or policy version.

[2:15] Exporting for SOC 2 reviewers is a single click — the report formats to the standard evidence structure auditors expect.

[3:00] We'll look at a real incident audit from last week and walk through every logged event in order.

[4:30] Audit trails are retained for 24 months by default and can be extended in your data retention settings.`,
  },
];

// ─────────────────────────────────────────────────────────────────
// Play icon SVG
// ─────────────────────────────────────────────────────────────────

function PlayIcon({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.15)",
        border: "1.5px solid rgba(255,255,255,0.3)",
        backdropFilter: "blur(6px)",
      }}
    >
      <svg
        width={size * 0.4}
        height={size * 0.4}
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M5 3l9 5-9 5V3z" fill="white" />
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
        {/* Heading */}
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

        {/* Player card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="border border-[#1f2937] rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_300px]"
          // style={{ background: "#111827" }}
        >
          {/* ── LEFT: main player + transcript ── */}
          <div style={{ borderRight: "1px solid #1f2937" }}>
            {/* Video area */}
            <div
              className="relative bg-[#0d1117]"
              style={{ aspectRatio: "16/9" }}
            >
              {/* LIVE DEMO badge */}

              {/* Duration */}
              <div className="absolute top-4 right-4 z-20">
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "#9ca3af" }}
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

              {/* Play button overlay — hidden when playing */}
              {!playing && (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center z-10 bg-transparent border-none cursor-pointer"
                  aria-label="Play video"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlayIcon size={52} />
                  </motion.div>
                </button>
              )}
            </div>

            {/* Transcript */}
            <div className="p-5 border-t border-[#1f2937]">
              <p className="text-[13px] font-bold text-white mb-3">
                Transcript here
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <pre
                    className="text-[12.5px] leading-relaxed whitespace-pre-wrap font-mono"
                    style={{ color: "#6b7280" }}
                  >
                    {active.transcript}
                  </pre>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT: video list ── */}
          <div className="flex flex-col divide-y divide-[#1f2937]">
            {VIDEOS.map((v) => {
              const isActive = v.id === activeId;
              return (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v.id)}
                  className="flex flex-col text-left p-0 bg-transparent border-none cursor-pointer group"
                  style={{
                    background: isActive ? "#1f2937" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-full flex items-center justify-center"
                    style={{ aspectRatio: "16/9", background: "#0d1117" }}
                  >
                    {v.poster && (
                      <img
                        src={v.poster}
                        alt={v.title}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    )}
                    {/* Play icon on thumbnails */}
                    <div className="relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                      <PlayIcon size={32} />
                    </div>
                    {/* Active green left border */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                        style={{ background: "#22c55e" }}
                      />
                    )}
                  </div>

                  {/* Meta */}
                  <div className="px-4 py-3">
                    <p
                      className="text-[13px] font-bold leading-snug mb-1"
                      style={{ color: isActive ? "#f9fafb" : "#d1d5db" }}
                    >
                      {v.title}
                    </p>
                    <p
                      className="text-[11.5px] leading-relaxed mb-2"
                      style={{ color: "#6b7280" }}
                    >
                      {v.desc}
                    </p>
                    <p
                      className="text-[11px] font-mono"
                      style={{ color: "#4b5563" }}
                    >
                      {v.duration}
                      {" · "}
                      <span style={{ color: "#22c55e" }}>{v.tag}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
