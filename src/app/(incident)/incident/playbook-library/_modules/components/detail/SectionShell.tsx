import React, { ReactNode } from "react";

interface SectionShellProps {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  emphasize?: boolean;
  /** Marks a section whose content isn't backed by a real endpoint yet — shows a small badge so it isn't mistaken for live data. */
  illustrative?: boolean;
  children: ReactNode;
}

export function IllustrativeBadge(): React.JSX.Element {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
      Illustrative preview
    </span>
  );
}

export default function SectionShell({
  id,
  eyebrow,
  title,
  sub,
  emphasize,
  illustrative,
  children,
}: SectionShellProps): React.JSX.Element {
  return (
    <section
      id={`s-${id}`}
      className={`rounded-xl bg-white dark:bg-zinc-900/40 p-6 mb-4 scroll-mt-32 ${
        emphasize ? "shadow-md shadow-light" : "shadow-sm shadow-light"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {eyebrow}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <h2 className="font-bold text-[17px] text-zinc-900 dark:text-zinc-100">{title}</h2>
        {illustrative && <IllustrativeBadge />}
      </div>
      {sub && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-4">{sub}</p>}
      {children}
    </section>
  );
}
