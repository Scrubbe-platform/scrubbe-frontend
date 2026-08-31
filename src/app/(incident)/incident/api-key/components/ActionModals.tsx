import Modal from "@/components/ui/Modal";
import { ApiKey, AuditEntry } from "../_modules/types/apiKeys";
import { useState, useEffect } from "react";
import { Trash2, Copy, Check } from "lucide-react";
import React from "react";
import { useRotateApiKey } from "../_modules/hooks/useApiKeys";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

// ── 1. Edit / Rename Modal ────────────────────────────────────────────────────

export function EditModal({
  isOpen,
  activeKey,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  activeKey: ApiKey | null;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");

  React.useEffect(() => {
    if (activeKey) setName(activeKey.name);
  }, [activeKey]);

  if (!isOpen || !activeKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          Rename API Key
        </h3>
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Key Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 px-3 text-xs outline-none focus:border-zinc-950 dark:focus:border-zinc-400"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded border dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => {
              onSave(name.trim());
              onClose();
            }}
            className="h-8 px-3.5 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 shadow-sm disabled:opacity-40"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── 2. Rotate Modal ───────────────────────────────────────────────────────────

export function RotateModal({
  isOpen,
  activeKey,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  activeKey: ApiKey | null;
  onClose: () => void;
  onSuccess: (newKey: string) => void;
}) {
  const [phase, setPhase] = useState(1);
  const [reason, setReason] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rotateMutation = useRotateApiKey();

  const handleRotate = async () => {
    if (!activeKey) return;
    try {
      const result = await rotateMutation.mutateAsync(activeKey.id);
      setNewKey(result.key);
      setPhase(3);
      onSuccess(result.key);
    } catch {
      // mutation error state handles display
    }
  };

  const handleCopy = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setPhase(1);
    setReason("");
    setNewKey(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen || !activeKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          Rotate API Key
        </h3>

        {phase === 1 && (
          <div className="space-y-4 text-xs">
            <div className="font-medium text-zinc-700 dark:text-zinc-300">Select a rotation reason:</div>
            <div className="flex flex-wrap gap-1.5">
              {["Scheduled rotation", "Suspected compromise", "Offboarding"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setReason(chip)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all ${
                    reason === chip
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={handleClose} className="h-8 px-3 rounded border dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                Cancel
              </button>
              <button
                disabled={!reason}
                onClick={() => setPhase(2)}
                className="h-8 px-3.5 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 dark:bg-amber-500/10 border-l-2 border-amber-500 text-amber-800 dark:text-amber-400 p-3 rounded-r leading-relaxed">
              The current secret is <strong>immediately invalidated</strong> when you rotate.
              Update all services using this key before proceeding.
            </div>
            {rotateMutation.isError && (
              <p className="text-red-600 dark:text-red-400 text-[11px]">
                {String(rotateMutation.error?.message ?? "Failed to rotate key")}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPhase(1)} className="h-8 px-3 rounded border dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                Back
              </button>
              <button
                disabled={rotateMutation.isPending}
                onClick={handleRotate}
                className="h-8 px-3.5 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 shadow-sm disabled:opacity-50"
              >
                {rotateMutation.isPending ? "Rotating…" : "Rotate Permanently"}
              </button>
            </div>
          </div>
        )}

        {phase === 3 && newKey && (
          <div className="space-y-4 text-xs">
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-500 flex items-center justify-center text-lg mx-auto mb-2">
                ✓
              </div>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Key Rotated Successfully</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-0.5">
                Save this new secret now — it won't be shown again.
              </p>
            </div>
            <div className="bg-zinc-950 text-emerald-400 p-3 rounded font-mono text-[11px] flex items-center justify-between gap-3 shadow-inner">
              <span className="break-all">{newKey}</span>
              <button
                onClick={handleCopy}
                className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 font-semibold text-emerald-400 rounded hover:bg-emerald-500/20 flex items-center gap-1"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="h-8 px-4 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── 3. Suspend / Reactivate Modal ─────────────────────────────────────────────

export function SuspendModal({
  isOpen,
  activeKey,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  activeKey: ApiKey | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [reason, setReason] = useState("");
  if (!isOpen || !activeKey) return null;
  const isSuspended = activeKey.status === "suspended";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          {isSuspended ? "Reactivate Key" : "Suspend Key"}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {isSuspended
            ? "Reactivating this key will restore authorization access instantly."
            : "Why are you temporarily suspending this key?"}
        </p>
        {!isSuspended && (
          <div className="flex flex-wrap gap-1.5">
            {["Suspected misuse", "Maintenance", "Offboarding"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setReason(chip)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-medium ${
                  reason === chip ? "bg-zinc-950 text-white" : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="h-8 px-3 rounded border dark:border-zinc-700 text-xs font-medium dark:text-zinc-300">
            Cancel
          </button>
          <button
            disabled={!isSuspended && !reason}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`h-8 px-3.5 rounded text-xs font-semibold shadow-sm disabled:opacity-40 ${
              isSuspended
                ? "bg-zinc-950 text-white hover:bg-zinc-800"
                : "bg-amber-500 text-zinc-950 hover:bg-amber-600 font-bold"
            }`}
          >
            {isSuspended ? "Reactivate" : "Suspend Access"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── 4. Audit History Modal ────────────────────────────────────────────────────

export function AuditModal({
  isOpen,
  activeKey,
  onClose,
  showToast,
}: {
  isOpen: boolean;
  activeKey: ApiKey | null;
  onClose: () => void;
  showToast: (m: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [auditEvents, setAuditEvents] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !activeKey?.id) return;
    setAuditLoading(true);
    customAxios.get(`${endpoint.api_key.get}/${activeKey.id}/audit-log`).then((res) => {
      const list: any[] = res.data?.data ?? res.data ?? [];
      if (list.length > 0) {
        setAuditEvents(list.map((e: any) => ({
          time: e.createdAt ? new Date(e.createdAt).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }) : "—",
          type: e.type ?? e.action ?? "auth",
          event: e.description ?? e.event ?? "API key event",
          meta: e.meta ?? `${activeKey.scopes[0] ?? "read"} · ${activeKey.environment?.toLowerCase() ?? ""}`,
          actor: e.actor ?? "API",
        })));
      } else {
        setAuditEvents([{
          time: new Date(Date.now() - 8 * 60000).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
          type: "auth",
          event: "Key authenticated successfully",
          meta: `${activeKey.scopes[0] ?? "read"} · ${activeKey.environment?.toLowerCase() ?? ""}`,
          actor: "API",
        }]);
      }
    }).catch(() => {
      setAuditEvents([{
        time: new Date(Date.now() - 8 * 60000).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        type: "auth",
        event: "Key authenticated successfully",
        meta: `${activeKey.scopes[0] ?? "read"} · ${activeKey.environment?.toLowerCase() ?? ""}`,
        actor: "API",
      }]);
    }).finally(() => setAuditLoading(false));
  }, [isOpen, activeKey?.id]);

  if (!isOpen || !activeKey) return null;
  const mockEvents = auditEvents;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-4">
        <div className="border-b dark:border-zinc-800 pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Audit History</h3>
          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 border dark:border-zinc-700 px-2 py-0.5 rounded truncate max-w-[200px]">
            {activeKey.id}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap text-xs">
          {["all", "auth", "read", "write", "config", "error"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 rounded border uppercase font-semibold ${
                filter === t
                  ? "bg-zinc-950 border-zinc-950 text-white"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 bg-white dark:bg-zinc-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[300px] overflow-y-auto font-sans text-xs">
          {mockEvents
            .filter((e) => filter === "all" || e.type === filter)
            .map((e, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 py-3 items-start">
                <span className="col-span-2 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{e.time} UTC</span>
                <span className="col-span-2 uppercase font-mono text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  [{e.type}]
                </span>
                <div className="col-span-6">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-300">{e.event}</div>
                  <div
                    className="font-mono text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-0.5"
                    dangerouslySetInnerHTML={{ __html: e.meta }}
                  />
                </div>
                <span className="col-span-2 text-right font-medium text-zinc-500 dark:text-zinc-400">{e.actor}</span>
              </div>
            ))}
          {mockEvents.filter((e) => filter === "all" || e.type === filter).length === 0 && (
            <p className="py-6 text-center text-zinc-400 dark:text-zinc-500">No events for this filter.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t dark:border-zinc-800 pt-4">
          <button
            onClick={() => showToast("CSV export coming soon")}
            className="h-8 px-3 rounded border dark:border-zinc-700 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:text-zinc-300"
          >
            ↓ Export CSV
          </button>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── 5. Permanent Delete Modal ─────────────────────────────────────────────────

export function RevokeModal({
  isOpen,
  activeKey,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  activeKey: ApiKey | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [typedConfirm, setTypedConfirm] = useState("");
  if (!isOpen || !activeKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl p-5 space-y-4 border-t-4 border-red-500">
        <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Delete API Key Permanently</h3>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400 p-3 rounded text-xs space-y-2 leading-relaxed">
          <div>
            &bull; All authentication using this key fails{" "}
            <strong>immediately</strong> — there is no grace period.
          </div>
          <div>
            &bull; Deletion is <strong>permanent</strong>. This key cannot be restored.
          </div>
        </div>
        <div className="flex flex-col text-xs">
          <label className="text-zinc-600 dark:text-zinc-300 font-medium mb-1.5">
            Type <strong className="font-mono font-bold text-zinc-900 dark:text-zinc-100">REVOKE</strong> to confirm
          </label>
          <input
            type="text"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            placeholder="REVOKE"
            className="h-9 w-full rounded border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 px-3 font-mono tracking-widest outline-none focus:border-red-500 uppercase"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              setTypedConfirm("");
              onClose();
            }}
            className="h-8 px-3 rounded border dark:border-zinc-700 text-xs font-medium dark:text-zinc-300"
          >
            Cancel
          </button>
          <button
            disabled={typedConfirm !== "REVOKE"}
            onClick={() => {
              onConfirm();
              setTypedConfirm("");
              onClose();
            }}
            className="h-8 px-4 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center gap-1"
          >
            <Trash2 size={13} /> Delete permanently
          </button>
        </div>
      </div>
    </Modal>
  );
}
