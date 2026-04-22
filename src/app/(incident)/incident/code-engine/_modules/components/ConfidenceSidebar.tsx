"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Check } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface EvidenceSignalItem {
  label: string;
  value: string;
  valueColor?: string;
}

interface RiskAnalysisItem {
  label: string;
  value: string;
  valueColor?: string;
  subValue?: string;
  subValueColor?: string;
}

interface Props {
  confidence?: number;
  confidenceLabel?: string;
  riskLevel?: string;
  approvalMode?: string;
  evidenceSignals?: EvidenceSignalItem[];
  riskAnalysis?: RiskAnalysisItem[];
  decisionModel?: string;
  decisionInputs?: string[];
  reasoningSummary?: string;
  playbook?: string;
  patternMatch?: string;
  incident?: string;
  prNumber?: string;
  prTitle?: string;
  prRepo?: string;
  prBranch?: string;
  prUrl?: string;
  auditLabel?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionDivider() {
  return <div className="border-t border-neutral-700/50 my-1" />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-neutral-200 mb-3">{children}</p>
  );
}

function CheckRow({
  label,
  value,
  valueColor = "text-neutral-300",
  subValue,
  subValueColor = "text-red-400",
}: {
  label: string;
  value: string;
  valueColor?: string;
  subValue?: string;
  subValueColor?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-2.5">
      <div className="flex items-center gap-2 shrink-0">
        <Check size={13} className="text-green-400 shrink-0" />
        <span className="text-xs text-neutral-400">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium ${valueColor}`}>{value}</span>
        {subValue && (
          <p className="text-xs mt-0.5">
            <span className="text-neutral-300">Auto-merge allowed : </span>
            <span className={subValueColor}>{subValue}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ConfidenceSidebar({
  confidence = 0.91,
  confidenceLabel = "High - auto-PR eligible",
  riskLevel = "Low",
  approvalMode = "Approval Required",
  evidenceSignals = [
    {
      label: "Root cause correlation",
      value: "High ( 0.87 )",
      valueColor: "text-green-400",
    },
    {
      label: "Test Validation",
      value: "Pass ( 12/12 )",
      valueColor: "text-green-400",
    },
    {
      label: "Historical match",
      value: "3 similar incidents",
      valueColor: "text-neutral-300",
    },
    {
      label: "Deployment proximity",
      value: "High ( recent change detected )",
      valueColor: "text-neutral-300",
    },
  ],
  riskAnalysis = [
    {
      label: "Service impact",
      value: "High (production - critical)",
      valueColor: "text-green-400",
    },
    {
      label: "Blast Radius",
      value: "Medium",
      valueColor: "text-yellow-400",
      subValue: "( auth + session layer )",
    },
    {
      label: "Policy Status",
      value: "Requires approval : YES",
      valueColor: "text-neutral-300",
      subValue: "NO",
      subValueColor: "text-red-400",
    },
  ],
  decisionModel = "ezra-fix-v2",
  decisionInputs = [
    "logs (last 15 mins)",
    "Code diff ( PR #2847 )",
    "Metrics ( latency spike )",
    "Deployment history",
  ],
  reasoningSummary = "Detected regression in JWT validation flow introduced in last deploy.\nFix enforces algorithm + issuer validation consistent with policy",
  playbook = "jwt-algo-constraint-v3",
  patternMatch = "INC - 231 , INC - 187 (x2)",
  incident = "INC-9284 . P1",
  prNumber = "#2847",
  prTitle = "fix(auth) : enforce RS256 + issuer validation [ INC-9204 ]",
  prRepo = "acme-corp/checkout-api",
  prBranch = "ezra/fix-inc-9204 → main",
  prUrl = "github.com/acme/checkout-api/pull/2847",
  auditLabel = "Every action written to INC-9204 audit trail",
  onApprove,
  onReject,
}: Props) {
  const [confidenceOpen, setConfidenceOpen] = useState(true);

  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="w-full bg-darkEzra text-neutral-300 flex flex-col overflow-y-auto">
      {/* ── Confidence Score Section ── */}
      <div className="px-4 pt-4 pb-2">
        {/* Header row */}
        <button
          onClick={() => setConfidenceOpen((o) => !o)}
          className="flex items-center justify-between w-full mb-3 bg-transparent border-none cursor-pointer"
        >
          <span className="text-sm font-medium text-neutral-200">
            Confidence Score
          </span>
          {confidenceOpen ? (
            <ChevronUp size={16} className="text-neutral-400" />
          ) : (
            <ChevronDown size={16} className="text-neutral-400" />
          )}
        </button>

        {confidenceOpen && (
          <>
            {/* Score */}
            <p className="text-4xl font-bold text-green-400 leading-none mb-2">
              {confidence}
            </p>

            {/* Progress bar */}
            <div className="h-1.5 bg-neutral-700 rounded-full mb-2">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${confidencePct}%` }}
              />
            </div>

            <p className="text-xs text-neutral-400 mb-4">{confidenceLabel}</p>

            {/* Inner card */}
            <div className="bg-[#161e2e] rounded-xl p-4">
              {/* Risk level row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-neutral-400">
                  Risk level :{" "}
                  <span className="text-neutral-200 font-semibold">
                    {riskLevel}
                  </span>
                </span>
                <span className="text-xs text-neutral-400">
                  Auto /{" "}
                  <span className="text-neutral-200 font-semibold">
                    {approvalMode}
                  </span>
                </span>
              </div>

              {/* Evidence Signal */}
              <SectionTitle>Evidence Signal</SectionTitle>
              {evidenceSignals.map((s) => (
                <CheckRow
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  valueColor={s.valueColor}
                />
              ))}

              <SectionDivider />

              {/* Risk Analysis */}
              <div className="mt-3">
                <SectionTitle>Risk Analysis</SectionTitle>
                {riskAnalysis.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-start justify-between gap-3 mb-2.5"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <Check size={13} className="text-green-400 shrink-0" />
                      <span className="text-xs text-neutral-400">
                        {r.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-medium ${
                          r.valueColor ?? "text-neutral-300"
                        }`}
                      >
                        {r.value}
                        {r.label === "Blast Radius" && (
                          <span className="text-neutral-300 font-normal">
                            {" "}
                            {r.subValue}
                          </span>
                        )}
                      </p>
                      {r.label === "Policy Status" && r.subValue && (
                        <p className="text-xs mt-0.5 text-neutral-300">
                          Auto-merge allowed :{" "}
                          <span className={r.subValueColor ?? "text-red-400"}>
                            {r.subValue}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <SectionDivider />

              {/* Decision Trace */}
              <div className="mt-3">
                <SectionTitle>Decision Trace</SectionTitle>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xs text-neutral-500 w-14 shrink-0">
                    Model
                  </span>
                  <span className="text-xs text-neutral-300">
                    {decisionModel}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-neutral-500 w-14 shrink-0">
                    Inputs
                  </span>
                  <div className="flex flex-col gap-1">
                    {decisionInputs.map((input) => (
                      <span key={input} className="text-xs text-neutral-300">
                        — {input}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <SectionDivider />

              {/* Reasoning Summary */}
              <div className="mt-3">
                <SectionTitle>Reasoning Summary</SectionTitle>
                <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">
                  {reasoningSummary}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <SectionDivider />

      {/* ── Suggested Source ── */}
      <div className="px-4 py-4">
        <SectionTitle>Suggested Source</SectionTitle>
        <div className="space-y-2.5">
          {[
            { label: "Playbook", value: playbook },
            { label: "Pattern match", value: patternMatch },
            { label: "Incident", value: incident },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-neutral-500 shrink-0">{label}</span>
              <span className="text-xs text-neutral-300 text-right">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Pull Request ── */}
      <div className="px-4 py-4">
        <SectionTitle>Pull Request</SectionTitle>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-bold text-neutral-100">
            {prNumber}
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-green-900/40 text-green-400 border border-green-800">
            open
          </span>
        </div>

        <p className="text-xs text-neutral-300 mb-3 leading-relaxed">
          {prTitle}
        </p>

        <div className="space-y-1.5">
          {[prRepo, prBranch, prUrl].map((val) => (
            <p key={val} className="text-xs text-neutral-500">
              {val}
            </p>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Actions ── */}
      <div className="px-4 py-4 flex flex-col gap-3">
        <button
          onClick={onApprove}
          className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-900 text-sm font-bold transition-colors"
        >
          Approve &amp; merge
        </button>
        <button
          onClick={onReject}
          className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-colors"
        >
          Reject
        </button>
        <p className="text-[11px] text-neutral-600 text-center">{auditLabel}</p>
      </div>
    </div>
  );
}
