"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader, Chip } from "./DetailPrimitives";
import { TemplateRecord, relatedTemplates, sharedAgentTemplates } from "./incidentTemplates.data";

export default function DependenciesTab({
  template,
  templates,
  onOpenTemplate,
}: {
  template: TemplateRecord;
  templates: TemplateRecord[];
  onOpenTemplate: (name: string) => void;
}) {
  const related = relatedTemplates(template, templates);
  const shared = sharedAgentTemplates(template, templates);
  const upstream = related[0]?.name ?? "External Monitoring Alert";
  const downstream = related[1]?.name ?? "Postmortem Review";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Trigger Chain" hint="how incidents commonly escalate" />
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenTemplate(upstream)}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {upstream}
          </button>
          <ChevronRight size={16} className="shrink-0 text-black/25 dark:text-zinc-600" />
          <div className="rounded-lg bg-zinc-900 px-4 py-2.5 text-[12.5px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {template.name}
          </div>
          <ChevronRight size={16} className="shrink-0 text-black/25 dark:text-zinc-600" />
          <button
            onClick={() => onOpenTemplate(downstream)}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {downstream}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Shares Agents With" />
          <div className="flex flex-wrap gap-2">
            {shared.length ? (
              shared.map((s) => (
                <Chip key={s.name} onClick={() => onOpenTemplate(s.name)}>
                  {s.name}
                </Chip>
              ))
            ) : (
              <span className="text-[12.5px] text-black/40 dark:text-zinc-500">
                No overlapping agents found.
              </span>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Related Templates" hint="same category" />
          <div className="flex flex-wrap gap-2">
            {related.length ? (
              related.slice(0, 6).map((s) => (
                <Chip key={s.name} onClick={() => onOpenTemplate(s.name)}>
                  {s.name}
                </Chip>
              ))
            ) : (
              <span className="text-[12.5px] text-black/40 dark:text-zinc-500">
                This is the only template in its category.
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
