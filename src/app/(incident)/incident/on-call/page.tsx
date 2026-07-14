"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useMember from "@/hooks/useMember";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import Button from "@/components/ui/Button1";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import ActiveEscalationCard from "./_module/component/ActiveEscalation";
import RosterView from "./_module/component/RosterView";
import {
  LuLayoutGrid,
  LuCalendarDays,
  LuUser,
  LuTrendingUp,
  LuRefreshCw,
  LuFileText,
} from "react-icons/lu";
// ─── Types ────────────────────────────────────────────────────────────────────

// Shape returned by useMember
type ApiMember = {
  id: string;
  firstname?: string;
  lastname?: string;
  email: string;
};

// Enriched shape used internally — role/dept/color are UI-only defaults
type Member = {
  id: string;
  initials: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  handle: string;
  color: string;
  onCall: boolean;
  assignmentId?: string | null;
};

type Shift = {
  id: string;
  name: string;
  start: string;
  end: string;
  members: string[]; // member ids
  type: "primary" | "secondary";
  gap?: boolean;
};

// ─── Color palette — deterministic from id index ──────────────────────────────
const COLORS = [
  "#6366f1",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
];
const colorFor = (i: number) => COLORS[i % COLORS.length];

// ─── Derive a Member from ApiMember ──────────────────────────────────────────
function toMember(
  raw: ApiMember,
  idx: number,
  onCallIds: Set<string>,
  assignmentIdByUserId: Map<string, string>,
): Member {
  const first = raw.firstname ?? "";
  const last = raw.lastname ?? "";
  const fullName = (first + " " + last).trim() || raw.email.split("@")[0];
  const initials =
    first && last
      ? (first[0] + last[0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  return {
    id: raw.id,
    initials,
    fullName,
    email: raw.email,
    role: "Team Member", // not available from API yet
    department: "Engineering", // not available from API yet
    handle: `@${raw.email.split("@")[0]}`,
    color: colorFor(idx),
    onCall: onCallIds.has(raw.id),
    assignmentId: assignmentIdByUserId.get(raw.id) ?? null,
  };
}

// ─── Static data that doesn't come from members yet ──────────────────────────
const SHIFT_COVERAGE = [
  { day: "Mon", pct: 100 },
  { day: "Tue", pct: 100 },
  { day: "Wed", pct: 100 },
  { day: "Thu", pct: 100 },
  { day: "Fri", pct: 100 },
  { day: "Sat", pct: 75 },
  { day: "Sun", pct: 60 },
];

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyMembers({ onInvite }: { onInvite?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl mb-4">
        👤
      </div>
      <p className="text-[15px] font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
        No team members yet
      </p>
      <p className="text-[13px] text-neutral-400 dark:text-neutral-500 mb-5 max-w-xs">
        Invite team members to start building on-call schedules and managing
        escalations.
      </p>
      {onInvite && (
        <button
          onClick={onInvite}
          className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#10b981,#1a3a2a)" }}
        >
          Invite team members
        </button>
      )}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  member,
  size = "md",
}: {
  member: Member;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "w-7 h-7 text-[10px]"
      : size === "lg"
        ? "w-10 h-10 text-sm"
        : "w-9 h-9 text-sm";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: member.color }}
    >
      {member.initials}
    </div>
  );
}

function AvatarGroup({ members }: { members: Member[] }) {
  return (
    <div className="flex -space-x-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ring-2 ring-white dark:ring-neutral-900"
          style={{ backgroundColor: m.color }}
        >
          {m.initials}
        </div>
      ))}
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function AssignModal({
  members,
  onClose,
}: {
  members: Member[];
  onClose: () => void;
}) {
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [shiftName, setShiftName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      post(endpoint.on_call.assign_member, {
        date: startDate,
        shiftName,
        teamMembers: selected.map((id) => ({
          userId: id,
          startTime: startDate,
          endTime: endDate,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oncall-schedules"] });
      onClose();
    },
  });

  const canSave =
    selected.length > 0 && startDate.length > 0 && endDate.length > 0;

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Assign On-Call Members
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Select members and date range for this shift
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Shift Name
              </label>
              <input
                type="text"
                placeholder="e.g Week 22 Primary On-Call"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Start Date", startDate, setStartDate],
                ["End Date", endDate, setEndDate],
              ].map(([label, val, setter]) => (
                <div key={label as string}>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {label as string}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={val as string}
                      onChange={(e) =>
                        (setter as (v: string) => void)(e.target.value)
                      }
                      className="w-full px-3 py-2.5 pr-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Select Members{" "}
                <span className="text-neutral-400 font-normal">
                  (2+ recommended)
                </span>
              </label>
              {members.length === 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500 py-4 text-center">
                  No team members available.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggle(m.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        selected.includes(m.id)
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          selected.includes(m.id)
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-neutral-300 dark:border-neutral-600"
                        }`}
                      >
                        {selected.includes(m.id) && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                      <Avatar member={m} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                          {m.fullName}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {m.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Escalation Policy
              </label>
              <select className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
                <option>Default-Engineering Tier</option>
                <option>Critical Path</option>
                <option>VP Escalation</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={!canSave || saveMutation.isPending}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#10b981,#1a3a2a)" }}
            >
              {saveMutation.isPending ? "Saving…" : "Save Assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  shift,
  members,
  onClose,
}: {
  shift: Shift;
  members: Member[];
  onClose: () => void;
}) {
  const [member, setMember] = useState(members[0]?.id ?? "");
  const [reassignTo, setReassignTo] = useState(members[0]?.id ?? "");
  const [reason, setReason] = useState("Vacation / PTO");
  const [notes, setNotes] = useState("");

  const MemberSelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
    >
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.fullName} ({m.email})
        </option>
      ))}
    </select>
  );

  const handleReassign = () => {};

  const handleRemove = () => {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Edit — {shift.name}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Modify or reassign this on-call slot
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Member
              </label>
              <MemberSelect value={member} onChange={setMember} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Reassign to
              </label>
              <MemberSelect value={reassignTo} onChange={setReassignTo} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Shift Override Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option>Vacation / PTO</option>
                <option>Sick Leave</option>
                <option>Emergency</option>
                <option>Schedule Conflict</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                placeholder="Optional notes for audit trail"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={handleRemove}
              className="px-5 py-2.5 rounded-lg border border-red-300 dark:border-red-600 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500 transition-colors"
            >
              Remove
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: "linear-gradient(135deg,#10b981,#1a3a2a)" }}
            >
              Reassign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────

function OverviewView({
  members,
  onAssign,
  setView,
}: {
  members: Member[];
  onAssign: () => void;
  setView: (value: View) => void;
}) {
  // First 4 members = on-call for display; first = primary, rest = secondary
  const onCallMembers = members.slice(0, 4);
  const primaryMember = onCallMembers[0] ?? null;

  if (members.length === 0) return <EmptyMembers onInvite={onAssign} />;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            value: String(onCallMembers.length),
            label: "Active On-Call",
            sub: "All members available",
            subColor: "text-emerald-500",
          },
          {
            value: "0",
            label: "Escalated Incidents",
            sub: "No active escalations",
            subColor: "text-emerald-500",
          },
          {
            value: "98.4%",
            label: "Ack Rate (30d)",
            sub: "↑ +2.1% vs last month",
            subColor: "text-emerald-500",
          },
          {
            value: "6.2 min",
            label: "Mean Time to Ack",
            sub: "↓ -1.4 min",
            subColor: "text-emerald-500",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {s.value}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {s.label}
            </div>
            <div className={`text-xs mt-1.5 font-medium ${s.subColor}`}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Currently On-Call */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-neutral-900 dark:text-white">
                Currently On-Call
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {onCallMembers.length} member
                {onCallMembers.length !== 1 ? "s" : ""} active this shift
              </div>
            </div>
            <button
              onClick={() => setView("roster")}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Manage
            </button>
          </div>

          {onCallMembers.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 py-4 text-center">
              No members assigned to this shift.
            </p>
          ) : (
            <div className="space-y-2">
              {onCallMembers.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar member={m} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {m.fullName}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {m.email}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      i === 0
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    {i === 0 ? "Primary" : "Secondary"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shift Coverage */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-neutral-900 dark:text-white">
              Shift Coverage
            </div>
            <div className="text-xs text-neutral-400">Next 7 days</div>
          </div>
          <div className="space-y-2.5">
            {SHIFT_COVERAGE.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 w-7">
                  {d.day}
                </span>
                <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${d.pct === 100 ? "bg-emerald-500" : "bg-red-400"}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium w-9 text-right ${d.pct === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
                >
                  {d.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleView({
  members,
  apiSchedules,
  onEdit,
}: {
  members: Member[];
  apiSchedules: any[];
  onEdit: (shift: Shift) => void;
}) {
  // Build shifts from real API data when available, fall back to derived
  const shifts: Shift[] = useMemo(() => {
    if (apiSchedules.length > 0) {
      return apiSchedules.map((s, i) => {
        const memberIds = (s.teamMembers ?? [])
          .map((m: any) => m.member ?? m.id ?? m.userId)
          .filter(Boolean);
        return {
          id: s.id ?? `s${i}`,
          name:
            s.shiftName ??
            `Shift ${new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          start: new Date(s.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          end:
            memberIds.length > 0
              ? s.teamMembers[0]?.endTime
                ? new Date(s.teamMembers[0].endTime).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )
                : new Date(s.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
              : new Date(s.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
          members: memberIds,
          type: i % 2 === 0 ? "primary" : "secondary",
        } as Shift;
      });
    }
    if (members.length === 0) return [];
    const ids = members.map((m) => m.id);
    return [
      {
        id: "s1",
        name: "Week 22 Primary",
        start: "26 May",
        end: "2 Jun",
        members: ids.slice(0, 2),
        type: "primary",
      },
      {
        id: "s2",
        name: "Week 23 Secondary",
        start: "2 Jun",
        end: "9 Jun",
        members: ids.slice(2, 4),
        type: "secondary",
      },
      {
        id: "s3",
        name: "Week 24 Primary",
        start: "9 Jun",
        end: "16 Jun",
        members: ids.slice(0, 1),
        type: "primary",
        gap: true,
      },
    ];
  }, [apiSchedules, members]);

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const calDays = Array.from({ length: 35 }, (_, i) => {
    const d = i - 2;
    return d >= 1 && d <= 31 ? d : null;
  });
  const shiftDays = [18, 19, 20, 21, 22];

  if (members.length === 0)
    return (
      <div className="space-y-5">
        <EmptyMembers />
        <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
          Add team members to start scheduling on-call shifts.
        </p>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
          {days.map((d) => (
            <div
              key={d}
              className="py-3 text-center text-xs font-semibold tracking-wider text-neutral-400"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calDays.map((d, i) => {
            const isToday = d === 22;
            const hasShift = d !== null && shiftDays.includes(d);
            const shiftMembers = hasShift ? members.slice(0, 3) : [];
            return (
              <div
                key={i}
                className={`min-h-[90px] p-2 border-b border-r border-neutral-100 dark:border-neutral-800 ${d === null ? "bg-neutral-50 dark:bg-neutral-950" : ""} ${isToday ? "ring-2 ring-inset ring-emerald-500" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${d === null ? "text-neutral-300 dark:text-neutral-700" : isToday ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-neutral-700 dark:text-neutral-300"}`}
                >
                  {d ?? ""}
                </div>
                {shiftMembers.length > 0 && (
                  <div className="space-y-0.5">
                    {shiftMembers.slice(0, 2).map((m, mi) => (
                      <div
                        key={m.id}
                        className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-tight truncate"
                      >
                        {m.fullName.split(" ")[0]}
                        {mi === 0 ? "" : " (sec.)"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="font-semibold text-neutral-900 dark:text-white mb-3">
            Upcoming Shifts
          </div>
          <div className="space-y-3">
            {shifts.map((s) => {
              const shiftMembers = s.members
                .map((id) => members.find((m) => m.id === id))
                .filter(Boolean) as Member[];
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1 h-10 rounded-full ${s.type === "primary" ? "bg-purple-400" : "bg-blue-400"}`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {s.name}
                        </span>
                        {s.gap && (
                          <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                            GAP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {s.start} → {s.end}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AvatarGroup members={shiftMembers} />
                    <button
                      onClick={() => onEdit(s)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-neutral-900 dark:text-white">
              Coverage Gaps
            </span>
            <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
              2 gaps
            </span>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "JUNE 14–15 · WEEKEND",
                desc: "No primary or secondary assigned",
                color: "red",
                btn: "Assign",
              },
              {
                label: "JUNE 28 · SUNDAY",
                desc: "Only 1 member assigned (minimum 2)",
                color: "amber",
                btn: "Add Member",
              },
            ].map((g) => (
              <div
                key={g.label}
                className={`p-3 rounded-lg border flex items-center justify-between ${g.color === "red" ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900" : "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900"}`}
              >
                <div>
                  <div
                    className={`text-xs font-semibold tracking-wide ${g.color === "red" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    {g.label}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {g.desc}
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  {g.btn}
                </button>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type View = "overview" | "schedule" | "roster";

export default function OnCallDashboard() {
  const [view, setView] = useState<View>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const router = useRouter();
  const { get } = useFetch();
  const queryClient = useQueryClient();

  // ── Real member data ──────────────────────────────────────────
  const { data: rawMembers = [], isLoading } = useMember();

  // ── Real schedule data ────────────────────────────────────────
  const { data: apiSchedules = [] } = useQuery<any[]>({
    queryKey: ["oncall-schedules"],
    queryFn: async () => {
      const res = await get(endpoint.on_call.get_all_assign);
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
  });

  // Derive on-call IDs from the most recent schedule
  const onCallIds = useMemo(() => {
    if (apiSchedules.length > 0) {
      const latest = apiSchedules[apiSchedules.length - 1];
      return new Set<string>(
        (latest.teamMembers ?? [])
          .map((m: any) => m.member ?? m.id ?? m.userId)
          .filter(Boolean),
      );
    }
    return new Set(rawMembers.slice(0, 3).map((m) => m.id));
  }, [apiSchedules, rawMembers]);

  // Map each user id to their assignment row id from the latest schedule
  const assignmentIdByUserId = useMemo(() => {
    const map = new Map<string, string>();
    if (apiSchedules.length > 0) {
      const latest = apiSchedules[apiSchedules.length - 1];
      for (const m of latest.teamMembers ?? []) {
        const userId = m.member ?? m.id ?? m.userId;
        if (userId && m.assignmentId) map.set(userId, m.assignmentId);
      }
    }
    return map;
  }, [apiSchedules]);

  const members = useMemo<Member[]>(
    () =>
      rawMembers.map((raw, i) =>
        toMember(raw, i, onCallIds, assignmentIdByUserId),
      ),
    [rawMembers, onCallIds, assignmentIdByUserId],
  );

  const titles: Record<View, { h1: string; sub: string }> = {
    overview: {
      h1: "On-Call Overview",
      sub: "Showing your team's current on-call status",
    },
    schedule: {
      h1: "On-Call Schedule",
      sub: "Calendar view · assign and manage shifts",
    },
    roster: {
      h1: "On-Call Roster",
      sub: "Manage team members, roles, and assignments",
    },
  };

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {titles[view].h1}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {titles[view].sub}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 relative">
          <div className="relative">
            <Button
              onClick={() => setMenuOpen((o) => !o)}
              variant="outline-dark"
              rightIcon={<ChevronDown size={15} />}
              size="sm"
            >
              Menu
            </Button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 z-40 w-[480px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* ON-CALL COLUMN */}
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-neutral-400 mb-2">
                      ON-CALL
                    </div>
                    <nav className="space-y-0.5">
                      {(["overview", "schedule", "roster"] as View[]).map(
                        (v) => (
                          <button
                            key={v}
                            onClick={() => {
                              setView(v);
                              setMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors text-left ${
                              view === v
                                ? "bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-white"
                                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            }`}
                          >
                            <span className="text-base text-neutral-500 dark:text-neutral-400">
                              {v === "overview" && <LuLayoutGrid size={16} />}
                              {v === "schedule" && <LuCalendarDays size={16} />}
                              {v === "roster" && <LuUser size={16} />}
                            </span>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </button>
                        ),
                      )}
                    </nav>
                  </div>

                  {/* POLICY COLUMN */}
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-neutral-400 mb-2">
                      POLICY
                    </div>
                    <nav className="space-y-0.5">
                      {["Escalation", "Auto-Escalation"].map((l) => (
                        <button
                          onClick={() => {
                            if (l === "Escalation") {
                              router.push("/incident/on-call/escalation");
                            } else if (l === "Auto-Escalation") {
                              router.push("/incident/on-call/auto-escalation");
                            }
                          }}
                          key={l}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                          <span className="text-base text-neutral-500 dark:text-neutral-400">
                            {l === "Escalation" ? (
                              <LuTrendingUp size={16} />
                            ) : (
                              <LuRefreshCw size={15} />
                            )}
                          </span>{" "}
                          {l}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* ACTIVITY COLUMN */}
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-neutral-400 mb-2">
                      ACTIVITY
                    </div>
                    <nav className="space-y-0.5">
                      {["Audit Log"].map((l) => (
                        <button
                          key={l}
                          onClick={() =>
                            l === "Audit Log" &&
                            router.push("/incident/on-call/audit-log")
                          }
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                          <span className="text-base text-neutral-500 dark:text-neutral-400">
                            <LuFileText size={16} />
                          </span>{" "}
                          {l}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setAssignOpen(true)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg,#10b981 0%,#1a3a2a 100%)",
            }}
          >
            Assign On-Call
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Loading shimmer */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {view === "overview" && (
            <div className="space-y-5">
              <OverviewView
                members={members}
                onAssign={() => setAssignOpen(true)}
                setView={setView}
              />
              <ActiveEscalationCard />
            </div>
          )}
          {view === "schedule" && (
            <ScheduleView
              members={members}
              apiSchedules={apiSchedules}
              onEdit={(s) => setEditShift(s)}
            />
          )}
          {view === "roster" && (
            <RosterView
              members={members}
              isLoading={isLoading}
              onChanged={() =>
                queryClient.invalidateQueries({
                  queryKey: ["oncall-schedules"],
                })
              }
            />
          )}
        </>
      )}

      {assignOpen && (
        <AssignModal members={members} onClose={() => setAssignOpen(false)} />
      )}
      {editShift && (
        <EditModal
          shift={editShift}
          members={members}
          onClose={() => setEditShift(null)}
        />
      )}
    </div>
  );
}
