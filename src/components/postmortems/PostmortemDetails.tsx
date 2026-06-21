"use client";
import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import {
  fetchIncidentComments,
  uploadIncidentAttachment,
  fetchIncidentAttachments,
  deleteIncidentAttachment,
} from "@/lib/incident/incident.api";
import {
  ArrowLeft, Share2, FileText, Mail, ChevronDown, ChevronUp,
  Paperclip, Clock, Search, RefreshCw, FileEdit, Users, ShieldCheck,
  Plus, Check, X, Loader2, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "@/lib/stores/auth.store";

// ── Context ───────────────────────────────────────────────────────────────────
interface PmCtx {
  pm: any;
  sections: any[];
  actions: any[];
  auditEvents: any[];
  analysis: any;
  incidentId: string;
  refetch: () => void;
  refetchActions: () => void;
}
const PmCtx = createContext<PmCtx>({
  pm: null, sections: [], actions: [], auditEvents: [], analysis: null,
  incidentId: "", refetch: () => {}, refetchActions: () => {},
});
const usePm = () => useContext(PmCtx);

// ── Helpers ───────────────────────────────────────────────────────────────────
const SEV_MAP: Record<string, string> = { CRITICAL: "P0", HIGH: "P1", MEDIUM: "P2", LOW: "P3" };
const SEV_COLOR: Record<string, string> = {
  P0: "text-red-500", P1: "text-orange-500", P2: "text-amber-500",
  P3: "text-yellow-500", P4: "text-sky-500",
};
const STATUS_STYLES: Record<string, string> = {
  APPROVED: "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400",
  IN_REVIEW: "text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400",
  ARCHIVED: "text-zinc-500 border-zinc-300 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600",
  DRAFT: "text-zinc-600 border-zinc-200 dark:border-zinc-700 dark:text-zinc-400",
};

function mapSev(p?: string) { return SEV_MAP[p?.toUpperCase() ?? ""] ?? "P3"; }
function calcDuration(a?: string, b?: string) {
  if (!a || !b) return "--";
  const m = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60_000);
  return m < 60 ? `${m}m` : `${(m / 60).toFixed(1)}h`;
}
function secBody(sections: any[], type: string): Record<string, any> | null {
  if (!Array.isArray(sections)) return null;
  return sections.find((s) => s.type === type)?.body ?? null;
}
function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── UI primitives ─────────────────────────────────────────────────────────────
const Empty = ({ label = "No data available" }: { label?: string }) => (
  <p className="text-[13px] text-zinc-400 dark:text-zinc-500 italic py-4">{label}</p>
);

const Section = ({ icon, title, children }: {
  icon: React.ReactNode; title: React.ReactNode; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
          {icon} {title}
        </div>
        {open ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

const FieldGrid = ({ fields }: { fields: [string, React.ReactNode][] }) => (
  <div className="grid grid-cols-4 gap-0 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
    {fields.map(([label, value], i) => (
      <div
        key={i}
        className={`px-4 py-4 border-r border-b border-zinc-100 dark:border-zinc-800 last:border-r-0 ${
          i >= fields.length - (fields.length % 4 || 4) ? "border-b-0" : ""
        }`}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
        <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
      </div>
    ))}
  </div>
);

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  "Incident Overview", "Timeline", "Root cause analysis", "Lessons learned",
  "Signal Correlation graph", "Investigation Record", "Remediation",
  "Corrective Actions", "Collaboration", "Playbook Updates",
  "Governance and Audit", "Attachments",
] as const;
type TabId = (typeof TABS)[number];

// ── Tab: Incident Overview ────────────────────────────────────────────────────
const TabIncidentOverview = () => {
  const { pm, sections } = usePm();
  const ticket = pm?.ticket;
  const bi = secBody(sections, "BUSINESS_IMPACT") as any;
  const sev = mapSev(ticket?.priority);

  return (
    <>
      <Section icon={<FileText size={16} />} title="Incident Overview">
        <FieldGrid
          fields={[
            ["Incident ID", <span className="font-bold">{ticket?.ticketId ?? pm?.ticketId ?? "--"}</span>],
            ["Severity", <span className={`font-bold ${SEV_COLOR[sev] ?? ""}`}>{sev} — {ticket?.priority ?? "Unknown"}</span>],
            ["Status", <span className="text-emerald-500 font-bold">{ticket?.status ?? "--"}</span>],
            ["Environment", ticket?.environment ?? "--"],
            ["Service Area", ticket?.serviceArea ?? ticket?.affectedSystem ?? "--"],
            ["Duration", calcDuration(ticket?.createdAt, ticket?.resolvedAt)],
            ["Affected System", ticket?.affectedSystem ?? "--"],
            ["Author", pm?.author ? `${pm.author.firstName} ${pm.author.lastName}`.trim() : "--"],
          ]}
        />
      </Section>

      <Section icon={<FileText size={16} />} title="Business Impact">
        {bi ? (
          <div className="grid grid-cols-4 gap-4">
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Affected Services</p>
              <ul className="space-y-1">
                {Array.isArray(bi.affectedServices) && bi.affectedServices.length > 0
                  ? bi.affectedServices.map((s: string) => (
                      <li key={s} className="flex items-center gap-1.5 text-[13px] text-zinc-700 dark:text-zinc-300">
                        <span className="w-1 h-1 rounded-full bg-zinc-400 shrink-0" /> {s}
                      </li>
                    ))
                  : <li className="text-[13px] text-zinc-400">—</li>}
              </ul>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Affected Users</p>
              <p className="text-[32px] font-black text-zinc-900 dark:text-zinc-100">{bi.affectedUsers ?? "--"}</p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Revenue Impact</p>
              <p className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100">{bi.revenueImpact ?? "--"}</p>
              {bi.revenueEst && <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{bi.revenueEst}</p>}
            </div>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">SLA Impact</p>
              <p className={`text-[18px] font-bold ${bi.slaImpact?.toLowerCase().includes("no") ? "text-emerald-500" : "text-orange-500"}`}>
                {bi.slaImpact ?? "--"}
              </p>
              {bi.slaUptime && <p className="text-[12px] text-zinc-400 dark:text-zinc-500">› {bi.slaUptime}</p>}
            </div>
          </div>
        ) : (
          <Empty label="Business impact section not yet authored for this postmortem." />
        )}
      </Section>
    </>
  );
};

// ── Tab: Timeline ─────────────────────────────────────────────────────────────
const TabTimeline = () => {
  const { sections, auditEvents } = usePm();
  const body = secBody(sections, "TIMELINE") as any;
  const sectionEvents: any[] = body?.events ?? [];

  const items = sectionEvents.length > 0
    ? sectionEvents
    : auditEvents.map((e: any) => ({
        time: new Date(e.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        color: e.action === "STATUS_CHANGED" ? "bg-blue-500" :
               e.action.startsWith("ACTION") ? "bg-emerald-500" :
               e.action === "SECTION_UPDATED" ? "bg-zinc-400" : "bg-zinc-400",
        title: e.action.replace(/_/g, " "),
        desc: e.detail ? Object.entries(e.detail as Record<string, unknown>)
          .map(([k, v]) => `${k}: ${v}`).join(" · ") : "",
      }));

  return (
    <Section icon={<Clock size={16} />} title="Timeline">
      {items.length === 0 ? (
        <Empty label="No timeline events recorded yet." />
      ) : (
        <div className="space-y-0">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${item.color ?? "bg-zinc-400"} mt-1 shrink-0`} />
                {i < items.length - 1 && <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 mt-1" />}
              </div>
              <div className="pb-5 flex-1 min-w-0">
                <p className="text-[12px] font-mono text-zinc-400 dark:text-zinc-500 mb-0.5">{item.time}</p>
                <p className={`text-[14px] font-bold mb-0.5 ${item.highlight ? "text-orange-500 dark:text-orange-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                  {item.title}
                </p>
                {item.desc && (
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
};

// ── Tab: Root Cause ───────────────────────────────────────────────────────────
const TabRootCause = () => {
  const { pm, sections } = usePm();
  const body = secBody(sections, "ROOT_CAUSE_ANALYSIS") as any;
  const rca = pm?.rootCauseAnalysis as any;

  const cause: string | null = body?.cause
    ?? (typeof rca === "string" ? rca : rca?.cause ?? rca?.summary ?? null);
  const trigger: string | null = body?.trigger ?? rca?.trigger ?? null;
  const factors: string[] = body?.factors ?? rca?.factors ?? rca?.contributingFactors ?? [];

  return (
    <Section icon={<Search size={16} />} title="Root Cause Analysis">
      {!cause && !trigger && factors.length === 0 ? (
        <Empty label="Root cause analysis not yet completed for this postmortem." />
      ) : (
        <div className="space-y-5">
          {cause && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Root Cause</p>
              <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{cause}</p>
            </div>
          )}
          {trigger && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Trigger</p>
              <p className="text-[14px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{trigger}</p>
            </div>
          )}
          {factors.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Contributing Factors</p>
              <div className="space-y-2">
                {factors.map((f: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 mt-0.5 shrink-0" />
                    <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
};

// ── Tab: Lessons Learned ──────────────────────────────────────────────────────
const TabLessonsLearned = () => {
  const [comment, setComment] = useState("");
  const { sections, pm } = usePm();
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ticketId: string | undefined = pm?.ticket?.id;
  const body = secBody(sections, "LESSONS_LEARNED") as any;
  const lessons: any[] = body?.lessons ?? [];
  const headline: string = body?.headline ?? "";
  const intro: string = body?.intro ?? "";

  const commentsQueryKey = ["postmortem-comments", ticketId];
  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey,
    queryFn: async () => fetchIncidentComments(ticketId as string),
    enabled: !!ticketId,
  });

  const postComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await post(endpoint.incident_ticket.send_comment, {
        ticketId,
        content,
      });
      if (!res.success) throw new Error((res.data as string) || "Failed to post comment");
      return res.data;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to post comment"),
  });

  const handlePost = () => {
    if (!comment.trim() || !ticketId) return;
    postComment.mutate(comment.trim());
  };

  return (
    <Section icon={<FileEdit size={16} />} title="Lessons Learned">
      {lessons.length === 0 && !headline ? (
        <Empty label="Lessons learned not yet documented for this postmortem." />
      ) : (
        <>
          {headline && (
            <h3 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">{headline}</h3>
          )}
          {intro && (
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">{intro}</p>
          )}
          <div className="space-y-8 mb-8">
            {lessons.map((l: any, i: number) => (
              <div key={i}>
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 shrink-0 w-5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">{l.title}</h4>
                </div>
                {l.body && (
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed ml-9 mb-4">{l.body}</p>
                )}
                {l.action && (
                  <div className="ml-9 border-l-4 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 rounded-r-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Recommended Action</p>
                    <p className="text-[13px] text-blue-700 dark:text-blue-300 leading-relaxed">{l.action}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">Comments</p>
        {comments.length > 0 && (
          <div className="space-y-4 mb-5">
            {comments.map((c: any) => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  <span className="text-zinc-500 dark:text-zinc-300 text-[11px] font-bold">
                    {initials(`${c.author?.firstName ?? ""} ${c.author?.lastName ?? ""}`.trim())}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">
                    {`${c.author?.firstName ?? ""} ${c.author?.lastName ?? ""}`.trim() || "Unknown"}
                    <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500 ml-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-[13px] text-zinc-700 dark:text-zinc-300 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
            <span className="text-zinc-400 text-xs">
              {initials(`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()) || "You"}
            </span>
          </div>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            placeholder="Add a comment..."
            className="flex-1 text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none placeholder:text-zinc-400"
          />
          <button
            onClick={handlePost}
            disabled={postComment.isPending || !comment.trim() || !ticketId}
            className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {postComment.isPending ? <Loader2 size={12} className="animate-spin" /> : "Post"}
          </button>
        </div>
      </div>
    </Section>
  );
};

// ── Tab: Signal Graph ─────────────────────────────────────────────────────────
const TabSignalGraph = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const { sections, analysis } = usePm();
  const body = secBody(sections, "SIGNAL_GRAPH") as any;

  const nodes: any[] = body?.nodes ?? analysis?.causalFactors?.map((cf: any, i: number) => ({
    label: cf.factor ?? cf.title ?? `Factor ${i + 1}`,
    tag: cf.contributionLevel ?? "",
    rootCause: cf.contributionLevel === "HIGH",
    description: cf.description ?? null,
  })) ?? [];

  const activeDetail = nodes.find((n: any) => n.label === activeNode);

  return (
    <Section icon={<span className="text-[16px]">⚡</span>} title="Signal Correlation Graph">
      {nodes.length === 0 ? (
        <Empty label="Signal correlation data not yet available for this postmortem." />
      ) : (
        <>
          <div className="space-y-0 mb-6">
            {nodes.map((node: any, i: number) => (
              <React.Fragment key={node.label}>
                <button
                  onClick={() => setActiveNode((prev) => prev === node.label ? null : node.label)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-colors ${
                    node.rootCause
                      ? "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5"
                      : activeNode === node.label
                        ? "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/60"
                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <span className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">{node.label}</span>
                  {node.rootCause ? (
                    <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 rounded px-2 py-0.5 uppercase tracking-wider">
                      Root Cause
                    </span>
                  ) : (
                    <span className="text-[12px] font-mono text-zinc-500 dark:text-zinc-400">{node.tag}</span>
                  )}
                </button>
                {i < nodes.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          {activeNode && activeDetail && (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Search size={13} className="text-zinc-400" />
                  <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{activeNode}</span>
                </div>
                <button onClick={() => setActiveNode(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X size={14} />
                </button>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {activeDetail.description ?? "No additional details available."}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
};

// ── Tab: Investigation Record ─────────────────────────────────────────────────
const TabInvestigationRecord = () => {
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  const { analysis } = usePm();
  const subTabs = ["Overview", "Intelligence Records", "Causal Factors"];
  const metricsObj = analysis?.metrics ?? {};
  const metrics = [
    { label: "Deployments", value: metricsObj.deployments },
    { label: "Commits", value: metricsObj.commits },
    { label: "Pull Requests", value: metricsObj.pullRequests },
    { label: "Repositories", value: metricsObj.repositories },
    { label: metricsObj.windowLabel ?? "Window", value: metricsObj.windowValue },
  ].filter((m) => m.value !== undefined && m.value !== null);
  const records: any[] = analysis?.intelligenceRecords ?? [];
  const causalFactors: any[] = analysis?.causalFactors ?? [];

  return (
    <Section icon={<span>✦</span>} title="Investigation Record">
      {!analysis ? (
        <Empty label="Investigation analysis not yet available. Run analysis from the Code Engine tab." />
      ) : (
        <>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {metrics.map((m, i: number) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center">
                <p className="text-[28px] font-black leading-none mb-1 text-zinc-900 dark:text-zinc-100">{m.value ?? "--"}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1 mb-5 flex-wrap">
            {subTabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveSubTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${
                  activeSubTab === t
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
            {activeSubTab === "Overview" && (
              <div>
                {analysis.title && (
                  <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-2">{analysis.title}</p>
                )}
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {analysis.summaryBody ?? analysis.assessmentBody ?? "No summary available."}
                </p>
                {analysis.generatedAt && (
                  <p className="text-[11px] text-zinc-400 mt-3">
                    Generated: {new Date(analysis.generatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {activeSubTab === "Intelligence Records" && (
              records.length === 0
                ? <Empty label="No intelligence records contributed yet." />
                : <div className="space-y-3">
                    {records.map((r: any, i: number) => (
                      <div key={i} className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                            {r.agentName ?? r.sourceAgent ?? "Agent"}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            r.contributionLevel === "HIGH"
                              ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                              : r.contributionLevel === "MEDIUM"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                          }`}>
                            {r.contributionLevel ?? "NONE"}
                          </span>
                        </div>
                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400">{r.finding ?? r.summary ?? "--"}</p>
                      </div>
                    ))}
                  </div>
            )}
            {activeSubTab === "Causal Factors" && (
              causalFactors.length === 0
                ? <Empty label="No causal factors identified yet." />
                : <div className="space-y-3">
                    {causalFactors.map((cf: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          cf.contributionLevel === "HIGH" ? "bg-red-500" :
                          cf.contributionLevel === "MEDIUM" ? "bg-amber-500" : "bg-zinc-400"
                        }`} />
                        <div>
                          <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{cf.factor ?? cf.title}</p>
                          {cf.description && (
                            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">{cf.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
            )}
          </div>
        </>
      )}
    </Section>
  );
};

// ── Tab: Remediation ──────────────────────────────────────────────────────────
const TabRemediation = () => {
  const { sections, analysis, auditEvents } = usePm();
  const body = secBody(sections, "REMEDIATION") as any;
  const remActions: any[] = body?.actions ?? analysis?.actions ?? [];
  const decisionLog: any[] = body?.decisionLog ?? auditEvents
    .filter((e: any) => e.action === "STATUS_CHANGED" || e.action.startsWith("ACTION"))
    .slice(0, 5)
    .map((e: any) => ({
      time: new Date(e.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      title: e.action.replace(/_/g, " "),
      sub: e.detail
        ? Object.entries(e.detail as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join(" · ")
        : "",
    }));

  return (
    <Section icon={<RefreshCw size={16} />} title="Remediation">
      {remActions.length === 0 && decisionLog.length === 0 ? (
        <Empty label="No remediation actions recorded yet." />
      ) : (
        <>
          {remActions.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {remActions.map((a: any, i: number) => (
                <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                  <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">{a.title ?? a.action}</p>
                  {a.detail && <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-2">{a.detail}</p>}
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check size={12} /> {a.status ?? "Done"}
                  </div>
                </div>
              ))}
            </div>
          )}
          {decisionLog.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">Decision Log</p>
              <div className="space-y-3">
                {decisionLog.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[13px] font-mono font-bold text-zinc-500 dark:text-zinc-400 w-12 shrink-0">
                      {entry.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">{entry.title}</p>
                      {entry.sub && <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{entry.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
};

// ── Tab: Corrective Actions ───────────────────────────────────────────────────
const TabCorrectiveActions = () => {
  const { actions, incidentId, refetchActions } = usePm();
  const { post, patch } = useFetch();
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (action: any) => {
    setToggling(action.id);
    try {
      await patch(`${endpoint.postmortems.action}/${incidentId}/actions/${action.id}`, {
        status: action.status === "OPEN" ? "CLOSED" : "OPEN",
      });
      refetchActions();
    } finally {
      setToggling(null);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await post(`${endpoint.postmortems.actions}/${incidentId}/actions`, {
        title: newTitle.trim(),
        assignee: newAssignee.trim() || undefined,
      });
      setNewTitle("");
      setNewAssignee("");
      refetchActions();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={<FileEdit size={16} />} title="Corrective Actions">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            {["Action", "Owner", "Due Date", "Status", ""].map((h) => (
              <th key={h} className="text-left px-0 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {actions.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-[13px] text-zinc-400 dark:text-zinc-500 italic">
                No corrective actions yet.
              </td>
            </tr>
          )}
          {actions.map((a: any) => (
            <tr key={a.id}>
              <td className="py-3 pr-4 text-zinc-800 dark:text-zinc-200 font-medium">{a.title}</td>
              <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">{a.assignee ?? "--"}</td>
              <td className="py-3 pr-4 text-zinc-400 dark:text-zinc-500">
                {a.dueDate
                  ? new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "--"}
              </td>
              <td className="py-3 pr-4">
                {a.status === "OPEN" ? (
                  <span className="flex items-center gap-1 text-orange-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Open
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Check size={12} /> Closed
                  </span>
                )}
              </td>
              <td className="py-3">
                <button
                  onClick={() => handleToggle(a)}
                  disabled={toggling === a.id}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {toggling === a.id ? <Loader2 size={12} className="animate-spin" /> : (a.status === "OPEN" ? "Mark done" : "Reopen")}
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td className="py-3 pr-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Describe the action..."
                className="w-full text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
              />
            </td>
            <td className="py-3 pr-4">
              <input
                type="text"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="Owner"
                className="text-[13px] text-zinc-700 dark:text-zinc-300 bg-transparent outline-none border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 w-28 focus:border-zinc-400 transition-colors"
              />
            </td>
            <td colSpan={2} />
            <td className="py-3">
              <button
                onClick={handleAdd}
                disabled={saving || !newTitle.trim()}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <><Plus size={12} /> Add</>}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
};

// ── Tab: Collaboration ────────────────────────────────────────────────────────
const TabCollaboration = () => {
  const { pm, sections } = usePm();
  const body = secBody(sections, "COLLABORATION") as any;
  const ticket = pm?.ticket;
  const assignedTo = ticket?.assignedTo;
  const stakeHolder = pm?.stakeHolder as any;

  const commander = body?.commander ?? (
    assignedTo
      ? { name: `${assignedTo.firstName ?? ""} ${assignedTo.lastName ?? ""}`.trim(), dept: "Engineering" }
      : null
  );
  const responders: string[] = body?.responders ?? stakeHolder?.responders ?? stakeHolder?.teams ?? [];
  const warRoom: string[] = body?.warRoom?.channels ?? stakeHolder?.warRoom?.channels ?? [];

  return (
    <Section icon={<Users size={16} />} title="Collaboration">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">Incident Commander</p>
          {commander ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-[13px] font-bold text-blue-600 dark:text-blue-400">
                {initials(commander.name)}
              </div>
              <div>
                <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">{commander.name}</p>
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{commander.dept}</p>
              </div>
            </div>
          ) : <Empty label="Not assigned" />}
        </div>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">Responders</p>
          {responders.length > 0 ? (
            <div className="space-y-2">
              {responders.map((r: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{r}</span>
                </div>
              ))}
            </div>
          ) : <Empty label="No responders listed" />}
        </div>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">War Room</p>
          {warRoom.length > 0 ? (
            <div className="space-y-2 mb-3">
              {warRoom.map((c: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-[9px]">💬</span>
                  </div>
                  <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{c}</span>
                </div>
              ))}
            </div>
          ) : <Empty label="No war room channels" />}
        </div>
      </div>
    </Section>
  );
};

// ── Tab: Playbook Updates ─────────────────────────────────────────────────────
const TabPlaybookUpdates = () => {
  const { sections } = usePm();
  const body = secBody(sections, "PLAYBOOK_UPDATES") as any;

  return (
    <Section icon={<FileText size={16} />} title="Playbook Updates">
      {!body ? (
        <Empty label="No playbook updates recorded for this postmortem." />
      ) : (
        <>
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Playbook Updated</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100 mb-1">{body.name ?? "Unnamed Playbook"}</p>
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                  {body.version ?? ""}
                  {body.updated ? ` · ${body.updated}` : ""}
                </p>
              </div>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-3 py-1.5">
                <Check size={12} /> Updated
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Future Incidents Protected</p>
              <p className="text-[36px] font-black text-blue-600 dark:text-blue-400 leading-none mb-1">{body.protection ?? "--"}</p>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">Estimated MTTR reduction</p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Knowledge Base</p>
              <p className="text-[24px] font-black text-emerald-500 leading-none mb-1">{body.kbStatus ?? "Synced"}</p>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{body.kbNote ?? ""}</p>
            </div>
          </div>
        </>
      )}
    </Section>
  );
};

// ── Tab: Governance & Audit ───────────────────────────────────────────────────
const TabGovernance = () => {
  const { auditEvents, sections } = usePm();
  const body = secBody(sections, "GOVERNANCE") as any;
  const statusChanges = auditEvents.filter((e: any) => e.action === "STATUS_CHANGED").length;
  const actionEvents = auditEvents.filter((e: any) => e.action.startsWith("ACTION")).length;
  const sectionEdits = auditEvents.filter((e: any) => e.action === "SECTION_UPDATED").length;

  const stats = [
    { value: body?.totalEvents ?? auditEvents.length, label: "Total Audit Events", color: "" },
    { value: body?.statusChanges ?? statusChanges, label: "Status Changes", color: "" },
    { value: body?.actionEvents ?? actionEvents, label: "Action Events", color: "text-emerald-500" },
    { value: body?.sectionEdits ?? sectionEdits, label: "Section Edits", color: "" },
    { value: body?.manualActions ?? 0, label: "Manual Actions", color: "" },
  ];

  return (
    <Section icon={<ShieldCheck size={16} />} title="Governance & Audit">
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map((item) => (
          <div key={item.label} className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center">
            <p className={`text-[36px] font-black leading-none mb-2 ${item.color || "text-zinc-900 dark:text-zinc-100"}`}>
              {item.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{item.label}</p>
          </div>
        ))}
      </div>
      {auditEvents.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                {["Action", "Time", "Detail"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {auditEvents.slice(0, 20).map((e: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{e.action.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 font-mono text-[12px]">
                    {new Date(e.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-[12px]">
                    {e.detail ? JSON.stringify(e.detail).slice(0, 80) : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {auditEvents.length === 0 && <Empty label="No audit events recorded yet." />}
    </Section>
  );
};

// ── Tab: Attachments ──────────────────────────────────────────────────────────
function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TabAttachments = () => {
  const { pm } = usePm();
  const queryClient = useQueryClient();
  const ticketId: string | undefined = pm?.ticket?.id;
  const [uploading, setUploading] = useState(false);

  const attachmentsQueryKey = ["postmortem-attachments", ticketId];
  const { data: attachments = [] } = useQuery({
    queryKey: attachmentsQueryKey,
    queryFn: async () => fetchIncidentAttachments(ticketId as string),
    enabled: !!ticketId,
  });

  const handleUpload = async (file: File | undefined) => {
    if (!file || !ticketId) return;
    setUploading(true);
    try {
      await uploadIncidentAttachment(ticketId, file);
      queryClient.invalidateQueries({ queryKey: attachmentsQueryKey });
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!ticketId) return;
    try {
      await deleteIncidentAttachment(ticketId, attachmentId);
      queryClient.invalidateQueries({ queryKey: attachmentsQueryKey });
    } catch {
      toast.error("Failed to delete attachment");
    }
  };

  return (
    <Section icon={<Paperclip size={16} />} title="Attachments">
      {attachments.length === 0 && (
        <Empty label="No attachments uploaded yet for this postmortem." />
      )}
      <div className="grid grid-cols-4 gap-3 mt-3">
        {attachments.map((a: any) => (
          <a
            key={a.id}
            href={a.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(a.id); }}
              className="absolute top-2 right-2 text-zinc-300 dark:text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={13} />
            </button>
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3 text-lg">
              📄
            </div>
            <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5 truncate">{a.name}</p>
            {a.size && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{formatBytes(a.size)}</p>}
          </a>
        ))}
        <label className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
          <input
            type="file"
            className="hidden"
            disabled={uploading || !ticketId}
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <div className="text-center">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-2">
              {uploading ? <Loader2 size={16} className="text-zinc-400 animate-spin" /> : <Plus size={16} className="text-zinc-400" />}
            </div>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500">{uploading ? "Uploading…" : "Add Attachment"}</p>
          </div>
        </label>
      </div>
    </Section>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PostmortemDetailPage({ incidentId }: { incidentId?: string }) {
  const { get } = useFetch();
  const [activeTab, setActiveTab] = useState<TabId>("Incident Overview");
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  const { data: pm, refetch } = useQuery({
    queryKey: ["postmortem-detail", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      const res = await get(`${endpoint.postmortems.getOne}/${incidentId}`);
      return res.success ? (res.data?.data ?? null) : null;
    },
    enabled: !!incidentId,
    staleTime: 30_000,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["pm-sections", incidentId],
    queryFn: async () => {
      const res = await get(`${endpoint.postmortems.sections}/${incidentId}/sections`);
      return res.data?.data ?? [];
    },
    enabled: !!incidentId,
    staleTime: 30_000,
  });

  const { data: actions = [], refetch: refetchActions } = useQuery({
    queryKey: ["pm-actions", incidentId],
    queryFn: async () => {
      const res = await get(`${endpoint.postmortems.actions}/${incidentId}/actions`);
      return res.data?.data ?? [];
    },
    enabled: !!incidentId,
    staleTime: 15_000,
  });

  const { data: auditEvents = [] } = useQuery({
    queryKey: ["pm-audit", incidentId],
    queryFn: async () => {
      const res = await get(`${endpoint.postmortems.audit}/${incidentId}/audit`);
      return res.data?.data ?? [];
    },
    enabled: !!incidentId,
    staleTime: 30_000,
  });

  const ticketId = pm?.ticket?.id;
  const { data: analysis } = useQuery({
    queryKey: ["investigation-analysis", ticketId],
    queryFn: async () => {
      const res = await get(`${endpoint.investigation_analysis.get}/${ticketId}`);
      return res.success ? (res.data?.data ?? null) : null;
    },
    enabled: !!ticketId,
    staleTime: 60_000,
  });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Postmortem link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Postmortem: ${pm?.ticket?.ticketId ?? pm?.ticketId ?? incidentId ?? ""}`);
    const body = encodeURIComponent(`Postmortem details: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleLifecycle = async (action: "submit-review" | "approve" | "archive" | "restore") => {
    if (!incidentId) return;
    setLifecycleLoading(true);
    try {
      const { apiClient } = await import("@/lib/api/apiClient");
      await apiClient.post(`${endpoint.postmortems.submitReview}/${incidentId}/${action}`);
      await refetch();
    } catch {}
    setLifecycleLoading(false);
  };

  const pmStatus = pm?.status ?? "DRAFT";
  const ticket = pm?.ticket;
  const sev = mapSev(ticket?.priority);
  const aiAnalysis = ticket?.aiAnalysis;
  const execSummary = secBody(sections, "EXECUTIVE_SUMMARY") as any;
  const headline = execSummary?.headline ?? aiAnalysis?.headline ?? null;
  const summaryBody = execSummary?.body ?? aiAnalysis?.summary ?? null;
  const bullets: any[] = execSummary?.bullets ?? [];

  const ctx: PmCtx = {
    pm,
    sections,
    actions,
    auditEvents,
    analysis,
    incidentId: incidentId ?? "",
    refetch: () => { refetch(); },
    refetchActions: () => { refetchActions(); },
  };

  const TAB_CONTENT: Record<TabId, React.ReactNode> = {
    "Incident Overview": <TabIncidentOverview />,
    Timeline: <TabTimeline />,
    "Root cause analysis": <TabRootCause />,
    "Lessons learned": <TabLessonsLearned />,
    "Signal Correlation graph": <TabSignalGraph />,
    "Investigation Record": <TabInvestigationRecord />,
    Remediation: <TabRemediation />,
    "Corrective Actions": <TabCorrectiveActions />,
    Collaboration: <TabCollaboration />,
    "Playbook Updates": <TabPlaybookUpdates />,
    "Governance and Audit": <TabGovernance />,
    Attachments: <TabAttachments />,
  };

  if (!pm && incidentId) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <PmCtx.Provider value={ctx}>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 px-8 py-3 flex items-center justify-between">
          <Link
            href="/incident/postmortems"
            className="flex items-center gap-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5"
          >
            <ArrowLeft size={14} /> Back to Postmortems
          </Link>
          <div className="flex items-center gap-2">
            {pmStatus === "DRAFT" && (
              <button
                onClick={() => handleLifecycle("submit-review")}
                disabled={lifecycleLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-300 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <FileEdit size={14} /> Submit for Review
              </button>
            )}
            {pmStatus === "IN_REVIEW" && (
              <button
                onClick={() => handleLifecycle("approve")}
                disabled={lifecycleLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 text-[13px] font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                <ShieldCheck size={14} /> Approve
              </button>
            )}
            {pmStatus === "APPROVED" && (
              <button
                onClick={() => handleLifecycle("archive")}
                disabled={lifecycleLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 text-[13px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Archive
              </button>
            )}
            {pmStatus === "ARCHIVED" && (
              <button
                onClick={() => handleLifecycle("restore")}
                disabled={lifecycleLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 text-[13px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Restore to Draft
              </button>
            )}
            {[
              { icon: <Share2 size={14} />, label: "Share", onClick: handleShare },
              { icon: <FileText size={14} />, label: "Export PDF", onClick: handleExportPdf },
              { icon: <Mail size={14} />, label: "Email", onClick: handleEmail },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full mx-auto px-8 py-6">
          {/* Header card */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-4 bg-white dark:bg-zinc-900/40">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                  Incident Postmortem
                </p>
                <h1 className="text-[28px] font-black text-zinc-900 dark:text-zinc-100">
                  {ticket?.ticketId ?? pm?.ticketId ?? pm?.id ?? "--"}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                  Generated: {pm?.updatedAt ? new Date(pm.updatedAt).toLocaleString() : "--"}
                </p>
                {pm?.author && (
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    Author:{" "}
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {pm.author.firstName} {pm.author.lastName}
                    </span>
                  </p>
                )}
                <div className="flex items-center gap-2 justify-end mt-1">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> AI-Generated
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
                    v1.0
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded border ${STATUS_STYLES[pmStatus] ?? STATUS_STYLES.DRAFT}`}>
                {pmStatus === "APPROVED" ? "✓ " : ""}{pmStatus.replace("_", " ")}
              </span>
              {ticket?.environment && (
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                  {ticket.environment}
                </span>
              )}
              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 ${SEV_COLOR[sev] ?? ""}`}>
                {sev}
              </span>
              {ticket?.status && (
                <span className="text-[12px] font-semibold px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
                  ✓ {ticket.status}
                </span>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="border-l-4 border-blue-400 dark:border-blue-500 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-r-2xl p-6 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
              Executive Summary
            </p>
            {headline ? (
              <>
                <p className="text-[15px] font-black text-zinc-900 dark:text-zinc-100 mb-3 leading-snug">{headline}</p>
                {summaryBody && (
                  <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{summaryBody}</p>
                )}
                {bullets.length > 0 && (
                  <div className="flex items-center gap-5">
                    {bullets.map((b: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[12px] text-zinc-500 dark:text-zinc-400">
                        <div className={`w-2 h-2 rounded-full ${b.color ?? "bg-zinc-400"}`} /> {b.label}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[14px] text-zinc-400 dark:text-zinc-500 italic">
                Executive summary not yet authored.
                {ticket?.summary && (
                  <span className="not-italic text-zinc-600 dark:text-zinc-400 ml-1">
                    Incident summary: {ticket.summary}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* AI Investigation Summary */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "#0f172a" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
              Scrubbe AI — Investigation Summary
            </p>
            <div className="grid grid-cols-4 gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Deployments examined</p>
                <span className="text-[32px] font-black text-white">
                  {analysis?.metrics?.deployments ?? "--"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Commits examined</p>
                <p className="text-[32px] font-black text-white">
                  {analysis?.metrics?.commits ?? "--"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Root Cause Confidence</p>
                <p className="text-[32px] font-black text-emerald-400">
                  {Array.isArray(analysis?.causalFactors) && analysis.causalFactors.length > 0
                    ? `${Math.max(...analysis.causalFactors.map((c: any) => c.confidence ?? 0))}%`
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Probable Cause</p>
                <p className="text-[22px] font-black text-white">
                  {analysis?.assessmentTitle
                    ?? aiAnalysis?.probableCause
                    ?? (typeof pm?.rootCauseAnalysis === "object"
                        ? (pm?.rootCauseAnalysis as any)?.cause?.toString().slice(0, 30)
                        : null)
                    ?? "Pending Analysis"}
                </p>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${
                  activeTab === tab
                    ? "border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div>{TAB_CONTENT[activeTab]}</div>
        </div>
      </div>
    </PmCtx.Provider>
  );
}
