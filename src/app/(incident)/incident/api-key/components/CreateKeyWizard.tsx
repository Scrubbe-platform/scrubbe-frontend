import Modal from "@/components/ui/Modal";
import React, { useState } from "react";
import { useCreateApiKey } from "../_modules/hooks/useApiKeys";
import { CreatedApiKey } from "../_modules/types/apiKeys";
import { Copy, Check } from "lucide-react";

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

const PERMISSION_OPTIONS = [
  "incident.read",
  "incident.write",
  "incident.close",
  "playbook.read",
  "handover.read",
  "mcp.read",
  "agent.execute",
  "deployment.write",
  "integration.read",
];

const stepLabels = [
  "Identity & Type",
  "Scopes & Permissions",
  "Environment",
  "Security & Expiry",
  "Review & Generate",
];

export default function CreateKeyWizard({ isOpen, onClose, onSuccess }: WizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["incident.read"]);
  const [environment, setEnvironment] = useState<"PRODUCTION" | "DEVELOPMENT">("PRODUCTION");
  const [expiryOption, setExpiryOption] = useState<"30" | "90" | "never">("never");
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const createMutation = useCreateApiKey();

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const expiresAt = () => {
    if (expiryOption === "never") return undefined;
    const d = new Date();
    d.setDate(d.getDate() + parseInt(expiryOption) * 30);
    return d.toISOString();
  };

  const handleGenerate = async () => {
    try {
      const result = await createMutation.mutateAsync({
        name: name || "Unnamed Key",
        environment,
        scopes: selectedScopes,
        expiresAt: expiresAt(),
      });
      setCreatedKey(result);
      setStep(6);
    } catch {
      // error is shown via mutation state
    }
  };

  const handleDone = () => {
    const keyName = createdKey?.name ?? name;
    onSuccess(keyName);
    // reset
    setStep(1);
    setName("");
    setSelectedScopes(["incident.read"]);
    setEnvironment("PRODUCTION");
    setExpiryOption("never");
    setCreatedKey(null);
    setCopied(false);
    onClose();
  };

  const handleCopy = () => {
    if (!createdKey?.key) return;
    navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-start">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Create API Key</h2>
            <p className="text-[11.5px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Step {step} of {step === 6 ? 6 : 5} —{" "}
              {step === 6 ? "Key Generated" : stepLabels[step - 1]}
            </p>
          </div>
        </div>

        {/* Progress */}
        {step < 6 && (
          <div className="px-6 pt-5">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const isDone = idx < step;
                const isActive = idx === step;
                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                        isActive
                          ? "bg-zinc-950 text-white"
                          : isDone
                            ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {isDone ? "✓" : idx}
                    </div>
                    {idx < 5 && <div className="flex-1 h-[1px] bg-zinc-200 dark:bg-zinc-700" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Key Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Payments SDK Production"
                  className="h-9 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 px-3 text-xs outline-none focus:border-zinc-950 dark:focus:border-zinc-400"
                />
              </div>
            </div>
          )}

          {/* Step 2: Scopes */}
          {step === 2 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Select permissions this key will have
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {PERMISSION_OPTIONS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded p-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(p)}
                      onChange={() => toggleScope(p)}
                      className="accent-zinc-950"
                    />
                    <span className="font-mono">{p}</span>
                  </label>
                ))}
              </div>
              {selectedScopes.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Select at least one scope.</p>
              )}
            </div>
          )}

          {/* Step 3: Environment */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Target Environment
              </label>
              {(["PRODUCTION", "DEVELOPMENT"] as const).map((env) => (
                <label
                  key={env}
                  className={`flex items-center gap-3 border rounded p-3 text-xs font-medium cursor-pointer transition-all ${environment === env ? "border-zinc-950 dark:border-zinc-400 bg-zinc-50 dark:bg-zinc-800/60" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"}`}
                >
                  <input
                    type="radio"
                    name="environment"
                    checked={environment === env}
                    onChange={() => setEnvironment(env)}
                    className="accent-zinc-950"
                  />
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{env}</div>
                    <div className="text-zinc-400 dark:text-zinc-500 text-[11px] mt-0.5">
                      {env === "PRODUCTION"
                        ? "Live traffic — handle with care"
                        : "Safe for testing and development"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Step 4: Expiry */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">Key Expiration</label>
                <div className="flex gap-2">
                  {(["30", "90", "never"] as const).map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExpiryOption(exp)}
                      className={`flex-1 py-2 border rounded cursor-pointer font-medium transition-all ${expiryOption === exp ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500"}`}
                    >
                      {exp === "never" ? "Never" : `${exp} Days`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-3 text-xs">
              <div className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm mb-3">Review before generating</div>
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-400 dark:text-zinc-500">Name</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">{name || "Unnamed Key"}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-400 dark:text-zinc-500">Environment</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">{environment}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-400 dark:text-zinc-500">Scopes</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedScopes.map((s) => (
                      <span key={s} className="font-mono px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span className="text-zinc-400 dark:text-zinc-500">Expires</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {expiryOption === "never" ? "Never" : `In ${expiryOption} days`}
                  </span>
                </div>
              </div>
              {createMutation.isError && (
                <p className="text-red-600 dark:text-red-400 text-[11px]">
                  {String(createMutation.error?.message ?? "Failed to create key")}
                </p>
              )}
            </div>
          )}

          {/* Step 6: Key revealed */}
          {step === 6 && createdKey && (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl mx-auto font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">API Key Generated</h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Your key is ready. This secret will only be shown once.
                </p>
              </div>
              <div className="bg-zinc-950 text-emerald-400 p-3 rounded font-mono text-[11.5px] flex items-center justify-between gap-3 shadow-inner text-left">
                <span className="break-all">{createdKey.key}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 rounded hover:bg-emerald-500/20 flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded p-3 text-left text-amber-800 dark:text-amber-400 text-[11.5px] leading-relaxed flex gap-2">
                <span>⚠</span>
                <span>
                  Store this key securely now. It cannot be retrieved after you close this dialog.
                  If lost, rotate the key to generate a new secret.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-2 bg-white dark:bg-zinc-900">
          {step > 1 && step < 6 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="h-8 rounded border border-zinc-200 dark:border-zinc-700 px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 mr-auto"
            >
              ← Back
            </button>
          )}
          {step < 5 && (
            <>
              <button
                onClick={onClose}
                className="h-8 rounded border border-zinc-200 dark:border-zinc-700 px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep((prev) => prev + 1)}
                disabled={step === 2 && selectedScopes.length === 0}
                className="h-8 rounded px-3.5 text-xs font-semibold text-white shadow-xs bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40"
              >
                Next →
              </button>
            </>
          )}
          {step === 5 && (
            <>
              <button
                onClick={onClose}
                className="h-8 rounded border border-zinc-200 dark:border-zinc-700 px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={createMutation.isPending}
                className="h-8 rounded px-3.5 text-xs font-bold shadow-xs bg-emerald-500 hover:bg-emerald-600 text-zinc-950 disabled:opacity-50"
              >
                {createMutation.isPending ? "Generating…" : "Generate Key"}
              </button>
            </>
          )}
          {step === 6 && (
            <button
              onClick={handleDone}
              className="h-8 rounded px-3.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
