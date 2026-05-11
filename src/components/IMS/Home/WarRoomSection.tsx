"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";

const WAR_ROOMS = [
  {
    id: "slack",
    title: "Slack War Room",
    subtitle: "Turn Slack into a structured incident command center",
    desc: "Scrubbe transforms Slack channels into live war rooms where engineers and agents collaborate in real time. Context flows directly into the conversation, decisions are visible, and actions are triggered safely—without leaving Slack.",
    image: "/IMS/Frame1.png",
  },
  {
    id: "teams",
    title: "Microsoft Teams War Room",
    subtitle: "Make Teams the single source of truth during incidents",
    desc: "Scrubbe turns Teams into a governed war room where communication, context, and execution come together. Every message, decision, and action is structured, tracked, and controlled—right inside Teams.",
    image: "/IMS/Frame2.png",
  },
  {
    id: "zoom",
    title: "Zoom War Room",
    subtitle: "Bring structure and execution into live incident calls",
    desc: "Scrubbe augments Zoom war rooms with real-time context, agent insights, and controlled actions. While teams collaborate live, Scrubbe ensures decisions are captured and execution happens safely alongside the call.",
    image: "/IMS/Frame3.png",
  },
];

export default function WarRoomSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const headingRef = useRef(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const onScroll = () => {
      // Clear any pending update — we wait until scrolling pauses slightly
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        // Trigger point: the section whose centre is closest to the viewport centre
        const viewportCentre = window.scrollY + window.innerHeight * 0.5;

        let closestIndex = 0;
        let closestDist = Infinity;

        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const elCentre = rect.top + window.scrollY + rect.height * 0.5;
          const dist = Math.abs(viewportCentre - elCentre);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        });

        setActiveIndex(closestIndex);
      }, 80); // 80ms debounce — feels natural, not laggy
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const setRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      itemRefs.current[i] = el;
    },
    []
  );

  return (
    <section
      className="relative w-full py-20 px-6 overflow-hidden"
      style={{ background: "#f9fafb" }}
    >
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="wrgrid"
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
          <rect width="100%" height="100%" fill="url(#wrgrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[860px] mx-auto">
        {/* Heading */}
        <motion.h2
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-gray-950 leading-[1.08] tracking-[-0.03em] mb-14"
          style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
        >
          One War Room. Total Clarity.
          <br />
          Controlled Execution from Start
          <br />
          to Resolution
        </motion.h2>

        {/* Items */}
        <div className="flex flex-col">
          {WAR_ROOMS.map((room, i) => {
            const isActive = activeIndex === i;
            const isLast = i === WAR_ROOMS.length - 1;

            return (
              <div
                key={room.id}
                ref={setRef(i)}
                className="relative pl-8"
                style={{
                  borderLeft: `2px solid ${isActive ? "#22c55e" : "#e5e7eb"}`,
                  paddingBottom: isLast ? 0 : 48,
                  paddingTop: 8,
                  transition: "border-color 0.5s ease",
                }}
              >
                {/* Dot */}
                <div
                  className="absolute -left-[7px] top-5 w-3.5 h-3.5 rounded-full border-2 border-white"
                  style={{
                    background: isActive ? "#22c55e" : "#d1d5db",
                    boxShadow: isActive
                      ? "0 0 0 4px rgba(34,197,94,0.15)"
                      : "none",
                    transition: "background 0.5s ease, box-shadow 0.5s ease",
                  }}
                />

                {/* Title */}
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="font-black tracking-tight"
                    style={{
                      fontSize: "clamp(18px, 2vw, 24px)",
                      color: isActive ? "#111827" : "#9ca3af",
                      transition: "color 0.5s ease",
                    }}
                  >
                    {room.title}
                  </h3>
                  <span
                    style={{
                      color: isActive ? "#22c55e" : "#d1d5db",
                      fontSize: 18,
                      userSelect: "none",
                      transition: "color 0.5s ease",
                    }}
                  >
                    {isActive ? "∧" : "∨"}
                  </span>
                </div>

                {/* Subtitle + desc */}
                <div
                  style={{
                    opacity: isActive ? 1 : 0.4,
                    transition: "opacity 0.5s ease",
                  }}
                >
                  <h4 className="text-[15px] font-bold text-gray-800 mb-2">
                    {room.subtitle}
                  </h4>
                  <p className="text-[14px] text-gray-500 leading-relaxed max-w-xl">
                    {room.desc}
                  </p>
                </div>

                {/* Image — smooth expand/collapse */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="img"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 28 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{
                        height: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.45, delay: 0.1 },
                        marginTop: { duration: 0.45 },
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
                        style={{ aspectRatio: "16/9" }}
                      >
                        <Image
                          src={room.image}
                          alt={room.title}
                          fill
                          className="object-cover"
                          priority={i === 0}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
