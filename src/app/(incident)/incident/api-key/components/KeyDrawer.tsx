import { ApiKey } from "../_modules/types/apiKeys";
import { X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface KeyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeKey: ApiKey | null;
  onActionTrigger: (
    key: "edit" | "rotate" | "suspend" | "audit" | "revoke",
  ) => void;
}

export default function KeyDrawer({
  isOpen,
  onClose,
  activeKey,
  onActionTrigger,
}: KeyDrawerProps) {
  const [activeTab, setActiveTab] = useState("info");

  if (!activeKey) return null;

  const formatDate = (d: string | null) => {
    if (!d) return "Never";
    try {
      return format(new Date(d), "MMM d, yyyy");
    } catch {
      return "—";
    }
  };

  const statusDot = {
    active: "bg-emerald-400",
    expired: "bg-amber-500",
    revoked: "bg-red-500",
    suspended: "bg-zinc-400",
  }[activeKey.status];

  const MCP_CAPABILITIES = [
    "Similar Incident Search",
    "Previous Remediation Search",
    "Playbook Discovery",
  ];

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-50 transition-opacity ${isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[560px] bg-white border-l border-zinc-200 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between transition-transform duration-250 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div>
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 flex items-start justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">{activeKey.name}</h2>
              <div className="flex items-center gap-2 text-[12px] text-zinc-400 mt-1">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                <span className="capitalize">{activeKey.status}</span>
                <span>&bull;</span>
                <span>{activeKey.type}</span>
                <span>&bull;</span>
                <span>{activeKey.environment === "PRODUCTION" ? "Production" : "Development"}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab nav */}
          <div className="flex border-b border-zinc-100 text-xs font-medium">
            {[
              { key: "info", label: "Details" },
              { key: "scopes", label: "Scopes" },
              ...(activeKey.type === "MCP" ? [{ key: "mcp", label: "MCP Access" }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-zinc-950 text-zinc-950"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {activeTab === "info" && (
              <>
                {/* Key ID */}
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                    Key Identity
                  </div>
                  <div className="bg-zinc-950 rounded-lg p-3 font-mono text-[11px] text-zinc-400 break-all select-all">
                    {activeKey.id}
                  </div>
                  <p className="text-[10.5px] text-zinc-400 mt-1.5">
                    The raw secret is not stored after creation. Rotate to get a new secret.
                  </p>
                </div>

                {/* Basic info grid */}
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                    Basic Information
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <span className="text-zinc-400">Status</span>
                    <span className="text-zinc-900 font-medium capitalize flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                      {activeKey.status}
                    </span>
                    <span className="text-zinc-400">Environment</span>
                    <span className="font-mono text-zinc-900">{activeKey.environment}</span>
                    <span className="text-zinc-400">Created</span>
                    <span className="text-zinc-900">{formatDate(activeKey.createdAt)}</span>
                    <span className="text-zinc-400">Expires</span>
                    <span className="text-zinc-900">{formatDate(activeKey.expiresAt)}</span>
                    <span className="text-zinc-400">Last Used</span>
                    <span className="text-zinc-900">{activeKey.used}</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "scopes" && (
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                  Granted Scopes ({activeKey.scopes.length})
                </div>
                {activeKey.scopes.length === 0 ? (
                  <div className="text-xs text-zinc-400 py-4 text-center">
                    No scopes defined — this key has no access.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {activeKey.scopes.map((scope) => (
                      <div
                        key={scope}
                        className="flex items-center gap-2 text-xs font-mono text-zinc-700 border border-zinc-100 rounded px-3 py-2 bg-zinc-50"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {scope}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "mcp" && activeKey.type === "MCP" && (
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                  MCP Capabilities
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl text-white space-y-2 text-xs">
                  {MCP_CAPABILITIES.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-zinc-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {cap}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="p-4 border-t border-zinc-200 bg-white sticky bottom-0 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => onActionTrigger("edit")}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Rename
            </button>
            <button
              onClick={() => onActionTrigger("rotate")}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Rotate Key
            </button>
            <button
              onClick={() => onActionTrigger("suspend")}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {activeKey.status === "suspended" ? "Reactivate" : "Suspend"}
            </button>
            <button
              onClick={() => onActionTrigger("audit")}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Audit
            </button>
          </div>
          <button
            onClick={() => onActionTrigger("revoke")}
            className="h-8 rounded border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50/50"
          >
            Delete Key
          </button>
        </div>
      </div>
    </>
  );
}
