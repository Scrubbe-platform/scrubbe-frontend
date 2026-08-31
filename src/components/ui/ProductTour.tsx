"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS, EVENTS } from "react-joyride";
import type { EventData, Step } from "react-joyride";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";

interface ProductTourProps {
  /** Unique id for this tour — used as the localStorage key so it only auto-runs once. */
  tourId: string;
  steps: Step[];
  /** Bump this (e.g. from a "Take a tour" button's click counter) to replay the tour on demand. */
  forceRun?: number;
}

const SEEN_KEY_PREFIX = "scrubbe-tour-seen:";

export function hasSeenTour(tourId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SEEN_KEY_PREFIX + tourId) === "1";
}

function markTourSeen(tourId: string) {
  localStorage.setItem(SEEN_KEY_PREFIX + tourId, "1");
}

/** A themed, restartable product tour built on react-joyride v3. */
export default function ProductTour({ tourId, steps, forceRun }: ProductTourProps) {
  const isDark = useIsDarkMode();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!hasSeenTour(tourId)) setRun(true);
  }, [tourId]);

  useEffect(() => {
    if (forceRun !== undefined && forceRun > 0) setRun(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRun]);

  const handleEvent = (data: EventData) => {
    if (
      data.type === EVENTS.TOUR_END &&
      (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED)
    ) {
      markTourSeen(tourId);
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleEvent}
      options={{
        showProgress: true,
        buttons: ["back", "skip", "primary"],
        primaryColor: "#28A745",
        backgroundColor: isDark ? "#18181b" : "#ffffff",
        textColor: isDark ? "#e4e4e7" : "#18181b",
        arrowColor: isDark ? "#18181b" : "#ffffff",
        overlayColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
        zIndex: 10000,
      }}
      styles={{
        tooltip: { borderRadius: 10, fontSize: 13.5 },
        tooltipContent: { padding: "8px 0" },
        buttonPrimary: { borderRadius: 6, fontSize: 12.5, fontWeight: 600 },
        buttonBack: { fontSize: 12.5, color: isDark ? "#a1a1aa" : "#71717a" },
        buttonSkip: { fontSize: 12.5, color: isDark ? "#71717a" : "#a1a1aa" },
      }}
    />
  );
}
