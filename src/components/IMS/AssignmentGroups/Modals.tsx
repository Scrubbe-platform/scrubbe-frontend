"use client";

import React, { useState } from "react";
import { Copy, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Select from "@/components/ui/select";
import Switch from "@/components/ui/Switch";
import { Availability, EZRA, Group, ITEM_MODULE, Member, RULE_DESC, deriveUser, initialsOf } from "./data";
import { AvailabilityLabel, KVGrid } from "./sections";

const ROLE_OPTIONS = ["Platform Engineer", "Site Reliability Engineer", "Incident Commander", "Engineering Manager", "Security Engineer", "DevOps Engineer"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-[13.5px] text-black focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">{children}</h3>;
}
function ModalFoot({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2">{children}</div>;
}
function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[12.5px] text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {children}
    </button>
  );
}
function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-emerald-700">
      {children}
    </button>
  );
}
function DangerBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10">
      {children}
    </button>
  );
}

export function RenameForm({ group, onSave, onCancel }: { group: Group; onSave: (name: string, description: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  return (
    <div className="p-4">
      <ModalTitle>Rename group</ModalTitle>
      <div className="mt-4 space-y-3.5">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={cn(inputCls, "resize-y")} />
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => name.trim() && onSave(name.trim(), description.trim())}>Save</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function TransferManagerForm({ group, onSave, onCancel }: { group: Group; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(group.manager);
  return (
    <div className="p-4">
      <ModalTitle>Transfer manager</ModalTitle>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">Choose a team member to become the new manager of {group.name}.</p>
      <div className="mt-4">
        <Field label="New manager">
          <Select value={name} onChange={(e) => setName(e.target.value)} options={group.members.map((m) => ({ value: m.name, label: m.name }))} />
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => onSave(name)}>Transfer</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function AddMemberForm({ onSave, onCancel }: { onSave: (m: Member) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [availability, setAvailability] = useState<Availability>("Online");
  const [oncall, setOncall] = useState(false);
  return (
    <div className="p-4">
      <ModalTitle>Add member</ModalTitle>
      <div className="mt-4 space-y-3.5">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} />
          </Field>
          <Field label="Availability">
            <Select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
              options={[
                { value: "Online", label: "Online" },
                { value: "Away", label: "Away" },
                { value: "Offline", label: "Offline" },
              ]}
            />
          </Field>
        </div>
        <Field label="On-call">
          <Select
            value={oncall ? "yes" : "no"}
            onChange={(e) => setOncall(e.target.value === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
          />
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => name.trim() && onSave({ name: name.trim(), role, availability, oncall, incidents: 0 })}>Add member</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function MergeForm({ group, others, onSave, onCancel }: { group: Group; others: Group[]; onSave: (sourceId: string) => void; onCancel: () => void }) {
  const [sourceId, setSourceId] = useState(others[0]?.id ?? "");
  return (
    <div className="p-4">
      <ModalTitle>Merge groups</ModalTitle>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">Members of the selected group move into {group.name}; the source group is archived.</p>
      <div className="mt-4">
        <Field label="Merge from">
          <Select value={sourceId} onChange={(e) => setSourceId(e.target.value)} options={others.map((o) => ({ value: o.id, label: `${o.name} · ${o.members.length} members` }))} />
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => sourceId && onSave(sourceId)}>Merge</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function DeleteConfirm({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="p-4">
      <ModalTitle>Delete group</ModalTitle>
      <p className="mt-2 text-[13px] text-black dark:text-zinc-300">
        Delete <b>{name}</b>? This removes the team and its ownership assignments. This can&apos;t be undone.
      </p>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <DangerBtn onClick={onConfirm}>Delete</DangerBtn>
      </ModalFoot>
    </div>
  );
}

export interface CreateGroupData {
  name: string;
  description: string;
  manager: string;
  primaryService: string;
  department: string;
  businessUnit: string;
  env: string;
  role: string;
}

export function CreateGroupForm({ defaultManager, onCreate, onCancel }: { defaultManager: string; onCreate: (d: CreateGroupData) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [manager, setManager] = useState("");
  const [primaryService, setPrimaryService] = useState("");
  const [department, setDepartment] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [env, setEnv] = useState("Production");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);

  return (
    <div className="p-4">
      <ModalTitle>New assignment group</ModalTitle>
      <div className="mt-4 space-y-3.5">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Platform" className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What this team is responsible for" className={cn(inputCls, "resize-y")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Manager">
            <input value={manager} onChange={(e) => setManager(e.target.value)} placeholder={defaultManager} className={inputCls} />
          </Field>
          <Field label="Primary service">
            <input value={primaryService} onChange={(e) => setPrimaryService(e.target.value)} placeholder="e.g. Analytics" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Data" className={inputCls} />
          </Field>
          <Field label="Business unit">
            <input value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)} placeholder="e.g. Engineering" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Environment">
            <Select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              options={[
                { value: "Production", label: "Production" },
                { value: "Staging", label: "Staging" },
              ]}
            />
          </Field>
          <Field label="Default incident role">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "Platform Engineer", label: "Platform Engineer" },
                { value: "Incident Commander", label: "Incident Commander" },
                { value: "Site Reliability Engineer", label: "Site Reliability Engineer" },
              ]}
            />
          </Field>
        </div>
        <p className="text-[11.5px] text-black dark:text-zinc-500">You&apos;ll be added as the first member. Add the rest, escalation, rules and playbooks from the profile.</p>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn
          onClick={() =>
            name.trim() &&
            onCreate({
              name: name.trim(),
              description: description.trim(),
              manager: manager.trim() || defaultManager,
              primaryService: primaryService.trim(),
              department: department.trim(),
              businessUnit: businessUnit.trim(),
              env,
              role,
            })
          }
        >
          Create group
        </PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function EscalationEditor({ levels: initial, onSave, onCancel }: { levels: string[]; onSave: (levels: string[]) => void; onCancel: () => void }) {
  const [levels, setLevels] = useState(initial);
  return (
    <div className="p-4">
      <ModalTitle>Edit escalation path</ModalTitle>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">Ordered escalation, feeds Incident Delivery.</p>
      <div className="mt-4 space-y-2">
        {levels.map((lv, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-14 shrink-0 font-mono text-[11px] text-black dark:text-zinc-500">Level {i + 1}</span>
            <input value={lv} onChange={(e) => setLevels((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))} className={inputCls} />
            <button onClick={() => setLevels((prev) => prev.filter((_, j) => j !== i))} className="shrink-0 rounded p-1.5 text-black hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => setLevels((prev) => [...prev, ""])} className="mt-3 text-[12px] font-medium text-emerald-600 hover:underline dark:text-emerald-400">
        + Add level
      </button>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => onSave(levels.map((l) => l.trim()).filter(Boolean))}>Save path</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function OnCallManagerForm({ group, onSave, onCancel }: { group: Group; onSave: (name: string | null, ends: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(group.oncall.name ?? "");
  const [ends, setEnds] = useState(group.oncall.ends ?? "Tomorrow · 09:00 UTC");
  return (
    <div className="p-4">
      <ModalTitle>Manage on-call rotation</ModalTitle>
      <div className="mt-4 space-y-3.5">
        <Field label="Current on-call">
          <Select
            value={name}
            onChange={(e) => setName(e.target.value)}
            options={[{ value: "", label: "None (coverage gap)" }, ...group.members.map((m) => ({ value: m.name, label: `${m.name} · ${m.role}` }))]}
          />
        </Field>
        <Field label="Shift ends">
          <input value={ends} onChange={(e) => setEnds(e.target.value)} placeholder="e.g. Tomorrow · 09:00 UTC" className={inputCls} />
        </Field>
        <p className="text-[11.5px] text-black dark:text-zinc-500">Setting on-call updates Operational Readiness immediately.</p>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => onSave(name || null, ends.trim() || "---")}>Save rotation</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function EditGeneralForm({ group, onSave, onCancel }: { group: Group; onSave: (patch: Partial<Group>) => void; onCancel: () => void }) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [manager, setManager] = useState(group.manager);
  const [primaryService, setPrimaryService] = useState(group.primaryService);
  const [department, setDepartment] = useState(group.department);
  const [businessUnit, setBusinessUnit] = useState(group.businessUnit);
  const [env, setEnv] = useState(group.env);
  const [status, setStatus] = useState(group.status);

  return (
    <div className="p-4">
      <ModalTitle>Edit group</ModalTitle>
      <div className="mt-4 space-y-3.5">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={cn(inputCls, "resize-y")} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Manager">
            <input value={manager} onChange={(e) => setManager(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Primary service">
            <input value={primaryService} onChange={(e) => setPrimaryService(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Business unit">
            <input value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Environment">
            <Select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              options={[
                { value: "Production", label: "Production" },
                { value: "Staging", label: "Staging" },
              ]}
            />
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as Group["status"])}
              options={[
                { value: "Active", label: "Active" },
                { value: "Archived", label: "Archived" },
              ]}
            />
          </Field>
        </div>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn
          onClick={() =>
            name.trim() &&
            onSave({ name: name.trim(), description: description.trim(), manager: manager.trim() || group.manager, primaryService: primaryService.trim(), department: department.trim(), businessUnit: businessUnit.trim(), env, status })
          }
        >
          Save changes
        </PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function ItemReferenceModal({ kind, name, group }: { kind: string; name: string; group: Group }) {
  const [copied, setCopied] = useState(false);
  const moduleName = ITEM_MODULE[kind] || kind;
  const rows: [string, string][] = [["Owned by", group.name], ["Environment", group.env]];
  let extra = "Linked knowledge for this team.";
  const label = kind === "Knowledge" ? "Related knowledge" : kind.replace(" Catalog", "").replace(" Inventory", "").replace(" Library", "");
  if (kind === "Operational Rules") extra = RULE_DESC[name] || "Operational rule inherited by this team.";
  else if (kind === "Playbook Library") extra = "Team-owned recovery playbook. Steps and confidence live in the Playbook Library.";
  else if (kind === "Service Catalog") {
    rows.push(["Type", "Business service"]);
    extra = `${group.name} maintains this service.`;
  } else if (kind === "Asset Inventory") {
    rows.push(["Type", "Infrastructure asset"]);
    extra = `${group.name} owns this asset.`;
  }
  rows.push(["Notes", extra]);

  return (
    <div className="p-4">
      <ModalTitle>{name}</ModalTitle>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">
        {label} · maintained in {moduleName}
      </p>
      <div className="mt-4">
        <KVGrid rows={rows} />
      </div>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(name);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        <Copy size={12} /> {copied ? "Copied" : "Copy reference"}
      </button>
    </div>
  );
}

export function UserProfileModal({
  member,
  idx,
  group,
  allGroups,
  isManager,
  onToggleOncall,
  onRemove,
}: {
  member: Member;
  idx: number;
  group: Group;
  allGroups: Group[];
  isManager: boolean;
  onToggleOncall: () => void;
  onRemove: () => void;
}) {
  const u = deriveUser(member, allGroups);
  const oncallLabel = member.oncall ? `Yes${group.oncall.name === member.name && group.oncall.ends ? ` · until ${group.oncall.ends}` : ""}` : "No";
  const focus = group.expertise.slice(0, 3).map((e) => e[0]);
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-[16px] font-semibold text-white">{initialsOf(member.name)}</span>
        <div>
          <div className="text-[18px] font-semibold text-black dark:text-zinc-100">{member.name}</div>
          <div className="mt-0.5">
            <AvailabilityLabel availability={member.availability} /> <span className="text-black dark:text-zinc-500">· {member.role}</span>
          </div>
        </div>
      </div>
      <KVGrid
        rows={[
          ["On-call", oncallLabel],
          ["Current incidents", member.incidents],
          ["Email", <span key="e" className="font-mono text-[12.5px]">{u.email}</span>],
          ["Slack", <span key="s" className="font-mono text-[12.5px]">{u.slack}</span>],
          ["Timezone", u.tz],
          ["Location", u.loc],
          ["Reports to", group.manager],
          ["Primary team", group.name],
          ["Member of", <div key="m" className="mt-1 flex flex-wrap gap-1.5">{u.teams.map((t) => (<span key={t} className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[12px] text-black dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">{t}</span>))}</div>, true],
          ["Focus areas", <div key="f" className="mt-1 flex flex-wrap gap-1.5">{focus.map((f) => (<span key={f} className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[12px] text-black dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">{f}</span>))}</div>, true],
        ]}
      />
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(u.email);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="mt-3 text-[12px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        Copy email
      </button>
      {isManager && (
        <ModalFoot>
          <DangerBtn onClick={onRemove}>Remove from team</DangerBtn>
          <GhostBtn onClick={onToggleOncall}>{member.oncall ? "Clear on-call" : "Set as on-call"}</GhostBtn>
        </ModalFoot>
      )}
    </div>
  );
}

export function EzraProfileModal({ group, isManager, onToggle }: { group: Group; isManager: boolean; onToggle: () => void }) {
  const e = group.ezra ?? { enabled: false, assigned: 0 };
  return (
    <div className="p-4">
      <div className="mb-1 flex items-center gap-2">
        <ModalTitle>Service identity</ModalTitle>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600 dark:border-sky-500/30 dark:text-sky-400">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Governed
        </span>
      </div>
      <div className="mb-4 mt-3 flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-[16px] font-semibold text-white">E</span>
        <div>
          <div className="text-[18px] font-semibold text-black dark:text-zinc-100">Ezra</div>
          <div className="mt-0.5 inline-flex items-center gap-1.5 text-[12.5px] text-black dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> {EZRA.role} · Available 24/7
          </div>
        </div>
      </div>
      <KVGrid
        rows={[
          ["Identity type", "Service identity (non-human)"],
          ["Assigned incidents · this team", e.assigned],
          ["Model", <span key="m" className="font-mono text-[12.5px]">{EZRA.model}</span>],
          ["RBAC scope", EZRA.scope],
          ["Secrets access", <span key="s" className="text-rose-600 dark:text-rose-400">Deny by default</span>],
          ["Execution", "Propose · execute on approval"],
          ["On-call rotation", "Not eligible"],
          ["Reports into", group.manager],
          ["Governance", "Every action is RBAC-scoped, approval-gated and written to the audit trail.", true],
          ["Assignment status", e.enabled ? "Assignable to this team" : "Assignment paused", true],
        ]}
      />
      <p className="mt-3 text-[11.5px] text-black dark:text-zinc-500">Ezra can be assigned incidents like a responder, but never fills human on-call or Incident Commander requirements.</p>
      {isManager && (
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span className="text-[14px] font-semibold text-black dark:text-zinc-100">Assignable to this team</span>
          <Switch checked={e.enabled} onChange={onToggle} />
        </div>
      )}
    </div>
  );
}
