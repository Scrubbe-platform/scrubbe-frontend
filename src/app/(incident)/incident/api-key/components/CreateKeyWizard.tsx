import Modal from "@/components/ui/Modal";
import React from "react";
import { useState } from "react";

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export default function CreateKeyWizard({
  isOpen,
  onClose,
  onSuccess,
}: WizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("SDK");

  const stepLabels = [
    "Identity & Type",
    "Service Scope",
    "Permissions",
    "Environment",
    "Security & Expiry",
    "Review & Generate",
  ];

  const handleNext = () => {
    if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      onSuccess(name || "Payments SDK");
      setStep(1);
      setName("");
      onClose();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full bg-white rounded-xl overflow-hidden">
        {/* Wizard Header */}
        <div className="p-5 border-b border-zinc-200 flex justify-between items-start">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Create API Key
            </h2>
            <p className="text-[11.5px] text-zinc-400 mt-0.5">
              Step {step} of 6 — {stepLabels[step - 1]}
            </p>
          </div>
        </div>

        {/* Wizard Progress Nodes Indicator */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => {
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
                          ? "bg-emerald-50 border border-emerald-300 text-emerald-600"
                          : "border border-zinc-200 text-zinc-400"
                    }`}
                  >
                    {isDone ? "✓" : idx}
                  </div>
                  {idx < 6 && <div className="flex-1 h-[1px] bg-zinc-200" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Dynamic Canvas Steps Panels */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-zinc-700 mb-1.5">
                  Key Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Payments SDK Production"
                  className="h-9 w-full rounded border border-zinc-300 px-3 text-xs outline-none focus:border-zinc-950"
                />
              </div>
              <div className="text-xs font-semibold text-zinc-700 mb-2">
                Key Type
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["SDK", "Integration", "MCP", "Automation", "Agent"].map(
                  (t) => (
                    <div
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`border p-2.5 rounded cursor-pointer transition-all ${selectedType === t ? "border-zinc-950 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"}`}
                    >
                      <div className="font-bold text-xs text-zinc-950">{t}</div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-2">
                Select Services this key can access
              </label>
              {[
                "payments-api",
                "auth-api",
                "billing-api",
                "notifications-service",
              ].map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-3 border border-zinc-200 rounded p-2.5 text-xs font-mono cursor-pointer hover:bg-zinc-50"
                >
                  <input
                    type="checkbox"
                    defaultChecked={s === "payments-api"}
                    className="accent-zinc-950"
                  />{" "}
                  {s}
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-2">
                Select Permissions Scope
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "View Incidents",
                  "Create Incidents",
                  "Update Incidents",
                  "Close Incidents",
                  "View Handover",
                  "View Playbooks",
                ].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 border border-zinc-200 rounded p-2 cursor-pointer hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={p !== "Close Incidents"}
                      className="accent-zinc-950"
                    />{" "}
                    {p}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-2">
                Environment Scope Restriction
              </label>
              {["Production", "Staging", "Development", "Sandbox"].map(
                (env) => (
                  <label
                    key={env}
                    className="flex items-center gap-3 border border-zinc-200 rounded p-2.5 text-xs font-medium cursor-pointer hover:bg-zinc-50"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={env !== "Sandbox"}
                      className="accent-zinc-950"
                    />{" "}
                    {env}
                  </label>
                ),
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-2">
                  Key Expiration
                </label>
                <div className="flex gap-2">
                  {["30 Days", "90 Days", "Never"].map((exp) => (
                    <div
                      key={exp}
                      className={`px-4 py-2 border rounded cursor-pointer font-medium ${exp === "Never" ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200"}`}
                    >
                      {exp}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-zinc-700 mb-1.5">
                  Rate Limit (requests / minute)
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  className="h-9 w-full rounded border border-zinc-300 px-3 outline-none focus:border-zinc-950"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 flex items-center justify-center text-xl mx-auto font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950">
                  API Key Secret Generated
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Your key is ready. This secret will only be shown once.
                </p>
              </div>
              <div className="bg-zinc-950 text-emerald-400 p-3 rounded font-mono text-[11.5px] select-all break-all text-left shadow-inner">
                SDK-8KXJ29W81A9DQRT2NP7XLMFVZ3BCYW6HJES04UI
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-left text-amber-800 text-[11.5px] leading-relaxed flex gap-2">
                <span>⚠</span>
                <span>
                  Store this key securely now. It cannot be retrieved after you
                  close this dialog. If lost, rotate the key to generate a new
                  secret.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Actions Footer Controls */}
        <div className="p-4 border-t border-zinc-200 flex justify-end gap-2 bg-white">
          {step > 1 && step < 6 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 mr-auto"
            >
              ← Back
            </button>
          )}
          <button
            onClick={onClose}
            className="h-8 rounded border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={handleNext}
            className={`h-8 rounded px-3.5 text-xs font-semibold text-white shadow-xs ${step === 5 ? "bg-emerald-500 hover:bg-emerald-600 !text-zinc-950 font-bold" : "bg-zinc-950 hover:bg-zinc-800"}`}
          >
            {step === 5 ? "Generate Key" : step === 6 ? "Done" : "Next →"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
