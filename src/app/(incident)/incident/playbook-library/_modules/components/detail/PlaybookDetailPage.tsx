"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Copy,
  Archive,
  ArchiveRestore,
  Pencil,
  Play,
  MoreVertical,
} from "lucide-react";
import {
  CHANGES,
  MODULES,
  PLAYBOOKS,
  ensureGovExtras,
  ensureScope,
  modById,
  pLabel,
} from "../../data";
import { AgentDef, ModuleDef, Playbook, RuleDef, StepDef } from "../../types";
import Dropdown from "@/components/ui/Dropdown";
import { ArchiveModal } from "../LibraryModals";
import ModuleDrawer from "../ModuleDrawer";
import { AgentDrawer, RuleDrawer, StepDrawer } from "./DetailDrawers";
import {
  CompareVersionsModal,
  EditPlaybookModal,
  RequestExecutionModal,
  RestoreVersionModal,
} from "./DetailModals";
import GovernanceSection from "./sections/GovernanceSection";
import ScopeSection from "./sections/ScopeSection";
import CompositionFlowSection from "./sections/CompositionFlowSection";
import AgentsStagesSection from "./sections/AgentsStagesSection";
import PermissionsRulesTypesSection from "./sections/PermissionsRulesTypesSection";
import RecoveryKnowledgeSection from "./sections/RecoveryKnowledgeSection";
import AnalyticsCostSection from "./sections/AnalyticsCostSection";
import IncidentsChangesSection from "./sections/IncidentsChangesSection";
import VersionsSection from "./sections/VersionsSection";
import RelatedHealthSection from "./sections/RelatedHealthSection";
import Button from "@/components/ui/Button1";

const SECTIONS: { id: string; label: string }[] = [
  { id: "governance", label: "Governance" },
  { id: "scope", label: "Where this applies" },
  { id: "composition", label: "Composition" },
  { id: "flow", label: "Execution flow" },
  { id: "agents", label: "AI agents" },
  { id: "stages", label: "Investigation stages" },
  { id: "permissions", label: "Execution permissions" },
  { id: "rules", label: "Operational rules" },
  { id: "types", label: "Incident types" },
  { id: "recovery", label: "Recovery validation" },
  { id: "knowledge", label: "Knowledge generation" },
  { id: "analytics", label: "Analytics" },
  { id: "cost", label: "Cost & ROI" },
  { id: "incidents", label: "Linked incidents" },
  { id: "versions", label: "Version history" },
  { id: "changes", label: "Change approval" },
  { id: "related", label: "Related knowledge" },
  { id: "health", label: "Playbook health" },
];

const STATUS_CLS: Record<Playbook["status"], string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Draft: "bg-amber-50 text-amber-700",
  Disabled: "bg-zinc-100 text-zinc-500",
  Archived: "bg-transparent text-zinc-500 border border-dashed border-zinc-300",
};

function nextDuplicateId(): string {
  return (
    "PB-" +
    String(1000 + PLAYBOOKS.length + Math.floor(Math.random() * 900)).padStart(
      4,
      "0",
    )
  );
}

interface PlaybookDetailPageProps {
  playbookId: string;
  isIncident?: boolean;
}

export default function PlaybookDetailPage({
  playbookId,
  isIncident,
}: PlaybookDetailPageProps): React.JSX.Element {
  const router = useRouter();

  const playbook = useMemo(() => {
    const p = PLAYBOOKS.find((x) => x.id === playbookId);
    return p ? ensureScope(ensureGovExtras(p)) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbookId]);

  const [, setTick] = useState(0);
  const [activeNav, setActiveNav] = useState(SECTIONS[0].id);
  const [validated, setValidated] = useState(false);

  const [openStep, setOpenStep] = useState<StepDef | null>(null);
  const [openAgent, setOpenAgent] = useState<AgentDef | null>(null);
  const [openRule, setOpenRule] = useState<RuleDef | null>(null);
  const [openModule, setOpenModule] = useState<ModuleDef | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showRun, setShowRun] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<string | null>(null);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      let cur = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(`s-${s.id}`);
        if (el && el.getBoundingClientRect().top < 200) cur = s.id;
      }
      setActiveNav(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!playbook) {
    return (
      <div className="max-w-lg mx-auto p-10 text-center">
        <h2 className="font-bold text-lg text-zinc-800 mb-2">
          Playbook not found
        </h2>
        <p className="text-sm text-zinc-500 mb-5">
          It may have been removed, or the link is out of date.
        </p>
        <button
          onClick={() => router.push("/incident/playbook-library")}
          className="px-4 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Back to library
        </button>
      </div>
    );
  }

  const updatePlaybook = (patch: Partial<Playbook>): void => {
    Object.assign(playbook, patch);
    setTick((t) => t + 1);
  };

  const jumpTo = (id: string): void => {
    document.getElementById(`s-${id}`)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(id);
  };

  const handleDuplicate = (): void => {
    const copy: Playbook = {
      ...JSON.parse(JSON.stringify(playbook)),
      id: nextDuplicateId(),
      name: `${playbook.name} (copy)`,
      status: "Draft",
      version: "v0.1",
      executed: 0,
      updated: "Just now",
    };
    PLAYBOOKS.push(copy);
    toast.success(`Duplicated as ${copy.name} — created as draft`);
    router.push("/incident/playbook-library");
  };

  const handleArchiveConfirm = (): void => {
    const restoring = playbook.status === "Archived";
    updatePlaybook({ status: restoring ? "Draft" : "Archived" });
    toast.success(
      restoring
        ? `${playbook.name} restored as draft`
        : `${playbook.name} archived — audit trail preserved`,
    );
    setArchiving(false);
  };

  return (
    <main className="max-w-[1200px] mx-auto p-4 sm:p-6 pb-24 font-ibm">
      {/* breadcrumb + actions */}
      {!isIncident && (
        <div className="flex items-center gap-3 flex-wrap mb-6 sticky top-0  backdrop-blur z-30 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-zinc-100">
          <button
            onClick={() => router.push("/incident/playbook-library")}
            className="text-sm text-zinc-500 hover:text-zinc-800 font-medium transition-colors"
          >
            Playbook library
          </button>
          <ChevronRight size={13} className="text-zinc-300 shrink-0" />
          <span className="text-sm font-semibold text-zinc-900 truncate">
            {playbook.name}
          </span>
        </div>
      )}

      {/* hero */}
      <div className="mb-7 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-bold text-[26px] text-zinc-900 tracking-tight">
              {playbook.name}
            </h1>
          </div>
          <p className="text-sm text-zinc-500 max-w-3xl mt-3 leading-relaxed">
            {playbook.desc}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Dropdown
            position="bottom"
            align="right"
            trigger={
              <button className="w-8 h-8 rounded-lg border flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors">
                <MoreVertical size={16} />
              </button>
            }
            items={[
              {
                value: "run",
                label: "Request execution",
                icon: <Play size={14} />,
                onClick: () => setShowRun(true),
              },
              {
                value: "dup",
                label: "Duplicate",
                icon: <Copy size={14} />,
                onClick: handleDuplicate,
              },
              {
                value: "arc",
                label: playbook.status === "Archived" ? "Restore" : "Archive",
                icon:
                  playbook.status === "Archived" ? (
                    <ArchiveRestore size={14} />
                  ) : (
                    <Archive size={14} />
                  ),
                onClick: () => setArchiving(true),
              },
            ]}
          />
          <Button onClick={() => setShowEdit(true)} size="sm">
            Edit playbook
          </Button>
        </div>
      </div>

      {/* index nav + sections */}
      <div className="grid grid-cols-1 lg:grid-cols-[196px_1fr] gap-8 items-start">
        <nav className="hidden lg:flex flex-col gap-0.5 sticky top-[86px] bg-white rounded-lg py-4 pl-3 shadow-sm shadow-light">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => jumpTo(s.id)}
              className={`text-left text-[12.5px] px-2.5 py-1.5 border-l-2 transition-colors ${
                activeNav === s.id
                  ? "text-zinc-900 font-semibold border-zinc-900"
                  : "text-zinc-500 border-zinc-200 hover:text-zinc-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          <GovernanceSection
            playbook={playbook}
            onJumpToRules={() => jumpTo("rules")}
            onUpdate={updatePlaybook}
          />
          <ScopeSection playbook={playbook} onUpdate={updatePlaybook} />
          <CompositionFlowSection
            playbook={playbook}
            onOpenModule={(id) => setOpenModule(modById(id) ?? null)}
            onOpenStep={setOpenStep}
          />
          <AgentsStagesSection onOpenAgent={setOpenAgent} />
          <PermissionsRulesTypesSection
            playbook={playbook}
            onOpenRule={setOpenRule}
          />
          <RecoveryKnowledgeSection
            validated={validated}
            onRunValidation={() => setValidated(true)}
          />
          <AnalyticsCostSection playbook={playbook} />
          <IncidentsChangesSection playbook={playbook} />
          <VersionsSection
            onRestore={setRestoreVersion}
            onCompare={setCompareVersion}
          />
          <RelatedHealthSection
            playbook={playbook}
            onRequestReview={() =>
              toast.success(
                `Governance review requested — routed to ${playbook.approvers.join(" and ")}`,
              )
            }
          />
        </div>
      </div>

      {/* drawers */}
      <StepDrawer
        step={openStep}
        playbook={playbook}
        onClose={() => setOpenStep(null)}
        onOpenModule={(id) => {
          setOpenStep(null);
          setOpenModule(modById(id) ?? null);
        }}
      />
      <AgentDrawer agent={openAgent} onClose={() => setOpenAgent(null)} />
      <RuleDrawer rule={openRule} onClose={() => setOpenRule(null)} />
      <ModuleDrawer
        module={openModule}
        onClose={() => setOpenModule(null)}
        onPublish={(id) => {
          const m = MODULES.find((x) => x.id === id);
          if (!m) return;
          const [maj, min] = m.ver.split(".");
          m.ver = `${maj}.${Number(min) + 1}`;
          setOpenModule({ ...m });
          toast.success(
            "Module update submitted — propagates to dependent playbooks after approval",
          );
        }}
      />

      {/* modals */}
      <EditPlaybookModal
        isOpen={showEdit}
        playbook={playbook}
        onClose={() => setShowEdit(false)}
        onSave={(patch, change) => {
          updatePlaybook(patch);
          CHANGES.unshift(change);
          setShowEdit(false);
          toast.success(
            "Change submitted for approval — recorded in the change ledger",
          );
        }}
      />
      <RequestExecutionModal
        isOpen={showRun}
        playbook={playbook}
        onClose={() => setShowRun(false)}
        onSubmit={() => {
          setShowRun(false);
          toast.success(
            `Execution request sent to ${playbook.approvers.join(" and ")} — rule validation in progress`,
          );
        }}
      />
      <ArchiveModal
        playbook={archiving ? playbook : null}
        onClose={() => setArchiving(false)}
        onConfirm={handleArchiveConfirm}
      />
      <RestoreVersionModal
        version={restoreVersion}
        playbook={playbook}
        onClose={() => setRestoreVersion(null)}
        onConfirm={(v) => {
          setRestoreVersion(null);
          toast.success(
            `Restore of ${v} submitted for approval — audit entry created`,
          );
        }}
      />
      <CompareVersionsModal
        version={compareVersion}
        playbook={playbook}
        onClose={() => setCompareVersion(null)}
      />
    </main>
  );
}
