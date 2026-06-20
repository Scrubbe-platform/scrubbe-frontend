"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Bot,
  Building2,
  ArrowDown,
  ChevronLeft,
} from "lucide-react";
import Button from "@/components/ui/Button1";
import { mockEscalationPolicies } from "../constant/index";
import CreateEscalationPolicyModal from "./CreateEscalationPolicyModal";
import { useRouter } from "next/navigation";

export default function EscalationPoliciesPanel() {
  const [policies, setPolicies] = useState(mockEscalationPolicies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleDeletePolicy = (id: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="w-full p-6">
      {/* View Header */}
      <div className="mb-4">
        <Button
          leftIcon={<ChevronLeft size={16} />}
          size="sm"
          variant="outline-dark"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Escalation Policies
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Define escalation chains for each incident severity
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={14} className="mr-1" />}
        >
          New Policy
        </Button>
      </div>

      {/* Policies Loop Grid Stack */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {/* Header Box Row */}
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3 mb-4 dark:border-zinc-900">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-zinc-900 dark:text-white">
                    {policy.name}
                  </h3>

                  {/* Status Badges conditional indicators */}
                  {policy.warRoom && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                      <Building2 size={11} /> War Room
                    </span>
                  )}
                  {policy.autoEscalate && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                      <Bot size={11} /> Auto-esc
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Trigger:{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {policy.severity}
                  </span>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 transition-colors"
                  title="Edit Policy"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeletePolicy(policy.id)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                  title="Delete Policy"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Dynamic Step Mapping & Chain Visuals Grid */}
            <div className="flex flex-col gap-2">
              {policy.steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-3">
                    {/* Step Numeric Node Index Indicator */}
                    <div className="h-6 w-6 shrink-0 rounded-full border flex items-center justify-center font-mono text-[11px] font-bold dark:bg-zinc-100 dark:text-zinc-950">
                      {index + 1}
                    </div>

                    {/* Process Description Strip */}
                    <div className="flex flex-1 items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:border-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-200">
                      <span>{step.target}</span>
                      <span className="font-mono text-zinc-400 dark:text-zinc-500">
                        {step.timeout}min · {step.channels}
                      </span>
                    </div>
                  </div>

                  {/* Operational Flow Chain Separation Line Connector */}
                  {index < policy.steps.length - 1 && (
                    <div className="pl-2.5 my-[1px] text-zinc-300 dark:text-zinc-700">
                      <ArrowDown size={12} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controlled Action Modal Creation Frame Context */}
      <CreateEscalationPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
