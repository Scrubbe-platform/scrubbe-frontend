import React, { ReactNode } from "react";

interface SectionShellProps {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  emphasize?: boolean;
  children: ReactNode;
}

export default function SectionShell({
  id,
  eyebrow,
  title,
  sub,
  emphasize,
  children,
}: SectionShellProps): React.JSX.Element {
  return (
    <section
      id={`s-${id}`}
      className={`rounded-xl bg-white p-6 mb-4 scroll-mt-32 ${
        emphasize ? "shadow-md shadow-light" : "shadow-sm shadow-light"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {eyebrow}
      </div>
      <h2 className="font-bold text-[17px] text-zinc-900 mt-1">{title}</h2>
      {sub && <p className="text-sm text-zinc-500 mt-1 mb-4">{sub}</p>}
      {children}
    </section>
  );
}
