"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Siren, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIncidentBannerStore } from "@/lib/stores/incidentBanner.store";

const AUTO_DISMISS_MS = 7000;

function toneFor(priority?: string | null, severity?: string | null) {
  const v = `${priority ?? ""} ${severity ?? ""}`.toUpperCase();
  if (v.includes("CRITICAL") || v.includes("P0") || v.includes("P1")) {
    return {
      spin: "#ef4444",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      badge: "bg-red-500/10 text-red-600 dark:text-red-400",
      Icon: Siren,
    };
  }
  if (v.includes("HIGH") || v.includes("P2")) {
    return {
      spin: "#f59e0b",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      Icon: Siren,
    };
  }
  return {
    spin: "#28A745",
    iconBg: "bg-gradient-to-br from-IMSDarkGreen to-emerald-600",
    badge: "bg-IMSDarkGreen/10 text-IMSDarkGreen",
    Icon: Sparkles,
  };
}

export default function IncidentCreatedBanner() {
  const banner = useIncidentBannerStore((s) => s.banner);
  const hide = useIncidentBannerStore((s) => s.hide);
  const router = useRouter();

  const remainingRef = useRef(AUTO_DISMISS_MS);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!banner) return;
    remainingRef.current = AUTO_DISMISS_MS;
    pausedRef.current = false;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(hide, remainingRef.current);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner?.key]);

  function pause() {
    if (!banner || pausedRef.current) return;
    pausedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startedAtRef.current;
  }
  function resume() {
    if (!banner || !pausedRef.current) return;
    pausedRef.current = false;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(hide, Math.max(0, remainingRef.current));
  }

  function goToIncident() {
    if (!banner) return;
    hide();
    router.push(banner.link || `/incident?id=${banner.id}&tab=overview`);
  }

  // The outer wrapper + AnimatePresence must stay mounted even when there's
  // no active banner — AnimatePresence can only play the exit animation for
  // a child that disappears out from under it, not one whose parent
  // unmounts itself in the same tick.
  return (
    <>
      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={() =>
            useIncidentBannerStore.getState().show({
              id: "demo-incident",
              ticketId: "SI-000000",
              title: "Checkout API returning elevated 5xx errors",
              priority: "CRITICAL",
              source: "MANUAL",
            })
          }
          className="fixed bottom-4 right-4 z-[200] rounded-full bg-black px-4 py-2.5 text-[12.5px] font-bold text-white shadow-lg hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Demo banner
        </button>
      )}
      <div className="pointer-events-none fixed inset-x-0 top-6 z-[200] flex items-start justify-center px-4">
        <AnimatePresence>
          {banner && (() => {
            const tone = toneFor(banner.priority, banner.severity);
            const isAuto = banner.source === "AUTO";
            const { Icon } = tone;
            return (
              <motion.div
                key={banner.key}
                role="status"
                aria-live="assertive"
                initial={{ opacity: 0, scale: 0.9, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                onMouseEnter={pause}
                onMouseLeave={resume}
                className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl p-[1.5px]"
              >
                {/* subtle spinning ring — replaces the old solid colored border */}
                <motion.div
                  className="absolute inset-[-60%]"
                  style={{ background: `conic-gradient(from 0deg, transparent 0%, ${tone.spin} 18%, transparent 38%)` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative overflow-hidden rounded-2xl bg-black">
                  <div className="flex items-start gap-3.5 p-5">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white", tone.iconBg)}>
                      <Icon size={20} />
                    </div>

                    <button type="button" onClick={goToIncident} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-ibm text-[13px] font-bold text-white">
                          {isAuto ? "Incident Auto-Raised" : "Incident Created"}
                        </span>
                        {(banner.priority || banner.severity) && (
                          <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide", tone.badge)}>
                            {banner.priority || banner.severity}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-[13.5px] font-semibold text-zinc-200">{banner.title}</p>
                      <p className="mt-0.5 font-ibm text-[11.5px] text-zinc-500">
                        {banner.ticketId} · {isAuto ? "Detected automatically" : "Raised by you"} · click to view
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={hide}
                      aria-label="Dismiss"
                      className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </>
  );
}
