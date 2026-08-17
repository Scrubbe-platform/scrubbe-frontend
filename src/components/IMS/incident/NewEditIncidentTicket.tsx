"use client";

import React, { ReactNode, useEffect } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CButton from "../../ui/Cbutton";
import Input from "../../ui/input";
import Select from "../../ui/select";
import TextArea from "../../ui/text-area";
import AiStarIcon from "@/components/icons/ai-star";
import useMember, { Member } from "@/hooks/useMember";
import useTicketDetails from "@/hooks/useTicketDetails";
import { querykeys } from "@/lib/constant";
import { updateIncident } from "@/lib/incident/incident.api";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const formSchema = z.object({
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  serviceArea: z.string().min(1, "Service area is required"),
  affectedSystem: z.string(),
  category: z.string(),
  subCategory: z.string(),
  severity: z.string().min(1, "Severity is required"),
  environment: z.string(),
  region: z.string(),
  status: z.string().min(1, "Status is required"),
  sourceType: z.string(),
  detection: z.string(),
  reportedBy: z.string(),
  incidentCommander: z.string(),
  assignedToEmail: z.string(),
  owningSquad: z.string(),
  techDescription: z
    .string()
    .min(10, "Technical description is required for responders"),
  description: z.string(),
  impactSummary: z
    .string()
    .min(5, "Please provide a plain-language impact summary"),
  businessFlow: z.string(),
  blastRadius: z.string(),
  financialExposure: z.string(),
  regulatory: z.string(),
  customerCommNeeded: z.enum(["false", "true"]),
  customerMessage: z.string(),
  recommendedActions: z.string(),
});

type FormType = z.infer<typeof formSchema>;

type SelectOption = {
  value: string;
  label: string;
};

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Open", value: "OPEN" },
  { label: "Acknowledged", value: "ACKNOWLEDGED" },
  { label: "Investigation", value: "INVESTIGATION" },
  { label: "Mitigated", value: "MITIGATED" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const SEVERITY_OPTIONS: SelectOption[] = [
  { value: "P0", label: "P0 - Full outage" },
  { value: "P1", label: "P1 - Critical" },
  { value: "P2", label: "P2 - High" },
  { value: "P3", label: "P3 - Medium" },
  { value: "P4", label: "P4 - Low" },
];

const ENVIRONMENT_OPTIONS: SelectOption[] = [
  { value: "Production", label: "Production" },
  { value: "Staging", label: "Staging" },
  { value: "Development", label: "Development" },
  { value: "Pre-prod", label: "Pre-prod" },
  { value: "Sandbox", label: "Sandbox / test" },
];

const REGION_OPTIONS: SelectOption[] = [
  { value: "eu-west-1", label: "eu-west-1" },
  { value: "eu-central-1", label: "eu-central-1" },
  { value: "us-east-1", label: "us-east-1" },
  { value: "us-east-2", label: "us-east-2" },
  { value: "multi-region", label: "multi-region" },
];

const SOURCE_TYPE_OPTIONS: SelectOption[] = [
  { value: "", label: "Select source type" },
  { value: "Manual raise", label: "Manual raise" },
  { value: "Alert / monitoring", label: "Alert / monitoring" },
  { value: "Customer report", label: "Customer report" },
  { value: "Pipeline / deploy", label: "Pipeline / deploy" },
  { value: "Webhook / API", label: "Webhook / API" },
];

const DETECTION_OPTIONS: SelectOption[] = [
  { value: "", label: "Select detection signal" },
  { value: "Alert or alarm fired", label: "Alert or alarm fired" },
  { value: "Customer report", label: "Customer report" },
  { value: "Internal staff", label: "Internal staff" },
  { value: "Latency spike", label: "Latency spike" },
];

const SQUAD_OPTIONS: SelectOption[] = [
  { value: "", label: "Select squad / team" },
  { value: "checkout_sre", label: "Checkout SRE" },
  { value: "payment_platform", label: "Payment Platform" },
  { value: "risk_and_fraud", label: "Risk and Fraud" },
  { value: "core_infra", label: "Core Infra" },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "", label: "Select category" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Application", label: "Application" },
  { value: "Deployment", label: "Deployment" },
  { value: "Fraud", label: "Fraud" },
  { value: "Security", label: "Security" },
];

const SUBCATEGORY_OPTIONS: SelectOption[] = [
  { value: "", label: "Select sub-category" },
  { value: "Database", label: "Database" },
  { value: "Network", label: "Network" },
  { value: "API", label: "API" },
  { value: "Queue / async", label: "Queue / async" },
  { value: "Configuration", label: "Configuration" },
];

const CUSTOMER_COMM_OPTIONS: SelectOption[] = [
  { value: "false", label: "No external communication yet" },
  { value: "true", label: "Customer communication required" },
];

const normalizeEmptyDisplayValue = (value?: string | null) => {
  const normalized = (value ?? "").trim();
  if (!normalized) return "";
  if (normalized.startsWith("Unknown ")) return "";
  return normalized;
};

const readRawString = (
  incident: IncidentDetailRecord | null,
  key: string
) => {
  const value = incident?.raw?.[key];
  return typeof value === "string" ? value : "";
};

const readRawBoolean = (
  incident: IncidentDetailRecord | null,
  key: string
) => {
  const value = incident?.raw?.[key];
  return value === true;
};

const ensureCurrentOption = (
  options: SelectOption[],
  currentValue?: string | null
) => {
  const normalized = (currentValue ?? "").trim();
  if (!normalized) return options;
  if (options.some((option) => option.value === normalized)) return options;
  return [{ value: normalized, label: normalized }, ...options];
};

const buildMemberOptions = (members: Member[], currentValue?: string | null) => {
  const options: SelectOption[] = [{ value: "", label: "Unassigned" }];
  const seen = new Set(options.map((option) => option.value));

  const addOption = (value?: string | null, label?: string) => {
    const normalized = (value ?? "").trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    options.push({ value: normalized, label: label ?? normalized });
  };

  addOption(currentValue);

  members.forEach((member) => {
    const fullName =
      `${member.firstname ?? ""} ${member.lastname ?? ""}`.trim() ||
      member.email;
    addOption(member.email, `${fullName} (${member.email})`);
  });

  return options;
};

const buildFormValues = (incident: IncidentDetailRecord | null): FormType => ({
  summary: incident?.summary ?? "",
  serviceArea:
    readRawString(incident, "serviceArea") ||
    normalizeEmptyDisplayValue(incident?.service),
  affectedSystem:
    incident?.affectedSystem ||
    readRawString(incident, "affectedSystem") ||
    normalizeEmptyDisplayValue(incident?.service),
  category: incident?.category ?? "",
  subCategory: incident?.subCategory ?? "",
  severity: incident?.severity || "P2",
  environment:
    readRawString(incident, "environment") ||
    normalizeEmptyDisplayValue(incident?.environment) ||
    "Production",
  region:
    readRawString(incident, "region") ||
    normalizeEmptyDisplayValue(incident?.region) ||
    "multi-region",
  status: incident?.status || incident?.state || "OPEN",
  sourceType: incident?.sourceType || readRawString(incident, "sourceType"),
  detection: incident?.detection || readRawString(incident, "detection"),
  reportedBy: incident?.reportedBy || readRawString(incident, "reportedBy"),
  incidentCommander:
    incident?.incidentCommander || readRawString(incident, "incidentCommander"),
  assignedToEmail:
    incident?.assignedToEmail || readRawString(incident, "assignedToEmail"),
  owningSquad: incident?.owningSquad || readRawString(incident, "owningSquad"),
  techDescription:
    incident?.techDescription || readRawString(incident, "techDescription"),
  description:
    readRawString(incident, "description") ||
    incident?.description ||
    incident?.techDescription ||
    "",
  impactSummary:
    incident?.impactSummary || readRawString(incident, "impactSummary"),
  businessFlow: incident?.businessFlow || readRawString(incident, "businessFlow"),
  blastRadius: incident?.blastRadius || readRawString(incident, "blastRadius"),
  financialExposure:
    incident?.financialExposure || readRawString(incident, "financialExposure"),
  regulatory: readRawString(incident, "regulatory"),
  customerCommNeeded: readRawBoolean(incident, "customerCommNeeded")
    ? "true"
    : "false",
  customerMessage: readRawString(incident, "customerMessage"),
  recommendedActions: incident?.recommendedActions.join("\n") || "",
});

const formatDateTime = (value?: string | null) => {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";
  return parsed.toLocaleString();
};

const parseRecommendedActions = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const mapSeverityToPriority = (value: string) => {
  switch (value.trim().toUpperCase()) {
    case "P0":
    case "P1":
    case "CRITICAL":
      return "CRITICAL";
    case "P2":
    case "HIGH":
      return "HIGH";
    case "P3":
    case "MEDIUM":
      return "MEDIUM";
    case "P4":
    case "LOW":
      return "LOW";
    default:
      return undefined;
  }
};

const buildUpdatePayload = (incident: IncidentDetailRecord, values: FormType) => {
  const priority = mapSeverityToPriority(values.severity);
  const normalizedStatus = values.status.trim().toUpperCase();

  return {
    incidentId: incident.id,
    summary: values.summary.trim(),
    reason: values.summary.trim(),
    serviceArea: values.serviceArea.trim(),
    affectedSystem: values.affectedSystem.trim(),
    category: values.category.trim(),
    subCategory: values.subCategory.trim(),
    severity: values.severity.trim(),
    ...(priority ? { priority } : {}),
    environment: values.environment.trim(),
    region: values.region.trim(),
    status: normalizedStatus,
    state: normalizedStatus,
    sourceType: values.sourceType.trim(),
    detection: values.detection.trim(),
    reportedBy: values.reportedBy.trim(),
    incidentCommander: values.incidentCommander.trim(),
    assignedToEmail: values.assignedToEmail.trim(),
    owningSquad: values.owningSquad.trim(),
    techDescription: values.techDescription.trim(),
    description: values.description.trim() || values.techDescription.trim(),
    impactSummary: values.impactSummary.trim(),
    businessFlow: values.businessFlow.trim(),
    blastRadius: values.blastRadius.trim(),
    financialExposure: values.financialExposure.trim(),
    regulatory: values.regulatory.trim(),
    customerCommNeeded: values.customerCommNeeded === "true",
    customerMessage: values.customerMessage.trim(),
    recommendedActions: parseRecommendedActions(values.recommendedActions),
  };
};

const NewEditIncidentTicket = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ticketQuery = useTicketDetails();
  const ticket = ticketQuery.data ?? null;
  const { data: members = [] } = useMember();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: buildFormValues(null),
  });

  useEffect(() => {
    reset(buildFormValues(ticket));
  }, [ticket, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormType) => {
      if (!ticket) {
        throw new Error("Incident details are unavailable.");
      }

      return updateIncident(ticket.id, buildUpdatePayload(ticket, values));
    },
  });

  const handleUpdateTicket = async (values: FormType) => {
    if (!ticket) return;

    try {
      const updatedIncident = await saveMutation.mutateAsync(values);
      const detailKeys = new Set([
        ticket.id,
        ticket.ticketId,
        updatedIncident.id,
        updatedIncident.ticketId,
      ]);

      detailKeys.forEach((detailKey) => {
        if (!detailKey) return;
        queryClient.setQueryData(
          [querykeys.INCIDENT_DETAIL, detailKey],
          updatedIncident
        );
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [querykeys.INCIDENT_TICKET],
        }),
        queryClient.invalidateQueries({
          queryKey: [querykeys.HISTORY, ticket.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [querykeys.HISTORY, ticket.ticketId],
        }),
      ]);

      reset(buildFormValues(updatedIncident));
      toast.success(`Incident ${updatedIncident.ticketId} updated`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update the incident ticket"
      );
    }
  };

  if (ticketQuery.isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto w-full flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-[60%] rounded-md bg-gray-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 rounded-xl bg-gray-200 dark:bg-zinc-800" />
          <div className="h-20 rounded-xl bg-gray-200 dark:bg-zinc-800" />
        </div>
        <div className="h-96 rounded-xl bg-gray-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mt-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6 text-sm text-slate-500 dark:text-slate-400">
        Incident details are unavailable for editing.
      </div>
    );
  }

  const statusOptions = ensureCurrentOption(STATUS_OPTIONS, watch("status"));
  const severityOptions = ensureCurrentOption(
    SEVERITY_OPTIONS,
    watch("severity")
  );
  const environmentOptions = ensureCurrentOption(
    ENVIRONMENT_OPTIONS,
    watch("environment")
  );
  const regionOptions = ensureCurrentOption(REGION_OPTIONS, watch("region"));
  const sourceTypeOptions = ensureCurrentOption(
    SOURCE_TYPE_OPTIONS,
    watch("sourceType")
  );
  const detectionOptions = ensureCurrentOption(
    DETECTION_OPTIONS,
    watch("detection")
  );
  const squadOptions = ensureCurrentOption(SQUAD_OPTIONS, watch("owningSquad"));
  const categoryOptions = ensureCurrentOption(
    CATEGORY_OPTIONS,
    watch("category")
  );
  const subCategoryOptions = ensureCurrentOption(
    SUBCATEGORY_OPTIONS,
    watch("subCategory")
  );
  const commanderOptions = buildMemberOptions(
    members,
    watch("incidentCommander")
  );
  const assigneeOptions = buildMemberOptions(
    members,
    watch("assignedToEmail")
  );
  const ezraIncidentId = ticket.ticketId || ticket.id;

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(handleUpdateTicket)}
        className="mt-6 space-y-6"
      >
        <StepWrapper
          leftTop={
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Live Incident
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {ticket.ticketId}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Opened {formatDateTime(ticket.createdAt)}
              </p>
            </div>
          }
          title="Basics & ownership"
          subtitle="Edit the live incident record and keep the workspace, list, and history in sync."
        >
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Short title / Summary"
                    placeholder="Checkout-service DB pool exhaustion"
                    className="!bg-[#08132F]"
                    error={errors.summary?.message}
                  />
                )}
              />
              <Controller
                name="serviceArea"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Service / Product Area"
                    placeholder="checkout-service"
                    className="!bg-[#08132F]"
                    error={errors.serviceArea?.message}
                  />
                )}
              />
              <Controller
                name="affectedSystem"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Affected System"
                    placeholder="billing-service / cache / queue"
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Status"
                    options={statusOptions}
                    className="!bg-[#08132F]"
                    error={errors.status?.message}
                  />
                )}
              />
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Severity"
                    options={severityOptions}
                    className="!bg-[#08132F]"
                    error={errors.severity?.message}
                  />
                )}
              />
              <Controller
                name="environment"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Environment"
                    options={environmentOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Region"
                    options={regionOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="reportedBy"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Reported By"
                    placeholder="Responder, system, or customer reference"
                    className="!bg-[#08132F]"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Controller
                name="incidentCommander"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Incident Commander"
                    options={commanderOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="assignedToEmail"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Assigned Responder"
                    options={assigneeOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="owningSquad"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Owning Squad / Team"
                    options={squadOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Category"
                    options={categoryOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="subCategory"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Sub-category"
                    options={subCategoryOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="sourceType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Source Type"
                    options={sourceTypeOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="detection"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Detection"
                    options={detectionOptions}
                    className="!bg-[#08132F]"
                  />
                )}
              />
            </div>
          </section>
        </StepWrapper>

        <StepWrapper
          title="Impact & response"
          subtitle="Capture the technical story, customer impact, and next actions from the same live contract."
        >
          <section className="space-y-6">
            <Controller
              name="techDescription"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Technical Description"
                  rows={5}
                  placeholder="Describe what changed, which services are failing, and what responders know so far."
                  className="!bg-[#08132F]"
                  error={errors.techDescription?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Analyst Description"
                  rows={4}
                  placeholder="Optional analyst-facing detail beyond the technical summary."
                  className="!bg-[#08132F]"
                />
              )}
            />

            <Controller
              name="impactSummary"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Impact Summary"
                  rows={4}
                  placeholder="Who is affected, how severe it is, and whether the incident is under control."
                  className="!bg-[#08132F]"
                  error={errors.impactSummary?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Controller
                name="businessFlow"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Business Flow"
                    placeholder="Checkout, payout processing, customer onboarding..."
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="blastRadius"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Blast Radius"
                    placeholder="Impacted tenants, services, or regions"
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="financialExposure"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Financial Exposure"
                    placeholder="Revenue, SLA, or cost impact"
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="regulatory"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Regulatory / Compliance"
                    placeholder="Optional regulatory notes"
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="customerCommNeeded"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Customer Communication"
                    options={CUSTOMER_COMM_OPTIONS}
                    className="!bg-[#08132F]"
                  />
                )}
              />
              <Controller
                name="customerMessage"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Customer Message"
                    placeholder="Status page or customer-facing note"
                    className="!bg-[#08132F]"
                  />
                )}
              />
            </div>

            <Controller
              name="recommendedActions"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Recommended Actions"
                  rows={4}
                  placeholder="One action per line. These flow back into the normalized incident record."
                  className="!bg-[#08132F]"
                />
              )}
            />
          </section>
        </StepWrapper>

        {saveMutation.isError ? (
          <p className="text-sm text-red-400">
            Unable to save incident changes right now.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 justify-end">
          <CButton
            type="button"
            onClick={() => router.push(`/incident/tickets/ezra/${ezraIncidentId}`)}
            className="w-fit border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan"
          >
            <AiStarIcon stroke="#06eefd" />
            Ezra Lead
          </CButton>
          <CButton
            type="button"
            onClick={() => router.push(`/incident/tickets/ezra/${ezraIncidentId}`)}
            className="w-fit border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan"
          >
            <AiStarIcon stroke="#06eefd" />
            Ezra Analyst
          </CButton>
          <CButton
            isLoading={saveMutation.isPending}
            disabled={!isValid || saveMutation.isPending}
            type="submit"
            className="w-fit bg-IMSCyan text-black hover:bg-IMSGreen shadow-none"
          >
            Save Changes
          </CButton>
        </div>
      </form>
    </div>
  );
};

export default NewEditIncidentTicket;

const StepWrapper = ({
  subtitle,
  title,
  children,
  leftTop,
}: {
  subtitle: string;
  children: ReactNode;
  title: string;
  leftTop?: ReactNode;
}) => (
  <div className="overflow-clip rounded-xl border border-IMSCyan/40 bg-gradient-to-b from-[#0074834D] to-[#004B571A] transition-all">
    <div className="flex items-center justify-between border-b border-[#1F2937] p-4">
      <div className="flex max-w-2xl flex-col gap-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          {title}
        </h2>
        <p className="text-sm text-neutral-300">{subtitle}</p>
      </div>
      {leftTop}
    </div>
    <div className="px-4 py-4">{children}</div>
  </div>
);
