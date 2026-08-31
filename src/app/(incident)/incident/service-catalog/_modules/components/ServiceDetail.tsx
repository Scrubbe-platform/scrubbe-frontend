"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { EalPill, HealthBadge, TierBadge } from "./ServiceCatalogPrimitives";
import { ServiceRecord, ealOf, updateService } from "./serviceCatalog.data";
import { EditServiceForm, ServicePatch } from "./EditServiceForm";
import {
  NAV_SECTIONS,
  CurrentStateSection,
  OperationalImpactSection,
  AutomationReadinessSection,
  OverviewSection,
  BusinessCapabilitiesSection,
  BlastRadiusSection,
  OperationalReadinessSection,
  OperationalCommunicationSection,
  ServiceHealthSection,
  IncidentOrchestrationSection,
  OwnershipSection,
  DependenciesSection,
  RecoverySection,
  FailurePatternsSection,
  TimelineSection,
  RuntimeSection,
  RepositoriesSection,
  ActivitySection,
  EnvironmentsSection,
  SlaSection,
  IncidentHistorySection,
  SignalGraphSection,
  AiInsightsSection,
  RulesSection,
  PlaybooksSection,
  RelatedSection,
  IntegrationsSection,
  AnalyticsSection,
  GovernanceSection,
  AuditLogSection,
} from "./DetailSections";

export default function ServiceDetail({
  service,
  onBack,
  onOpenService,
}: {
  service: ServiceRecord;
  onBack: () => void;
  onOpenService: (name: string) => void;
}) {
  const e = ealOf(service);
  const [active, setActive] = useState(NAV_SECTIONS[0][0]);
  const [editOpen, setEditOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  function handleSaveService(patch: ServicePatch) {
    updateService(service.id, patch);
    setEditOpen(false);
    forceUpdate((n) => n + 1);
    toast.success(`Saved changes to "${patch.name}"`);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = NAV_SECTIONS.map(([id]) =>
      root.querySelector<HTMLElement>(`#s-${id}`),
    ).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((en) => en.isIntersecting);
        if (visible.length) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActive(top.target.id.replace("s-", ""));
        }
      },
      { rootMargin: "-112px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [service.id]);

  return (
    <div ref={rootRef} className="mx-auto max-w-[1600px] p-4 font-ibm sm:p-6">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
        <button
          onClick={onBack}
          className="hover:text-black dark:hover:text-zinc-200"
        >
          Overview
        </button>
        <ChevronRight size={13} />
        <span className="font-semibold text-black dark:text-zinc-200">
          {service.name}
        </span>
      </div>

      <div className="mb-5 rounded-lg bg-white p-6 shadow-sm shadow-light dark:bg-zinc-900/40 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[24px] font-bold leading-tight text-black dark:text-zinc-100">
                {service.name}
              </h1>
            </div>
            <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-black/60 dark:text-zinc-400">
              Handles {service.name.toLowerCase()} operations in{" "}
              {service.env.toLowerCase()}, running on {service.runtime} in{" "}
              {service.cloud} ({service.region}).
            </p>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
              <Meta k="Service ID" v={service.id} mono />
              <Meta k="Owner team" v={service.owner} />
              <Meta k="Version" v={`v${service.version}`} mono />
              <Meta
                k="Created"
                v={
                  service.createdYearsAgo === 0
                    ? "Just now"
                    : `${service.createdYearsAgo} yr${service.createdYearsAgo > 1 ? "s" : ""} ago`
                }
              />
              <Meta k="Language" v={service.lang} />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() =>
                toast.info(`Running a health scan for ${service.name}…`)
              }
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Run health scan
            </button>
            <button
              onClick={() =>
                toast.info(
                  `Re-evaluating automation level for ${service.name}…`,
                )
              }
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              Re-evaluate
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-md bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700"
            >
              Edit service
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="top-20 hidden max-h-[calc(100vh-100px)] overflow-y-auto rounded-lg bg-white p-2.5 shadow-sm shadow-light dark:bg-zinc-900/40 lg:sticky lg:block">
          {NAV_SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#s-${id}`}
              className={cn(
                "block truncate rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors",
                active === id
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "text-black/55 hover:bg-zinc-50 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-5">
          <CurrentStateSection service={service} defaultOpen />
          <OperationalImpactSection service={service} defaultOpen />
          <AutomationReadinessSection service={service} defaultOpen />
          <OverviewSection service={service} defaultOpen />
          <BusinessCapabilitiesSection service={service} />
          <BlastRadiusSection service={service} />
          <OperationalReadinessSection service={service} />
          <OperationalCommunicationSection service={service} />
          <ServiceHealthSection service={service} defaultOpen />
          <IncidentOrchestrationSection service={service} />
          <OwnershipSection service={service} />
          <DependenciesSection
            service={service}
            onOpenService={onOpenService}
          />
          <RecoverySection service={service} />
          <FailurePatternsSection service={service} />
          <TimelineSection service={service} />
          <RuntimeSection service={service} />
          <RepositoriesSection service={service} />
          <ActivitySection service={service} />
          <EnvironmentsSection service={service} />
          <SlaSection service={service} />
          <IncidentHistorySection service={service} />
          <SignalGraphSection service={service} />
          <AiInsightsSection service={service} />
          <RulesSection service={service} />
          <PlaybooksSection service={service} />
          <RelatedSection service={service} />
          <IntegrationsSection service={service} />
          <AnalyticsSection service={service} />
          <GovernanceSection service={service} />
          <AuditLogSection service={service} />
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)}>
        <EditServiceForm
          service={service}
          onSave={handleSaveService}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  );
}

function Meta({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {k}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[13px] font-semibold text-black dark:text-zinc-100",
          mono && "font-ibm",
        )}
      >
        {v}
      </div>
    </div>
  );
}
