"use client";

import React from "react";
import { X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import { CatIcon } from "./settingsIcons";
import { TINTS, Tint } from "./settings.data";

export function SettingsDrawer({
  open, onClose, onSave, icon, tint, title, desc, children,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  icon: string;
  tint: Tint;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  const [bg, fg] = TINTS[tint];
  return (
    <>
      <div
        className={cn("fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[560px] flex-col bg-white font-ibm shadow-2xl transition-transform duration-300 ease-out dark:bg-zinc-900",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog" aria-modal="true"
      >
        <div className="flex items-start gap-3.5 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", bg, fg)}>
            <CatIcon name={icon} size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[19px] font-bold text-black dark:text-zinc-100">{title}</h2>
            <p className="mt-0.5 text-[13px] text-black/50 dark:text-zinc-500">{desc}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-md p-2 text-black/40 hover:bg-zinc-100 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {onSave && (
          <div className="flex items-center gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <span className="flex items-center gap-1.5 text-[12px] text-black/50 dark:text-zinc-500">
              <ShieldCheck size={14} className="text-IMSDarkGreen" /> Changes are logged to the ledger
            </span>
            <span className="flex-1" />
            <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="solid" size="sm" onClick={onSave}>Save changes</Button>
          </div>
        )}
      </aside>
    </>
  );
}
