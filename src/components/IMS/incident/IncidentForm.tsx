"use client";

import React, { useMemo } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Info, X } from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import useMember from "@/hooks/useMember";
import { querykeys } from "@/lib/constant";
import { createIncident } from "@/lib/incident/incident.api";

export const raiseIncidentSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  service: z
    .string()
    .min(1, "Please select an affected service")
    .refine((value) => value !== "select-service", "Please select a valid service"),
  environment: z.string().min(1, "Environment is required"),
  severity: z.enum(["P0", "P1", "P2", "P3", "P4"]),
  description: z.string().min(20, "Please provide a more detailed description"),
  firstNoticed: z.string().min(1, "Selection required"),
  recentChange: z.string().optional(),
  customerImpact: z.string().min(1, "Impact status required"),
  businessImpact: z.string().optional(),
  assignTo: z.string().min(1, "Please assign a lead"),
  notifyChannels: z.string().min(1, "Select at least one channel"),
});

type RaiseIncidentFormValues = z.infer<typeof raiseIncidentSchema>;

const severityToPriority: Record<RaiseIncidentFormValues["severity"], string> = {
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

const FormSection = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
    {children}
  </div>
);

const buildImpactSummary = (data: RaiseIncidentFormValues) => {
  const parts = [
    customerImpactLabels[data.customerImpact] ?? data.customerImpact,
    data.businessImpact ? `Business impact: ${data.businessImpact}` : "",
    data.recentChange ? `Recent change: ${data.recentChange}` : "",
  ].filter(Boolean);

  return parts.join(". ");
};

const RaiseIncidentModal = ({ onClose }: { onClose?: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();

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
    },
  });

  const assigneeOptions = useMemo(
    () => [
      { value: "", label: "Select incident owner..." },
      ...members.map((member) => {
        const fullName =
          `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() || member.email;
        return {
          value: member.email,
          label: `${fullName} (${member.email})`,
        };
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

  const statusStyles: Record<RaiseIncidentFormValues["severity"], string> = {
    P0: "border-red-500 text-red-500",
    P1: "border-red-600 text-red-600",
    P2: "border-orange-500 text-orange-500",
    P3: "border-yellow-500 text-yellow-500",
    P4: "border-blue-500 text-blue-500",
  };

  const statusLabels: Record<RaiseIncidentFormValues["severity"], string> = {
    P0: "Full outage",
    P1: "Critical impact",
    P2: "Major degradation",
    P3: "Minor impact",
    P4: "Informational",
  };

  const onSubmit = async (data: RaiseIncidentFormValues) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-3xl border border-white/10 bg-[#050b18] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-white/5 bg-[#050b18] p-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Raise Incident</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a real incident record and open it directly in the live workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-slate-500 transition-colors hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-8">
          <FormSection>
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
                        { value: "checkout-service", label: "checkout-service" },
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

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Severity *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(["P0", "P1", "P2", "P3", "P4"] as const).map((severity) => (
                    <Controller
                      key={severity}
                      name="severity"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(severity)}
                          className={`flex flex-col items-center rounded-xl border p-3 transition-all ${
                            field.value === severity
                              ? statusStyles[severity]
                              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/30"
                          }`}
                        >
                          <span className="font-bold">{severity}</span>
                          <span className="text-[10px] uppercase opacity-60">
                            {statusLabels[severity]}
                          </span>
                        </button>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FormSection>
          <FormSection>
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
                      label="Business Impact"
                      placeholder="Revenue, operations, or SLA impact"
                    />
                  )}
                />
              </div>
            </div>
          </FormSection>

          <FormSection>
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
                      { value: "incident-room-only", label: "Incident room only" },
                      { value: "no-notification", label: "No notification" },
                    ]}
                  />
                )}
              />
            </div>
          </FormSection>

          <div className="rounded-3xl border border-green-500/20 bg-green-950/20 p-8">
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-green-500">
              Incident Preview
            </span>
            <h3 className="mb-2 break-words text-2xl font-bold text-white">
              {watchedTitle || "Incident title will appear here..."}
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              {watchedEnv} / {watchedSeverity}
            </p>
            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>
                The created incident will be available immediately in the workspace,
                ticket detail flow, comments, timeline, and collaboration tabs.
              </p>
            </div>
          </div>

          {createMutation.isError ? (
            <p className="text-sm text-red-400">
              Unable to create the incident right now. Please try again.
            </p>
          ) : null}

          <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-white/5 bg-[#050b18] py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-6 py-2.5 font-semibold text-white transition-all hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-green-400 px-8 py-2.5 font-bold text-[#050b18] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIncidentModal;
