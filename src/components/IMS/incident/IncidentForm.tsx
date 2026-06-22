"use client";
import React, { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Info, X, Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import { querykeys } from "@/lib/constant";
import {
  createIncident,
  uploadIncidentAttachment,
} from "@/lib/incident/incident.api";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

// ── Schema ────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────

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

// Severity — color per level (meaningful signal)
const severityConfig: Record<
  RaiseIncidentFormValues["severity"],
  { label: string; active: string }
> = {
  P0: {
    label: "Full outage",
    active:
      "border-red-500 bg-red-50 dark:bg-red-500/8 text-red-600 dark:text-red-400",
  },
  P1: {
    label: "Critical",
    active:
      "border-red-400 bg-red-50 dark:bg-red-500/8 text-red-500 dark:text-red-400",
  },
  P2: {
    label: "Major",
    active:
      "border-amber-500 bg-amber-50 dark:bg-amber-500/8 text-amber-600 dark:text-amber-400",
  },
  P3: {
    label: "Minor",
    active:
      "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/8 text-yellow-600 dark:text-yellow-400",
  },
  P4: {
    label: "Info",
    active:
      "border-sky-400 bg-sky-50 dark:bg-sky-500/8 text-sky-600 dark:text-sky-400",
  },
};

// ── FormSection ───────────────────────────────────────────────────

const FormSection = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5">
    <p className="text-[14px] font-semibold text-black dark:text-zinc-100 mb-4">
      {title}
    </p>
    {children}
  </div>
);

// ── WarRoomToggle ─────────────────────────────────────────────────

function WarRoomToggle({
  value,
  onChange,
}: {
  value: "not-required" | "open-war-room";
  onChange: (v: "not-required" | "open-war-room") => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
        War room
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onChange("not-required")}
          className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors ${
            value === "not-required"
              ? "border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-100"
              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/40 text-black dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
          }`}
        >
          <span className="text-[13px] font-semibold">Not required</span>
          <span className="text-[11px] mt-0.5 text-black dark:text-zinc-500">
            Standard incident flow
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("open-war-room")}
          className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors ${
            value === "open-war-room"
              ? "border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/40 text-black dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
          }`}
        >
          <span className="text-[13px] font-semibold">Open War room</span>
          <span className="text-[11px] mt-0.5 text-black dark:text-zinc-500">
            Creates Slack channel + Teams + Zoom meeting
          </span>
        </button>
      </div>
    </div>
  );
}

// ── EvidenceSection ───────────────────────────────────────────────

interface AttachedFile {
  id: string;
  file: File;
}

function EvidenceSection({
  files,
  onAdd,
  onRemove,
}: {
  files: AttachedFile[];
  onAdd: (f: File[]) => void;
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

  const formatSize = (b: number) =>
    b < 1024
      ? `${b}B`
      : b < 1024 * 1024
        ? `${(b / 1024).toFixed(1)}KB`
        : `${(b / (1024 * 1024)).toFixed(1)}MB`;

  return (
    <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-5">
      <p className="text-[14px] font-semibold text-black dark:text-zinc-100 mb-0.5">
        Evidence and Attachments
      </p>
      <p className="text-[12px] text-black dark:text-zinc-500 mb-4">
        Upload files as evidence
      </p>

      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/5"
            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
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
        <div className="w-9 h-9 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <Upload size={16} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
          Drop files here or click to browse
        </p>
        <p className="text-[11px] text-black dark:text-zinc-500 mt-1">
          PNG, JPG, PDF, .txt, .json, .yaml — max 25MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((af) => (
            <div
              key={af.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <FileText
                    size={13}
                    className="text-zinc-400 dark:text-zinc-500"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-black dark:text-zinc-200 truncate">
                    {af.file.name}
                  </p>
                  <p className="text-[11px] text-black dark:text-zinc-500">
                    {formatSize(af.file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(af.id)}
                className="p-1.5 rounded-lg text-black hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────

const RaiseIncidentModal = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();
  const { get } = useFetch();
  const { data: serviceNodes = [] } = useQuery({
    queryKey: ["service-map-list"],
    queryFn: async () => {
      const res = await get(endpoint.service_map.list);
      return res.success ? (res.data?.data ?? []) : [];
    },
  });
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

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
      ...members.map((m) => {
        const n = `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() || m.email;
        return { value: m.email, label: `${n} (${m.email})` };
      }),
    ],
    [members],
  );

  const createMutation = useMutation({
    mutationFn: async (data: RaiseIncidentFormValues) => {
      const incident = await createIncident({
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
      });

      if (attachedFiles.length > 0) {
        const results = await Promise.allSettled(
          attachedFiles.map((af) =>
            uploadIncidentAttachment(incident.id, af.file),
          ),
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) {
          toast.error(
            `${failed} of ${attachedFiles.length} attachment(s) failed to upload.`,
          );
        }
      }

      return incident;
    },
    onSuccess: async (incident) => {
      await queryClient.invalidateQueries({
        queryKey: [querykeys.INCIDENT_TICKET],
      });
      toast.success(`Incident ${incident.ticketId} created`);
      onClose?.();
      router.push(`/incident?id=${incident.id}&tab=overview`);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Unable to create the incident right now."),
  });

  const [watchedTitle, watchedEnv, watchedSeverity, watchedService] = [
    watch("title"),
    watch("environment"),
    watch("severity"),
    watch("service"),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-950 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-black dark:text-zinc-100">
              Raise Incident
            </h2>
            <p className="mt-0.5 text-[12px] text-black dark:text-zinc-500">
              Manual raise · enters the same governance pipeline as
              auto-detected incidents
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1.5 text-black hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(async (data) =>
            createMutation.mutateAsync(data),
          )}
          className="space-y-3 p-6"
        >
          {/* Core Details */}
          <FormSection title="Core Details">
            <div className="space-y-5">
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
                        {
                          value: "select-service",
                          label:
                            serviceNodes.length > 0
                              ? "Select service..."
                              : "No services registered yet",
                        },
                      ].concat(
                        serviceNodes.map((s: { id: string; name: string }) => ({
                          value: s.name,
                          label: s.name,
                        })),
                      )}
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
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                  Severity *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["P0", "P1", "P2", "P3"] as const).map((sev) => (
                    <Controller
                      key={sev}
                      name="severity"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(sev)}
                          className={`flex flex-col items-center rounded-xl border p-3 transition-colors ${
                            field.value === sev
                              ? severityConfig[sev].active
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/40 text-black dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600"
                          }`}
                        >
                          <span className="text-[13px] font-bold">{sev}</span>
                          <span className="text-[9px] uppercase opacity-70 mt-0.5">
                            {severityConfig[sev].label}
                          </span>
                        </button>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Context & Detail */}
          <FormSection title="Context & Detail">
            <div className="space-y-5">
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

          {/* Assignment & Notifications */}
          <FormSection title="Assignment & Notifications">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <EvidenceSection
            files={attachedFiles}
            onAdd={(f) =>
              setAttachedFiles((p) => [
                ...p,
                ...f.map((file) => ({
                  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  file,
                })),
              ])
            }
            onRemove={(id) =>
              setAttachedFiles((p) => p.filter((f) => f.id !== id))
            }
          />

          {/* Preview */}
          <div className="rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-3">
              Incident Preview
            </p>
            <p className="text-[18px] font-bold text-black dark:text-zinc-100 mb-1 break-words">
              {watchedTitle || "Incident title will appear here…"}
            </p>
            <p className="text-[12px] text-black dark:text-zinc-400 mb-3">
              {watchedService !== "select-service" ? watchedService : "Service"}{" "}
              · {watchedEnv} · {watchedSeverity}
            </p>
            <div className="flex items-start gap-2 text-[11px] text-black dark:text-zinc-500">
              <Info size={13} className="mt-0.5 shrink-0" />
              <p>
                Scrubbe will correlate this with active signals and run playbook
                matching automatically once raised.
              </p>
            </div>
          </div>

          {createMutation.isError && (
            <p className="text-[12px] text-red-500">
              Unable to create the incident right now. Please try again.
            </p>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 z-20 flex justify-end gap-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-500 dark:border-zinc-700 px-5 py-2 text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-2 text-[12px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending
                ? "Creating…"
                : "Save and raise incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIncidentModal;
