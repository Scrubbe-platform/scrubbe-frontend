/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Modal from "@/components/ui/Modal";
import { useCurrentUser, User } from "@/lib/api";
import { EZRA, Group, MEMBER_OF, SEED_GROUPS, readiness, riskTag } from "./data";
import { ChipRow, EscalationLadder, GroupListCard, IncidentList, KVGrid, MembersTable, OnCallCard, ReadinessBlock, Stars, Tag } from "./sections";
import {
  AddMemberForm,
  CreateGroupData,
  CreateGroupForm,
  DeleteConfirm,
  EditGeneralForm,
  EscalationEditor,
  EzraProfileModal,
  ItemReferenceModal,
  MergeForm,
  OnCallManagerForm,
  RenameForm,
  TransferManagerForm,
  UserProfileModal,
} from "./Modals";

type Role = "manager" | "member";

type ModalState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "rename" }
  | { kind: "transfer" }
  | { kind: "addMember" }
  | { kind: "merge" }
  | { kind: "delete" }
  | { kind: "escalation" }
  | { kind: "oncall" }
  | { kind: "editGeneral" }
  | { kind: "user"; idx: number }
  | { kind: "ezra" }
  | { kind: "item"; itemKind: string; name: string };

function ResponsibilitiesGrid({ items }: { items: [string, boolean][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
      {items.map(([label, on]) => (
        <div key={label} className="flex items-center gap-2.5 py-1.5 text-[13.5px] text-black dark:text-zinc-200">
          <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-emerald-600 bg-emerald-600" : "border-zinc-300 dark:border-zinc-700")}>
            {on && <Check size={11} className="text-white" />}
          </span>
          {label}
        </div>
      ))}
    </div>
  );
}

export default function AssignmentGroups() {
  const [groups, setGroups] = useState<Group[]>(SEED_GROUPS);
  const [role, setRole] = useState<Role>("manager");
  const [activeId, setActiveId] = useState<string>(SEED_GROUPS[0].id);
  const [showProfileMobile, setShowProfileMobile] = useState(false);

  const [search, setSearch] = useState("");
  const [fManager, setFManager] = useState("");
  const [fDept, setFDept] = useState("");
  const [fService, setFService] = useState("");
  const [fEnv, setFEnv] = useState("");
  const [fStatus, setFStatus] = useState("");

  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  function toast(msg: string) {
    setToastMsg(msg);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToastMsg(null), 2200);
  }

  const { execute: getUser } = useCurrentUser();
  const [currentUser, setCurrentUser] = useState<User | null>();
  useEffect(() => {
    (async () => {
      const resp = await getUser();
      setCurrentUser(resp as User);
    })();
  }, []);
  const currentUserName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim() || "You";

  const managerOptions = useMemo(() => Array.from(new Set(groups.map((g) => g.manager))).sort(), [groups]);
  const deptOptions = useMemo(() => Array.from(new Set(groups.map((g) => g.department))).sort(), [groups]);
  const serviceOptions = useMemo(() => Array.from(new Set(groups.map((g) => g.primaryService))).sort(), [groups]);
  const envOptions = useMemo(() => Array.from(new Set(groups.map((g) => g.env))).sort(), [groups]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter((g) => {
      if (q && !(g.name.toLowerCase().includes(q) || g.manager.toLowerCase().includes(q) || g.primaryService.toLowerCase().includes(q))) return false;
      if (fManager && g.manager !== fManager) return false;
      if (fDept && g.department !== fDept) return false;
      if (fService && g.primaryService !== fService) return false;
      if (fEnv && g.env !== fEnv) return false;
      if (fStatus && g.status !== fStatus) return false;
      if (role === "member" && !MEMBER_OF.has(g.id)) return false;
      return true;
    });
  }, [groups, search, fManager, fDept, fService, fEnv, fStatus, role]);

  useEffect(() => {
    if (role === "member" && !MEMBER_OF.has(activeId)) {
      const first = Array.from(MEMBER_OF)[0];
      if (first) setActiveId(first);
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateGroup(id: string, fn: (g: Group) => Group) {
    setGroups((prev) => prev.map((g) => (g.id === id ? fn(g) : g)));
  }

  function selectGroup(id: string) {
    setActiveId(id);
    setShowProfileMobile(true);
  }

  const group = groups.find((g) => g.id === activeId);
  const isManager = role === "manager";

  function closeModal() {
    setModal({ kind: "none" });
  }

  function handleRename(name: string, description: string) {
    if (!group) return;
    updateGroup(group.id, (g) => ({ ...g, name, description }));
    closeModal();
    toast("Saved");
  }
  function handleArchiveToggle() {
    if (!group) return;
    const nextStatus = group.status === "Archived" ? "Active" : "Archived";
    updateGroup(group.id, (g) => ({ ...g, status: nextStatus }));
    toast(nextStatus === "Archived" ? "Group archived" : "Group restored");
  }
  function handleTransfer(name: string) {
    if (!group) return;
    updateGroup(group.id, (g) => ({ ...g, manager: name }));
    closeModal();
    toast("Manager transferred");
  }
  function handleAddMember(m: { name: string; role: string; availability: any; oncall: boolean; incidents: number }) {
    if (!group) return;
    updateGroup(group.id, (g) => ({ ...g, members: [...g.members, m] }));
    closeModal();
    toast("Member added");
  }
  function handleRemoveMember(idx: number) {
    if (!group) return;
    const removed = group.members[idx];
    updateGroup(group.id, (g) => {
      const members = g.members.filter((_, i) => i !== idx);
      const oncall = g.oncall.name === removed?.name ? { name: null, ends: null } : g.oncall;
      return { ...g, members, oncall };
    });
    toast("Member removed");
  }
  function handleMerge(sourceId: string) {
    if (!group) return;
    const src = groups.find((g) => g.id === sourceId);
    if (!src) return;
    updateGroup(group.id, (g) => ({ ...g, members: [...g.members, ...src.members.filter((m) => !g.members.some((x) => x.name === m.name))] }));
    updateGroup(sourceId, (g) => ({ ...g, status: "Archived" }));
    closeModal();
    toast(`Merged ${src.name} into ${group.name}`);
  }
  function handleDelete() {
    if (!group) return;
    const remaining = groups.filter((g) => g.id !== group.id);
    setGroups(remaining);
    setActiveId(remaining[0]?.id ?? "");
    closeModal();
    toast("Group deleted");
    setShowProfileMobile(false);
  }
  function handleCreate(data: CreateGroupData) {
    const id = "ag-" + Date.now();
    const newGroup: Group = {
      id,
      name: data.name,
      status: "Active",
      env: data.env,
      description: data.description || "—",
      manager: data.manager,
      department: data.department || "—",
      businessUnit: data.businessUnit || "—",
      primaryService: data.primaryService || "—",
      members: [{ name: data.manager, role: data.role, availability: "Online", oncall: true, incidents: 0 }],
      responsibilities: [["Production Deployments", true]],
      services: [],
      assets: [],
      playbooks: [],
      rules: [],
      escalation: [data.role, "Incident Commander", "Engineering Manager", "CTO"],
      oncall: { name: data.manager, ends: "Tomorrow · 09:00 UTC" },
      ezra: { enabled: true, assigned: 0 },
      activeIncidents: [],
      history: [],
      expertise: [["General", 3]],
      knowledge: ["Services", "Assets"],
      permissions: [["Emergency Changes", false], ["Deployment Changes", false], ["Rollback", false], ["Production Restart", false]],
    };
    setGroups((prev) => [newGroup, ...prev]);
    setActiveId(id);
    closeModal();
    toast("Group created");
  }
  function handleEscalationSave(levels: string[]) {
    if (!group || !levels.length) {
      toast("Add at least one level");
      return;
    }
    updateGroup(group.id, (g) => ({ ...g, escalation: levels }));
    closeModal();
    toast("Escalation path saved");
  }
  function handleOncallSave(name: string | null, ends: string) {
    if (!group) return;
    updateGroup(group.id, (g) => ({ ...g, members: g.members.map((m) => ({ ...m, oncall: m.name === name })), oncall: name ? { name, ends } : { name: null, ends: null } }));
    closeModal();
    toast(name ? `On-call set to ${name}` : "On-call cleared");
  }
  function handleEditGeneral(patch: Partial<Group>) {
    if (!group) return;
    updateGroup(group.id, (g) => ({ ...g, ...patch }));
    closeModal();
    toast("Changes saved");
  }
  function handleToggleMemberOncall(idx: number) {
    if (!group) return;
    const m = group.members[idx];
    if (!m) return;
    const willOn = !m.oncall;
    updateGroup(group.id, (g) => ({
      ...g,
      members: g.members.map((x, i) => (i === idx ? { ...x, oncall: willOn } : willOn ? { ...x, oncall: false } : x)),
      oncall: willOn ? { name: m.name, ends: g.oncall.ends || "Tomorrow · 09:00 UTC" } : g.oncall.name === m.name ? { name: null, ends: null } : g.oncall,
    }));
    closeModal();
    toast(willOn ? `On-call set to ${m.name}` : "On-call cleared");
  }
  function handleEzraToggle() {
    if (!group) return;
    updateGroup(group.id, (g) => ({ ...g, ezra: { ...g.ezra, enabled: !g.ezra.enabled } }));
    closeModal();
    toast(!group.ezra.enabled ? "Ezra assignment enabled" : "Ezra assignment paused");
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-950">
      <Header title="Assignment Groups" />

      <div className="bg-white px-4 py-4 shadow-sm shadow-light dark:bg-zinc-950 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-[22px] font-semibold leading-tight text-black dark:text-zinc-100">Assignment Groups</h1>
            <p className="mt-1 text-[12.5px] text-black dark:text-zinc-400">Operational ownership, responsibilities &amp; team structure.</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800">
              {(["manager", "member"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn("px-3.5 py-1.5 text-[12px] transition-colors", role === r ? "bg-emerald-600 text-white" : "bg-white text-black dark:bg-transparent dark:text-zinc-300")}
                >
                  {r === "manager" ? "Manager · Admin" : "Member"}
                </button>
              ))}
            </div>
            {role === "manager" && (
              <button onClick={() => setModal({ kind: "create" })} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-emerald-700">
                <Plus size={14} /> New assignment group
              </button>
            )}
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full max-w-[280px]">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-black dark:text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignment groups…"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-2.5 text-[12.5px] text-black placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200"
            />
          </div>
          {[
            { value: fManager, set: setFManager, label: "Manager", opts: managerOptions },
            { value: fDept, set: setFDept, label: "Department", opts: deptOptions },
            { value: fService, set: setFService, label: "Service", opts: serviceOptions },
            { value: fEnv, set: setFEnv, label: "Environment", opts: envOptions },
          ].map(({ value, set, label, opts }) => (
            <select key={label} value={value} onChange={(e) => set(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12.5px] text-black dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
              <option value="">{label}</option>
              {opts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ))}
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12.5px] text-black dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <option value="">Active &amp; archived</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-5 lg:grid-cols-[360px_1fr]">
        {/* List */}
        <aside className={cn("min-h-0 overflow-y-auto rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/20", showProfileMobile && "hidden lg:block")}>
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            <span>{filtered.length} group{filtered.length === 1 ? "" : "s"}</span>
            {role === "member" && <span>Your teams</span>}
          </div>
          {!filtered.length && <p className="px-2 py-8 text-[12.5px] text-black dark:text-zinc-500">No assignment groups match these filters.</p>}
          {filtered.map((g) => (
            <GroupListCard key={g.id} group={g} active={g.id === activeId} onClick={() => selectGroup(g.id)} />
          ))}
        </aside>

        {/* Profile */}
        <main className={cn("min-h-0 overflow-y-auto rounded-xl bg-zinc-50 dark:bg-zinc-900/20", !showProfileMobile && "hidden lg:block")}>
          {!group ? (
            <p className="p-8 text-[13px] text-black dark:text-zinc-500">Select a group to view its profile.</p>
          ) : (
            <div className="mx-auto max-w-3xl px-5 pb-14 pt-5 sm:px-7">
              <button onClick={() => setShowProfileMobile(false)} className="mb-3 flex items-center gap-1.5 font-mono text-[12px] text-black hover:text-emerald-600 dark:text-zinc-400 lg:hidden">
                <ChevronLeft size={14} /> Groups
              </button>

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div>
                  <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wide text-black dark:text-zinc-500">Operational Team</div>
                  <h2 className="mb-2 text-[27px] font-semibold leading-tight text-black dark:text-zinc-100">{group.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag label={group.status} tone={group.status === "Active" ? "ok" : "neutral"} />
                    <Tag label={group.env} tone="neutral" dot={false} />
                    <Tag label={`${group.members.length} members`} tone="neutral" dot={false} />
                  </div>
                </div>
                {isManager && (
                  <button onClick={() => setModal({ kind: "editGeneral" })} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                    Edit
                  </button>
                )}
              </div>

              {!isManager && MEMBER_OF.has(group.id) && (
                <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-[13px] text-black dark:bg-emerald-500/10 dark:text-zinc-200">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" /> You are a member of this team.
                </div>
              )}

              <div className="mt-5">
                <ReadinessBlock group={group} allGroups={groups} />
              </div>

              <div>
                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">General</h3>
                  <KVGrid
                    rows={[
                      ["Name", group.name],
                      ["Manager", group.manager],
                      ["Department", group.department],
                      ["Business Unit", group.businessUnit],
                      ["Primary Service", group.primaryService],
                      ["Status", group.status],
                      ["Description", group.description, true],
                    ]}
                  />
                </div>

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Members</h3>
                  <MembersTable
                    group={group}
                    isManager={isManager}
                    onUserClick={(idx) => setModal({ kind: "user", idx })}
                    onEzraClick={() => setModal({ kind: "ezra" })}
                    onRemove={handleRemoveMember}
                  />
                  {group.ezra && (
                    <div className="mt-3.5 flex items-start gap-2.5 rounded-lg bg-zinc-50 px-3.5 py-3 text-[12.5px] text-black dark:bg-zinc-900/60 dark:text-zinc-300">
                      <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">●</span>
                      <p>
                        <b className="font-semibold text-black dark:text-zinc-100">Ezra is a governed service identity.</b> It can be assigned incidents in this team and acts under delegated, approval-gated authority — every action is
                        RBAC-scoped and audited. It never counts toward human on-call or Incident Commander coverage.
                      </p>
                    </div>
                  )}
                  {isManager && (
                    <div className="mt-3.5 flex gap-2">
                      <button onClick={() => setModal({ kind: "addMember" })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-700">
                        Add member
                      </button>
                      <button onClick={() => setModal({ kind: "transfer" })} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Transfer manager
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Primary Responsibilities</h3>
                  <ResponsibilitiesGrid items={group.responsibilities} />
                </div>

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Owned Services</h3>
                  <ChipRow items={group.services} onClick={(name) => setModal({ kind: "item", itemKind: "Service Catalog", name })} />
                </div>
                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Owned Assets</h3>
                  <ChipRow items={group.assets} onClick={(name) => setModal({ kind: "item", itemKind: "Asset Inventory", name })} />
                </div>
                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Owned Playbooks</h3>
                  <ChipRow items={group.playbooks} onClick={(name) => setModal({ kind: "item", itemKind: "Playbook Library", name })} />
                </div>
                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Inherited Operational Rules</h3>
                  <ChipRow items={group.rules} onClick={(name) => setModal({ kind: "item", itemKind: "Operational Rules", name })} />
                </div>

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <div className="mb-4 flex items-center gap-2.5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Escalation Policy</h3>
                    <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                    {isManager && (
                      <button onClick={() => setModal({ kind: "escalation" })} className="text-[12px] font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                        Edit path →
                      </button>
                    )}
                  </div>
                  <EscalationLadder levels={group.escalation} />
                </div>

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <div className="mb-4 flex items-center gap-2.5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">On-call Rotation</h3>
                    <span className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <OnCallCard
                    oncall={group.oncall}
                    action={
                      isManager ? (
                        <button
                          onClick={() => setModal({ kind: "oncall" })}
                          className={cn("shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium", group.oncall.name ? "border border-zinc-300 text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200" : "bg-emerald-600 text-white hover:bg-emerald-700")}
                        >
                          {group.oncall.name ? "Manage rotation →" : "Assign on-call →"}
                        </button>
                      ) : undefined
                    }
                  />
                </div>

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Operational Expertise</h3>
                  <p className="mb-3 text-[12px] text-black dark:text-zinc-500">Ezra uses this profile when assigning responders and recommending teams.</p>
                  <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                    {group.expertise.map(([name, n]) => (
                      <div key={name} className="flex items-center justify-between border-b border-zinc-100 py-2 dark:border-zinc-800">
                        <span className="text-[13.5px] text-black dark:text-zinc-200">{name}</span>
                        <Stars n={n} />
                      </div>
                    ))}
                  </div>
                </div>

                {(group.activeIncidents.length > 0 || group.history.length > 0) && (
                  <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Active Incidents</h3>
                    <IncidentList items={group.activeIncidents} kind="active" />
                  </div>
                )}

                <div className="border-b border-zinc-100 py-6 dark:border-zinc-800">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Related Knowledge</h3>
                  <ChipRow items={group.knowledge} />
                </div>

                {isManager && (
                  <div className="py-6">
                    <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">Admin Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setModal({ kind: "rename" })} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Rename group
                      </button>
                      <button onClick={handleArchiveToggle} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        {group.status === "Archived" ? "Unarchive" : "Archive"} group
                      </button>
                      <button onClick={() => setModal({ kind: "transfer" })} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Transfer ownership
                      </button>
                      <button onClick={() => setModal({ kind: "merge" })} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Merge groups
                      </button>
                      <button onClick={() => setModal({ kind: "delete" })} className="rounded-lg border border-rose-200 px-3 py-1.5 text-[12px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10">
                        Delete group
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={modal.kind !== "none"} onClose={closeModal}>
        {group && modal.kind === "rename" && <RenameForm group={group} onSave={handleRename} onCancel={closeModal} />}
        {group && modal.kind === "transfer" && <TransferManagerForm group={group} onSave={handleTransfer} onCancel={closeModal} />}
        {modal.kind === "addMember" && <AddMemberForm onSave={handleAddMember} onCancel={closeModal} />}
        {group && modal.kind === "merge" && <MergeForm group={group} others={groups.filter((g) => g.id !== group.id && g.status === "Active")} onSave={handleMerge} onCancel={closeModal} />}
        {group && modal.kind === "delete" && <DeleteConfirm name={group.name} onCancel={closeModal} onConfirm={handleDelete} />}
        {modal.kind === "create" && <CreateGroupForm defaultManager={currentUserName} onCreate={handleCreate} onCancel={closeModal} />}
        {group && modal.kind === "escalation" && <EscalationEditor levels={group.escalation} onSave={handleEscalationSave} onCancel={closeModal} />}
        {group && modal.kind === "oncall" && <OnCallManagerForm group={group} onSave={handleOncallSave} onCancel={closeModal} />}
        {group && modal.kind === "editGeneral" && <EditGeneralForm group={group} onSave={handleEditGeneral} onCancel={closeModal} />}
        {group && modal.kind === "user" && (
          <UserProfileModal
            member={group.members[modal.idx]}
            idx={modal.idx}
            group={group}
            allGroups={groups}
            isManager={isManager}
            onToggleOncall={() => handleToggleMemberOncall(modal.idx)}
            onRemove={() => {
              handleRemoveMember(modal.idx);
              closeModal();
            }}
          />
        )}
        {group && modal.kind === "ezra" && <EzraProfileModal group={group} isManager={isManager} onToggle={handleEzraToggle} />}
        {group && modal.kind === "item" && <ItemReferenceModal kind={modal.itemKind} name={modal.name} group={group} />}
      </Modal>

      <div
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[70] max-w-[80vw] -translate-x-1/2 rounded-lg bg-black px-4 py-2.5 text-center font-mono text-[12.5px] text-white shadow-lg transition-all duration-200",
          toastMsg ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {toastMsg}
      </div>
    </div>
  );
}
