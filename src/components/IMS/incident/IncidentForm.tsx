"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Info,
  X,
  Upload,
  FileText,
  Trash2,
  ChevronLeft,
  InfoIcon,
  User,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import { querykeys } from "@/lib/constant";
import {
  createIncident,
  uploadStagingIncidentAttachment,
  deleteStagingIncidentAttachment,
} from "@/lib/incident/incident.api";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import Button from "@/components/ui/Button1";
import { FaRegFileLines } from "react-icons/fa6";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FormatTimerDisplay from "./FormatTImerDisplay";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

// ── Schema ────────────────────────────────────────────────────────

export const raiseIncidentSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  service: z.string().optional(),
  environment: z.string().min(1, "Environment is required"),
  severity: z.enum(["P0", "P1", "P2", "P3", "P4"]),
  description: z.string().min(20, "Please provide a more detailed description"),
  state: z.string().min(1, "Please select incident state"),
  firstNoticed: z.string().min(1, "Selection required"),
  recentChange: z.string().optional(),
  customerImpact: z.string().min(1, "Impact status required"),
  businessImpact: z.string().optional(),
  assignTo: z.string().min(1, "Please assign a lead"),
  notifyChannels: z.string().min(1, "Select at least one channel"),
  warRoom: z.enum(["not-required", "open-war-room"]),
});

const TICKET_STATUS_CONFIG = [
  {
    id: 1,
    label: "OPEN",
    display: "Open",
    dotColor: "bg-cyan-400",
    ribbonActive: "bg-cyan-500 text-white border-l-cyan-500",
    ribbonDone: "bg-cyan-500/5 text-cyan-600 dark:text-cyan-400/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: 2,
    label: "ACKNOWLEDGED",
    display: "Acknowledged",
    dotColor: "bg-amber-500",
    ribbonActive: "bg-amber-500 text-white border-l-amber-500",
    ribbonDone: "bg-amber-500/5 text-amber-600 dark:text-[#f3ab3d]/40",
    textColor: "text-amber-500 dark:text-[#f3ab3d]",
  },
  {
    id: 3,
    label: "INVESTIGATION",
    display: "Investigating",
    dotColor: "bg-blue-500",
    ribbonActive: "bg-blue-500 text-white border-l-blue-500",
    ribbonDone: "bg-blue-500/5 text-blue-600 dark:text-blue-400/40",
    textColor: "text-blue-500 dark:text-blue-400",
  },
  {
    id: 4,
    label: "MITIGATED",
    display: "Mitigated",
    dotColor: "bg-orange-500",
    ribbonActive: "bg-orange-500 text-white border-l-orange-500",
    ribbonDone: "bg-orange-500/5 text-orange-600 dark:text-orange-400/40",
    textColor: "text-orange-500 dark:text-orange-400",
  },
  {
    id: 5,
    label: "RESOLVED",
    display: "Resolved",
    dotColor: "bg-emerald-500",
    ribbonActive: "bg-emerald-500 text-white border-l-emerald-500",
    ribbonDone: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400/40",
    textColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    id: 6,
    label: "CLOSED",
    display: "Closed",
    dotColor: "bg-zinc-500",
    ribbonActive: "bg-zinc-600 text-white border-l-zinc-600",
    ribbonDone: "bg-zinc-500/5 text-zinc-600 dark:text-zinc-400/40",
    textColor: "text-zinc-500 dark:text-zinc-400",
  },
];

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
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="rounded-sm border border-zinc-400 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 ">
    <div className="px-4 py-3 items-center border-b border-zinc-400 dark:border-zinc-700/60 flex flex-row gap-3">
      {icon}
      <p className="text-[14px] font-semibold text-black dark:text-zinc-100 ">
        {title}
      </p>
    </div>
    <div className="p-5">{children}</div>
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
          onClick={() => onChange("open-war-room")}
          className={`flex flex-row gap-2 items-center rounded-base border px-4 py-2 text-left transition-color`}
        >
          {value == "open-war-room" ? (
            <MdRadioButtonChecked className="text-IMSCyan" size={16} />
          ) : (
            <MdRadioButtonUnchecked className="text-gray-400" size={16} />
          )}
          <span className="text-[13px]">Open War room</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("not-required")}
          className={`flex flex-row gap-2 items-center rounded-base border px-4 py-2 text-left transition-color`}
        >
          {value == "not-required" ? (
            <MdRadioButtonChecked className="text-IMSCyan" size={16} />
          ) : (
            <MdRadioButtonUnchecked className="text-gray-400" />
          )}
          <span className="text-[13px]">Not required</span>
        </button>
      </div>
    </div>
  );
}

// ── EvidenceSection ───────────────────────────────────────────────
export interface AttachedFile {
  id: string;
  file: File;
  previewUrl?: string; // object URL for images
  status: "uploading" | "uploaded" | "error";
  progress: number; // 0-100, only meaningful while status === "uploading"
  key?: string; // S3 key once uploaded — what gets sent on incident creation
  downloadUrl?: string; // short-lived presigned GET, for "view what was uploaded"
  errorMessage?: string;
}

export function EvidenceSection({
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
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);

  const IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  const isImage = (file: File) => IMAGE_TYPES.includes(file.type);

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

  // When building AttachedFile objects upstream, generate previewUrl for images:
  // previewUrl: isImage(file) ? URL.createObjectURL(file) : undefined
  // And revoke them on removal: if (af.previewUrl) URL.revokeObjectURL(af.previewUrl)

  const formatSize = (b: number) =>
    b < 1024
      ? `${b}B`
      : b < 1024 * 1024
        ? `${(b / 1024).toFixed(1)}KB`
        : `${(b / (1024 * 1024)).toFixed(1)}MB`;

  return (
    <>
      <div className="">
        <p className="text-[12px] text-black dark:text-zinc-500 mb-4">
          Attachments
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
                <div
                  className={`flex items-center gap-3 min-w-0 flex-1 ${isImage(af.file) ? "cursor-pointer" : ""}`}
                  onClick={() => isImage(af.file) && setPreviewFile(af)}
                >
                  {/* Thumbnail for images, icon for everything else */}
                  {isImage(af.file) && af.previewUrl ? (
                    <div className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0">
                      <img
                        src={af.previewUrl}
                        alt={af.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <FileText
                        size={13}
                        className="text-zinc-400 dark:text-zinc-500"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-black dark:text-zinc-200 truncate">
                      {af.file.name}
                    </p>
                    <p className="text-[11px] text-black dark:text-zinc-500">
                      {formatSize(af.file.size)}
                    </p>

                    {af.status === "uploading" && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${af.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 tabular-nums">
                          {af.progress}%
                        </span>
                      </div>
                    )}

                    {af.status === "uploaded" && af.downloadUrl && (
                      <a
                        href={af.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline truncate"
                      >
                        ✓ Uploaded — view file
                      </a>
                    )}

                    {af.status === "error" && (
                      <p className="mt-1 text-[10px] font-medium text-red-500">
                        {af.errorMessage ?? "Upload failed"}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(af.id)}
                  className="p-1.5 rounded-lg text-black hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {previewFile && previewFile.previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewFile.previewUrl}
              alt={previewFile.file.name}
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
              <p className="text-[12px] text-white/90 truncate">
                {previewFile.file.name}
              </p>
              <p className="text-[11px] text-white/60">
                {formatSize(previewFile.file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
// ── Main modal ────────────────────────────────────────────────────

const RaiseIncidentModal = () => {
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
  // Auto-populated SI Number — generated server-side before the incident
  // exists, and sent back as `incidentId` on create so the ticket actually
  // gets created with the ID shown here, not a different one.
  const { data: generatedTicket, isLoading: isGeneratingTicketId } = useQuery({
    queryKey: [querykeys.GET_INCIDENT_ID],
    queryFn: async () => {
      const res = await get(endpoint.incident_ticket.get_incident_id);
      if (!res.success) throw new Error("Failed to generate incident ID");
      return (res.data?.data ?? res.data) as { ticketId: string };
    },
    refetchOnWindowFocus: false,
  });
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  // Uploads start the moment a file is added, not on form submit — each
  // entry tracks its own progress/status so EvidenceSection can render a
  // progress bar, then an "uploaded" link, independently per file.
  const addAndUploadFiles = (incoming: File[]) => {
    const entries: AttachedFile[] = incoming.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      status: "uploading",
      progress: 0,
    }));
    setAttachedFiles((prev) => [...prev, ...entries]);

    entries.forEach((entry) => {
      uploadStagingIncidentAttachment(entry.file, (pct) => {
        setAttachedFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, progress: pct } : f)),
        );
      })
        .then((staged) => {
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? {
                    ...f,
                    status: "uploaded",
                    progress: 100,
                    key: staged.key,
                    downloadUrl: staged.downloadUrl,
                  }
                : f,
            ),
          );
        })
        .catch(() => {
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? {
                    ...f,
                    status: "error",
                    errorMessage: "Upload failed — remove and try again",
                  }
                : f,
            ),
          );
          toast.error(`Failed to upload ${entry.file.name}`);
        });
    });
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.status === "uploaded" && target.key) {
        void deleteStagingIncidentAttachment(target.key);
      }
      return prev.filter((f) => f.id !== id);
    });
  };
  // Add near your other state
  const [customImpact, setCustomImpact] = useState("");
  const [showCustomImpact, setShowCustomImpact] = useState(false);
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
      firstNoticed: "alert-alarm-fired",
      recentChange: "",
      businessImpact: "",
      assignTo: "",
      notifyChannels: "sre-oncall-pagerduty",
      warRoom: "not-required",
      state: "OPEN",
      description:
        "<p><strong>Minimum Required</strong></p><p>1. Can customers access the service?<br>2. Partial outage or complete outage?<br>3. Are all regions affected?<br>4. Are all users affected?<br>5. Which deployment triggered this?<br>6. Rollback available?<br>7. Was deployment successful initially?<br>8. Affected environment?<br>9. Cloud provider?<br>10. Region?<br>11. Network impact?</p>",
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
      const uploaded = attachedFiles.filter(
        (f) => f.status === "uploaded" && f.key,
      );

      const incident = await createIncident({
        incidentId: generatedTicket?.ticketId,
        // MTTR must be a string — the backend's normalizer silently drops
        // non-string values (returns undefined), so a number here means
        // "time worked" never actually gets saved.
        MTTR: String(totalSeconds),
        attachments: uploaded.map((f) => ({
          key: f.key,
          name: f.file.name,
          type: f.file.type || undefined,
          size: f.file.size,
        })),
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
        state: data.state,
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

      return incident;
    },
    onSuccess: async (incident) => {
      await queryClient.invalidateQueries({
        queryKey: [querykeys.INCIDENT_TICKET],
      });
      toast.success(`Incident ${incident.ticketId} created`);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);

    // Clean up the interval on unmount to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col dark:bg-zinc-950 relative">
      {/* Header */}
      <div className="md:sticky top-0 z-20 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-5">
        <div className=" space-y-3">
          <Button
            size="sm"
            variant="outline-dark"
            leftIcon={<ChevronLeft size={16} />}
            onClick={() => router.back()}
          >
            Back
          </Button>
          <h2 className="text-2xl font-bold text-black dark:text-zinc-100">
            Raise Incident
          </h2>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(async (data) => {
          if (attachedFiles.some((f) => f.status === "uploading")) {
            toast.error("Please wait for attachments to finish uploading.");
            return;
          }
          createMutation.mutateAsync(data);
        })}
        className="p-6"
      >
        <div className=" grid md:grid-cols-2 gap-6">
          {/* Core Details */}

          <FormSection
            title="Incident Information"
            icon={<InfoIcon size={17} />}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <Input
                  value={generatedTicket?.ticketId ?? ""}
                  isLoading={isGeneratingTicketId}
                  placeholder={isGeneratingTicketId ? "Generating…" : undefined}
                  readOnly
                  label="SI Number"
                />
                <FormatTimerDisplay totalSeconds={totalSeconds} />
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select
                        {...field}
                        label="Severity"
                        error={errors.severity?.message}
                        options={[
                          { value: "P0", label: "P0 — Critical" },
                          { value: "P1", label: "P1 — High" },
                          { value: "P2", label: "P2 — Medium" },
                          { value: "P3", label: "P3 — Low" },
                        ]}
                      />
                    </div>
                  )}
                />
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Select
                        {...field}
                        label="State"
                        error={errors.state?.message}
                        options={TICKET_STATUS_CONFIG.map((item) => ({
                          value: item.label,
                          label: item.label,
                        }))}
                      />
                    </div>
                  )}
                />
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
                          value: serviceNodes.length > 0 ? "" : "None",
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
            </div>
          </FormSection>

          {/* Context & Detail */}
          <FormSection
            title="Incident Context"
            icon={<FaRegFileLines size={17} />}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                <Controller
                  name="firstNoticed"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="What did you notice first? *"
                      error={errors.firstNoticed?.message}
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
                <div>
                  <Controller
                    name="customerImpact"
                    control={control}
                    render={({ field }) => (
                      <>
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
                            { value: "other", label: "Other" },
                          ]}
                          onChange={(e) => {
                            field.onChange(e);
                            const val = e.target?.value ?? e;
                            if (val === "other") {
                              setShowCustomImpact(true);
                              field.onChange("");
                            } else {
                              setShowCustomImpact(false);
                              setCustomImpact("");
                            }
                          }}
                        />
                        {showCustomImpact && (
                          <Input
                            label="Describe customer impact *"
                            placeholder="Describe the customer impact..."
                            value={customImpact}
                            onChange={(e) => {
                              setCustomImpact(e.target.value);
                              field.onChange(e.target.value);
                            }}
                          />
                        )}
                      </>
                    )}
                  />
                </div>
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

          <FormSection
            title="Incident Details"
            icon={<FaRegFileLines size={17} />}
          >
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
            <br />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="text-[12px] text-black dark:text-zinc-500 mb-2 font-medium">
                    Detailed Description
                  </label>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />

                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              )}
            />
          </FormSection>

          {/* Assignment & Notifications */}
          <FormSection
            title="Assignment & Notifications"
            icon={<User size={17} />}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
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
              <EvidenceSection
                files={attachedFiles}
                onAdd={addAndUploadFiles}
                onRemove={removeFile}
              />
            </div>
          </FormSection>
        </div>

        {/* Preview */}

        {createMutation.isError && (
          <p className="text-[12px] text-red-500">
            Unable to create the incident right now. Please try again.
          </p>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex gap-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4">
          <button
            type="submit"
            disabled={
              createMutation.isPending ||
              attachedFiles.some((f) => f.status === "uploading")
            }
            className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-2 text-[12px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating…" : "Raise Incident"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaiseIncidentModal;
