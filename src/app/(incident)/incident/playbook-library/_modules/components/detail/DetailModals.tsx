import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { OWNERS } from "../../data";
import { ChangeDef, Playbook } from "../../types";

const inputCls =
  "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 bg-white font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors dark:border-zinc-700 dark:text-zinc-100 dark:bg-zinc-900";

/* ---------- Edit playbook ---------- */

interface EditPlaybookModalProps {
  isOpen: boolean;
  playbook: Playbook;
  onClose: () => void;
  onSave: (patch: Pick<Playbook, "name" | "owner">, change: ChangeDef) => void;
}

export function EditPlaybookModal({
  isOpen,
  playbook,
  onClose,
  onSave,
}: EditPlaybookModalProps): React.JSX.Element {
  const [name, setName] = useState(playbook.name);
  const [owner, setOwner] = useState(playbook.owner);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setReason("");
        setError("");
        onClose();
      }}
      className="sm:max-w-md"
    >
      <div className="p-5">
        <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 mb-1">Edit playbook</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Changes are submitted to the governed change ledger and take effect after approval.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Owner</label>
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className={inputCls}>
              {OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Reason for change
            </label>
            <input
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="Required for the audit trail"
              className={inputCls}
            />
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{error}</p>}
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
              Recorded against the change, alongside author, approver, and risk assessment.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                setError("A reason is required for the audit trail");
                return;
              }
              onSave(
                { name: name.trim() || playbook.name, owner },
                {
                  author: "Paschal Ifediora",
                  approver: "Pending",
                  date: "1 Jul 2026",
                  reason: reason.trim(),
                  risk: "Low",
                },
              );
              setReason("");
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            Submit for approval
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Request execution ---------- */

export function RequestExecutionModal({
  isOpen,
  playbook,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  playbook: Playbook;
  onClose: () => void;
  onSubmit: () => void;
}): React.JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md">
      <div className="p-5">
        <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 mb-1">Request execution</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          {playbook.name} · {playbook.version}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
          Execution is governed. The request is validated against all {playbook.rules.length}{" "}
          linked operational rules, then routed to the approvers below before anything runs.
        </p>
        <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm dark:border-zinc-800 dark:divide-zinc-800">
          <div className="flex gap-3 px-3 py-2.5">
            <span className="text-zinc-500 w-40 shrink-0 dark:text-zinc-500">Execution mode</span>
            <span className="font-medium">{playbook.mode}</span>
          </div>
          <div className="flex gap-3 px-3 py-2.5">
            <span className="text-zinc-500 w-40 shrink-0 dark:text-zinc-500">Environments</span>
            <span className="font-medium">{playbook.env.join(" · ")}</span>
          </div>
          <div className="flex gap-3 px-3 py-2.5">
            <span className="text-zinc-500 w-40 shrink-0 dark:text-zinc-500">Approvers</span>
            <span className="font-medium">{playbook.approvers.join(" + ")}</span>
          </div>
          <div className="flex gap-3 px-3 py-2.5">
            <span className="text-zinc-500 w-40 shrink-0 dark:text-zinc-500">Max autonomous actions</span>
            <span className="font-mono font-medium">{playbook.maxAuto}</span>
          </div>
          <div className="flex gap-3 px-3 py-2.5">
            <span className="text-zinc-500 w-40 shrink-0 dark:text-zinc-500">Average approval time</span>
            <span className="font-mono font-medium">{playbook.approvalTime}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            Submit execution request
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Restore version ---------- */

export function RestoreVersionModal({
  version,
  playbook,
  onClose,
  onConfirm,
}: {
  version: string | null;
  playbook: Playbook;
  onClose: () => void;
  onConfirm: (v: string) => void;
}): React.JSX.Element {
  return (
    <Modal isOpen={!!version} onClose={onClose} className="sm:max-w-md">
      {version && (
        <div className="p-5">
          <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 mb-1">Restore {version}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{playbook.name}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
            Restoring {version} creates a new version based on it — the current {playbook.version}{" "}
            is preserved in history. The restored version requires approval by{" "}
            {playbook.approvers.join(" and ")} before it can execute.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(version)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              Submit restore for approval
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------- Compare versions ---------- */

const DIFFS: Record<string, [string, string][]> = {
  "v5.0": [
    ["+", "Rollback verification required after execution"],
    ["~", "Verification stage now includes database health verification v2.4"],
    ["=", "Approval policy unchanged"],
  ],
  "v4.2": [
    ["+", "Rollback verification required after execution"],
    ["+", "Causal reconstruction engine v2.6 integrated"],
    ["=", "Confidence threshold 0.85 unchanged"],
  ],
  "v4.0": [
    ["+", "Rollback verification required after execution"],
    ["+", "Causal reconstruction engine v2.6 integrated"],
    ["+", "Confidence threshold raised to 0.85"],
    ["=", "Operational rule support unchanged"],
  ],
  "v3.0": [
    ["+", "Operational rules linked"],
    ["+", "Causal reconstruction engine integrated"],
    ["+", "Rollback verification required"],
    ["-", "Legacy single-document definition removed"],
  ],
};

export function CompareVersionsModal({
  version,
  playbook,
  onClose,
}: {
  version: string | null;
  playbook: Playbook;
  onClose: () => void;
}): React.JSX.Element {
  const rows = (version && DIFFS[version]) || [["=", "No differences recorded"]];
  return (
    <Modal isOpen={!!version} onClose={onClose} className="sm:max-w-xl">
      {version && (
        <div className="p-5">
          <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 mb-1">
            Compare {version} → {playbook.version}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            {playbook.name} · differences applied since {version}
          </p>
          <div className="space-y-1.5">
            {rows.map(([sig, txt], i) => (
              <div
                key={i}
                className={`flex gap-3 items-baseline rounded-lg px-3 py-2 text-sm ${
                  sig === "+"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : sig === "-"
                      ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-zinc-50 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-500"
                }`}
              >
                <span className="font-mono font-semibold shrink-0">{sig === "~" ? "±" : sig}</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
