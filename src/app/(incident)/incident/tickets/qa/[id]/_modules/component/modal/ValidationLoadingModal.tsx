// components/ui/ValidationLoadingModal.tsx
"use client";

import React, { useState, useEffect } from "react";

interface ValidationLoadingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

const STEPS = [
  {
    id: "review",
    label: "Reviewing your incident",
    sub: "Reviewing your incident...",
  },
  {
    id: "checks",
    label: "Running quality checks",
    sub: "Running quality checks...",
  },
  {
    id: "policy",
    label: "Validating against operational policy",
    sub: "Validating against operational policy...",
  },
  {
    id: "upload",
    label: "Uploading analysis",
    sub: "Uploading analysis to database...",
  },
];

export default function ValidationLoadingModal({
  isOpen,
  onComplete,
}: ValidationLoadingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    // Tick through the checklist steps to simulate a live system processing telemetry
    const interval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex < STEPS.length - 1) {
          return prevIndex + 1;
        } else {
          clearInterval(interval);
          // Optional callback action trigger when the loading lifecycle finishes
          if (onComplete) onComplete();
          return prevIndex;
        }
      });
    }, 1800); // 1.8 seconds per verification phase

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Modal Container Body */}
      <div className="bg-white rounded-[2rem] w-full max-w-[480px] p-10 shadow-2xl flex flex-col items-center border border-zinc-100 animate-growIn">
        {/* Top Radial Loading Spinner Ring */}
        <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
          {/* Inner ambient ring structure */}
          <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
          {/* Spinning dynamic accent vector stroke */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1f9d5b] border-r-[#1f9d5b] animate-spin duration-1000" />
        </div>

        {/* Header Text Stack */}
        <div className="text-center space-y-1 mb-8">
          <h3 className="text-[21px] font-bold text-zinc-950 tracking-tight">
            Hold on a moment
          </h3>
          <p className="text-[14px] text-zinc-500 font-medium transition-all duration-300">
            {STEPS[currentStepIndex].sub}
          </p>
        </div>

        {/* Dynamic Verification Process Checklist Grid */}
        <div className="w-full max-w-xs space-y-3.5 align-middle select-none">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3.5 text-[14px] font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "text-[#1f9d5b]"
                    : isActive
                      ? "text-zinc-950 font-bold"
                      : "text-zinc-400"
                }`}
              >
                {/* Dynamic Status Icon Badges */}
                <div className="shrink-0 flex items-center justify-center w-5 h-5">
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-[#1f9d5b] flex items-center justify-center text-white text-[11px] font-black animate-scaleIn">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  {isActive && (
                    <div className="w-5 h-5 rounded-full border-2 border-[#1f9d5b] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#1f9d5b] animate-pulse" />
                    </div>
                  )}

                  {isPending && (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-200 bg-white" />
                  )}
                </div>

                {/* Text Label primitive */}
                <span className="truncate leading-none pt-0.5">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
