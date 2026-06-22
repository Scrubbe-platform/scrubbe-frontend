"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Download,
  ShieldCheck,
  Clock,
  Ban,
  Trash2,
  KeyRound,
} from "lucide-react";

import { ApiKey, AuditEntry, ToastMessage } from "./_modules/types/apiKeys";
import SummaryBar from "./components/SummaryBar";
import KeyDiagram from "./components/KeyDiagram";
import KeyDrawer from "./components/KeyDrawer";
import CreateKeyWizard from "./components/CreateKeyWizard";
import {
  EditModal,
  RotateModal,
  SuspendModal,
  AuditModal,
  RevokeModal,
} from "./components/ActionModals";
import { BiExport } from "react-icons/bi";
import Button from "@/components/ui/Button1";

// Native baseline mock dataset extracted from the original configuration file
const INITIAL_KEYS: ApiKey[] = [
  {
    name: "Payments SDK",
    id: "SDK-8KXJ29W81A9D",
    type: "SDK",
    services: ["payments-api"],
    perms: ["sdk.write"],
    used: "2 min ago",
    status: "active",
  },
  {
    name: "GitHub Deployments",
    id: "INT-4MQZ71KPX2F0",
    type: "Integration",
    services: ["payments-api"],
    perms: ["deployment.write"],
    used: "4 min ago",
    status: "active",
  },
  {
    name: "MCP Production",
    id: "MCP-9WRN38BVK7LD",
    type: "MCP",
    services: ["All Services"],
    perms: ["knowledge.read"],
    used: "10 min ago",
    status: "active",
  },
  {
    name: "Jira Automation",
    id: "AUT-5YCX62HMA3NE",
    type: "Automation",
    services: ["All Services"],
    perms: ["incident.write"],
    used: "1 hr ago",
    status: "active",
  },
  {
    name: "Ezra Agent Identity",
    id: "AGT-2KBP47DUJ9QL",
    type: "Agent",
    services: ["All Services"],
    perms: ["agent.execute"],
    used: "18 min ago",
    status: "active",
  },
  {
    name: "PagerDuty Integration",
    id: "INT-7FNO56RXT4MH",
    type: "Integration",
    services: ["notifications-service"],
    perms: ["alert.write"],
    used: "32 min ago",
    status: "active",
  },
  {
    name: "Billing SDK",
    id: "SDK-3TQV81WGS5KN",
    type: "SDK",
    services: ["billing-api"],
    perms: ["sdk.read"],
    used: "2 hr ago",
    status: "active",
  },
  {
    name: "MCP Staging",
    id: "MCP-6RYA29CJP0DX",
    type: "MCP",
    services: ["All Services"],
    perms: ["knowledge.read"],
    used: "4 hr ago",
    status: "active",
  },
  {
    name: "Deploy Pipeline Prod",
    id: "INT-1ZKF83WNA7BQ",
    type: "Integration",
    services: ["workflow-engine"],
    perms: ["deployment.write"],
    used: "6 hr ago",
    status: "expired",
  },
  {
    name: "Incident Automation",
    id: "AUT-8MSD64UVL2RP",
    type: "Automation",
    services: ["All Services"],
    perms: ["incident.write"],
    used: "1 day ago",
    status: "revoked",
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filtering & Pagination State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Active Context Gating states
  const [activeKeyIdx, setActiveKeyIdx] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal Visibility Registry
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    rotate: false,
    suspend: false,
    audit: false,
    revoke: false,
  });

  // Global Toast Dispatcher
  const showToast = (msg: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleRowClick = (index: number) => {
    setActiveKeyIdx(index);
    setIsDrawerOpen(true);
  };

  const triggerModal = (modalKey: keyof typeof modals, index: number) => {
    setActiveKeyIdx(index);
    setModals((prev) => ({ ...prev, [modalKey]: true }));
    setOpenMenuId(null);
  };

  // Processing Filter Pipelines
  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All Types" || k.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Statuses" ||
      k.status === statusFilter.toLowerCase();
    const matchesService =
      serviceFilter === "All Services" || k.services.includes(serviceFilter);
    return matchesSearch && matchesType && matchesStatus && matchesService;
  });

  const activeKey = activeKeyIdx !== null ? keys[activeKeyIdx] : null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Top action header bar */}

      {/* Main Content Workspace Layout */}
      <div className="px-9 py-8 max-w-[1600px] mx-auto space-y-8">
        {/* Title Heading & Description */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-950">
              API Keys
            </h1>
            <p className="text-[13px] text-zinc-500 max-w-4xl mt-1 leading-relaxed">
              Manage trusted operational identities across incidents,
              intelligence, automation, MCP, remediation, and infrastructure.
              Every key carries a bounded scope, an audit trail, and explicit
              human approval gates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              leftIcon={<Plus size={16} />}
              size="sm"
              variant="outline-dark"
              onClick={() => setModals((prev) => ({ ...prev, create: true }))}
            >
              Create API Key
            </Button>

            <Button
              onClick={() => {}}
              size="sm"
              variant="outline-dark"
              leftIcon={<BiExport size={16} />}
            >
              Export Audit Log
            </Button>
          </div>
        </div>

        {/* 1. Summary Metrics Panel */}
        <SummaryBar keys={keys} />

        {/* 2. Visual Model SVG Block Component */}
        <KeyDiagram />

        {/* 3. Table Filters & Datagrid Block Component */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              All keys
            </h3>
            <span className="text-xs text-zinc-400">
              Showing {filteredKeys.length} keys
            </span>
          </div>

          {/* Interactive Filters Ribbon Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 border border-zinc-200 rounded-lg p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 border border-zinc-200 bg-white rounded px-3 h-8">
                <Search size={13} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search keys…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs text-zinc-800 bg-transparent outline-none w-48 placeholder-zinc-400"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none cursor-pointer"
              >
                {[
                  "All Types",
                  "SDK",
                  "MCP",
                  "Integration",
                  "Automation",
                  "Agent",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none cursor-pointer"
              >
                {[
                  "All Statuses",
                  "Active",
                  "Expired",
                  "Revoked",
                  "Suspended",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="h-8 rounded border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 outline-none cursor-pointer"
              >
                {[
                  "All Services",
                  "payments-api",
                  "auth-api",
                  "billing-api",
                  "notifications-service",
                ].map((srv) => (
                  <option key={srv}>{srv}</option>
                ))}
              </select>
            </div>

            <button className="h-8 px-3 rounded border border-zinc-200 bg-white text-xs font-medium text-zinc-700 flex items-center gap-1.5 hover:bg-zinc-50">
              <SlidersHorizontal size={12} /> Sort
            </button>
          </div>

          {/* Core Table View Matrix */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-2xs bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-semibold tracking-wider text-[10.5px] uppercase">
                <tr>
                  <th className="p-3 w-10">
                    <input type="checkbox" className="accent-zinc-950" />
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Services</th>
                  <th className="p-3">Permissions</th>
                  <th className="p-3">Last Used</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredKeys.map((k, idx) => {
                  const badgeStyles = {
                    SDK: "bg-blue-50 text-blue-700",
                    MCP: "bg-emerald-50 text-emerald-700",
                    Integration: "bg-purple-50 text-purple-700",
                    Automation: "bg-orange-50 text-orange-700",
                    Agent: "bg-green-50 text-green-700",
                  }[k.type];

                  const statusDots = {
                    active: "bg-emerald-400",
                    expired: "bg-amber-500",
                    revoked: "bg-red-500",
                    suspended: "bg-zinc-400",
                  }[k.status];

                  return (
                    <tr
                      key={k.id}
                      onClick={() => handleRowClick(idx)}
                      className="hover:bg-zinc-50/60 cursor-pointer group transition-colors"
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="accent-zinc-950" />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-zinc-950">
                          {k.name}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-400 mt-0.5">
                          {k.id}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${badgeStyles}`}
                        >
                          {k.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {k.services.map((s) => (
                            <span
                              key={s}
                              className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500 bg-zinc-50 ${s === "All Services" ? "bg-emerald-50/50 border-emerald-200 text-emerald-700" : ""}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[10.5px] text-zinc-500">
                        {k.perms.join(", ")}
                      </td>
                      <td className="p-3 text-zinc-500">{k.used}</td>
                      <td className="p-3 font-medium capitalize">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDots}`}
                          />
                          {k.status}
                        </span>
                      </td>
                      <td
                        className="p-3 relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === k.id ? null : k.id)
                          }
                          className="h-7 w-7 rounded flex items-center justify-center text-zinc-400 hover:bg-zinc-100 font-bold"
                        >
                          &bull;&bull;&bull;
                        </button>

                        {openMenuId === k.id && (
                          <div className="absolute right-3 top-10 bg-white border border-zinc-200 rounded-lg shadow-md py-1 w-40 z-50 overflow-hidden animate-fadeIn">
                            <button
                              onClick={() => handleRowClick(idx)}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => triggerModal("edit", idx)}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => triggerModal("rotate", idx)}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-50"
                            >
                              Rotate
                            </button>
                            <div className="h-[1px] bg-zinc-100 my-1" />
                            <button
                              onClick={() => triggerModal("suspend", idx)}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-50"
                            >
                              {k.status === "suspended"
                                ? "Unsuspend"
                                : "Suspend"}
                            </button>
                            <button
                              onClick={() => triggerModal("audit", idx)}
                              className="w-full text-left px-3 py-1.5 hover:bg-zinc-50"
                            >
                              Audit History
                            </button>
                            <div className="h-[1px] bg-zinc-100 my-1" />
                            <button
                              onClick={() => triggerModal("revoke", idx)}
                              className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50/50"
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-out detail layout block */}
      <KeyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeKey={activeKey}
        onActionTrigger={(modalKey) => triggerModal(modalKey, activeKeyIdx!)}
      />

      {/* 6-step creation flow context block */}
      <CreateKeyWizard
        isOpen={modals.create}
        onClose={() => setModals((prev) => ({ ...prev, create: false }))}
        onSuccess={(newKeyName) => {
          const mockId = `SDK-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
          setKeys((prev) => [
            ...prev,
            {
              name: newKeyName,
              id: mockId,
              type: "SDK",
              services: ["payments-api"],
              perms: ["sdk.write"],
              used: "Never",
              status: "active",
            },
          ]);
          showToast("API Identity registered successfully");
        }}
      />

      {/* Consolidated state action sub-flows modals */}
      <EditModal
        isOpen={modals.edit}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, edit: false }))}
        onSave={(updatedName) => {
          setKeys((prev) =>
            prev.map((k, i) =>
              i === activeKeyIdx ? { ...k, name: updatedName } : k,
            ),
          );
          showToast(`Changes saved to "${updatedName}"`);
        }}
      />

      <RotateModal
        isOpen={modals.rotate}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, rotate: false }))}
        onSuccess={(newMaskedId) => {
          setKeys((prev) =>
            prev.map((k, i) =>
              i === activeKeyIdx ? { ...k, id: newMaskedId } : k,
            ),
          );
          showToast("Key rotated. 24-hour grace period started.", "warning");
        }}
      />

      <SuspendModal
        isOpen={modals.suspend}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, suspend: false }))}
        onConfirm={() => {
          const target = keys[activeKeyIdx!];
          const isSus = target.status === "suspended";
          setKeys((prev) =>
            prev.map((k, i) =>
              i === activeKeyIdx
                ? { ...k, status: isSus ? "active" : "suspended" }
                : k,
            ),
          );
          showToast(
            isSus
              ? `"${target.name}" reactivated.`
              : `"${target.name}" suspended — all auth blocked.`,
            isSus ? "success" : "warning",
          );
        }}
      />

      <AuditModal
        isOpen={modals.audit}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, audit: false }))}
        showToast={showToast}
      />

      <RevokeModal
        isOpen={modals.revoke}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, revoke: false }))}
        onConfirm={() => {
          setKeys((prev) =>
            prev.map((k, i) =>
              i === activeKeyIdx ? { ...k, status: "revoked" } : k,
            ),
          );
          showToast(`"${activeKey?.name}" permanently revoked.`, "error");
          setIsDrawerOpen(false);
        }}
      />

      {/* Live active toast notifications stack */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map((t) => {
          const borderStyle = {
            success: "border-emerald-500 bg-zinc-950",
            warning: "border-amber-500 bg-zinc-950",
            error: "border-red-500 bg-zinc-950",
            info: "border-blue-500 bg-zinc-950",
          }[t.type];
          const textStyle = {
            success: "text-emerald-400",
            warning: "text-amber-400",
            error: "text-red-400",
            info: "text-blue-400",
          }[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 border-l-2 p-3.5 rounded shadow-lg text-white font-medium text-xs min-w-[280px] animate-toastIn ${borderStyle}`}
            >
              <span className={`font-mono text-sm shrink-0 ${textStyle}`}>
                &bull;
              </span>
              <span>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
