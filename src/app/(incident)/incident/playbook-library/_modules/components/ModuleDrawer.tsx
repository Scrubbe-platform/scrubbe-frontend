import React from "react";
import SideModal from "@/components/ui/SideModal";
import { usedBy } from "../data";
import { ModuleDef } from "../types";

interface ModuleDrawerProps {
  module: ModuleDef | null;
  onClose: () => void;
  onPublish: (id: string) => void;
}

export default function ModuleDrawer({
  module,
  onClose,
  onPublish,
}: ModuleDrawerProps): React.JSX.Element {
  const deps = module ? usedBy(module.id) : [];

  return (
    <SideModal
      isOpen={!!module}
      onClose={onClose}
      title={module?.name ?? ""}
      subTitle={module ? `${module.cat} module · ${module.id} · v${module.ver}` : ""}
    >
      {module && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm mb-2">Purpose</h4>
            <p className="text-sm text-zinc-500 leading-relaxed">{module.desc}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Governance</h4>
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-sm">
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0">Owner</span>
                <span className="font-medium">{module.owner}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0">Current version</span>
                <span className="font-mono font-medium">v{module.ver}</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0">Change policy</span>
                <span className="font-medium">Approval required</span>
              </div>
              <div className="flex gap-3 px-3 py-2.5">
                <span className="text-zinc-500 w-36 shrink-0">Propagation</span>
                <span className="font-medium">All dependent playbooks</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Used by {deps.length} playbooks</h4>
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100">
              {deps.slice(0, 12).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-zinc-700">{p.name}</span>
                  <span className="font-mono text-xs text-zinc-400">{p.version}</span>
                </div>
              ))}
            </div>
            {deps.length > 12 && (
              <p className="text-xs text-zinc-400 mt-2">And {deps.length - 12} more.</p>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <button
              onClick={() => onPublish(module.id)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
            >
              Publish module update
            </button>
          </div>
        </div>
      )}
    </SideModal>
  );
}
