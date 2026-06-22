import Modal from "@/components/ui/Modal";
import { ApiKey, AuditEntry } from "../_modules/types/apiKeys";
import { useState } from "react";
import { Trash2, RefreshCw, Check } from "lucide-react";
import React from "react";

// 1. Edit Configuration Modal
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
      <div className="w-full max-w-md bg-white rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
          Edit API Key Configuration
        </h3>
        <div className="flex flex-col">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Key Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded border border-zinc-200 px-3 text-xs outline-none focus:border-zinc-950"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded border text-xs text-zinc-600 font-medium hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(name);
              onClose();
            }}
            className="h-8 px-3.5 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

// 2. Token Rotation Wizard Modal
export function RotateModal({
  isOpen,
  activeKey,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  activeKey: ApiKey | null;
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  const [phase, setPhase] = useState(1);
  const [reason, setReason] = useState("");

  if (!isOpen || !activeKey) return null;

  const handleRotate = () => {
    const nextMaskedId = `SDK-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
    onSuccess(nextMaskedId);
    setPhase(1);
    setReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
          Rotate Operational Key
        </h3>

        {phase === 1 && (
          <div className="space-y-4 text-xs">
            <div className="font-medium text-zinc-700 mb-1">
              Select rotation operational parameter reason:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Scheduled rotation",
                "Suspected compromise",
                "Offboarding",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setReason(chip)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all ${reason === chip ? "bg-zinc-950 border-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"}`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="h-8 px-3 rounded border text-xs text-zinc-600 font-medium"
              >
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
            <div className="bg-amber-50 border-l-2 border-amber-500 text-amber-800 p-3 rounded-r leading-relaxed">
              The current secret remains valid for a{" "}
              <strong className="font-bold">24-hour grace period</strong> so you
              can update upstream microservices without processing downtime.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPhase(1)}
                className="h-8 px-3 rounded border text-xs text-zinc-600 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleRotate}
                className="h-8 px-3.5 rounded bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 shadow-sm"
              >
                Rotate Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// 3. Temporary Suspension Modal
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
  const isSus = activeKey.status === "suspended";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">
          {isSus ? "Reactivate Key" : "Suspend Key"}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {isSus
            ? "Reactivating this key will restore authorization access pipelines instantly."
            : "Why are you temporarily suspending access channels on this operational identifier?"}
        </p>
        {!isSus && (
          <div className="flex flex-wrap gap-1.5">
            {["Suspected misuse", "Maintenance"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setReason(chip)}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-medium ${reason === chip ? "bg-zinc-950 text-white" : "border-zinc-200 bg-white"}`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded border text-xs font-medium"
          >
            Cancel
          </button>
          <button
            disabled={!isSus && !reason}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`h-8 px-3.5 rounded text-xs font-semibold shadow-sm ${isSus ? "bg-zinc-950 text-white hover:bg-zinc-800" : "bg-amber-500 text-zinc-950 hover:bg-amber-600 font-bold"}`}
          >
            {isSus ? "Reactivate" : "Suspend Access"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// 4. Interactive Audit History Logs Modal
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
  if (!isOpen || !activeKey) return null;

  const mockEvents: AuditEntry[] = [
    {
      time: "11:52",
      type: "read",
      event: "Queried Similar Incidents",
      meta: "incident.read &bull; payments-api",
      actor: "API",
    },
    {
      time: "11:48",
      type: "write",
      event: "Created Incident SI-0001247",
      meta: "incident.write &bull; payments-worker",
      actor: "API",
    },
    {
      time: "11:43",
      type: "read",
      event: "Retrieved Knowledge Intelligence",
      meta: "knowledge.read &bull; payments-api",
      actor: "API",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 space-y-4">
        <div className="border-b pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-900">Audit History Log</h3>
          <span className="font-mono text-xs text-zinc-400 bg-zinc-50 border px-2 py-0.5 rounded">
            {activeKey.id}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap text-xs">
          {["all", "auth", "read", "write", "config", "error"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 rounded border uppercase font-semibold ${filter === t ? "bg-zinc-950 border-zinc-950 text-white" : "border-zinc-200 text-zinc-500 bg-white"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto font-sans text-xs">
          {mockEvents.map((e, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 py-3 items-start">
              <span className="col-span-2 font-mono text-[11px] text-zinc-400">
                {e.time} UTC
              </span>
              <span className="col-span-2 uppercase font-mono text-[10px] font-bold text-zinc-400 tracking-wider">
                [{e.type}]
              </span>
              <div className="col-span-6">
                <div className="font-semibold text-zinc-800">{e.event}</div>
                <div
                  className="font-mono text-[10.5px] text-zinc-400 mt-0.5"
                  dangerouslySetInnerHTML={{ __html: e.meta }}
                />
              </div>
              <span className="col-span-2 text-right font-medium text-zinc-500">
                {e.actor}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <button
            onClick={() => showToast("CSV dataset generated")}
            className="h-8 px-3 rounded border text-xs font-medium hover:bg-zinc-50"
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

// 5. Permanent Revocation Safeguard Modal
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
      <div className="w-full max-w-md bg-white rounded-xl p-5 space-y-4 border-t-4 border-red-500">
        <h3 className="text-sm font-bold text-red-600">
          Revoke API Key Permanently
        </h3>
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs space-y-2 leading-relaxed shadow-3xs">
          <div>
            &bull; All authentication using this key fails{" "}
            <strong className="font-bold">immediately</strong> — there is no
            grace period.
          </div>
          <div>
            &bull; Revocation is{" "}
            <strong className="font-bold">permanent</strong>. This key cannot be
            restored or reactivated.
          </div>
        </div>
        <div className="flex flex-col text-xs">
          <label className="text-zinc-600 font-medium mb-1.5">
            Type{" "}
            <strong className="font-mono font-bold text-zinc-900">
              REVOKE
            </strong>{" "}
            to authorize execution
          </label>
          <input
            type="text"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            placeholder="REVOKE"
            className="h-9 w-full rounded border border-zinc-200 px-3 font-mono tracking-widest outline-none focus:border-red-500 uppercase"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              setTypedConfirm("");
              onClose();
            }}
            className="h-8 px-3 rounded border text-xs font-medium"
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
            <Trash2 size={13} /> Revoke permanently
          </button>
        </div>
      </div>
    </Modal>
  );
}
