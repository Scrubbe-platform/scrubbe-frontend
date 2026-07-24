/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/select";
import { useCurrentUser, User } from "@/lib/api";
import { Group, MEMBER_OF, SEED_GROUPS } from "./data";
import { ChipRow, EscalationLadder, GroupListRow, KVGrid, MembersTable, OnCallCard, ReadinessBlock, SectionCard, Stars, Tag } from "./sections";
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
  const isManager = (currentUser?.roles ?? []).some((r) => r === "ADMIN" || r === "SUPER_ADMIN");

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
      if (!isManager && !MEMBER_OF.has(g.id)) return false;
      return true;
    });
  }, [groups, search, fManager, fDept, fService, fEnv, fStatus, isManager]);

  useEffect(() => {
    if (!isManager && !MEMBER_OF.has(activeId)) {
      const first = Array.from(MEMBER_OF)[0];
      if (first) setActiveId(first);
    }
  }, [isManager]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateGroup(id: string, fn: (g: Group) => Group) {
    setGroups((prev) => prev.map((g) => (g.id === id ? fn(g) : g)));
  }

  function selectGroup(id: string) {
    setActiveId(id);
    setShowProfileMobile(true);
  }

  const group = groups.find((g) => g.id === activeId);

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
      description: data.description || "---",
      manager: data.manager,
      department: data.department || "---",
      businessUnit: data.businessUnit || "---",
      primaryService: data.primaryService || "---",
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
    <div className="flex h-screen flex-col bg-white font-ibm dark:bg-zinc-950">
      <Header title="Assignment Groups" />

      <div className="bg-white px-4 py-4 shadow-sm shadow-light dark:bg-zinc-950 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 text-[22px] font-semibold leading-tight text-black dark:text-zinc-100">
              Assignment Groups
              {!isManager && (
                <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-black/50 dark:border-zinc-700 dark:text-zinc-500">Member view</span>
              )}
            </h1>
            <p className="mt-1 text-[14px] text-black/60 dark:text-zinc-400">Operational ownership, responsibilities &amp; team structure.</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            {isManager && (
              <button onClick={() => setModal({ kind: "create" })} className="flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-emerald-700">
                <Plus size={14} /> New assignment group
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[300px]">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignment groups…"
              className="w-full rounded-md border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-[13.5px] text-black placeholder:text-black/40 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
            />
          </div>
          <div className="w-[160px] shrink-0">
            <Select value={fManager} onChange={(e) => setFManager(e.target.value)} options={[{ value: "", label: "Manager" }, ...managerOptions.map((o) => ({ value: o, label: o }))]} placeholder="Manager" />
          </div>
          <div className="w-[160px] shrink-0">
            <Select value={fDept} onChange={(e) => setFDept(e.target.value)} options={[{ value: "", label: "Department" }, ...deptOptions.map((o) => ({ value: o, label: o }))]} placeholder="Department" />
          </div>
          <div className="w-[150px] shrink-0">
            <Select value={fService} onChange={(e) => setFService(e.target.value)} options={[{ value: "", label: "Service" }, ...serviceOptions.map((o) => ({ value: o, label: o }))]} placeholder="Service" />
          </div>
          <div className="w-[150px] shrink-0">
            <Select value={fEnv} onChange={(e) => setFEnv(e.target.value)} options={[{ value: "", label: "Environment" }, ...envOptions.map((o) => ({ value: o, label: o }))]} placeholder="Environment" />
          </div>
          <div className="w-[170px] shrink-0">
            <Select
              value={fStatus}
              onChange={(e) => setFStatus(e.target.value)}
              options={[
                { value: "", label: "Active & archived" },
                { value: "Active", label: "Active" },
                { value: "Archived", label: "Archived" },
              ]}
              placeholder="Active & archived"
            />
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-5 lg:grid-cols-[360px_1fr]">
        {/* List */}
        <aside className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm shadow-light dark:bg-zinc-900/40", showProfileMobile && "hidden lg:flex")}>
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              {filtered.length} group{filtered.length === 1 ? "" : "s"}
            </span>
            {!isManager && <span className="ml-auto text-[12px] text-black/50 dark:text-zinc-500">Your teams</span>}
          </div>
          <div className="flex-1 overflow-y-auto">
            {!filtered.length && <p className="px-5 py-10 text-center text-[12.5px] leading-relaxed text-black dark:text-zinc-500">No assignment groups match these filters.</p>}
            {filtered.map((g) => (
              <GroupListRow key={g.id} group={g} active={g.id === activeId} onClick={() => selectGroup(g.id)} />
            ))}
          </div>
        </aside>

        {/* Profile */}
        <main className={cn("min-h-0 overflow-y-auto rounded-lg bg-zinc-50 dark:bg-zinc-900/20", !showProfileMobile && "hidden lg:block")}>
          {!group ? (
            <p className="p-8 text-[13px] text-black dark:text-zinc-500">Select a group to view its profile.</p>
          ) : (
            <div className="mx-auto max-w-5xl px-5 py-5 pb-14 sm:px-7">
              <button onClick={() => setShowProfileMobile(false)} className="mb-3 flex items-center gap-1.5 text-[12px] text-black hover:text-emerald-600 dark:text-zinc-400 lg:hidden">
                <ChevronLeft size={14} /> Groups
              </button>

              <div className="rounded-lg bg-white p-7 shadow-sm shadow-light dark:bg-zinc-900/60">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">Operational Team</div>
                    <h2 className="mb-2 text-[28px] font-bold leading-tight text-black dark:text-zinc-100">{group.name}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag label={group.status} tone={group.status === "Active" ? "ok" : "neutral"} />
                      <Tag label={group.env} tone="neutral" dot={false} />
                      <Tag label={`${group.members.length} members`} tone="neutral" dot={false} />
                    </div>
                  </div>
                  {isManager && (
                    <button onClick={() => setModal({ kind: "editGeneral" })} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                      Edit
                    </button>
                  )}
                </div>

                {!isManager && MEMBER_OF.has(group.id) && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-md bg-emerald-50 px-3.5 py-2.5 text-[13px] text-black dark:bg-emerald-500/10 dark:text-zinc-200">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" /> You are a member of this team.
                  </div>
                )}
              </div>

              <div className="mt-4">
                <ReadinessBlock group={group} allGroups={groups} />
              </div>

              <div className="mt-4 rounded-lg bg-white p-7 shadow-sm shadow-light dark:bg-zinc-900/60">
                <SectionCard eyebrow="General">
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
                </SectionCard>

                <SectionCard eyebrow="Members">
                  <MembersTable group={group} isManager={isManager} onUserClick={(idx) => setModal({ kind: "user", idx })} onEzraClick={() => setModal({ kind: "ezra" })} onRemove={handleRemoveMember} />
                  {group.ezra && (
                    <div className="mt-3.5 flex items-start gap-2.5 rounded-md bg-zinc-50 px-3.5 py-3 text-[12.5px] text-black dark:bg-zinc-900/60 dark:text-zinc-300">
                      <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">●</span>
                      <p>
                        <b className="font-semibold text-black dark:text-zinc-100">Ezra is a governed service identity.</b> It can be assigned incidents in this team and acts under delegated, approval-gated authority — every action is
                        RBAC-scoped and audited. It never counts toward human on-call or Incident Commander coverage.
                      </p>
                    </div>
                  )}
                  {isManager && (
                    <div className="mt-3.5 flex gap-2">
                      <button onClick={() => setModal({ kind: "addMember" })} className="rounded-md bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-700">
                        Add member
                      </button>
                      <button onClick={() => setModal({ kind: "transfer" })} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Transfer manager
                      </button>
                    </div>
                  )}
                </SectionCard>

                <SectionCard eyebrow="Primary Responsibilities">
                  <ResponsibilitiesGrid items={group.responsibilities} />
                </SectionCard>

                <SectionCard eyebrow="Owned Services">
                  <ChipRow items={group.services} onClick={(name) => setModal({ kind: "item", itemKind: "Service Catalog", name })} />
                </SectionCard>
                <SectionCard eyebrow="Owned Assets">
                  <ChipRow items={group.assets} onClick={(name) => setModal({ kind: "item", itemKind: "Asset Inventory", name })} />
                </SectionCard>
                <SectionCard eyebrow="Owned Playbooks">
                  <ChipRow items={group.playbooks} onClick={(name) => setModal({ kind: "item", itemKind: "Playbook Library", name })} />
                </SectionCard>
                <SectionCard eyebrow="Inherited Operational Rules">
                  <ChipRow items={group.rules} onClick={(name) => setModal({ kind: "item", itemKind: "Operational Rules", name })} />
                </SectionCard>

                <SectionCard eyebrow="Escalation Policy" right={isManager && (
                  <button onClick={() => setModal({ kind: "escalation" })} className="text-[12px] font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                    Edit path →
                  </button>
                )}>
                  <EscalationLadder levels={group.escalation} />
                </SectionCard>

                <SectionCard eyebrow="On-call Rotation">
                  <OnCallCard
                    oncall={group.oncall}
                    action={
                      isManager ? (
                        <button
                          onClick={() => setModal({ kind: "oncall" })}
                          className={cn("shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-medium", group.oncall.name ? "border border-zinc-300 text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200" : "bg-emerald-600 text-white hover:bg-emerald-700")}
                        >
                          {group.oncall.name ? "Manage rotation →" : "Assign on-call →"}
                        </button>
                      ) : undefined
                    }
                  />
                </SectionCard>

                <SectionCard eyebrow="Operational Expertise" note="Signals for responder assignment">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
                    {group.expertise.map(([name, n]) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-[13.5px] text-black dark:text-zinc-200">{name}</span>
                        <Stars n={n} />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard eyebrow="Related Knowledge">
                  <ChipRow items={group.knowledge} />
                </SectionCard>

                {isManager && (
                  <SectionCard eyebrow="Admin Actions">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setModal({ kind: "rename" })} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Rename group
                      </button>
                      <button onClick={handleArchiveToggle} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        {group.status === "Archived" ? "Unarchive" : "Archive"} group
                      </button>
                      <button onClick={() => setModal({ kind: "transfer" })} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Transfer ownership
                      </button>
                      <button onClick={() => setModal({ kind: "merge" })} className="rounded-md border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200">
                        Merge groups
                      </button>
                      <button onClick={() => setModal({ kind: "delete" })} className="rounded-md border border-rose-200 px-3 py-1.5 text-[12px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10">
                        Delete group
                      </button>
                    </div>
                  </SectionCard>
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
          "pointer-events-none fixed bottom-6 left-1/2 z-[70] max-w-[80vw] -translate-x-1/2 rounded-md bg-black px-4 py-2.5 text-center font-mono text-[12.5px] text-white shadow-lg transition-all duration-200",
          toastMsg ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {toastMsg}
      </div>
    </div>
  );
}
