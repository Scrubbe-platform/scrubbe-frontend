"use client";

import React, { ReactNode, useState } from "react";
import {
  Bell,
  BookOpen,
  Info,
  Layout,
  Phone,
  Shield,
  ShieldCheck,
  Workflow,
  WorkflowIcon,
  Zap,
} from "lucide-react";
import { BiGitBranch } from "react-icons/bi";
import { FiGitPullRequest } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCodeSlash } from "react-icons/io5";
import { LuClock2 } from "react-icons/lu";
import { PiSpiral } from "react-icons/pi";
import { TiFlowMerge } from "react-icons/ti";
import SideModal from "@/components/ui/SideModal";
import Pipeline from "./_modules/components/Pipeline";
import ConfidenceSidebar from "./_modules/components/ConfidenceSidebar";
import CodeEngineRecommendation from "./_modules/components/code-engine-recommendation";
import IncidentRouteShell from "@/components/IMS/incident/IncidentRouteShell";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

const priorityLabel = (priority?: string) => {
  if (!priority) return "P3";
  if (priority === "CRITICAL") return "P1";
  if (priority === "HIGH") return "P2";
  if (priority === "MEDIUM") return "P3";
  return "P4";
};

function IncidentOverview({
  activeIncident,
}: {
  activeIncident: IncidentDetailRecord;
}) {
  const [openPipeline, setOpenPipeline] = useState(false);
  const { get } = useFetch();

  const { data: analysis } = useQuery({
    queryKey: ["ezra-analysis-code-engine", activeIncident.id],
    queryFn: async () => {
      const res = await get(`${endpoint.ezra.analysis}/${activeIncident.id}`);
      if (res.success) return res.data?.data ?? null;
      return null;
    },
    enabled: !!activeIncident.id,
    refetchOnWindowFocus: false,
  });

  const remediation = analysis?.remediation;
  const confidence = remediation?.confidence ?? analysis?.situation?.confidence ?? undefined;

  const serviceName =
    activeIncident.service || activeIncident.affectedSystem || "service";
  const blastRadiusLabel =
    activeIncident.blastRadius ||
    [activeIncident.service, activeIncident.region].filter(Boolean).join(" / ") ||
    "Scoped incident";
  const insightText =
    activeIncident.aiAnalysis?.suggestion ||
    activeIncident.impactSummary ||
    activeIncident.techDescription ||
    activeIncident.description ||
    "Scrubbe is still collecting enough context to recommend a remediation path.";
  const runbookSuggestion =
    activeIncident.recommendedActions[0] ||
    activeIncident.category ||
    "No specific runbook recommendation is available yet.";
  const isDeploymentAware = /deploy|pipeline|ci\/cd|rollback|release/i.test(
    `${activeIncident.sourceType ?? ""} ${activeIncident.detection ?? ""} ${
      activeIncident.title ?? ""
    }`
  );

  return (
    <div className="min-h-screen p-6 font-sans text-slate-300 selection:bg-green-500/30">
      <div className="relative mx-auto flex flex-col gap-6 md:flex-row">
        <main className="flex-1 space-y-6">
          <section className="flex flex-col items-start justify-between gap-3 md:flex-row">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tighter text-white">
                  {activeIncident.ticketId}
                </h1>
                <span className="rounded border border-rose-500/30 bg-rose-500 px-2 py-0.5 text-[10px] uppercase text-black">
                  {priorityLabel(activeIncident.priority)} •{" "}
                  {activeIncident.status || "Open"}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {activeIncident.reason ||
                  activeIncident.summary ||
                  "Select an incident from the sidebar to view details."}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-IMSCyan px-4 py-2 text-xs text-IMSCyan transition-all">
                <Bell size={14} /> Notify
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-green-400 px-4 py-2 text-xs text-black transition-all hover:bg-green-300">
                <Phone size={14} /> Declare Incident
              </button>
            </div>
          </section>

          <section className="grid gap-4 overflow-hidden md:grid-cols-4">
            <StatBox label="Org MTTR (last 30 days)" value="27m" />
            <StatBox
              label="This incident"
              value={`${activeIncident.elapsedLabel} elapsed`}
              valueClass="text-yellow-500"
            />
            <StatBox
              label={`${serviceName} SLO`}
              value={activeIncident.environment || "Live environment"}
              sub={`Region: ${activeIncident.region || "global"}`}
              subClass="text-rose-500"
            />
            <StatBox
              label="Current blast radius"
              value={blastRadiusLabel}
              sub={activeIncident.ticketId}
              subIcon={<BiGitBranch size={16} />}
            />
          </section>

          <section className="space-y-3 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
            <div className="flex items-center gap-2">
              <Zap size={16} fill="currentColor" className="text-yellow-400" />
              <span className="text-sm font-bold uppercase tracking-widest">
                Scrubbe Insight •{" "}
                {Math.max(activeIncident.score || 0, activeIncident.riskScore || 0) || 94}
                % confidence
              </span>
            </div>
            <p className="text-sm text-slate-300">{insightText}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<PiSpiral size={16} />}
              title="SLO & error budget"
              desc={
                <div>
                  <p>
                    {activeIncident.ticketId} is currently scoped against{" "}
                    <span className="text-green">{serviceName}</span> in{" "}
                    {activeIncident.environment || "the live environment"}.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <p>Open SLO Context</p>
                    <GiHamburgerMenu className="text-IMSCyan" />
                  </div>
                </div>
              }
            />
            <InfoCard
              icon={<Workflow size={16} />}
              title="Blast radius snapshot"
              desc={
                <div>
                  <p>
                    Impacted: <span className="text-green">{blastRadiusLabel}</span>.
                    No confirmed cross-service spread is recorded beyond the
                    current incident context.
                  </p>
                  <p className="mt-2">
                    Source: {activeIncident.sourceType || "manual"} / Status:{" "}
                    {activeIncident.status}
                  </p>
                </div>
              }
            />
            <InfoCard
              icon={<BookOpen size={16} />}
              title="Runbook suggestion"
              desc={runbookSuggestion}
            />
          </section>

          <section>
            <CodeEngineRecommendation
              incidentId={activeIncident.id}
              service={activeIncident.service ?? activeIncident.affectedSystem}
              environment={activeIncident.environment}
              severity={activeIncident.severity}
              confidence={confidence}
              playbook={analysis?.remediation?.playbook}
              patternMatch={analysis?.rootCause?.hypothesis}
            />
          </section>

          <section className="space-y-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield size={16} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Code Intelligence Engine • Live incident context
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <FixTag icon={<BiGitBranch size={14} />} label="Diff-aware reasoning" />
              <FixTag icon={<BookOpen size={14} />} label="Pattern matching" />
              <FixTag icon={<ShieldCheck size={14} />} label="Env guardrails" />
              <FixTag icon={<WorkflowIcon size={14} />} label="Remediation workflow" />
              <FixTag icon={<TiFlowMerge size={14} />} label="Multi-step execution" />
              <FixTag icon={<IoCodeSlash size={14} />} label="Developer tooling" />
              <FixTag icon={<LuClock2 size={14} />} label="Confidence model" />
              <FixTag icon={<FiGitPullRequest size={14} />} label="Change review" />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
            <div className="flex items-center gap-2 text-orange-400">
              <Info size={16} />
              <span className="text-xs font-black uppercase tracking-widest">
                {isDeploymentAware
                  ? "Code Intelligence has deployment context"
                  : "Code Intelligence is waiting for clearer deploy context"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {isDeploymentAware
                ? `This incident already carries enough source context (${activeIncident.sourceType || "incident source"}) for Code Intelligence to reason about a safer remediation path for ${serviceName}.`
                : "This incident is not yet strongly tied to a failed CI/CD deployment, so Scrubbe stays in guidance mode instead of proposing a code diff."}
            </p>
            <ul className="space-y-2">
              {[
                `Review ${serviceName} telemetry and signal correlations first.`,
                activeIncident.recommendedActions[0] ||
                  `Check the most recent changes affecting ${serviceName}.`,
                `Use ${activeIncident.ticketId} in the shared workspace timeline to confirm blast radius before execution.`,
              ].map((text, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-xs font-medium text-slate-500"
                >
                  <div className="h-1 w-1 rounded-full bg-slate-700" /> {text}
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={() => setOpenPipeline(true)}
            className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 text-xs font-bold text-green-400 transition-all hover:bg-green-500/10"
          >
            <Layout size={14} /> View Pipeline {activeIncident.ticketId}
          </button>
        </main>

        <aside className="md:w-72">
          <ConfidenceSidebar
            confidence={typeof confidence === "number" ? Math.round(confidence * 100) : undefined}
            riskLevel={analysis?.rootCause?.riskLevel ?? activeIncident.priority ?? "MEDIUM"}
            approvalMode={analysis?.remediation?.approvalMode ?? "HUMAN_REQUIRED"}
            reasoningSummary={analysis?.rootCause?.hypothesis}
            playbook={analysis?.remediation?.playbook}
            patternMatch={analysis?.rootCause?.pattern}
            incident={activeIncident.ticketId}
          />
        </aside>
      </div>

      {openPipeline ? (
        <SideModal title="" isOpen={openPipeline} onClose={() => setOpenPipeline(false)}>
          <Pipeline />
        </SideModal>
      ) : null}
    </div>
  );
}

export default function CodeEnginePage() {
  return (
    <IncidentRouteShell title="Code Engine">
      {(incident) => <IncidentOverview activeIncident={incident} />}
    </IncidentRouteShell>
  );
}

const StatBox = ({
  label,
  value,
  sub,
  subClass,
  valueClass = "text-white",
  subIcon,
}: {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  valueClass?: string;
  subIcon?: ReactNode;
}) => (
  <div className="flex flex-col justify-between rounded-xl border border-slate-400 p-5">
    <span className="text-[9px] font-bold uppercase text-slate-500">{label}</span>
    <div className="space-y-1">
      <div className={`text-lg font-black ${valueClass}`}>{value}</div>
      {sub ? (
        <div
          className={`flex items-center gap-1 text-[10px] font-bold ${
            subClass || "text-slate-500"
          }`}
        >
          {subIcon} {sub}
        </div>
      ) : null}
    </div>
  </div>
);

const InfoCard = ({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string | ReactNode;
}) => (
  <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
    <div className="flex items-center gap-2 text-slate-200">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {title}
      </span>
    </div>
    <p className="text-[11px] leading-relaxed text-slate-500">{desc}</p>
  </div>
);

const FixTag = ({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) => (
  <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold text-slate-500 transition-all hover:border-emerald-500/30">
    {icon}
    {label}
  </div>
);
