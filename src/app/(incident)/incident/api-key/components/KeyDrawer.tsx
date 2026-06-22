import { ApiKey } from "../_modules/types/apiKeys";
import { Check, X, Copy } from "lucide-react";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("24h");

  if (!activeKey) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `SDK-8KXJ29W81A9DQRT2NP7XLMFVZ3BCYW6HJES04UI`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-50 transition-opacity ${isOpen ? "opacity-100 block" : "opacity-0 hidden"}`}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[580px] bg-white border-l border-zinc-200 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between transition-transform duration-250 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div>
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-200 flex items-start justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                {activeKey.name}
              </h2>
              <div className="text-[12px] text-zinc-400 mt-1 capitalize">
                {activeKey.type} Key &bull; {activeKey.status} &bull; Created
                June 15, 2026
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-xl text-zinc-400 hover:text-zinc-600 font-normal leading-none"
            >
              &times;
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="p-6 space-y-6">
            {/* Box: Basic Information */}
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                Basic Information
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                <span className="text-zinc-400">Name</span>
                <span className="text-zinc-900 font-medium">
                  {activeKey.name}
                </span>
                <span className="text-zinc-400">Created by</span>
                <span className="text-zinc-900">Paschal Ifediora</span>
                <span className="text-zinc-400">Expires</span>
                <span className="text-zinc-900">Never</span>
              </div>
            </div>

            {/* Box: Token Token Copy Mask Block */}
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                Authentication
              </div>
              <div className="bg-zinc-950 text-emerald-400 font-mono text-xs p-3 rounded-lg flex items-center justify-between gap-4 shadow-inner">
                <span className="truncate">
                  SDK-8KXJ29W81A9D••••••••••••••••••••••••
                </span>
                <button
                  onClick={handleCopy}
                  className="bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 rounded hover:bg-emerald-500/20 shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Box: Bound Matrix List */}
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                Bound Services
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {["payments-api", "payments-worker", "payments-db"].map(
                  (svc) => (
                    <div
                      key={svc}
                      className="flex items-center gap-2 text-zinc-700"
                    >
                      <Check size={11} className="text-emerald-500" />{" "}
                      <span>{svc}</span>
                    </div>
                  ),
                )}
                {["auth-api", "billing-api"].map((svc) => (
                  <div
                    key={svc}
                    className="flex items-center gap-2 text-zinc-300 line-through"
                  >
                    <X size={11} className="text-zinc-300" /> <span>{svc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box: MCP Capabilities list - Conditional Render check */}
            {activeKey.type === "MCP" && (
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                  MCP Access
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl text-white space-y-2 text-xs">
                  {[
                    "Similar Incident Search",
                    "Previous Remediation Search",
                    "Playbook Discovery",
                  ].map((cap) => (
                    <div
                      key={cap}
                      className="flex items-center gap-2 text-zinc-300"
                    >
                      <Check size={12} className="text-emerald-400" /> {cap}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box: Usage Mini-Chart Grid */}
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-1 border-b border-zinc-100">
                Usage Analytics
              </div>
              <div className="flex rounded border border-zinc-200 overflow-hidden mb-3 text-xs">
                {["24h", "7d", "30d"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-center py-1.5 font-medium ${activeTab === tab ? "bg-zinc-950 text-white" : "bg-white text-zinc-400 hover:bg-zinc-50"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                  <div className="font-bold text-sm text-zinc-950">1,284</div>
                  <div className="text-[10px] text-zinc-400 uppercase mt-0.5">
                    Requests
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                  <div className="font-bold text-sm text-zinc-950">47</div>
                  <div className="text-[10px] text-zinc-400 uppercase mt-0.5">
                    Incident Ops
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                  <div className="font-bold text-sm text-zinc-950">203</div>
                  <div className="text-[10px] text-zinc-400 uppercase mt-0.5">
                    Queries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Operations Bottom Action Controls Toolbar */}
        <div className="p-4 border-t border-zinc-200 bg-white sticky bottom-0 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => onActionTrigger("edit")}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Edit
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
              {activeKey.status === "suspended" ? "Unsuspend" : "Suspend"}
            </button>
            <button
              onClick={() => onActionTrigger("audit")}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Audit History
            </button>
          </div>
          <button
            onClick={() => onActionTrigger("revoke")}
            className="h-8 rounded border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50/50"
          >
            Revoke Key
          </button>
        </div>
      </div>
    </>
  );
}
