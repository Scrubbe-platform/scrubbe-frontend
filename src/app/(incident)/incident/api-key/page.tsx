"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Plus, RefreshCw } from "lucide-react";

import { ApiKey, ToastMessage } from "./_modules/types/apiKeys";
import {
  useApiKeys,
  useRevokeApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
} from "./_modules/hooks/useApiKeys";
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

export default function ApiKeysPage() {
  const { data: keys = [], isLoading, isError, refetch } = useApiKeys();
  const revokeKey = useRevokeApiKey();
  const updateKey = useUpdateApiKey();
  const deleteKey = useDeleteApiKey();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Filtering state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Active key tracking
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal visibility
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    rotate: false,
    suspend: false,
    audit: false,
    revoke: false,
  });

  const showToast = (msg: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const activeKey = keys.find((k) => k.id === activeKeyId) ?? null;

  const handleRowClick = (key: ApiKey) => {
    setActiveKeyId(key.id);
    setIsDrawerOpen(true);
  };

  const triggerModal = (modalKey: keyof typeof modals, keyId: string) => {
    setActiveKeyId(keyId);
    setModals((prev) => ({ ...prev, [modalKey]: true }));
    setOpenMenuId(null);
  };

  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All Types" || k.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Statuses" ||
      k.status === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 font-sans">
      <div className="px-9 py-8 max-w-[1600px] mx-auto space-y-8">
        {/* Title */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
              API Keys
            </h1>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-2xl mt-1 leading-relaxed">
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
              onClick={() => refetch()}
              size="sm"
              variant="outline-dark"
              leftIcon={<BiExport size={16} />}
            >
              Export Audit Log
            </Button>
          </div>
        </div>

        {/* Summary */}
        <SummaryBar keys={keys} />

        {/* Diagram */}
        <KeyDiagram />

        {/* Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              All keys
            </h3>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Showing {filteredKeys.length} keys
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded px-3 h-8">
                <Search size={13} className="text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search keys…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs text-zinc-800 dark:text-zinc-200 bg-transparent outline-none w-48 placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
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
                className="h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 text-xs text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
              >
                {["All Statuses", "Active", "Expired", "Suspended"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => refetch()}
              className="h-8 px-3 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {/* Table content */}
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden shadow-2xs bg-white dark:bg-zinc-900/40">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-sm text-zinc-400 dark:text-zinc-500 gap-2">
                <RefreshCw size={14} className="animate-spin" /> Loading API
                keys…
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-40 text-sm text-zinc-400 dark:text-zinc-500 gap-3">
                <span>Failed to load API keys.</span>
                <button
                  onClick={() => refetch()}
                  className="h-8 px-4 rounded border border-zinc-200 dark:border-zinc-700 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Retry
                </button>
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-sm text-zinc-400 dark:text-zinc-500 gap-3">
                <span>No API keys found.</span>
                <button
                  onClick={() =>
                    setModals((prev) => ({ ...prev, create: true }))
                  }
                  className="h-8 px-4 rounded bg-zinc-950 text-white text-xs font-semibold"
                >
                  Create your first key
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider text-[10.5px] uppercase">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Scopes</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">Last Used</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 text-zinc-800 dark:text-zinc-300">
                  {filteredKeys.map((k) => {
                    const badgeStyles = {
                      SDK: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
                      MCP: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                      Integration:
                        "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
                      Automation:
                        "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
                      Agent: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
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
                        onClick={() => handleRowClick(k)}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 cursor-pointer group transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-semibold text-zinc-950 dark:text-zinc-100">
                            {k.name}
                          </div>
                          <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate max-w-[200px]">
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
                            {k.scopes.length === 0 ? (
                              <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10">
                                All Scopes
                              </span>
                            ) : (
                              k.scopes.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="font-mono text-[10.5px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60"
                                >
                                  {s}
                                </span>
                              ))
                            )}
                            {k.scopes.length > 2 && (
                              <span className="font-mono text-[10.5px] text-zinc-400 dark:text-zinc-500">
                                +{k.scopes.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded border ${k.environment === "PRODUCTION" ? "border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60"}`}
                          >
                            {k.environment === "PRODUCTION" ? "PROD" : "DEV"}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-500 dark:text-zinc-400">{k.used}</td>
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
                            className="h-7 w-7 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                          >
                            &bull;&bull;&bull;
                          </button>

                          {openMenuId === k.id && (
                            <div className="absolute right-3 top-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-md py-1 w-40 z-50 overflow-hidden animate-fadeIn">
                              <button
                                onClick={() => handleRowClick(k)}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs"
                              >
                                View
                              </button>
                              <button
                                onClick={() => triggerModal("edit", k.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => triggerModal("rotate", k.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs"
                              >
                                Rotate
                              </button>
                              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />
                              <button
                                onClick={() => triggerModal("suspend", k.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs"
                              >
                                {k.status === "suspended"
                                  ? "Reactivate"
                                  : "Suspend"}
                              </button>
                              <button
                                onClick={() => triggerModal("audit", k.id)}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs"
                              >
                                Audit History
                              </button>
                              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />
                              <button
                                onClick={() => triggerModal("revoke", k.id)}
                                className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-500/10 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out drawer */}
      <KeyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeKey={activeKey}
        onActionTrigger={(modalKey) => {
          if (activeKeyId) triggerModal(modalKey, activeKeyId);
        }}
      />

      {/* Create wizard */}
      <CreateKeyWizard
        isOpen={modals.create}
        onClose={() => setModals((prev) => ({ ...prev, create: false }))}
        onSuccess={(keyName) => {
          showToast(
            `"${keyName}" created — store the key now, it won't be shown again.`,
            "success",
          );
        }}
      />

      {/* Edit modal */}
      <EditModal
        isOpen={modals.edit}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, edit: false }))}
        onSave={async (updatedName) => {
          if (!activeKey) return;
          try {
            await updateKey.mutateAsync({
              id: activeKey.id,
              data: { name: updatedName },
            });
            showToast(`Renamed to "${updatedName}"`);
          } catch (e) {
            showToast("Failed to rename key", "error");
          }
        }}
      />

      {/* Rotate modal */}
      <RotateModal
        isOpen={modals.rotate}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, rotate: false }))}
        onSuccess={(newKey) => {
          showToast("Key rotated — new secret shown. Store it now.", "warning");
        }}
      />

      {/* Suspend / Reactivate modal */}
      <SuspendModal
        isOpen={modals.suspend}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, suspend: false }))}
        onConfirm={async () => {
          if (!activeKey) return;
          try {
            if (activeKey.status === "suspended") {
              await updateKey.mutateAsync({
                id: activeKey.id,
                data: { isActive: true },
              });
              showToast(`"${activeKey.name}" reactivated.`);
            } else {
              await revokeKey.mutateAsync(activeKey.id);
              showToast(
                `"${activeKey.name}" suspended — all auth blocked.`,
                "warning",
              );
            }
          } catch (e) {
            showToast("Action failed", "error");
          }
        }}
      />

      {/* Audit history modal */}
      <AuditModal
        isOpen={modals.audit}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, audit: false }))}
        showToast={showToast}
      />

      {/* Permanent delete modal */}
      <RevokeModal
        isOpen={modals.revoke}
        activeKey={activeKey}
        onClose={() => setModals((prev) => ({ ...prev, revoke: false }))}
        onConfirm={async () => {
          if (!activeKey) return;
          try {
            await deleteKey.mutateAsync(activeKey.id);
            showToast(`"${activeKey.name}" permanently deleted.`, "error");
            setIsDrawerOpen(false);
            setActiveKeyId(null);
          } catch (e) {
            showToast("Failed to delete key", "error");
          }
        }}
      />

      {/* Toast stack */}
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
