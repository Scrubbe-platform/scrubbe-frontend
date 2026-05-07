"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function MigrationSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    platform: "",
    timeline: "",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1a1f2e",
    border: "1px solid #2a3040",
    borderRadius: 6,
    padding: "14px 16px",
    fontSize: 13,
    color: "#d1d5db",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const placeholderColor = "#4b5563";

  return (
    <section
      ref={ref}
      className="w-full py-14 px-6"
      style={{ background: "#0a0a0a" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[1200px] mx-auto  rounded-xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* ── LEFT: Text ── */}
          <div
            className="px-10 py-12 flex flex-col justify-center"
            style={{ borderRight: "1px solid #1f2937" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[11px] font-bold tracking-[0.18em] uppercase mb-4"
              style={{ color: "#22c55e", fontFamily: "monospace" }}
            >
              Migrating from another platform?
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-black leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: "clamp(22px, 2.8vw, 38px)" }}
            >
              <span className="text-white">
                Switch to governed incident intelligence.
              </span>
              <br />
              <span style={{ color: "#22c55e" }}>
                We'll handle the migration.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="text-[13.5px] leading-relaxed max-w-sm"
              style={{ color: "#9ca3af" }}
            >
              Teams switching from PagerDuty, OpsGenie, FireHydrant,
              Incident.io, Statuspage, and custom in-house tools have a
              dedicated migration path. Your existing playbooks, escalation
              policies, and alert routing move across — with full audit
              continuity from day one.
            </motion.p>
          </div>

          {/* ── RIGHT: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="px-10 py-12"
          >
            <div className="flex flex-col gap-3">
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  style={inputStyle}
                  placeholder="Your name"
                  value={form.name}
                  onChange={set("name")}
                  className="placeholder-[#4b5563]"
                />
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Work email"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>

              {/* Row 2: Company + Team size */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  style={inputStyle}
                  placeholder="Company"
                  value={form.company}
                  onChange={set("company")}
                />
                <input
                  style={inputStyle}
                  placeholder="Eng team size"
                  value={form.teamSize}
                  onChange={set("teamSize")}
                />
              </div>

              {/* Current platform */}
              <input
                style={inputStyle}
                placeholder="Current platform you're migrating from"
                value={form.platform}
                onChange={set("platform")}
              />

              {/* Migration timeline */}
              <input
                style={inputStyle}
                placeholder="Migration timeline"
                value={form.timeline}
                onChange={set("timeline")}
              />

              {/* CTA button */}
              <button
                className="w-full py-4 rounded-lg font-bold text-[15px] text-white border-none cursor-pointer transition-all hover:brightness-110"
                style={{
                  background:
                    "linear-gradient(90deg, #0d1f1a 0%, #064e3b 40%, #10b981 80%, #a3e635 100%)",
                  letterSpacing: "-0.01em",
                }}
              >
                Request Migration Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
