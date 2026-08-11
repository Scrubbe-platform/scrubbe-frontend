"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, History, Upload, Download, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button1";
import {
  FILTER_DEFS,
  MODULES,
  PLAYBOOKS,
  SCOPES,
  fval,
  ruleById,
  AGENTS,
} from "../data";
import {
  FilterKey,
  LibraryTab,
  ModuleDef,
  Playbook,
  SearchScope,
} from "../types";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

function mapApiPlaybook(api: any, idx: number): Playbook {
  return {
    id: api.id ?? `PB-${String(idx + 1).padStart(4, "0")}`,
    name: api.name ?? "Unnamed Playbook",
    service: api.service ?? api.category ?? "General",
    status: api.status === "ACTIVE" ? "Active" : api.status === "DRAFT" ? "Draft" : api.status === "ARCHIVED" ? "Archived" : "Draft",
    mode: api.mode ?? "Approval required",
    success: api.successRate ?? 0,
    executed: api.executionCount ?? 0,
    priority: api.priority ?? 2,
    trigger: api.trigger ?? "Manual",
    owner: api.owner ?? api.createdBy ?? "Platform team",
    version: api.version ? `v${api.version}` : "v1.0",
    updated: api.updatedAt ? new Date(api.updatedAt).toLocaleDateString() : "—",
    env: api.environments ?? ["Production"],
    rules: api.rules ?? [],
    maxAuto: api.maxAuto ?? 3,
    rollback: api.rollback ?? false,
    approvers: api.approvers ?? ["Incident commander"],
    mttr: api.avgMttr ?? "—",
    approvalTime: api.avgApprovalTime ?? "—",
    rollbackRate: api.rollbackRate ?? "0%",
    failures: api.failureCount ?? 0,
    modules: api.modules ?? { Investigation: [], Decision: [], Execution: [], Verification: [], Knowledge: [] },
    desc: api.description ?? `Playbook for ${api.name ?? "incidents"}.`,
    incidentTypes: api.incidentTypes ?? api.tags ?? [],
    created: api.createdAt ? new Date(api.createdAt).toLocaleDateString() : "—",
  };
}
import StatsStrip from "./StatsStrip";
import FilterRail from "./FilterRail";
import PlaybookTable from "./PlaybookTable";
import ModuleLibrary from "./ModuleLibrary";
import ModuleDrawer from "./ModuleDrawer";
import {
  ArchiveModal,
  CreatePlaybookModal,
  ImportPlaybookModal,
  VersionHistoryModal,
} from "./LibraryModals";

const EMPTY_FILTERS = (): Record<FilterKey, Set<string>> => ({
  status: new Set(),
  service: new Set(),
  trigger: new Set(),
  priority: new Set(),
  mode: new Set(),
  owner: new Set(),
});

const PAGE_SIZE = 10;

function matchesSearch(
  p: Playbook,
  q: string,
  scopes: Set<SearchScope>,
): boolean {
  if (!q) return true;
  const hay: string[] = [];
  if (scopes.has("Name")) hay.push(p.name, p.id);
  if (scopes.has("Service")) hay.push(p.service);
  if (scopes.has("Incident type")) hay.push(...p.incidentTypes);
  if (scopes.has("Tag")) hay.push(p.trigger, p.mode);
  if (scopes.has("Operational rule"))
    hay.push(...p.rules.map((id) => ruleById(id)?.name ?? ""));
  if (scopes.has("AI agent")) hay.push(...AGENTS.map((a) => a.name));
  if (scopes.has("Owner")) hay.push(p.owner);
  return hay.join(" ").toLowerCase().includes(q);
}

let nextIdCounter = 1;
function nextPlaybookId(existing: Playbook[]): string {
  let n = 101 + existing.length + nextIdCounter;
  while (existing.some((p) => p.id === "PB-" + String(n).padStart(4, "0"))) n++;
  nextIdCounter++;
  return "PB-" + String(n).padStart(4, "0");
}

export default function PlaybookLibraryPage(): React.JSX.Element {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(PLAYBOOKS);

  // ─── Load real playbooks from API ───────────────────────────────────────────
  useEffect(() => {
    customAxios
      .get(endpoint.playbooks.list)
      .then((res) => {
        const list: any[] = res.data?.data ?? res.data ?? [];
        if (list.length > 0) {
          setPlaybooks(list.map((p: any, i: number) => mapApiPlaybook(p, i)));
        }
      })
      .catch(() => {
        // Silently keep PLAYBOOKS as fallback
      });
  }, []);
  const [tab, setTab] = useState<LibraryTab>("playbooks");
  const [search, setSearch] = useState("");
  const [scopes, setScopes] = useState<any>(new Set(["Name"]));
  const [filters, setFilters] =
    useState<Record<FilterKey, Set<string>>>(EMPTY_FILTERS());
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Playbook | null>(null);
  const [openModule, setOpenModule] = useState<ModuleDef | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return playbooks.filter((p) => {
      for (const def of FILTER_DEFS) {
        const set = filters[def.key];
        if (set.size && !set.has(fval(p, def.key))) return false;
      }
      return matchesSearch(p, q, scopes);
    });
  }, [playbooks, search, filters, scopes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const activeFilterCount = Object.values(filters).reduce(
    (a, s) => a + s.size,
    0,
  );

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS());
    setSearch("");
    setPage(1);
  };

  const toggleScope = (s: SearchScope) => {
    setScopes((prev: any) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      if (next.size === 0) next.add("Name");
      return next;
    });
  };

  const handleDuplicate = async (id: string) => {
    const src = playbooks.find((p) => p.id === id);
    if (!src) return;
    const localId = nextPlaybookId(playbooks);
    const copy: Playbook = {
      ...JSON.parse(JSON.stringify(src)),
      id: localId,
      name: `${src.name} (copy)`,
      status: "Draft",
      version: "v0.1",
      executed: 0,
      updated: "Just now",
    };
    // Optimistic add
    setPlaybooks((prev) => [...prev, copy]);
    toast.success(`Duplicated as ${copy.name} — created as draft`);
    // Persist to server
    try {
      const res = await customAxios.post(`${endpoint.playbooks.clone}/${id}/clone`);
      const cloned = res.data?.data ?? res.data;
      if (cloned?.id && cloned.id !== localId) {
        // Update the local copy with the real server ID
        setPlaybooks((prev) =>
          prev.map((p) => (p.id === localId ? { ...p, id: cloned.id } : p))
        );
      }
    } catch {
      // Optimistic — local state already updated
    }
  };

  const handleArchiveConfirm = async (id: string) => {
    const p = playbooks.find((x) => x.id === id);
    const restoring = p?.status === "Archived";
    // Optimistic update
    setPlaybooks((prev) =>
      prev.map((pb) =>
        pb.id === id
          ? { ...pb, status: restoring ? "Draft" : "Archived" }
          : pb,
      ),
    );
    toast.success(
      restoring
        ? `${p?.name} restored as draft`
        : `${p?.name} archived — audit trail preserved`,
    );
    setArchiveTarget(null);
    // Persist to server
    try {
      if (restoring) {
        await customAxios.put(`${endpoint.playbooks.update}/${id}`, { status: "Draft" });
      } else {
        await customAxios.delete(`${endpoint.playbooks.delete}/${id}`);
      }
    } catch {
      // Optimistic — local state already updated
    }
  };

  const handleCreate = async (data: {
    name: string;
    service: string;
    mode: Playbook["mode"];
    owner: string;
  }) => {
    const localId = nextPlaybookId(playbooks);
    const localDraft: Playbook = {
      id: localId,
      name: data.name,
      service: data.service,
      status: "Draft",
      mode: data.mode,
      success: 0,
      executed: 0,
      priority: 2,
      trigger: "Manual",
      owner: data.owner,
      version: "v0.1",
      updated: "Just now",
      env: ["Production", "Staging"],
      rules: [],
      maxAuto: 3,
      rollback: false,
      approvers: ["Incident commander"],
      mttr: "—",
      approvalTime: "—",
      rollbackRate: "0%",
      failures: 0,
      modules: { Investigation: [], Decision: [], Execution: [], Verification: [], Knowledge: [] },
      desc: `Investigates ${data.name.toLowerCase()}, reconstructs contributing events, validates infrastructure health, determines safe remediation, executes approved recovery actions, and verifies production stability before closure.`,
      incidentTypes: ["Automatic", "Service"],
      created: "Just now",
    };

    // Optimistic add
    setPlaybooks((prev) => [...prev, localDraft]);
    setShowCreate(false);
    setPage(1);

    try {
      const res = await customAxios.post(endpoint.playbooks.create, {
        name: data.name,
        service: data.service,
        mode: data.mode,
        owner: data.owner,
      });
      const created = res.data?.data ?? res.data;
      if (created?.id) {
        setPlaybooks((prev) =>
          prev.map((p) => (p.id === localId ? mapApiPlaybook(created, 0) : p))
        );
        toast.success(`${data.name} created as draft ${created.id}`);
      } else {
        toast.success(`${data.name} created as draft ${localId}`);
      }
    } catch {
      toast.success(`${data.name} created as draft ${localId}`);
    }
  };

  const handleExport = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            count: filtered.length,
            playbooks: filtered,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scrubbe-playbooks-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(
      `Exported ${filtered.length} playbooks with current filters applied`,
    );
  };

  return (
    <main className="p-4 sm:p-6 pb-24 max-w-[1600px] mx-auto space-y-6 font-ibm">
      {/* Page head */}
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <p className="text-sm text-zinc-500 max-w-2xl">
          Governed operational workflows that define how Scrubbe investigates,
          coordinates, validates, and executes incident response across your
          engineering ecosystem.
        </p>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Create playbook
        </Button>
      </div>

      {/* Stats */}
      <StatsStrip
        playbooks={playbooks}
        onFilterStatus={(status) => {
          if (status === null) {
            clearAllFilters();
          } else {
            setFilters((prev) => ({ ...prev, status: new Set([status]) }));
            setPage(1);
          }
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            size={15}
          />
          <input
            type="text"
            placeholder="Search playbooks…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-[42px] pl-10 pr-9 rounded-lg border border-zinc-300 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <Button
          size="sm"
          variant="outline-dark"
          onClick={() => setShowVersions(true)}
          className="rounded-sm"
        >
          <History size={14} /> Version history
        </Button>
        <Button
          size="sm"
          variant="outline-dark"
          onClick={() => setShowImport(true)}
          className="rounded-sm"
        >
          <Upload size={14} /> Import
        </Button>
        <Button
          size="sm"
          variant="outline-dark"
          onClick={handleExport}
          className="rounded-sm"
        >
          <Download size={14} /> Export
        </Button>
        <div className="flex border border-zinc-300 rounded-lg overflow-hidden ml-auto">
          {(["playbooks", "modules"] as LibraryTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              {t === "playbooks" ? "Playbooks" : "Module library"}
            </button>
          ))}
        </div>
      </div>

      {tab === "playbooks" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-3">
            <FilterRail
              filters={filters}
              onFilterChange={(updater) => {
                setFilters(updater);
                setPage(1);
              }}
              onClear={clearAllFilters}
              dataList={playbooks}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="w-full mt-2 text-xs font-semibold text-center text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-lg py-2 hover:bg-zinc-50 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="lg:col-span-9">
            <PlaybookTable
              rows={pageRows}
              total={filtered.length}
              page={safePage}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              onDuplicate={handleDuplicate}
              onArchiveToggle={(id) => {
                const p = playbooks.find((x) => x.id === id) ?? null;
                setArchiveTarget(p);
              }}
            />
          </div>
        </div>
      ) : (
        <ModuleLibrary onOpenModule={setOpenModule} />
      )}

      {/* Modals & drawer */}
      <CreatePlaybookModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
      <ImportPlaybookModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImported={(fileName) => {
          setShowImport(false);
          toast.success(
            `${fileName} imported — 1 playbook created as draft, pending governance review`,
          );
        }}
      />
      <VersionHistoryModal
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
      />
      <ArchiveModal
        playbook={archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
      />
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
    </main>
  );
}
