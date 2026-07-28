"use client";

import React from "react";
import { Card, CardHeader } from "./DetailPrimitives";
import { CONNECTED_INTEGRATIONS, TIMELINE_EVENTS } from "./incidentTemplates.data";

export default function TimelineIntegrationsTab() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Incident Timeline" hint="auto-recorded" />
        <div className="relative pl-5">
          <div className="absolute bottom-1 left-[3px] top-1 w-px bg-zinc-200 dark:bg-zinc-700" />
          {TIMELINE_EVENTS.map((step) => (
            <div key={step} className="relative pb-4 last:pb-0">
              <span className="absolute -left-5 top-1 h-[7px] w-[7px] rounded-full border-2 border-emerald-600 bg-white dark:bg-zinc-900" />
              <span className="text-[13px] text-black dark:text-zinc-200">{step}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Connected Systems" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {CONNECTED_INTEGRATIONS.map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-[12.5px] font-medium text-black dark:border-zinc-700 dark:text-zinc-200"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {i}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
