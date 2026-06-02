"use client";
import React, { useEffect, useState } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import { CheckCircle, Crown, Eye, Flame, List, Settings2, Shield, UserCheck, Users, Zap } from "lucide-react";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

const RBAC_ROLES = [
  {
    value: "WORKSPACE_OWNER",
    label: "Workspace Owner",
    badge: "highest authority",
    color: "#f59e0b",
    icon: <Crown size={14} className="text-amber-400" />,
    desc: "Delete workspace, configure billing, SSO, policies, transfer ownership. Cannot be restricted by admins.",
    canDo: ["Delete workspace", "Configure billing", "Configure SAML/OIDC", "Transfer ownership", "Create admins", "Approve critical actions"],
  },
  {
    value: "ADMIN",
    label: "Administrator",
    badge: "full control",
    color: "#10b981",
    icon: <Shield size={14} className="text-emerald-400" />,
    desc: "Manage users, invite members, configure integrations, approve remediation, access audit logs.",
    canDo: ["Manage users", "Invite users", "Assign roles", "Configure integrations", "Approve merges & rollbacks", "Access audit logs"],
    cannotDo: ["Delete workspace", "Transfer ownership"],
  },
  {
    value: "INCIDENT_COMMANDER",
    label: "Incident Commander",
    badge: "incident authority",
    color: "#ef4444",
    icon: <Flame size={14} className="text-red-400" />,
    desc: "Leads war rooms, takes ownership, approves rollbacks and production actions, closes incidents.",
    canDo: ["Take incident ownership", "Lead war rooms", "Change severity", "Approve rollbacks", "Approve merges", "Close incidents", "Generate executive reports"],
    cannotDo: ["Manage billing", "Configure SSO", "Delete workspace", "Create admins"],
  },
  {
    value: "OPERATIONS_MANAGER",
    label: "Operations Manager",
    badge: "operational",
    color: "#8b5cf6",
    icon: <Settings2 size={14} className="text-violet-400" />,
    desc: "Manages on-call, creates playbooks, assigns responders, launches war rooms.",
    canDo: ["View all incidents", "Create & edit playbooks", "Assign responders", "Manage on-call schedules", "Launch war rooms"],
    cannotDo: ["Approve critical rollbacks", "Approve merges", "Execute critical actions"],
  },
  {
    value: "RESPONDER",
    label: "Responder",
    badge: "primary responder",
    color: "#3b82f6",
    icon: <Zap size={14} className="text-blue-400" />,
    desc: "Joins incidents, adds evidence, triggers investigations, runs playbooks, views logs.",
    canDo: ["Join incidents", "Update incidents", "Add evidence", "Trigger investigations", "Execute low-risk actions", "Participate in war rooms"],
    cannotDo: ["Approve rollbacks", "Approve merges", "Configure integrations"],
  },
  {
    value: "ANALYST",
    label: "Analyst",
    badge: "investigate",
    color: "#06b6d4",
    icon: <List size={14} className="text-cyan-400" />,
    desc: "Read-heavy role for security, risk, and engineering analysts. Export reports and view intelligence.",
    canDo: ["View incidents", "View timelines & evidence", "View RCA", "Export reports", "Generate intelligence insights"],
    cannotDo: ["Execute actions", "Approve actions", "Modify incidents", "Modify playbooks"],
  },
  {
    value: "OBSERVER",
    label: "Observer",
    badge: "read-only ops",
    color: "#64748b",
    icon: <Eye size={14} className="text-slate-400" />,
    desc: "View-only operational access. Good for product managers, customer success, and leadership.",
    canDo: ["View incidents", "View status", "View summaries", "View executive dashboard"],
    cannotDo: ["View sensitive evidence", "Execute actions", "Modify incidents", "Join approvals"],
  },
  {
    value: "GUEST",
    label: "Guest",
    badge: "external access",
    color: "#94a3b8",
    icon: <Users size={14} className="text-slate-400" />,
    desc: "Limited external access for vendors, customers, or auditors on specific incidents.",
    canDo: ["View specific incidents", "View specific postmortems", "View shared war room"],
    cannotDo: ["Access workspace", "Access evidence", "Access integrations", "Access playbooks"],
  },
  {
    value: "BREAK_GLASS_ADMIN",
    label: "Break-Glass Admin",
    badge: "emergency only",
    color: "#dc2626",
    icon: <UserCheck size={14} className="text-red-500" />,
    desc: "Emergency disaster recovery role. Every action generates a critical audit event.",
    canDo: ["Override policies", "Access locked workspace", "Approve emergency remediation", "Access audit history"],
  },
];

const Page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();

  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionDuration, setSessionDuration] = useState("24 hrs");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const durations = [
    { label: "8 hrs", value: "8h" },
    { label: "12 hrs", value: "12h" },
    { label: "24 hrs", value: "24h" },
    { label: "7 days", value: "7d" },
  ];

  const { data: config } = useQuery({
    queryKey: ["ims-roles-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (config) {
      setMfaEnabled(config.requireMFA ?? true);
      setSessionDuration(config.sessionDuration ?? "24 hrs");
    }
  }, [config]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, {
        requireMFA: mfaEnabled,
        sessionDuration,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Roles & session settings saved");
      queryClient.invalidateQueries({ queryKey: ["ims-roles-config"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <SettingWrapper
        title="Users & Roles"
        description="Operational authority model — governance, incident authority, execution, and observation"
        sub="Eight roles covering every engineering organisation. Clear separation between governance, incident authority, operational execution, investigation, and observation."
      >
        {/* PERMISSION MATRIX LEGEND */}
        <div className="mb-6 p-4 bg-[#0B1224] border border-[#1F2937] rounded-xl">
          <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-widest">Merge & Rollback Approval Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#94A3B8]">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left py-2 pr-4 text-white font-bold">Action</th>
                  {["Owner", "Admin", "IC", "Ops Mgr", "Responder"].map((r) => (
                    <th key={r} className="text-center py-2 px-2 font-semibold">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { action: "Approve Merge", perms: [true, true, true, false, false] },
                  { action: "Approve Rollback", perms: [true, true, true, false, false] },
                  { action: "Execute Rollback", perms: [true, true, true, false, false] },
                  { action: "Execute Low-Risk Action", perms: [true, true, true, true, true] },
                  { action: "Change Severity", perms: [true, true, true, true, false] },
                  { action: "Close Incident", perms: [true, true, true, true, false] },
                ].map(({ action, perms }) => (
                  <tr key={action} className="border-b border-[#1F2937]/50">
                    <td className="py-2 pr-4 text-[#D1D5DB]">{action}</td>
                    {perms.map((allowed, i) => (
                      <td key={i} className="text-center py-2 px-2">
                        {allowed
                          ? <span className="text-emerald-400 font-bold">✓</span>
                          : <span className="text-[#374151]">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
          {RBAC_ROLES.map((role) => (
            <RoleCard
              key={role.value}
              role={role}
              expanded={expandedRole === role.value}
              onToggle={() => setExpandedRole(expandedRole === role.value ? null : role.value)}
            />
          ))}
        </div>

        {/* SESSION CONTROLS */}
        <div className="border border-[#1F2937] rounded-2xl p-4 space-y-6 mb-6">
          <div className="space-y-1">
            <h3 className="text-white font-bold text-lg">Session controls</h3>
            <p className="text-[#64748B] text-sm">Security defaults applied org-wide.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 border border-[#1F2937] rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium pr-4 leading-tight">
                  Require MFA for non-SSO users
                </span>
                <button
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${mfaEnabled ? "bg-[#4ADE80]" : "bg-[#1F2937]"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${mfaEnabled ? "left-6" : "left-1"}`} />
                </button>
              </div>
              <p className="text-[#64748B] text-xs leading-normal">Useful during rollout before enforcing SSO.</p>
            </div>

            <div className="p-5 border border-[#1F2937] rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium">Session duration</span>
                <div className="flex gap-2">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setSessionDuration(d.label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        sessionDuration === d.label
                          ? "border-[#00CAD8] text-[#00CAD8] bg-[#00CAD8]/10"
                          : "border-[#94A3B8]/40 text-[#D1D5DB] hover:border-[#00CAD8]"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[#64748B] text-xs">How long a login stays valid.</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <CButton className="w-fit" onClick={() => save()} isLoading={isPending} disabled={isPending}>
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};

const RoleCard = ({
  role,
  expanded,
  onToggle,
}: {
  role: (typeof RBAC_ROLES)[number];
  expanded: boolean;
  onToggle: () => void;
}) => (
  <div
    className="p-4 border border-[#1F2937] rounded-xl space-y-3 hover:border-[#00CAD8]/40 transition-colors cursor-pointer"
    onClick={onToggle}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <span className="text-white text-sm font-bold">{role.label}</span>
        {role.value === "BREAK_GLASS_ADMIN" && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-900/40 text-red-400 border border-red-800 rounded uppercase tracking-wider">
            Emergency
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 px-2.5 py-1 border border-[#00CAD8]/30 rounded-full bg-[#0B1224] shrink-0">
        <span style={{ color: role.color }}>{role.icon}</span>
        <span className="text-[9px] font-medium text-white uppercase tracking-wider">{role.badge}</span>
      </div>
    </div>
    <p className="text-[#64748B] text-xs leading-normal">{role.desc}</p>

    {expanded && (
      <div className="pt-2 space-y-3 border-t border-[#1F2937]">
        {role.canDo && (
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Can</p>
            <div className="space-y-1">
              {role.canDo.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-[#D1D5DB]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {role.cannotDo && (
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5">Cannot</p>
            <div className="space-y-1">
              {role.cannotDo.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-red-400 text-[10px] shrink-0">✗</span>
                  <span className="text-[11px] text-[#94A3B8]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export default Page;
