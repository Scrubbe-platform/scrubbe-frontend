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
import {
  IncidentContextRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";
import { querykeys } from "@/lib/constant";

export const incidentContextSchema = z.object({
  customerImpact: z.string(),
  externalCommunication: z.string(),
  incidentCommander: z.string(),
  businessImpact: z.string(),
  additionalContext: z.string(),
  labels: z.array(z.string()),
  relatedIncidents: z.string(),
  runbookOverrideUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  escalateTo: z.string(),
  attachments: z.array(z.any()).optional(),
});

export type IncidentContextFormValues = z.infer<typeof incidentContextSchema>;

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

  const memberOptions = useMemo(
    () => [
      { value: "", label: "Select team member" },
      ...members.map((member) => {
        const fullName =
          `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() ||
          member.email;
        return {
          value: fullName,
          label: `${fullName} (${member.email})`,
        };
      }),
    ],
    [members]
  );

  const defaultValues = useMemo<IncidentContextFormValues>(
    () => ({
      labels: context?.labels ?? [],
      businessImpact:
        context?.businessImpact ?? incident.financialExposure ?? "",
      customerImpact: context?.customerImpact ?? "",
      externalCommunication: context?.externalCommunication ?? "",
      incidentCommander:
        context?.incidentCommander ?? incident.incidentCommander ?? "",
      additionalContext: context?.additionalContext ?? "",
      relatedIncidents: (context?.relatedIncidents ?? []).join(", "),
      runbookOverrideUrl: context?.runbookOverrideUrl ?? "",
      escalateTo: context?.escalateTo ?? "",
      attachments: [],
    }),
    [context, incident.financialExposure, incident.incidentCommander]
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

  const currentTags = watch("labels");

  const saveMutation = useMutation({
    mutationFn: async (data: IncidentContextFormValues) => {
      const attachmentMetadata = Array.isArray(data.attachments)
        ? data.attachments.map((file) => ({
            name: file?.name,
            type: file?.type,
          }))
        : [];

      return saveIncidentContext(incident.id, {
        customerImpact: data.customerImpact,
        externalCommunication: data.externalCommunication,
        incidentCommander: data.incidentCommander,
        businessImpact: data.businessImpact,
        additionalContext: data.additionalContext,
        labels: data.labels,
        relatedIncidents: data.relatedIncidents
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        runbookOverrideUrl: data.runbookOverrideUrl,
        escalateTo: data.escalateTo,
        attachments: attachmentMetadata,
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
      if (!currentTags.includes(tagInput.trim())) {
        setValue("labels", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "labels",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: IncidentContextFormValues) => {
    setSaveNotice("");
    await saveMutation.mutateAsync(data);
  };

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 rounded-xl text-slate-300 border border-white/5"
      >
        <div className="flex items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-semibold text-white/90">
            Add Context - Enrich signals
          </h2>
          {saveNotice ? (
            <p className="text-xs font-medium text-green-400">{saveNotice}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <Controller
            name="customerImpact"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "", label: "Select impact" },
                  { value: "No customer impact", label: "No customer impact" },
                  {
                    value: "Partial degradation - checkout affected",
                    label: "Partial degradation - checkout affected",
                  },
                  { value: "Full service outage", label: "Full service outage" },
                  { value: "Data integrity risk", label: "Data integrity risk" },
                ]}
                {...field}
                label="Customer Impact"
                error={errors.customerImpact?.message}
              />
            )}
          />

          <Controller
            name="externalCommunication"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "", label: "Select communication status" },
                  { value: "Not required", label: "Not required" },
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
                {...field}
                label="External Communication"
                error={errors.externalCommunication?.message}
              />
            )}
          />

          <Controller
            name="incidentCommander"
            control={control}
            render={({ field }) => (
              <Select
                options={memberOptions}
                {...field}
                label="Incident Commander"
                error={errors.incidentCommander?.message}
              />
            )}
          />

          <Controller
            name="businessImpact"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Business impact"
                placeholder="$ / min"
                error={errors.businessImpact?.message}
              />
            )}
          />

          <div className="col-span-2">
            <Controller
              name="additionalContext"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Additional Context"
                  rows={3}
                  error={errors.additionalContext?.message}
                />
              )}
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Labels / Tags
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-[#0a0f1d] border border-white/10 rounded-lg focus-within:border-green-500/50 transition-all">
              {currentTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-slate-300"
                >
                  {tag}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-400"
                    onClick={() => removeTag(tag)}
                  />
                </span>
              ))}
              <input
                className="bg-transparent border-none outline-none text-sm p-1 flex-1 min-w-[150px]"
                placeholder="Add tag + enter"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            {errors.labels && (
              <p className="text-red-500 text-xs mt-1">{errors.labels.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <Controller
              name="relatedIncidents"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Related Incidents"
                  placeholder="SI-0002310, SI-0001870"
                />
              )}
            />
          </div>

          <Controller
            name="runbookOverrideUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Runbook Override URL"
                error={errors.runbookOverrideUrl?.message}
              />
            )}
          />

          <Controller
            name="escalateTo"
            control={control}
            render={({ field }) => (
              <Select
                options={memberOptions}
                {...field}
                label="Escalate to"
                error={errors.escalateTo?.message}
              />
            )}
          />

          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Evidence & Attachments
            </label>
            <Controller
              name="attachments"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    onChange={(event) =>
                      field.onChange(Array.from(event.target.files ?? []))
                    }
                    className="w-full rounded-md border border-gray-400 bg-transparent px-3 py-2 text-sm text-white"
                  />
                  <p className="text-xs text-slate-500">
                    Attachment metadata is saved in this incident slice. Upload
                    storage can be layered on later without breaking the form.
                  </p>
                </div>
              )}
            />
          </div>
        </div>

        {saveMutation.isError ? (
          <p className="mt-4 text-sm text-red-400">
            Unable to save incident context right now.
          </p>
        ) : null}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || saveMutation.isPending}
            className="px-5 py-2.5 rounded-lg border border-green-500/50 text-green-400 font-bold hover:bg-green-500/5 transition-all disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : "Save Context"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContextForm;
