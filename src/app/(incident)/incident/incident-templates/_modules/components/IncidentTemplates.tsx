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
  const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);

  function openDetail(name: string) {
    const match = templates.find((t) => t.name === name);
    if (!match) {
      toast.error(`Couldn't find "${name}"`);
      return;
    }
    setSelected(match);
    setView("detail");
  }

  function openCreateWizard() {
    setEditingTemplate(null);
    setView("wizard");
  }

  function openEditWizard(template: TemplateRecord) {
    setEditingTemplate(template);
    setView("wizard");
  }

  function duplicateTemplate(t: TemplateRecord) {
    const base = t.name.replace(/ \(copy( \d+)?\)$/, "");
    let n = 1;
    let newName = `${base} (copy)`;
    while (templates.some((x) => x.name === newName)) {
      n++;
      newName = `${base} (copy ${n})`;
    }
    const clone: TemplateRecord = { ...t, name: newName, status: "Draft", usage: 0, updated: "just now" };
    setTemplates((prev) => [clone, ...prev]);
    setSelected(clone);
    toast.success(`Duplicated as "${newName}"`);
  }

  function submitTemplate(record: TemplateRecord) {
    if (editingTemplate) {
      setTemplates((prev) => prev.map((t) => (t.name === editingTemplate.name ? record : t)));
      setSelected(record);
      setEditingTemplate(null);
      setView("detail");
    } else {
      setTemplates((prev) => [record, ...prev]);
      setView("table");
    }
  }

  function cancelWizard() {
    if (editingTemplate) {
      setSelected(editingTemplate);
      setEditingTemplate(null);
      setView("detail");
    } else {
      setView("dashboard");
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white font-ibm dark:bg-zinc-950">
      <Header title="Incident Templates" />
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/20">
        {view === "dashboard" && (
          <Overview
            templates={templates}
            onViewAll={() => setView("table")}
            onNewTemplate={openCreateWizard}
            onOpenTemplate={openDetail}
          />
        )}
        {view === "table" && (
          <AllTemplates
            templates={templates}
            onOpenTemplate={openDetail}
            onNewTemplate={openCreateWizard}
            onBackToOverview={() => setView("dashboard")}
          />
        )}
        {view === "detail" && selected && (
          <Detail
            key={selected.name}
            template={selected}
            templates={templates}
            onOpenTemplate={openDetail}
            onEditTemplate={openEditWizard}
            onDuplicate={duplicateTemplate}
            onBackToOverview={() => setView("dashboard")}
          />
        )}
        {view === "wizard" && (
          <CreateTemplateWizard
            templates={templates}
            editing={editingTemplate}
            onCancel={cancelWizard}
            onSubmit={submitTemplate}
          />
        )}
      </div>
    </div>
  );
}
