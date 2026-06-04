"use client";
import CButton from "@/components/ui/Cbutton";
import React, { ReactNode } from "react";

const FormWrapper = ({
  title,
  subtitle,
  label,
  children,
  actionText,
  action,
}: {
  title: string;
  subtitle: string;
  label: string;
  children: ReactNode;
  actionText?: ReactNode;
  action?: () => void;
}) => (
  <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 overflow-hidden">
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
      <div className="space-y-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
          {title}
        </h2>
        <p className="text-[14px] font-semibold text-black dark:text-zinc-100">
          {subtitle}
        </p>
        <p className="text-[12px] text-black dark:text-zinc-400 max-w-lg leading-relaxed">
          {label}
        </p>
      </div>
      {actionText && (
        <CButton
          onClick={action}
          className="border border-zinc-500 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 w-fit h-8 shrink-0"
        >
          {actionText}
        </CButton>
      )}
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

export default FormWrapper;