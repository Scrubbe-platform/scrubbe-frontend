"use client";

import React, { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Info, X, Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import { querykeys } from "@/lib/constant";
import { createIncident } from "@/lib/incident/incident.api";

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

export const raiseIncidentSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  service: z
    .string()
    .min(1, "Please select an affected service")
    .refine((v) => v !== "select-service", "Please select a valid service"),
  environment: z.string().min(1, "Environment is required"),
  severity: z.enum(["P0", "P1", "P2", "P3", "P4"]),
  description: z.string().min(20, "Please provide a more detailed description"),
  firstNoticed: z.string().min(1, "Selection required"),
  recentChange: z.string().optional(),
  customerImpact: z.string().min(1, "Impact status required"),
  businessImpact: z.string().optional(),
  assignTo: z.string().min(1, "Please assign a lead"),
  notifyChannels: z.string().min(1, "Select at least one channel"),
  warRoom: z.enum(["not-required", "open-war-room"]),
});

type RaiseIncidentFormValues = z.infer<typeof raiseIncidentSchema>;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const severityToPriority: Record<RaiseIncidentFormValues["severity"], string> =
  {
    P0: "CRITICAL",
    P1: "CRITICAL",
    P2: "HIGH",
    P3: "MEDIUM",
    P4: "LOW",
  };

const firstNoticedLabels: Record<string, string> = {
  "alert-alarm-fired": "Alert or alarm fired",
  "customer-report": "Customer report",
  "latency-spike": "Latency spike",
};

const customerImpactLabels: Record<string, string> = {
  unknown: "Impact still being validated",
  "partial-degradation": "Partial customer degradation",
  "full-service-outage": "Full service outage",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const buildImpactSummary = (data: RaiseIncidentFormValues) =>
  [
    customerImpactLabels[data.customerImpact] ?? data.customerImpact,
    data.businessImpact ? `Business impact: ${data.businessImpact}` : "",
    data.recentChange ? `Recent change: ${data.recentChange}` : "",
  ]
    .filter(Boolean)
    .join(". ");

// ─────────────────────────────────────────────────────────────────
// FormSection
// ─────────────────────────────────────────────────────────────────

const FormSection = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6">
    <p className="font-semibold text-lg pb-4 text-zinc-800 dark:text-white">
      {title}
    </p>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────
// WarRoomToggle
// ─────────────────────────────────────────────────────────────────

function WarRoomToggle({
  value,
  onChange,
}: {
  value: "not-required" | "open-war-room";
  onChange: (v: "not-required" | "open-war-room") => void;
}) {
  return (
    <div>
      <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-slate-500">
        War room
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("not-required")}
          className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
            value === "not-required"
              ? "border-zinc-400 dark:border-white/20 bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white"
              : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-zinc-400 dark:text-slate-400 hover:border-zinc-300 dark:hover:border-white/20"
          }`}
        >
          <span className="font-semibold text-sm">Not required</span>
          <span className="text-xs text-zinc-400 dark:text-slate-500 mt-0.5">
            Standard incident flow
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("open-war-room")}
          className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
            value === "open-war-room"
              ? "border-green-500/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
              : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-zinc-400 dark:text-slate-400 hover:border-zinc-300 dark:hover:border-white/20"
          }`}
        >
          <span className="font-semibold text-sm">Open War room</span>
          <span
            className="text-xs mt-0.5"
            style={{ color: value === "open-war-room" ? "#16a34a" : "#94a3b8" }}
          >
            Creates Slack channel + Teams + Zoom meeting
          </span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EvidenceSection
// ─────────────────────────────────────────────────────────────────

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

function EvidenceSection({
  files,
  onAdd,
  onRemove,
}: {
  files: AttachedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds 25MB limit`);
        return false;
      }
      return true;
    });
    if (valid.length) onAdd(valid);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6">
      <p className="font-semibold text-lg pb-1 text-zinc-800 dark:text-white">
        Evidence and Attachments
      </p>
      <p className="text-xs text-zinc-400 dark:text-slate-500 mb-5">
        Upload files as evidence
      </p>

      {/* Drop zone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragging
            ? "border-green-500/60 bg-green-50 dark:bg-green-950/20"
            : "border-zinc-300 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/25 hover:bg-zinc-100 dark:hover:bg-white/[0.03]"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf,.log,.txt,.json,.yaml,.yml"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-3">
          <Upload size={18} className="text-zinc-400 dark:text-slate-400" />
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-slate-300">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-zinc-400 dark:text-slate-600 mt-1">
          PNG, JPG, PDF, Log, .txt, .json, .yaml — max 25MB per file
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((af) => (
            <div
              key={af.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <FileText
                    size={14}
                    className="text-zinc-400 dark:text-slate-400"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-700 dark:text-slate-200 truncate">
                    {af.file.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-slate-500">
                    {formatSize(af.file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(af.id)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────

const RaiseIncidentModal = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const handleAddFiles = (incoming: File[]) => {
    const newFiles: AttachedFile[] = incoming.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RaiseIncidentFormValues>({
    resolver: zodResolver(raiseIncidentSchema),
    defaultValues: {
      severity: "P2",
      environment: "Production",
      customerImpact: "unknown",
      title: "",
      description: "",
      firstNoticed: "alert-alarm-fired",
      recentChange: "",
      businessImpact: "",
      assignTo: "",
      notifyChannels: "sre-oncall-pagerduty",
      service: "select-service",
      warRoom: "not-required",
    },
  });

  const assigneeOptions = useMemo(
    () => [
      { value: "", label: "Select incident owner..." },
      ...members.map((member) => {
        const fullName =
          `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() ||
          member.email;
        return { value: member.email, label: `${fullName} (${member.email})` };
      }),
    ],
    [members]
  );

  const createMutation = useMutation({
    mutationFn: async (data: RaiseIncidentFormValues) =>
      createIncident({
        summary: data.title.trim(),
        reason: data.title.trim(),
        description: data.description.trim(),
        techDescription: data.description.trim(),
        impactSummary: buildImpactSummary(data) || data.description.trim(),
        serviceArea: data.service,
        affectedSystem: data.service,
        environment: data.environment,
        severity: data.severity,
        priority: severityToPriority[data.severity],
        status: "OPEN",
        state: "OPEN",
        source: "MANUAL",
        sourceType: "Manual raise",
        detection: firstNoticedLabels[data.firstNoticed] ?? data.firstNoticed,
        reportedBy: "Incident workspace",
        assignedToEmail: data.assignTo,
        incidentCommander: data.assignTo,
        financialExposure: data.businessImpact?.trim() || undefined,
        customerCommNeeded: data.notifyChannels !== "no-notification",
        customerMessage:
          customerImpactLabels[data.customerImpact] ?? data.customerImpact,
        recommendedActions: data.recentChange?.trim()
          ? [`Review recent change: ${data.recentChange.trim()}`]
          : [],
      }),
    onSuccess: async (incident) => {
      await queryClient.invalidateQueries({
        queryKey: [querykeys.INCIDENT_TICKET],
      });
      toast.success(`Incident ${incident.ticketId} created`);
      onClose?.();
      router.push(`/incident?id=${incident.id}&tab=overview`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create the incident right now.");
    },
  });

  const watchedTitle = watch("title");
  const watchedEnv = watch("environment");
  const watchedSeverity = watch("severity");
  const watchedService = watch("service");

  const severityStyles: Record<
    RaiseIncidentFormValues["severity"],
    { active: string; label: string }
  > = {
    P0: {
      active: "border-red-500 text-red-500 bg-red-500/5",
      label: "Full outage",
    },
    P1: {
      active: "border-red-600 text-red-600 bg-red-600/5",
      label: "Critical impact",
    },
    P2: {
      active: "border-orange-500 text-orange-500 bg-orange-500/5",
      label: "Major degradation",
    },
    P3: {
      active: "border-yellow-500 text-yellow-500 bg-yellow-500/5",
      label: "Minor impact",
    },
    P4: {
      active: "border-blue-500 text-blue-500 bg-blue-500/5",
      label: "Informational",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-dark shadow-2xl">
        {/* ── Header ── */}
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-dark p-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
              Raise Incident
            </h2>
            <p className="mt-1 text-sm text-zinc-400 dark:text-slate-500">
              Manual raise · enters the same governance pipeline as
              auto-detected incidents
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-zinc-100 dark:bg-white/5 p-2 text-zinc-400 dark:text-slate-500 transition-colors hover:text-zinc-700 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(async (data) =>
            createMutation.mutateAsync(data)
          )}
          className="space-y-4 p-8"
        >
          {/* ── Core Details ── */}
          <FormSection title="Core Details">
            <div className="space-y-6">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Incident Title *"
                    placeholder="Brief description of what's failing"
                    error={errors.title?.message}
                  />
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Affected Service *"
                      error={errors.service?.message}
                      options={[
                        { value: "select-service", label: "Select service..." },
                        {
                          value: "checkout-service",
                          label: "checkout-service",
                        },
                        { value: "billing-service", label: "billing-service" },
                        { value: "auth-service", label: "auth-service" },
                        { value: "api-gateway", label: "api-gateway" },
                      ]}
                    />
                  )}
                />
                <Controller
                  name="environment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Environment *"
                      error={errors.environment?.message}
                      options={[
                        { value: "Production", label: "Production" },
                        { value: "Staging", label: "Staging" },
                        { value: "Development", label: "Development" },
                      ]}
                    />
                  )}
                />
              </div>

              {/* Severity picker */}
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-slate-500">
                  Severity *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(["P0", "P1", "P2", "P3", "P4"] as const).map((sev) => (
                    <Controller
                      key={sev}
                      name="severity"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(sev)}
                          className={`flex flex-col items-center rounded-xl border p-3 transition-all ${
                            field.value === sev
                              ? severityStyles[sev].active
                              : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-400 dark:text-slate-400 hover:border-zinc-300 dark:hover:border-white/30"
                          }`}
                        >
                          <span className="font-bold">{sev}</span>
                          <span className="text-[10px] uppercase opacity-60">
                            {severityStyles[sev].label}
                          </span>
                        </button>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* ── Context & Detail ── */}
          <FormSection title="Context & Detail">
            <div className="space-y-6">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    label="What is happening? *"
                    placeholder="Describe the symptoms, affected users, and what responders know so far."
                    error={errors.description?.message}
                    rows={4}
                  />
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="firstNoticed"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="What did you notice first? *"
                      error={errors.firstNoticed?.message}
                      options={[
                        {
                          value: "alert-alarm-fired",
                          label: "Alert or alarm fired",
                        },
                        { value: "customer-report", label: "Customer report" },
                        { value: "latency-spike", label: "Latency spike" },
                      ]}
                    />
                  )}
                />
                <Controller
                  name="recentChange"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Recent change? (optional)"
                      placeholder="Recent deploy, config change, or rollback"
                    />
                  )}
                />
                <Controller
                  name="customerImpact"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Customer Impact *"
                      error={errors.customerImpact?.message}
                      options={[
                        { value: "unknown", label: "Unknown" },
                        {
                          value: "partial-degradation",
                          label: "Partial degradation",
                        },
                        {
                          value: "full-service-outage",
                          label: "Full service outage",
                        },
                      ]}
                    />
                  )}
                />
                <Controller
                  name="businessImpact"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Business Impact (£/min)"
                      placeholder="Optional estimate"
                    />
                  )}
                />
              </div>
            </div>
          </FormSection>

          {/* ── Assignment & Notifications ── */}
          <FormSection title="Assignment & Notifications">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Controller
                  name="assignTo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Assign To *"
                      error={errors.assignTo?.message}
                      options={assigneeOptions}
                    />
                  )}
                />
                <Controller
                  name="notifyChannels"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Notify Channels *"
                      error={errors.notifyChannels?.message}
                      options={[
                        {
                          value: "sre-oncall-pagerduty",
                          label: "#sre-oncall + PagerDuty",
                        },
                        {
                          value: "incident-room-only",
                          label: "Incident room only",
                        },
                        { value: "no-notification", label: "No notification" },
                      ]}
                    />
                  )}
                />
              </div>
              <Controller
                name="warRoom"
                control={control}
                render={({ field }) => (
                  <WarRoomToggle
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* ── Evidence ── */}
          <EvidenceSection
            files={attachedFiles}
            onAdd={handleAddFiles}
            onRemove={(id) =>
              setAttachedFiles((p) => p.filter((f) => f.id !== id))
            }
          />

          {/* ── Incident Preview ── */}
          <div className="rounded-3xl border border-green-500/20 bg-green-50 dark:bg-green-950/20 p-8">
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">
              Incident Preview
            </span>
            <h3 className="mb-2 break-words text-2xl font-bold text-zinc-800 dark:text-white">
              {watchedTitle || "Incident title will appear here..."}
            </h3>
            <p className="mb-2 text-sm text-zinc-500 dark:text-slate-400">
              {watchedService !== "select-service" ? watchedService : "Service"}{" "}
              · {watchedEnv} · {watchedSeverity}
            </p>
            <div className="flex items-start gap-2 text-xs text-zinc-400 dark:text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>
                Scrubbe will correlate this with active signals and run playbook
                matching automatically once raised.
              </p>
            </div>
          </div>

          {createMutation.isError && (
            <p className="text-sm text-red-500">
              Unable to create the incident right now. Please try again.
            </p>
          )}

          {/* ── Footer ── */}
          <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-dark py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 dark:border-white/10 px-6 py-2.5 font-semibold text-zinc-700 dark:text-white transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createMutation.isPending}
              className="rounded-xl border border-zinc-200 dark:border-white/10 px-6 py-2.5 font-semibold text-zinc-700 dark:text-white transition-all hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-green-500 dark:bg-green-400 px-8 py-2.5 font-bold text-white dark:text-[#050b18] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending
                ? "Creating..."
                : "Save and update incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIncidentModal;
