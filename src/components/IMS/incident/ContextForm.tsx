"use client";
import { z } from "zod";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import { saveIncidentContext } from "@/lib/incident/incident.api";
import { IncidentContextRecord, IncidentDetailRecord } from "@/lib/incident/incident.types";
import { querykeys } from "@/lib/constant";

export const incidentContextSchema = z.object({
  customerImpact:        z.string(),
  externalCommunication: z.string(),
  incidentCommander:     z.string(),
  businessImpact:        z.string(),
  additionalContext:     z.string(),
  labels:                z.array(z.string()),
  relatedIncidents:      z.string(),
  runbookOverrideUrl:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
  escalateTo:            z.string(),
  attachments:           z.array(z.any()).optional(),
});

export type IncidentContextFormValues = z.infer<typeof incidentContextSchema>;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 mb-2 block">
    {children}
  </label>
);

const AddContextForm = ({
  context,
  incident,
}: {
  context: IncidentContextRecord | null;
  incident: IncidentDetailRecord;
}) => {
  const [tagInput, setTagInput] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();

  const memberOptions = useMemo(() => [
    { value: "", label: "Select team member" },
    ...members.map((member) => {
      const fullName = `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() || member.email;
      return { value: fullName, label: `${fullName} (${member.email})` };
    }),
  ], [members]);

  const defaultValues = useMemo<IncidentContextFormValues>(() => ({
    labels:                context?.labels                ?? [],
    businessImpact:        context?.businessImpact        ?? incident.financialExposure ?? "",
    customerImpact:        context?.customerImpact        ?? "",
    externalCommunication: context?.externalCommunication ?? "",
    incidentCommander:     context?.incidentCommander     ?? incident.incidentCommander  ?? "",
    additionalContext:     context?.additionalContext      ?? "",
    relatedIncidents:      (context?.relatedIncidents     ?? []).join(", "),
    runbookOverrideUrl:    context?.runbookOverrideUrl    ?? "",
    escalateTo:            context?.escalateTo            ?? "",
    attachments:           [],
  }), [context, incident.financialExposure, incident.incidentCommander]);

  const { control, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } =
    useForm<IncidentContextFormValues>({ resolver: zodResolver(incidentContextSchema), defaultValues });

  useEffect(() => { reset(defaultValues); }, [defaultValues, reset]);

  const currentTags = watch("labels");

  const saveMutation = useMutation({
    mutationFn: async (data: IncidentContextFormValues) => {
      const attachmentMetadata = Array.isArray(data.attachments)
        ? data.attachments.map((f) => ({ name: f?.name, type: f?.type }))
        : [];
      return saveIncidentContext(incident.id, {
        customerImpact:        data.customerImpact,
        externalCommunication: data.externalCommunication,
        incidentCommander:     data.incidentCommander,
        businessImpact:        data.businessImpact,
        additionalContext:     data.additionalContext,
        labels:                data.labels,
        relatedIncidents:      data.relatedIncidents.split(",").map((v) => v.trim()).filter(Boolean),
        runbookOverrideUrl:    data.runbookOverrideUrl,
        escalateTo:            data.escalateTo,
        attachments:           attachmentMetadata,
      });
    },
    onSuccess: async () => {
      setSaveNotice("Incident context saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["INCIDENT_CONTEXT", incident.id] }),
        queryClient.invalidateQueries({ queryKey: [querykeys.HISTORY, incident.id] }),
        queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_DETAIL, incident.id] }),
      ]);
    },
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim())) setValue("labels", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit(async (data) => { setSaveNotice(""); await saveMutation.mutateAsync(data); })}
        className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-[15px] font-semibold text-black dark:text-zinc-100">
            Add Context · Enrich signals
          </h2>
          {saveNotice && (
            <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">{saveNotice}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Controller name="customerImpact" control={control} render={({ field }) => (
            <Select {...field} label="Customer Impact" error={errors.customerImpact?.message} options={[
              { value: "", label: "Select impact" },
              { value: "No customer impact", label: "No customer impact" },
              { value: "Partial degradation - checkout affected", label: "Partial degradation - checkout affected" },
              { value: "Full service outage", label: "Full service outage" },
              { value: "Data integrity risk", label: "Data integrity risk" },
            ]} />
          )} />

          <Controller name="externalCommunication" control={control} render={({ field }) => (
            <Select {...field} label="External Communication" error={errors.externalCommunication?.message} options={[
              { value: "", label: "Select communication status" },
              { value: "Not required", label: "Not required" },
              { value: "Status page update pending", label: "Status page update pending" },
              { value: "Status page updated", label: "Status page updated" },
              { value: "Customer email sent", label: "Customer email sent" },
            ]} />
          )} />

          <Controller name="incidentCommander" control={control} render={({ field }) => (
            <Select {...field} label="Incident Commander" error={errors.incidentCommander?.message} options={memberOptions} />
          )} />

          <Controller name="businessImpact" control={control} render={({ field }) => (
            <Input {...field} label="Business impact" placeholder="$ / min" error={errors.businessImpact?.message} />
          )} />

          <div className="col-span-2">
            <Controller name="additionalContext" control={control} render={({ field }) => (
              <TextArea {...field} label="Additional Context" rows={3} error={errors.additionalContext?.message} />
            )} />
          </div>

          {/* Tags */}
          <div className="col-span-2">
            <SectionLabel>Labels / Tags</SectionLabel>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-500 dark:border-zinc-700 rounded-lg focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
              {currentTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-500 dark:border-zinc-700 rounded text-[12px] text-zinc-600 dark:text-zinc-300">
                  {tag}
                  <X size={12} className="cursor-pointer text-black hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" onClick={() => setValue("labels", currentTags.filter((t) => t !== tag))} />
                </span>
              ))}
              <input
                className="bg-transparent border-none outline-none text-[12px] text-black dark:text-zinc-300 placeholder:text-zinc-400 p-1 flex-1 min-w-[140px]"
                placeholder="Add tag + enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            {errors.labels && <p className="text-red-500 text-[11px] mt-1">{errors.labels.message}</p>}
          </div>

          <div className="col-span-2">
            <Controller name="relatedIncidents" control={control} render={({ field }) => (
              <Input {...field} label="Related Incidents" placeholder="SI-0002310, SI-0001870" />
            )} />
          </div>

          <Controller name="runbookOverrideUrl" control={control} render={({ field }) => (
            <Input {...field} label="Runbook Override URL" error={errors.runbookOverrideUrl?.message} />
          )} />

          <Controller name="escalateTo" control={control} render={({ field }) => (
            <Select {...field} label="Escalate to" error={errors.escalateTo?.message} options={memberOptions} />
          )} />

          {/* Attachments */}
          <div className="col-span-2">
            <SectionLabel>Evidence & Attachments</SectionLabel>
            <Controller name="attachments" control={control} render={({ field }) => (
              <div className="space-y-1.5">
                <input
                  type="file"
                  multiple
                  onChange={(e) => field.onChange(Array.from(e.target.files ?? []))}
                  className="w-full rounded-lg border border-zinc-500 dark:border-zinc-700 bg-transparent px-3 py-2 text-[12px] text-zinc-600 dark:text-zinc-300"
                />
                <p className="text-[11px] text-black dark:text-zinc-500">
                  Attachment metadata is saved in this incident slice.
                </p>
              </div>
            )} />
          </div>
        </div>

        {saveMutation.isError && (
          <p className="mt-4 text-[12px] text-red-500">Unable to save incident context right now.</p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isPending}
            className="px-5 py-2 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-zinc-900 dark:bg-white text-white dark:text-black text-[12px] font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving…" : "Save Context"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContextForm;