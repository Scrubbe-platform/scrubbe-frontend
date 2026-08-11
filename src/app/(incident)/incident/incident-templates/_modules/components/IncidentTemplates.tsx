"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/IMS/DashboardHeader";
import Overview from "./Overview";
import AllTemplates from "./AllTemplates";
import Detail from "./Detail";
import CreateTemplateWizard from "./CreateTemplateWizard";
import { TEMPLATES as SEED_TEMPLATES, TemplateRecord, TemplateStatus } from "./incidentTemplates.data";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

function mapApiTemplate(api: any): TemplateRecord {
  const statusRaw = (api.status ?? "DRAFT").toUpperCase();
  const status: TemplateStatus = statusRaw === "ACTIVE" ? "Active" : statusRaw === "ARCHIVED" ? "Archived" : "Draft";
  return {
    name: api.name ?? "Unnamed Template",
    cat: api.category ?? api.cat ?? api.type ?? "Application",
    agents: api.agentCount ?? api.agents ?? 0,
    playbooks: api.playbookCount ?? api.playbooks ?? 0,
    rules: api.ruleCount ?? api.rules ?? 0,
    usage: api.usageCount ?? api.usage ?? 0,
    status,
    updated: api.updatedAt ? new Date(api.updatedAt).toLocaleDateString() : "—",
    _id: api.id,
  } as TemplateRecord & { _id?: string };
}

type View = "dashboard" | "table" | "detail" | "wizard";

export default function IncidentTemplates() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(SEED_TEMPLATES);

  useEffect(() => {
    customAxios.get(endpoint.incident_templates.list).then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        setTemplates(list.map(mapApiTemplate));
      }
    }).catch(() => {});
  }, []);
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

  async function submitTemplate(record: TemplateRecord) {
    if (editingTemplate) {
      setTemplates((prev) => prev.map((t) => (t.name === editingTemplate.name ? record : t)));
      setSelected(record);
      setEditingTemplate(null);
      setView("detail");
      const existingId = (editingTemplate as any)._id;
      if (existingId) {
        try {
          await customAxios.put(`${endpoint.incident_templates.update}/${existingId}`, record);
        } catch { /* optimistic — already updated locally */ }
      }
    } else {
      // Optimistic add
      setTemplates((prev) => [record, ...prev]);
      setView("table");
      try {
        const res = await customAxios.post(endpoint.incident_templates.create, record);
        const created = res.data?.data ?? res.data;
        if (created?.id) {
          // Update the local record with the real API id
          setTemplates((prev) => prev.map((t) => t.name === record.name ? { ...t, _id: created.id } as any : t));
        }
      } catch { /* optimistic — already added locally */ }
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
