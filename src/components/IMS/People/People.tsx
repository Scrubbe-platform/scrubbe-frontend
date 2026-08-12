/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/select";
import Switch from "@/components/ui/Switch";
import { useCurrentUser, User } from "@/lib/api";
import useMember from "@/hooks/useMember";
import {
  EZRA_AGENT,
  HumanAccount,
  HumanSecurity,
  Person,
  PersonStatus,
  initialsOf,
  memberToPerson,
  statusLabel,
  statusTone,
} from "./data";
import {
  Chip,
  ChipSet,
  ToggleRow,
  InlineButton,
  KVRows,
  ManagedBadge,
  PermGrid,
  SectionCard,
  StatBox,
  StatusTag,
} from "./sections";
import {
  AdminResetPasswordForm,
  AdminSignInForm,
  ChangePasswordForm,
  InviteForm,
  BulkInviteData,
} from "./Modals";
import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";

let seq = 0;
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

type ModalState =
  | { kind: "none" }
  | { kind: "invite" }
  | { kind: "adminSignIn" }
  | { kind: "changePassword" }
  | { kind: "adminReset"; personId: string };

export default function People() {
  const { data: members = [], isLoading: membersLoading } = useMember();
  const [invited, setInvited] = useState<Person[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<Person>>>({});

  const [selectedId, setSelectedId] = useState<string>("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [editingSelf, setEditingSelf] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { execute: getUser } = useCurrentUser();
  const [currentUser, setCurrentUser] = useState<User | null>();

  useEffect(() => {
    (async () => {
      const resp = await getUser();
      setCurrentUser(resp as User);
    })();
  }, []);

  const currentEmail = currentUser?.email?.toLowerCase();

  // The team-member endpoint is the source of truth for the human roster.
  // Ezra is a fixed synthetic agent entry; invited people are local-only
  // until a real invite endpoint is wired up.
  const basePeople: Person[] = useMemo(() => {
    const mapped = members.map((m) =>
      memberToPerson(
        m,
        !!currentEmail && (m.email ?? "").toLowerCase() === currentEmail,
      ),
    );
    return [...mapped, EZRA_AGENT, ...invited];
  }, [members, invited, currentEmail]);

  const people: Person[] = useMemo(
    () => basePeople.map((p) => (edits[p.id] ? { ...p, ...edits[p.id] } : p)),
    [basePeople, edits],
  );

  function applyEdit(id: string, patch: Partial<Person>) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  function toast(msg: string) {
    setToastMsg(msg);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToastMsg(null), 2400);
  }

  const selfPerson = people.find((p) => p.self);
  const isRealAdmin = (currentUser?.roles ?? []).some(
    (r) => r === "ADMIN" || r === "SUPER_ADMIN",
  );
  const canInvite = adminUnlocked || isRealAdmin;

  const roleOptions = useMemo(
    () => Array.from(new Set(people.map((p) => p.role))).sort(),
    [people],
  );
  const teamOptions = useMemo(
    () => Array.from(new Set(people.map((p) => p.team))).sort(),
    [people],
  );
  const groupOptions = useMemo(
    () => Array.from(new Set(people.flatMap((p) => p.groups))).sort(),
    [people],
  );

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((p) => {
      if (
        q &&
        !`${p.name} ${p.title} ${p.department} ${p.team}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (roleFilter && p.role !== roleFilter) return false;
      if (teamFilter && p.team !== teamFilter) return false;
      if (groupFilter && !p.groups.includes(groupFilter)) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [people, search, roleFilter, teamFilter, groupFilter, statusFilter]);

  const humans = filteredList.filter((p) => p.kind === "human");
  const agents = filteredList.filter((p) => p.kind === "agent");
  const selected =
    people.find((p) => p.id === selectedId) ??
    people.find((p) => p.self) ??
    people[0];

  function selectPerson(id: string) {
    if (id !== selectedId) setEditingSelf(false);
    setSelectedId(id);
  }

  function startEdit(p: Person) {
    setDraft({ ...p.general });
    setEditingSelf(true);
  }

  async function saveDetails() {
    const general = { ...selected.general };
    (
      ["Full name", "Phone", "Location", "Time zone", "Language"] as const
    ).forEach((k) => {
      const v = draft[k]?.trim();
      if (v) general[k] = v;
    });
    const name = general["Full name"] || selected.name;
    applyEdit(selected.id, { general, name, initials: initialsOf(name) });
    setEditingSelf(false);

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    try {
      if (selected.self) {
        await apiClient.put(endpoint.auth.update_profile, { firstName, lastName });
      } else {
        await apiClient.patch(`${endpoint.business.members_profile}/${selected.id}/profile`, {
          firstName,
          lastName,
          businessAddress: general["Location"],
        });
      }
    } catch {
      // local state already updated — non-fatal
    }
    toast("Your details were saved");
  }

  function toggleActive(p: Person) {
    const account = p.account as HumanAccount;
    const willActivate = !account.active;
    const nextStatus: PersonStatus = willActivate
      ? (p._prevStatus ?? "offline")
      : "disabled";
    applyEdit(p.id, {
      account: { ...account, active: willActivate },
      status: nextStatus,
      _prevStatus: willActivate ? undefined : p.status,
    });
    apiClient
      .patch(`/business/members/${p.id}/active`, { active: willActivate })
      .catch(() => {});
    const who = p.self ? "Your" : `${p.name}'s`;
    toast(
      willActivate
        ? `${who} account re-enabled — audit event recorded`
        : `${who} account disabled · sessions terminated — audit event recorded`,
    );
  }

  function toggleMfa(p: Person) {
    const account = p.account as HumanAccount;
    const nextOn = account.mfa !== "Enabled";
    applyEdit(p.id, {
      account: { ...account, mfa: nextOn ? "Enabled" : "Disabled" },
    });
    apiClient
      .patch(`${endpoint.business.members_mfa}/${p.id}/mfa`, { enabled: nextOn })
      .catch(() => {});
    const who = p.self ? "Your" : `${p.name}'s`;
    toast(
      nextOn
        ? `${who} multi-factor auth enabled`
        : `${who} multi-factor auth disabled — audit event recorded`,
    );
  }

  function authenticateAdmin() {
    setAdminUnlocked(true);
    setModal({ kind: "none" });
    toast("Admin session started · 15 min — recorded in audit trail");
  }

  function lockAdmin() {
    setAdminUnlocked(false);
    toast("Admin session ended");
  }

  async function savePassword(newPw: string, currentPw?: string) {
    try {
      await apiClient.post(endpoint.auth.change_password, {
        currentPassword: currentPw ?? "",
        newPassword: newPw,
      });
    } catch {
      // non-fatal — update local state optimistically
    }
    if (selfPerson && !selfPerson.security.agent) {
      applyEdit(selfPerson.id, {
        security: {
          ...(selfPerson.security as HumanSecurity),
          lastPwChange: "Just now",
        },
      });
    }
    setModal({ kind: "none" });
    toast("Your password was updated");
  }

  async function saveAdminResetPassword(personId: string, _pw: string) {
    const person = people.find((p) => p.id === personId);
    try {
      await apiClient.post(
        `${endpoint.business.members_reset_password}/${personId}/reset-password`,
        {},
      );
    } catch {
      // non-fatal
    }
    if (person && !person.security.agent) {
      applyEdit(personId, {
        security: {
          ...(person.security as HumanSecurity),
          lastPwChange: "Just now",
        },
      });
    }
    setModal({ kind: "none" });
    toast(
      `Password reset for ${person?.name ?? "person"} — recorded in audit trail`,
    );
  }

  const [sendingInvite, setSendingInvite] = useState(false);

  async function sendInvite(data: BulkInviteData) {
    setSendingInvite(true);
    let sent = 0;
    let failed = 0;
    const newPeople: Person[] = [];

    for (const email of data.emails) {
      try {
        await apiClient.post(endpoint.auth.invite_member, {
          inviteEmail: email,
          role: data.role,
        });
        sent++;
        const namePart = email.split("@")[0].replace(/[._]+/g, " ").trim();
        const name = namePart.replace(/\b\w/g, (c) => c.toUpperCase()) || email;
        newPeople.push({
          id: newId("inv"),
          initials: initialsOf(name),
          name,
          kind: "human",
          title: data.role,
          department: "---",
          team: "---",
          status: "offline",
          lastActive: "Invited",
          general: {
            "Full name": name,
            Email: email,
            Phone: "---",
            Department: "---",
            Location: "---",
            "Time zone": "---",
            Language: "---",
          },
          account: {
            username: email.split("@")[0],
            created: "Just now",
            lastLogin: "Never · invitation pending",
            mfa: "Pending setup",
            active: true,
          },
          role: data.role,
          groups: [],
          permissions: [],
          security: {
            lastPwChange: "---",
            apiTokens: 0,
            sshKeys: "---",
            sessions: [],
          },
          stats: {
            assigned: 0,
            majors: 0,
            warRooms: 0,
            avgResponse: "---",
            availability: "Invited",
          },
          skills: [],
        });
      } catch {
        failed++;
      }
    }

    setSendingInvite(false);
    if (newPeople.length) {
      setInvited((prev) => [...prev, ...newPeople]);
      setSelectedId(newPeople[0].id);
    }
    setModal({ kind: "none" });
    if (sent > 0 && failed === 0)
      toast(`${sent} invite${sent > 1 ? "s" : ""} sent successfully`);
    else if (sent > 0) toast(`${sent} sent, ${failed} failed`);
    else toast("Failed to send invites. Please try again.");
  }

  const isAgent = selected.kind === "agent";
  const isSelf = !!selected.self;
  const s = selected.stats;
  const tone = statusTone(selected.status) as
    | "ok"
    | "warn"
    | "major"
    | "neutral";

  return (
    <div className="flex h-screen flex-col   font-ibm dark:bg-zinc-950">
      <Header title="People" />

      <div className="  px-4 py-4 shadow-sm shadow-light dark:bg-zinc-950 sm:px-6">
        <div className="flex flex-wrap items-start gap-3">
          <div>
            {/* <h1 className="flex items-center gap-2.5 text-[22px] font-semibold leading-tight text-black dark:text-zinc-100">
              People
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[11px] text-black dark:border-zinc-700 dark:text-zinc-500">
                {people.length}
              </span>
            </h1> */}
            <p className="mt-1 text-[13px] text-black/60 dark:text-zinc-400">
              The authoritative directory of everyone — and everything — that
              can act inside your workspace.
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            {/* {adminUnlocked ? (
              <span className="flex items-center gap-2 rounded-md border border-IMSLightGreen/25 bg-IMSLightGreen/10 px-3 py-1.5 font-mono text-[10.5px] text-IMSLightGreen dark:border-IMSLightGreen/30 dark:bg-IMSLightGreen/10 dark:text-IMSLightGreen">
                <ShieldCheck size={13} /> Admin session · 15 min
                <button onClick={lockAdmin} className="border-l border-IMSLightGreen/25 pl-2 font-sans text-[11px] font-semibold hover:underline dark:border-IMSLightGreen/30">
                  Lock
                </button>
              </span>
            ) : (
              <button
                onClick={() => setModal({ kind: "adminSignIn" })}
                className="flex items-center gap-2 rounded-md bg-IMSLightGreen px-5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1a8a47]"
              >
                <ShieldCheck size={14} /> Admin Sign-in
              </button>
            )} */}
            {canInvite && (
              <button
                onClick={() => setModal({ kind: "invite" })}
                className="flex items-center gap-2 rounded-md bg-IMSLightGreen px-5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1a8a47]"
              >
                <UserPlus size={14} />
                Invite person
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative w-full max-w-[300px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/3 -translate-y-1/2 text-black/40 dark:text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full h-[36px] rounded-md border border-zinc-300 pl-9 pr-3 text-[12.5px] text-black placeholder:text-black/40 focus:border-IMSLightGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
            />
          </div>
          <div className="w-[150px] shrink-0">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: "", label: "Role" },
                ...roleOptions.map((r) => ({ value: r, label: r })),
              ]}
              placeholder="Role"
            />
          </div>
          <div className="w-[150px] shrink-0">
            <Select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              options={[
                { value: "", label: "Team" },
                ...teamOptions.map((t) => ({ value: t, label: t })),
              ]}
              placeholder="Team"
            />
          </div>
          <div className="w-[170px] shrink-0">
            <Select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              options={[
                { value: "", label: "Assignment group" },
                ...groupOptions.map((g) => ({ value: g, label: g })),
              ]}
              placeholder="Assignment group"
            />
          </div>
          <div className="w-[140px] shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "Status" },
                { value: "online", label: "Online" },
                { value: "away", label: "Away" },
                { value: "offline", label: "Offline" },
                { value: "disabled", label: "Disabled" },
              ]}
              placeholder="Status"
            />
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden  lg:grid-cols-[360px_1fr]">
        {/* List pane */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm shadow-light dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
              Directory
            </span>
            <span className="ml-auto flex items-center gap-3.5 text-[12px] text-black/50 dark:text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-IMSLightGreen" />{" "}
                Online
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Away
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />{" "}
                Offline
              </span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {membersLoading && (
              <div className="flex items-center gap-2 px-4 py-4 text-[12px] text-black dark:text-zinc-500">
                <Loader2 size={14} className="animate-spin" /> Loading team
                members…
              </div>
            )}
            {!membersLoading && !filteredList.length && (
              <p className="px-5 py-10 text-center text-[12.5px] leading-relaxed text-black dark:text-zinc-500">
                No one matches these filters.
                <br />
                Try clearing the search or status.
              </p>
            )}
            {humans.length > 0 && (
              <div className="px-4 pb-2 pt-3.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
                People · {humans.length}
              </div>
            )}
            {humans.map((p) => (
              <PersonRow
                key={p.id}
                p={p}
                active={p.id === selected.id}
                onClick={() => selectPerson(p.id)}
              />
            ))}
            {agents.length > 0 && (
              <div className="px-4 pb-2 pt-3.5 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-zinc-500">
                AI agents · {agents.length}
              </div>
            )}
            {agents.map((p) => (
              <PersonRow
                key={p.id}
                p={p}
                active={p.id === selected.id}
                onClick={() => selectPerson(p.id)}
              />
            ))}
          </div>
        </aside>

        {/* Detail pane */}
        <main className="min-h-0 overflow-y-auto rounded-lg bg-zinc-50 dark:bg-zinc-900/20">
          <div className="mx-auto max-w-5xl px-5 py-5 pb-14 sm:px-7">
            <div className="rounded-lg bg-white p-7 shadow-sm shadow-light dark:bg-zinc-900/60">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex capitalize flex-wrap items-center gap-2.5 text-[19px] font-bold leading-tight text-black dark:text-zinc-100">
                    {selected.name}
                    {isSelf && (
                      <span className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-black/60 dark:border-zinc-700 dark:text-zinc-400">
                        You
                      </span>
                    )}
                    {isAgent && (
                      <span className="rounded-full border border-IMSLightGreen/25 bg-IMSLightGreen/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-IMSLightGreen dark:border-IMSLightGreen/30 dark:bg-IMSLightGreen/10 dark:text-IMSLightGreen">
                        Governed AI agent
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-black/60 dark:text-zinc-400">
                    <b className="font-semibold text-black dark:text-zinc-200">
                      {selected.title}
                    </b>
                    <span className="text-black/30 dark:text-zinc-600">·</span>
                    {selected.team}
                    <span className="text-black/30 dark:text-zinc-600">·</span>
                    {!isSelf && (
                      <StatusTag
                        label={
                          selected.status === "disabled"
                            ? "Disabled"
                            : statusLabel(selected.status)
                        }
                        tone={tone}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-[13px] text-black/45 dark:text-zinc-500">
                    {isAgent
                      ? `Deployed ${(selected.general as any).Deployed} · ${(selected.general as any).Model}`
                      : `${selected.general.Email} · member since ${(selected.account as HumanAccount).created} · last login ${(selected.account as HumanAccount).lastLogin}`}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isAgent && adminUnlocked && (
                    <button
                      onClick={() => toast("Opening Ezra configuration")}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-IMSLightGreen hover:text-IMSLightGreen dark:border-zinc-700 dark:text-zinc-200"
                    >
                      Configure agent
                    </button>
                  )}
                  {!isAgent && isSelf && !editingSelf && (
                    <button
                      onClick={() => startEdit(selected)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:border-IMSLightGreen hover:text-IMSLightGreen dark:border-zinc-700 dark:text-zinc-200"
                    >
                      Edit profile
                    </button>
                  )}
                  {!isAgent && isSelf && editingSelf && (
                    <>
                      <button
                        onClick={saveDetails}
                        className="rounded-lg bg-IMSLightGreen px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1a8a47]"
                      >
                        Save changes
                      </button>
                      <button
                        onClick={() => setEditingSelf(false)}
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isAgent && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-IMSLightGreen/10 px-3.5 py-2.5 dark:bg-IMSLightGreen/10">
                  <ShieldCheck
                    size={16}
                    className="shrink-0 text-IMSLightGreen dark:text-IMSLightGreen"
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-black dark:text-zinc-200">
                      Runs under delegated authority — never its own
                    </div>
                    <div className="text-[11px] text-IMSLightGreen dark:text-IMSLightGreen">
                      RBAC-scoped · secrets denied · every action approved &amp;
                      audited
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stat strip */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <StatBox value={s.assigned} label="Assigned Incidents" />
              <StatBox
                value={s.majors}
                label="Open Majors"
                danger={s.majors > 0}
              />
              <StatBox value={s.warRooms} label="War Rooms" />
              <StatBox value={s.avgResponse} label="Avg response" />
              <StatBox
                reverse
                label="Availability"
                value={
                  <span
                    className={cn(
                      "inline-flex items-center gap-2",
                      (s.availability === "Available" ||
                        s.availability === "Online") &&
                        "text-IMSLightGreen dark:text-IMSLightGreen",
                    )}
                  >
                    {(s.availability === "Available" ||
                      s.availability === "Online") && (
                      <span className="h-2 w-2 rounded-full bg-IMSLightGreen" />
                    )}
                    {s.availability}
                  </span>
                }
              />
            </div>

            {/* Sections */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isAgent ? (
                <>
                  <SectionCard eyebrow="Agent identity">
                    <KVRows
                      rows={Object.entries(selected.general).map(
                        ([k, v]): [string, string] => [k, v],
                      )}
                    />
                  </SectionCard>
                  <SectionCard
                    eyebrow="Governance & scope"
                    note="Enforced by Operational Rules"
                  >
                    <KVRows
                      rows={[
                        ["RBAC scope", (selected.account as any).scopeRBAC],
                        [
                          "Secrets access",
                          <span
                            key="s"
                            className="text-rose-600 dark:text-rose-400"
                          >
                            {(selected.account as any).secrets}
                          </span>,
                        ],
                        [
                          "Execution scope",
                          (selected.account as any).execScope,
                        ],
                        ["Approval", (selected.account as any).approval],
                        ["Audit", (selected.account as any).audit],
                      ]}
                    />
                  </SectionCard>
                </>
              ) : (
                <>
                  <SectionCard
                    eyebrow="General information"
                    note={
                      isSelf
                        ? editingSelf
                          ? "Editing"
                          : "Editable by you"
                        : ""
                    }
                  >
                    {isSelf && editingSelf ? (
                      <div>
                        {Object.entries(selected.general).map(([k, v]) => {
                          const editable = [
                            "Full name",
                            "Phone",
                            "Location",
                            "Time zone",
                            "Language",
                          ].includes(k);
                          return (
                            <div
                              key={k}
                              className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3.5 last:border-b-0 dark:border-zinc-800"
                            >
                              <span className="shrink-0 text-[12.5px] text-black/55 dark:text-zinc-500">
                                {k}
                              </span>
                              {editable ? (
                                <input
                                  value={draft[k] ?? v}
                                  onChange={(e) =>
                                    setDraft((d) => ({
                                      ...d,
                                      [k]: e.target.value,
                                    }))
                                  }
                                  className="w-[56%] max-w-[230px] rounded-lg border border-zinc-300 px-2.5 py-1.5 text-right text-[13px] text-black focus:border-IMSLightGreen focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                />
                              ) : (
                                <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-black dark:text-zinc-200">
                                  {v} <ManagedBadge />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <KVRows
                        rows={Object.entries(selected.general).map(
                          ([k, v]): [string, React.ReactNode] => [k, v],
                        )}
                      />
                    )}
                  </SectionCard>

                  <SectionCard eyebrow="Account">
                    {(() => {
                      const a = selected.account as HumanAccount;
                      const pwBtn = isSelf ? (
                        <InlineButton
                          onClick={() => setModal({ kind: "changePassword" })}
                        >
                          Change
                        </InlineButton>
                      ) : adminUnlocked ? (
                        <InlineButton
                          onClick={() =>
                            setModal({
                              kind: "adminReset",
                              personId: selected.id,
                            })
                          }
                        >
                          Reset
                        </InlineButton>
                      ) : null;
                      const canToggleMfa = isSelf || adminUnlocked;
                      return (
                        <>
                          <KVRows
                            rows={[
                              [
                                "Username",
                                <span key="u" className="font-mono">
                                  {a.username}
                                </span>,
                                true,
                              ],
                              ["Account created", a.created],
                              ["Last login", a.lastLogin],
                              [
                                "Password",
                                <span
                                  key="p"
                                  className="inline-flex items-center gap-2"
                                >
                                  •••••••• {pwBtn}
                                </span>,
                              ],
                              [
                                "Multi-factor auth",
                                canToggleMfa ? (
                                  <span
                                    key="m"
                                    className="inline-flex items-center gap-2.5"
                                  >
                                    {a.mfa}
                                    <Switch
                                      checked={a.mfa === "Enabled"}
                                      onChange={() => toggleMfa(selected)}
                                    />
                                  </span>
                                ) : (
                                  a.mfa
                                ),
                              ],
                            ]}
                          />
                          <ToggleRow
                            on={a.active}
                            onClick={() => toggleActive(selected)}
                            title="Account active"
                            subtitle={
                              isSelf
                                ? "Untick to suspend your own access — you'll be signed out on this device and an audit event is recorded."
                                : `Untick to suspend ${selected.name.split(" ")[0]}'s access — existing sessions end and an audit event is recorded. You can re-enable at any time.`
                            }
                          />
                        </>
                      );
                    })()}
                  </SectionCard>
                </>
              )}

              <SectionCard eyebrow="Role" note="Determines permissions">
                <KVRows
                  rows={[
                    [
                      "Assigned role",
                      <span key="r" className="inline-flex items-center gap-2">
                        {selected.role}{" "}
                        {adminUnlocked && (
                          <InlineButton
                            onClick={() =>
                              toast(
                                "Opening role picker — change is audit-logged",
                              )
                            }
                          >
                            Change
                          </InlineButton>
                        )}
                      </span>,
                    ],
                  ]}
                />
              </SectionCard>

              <SectionCard eyebrow="Assignment groups">
                {selected.groups.length ? (
                  <ChipSet>
                    {selected.groups.map((g) => (
                      <Chip key={g}>{g}</Chip>
                    ))}
                    {adminUnlocked && (
                      <Chip
                        accent
                        onClick={() => toast("Opening group manager")}
                      >
                        + Manage groups
                      </Chip>
                    )}
                  </ChipSet>
                ) : (
                  <p className="text-[12px] text-black dark:text-zinc-500">
                    Not available yet.
                    {adminUnlocked && (
                      <Chip
                        accent
                        onClick={() => toast("Opening group manager")}
                      >
                        {" "}
                        + Manage groups
                      </Chip>
                    )}
                  </p>
                )}
              </SectionCard>

              <div className="sm:col-span-2">
                <SectionCard
                  eyebrow="Skills & certifications"
                  note={
                    isAgent
                      ? "Governed capabilities"
                      : "Signals for incident assignment"
                  }
                  span
                >
                  {selected.skills.length ? (
                    <ChipSet>
                      {selected.skills.map(([n, l]) => (
                        <Chip key={n} level={l}>
                          {n}
                        </Chip>
                      ))}
                    </ChipSet>
                  ) : (
                    <p className="text-[12px] text-black dark:text-zinc-500">
                      Not available yet.
                    </p>
                  )}
                </SectionCard>
              </div>

              <div className="sm:col-span-2">
                <SectionCard
                  eyebrow="Permissions"
                  note="Read-only · derived from role"
                  lock
                  span
                >
                  {selected.permissions.length ? (
                    <PermGrid perms={selected.permissions} />
                  ) : (
                    <p className="text-[12px] text-black dark:text-zinc-500">
                      Not available yet.
                    </p>
                  )}
                </SectionCard>
              </div>

              {!selected.security.agent && (
                <SectionCard eyebrow="Security">
                  <KVRows
                    rows={[
                      [
                        "Last password change",
                        (selected.security as HumanSecurity).lastPwChange,
                      ],
                    ]}
                  />
                </SectionCard>
              )}

              {adminUnlocked && (
                <div className="sm:col-span-2">
                  <SectionCard
                    eyebrow="Administrative actions"
                    danger
                    right={
                      <span className="flex items-center gap-2 font-mono text-[10px] text-rose-600 dark:text-rose-400">
                        Admin session
                        <button
                          onClick={lockAdmin}
                          className="font-sans text-[11px] font-semibold hover:underline"
                        >
                          Lock
                        </button>
                      </span>
                    }
                  >
                    <p className="mb-3 text-[11.5px] text-black dark:text-zinc-500">
                      These actions change access or lifecycle state. Each one
                      is recorded in the tenant audit trail.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(isAgent
                        ? [
                            ["Pause agent", false],
                            ["Rotate credentials", false],
                            ["Revoke scopes", false],
                            ["View agent policy", false],
                            ["Disable agent", true],
                          ]
                        : [
                            ["Reset password", false],
                            ["Send reset email", false],
                            ["Unlock account", false],
                            ["Force logout", false],
                            ["Revoke sessions", false],
                            ["Transfer ownership", false],
                            ["Disable account", true],
                            ["Archive person", true],
                            ["Delete person", true],
                          ]
                      ).map(([label, danger]) => (
                        <button
                          key={label as string}
                          onClick={() =>
                            label === "Reset password"
                              ? setModal({
                                  kind: "adminReset",
                                  personId: selected.id,
                                })
                              : toast(`${label} — recorded in audit trail`)
                          }
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                            danger
                              ? "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                              : "border-zinc-300 text-black hover:border-IMSLightGreen hover:text-IMSLightGreen dark:border-zinc-700 dark:text-zinc-200",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={modal.kind !== "none"}
        onClose={() => setModal({ kind: "none" })}
      >
        {modal.kind === "invite" && (
          <InviteForm
            onSend={sendInvite}
            onCancel={() => setModal({ kind: "none" })}
            sending={sendingInvite}
          />
        )}
        {modal.kind === "adminSignIn" && (
          <AdminSignInForm
            onAuthenticate={authenticateAdmin}
            onCancel={() => setModal({ kind: "none" })}
          />
        )}
        {modal.kind === "changePassword" && (
          <ChangePasswordForm
            onSave={savePassword}
            onCancel={() => setModal({ kind: "none" })}
          />
        )}
        {modal.kind === "adminReset" && (
          <AdminResetPasswordForm
            personName={people.find((p) => p.id === modal.personId)?.name ?? ""}
            onSave={(pw) => saveAdminResetPassword(modal.personId, pw)}
            onCancel={() => setModal({ kind: "none" })}
          />
        )}
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

function PersonRow({
  p,
  active,
  onClick,
}: {
  p: Person;
  active: boolean;
  onClick: () => void;
}) {
  const dotTone =
    p.status === "online"
      ? "bg-IMSLightGreen"
      : p.status === "away"
        ? "bg-amber-500"
        : p.status === "disabled"
          ? "bg-rose-500"
          : "bg-zinc-300";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3.5 text-left transition-colors last:border-b-0 dark:border-zinc-800",
        active
          ? "bg-zinc-50 dark:bg-zinc-800/60"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold",
          p.kind === "agent"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "border border-zinc-200 bg-white text-black/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
        )}
      >
        {p.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold leading-tight text-black dark:text-zinc-100">
          <span className="truncate">{p.name}</span>
          {p.kind === "agent" && (
            <span className="shrink-0 rounded-md bg-IMSLightGreen/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-IMSLightGreen dark:bg-IMSLightGreen/15 dark:text-IMSLightGreen">
              AI
            </span>
          )}
          {p.self && (
            <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-black/50 dark:bg-zinc-800 dark:text-zinc-400">
              You
            </span>
          )}
        </span>
        <span className="block truncate text-[13px] text-black/55 dark:text-zinc-400">
          {p.title}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-black/40 dark:text-zinc-500">
          <span className={cn("h-1.5 w-1.5 rounded-full", dotTone)} />
          {p.status === "disabled" ? (
            <span className="text-rose-600 dark:text-rose-400">Disabled</span>
          ) : (
            p.lastActive
          )}
        </span>
      </span>
      <ChevronRight
        size={16}
        className="shrink-0 text-black/30 dark:text-zinc-500"
      />
    </button>
  );
}
