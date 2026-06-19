"use client";
import { z } from "zod";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import { saveIncidentContext, uploadIncidentAttachment } from "@/lib/incident/incident.api";
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";
import { querykeys } from "@/lib/constant";
import MajorIncidentWorkbench from "../Workbench/MajorIncidentWorkbench";
import P0UpgradePromptModal from "./UpgradePromptModal";
import IncidentRelationship from "./IncidentRelation";

// ── Schema ────────────────────────────────────────────────────────

const linkedChildSchema = z.object({
  id: z.string(),
  ticketId: z.string(),
  title: z.string(),
  severity: z.string(),
});

export const incidentContextSchema = z.object({
  affectedService: z.string(),
  environment: z.string(),
  assignedTo: z.string(),
  priority: z.string(),
  description: z.string(),
  customerImpact: z.string(),
  externalCommunication: z.string(),
  incidentCommander: z.string(),
  businessImpact: z.string(),
  additionalContext: z.string(),
  labels: z.array(z.string()),
  relatedIncidents: z.string(),
  childIncidents: z.array(linkedChildSchema).optional(), // ← new
  runbookOverrideUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  escalateTo: z.string(),
  attachments: z.array(z.any()).optional(),
});

export type IncidentContextFormValues = z.infer<typeof incidentContextSchema>;

// ── Shared tokens ─────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-1.5 block">
    {children}
  </label>
);

// ── Component ─────────────────────────────────────────────────────

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
  const [showWorkbench, setShowWorkbench] = useState(false);
  const prevPriority = useRef(incident.severity);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();

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
      description: incident.description ?? incident.summary ?? "",
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
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<IncidentContextFormValues>({
    resolver: zodResolver(incidentContextSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const currentTags = watch("labels");
  const childIncidents = watch("childIncidents") ?? [];
  const attachments = watch("attachments") ?? [];

  const saveMutation = useMutation({
    mutationFn: async (data: IncidentContextFormValues) => {
      const filesToUpload = (Array.isArray(data.attachments) ? data.attachments : []).filter(
        (f): f is File => f instanceof File
      );

      const uploadResults = await Promise.allSettled(
        filesToUpload.map((file) => uploadIncidentAttachment(incident.id, file))
      );
      const failedUploads = uploadResults.filter((r) => r.status === "rejected").length;
      if (failedUploads > 0) {
        throw new Error(`${failedUploads} of ${filesToUpload.length} attachment(s) failed to upload.`);
      }
      const attachmentMetadata = uploadResults
        .filter(
          (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof uploadIncidentAttachment>>> =>
            r.status === "fulfilled"
        )
        .map((r) => ({ name: r.value.name, type: r.value.type }));

      return saveIncidentContext(incident.id, {
        affectedService: data.affectedService,
        environment: data.environment,
        assignedTo: data.assignedTo,
        priority: data.priority,
        description: data.description,
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
        childIncidents: data.childIncidents ?? [], // ← new
        runbookOverrideUrl: data.runbookOverrideUrl,
        escalateTo: data.escalateTo,
        attachments: attachmentMetadata,
      });
    },
    onSuccess: async (_data, _vars, ctx) => {
      const newPriority = watch("priority");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["INCIDENT_CONTEXT", incident.id] }),
        queryClient.invalidateQueries({ queryKey: [querykeys.HISTORY, incident.id] }),
        queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_DETAIL, incident.id] }),
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
      if (!currentTags.includes(tagInput.trim()))
        setValue("labels", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(async (data) => {
          setSaveNotice("");
          await saveMutation.mutateAsync(data);
        })}
        className="bg-white dark:bg-zinc-900/40 w-full"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-[16px] font-bold text-zinc-900 dark:text-zinc-100">
            Add Context
          </h2>
          {saveNotice && (
            <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              {saveNotice}
            </p>
          )}
        </div>

        <div className="px-6 py-6 grid grid-cols-2 gap-x-5 gap-y-5">
          {/* Affected Service + Environment */}
          <Controller
            name="affectedService"
            control={control}
            render={({ field }) => (
              <div>
                <SectionLabel>Affected Service</SectionLabel>
                <Input
                  {...field}
                  placeholder="Partial degradation - Checkout affected"
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
                  placeholder="Not required"
                  error={errors.environment?.message}
                />
              </div>
            )}
          />

          {/* Assigned to + Priority */}
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <div>
                <SectionLabel>Assigned to</SectionLabel>
                <Select
                  {...field}
                  options={memberOptions}
                  error={errors.assignedTo?.message}
                />
              </div>
            )}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <div>
                <SectionLabel>Priority</SectionLabel>
                <Select
                  {...field}
                  error={errors.priority?.message}
                  options={[
                    { value: "P0", label: "P0" },
                    { value: "P1", label: "P1" },
                    { value: "P2", label: "P2" },
                    { value: "P3", label: "P3" },
                    { value: "P4", label: "P4" },
                  ]}
                />
              </div>
            )}
          />

          {/* Description */}
          <div className="col-span-2">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <SectionLabel>Description</SectionLabel>
                  <TextArea
                    {...field}
                    rows={4}
                    placeholder="Deploy #311 coincided with a marketing campaign launch…"
                    error={errors.description?.message}
                  />
                </div>
              )}
            />
          </div>

          {/* Customer Impact + External Communication */}
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
                      label: "Partial degradation - Checkout affected",
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
            name="externalCommunication"
            control={control}
            render={({ field }) => (
              <div>
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

          {/* Incident Commander + Business Impact */}
          <Controller
            name="incidentCommander"
            control={control}
            render={({ field }) => (
              <div>
                <SectionLabel>Incident Commander</SectionLabel>
                <Select
                  {...field}
                  options={memberOptions}
                  error={errors.incidentCommander?.message}
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
                  placeholder="1800"
                  error={errors.businessImpact?.message}
                />
              </div>
            )}
          />

          {/* Additional Context */}
          <div className="col-span-2">
            <Controller
              name="additionalContext"
              control={control}
              render={({ field }) => (
                <div>
                  <SectionLabel>Additional Context</SectionLabel>
                  <TextArea
                    {...field}
                    rows={4}
                    error={errors.additionalContext?.message}
                  />
                </div>
              )}
            />
          </div>

          {/* Labels / Tags */}
          <div className="col-span-2">
            <SectionLabel>Labels / Tags</SectionLabel>
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors min-h-[46px]">
              {currentTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[12px] font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {tag}
                  <X
                    size={11}
                    className="cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition-colors"
                    onClick={() =>
                      setValue(
                        "labels",
                        currentTags.filter((t) => t !== tag),
                      )
                    }
                  />
                </span>
              ))}
              <input
                className="bg-transparent outline-none text-[13px] text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 p-1 flex-1 min-w-[140px]"
                placeholder="Add tag + enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            {errors.labels && (
              <p className="text-red-500 text-[11px] mt-1">
                {errors.labels.message}
              </p>
            )}
          </div>

          {/* Runbook Override URL + Escalate to */}
          <Controller
            name="runbookOverrideUrl"
            control={control}
            render={({ field }) => (
              <div>
                <SectionLabel>Runbook Override URL</SectionLabel>
                <Input
                  {...field}
                  placeholder=""
                  error={errors.runbookOverrideUrl?.message}
                />
              </div>
            )}
          />

          <Controller
            name="escalateTo"
            control={control}
            render={({ field }) => (
              <div>
                <SectionLabel>Escalate to</SectionLabel>
                <Select
                  {...field}
                  error={errors.escalateTo?.message}
                  options={[
                    { value: "", label: "Select" },
                    {
                      value: "Service Owner + Change Manager",
                      label: "Service Owner + Change Manager",
                    },
                    {
                      value: "Engineering Manager",
                      label: "Engineering Manager",
                    },
                    { value: "CTO", label: "CTO" },
                    { value: "On-call Lead", label: "On-call Lead" },
                  ]}
                />
              </div>
            )}
          />

          {/* ── Incident Relationship — full width ── */}
          <div className="col-span-2">
            <IncidentRelationship
              incident={incident}
              value={childIncidents}
              onChange={(children) => setValue("childIncidents", children)}
            />
          </div>

          {/* Evidence & Attachments */}
          <div className="col-span-2">
            <SectionLabel>Evidence &amp; Attachments</SectionLabel>
            <Controller
              name="attachments"
              control={control}
              render={({ field }) => (
                <div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      field.onChange([
                        ...(field.value ?? []),
                        ...Array.from(e.dataTransfer.files),
                      ]);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed px-6 py-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragOver
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/5"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <Upload
                      size={22}
                      className="text-zinc-400 dark:text-zinc-500 mb-3"
                    />
                    <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Attach Screenshots , Logs , Dashboards
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      PNG , JPG , PDF , .Log , .txt , .json , .yaml · max 25MB
                      per file
                    </p>
                    {(field.value ?? []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 justify-center">
                        {(field.value as File[]).map((f, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg px-2 py-1"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf,.log,.txt,.json,.yaml,.yml"
                    className="hidden"
                    onChange={(e) =>
                      field.onChange([
                        ...(field.value ?? []),
                        ...Array.from(e.target.files ?? []),
                      ])
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>

        {saveMutation.isError && (
          <p className="px-6 pb-2 text-[12px] text-red-500">
            Unable to save incident context right now.
          </p>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-3 px-6 py-5 border-t border-zinc-100 dark:border-zinc-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-7 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              handleSubmit(async (data) => {
                setSaveNotice("");
                await saveMutation.mutateAsync(data);
                setSaveNotice("Saved as draft.");
              })()
            }
            disabled={isSubmitting || saveMutation.isPending}
            className="px-7 py-2.5 rounded-xl border border-emerald-500 dark:border-emerald-600 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isPending}
            className="px-7 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving…" : "Save and update incident"}
          </button>
        </div>
      </form>

      {showP0Prompt && !showWorkbench && (
        <P0UpgradePromptModal
          incident={incident}
          onClose={() => setShowP0Prompt(false)}
          onGoToWorkbench={() => {
            setShowP0Prompt(false);
            setShowWorkbench(true);
          }}
        />
      )}

      {/* {showWorkbench && (
        <MajorIncidentWorkbench
          incident={incident}
          onClose={() => setShowWorkbench(false)}
          onDeclared={() => {
            setShowWorkbench(false);
            queryClient.invalidateQueries({
              queryKey: [querykeys.INCIDENT_DETAIL, incident.id],
            });
          }}
        />
      )} */}
    </div>
  );
};

export default AddContextForm;
