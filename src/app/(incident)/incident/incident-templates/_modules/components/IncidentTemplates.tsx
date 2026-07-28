"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/IMS/DashboardHeader";
import Overview from "./Overview";
import AllTemplates from "./AllTemplates";
import Detail from "./Detail";
import CreateTemplateWizard from "./CreateTemplateWizard";
import { TEMPLATES as SEED_TEMPLATES, TemplateRecord } from "./incidentTemplates.data";

type View = "dashboard" | "table" | "detail" | "wizard";

export default function IncidentTemplates() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(SEED_TEMPLATES);
  const [view, setView] = useState<View>("dashboard");
  const [selected, setSelected] = useState<TemplateRecord | null>(null);

  function openDetail(name: string) {
    const match = templates.find((t) => t.name === name);
    if (!match) {
      toast.error(`Couldn't find "${name}"`);
      return;
    }
    setSelected(match);
    setView("detail");
  }

  function publishTemplate(record: TemplateRecord) {
    setTemplates((prev) => [record, ...prev]);
    setView("table");
  }

  return (
    <div className="flex h-screen flex-col bg-white font-ibm dark:bg-zinc-950">
      <Header title="Incident Templates" />
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/20">
        {view === "dashboard" && (
          <Overview
            templates={templates}
            onViewAll={() => setView("table")}
            onNewTemplate={() => setView("wizard")}
            onOpenTemplate={openDetail}
          />
        )}
        {view === "table" && (
          <AllTemplates
            templates={templates}
            onOpenTemplate={openDetail}
            onNewTemplate={() => setView("wizard")}
            onBackToOverview={() => setView("dashboard")}
          />
        )}
        {view === "detail" && selected && (
          <Detail
            key={selected.name}
            template={selected}
            templates={templates}
            onOpenTemplate={openDetail}
            onBackToOverview={() => setView("dashboard")}
          />
        )}
        {view === "wizard" && (
          <CreateTemplateWizard
            templates={templates}
            onCancel={() => setView("dashboard")}
            onPublish={publishTemplate}
          />
        )}
      </div>
    </div>
  );
}
