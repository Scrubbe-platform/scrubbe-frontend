// components/incident/AddContextForm.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Upload,
  Layers,
  Plus,
  Trash2,
  Link2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  ChevronDown,
  Info,
  InfoIcon,
  File,
  User,
  FileText,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import {
  saveIncidentContext,
  uploadIncidentAttachment,
} from "@/lib/incident/incident.api";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";
import { querykeys } from "@/lib/constant";
import P0UpgradePromptModal from "./UpgradePromptModal";
import IncidentRelationship from "./IncidentRelation";
import { FaRegFileLines } from "react-icons/fa6";
import Button from "@/components/ui/Button1";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FormatTimerDisplay from "./FormatTImerDisplay";
import { AttachedFile, EvidenceSection } from "./IncidentForm";

// ── Schema Definitions ─────────────────────────────────────────────

const linkedChildSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  title: z.string(),
  severity: z.string(),
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

export const incidentContextSchema = z.object({
  affectedService: z.string().min(1, "Affected Service is required"),
  environment: z.string().min(1, "Environment is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  state: z.string(),
  priority: z.string(),
  description: z.string().min(1, "Description is required"),
  summary: z.string().min(1, "Summary is required"),
  customerImpact: z.string(),
  externalCommunication: z.string(),
  incidentCommander: z.string(),
  businessImpact: z.string(),
  additionalContext: z.string(),
  labels: z.array(z.string()),
  relatedIncidents: z.string(),
  childIncidents: z.array(linkedChildSchema).optional(),
  runbookOverrideUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  escalateTo: z.string(),
  attachments: z.array(z.any()).optional(),
  title: z.string().min(1, "Title is required"),
});

export type IncidentContextFormValues = z.infer<typeof incidentContextSchema>;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-semibold capitalize tracking-wider text-zinc-600 dark:text-zinc-500 mb-1.5 block">
    {children}
  </label>
);

// ── Main Page Orchestrator ─────────────────────────────────────────

const AddContextForm = ({
  context,
  incident,
  onCancel,
}: {
  context: IncidentContextRecord | null;
  incident: IncidentDetailRecord;
  onCancel?: () => void;
}) => {
  const [tagInput, setTagInput] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showP0Prompt, setShowP0Prompt] = useState(false);

  // Local state helper keys for adding child records seamlessly inline
  const [newChildId, setNewChildId] = useState("");
  const [newChildTitle, setNewChildTitle] = useState("");
  const [newChildSev, setNewChildSev] = useState("P2");

  const prevPriority = useRef(incident?.severity);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const memberOptions = useMemo(
    () => [
      { value: "", label: "Select team member" },
      ...members.map((m) => {
        const fullName =
          `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() || m.email;
        return { value: fullName, label: `${fullName} (${m.email})` };
      }),
    ],
    [members],
  );

  const defaultValues = useMemo<IncidentContextFormValues>(
    () => ({
      affectedService: incident.service ?? incident.affectedSystem ?? "",
      environment: incident.environment ?? "",
      assignedTo: incident.assignedToName ?? incident.assignedToEmail ?? "",
      priority: incident.severity ?? incident.priority ?? "P1",
      state: incident?.state,
      description: incident.description || "",
      title: incident.title || "",
      summary: incident.summary,
      labels: context?.labels ?? [],
      businessImpact:
        context?.businessImpact ?? incident.financialExposure ?? "",
      customerImpact: context?.customerImpact ?? "",
      externalCommunication: context?.externalCommunication ?? "",
      incidentCommander:
        context?.incidentCommander ?? incident.incidentCommander ?? "",
      additionalContext: context?.additionalContext ?? "",
      relatedIncidents: (context?.relatedIncidents ?? []).join(", "),
      childIncidents: context?.childIncidents ?? [],
      runbookOverrideUrl: context?.runbookOverrideUrl ?? "",
      escalateTo: context?.escalateTo ?? "",
      attachments: [],
    }),
    [context, incident],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IncidentContextFormValues>({
    resolver: zodResolver(incidentContextSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const currentTags = watch("labels") ?? [];
  const childIncidents = watch("childIncidents") ?? [];
  const attachments = watch("attachments") ?? [];

  const saveMutation = useMutation({
    mutationFn: async (data: IncidentContextFormValues) => {
      const filesToUpload = (
        Array.isArray(data.attachments) ? data.attachments : []
      ).filter((f): f is File => f instanceof File);

      const uploadResults = await Promise.allSettled(
        filesToUpload.map((file) =>
          uploadIncidentAttachment(incident.id, file),
        ),
      );

      const failedUploads = uploadResults.filter(
        (r) => r.status === "rejected",
      ).length;
      if (failedUploads > 0) {
        throw new Error(
          `${failedUploads} of ${filesToUpload.length} attachment(s) failed to upload.`,
        );
      }

      const attachmentMetadata = uploadResults
        .filter(
          (
            r,
          ): r is PromiseFulfilledResult<
            Awaited<ReturnType<typeof uploadIncidentAttachment>>
          > => r.status === "fulfilled",
        )
        .map((r) => ({ name: r.value.name, type: r.value.type }));

      return saveIncidentContext(incident.id, {
        affectedService: data.affectedService,
        environment: data.environment,
        assignedTo: data.assignedTo,
        priority: data.priority,
        state: data.state,
        description: data.description,
        title: data.title,
        summary: data.summary,
        customerImpact: data.customerImpact,
        externalCommunication: data.externalCommunication,
        incidentCommander: data.incidentCommander,
        businessImpact: data.businessImpact,
        additionalContext: data.additionalContext,
        labels: data.labels,
        relatedIncidents: data.relatedIncidents
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        childIncidents: data.childIncidents ?? [],
        runbookOverrideUrl: data.runbookOverrideUrl,
        escalateTo: data.escalateTo,
        attachments: attachmentMetadata,
      });
    },
    onSuccess: async () => {
      const newPriority = watch("priority");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["INCIDENT_CONTEXT", incident.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [querykeys.HISTORY, incident.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [querykeys.INCIDENT_DETAIL, incident.id],
        }),
      ]);
      if (newPriority === "P0" && prevPriority.current !== "P0") {
        setShowP0Prompt(true);
      } else {
        onCancel?.();
      }
    },
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim())) {
        setValue("labels", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  // ── Child State Array Modifiers ──────────────────────────────────
  const handleAddChildIncident = () => {
    if (!newChildId.trim() || !newChildTitle.trim()) return;
    const newChild = {
      id: Date.now().toString(),
      ticketId: newChildId.trim(),
      title: newChildTitle.trim(),
      severity: newChildSev,
    };
    setValue("childIncidents", [...childIncidents, newChild]);
    setNewChildId("");
    setNewChildTitle("");
  };

  const handleRemoveChildIncident = (id: string) => {
    setValue(
      "childIncidents",
      childIncidents.filter((c) => c.id !== id),
    );
  };

  const IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  const isImage = (file: File) => IMAGE_TYPES.includes(file.type);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const formatSize = (b: number) =>
    b < 1024
      ? `${b}B`
      : b < 1024 * 1024
        ? `${(b / 1024).toFixed(1)}KB`
        : `${(b / (1024 * 1024)).toFixed(1)}MB`;

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(async (data) => {
          setSaveNotice("");
          await saveMutation.mutateAsync(data);
        })}
        className=" w-full overflow-hidden"
      >
        {/* ── Context Headline Header ── */}

        <div className="p-6 space-y-6">
          {/* ── ROW 1: CORE FIELDS SPLIT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PANEL A: INCIDENT INFORMATION */}
            <div className="border border-black dark:border-zinc-800 rounded-xl p-5 space-y-4 bg-white dark:bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-50 dark:border-zinc-900">
                <InfoIcon size={17} /> Incident Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <SectionLabel>SI Number</SectionLabel>
                  <input
                    type="text"
                    readOnly
                    value={incident.id.slice(0, 12).toUpperCase()}
                    className="h-9 w-full rounded-md border border-zinc-400 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 px-3 text-sm font-mono  outline-none"
                  />
                </div>
                <FormatTimerDisplay totalSeconds={incident?.MTTR} />
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <SectionLabel>Severity</SectionLabel>
                      <Select
                        {...field}
                        error={errors.priority?.message}
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
                  name="affectedService"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <SectionLabel>Affected Service</SectionLabel>
                      <Input
                        {...field}
                        placeholder="e.g. Checkout-service"
                        error={errors.affectedService?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="environment"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <SectionLabel>Environment</SectionLabel>
                      <Input
                        {...field}
                        placeholder="e.g. Production"
                        error={errors.environment?.message}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* PANEL B: INCIDENT CONTEXT */}
            <div className="border border-black dark:border-zinc-800 rounded-xl p-5 space-y-4 bg-white dark:bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-50 dark:border-zinc-900">
                <FaRegFileLines size={17} /> Incident Context
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="customerImpact"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <SectionLabel>Customer Impact</SectionLabel>
                      <Select
                        {...field}
                        error={errors.customerImpact?.message}
                        options={[
                          { value: "", label: "Select impact" },
                          {
                            value: "No customer impact",
                            label: "No customer impact",
                          },
                          {
                            value: "Partial degradation - Checkout affected",
                            label: "Partial degradation",
                          },
                          {
                            value: "Full service outage",
                            label: "Full service outage",
                          },
                          {
                            value: "Data integrity risk",
                            label: "Data integrity risk",
                          },
                        ]}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="businessImpact"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <SectionLabel>Business impact ( £/min )</SectionLabel>
                      <Input
                        {...field}
                        placeholder="e.g. 1800"
                        error={errors.businessImpact?.message}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="externalCommunication"
                  control={control}
                  render={({ field }) => (
                    <div className="col-span-2">
                      <SectionLabel>External Communication</SectionLabel>
                      <Select
                        {...field}
                        error={errors.externalCommunication?.message}
                        options={[
                          { value: "", label: "Not required" },
                          {
                            value: "Status page update pending",
                            label: "Status page update pending",
                          },
                          {
                            value: "Status page updated",
                            label: "Status page updated",
                          },
                          {
                            value: "Customer email sent",
                            label: "Customer email sent",
                          },
                        ]}
                      />
                    </div>
                  )}
                />
              </div>
              <IncidentRelationship
                incident={incident}
                value={childIncidents}
                onChange={(children) => setValue("childIncidents", children)}
              />
            </div>
          </div>

          {/* ── ROW 2: DETAILS TEXT EDITOR CANVAS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PANEL C: DETAILED DESCRIPTION CANVAS WITH FORMATTING TOOLBAR */}
            <div className=" border border-black dark:border-zinc-800 rounded-xl p-5 space-y-4 bg-white dark:bg-zinc-950">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-50 dark:border-zinc-900">
                <FaRegFileLines size={17} /> Incident Details
              </h3>

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <div>
                    <SectionLabel>
                      Short Description <span className="text-red-500">*</span>
                    </SectionLabel>

                    {/* REPLACED: Passing RHF fields directly into the managed rich text editor instance */}

                    <TextArea
                      {...field}
                      rows={3}
                      placeholder="Add transient details or handoff items..."
                      error={errors.title?.message}
                    />
                  </div>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <SectionLabel>Detailed Description</SectionLabel>

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
            </div>

            {/* PANEL D: ROUTING & ATTACHMENTS ASSIGNMENT */}
            <div className=" border border-black dark:border-zinc-800 rounded-xl p-5 space-y-4 bg-white dark:bg-zinc-950 flex flex-col">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-50 dark:border-zinc-900">
                  <User size={17} />
                  Assignment &amp; Routing
                </h3>

                <Controller
                  name="assignedTo"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <SectionLabel>Assigned Engineer Operator</SectionLabel>
                      <Select
                        {...field}
                        options={memberOptions}
                        error={errors.assignedTo?.message}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Upload Dropzone Workspace Block */}

              <div className="pt-2">
                <SectionLabel>Evidence &amp; Media Attachments</SectionLabel>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    setValue("attachments", [
                      ...attachments,
                      ...Array.from(e.dataTransfer.files),
                    ]);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-500/5"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <Upload size={18} className="text-zinc-400 mb-2" />
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Drop snapshots or{" "}
                    <span className="text-IMSLightGreen underline">
                      browse disk files
                    </span>
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.log,.txt,.json,.yaml,.yml"
                  className="hidden"
                  onChange={(e) =>
                    setValue("attachments", [
                      ...attachments,
                      ...Array.from(e.target.files ?? []),
                    ])
                  }
                />
              </div>
              {attachments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments?.map((af: File) => (
                    <div
                      key={af.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3"
                    >
                      <div
                        className={`flex items-center gap-3 min-w-0 ${isImage(af) ? "cursor-pointer" : ""}`}
                        onClick={() => isImage(af) && setPreviewFile(af)}
                      >
                        {/* Thumbnail for images, icon for everything else */}
                        {isImage(af) && URL.createObjectURL(af) ? (
                          <div className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0">
                            <img
                              src={URL.createObjectURL(af)}
                              alt={af.name}
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
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-black dark:text-zinc-200 truncate">
                            {af.name}
                          </p>
                          <p className="text-[11px] text-black dark:text-zinc-500">
                            {formatSize(af.size)}
                          </p>
                        </div>
                      </div>
                      {/* <button
                  type="button"
                  onClick={() => onRemove(af.name)}
                  className="p-1.5 rounded-lg text-black hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 size={13} />
                </button> */}
                      {previewFile && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                          onClick={() => setPreviewFile(null)}
                        >
                          <div
                            className="relative max-w-[90vw] max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={URL.createObjectURL(af)}
                              alt={previewFile?.name}
                              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
                            />
                            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                              <p className="text-[12px] text-white/90 truncate">
                                {previewFile?.name}
                              </p>
                              <p className="text-[11px] text-white/60">
                                {formatSize(previewFile?.size)}
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {saveMutation.isError && (
          <p className="px-6 pb-3 text-xs font-semibold text-red-500 bg-red-50/50 p-3 mx-6 rounded-lg border border-red-100">
            System Alert: Unable to commit deployment transaction changes right
            now. Ensure connection criteria remain valid.
          </p>
        )}

        {/* ── Core Execution Toolbar Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
          <Button size="sm" disabled={isSubmitting || saveMutation.isPending}>
            {saveMutation.isPending ? "Saving changes…" : "Update Incident"}
          </Button>
        </div>
      </form>

      {showP0Prompt && (
        <P0UpgradePromptModal
          incident={incident}
          onClose={() => setShowP0Prompt(false)}
          onGoToWorkbench={() => {
            setShowP0Prompt(false);
            router.push(`/incident/workbench/${incident.id}`);
          }}
        />
      )}
    </div>
  );
};

export default AddContextForm;
