"use client";

import React, { useEffect, useMemo, useState } from "react";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import { Check, ChevronLeft, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/select";
import {
  AuditEntry,
  ChildIncident,
  Proposal,
  RecordStatus,
  RelationshipRecord,
  SEED_AUDIT,
  SEED_PROPOSALS,
  SEED_RECORDS,
  STATUS_ORDER,
  nowClock,
} from "./data";
import {
  ChildRow,
  ConfidenceBar,
  DetailSection,
  HistoryTimeline,
  Pill,
  ProposalCard,
  RecordCard,
  GovernanceActivity,
  OutcomeChecklist,
  SimilarRow,
} from "./sections";
import { ChildIncidentModal } from "./Modals";

type View = "list" | "inbox";
type ModalState =
  | { kind: "none" }
  | { kind: "child"; parentId: string; childId: string };

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-[13px] text-black/70 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          checked
            ? "border-emerald-600 bg-emerald-600"
            : "border-zinc-300 dark:border-zinc-700",
        )}
      >
        {checked && <Check size={11} className="text-white" />}
      </span>
      {label}
    </button>
  );
}

export default function IncidentRelationships() {
  const [records, setRecords] = useState<RelationshipRecord[]>(SEED_RECORDS);
  const [proposals, setProposals] = useState<Proposal[]>(SEED_PROPOSALS);
  const [audit, setAudit] = useState<AuditEntry[]>(SEED_AUDIT);

  useEffect(() => {
    customAxios.get(endpoint.incident_relationships.list).then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        setRecords(list.map((r: any) => ({
          id: r.ticketId ?? r.id,
          title: r.title ?? r.summary ?? "Untitled",
          status: (r.status === "RESOLVED" || r.status === "Resolved") ? "Resolved" : "In progress",
          priority: r.severity === "CRITICAL" ? "P0" : r.severity === "HIGH" ? "P1" : "P2",
          occurred: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Unknown",
          problemRecord: r.problemId ?? null,
          knowledgeArticle: r.knowledgeArticleId ?? null,
          knownError: r.knownError ?? false,
          rootCause: r.rootCause ?? "Under investigation",
          resolution: r.resolution ?? r.resolutionSummary ?? "Pending",
          assignmentGroup: r.assignmentGroup ?? r.teamName ?? "Unassigned",
          children: (r.children ?? r.relatedIncidents ?? []).map((c: any) => ({
            id: c.ticketId ?? c.id,
            title: c.title ?? "Incident",
            status: c.status === "RESOLVED" ? "Resolved" : "In progress",
            resolvedIn: c.resolvedIn ?? "—",
            group: c.assignmentGroup ?? "—",
            addedToProblem: c.addedToProblem ?? false,
            kb: c.knowledgeArticle ?? false,
          })),
          history: (r.history ?? r.timeline ?? []).map((h: any) => ({
            date: h.date ?? h.timestamp ?? new Date(h.createdAt ?? Date.now()).toLocaleString(),
            event: h.event ?? h.description ?? h.action,
            who: h.who ?? h.actor,
            done: h.done ?? true,
          })),
          similar: (r.similar ?? []).map((s: any) => ({
            score: s.score ?? s.similarityScore ?? 80,
            id: s.ticketId ?? s.id,
            title: s.title ?? "",
            status: s.status === "RESOLVED" ? "Resolved" : "In progress",
            pr: s.problemRecord ?? "—",
            resolution: s.resolution ?? "—",
          })),
          operational: {
            services: r.affectedServices ?? r.services ?? [r.affectedSystem ?? "Unknown"],
            totalChildren: r.childCount ?? (r.children ?? []).length,
            teams: r.teams ?? [],
            avgResolution: r.avgResolutionTime ?? "—",
            problemRecord: r.problemId ?? "—",
            knowledgeArticle: r.knowledgeArticleId ?? "—",
            knownError: r.knownError ?? false,
          },
          evidence: { signals: r.signals ?? [], confidence: r.confidence ?? 80 },
          ai: { paragraph: r.aiAnalysis ?? r.description ?? "Analysing…", recommendation: r.recommendation ?? "Under review" },
          outcome: r.outcome ?? SEED_RECORDS[0]?.outcome ?? { items: [], reviewedBy: { name: "—", team: "—" } },
        })));
      }
    }).catch(() => {});
  }, []);

  const [view, setView] = useState<View>("list");
  const [openRecordId, setOpenRecordId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusSet, setStatusSet] = useState<Set<RecordStatus>>(new Set());
  const [knownOnly, setKnownOnly] = useState(false);
  const [hasPR, setHasPR] = useState(false);
  const [hasKB, setHasKB] = useState(false);
  const [service, setService] = useState("");
  const [priority, setPriority] = useState("");

  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  function toast(msg: string) {
    setToastMsg(msg);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToastMsg(null), 2400);
  }

  const serviceOptions = useMemo(
    () =>
      Array.from(
        new Set(records.flatMap((r) => r.operational.services)),
      ).sort(),
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (statusSet.size && !statusSet.has(r.status)) return false;
      if (knownOnly && !r.knownError) return false;
      if (hasPR && !r.problemRecord) return false;
      if (hasKB && !r.knowledgeArticle) return false;
      if (service && !r.operational.services.includes(service)) return false;
      if (priority && r.priority !== priority) return false;
      if (q) {
        const hay = [
          r.id,
          r.title,
          r.rootCause,
          r.resolution,
          r.problemRecord,
          r.knowledgeArticle,
          ...r.operational.services,
          ...r.children.map((c) => `${c.id} ${c.title}`),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, search, statusSet, knownOnly, hasPR, hasKB, service, priority]);

  function toggleStatus(s: RecordStatus) {
    setStatusSet((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setStatusSet(new Set());
    setKnownOnly(false);
    setHasPR(false);
    setHasKB(false);
    setService("");
    setPriority("");
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openRecord(id: string) {
    setOpenRecordId(id);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addAudit(actor: string, text: string) {
    setAudit((prev) => [...prev, { when: nowClock(), actor, text }]);
  }

  function confirmProposal(id: string) {
    const p = proposals.find((x) => x.id === id);
    if (!p) return;
    const target = records.find((r) => r.id === p.target);
    if (target) {
      // Optimistically update local state
      setRecords((prev) =>
        prev.map((r) =>
          r.id === p.target
            ? {
                ...r,
                children: [
                  ...r.children,
                  {
                    id: p.incident.id,
                    title: p.incident.title,
                    status: "In progress" as RecordStatus,
                    resolvedIn: "---",
                    group: "---",
                    addedToProblem: true,
                    kb: false,
                  },
                ],
                operational: {
                  ...r.operational,
                  totalChildren: r.operational.totalChildren + 1,
                },
                history: [
                  ...r.history,
                  {
                    date: "Today",
                    event: `Child ${p.incident.id} linked via correlation`,
                    who: "You",
                    done: true,
                  },
                ],
              }
            : r,
        ),
      );
      addAudit(
        "You",
        `linked ${p.incident.id} into ${target.id} (${p.confidence}% match)`,
      );
      toast(`${p.incident.id} linked into ${target.id} · audit logged`);
      // Persist the relationship to the server
      customAxios
        .post(`${endpoint.incident_relationships.create}/${p.target}/relationships`, {
          targetId: p.incident.id,
          type: "RELATED_TO",
          notes: `Correlation proposal confirmed — ${p.confidence}% match`,
        })
        .catch(() => {}); // optimistic — local state already updated
    }
    setProposals((prev) => prev.filter((x) => x.id !== id));
  }

  function rejectProposal(id: string) {
    const p = proposals.find((x) => x.id === id);
    if (!p) return;
    addAudit("You", `rejected the suggested link for ${p.incident.id}`);
    setProposals((prev) => prev.filter((x) => x.id !== id));
    toast("Suggestion rejected · audit logged");
  }

  function openChild(parentId: string, childId: string) {
    setModal({ kind: "child", parentId, childId });
  }

  const openRecordObj = openRecordId
    ? records.find((r) => r.id === openRecordId)
    : null;
  const modalParent =
    modal.kind === "child"
      ? records.find((r) => r.id === modal.parentId)
      : undefined;
  const modalChild: ChildIncident | undefined =
    modal.kind === "child"
      ? modalParent?.children.find((c) => c.id === modal.childId)
      : undefined;

  return (
    <div className="flex h-screen flex-col font-ibm dark:bg-zinc-950">
      <Header title="Incident Relationships" />

      <div className="w-full shadow-sm shadow-light dark:bg-zinc-950">
        <div className="mx-auto max-w-[1540px] px-4 py-4 sm:px-6">
          <p className="text-[14px] text-black/60 dark:text-zinc-400">
            Operational memory — what belonged together, how it was resolved,
            and what knowledge came out of it.
          </p>
          <div className="relative mt-3 w-full max-w-[420px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incident, problem record, root cause, service…"
              className="h-[36px] w-full rounded-md border border-zinc-300 pl-9 pr-3 text-[13.5px] text-black placeholder:text-black/40 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-0 w-full max-w-[1540px] flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-5 lg:grid-cols-[260px_1fr]">
        {/* Filters rail */}
        <aside className="min-h-0 overflow-y-auto rounded-lg bg-white p-5 shadow-sm shadow-light dark:bg-zinc-900/40">
          <div className="mb-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              Status
            </div>
            {STATUS_ORDER.map((s) => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={statusSet.has(s)}
                onChange={() => toggleStatus(s)}
              />
            ))}
          </div>
          <div className="mb-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              Record
            </div>
            <FilterCheckbox
              label="Known error only"
              checked={knownOnly}
              onChange={() => setKnownOnly((v) => !v)}
            />
            <FilterCheckbox
              label="Has problem record"
              checked={hasPR}
              onChange={() => setHasPR((v) => !v)}
            />
            <FilterCheckbox
              label="Has knowledge article"
              checked={hasKB}
              onChange={() => setHasKB((v) => !v)}
            />
          </div>
          <div className="mb-5 space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              Scope
            </div>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value)}
              options={[
                { value: "", label: "Any service" },
                ...serviceOptions.map((s) => ({ value: s, label: s })),
              ]}
              placeholder="Any service"
            />
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: "", label: "Any priority" },
                { value: "P0", label: "P0" },
                { value: "P1", label: "P1" },
                { value: "P2", label: "P2" },
              ]}
              placeholder="Any priority"
            />
          </div>
          <button
            onClick={resetFilters}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-[12.5px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            Reset filters
          </button>
          <p className="mt-4 text-[11.5px] leading-relaxed text-black/40 dark:text-zinc-500">
            Each record is a parent incident and the child incidents that
            cascaded from the same root cause — plus how it was resolved and the
            knowledge it produced.
          </p>
        </aside>

        {/* Main */}
        <main className="min-h-0 overflow-y-auto rounded-lg bg-zinc-50 dark:bg-zinc-900/20">
          <div className="mr-auto max-w-6xl px-1 py-1 pb-14">
            {openRecordObj ? (
              <RecordDetail
                record={openRecordObj}
                records={records}
                onBack={() => setOpenRecordId(null)}
                onOpenChild={(childId) => openChild(openRecordObj.id, childId)}
                onOpenSimilar={(id) => {
                  const exists = records.find((r) => r.id === id);
                  if (exists) openRecord(id);
                  else toast(`Archived incident ${id} — no linked record`);
                }}
              />
            ) : (
              <div className="p-1">
                <div className="mb-5 flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "border-b-2 pb-3 text-[14px] font-semibold transition-colors",
                      view === "list"
                        ? "border-emerald-600 text-black dark:text-zinc-100"
                        : "border-transparent text-black/45 hover:text-black dark:text-zinc-500",
                    )}
                  >
                    Related incidents
                  </button>
                  <button
                    onClick={() => setView("inbox")}
                    className={cn(
                      "flex items-center gap-2 border-b-2 pb-3 text-[14px] font-semibold transition-colors",
                      view === "inbox"
                        ? "border-emerald-600 text-black dark:text-zinc-100"
                        : "border-transparent text-black/45 hover:text-black dark:text-zinc-500",
                    )}
                  >
                    Suggested links
                    {proposals.length > 0 && (
                      <span className="rounded-full bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                        {proposals.length}
                      </span>
                    )}
                  </button>
                </div>

                {view === "list" ? (
                  <>
                    <div className="mb-1 flex items-baseline gap-2">
                      <h2 className="text-[22px] font-bold text-black dark:text-zinc-100">
                        Related incidents
                      </h2>
                      <span className="font-mono text-[12px] text-black/40 dark:text-zinc-500">
                        {filtered.length} of {records.length}
                      </span>
                    </div>
                    <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-black/60 dark:text-zinc-400">
                      Every entry is a parent incident and the child incidents
                      that cascaded from the same root cause — with how it was
                      resolved and the knowledge it produced. Expand a row to
                      see its children, or open the full operational record.
                    </p>
                    <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-[12px] text-black/60 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                      {[
                        "What belonged together?",
                        "How was it resolved?",
                        "What knowledge was created?",
                        "What should we reuse?",
                      ].map((q, i) => (
                        <span key={q} className="flex items-center gap-2">
                          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-emerald-200 font-mono text-[10px] font-semibold text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400">
                            {i + 1}
                          </span>
                          {q}
                        </span>
                      ))}
                    </div>

                    {filtered.length ? (
                      filtered.map((r) => (
                        <RecordCard
                          key={r.id}
                          record={r}
                          expanded={expanded.has(r.id)}
                          onToggle={() => toggleExpand(r.id)}
                          onOpenChild={(childId) => openChild(r.id, childId)}
                          onOpenRecord={() => openRecord(r.id)}
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-zinc-200 bg-white py-14 text-center text-[13px] text-black/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500">
                        No records match these filters.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className="mb-4 text-[22px] font-bold text-black dark:text-zinc-100">
                      Suggested links
                    </h2>
                    <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-[13px] leading-relaxed text-black/70 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-zinc-300">
                      <p>
                        <b className="font-semibold text-black dark:text-zinc-100">
                          Governed correlation.
                        </b>{" "}
                        The correlation engine proposes new incidents to attach
                        to an existing relationship from shared signals. Nothing
                        links automatically — a human confirms or rejects each
                        one, and the decision is written to the audit trail.
                      </p>
                    </div>

                    {proposals.length ? (
                      proposals.map((p) => (
                        <ProposalCard
                          key={p.id}
                          proposal={p}
                          targetTitle={
                            records.find((r) => r.id === p.target)?.title
                          }
                          onConfirm={() => confirmProposal(p.id)}
                          onReject={() => rejectProposal(p.id)}
                          onOpenRecord={() => openRecord(p.target)}
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-zinc-200 bg-white py-14 text-center text-[13px] text-black/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-500">
                        Inbox clear — no pending correlation suggestions.
                      </div>
                    )}

                    <GovernanceActivity entries={audit} />
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={modal.kind !== "none"}
        onClose={() => setModal({ kind: "none" })}
      >
        {modal.kind === "child" && modalParent && modalChild && (
          <ChildIncidentModal parent={modalParent} child={modalChild} />
        )}
      </Modal>

      <div
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[70] max-w-[80vw] -translate-x-1/2 rounded-md bg-black px-4 py-2.5 text-center font-mono text-[12.5px] text-white shadow-lg transition-all duration-200",
          toastMsg ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {toastMsg}
      </div>
    </div>
  );
}

function RecordDetail({
  record,
  records,
  onBack,
  onOpenChild,
  onOpenSimilar,
}: {
  record: RelationshipRecord;
  records: RelationshipRecord[];
  onBack: () => void;
  onOpenChild: (childId: string) => void;
  onOpenSimilar: (id: string) => void;
}) {
  const o = record.operational;
  return (
    <div className="p-1">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 font-mono text-[12px] font-medium text-black hover:text-emerald-600 dark:text-zinc-300"
      >
        <ChevronLeft size={14} /> Back to related incidents
      </button>

      <div className="rounded-lg bg-white p-7 shadow-sm shadow-light dark:bg-zinc-900/60">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-black/40 dark:text-zinc-500">
            {record.id}
          </span>
          <Pill label="Parent" tone="neutral" dot={false} />
        </div>
        <h2 className="text-[24px] font-bold leading-tight text-black dark:text-zinc-100">
          {record.title}
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-black dark:text-zinc-300">
          <b className="font-semibold">Root cause.</b> {record.rootCause}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-zinc-100 pt-5 dark:border-zinc-800 sm:grid-cols-5">
          <StatCell label="Child incidents" value={record.children.length} />
          <StatCell label="Avg resolution" value={o.avgResolution} />
          <StatCell
            label="Problem record"
            value={record.problemRecord ?? "---"}
            small
          />
          <StatCell
            label="Knowledge"
            value={record.knowledgeArticle ?? "---"}
            small
          />
          <StatCell label="Occurred" value={record.occurred} small />
        </div>
      </div>

      <div className="mt-4">
        <DetailSection
          eyebrow="Child incidents"
          note={`${record.children.length} linked`}
        >
          {record.children.map((c) => (
            <ChildRow key={c.id} child={c} onClick={() => onOpenChild(c.id)} />
          ))}
        </DetailSection>

        <DetailSection eyebrow="Relationship history">
          <HistoryTimeline history={record.history} />
        </DetailSection>

        <DetailSection eyebrow="Similar historical incidents" note="AI-matched">
          {record.similar.map((s) => (
            <SimilarRow key={s.id} s={s} onClick={() => onOpenSimilar(s.id)} />
          ))}
        </DetailSection>

        <DetailSection eyebrow="Operational summary">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-5">
            <StatCell label="Total child incidents" value={o.totalChildren} />
            <StatCell
              label="Average resolution"
              value={o.avgResolution}
              small
            />
            <StatCell label="Problem record" value={o.problemRecord} small />
            <StatCell
              label="Knowledge article"
              value={o.knowledgeArticle}
              small
            />
            <StatCell
              label="Known error"
              value={o.knownError ? "Yes" : "No"}
              small
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
                Affected services
              </div>
              <div className="flex flex-wrap gap-2">
                {o.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11.5px] text-black/70 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
                Teams involved
              </div>
              <div className="flex flex-wrap gap-2">
                {o.teams.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11.5px] text-black/70 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          eyebrow="Relationship evidence"
          note="why these were related"
        >
          <ConfidenceBar evidence={record.evidence} />
        </DetailSection>

        <DetailSection eyebrow="Relationship analysis" note="Ezra">
          <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-500/10">
            <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              <span className="flex h-[19px] w-[19px] items-center justify-center rounded-md bg-indigo-600 text-[11px] font-semibold text-white">
                E
              </span>
              Ezra · governed analysis
            </div>
            <p className="text-[13.5px] leading-relaxed text-black dark:text-zinc-200">
              {record.ai.paragraph}
            </p>
            <div className="mt-3 border-t border-dashed border-indigo-200 pt-3 dark:border-indigo-500/20">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                Recommendation
              </div>
              <div className="text-[13.5px] font-semibold text-black dark:text-zinc-100">
                {record.ai.recommendation}
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection eyebrow="Outcome" note="what this taught us">
          <OutcomeChecklist outcome={record.outcome} />
        </DetailSection>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  small,
}: {
  label: string;
  value: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-bold text-black dark:text-zinc-100",
          small ? "text-[14px]" : "text-[19px]",
        )}
      >
        {value}
      </div>
    </div>
  );
}
