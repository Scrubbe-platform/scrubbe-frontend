"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Modal from "@/components/ui/Modal";
import Overview from "./Overview";
import ServicesTable, { ServicesFilterPreset } from "./ServicesTable";
import Architecture from "./Architecture";
import ServiceDetail from "./ServiceDetail";
import { CreateServiceForm, ServicePatch } from "./EditServiceForm";
import { SERVICES, ServiceRecord, createService } from "./serviceCatalog.data";

type Tab = "overview" | "services" | "architecture" | "detail";
const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "services", label: "Services" },
  { key: "architecture", label: "Topology" },
];

export default function ServiceCatalog() {
  const [tab, setTab] = useState<Tab>("overview");
  const [preset, setPreset] = useState<ServicesFilterPreset | undefined>(undefined);
  const [selected, setSelected] = useState<ServiceRecord | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  function goToServices(p?: ServicesFilterPreset) {
    setPreset(p);
    setTab("services");
  }

  function openServiceDetail(name: string) {
    const match = SERVICES.find((s) => s.name === name);
    if (!match) {
      toast.error(`Couldn't find "${name}"`);
      return;
    }
    setSelected(match);
    setTab("detail");
  }

  function handleCreateService(patch: ServicePatch) {
    const record = createService(patch);
    setAddOpen(false);
    toast.success(`"${record.name}" added to the catalog`);
    setSelected(record);
    setTab("detail");
  }

  return (
    <div className="flex h-screen flex-col bg-white font-ibm dark:bg-zinc-950">
      <Header title="Service Catalog" />
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/20">
        {tab !== "detail" && (
          <div className="mx-auto max-w-[1700px] px-4 pt-4 sm:px-6">
            <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors",
                    tab === t.key
                      ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-black/50 hover:text-black dark:text-zinc-500 dark:hover:text-zinc-200",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "overview" && (
          <Overview
            onOpenTopology={() => setTab("architecture")}
            onOpenServices={goToServices}
            onOpenServiceDetail={openServiceDetail}
            onNewService={() => setAddOpen(true)}
          />
        )}
        {tab === "services" && (
          <ServicesTable
            initialPreset={preset}
            onNewService={() => setAddOpen(true)}
            onOpenServiceDetail={openServiceDetail}
            onBackToOverview={() => setTab("overview")}
          />
        )}
        {tab === "architecture" && <Architecture onBackToOverview={() => setTab("overview")} />}
        {tab === "detail" && selected && (
          <ServiceDetail
            key={selected.id}
            service={selected}
            onBack={() => setTab("overview")}
            onOpenService={openServiceDetail}
          />
        )}
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)}>
        <CreateServiceForm onCreate={handleCreateService} onCancel={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}
