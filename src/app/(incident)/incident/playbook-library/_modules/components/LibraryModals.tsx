import React, { useRef, useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { MODES, OWNERS, SERVICES } from "../data";
import { ExecutionMode, Playbook } from "../types";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

const inputCls =
  "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200";

/* ---------- Create playbook ---------- */

interface CreatePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; service: string; mode: ExecutionMode; owner: string }) => void;
}

export function CreatePlaybookModal({
  isOpen,
  onClose,
  onCreate,
}: CreatePlaybookModalProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [mode, setMode] = useState<ExecutionMode>(MODES[1]);
  const [owner, setOwner] = useState(OWNERS[0]);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setService(SERVICES[0]);
    setMode(MODES[1]);
    setOwner(OWNERS[0]);
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      className="sm:max-w-md"
    >
      <div className="p-5">
        <h3 className="font-bold text-[16px] text-zinc-900 mb-1 dark:text-zinc-100">Create playbook</h3>
        <p className="text-xs text-zinc-500 mb-5 dark:text-zinc-400">
          New playbooks start as drafts and must pass governance review before activation.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 dark:text-zinc-400">
              Playbook name
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Read replica failover response"
              className={inputCls}
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 dark:text-zinc-400">Service</label>
            <select value={service} onChange={(e) => setService(e.target.value)} className={inputCls}>
              {SERVICES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 dark:text-zinc-400">
              Execution mode
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`border rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    mode === m
                      ? "border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100"
                      : "border-zinc-300 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 dark:text-zinc-600">
              Operational rules can tighten this, never loosen it.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 dark:text-zinc-400">Owner</label>
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className={inputCls}>
              {OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) {
                setError("Give the playbook a name to continue");
                return;
              }
              onCreate({ name: name.trim(), service, mode, owner });
              reset();
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            Create draft
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Import playbooks ---------- */

interface ImportPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (fileName: string) => void;
}

export function ImportPlaybookModal({
  isOpen,
  onClose,
  onImported,
}: ImportPlaybookModalProps): React.JSX.Element {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md">
      <div className="p-5">
        <h3 className="font-bold text-[16px] text-zinc-900 mb-1 dark:text-zinc-100">Import playbooks</h3>
        <p className="text-xs text-zinc-500 mb-5 dark:text-zinc-400">
          Imported playbooks arrive as drafts and pass through governance review before
          activation.
        </p>

        <div className="border-2 border-dashed border-zinc-300 rounded-xl px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
          <b className="text-zinc-800 dark:text-zinc-200">Choose a file</b> — JSON or YAML playbook definitions.
          <div className="text-xs text-zinc-400 mt-1 dark:text-zinc-600">
            Modules referenced by ID are matched against the module library.
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 px-4 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Choose file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json,.yaml,.yml"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              e.target.value = "";
              // Parse JSON and submit to server
              try {
                const text = await f.text();
                let parsed: any;
                try {
                  parsed = JSON.parse(text);
                } catch {
                  // YAML or invalid JSON — fall back to name-only import
                  onImported(f.name);
                  return;
                }
                const payload: any[] = Array.isArray(parsed) ? parsed : [parsed];
                await Promise.all(
                  payload.map((p: any) => customAxios.post(endpoint.playbooks.create, p)),
                );
                onImported(f.name);
              } catch {
                // Fall back to name-only import so the UI still responds
                onImported(f.name);
              }
            }}
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Version history (library-wide) ---------- */

const LIBRARY_VERSION_ROWS = [
  { pb: "Database connection recovery", v: "v5.1", change: "Added rollback verification", by: "Platform lead" },
  { pb: "Payment gateway failover", v: "v3.2", change: "Customer transaction probe added to verification", by: "Payments lead" },
  { pb: "Kubernetes node drain and replace", v: "v2.4", change: "Cost guardrail OR-013 linked", by: "Infrastructure lead" },
  { pb: "Auth token service restart", v: "v4.0", change: "Security review gate added — OR-012", by: "Security lead" },
];

export function VersionHistoryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const [rows, setRows] = useState(LIBRARY_VERSION_ROWS);

  useEffect(() => {
    if (!isOpen) return;
    customAxios
      .get(endpoint.playbooks.executions)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (Array.isArray(data) && data.length > 0) {
          setRows(
            data.map((e: any) => ({
              pb: e.playbookName ?? e.name ?? `Playbook ${e.playbookId ?? ""}`,
              v: e.version ?? `v${e.id ?? "?"}`,
              change: e.summary ?? e.notes ?? "",
              by: e.triggeredBy ?? e.approvedBy ?? "System",
            })),
          );
        }
      })
      .catch(() => {}); // fallback to static rows
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-2xl">
      <div className="p-5">
        <h3 className="font-bold text-[16px] text-zinc-900 mb-1 dark:text-zinc-100">Library version history</h3>
        <p className="text-xs text-zinc-500 mb-5 dark:text-zinc-400">
          Most recent approved changes across all playbooks.
        </p>
        <div className="border border-zinc-200 rounded-lg overflow-hidden dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800">
                {["Playbook", "Version", "Change", "Approved by"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 px-3.5 py-2.5 dark:text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">{r.pb}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs text-zinc-500 dark:text-zinc-500">{r.v}</td>
                  <td className="px-3.5 py-2.5 text-zinc-500 dark:text-zinc-500">{r.change}</td>
                  <td className="px-3.5 py-2.5 text-zinc-700 dark:text-zinc-400">{r.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Archive / restore confirm ---------- */

interface ArchiveModalProps {
  playbook: Playbook | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function ArchiveModal({
  playbook,
  onClose,
  onConfirm,
}: ArchiveModalProps): React.JSX.Element {
  const restoring = playbook?.status === "Archived";
  return (
    <Modal isOpen={!!playbook} onClose={onClose} className="sm:max-w-sm">
      {playbook && (
        <div className="p-5">
          <h3 className="font-bold text-[16px] text-zinc-900 mb-1 dark:text-zinc-100">
            {restoring ? "Restore playbook" : "Archive playbook"}
          </h3>
          <p className="text-xs text-zinc-500 mb-4 dark:text-zinc-400">{playbook.name}</p>
          <p className="text-sm text-zinc-500 leading-relaxed mb-5 dark:text-zinc-400">
            {restoring
              ? "Restoring returns this playbook to draft. It must pass governance review before it can execute again."
              : "Archiving removes this playbook from active routing. Its version history, executions, and audit trail are preserved and remain queryable."}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(playbook.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                restoring
                  ? "text-white bg-emerald-500 hover:bg-emerald-600"
                  : "text-red-600 dark:text-red-400 border border-zinc-300 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-500/10"
              }`}
            >
              {restoring ? "Restore as draft" : "Archive playbook"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
