import React, { ReactNode, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { z } from "zod";
import Input from "../ui/input";
import Select from "../ui/select";
import TextArea from "../ui/text-area";
import Switch from "../ui/Switch";
import { FaCodeFork } from "react-icons/fa6";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Plus } from "lucide-react";
import Modal from "../ui/Modal";
import CButton from "../ui/Cbutton";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { endpoint } from "@/lib/api/endpoint";
import { useFetch } from "@/hooks/useFetch";

 const incidentSchema = z.object({
  // Section: Basics & Source
  summary: z.string().min(5, "Summary must be at least 5 characters"),
  serviceArea: z.string().min(1, "Service area is required"),
  sourceType: z.string(),
  detection: z.string(),
  reportedBy: z.string().optional(),
  severity: z.string(),
  environment: z.string(),
  region: z.string(),
  state: z.string(),

  // Section: Description & Impact
  techDescription: z
    .string()
    .min(10, "Technical description is required for SREs"),
  impactSummary: z
    .string()
    .min(5, "Please provide a plain-language summary for leadership"),
  businessFlow: z.string(),
  financialExposure: z.string(),
  blastRadius: z.string(),
  regulatory: z.string().optional(),
  customerCommNeeded: z.boolean(),
  customerMessage: z.string().optional(),

  // Section: Ownership
  incidentCommander: z.string().min(1, "Commander is required"),
  owningSquad: z.string().min(1, "Owning squad is required"),
  escalationStage: z.string(),
  onCallNotes: z.string().optional(),

  // Section: Signals & Code Engine
  playbook: z.string(),
  suggestionId: z.string(),
  fixStatus: z.string(),
  metrics: z.array(z.string()).default([]).optional(),
  logStreams: z.array(z.string()).default([]).optional(),
  pipelines: z.array(z.string()).default([]).optional(),
  fraudRiskView: z.array(z.string()).default([]).optional(),

  // Section: Lifecycle & Ezra
  rootCauseCategory: z.string(),
  relatedIncident: z.string().optional(),
  internalNotes: z.string().optional(),
  postActions: z.array(z.string()),
  ezraFocusMode: z.string().optional(),
  ezraInstructions: z.string().optional(),
  logs:z.string().optional()
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

const RaiseIncident = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
  });
  const { get } = useFetch();

  type TDialogs = "isMetric" | "isLog" | "isPipeline" | "isFraud";
  const [openDialog, setOpenDialog] = useState<Record<TDialogs, boolean>>({
    isMetric: false,
    isLog: false,
    isPipeline: false,
    isFraud: false,
  });

  const handleOpenDialog = (modal: TDialogs) => {
    setOpenDialog((prev) => ({
      ...prev,
      [modal]: true,
    }));
  };
  const handleCloseDialog = (modal: TDialogs) => {
    setOpenDialog((prev) => ({
      ...prev,
      [modal]: false,
    }));
  };

  const handleAddCodeEngineSignal = (modal: TDialogs, value: string) => {
    if (modal === "isMetric") {
      setValue("metrics", [value, ...(watch("metrics") || [])]);
      return;
    }
    if (modal === "isFraud") {
      setValue("fraudRiskView", [value, ...(watch("fraudRiskView") || [])]);
      return;
    }
    if (modal === "isPipeline") {
      setValue("pipelines", [value, ...(watch("pipelines") || [])]);
      return;
    }
    if (modal === "isLog") {
      setValue("logStreams", [value, ...(watch("logStreams") || [])]);
      return;
    }
  };

  const watched = watch();

  const onSubmit = (data: IncidentFormValues) => {
    console.log("Validated Form Data:", data);
  };

  const { data: members } = useQuery<
    { firstname: string; lastname: string; email: string }[]
  >({
    queryKey: [querykeys.GET_MEMBERS],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get_members);
        console.log({ memeber: res });
        if (res.success) {
          return res.data;
        }
        return [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  });

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Set up the interval to run every 1000 milliseconds (1 second)
    const intervalId = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="min-h-screen bg-dark text-slate-300 p-8 font-sans">
      <AddCodeEngineSignal
        actionLabel="Add Metric"
        label="Metrics"
        open={openDialog.isMetric}
        closeModal={() => handleCloseDialog("isMetric")}
        onChangeValue={(value) => handleAddCodeEngineSignal("isMetric", value)}
      />
      <AddCodeEngineSignal
        actionLabel="Add Log"
        label="Log Streams"
        open={openDialog.isLog}
        closeModal={() => handleCloseDialog("isLog")}
        onChangeValue={(value) => handleAddCodeEngineSignal("isLog", value)}
      />
      <AddCodeEngineSignal
        actionLabel="Add Pipeline"
        label="Pipelines"
        open={openDialog.isPipeline}
        closeModal={() => handleCloseDialog("isPipeline")}
        onChangeValue={(value) =>
          handleAddCodeEngineSignal("isPipeline", value)
        }
      />
      <AddCodeEngineSignal
        actionLabel="Add Fraud/Risk Views"
        label="Fraud/Risk Views"
        open={openDialog.isFraud}
        closeModal={() => handleCloseDialog("isFraud")}
        onChangeValue={(value) => handleAddCodeEngineSignal("isFraud", value)}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-[1440px] mx-auto"
      >
        <header className="grid grid-cols-2 mb-10 ">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              Raise Incident
              <span className="text-[10px] flex items-center gap-2 bg-blue-500/10 font-light text-white border border-white px-2 py-1 rounded uppercase tracking-widest">
                <FaCodeFork /> Wired into Code Engine & Ezra
              </span>
            </h1>
            <p className="text-base text-white mt-2">
              Incidents can be auto-raised from pipelines and alerts, or created
              manually from phone, email and chat. Scrubbe turns each one into a
              signal-rich object for dev, SRE, and fraud – not a legacy ITSM
              ticket.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <p className="text-sm text-white mt-2 max-w-md text-right">
              Layout is opinionated to Scrubbe. Classic ITSM fields stay out of
              the way unless you need them.
            </p>
            {/* <div className="flex items-center gap-3">
              <p className="text-sm text-white">Classic ITSM Fields</p>
              <Switch checked={false} onChange={() => {}} />
            </div> */}
          </div>
        </header>
        <div className="w-full grid grid-cols-12 gap-10">
          {/* LEFT COLUMN */}
          <div className="col-span-8 space-y-8 pb-24">
            {/* 1. Basics & Source */}
            <StepWrapper
              leftTop={
                <>
                  <p className=" text-sm">
                    Incident ID (assigned on create) <br />
                    <span className=" font-semibold ">INC-TEMP</span>
                  </p>
                </>
              }
              title="Basics & source"
              subtitle="How did this incident start, and what is it about?"
            >
              <section>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Short title / Summary
                    </label>
                    <Controller
                      name="summary"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Checkout-service DB pool exhaustion"
                          className="!bg-[#08132F]"
                          error={errors.summary?.message as string}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Service / Product Area
                    </label>
                    <Controller
                      name="serviceArea"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Checkout-service . payments"
                          className="!bg-[#08132F]"
                          error={errors.serviceArea?.message as string}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Source Type
                    </label>
                    <Controller
                      name="sourceType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            {
                              value: "Auto - CI/CD pipeline",
                              label: "Auto - CI/CD pipeline",
                            },
                            {
                              value: "Auto - Monitoring alert",
                              label: "Auto - Monitoring alert",
                            },
                            {
                              value: "Auto - Fraud / Risk engine",
                              label: "Auto - Fraud / Risk engine",
                            },
                            {
                              value: "Manual - Phone call",
                              label: "Manual - Phone call",
                            },
                            {
                              value: "Manual - Email",
                              label: "Manual - Email",
                            },
                            {
                              value: "Manual - Chat / Slack",
                              label: "Manual - Chat / Slack",
                            },
                          ]}
                          className="!bg-[#08132F]"
                          error={errors.sourceType?.message as string}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Detection
                    </label>
                    <Controller
                      name="detection"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "Auto-detected", label: "Auto-detected" },
                            {
                              value: "Internal staff",
                              label: "Internal staff",
                            },
                            {
                              value: "Customer report",
                              label: "Customer report",
                            },
                          ]}
                          className="!bg-[#08132F]"
                          error={errors.detection?.message as string}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Reported by ( for manual )
                    </label>
                    <Controller
                      name="reportedBy"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Name / team / customer ref "
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Severity
                    </label>
                    <Controller
                      name="severity"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "P1", label: "P1 - Critical" },
                            { value: "P2", label: "P2 - High" },
                            { value: "P3", label: "P3 - Medium" },
                            { value: "P4", label: "P4 - Low" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Environment
                    </label>
                    <Controller
                      name="environment"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "production", label: "Production" },
                            { value: "staging", label: "Staging" },
                            { value: "pre-prod", label: "Pre-prod" },
                            { value: "sandbox", label: "Sandbox / test" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Region
                    </label>
                    <Controller
                      name="region"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "eu-west-1", label: "eu-west-1" },
                            { value: "eu-central-1", label: "eu-central-1" },
                            { value: "us-east-1", label: "us-east-1" },
                            { value: "us-east-2", label: "us-east-2" },
                            { value: "multi-region", label: "multi-region" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      State
                    </label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { label: "Open", value: "OPEN" },
                            { label: "Acknowledge", value: "ACKNOWLEDGED" },
                            { label: "Investigation", value: "INVESTIGATION" },
                            { label: "Mitigated", value: "MITIGATED" },
                            { label: "Resolved", value: "RESOLVED" },
                            { label: "Closed", value: "CLOSED" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                </div>
              </section>
            </StepWrapper>
            {/* 2. Description & Impact */}
            <StepWrapper
              leftTop={
                <>
                  <p className=" text-sm border rounded-xl px-2 py-1">
                    Ezra & postmortems read from here
                  </p>
                </>
              }
              title="Description & impact"
              subtitle="What is broken and who feels it?"
            >
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Full technical description ( for SREs / devs )
                  </label>
                  <Controller
                    name="techDescription"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        rows={4}
                        placeholder=" Failure summary
  •  job ID:
  •  Proposed diff (before/after):
  •  Risk classification:
  •  Confidence score:
  •  Policy evaluation result:
  •  Allowed actions:
Evidence:
  •  CI job IDs:
  •  test counts:
  •  runtime deltas:
  •  flaky retries:
            timestamped:

Refusal Reasons:"
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Impact Summary (plain language - for leadership & Ezra )
                  </label>
                  <Controller
                    name="impactSummary"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        label="One or two paragraph : who is affected , how bad it is, whether you are in control "
                        labelClassName="!text-gray-300"
                        rows={3}
                        placeholder="Example: 'Customers in EU are seeing...'"
                        className="!bg-[#08132F]"
                      />
                    )}
                  />


                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Logs
                  </label>
                  <Controller
                    name="logs"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                         labelClassName="!text-gray-300"
                        rows={3}
                        placeholder="Example: 'Customers in EU are seeing...'"
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                  </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Business Flow / function
                    </label>
                    <Controller
                      name="businessFlow"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "checkout", label: "Checkout" },
                            { value: "onboarding", label: "Onboarding" },
                            { value: "onboarding", label: "Onboarding" },
                            { value: "payouts", label: "Payouts" },
                            { value: "identity_kyc", label: "Identity / KYC" },
                            { value: "risk_fraud", label: "Risk & fraud" },
                            { value: "others", label: "Others" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Potential financial / fraud exposure
                    </label>
                    <Controller
                      name="financialExposure"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "10k", label: "<$10k" },
                            { value: "$10k - $100k", label: "$10k - $100k" },
                            { value: "$100k - $1m", label: "$100k - $1m" },
                            { value: ">$1m", label: ">$1m" },
                            { value: "unknown", label: "Unknown" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Blast Radius
                  </label>
                  <Controller
                    name="blastRadius"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="How wide the failure  has spread  across services  , regions  and users . "
                        labelClassName="!text-gray-300"
                        {...field}
                        options={[
                          {
                            value: "Local - single service / subset of users",
                            label: "Local - single service / subset of users",
                          },
                          {
                            value:
                              "Domain-wide - multiple service in one product",
                            label:
                              "Domain-wide - multiple service in one product",
                          },
                          {
                            value: "Region-wide - one region / cluster",
                            label: "Region-wide - one region / cluster",
                          },
                          {
                            value: "Multi-region - cross-region impact",
                            label: "Multi-region - cross-region impact",
                          },
                          {
                            value: "Enterprise-wide - cross-product / critical",
                            label: "Enterprise-wide - cross-product / critical",
                          },
                          {
                            value: "Unknown",
                            label: "Unknown",
                          },
                        ]}
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Regulatory / Compliance
                  </label>
                  <Controller
                    name="regulatory"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        placeholder="PCI Scope, PSD2 SCA, KYC/AML..."
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>
                {/* <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Customer communication needed?{" "}
                  </label>
                  <Controller
                    name="customerCommNeeded"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        placeholder="Draft the external  customer message here if you think we ll need it "
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div> */}
                <div className="flex items-center justify-between py-2 border-t border-slate-800/50">
                  <span className="text-sm font-medium">
                    Customer communication needed?
                  </span>
                  <Controller
                    name="customerCommNeeded"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </StepWrapper>

            {/* 3. Ownership & Teams */}
            <StepWrapper
              leftTop={
                <>
                  <p className=" text-sm border rounded-xl px-2 py-1">
                    No Orphan Incidents{" "}
                  </p>
                </>
              }
              title="Ownership & teams"
              subtitle="Who owns this and who should care?"
            >
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Incident Commander
                    </label>
                    <Controller
                      name="incidentCommander"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { label: "Team member or group", value: "" },
                          ].concat(
                            members?.map((member) => ({
                              label: member.email,
                              value: member.email,
                            })) ?? []
                          )}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Owing squad / team
                    </label>
                    <Controller
                      name="owningSquad"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "checkout_sre", label: "Checkout SRE" },
                            {
                              value: "payment_platform",
                              label: "Payment Platform",
                            },
                            {
                              value: "risk_and_fraud",
                              label: "Risk and Fraud",
                            },
                            { value: "core_infra", label: "Core Infra" },
                            { value: "others", label: "Others" },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Escalation Stage
                  </label>
                  <Controller
                    name="escalationStage"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[
                          { value: "l1", label: "L1 SRE" },
                          { value: "l2", label: "L2 Platform" },
                          { value: "l3", label: "L3 Service Owner" },
                          {
                            value: "third-party",
                            label: "Vendor / third-party",
                          },
                        ]}
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Notes for on-call{" "}
                  </label>
                  <Controller
                    name="techDescription"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        {...field}
                        rows={4}
                        placeholder="Anything on-call must know immediately (rollbacks , sensitive customers , e.tc)"
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>
              </div>
            </StepWrapper>

            {/* 4. Signals & Code Engine */}
            <StepWrapper
              leftTop={
                <>
                  <p className=" text-sm border rounded-xl px-2 py-1">
                    Ezra & analytics read from here
                  </p>
                </>
              }
              title="Signals & Code Engine"
              subtitle="Bind metrics, logs, pipelines, fraud and playbooks into one Scrubbe incident. This is the Scrubbe-only layer: it tells Ezra and Code Engine exactly which telemetry and playbook to use when suggesting fixes and summarising for leadership. "
            >
              {" "}
              <div></div>
              <div className="grid grid-cols-2 gap-8">
                <div className=" leading-relaxed">
                  <h2 className=" text-sm font-semibold text-white">
                    Signals linked into this incident
                  </h2>
                  <p className=" text-sm font-semibold">
                    Link the exact streams you want Scrubbe to reason over. The
                    more precise this mapping, the smarter Code Engine and Ezra
                    will be.
                  </p>

                  <div className="space-y-4 mt-5">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Metrics</p>
                        <div
                          onClick={() => handleOpenDialog("isMetric")}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Plus />
                          <p>Add metric</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(watch("metrics") ?? []).map((item:string, idx:number) => (
                          <div
                            className="text-sm  rounded-full px-2 py-1 w-fit bg-dark"
                            key={idx}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Log Streams</p>
                        <div
                          onClick={() => handleOpenDialog("isLog")}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Plus />
                          <p>Add log</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(watch("logStreams") ?? []).map((item:string, idx:number) => (
                          <div
                            className="text-sm  rounded-full px-2 py-1 w-fit bg-dark"
                            key={idx}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Pipelines</p>
                        <div
                          onClick={() => handleOpenDialog("isPipeline")}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Plus />
                          <p>Add pipeline</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(watch("pipelines") ?? []).map((item:string, idx:number) => (
                          <div
                            className="text-sm  rounded-full px-2 py-1 w-fit bg-dark"
                            key={idx}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Fraud / risk views</p>
                        <div
                          onClick={() => handleOpenDialog("isFraud")}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Plus />
                          <p>Add fraud view</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(watch("fraudRiskView") ?? []).map((item:string, idx:number) => (
                          <div
                            className="text-sm  rounded-full px-2 py-1 w-fit bg-dark"
                            key={idx}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                      Playbook
                    </label>
                    <Controller
                      name="playbook"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            {
                              value: "db_pool",
                              label: "DB Connection pool exhaustion",
                            },
                          ]}
                          className="!bg-[#08132F]"
                        />
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                        Code Engine Suggestion ID
                      </label>
                      <Controller
                        name="suggestionId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[{ value: "li_sre", label: "LI SRE" }]}
                            className="!bg-[#08132F]"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                        Fix status
                      </label>
                      <Controller
                        name="fixStatus"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { value: "Suggestion", label: "Suggestion" },
                              { value: "Being tested", label: "Being tested" },
                              { value: "Rolled out", label: "Rolled out" },
                              { value: "Rolled back", label: "Rolled back" },
                            ]}
                            className="!bg-[#08132F]"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="border border-gray-400 p-4 rounded-lg space-y-2">
                    <p className="text-white text-base">
                      How this flows through Scrubbe
                    </p>
                    <ul className="pl-3 list-disc text-sm space-y-1 text-white">
                      <li>
                        Linked metrics, logs, pipelines and fraud views define
                        the signal graph for this incident.
                      </li>
                      <li>
                        Selected playbook + Code Engine suggestion become the
                        default remediation path.
                      </li>
                      <li>
                        Ezra uses both to speak differently to leadership vs
                        SREs and to power analytics.
                      </li>
                    </ul>
                    <p className="text-sm">
                      In the real product this panel would render live diffs,
                      config suggestions and test status.
                    </p>
                  </div>
                </div>
              </div>
            </StepWrapper>

            {/* 5. Lifecycle & Ezra */}
            <StepWrapper
              title="Lifecycle, links & Ezra"
              subtitle="Classify the incident and hint Ezra how to speak."
            >
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Root cause category
                  </label>
                  <Controller
                    name="rootCauseCategory"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[{ value: "config", label: "Config" }]}
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Related Incident
                  </label>
                  <Controller
                    name="relatedIncident"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[{ value: "inc231", label: "INC-231" }]}
                        className="!bg-[#08132F]"
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                    Add Link
                  </label>
                  <Controller
                    name="relatedIncident"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="!bg-[#08132F]"
                        placeholder="Paste dashboard / run book / doc link"
                      />
                    )}
                  />
                  <label className="text-[11px] text-slate-200  uppercase tracking-tight">
                    Example: Grafana, Datadog, Sentry, internal docs, risk
                    dashboards.
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-200 font-bold uppercase tracking-tight">
                  Internal Notes
                </label>
                <Controller
                  name="relatedIncident"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      className="!bg-[#08132F]"
                      placeholder="Short , useful notes for future readers /  post mortems"
                    />
                  )}
                />
              </div>

              <div className="border rounded-2xl p-5 mt-4">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  Ezra focus (optional)
                </h4>
                <p className="text-sm">
                  Tell Ezra what to emphasise in summaries – MTTR, fraud risk,
                  board narrative, etc. This doesn’t show to customers, only
                  inside Scrubbe.
                </p>
                <div className="flex gap-4 my-4">
                  {[
                    { id: "exec", label: "Exec / leadership first" },
                    { id: "sre", label: "SRE / dev detail" },
                    { id: "fraud", label: "Fraud / risk lens" },
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      className="flex items-center gap-3 border p-3 rounded-xl cursor-pointer w-fit"
                    >
                      <Controller
                        name="ezraFocusMode"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value === mode.id}
                            onChange={() => field.onChange(mode.id)}
                            className="accent-cyan-500 w-4 h-4"
                          />
                        )}
                      />
                      <span className="text-[11px] font-bold text-slate-400">
                        {mode.label}
                      </span>
                    </label>
                  ))}
                </div>
                <Controller
                  name="ezraInstructions"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder="Example: For execs , Keep this at business impact and MTTR . For SREs . focus on DB pool fix and Config patterns . Call out clearly that fraud exposure is low"
                    />
                  )}
                />
              </div>
            </StepWrapper>

            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400 font-semibold text-base" />
              This incident will be available to Code Engine, Ezra and analytics
              as soon as it is created.
            </div>
            <div className="flex justify-end gap-4">
              <CButton
                type="button"
                className="px-6 py-2 border border-IMSCyan bg-transparent w-fit text-IMSCyan hover:bg-transparent font-bold text-sm"
              >
                Save Draft
              </CButton>
              <CButton type="submit" className="px-10 py-2 w-fit text-sm ">
                Create Incident
              </CButton>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="col-span-4 relative">
            <div className="sticky top-8 space-y-4">
              <div className=" border border-gray-400 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-3">
                  <h3 className="text-base font-black text-white uppercase  tracking-widest">
                    Live Preview
                  </h3>
                  <p className=" text-sm border rounded-xl px-2 py-1">
                    How SREs will see it
                  </p>
                </div>
                <div className=" border border-gray-400 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] text-slate-200 uppercase font-black">
                        Incident
                      </p>
                      <p className="text-sm font-bold text-white max-w-[180px] leading-tight">
                        {watched.summary || "Summary Title"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {watch("severity") && (
                        <span className="text-[9px] text-yellow-400 border border-yellow-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                          {watch("severity")}
                        </span>
                      )}
                      {watch("region") && (
                        <span className="text-[9px] border border-gray-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                          {watch("region")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] border border-gray-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                      Team:{watch("reportedBy") ?? "NONE"}
                    </span>

                    <span className="text-[9px] border border-gray-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                      Source:{watch("region") ?? " -unknown"}
                    </span>
                  </div>
                </div>
                <div className=" border border-gray-400 rounded-xl p-4 space-y-4">
                  <div className="gap-3">
                    <div className="bg-IMSCyan/10 border border-IMSCyan p-2 rounded-lg space-y-1 flex flex-col items-center">
                      <p className="text-sm text-slate-200 flex items-center gap-2">
                        <Clock className="size-3" /> Time since detection
                      </p>
                      <p className="text-lg text-white font-bold">
                        {formatTime(elapsedTime)}
                      </p>
                      <p className="text-sm">
                        Starts when alert / call landed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className=" border border-gray-400 rounded-xl p-4 space-y-1">
                  <p className="text-sm text-white font-black">
                    Impact & business context
                  </p>
                  <p className="text-sm">
                    {watch("summary") ??
                      "Impact summary will appear here as you type."}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] border border-gray-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                      Flow:{watch("businessFlow") ?? " unknown"}
                    </span>

                    <span className="text-[9px] border border-gray-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                      Exposure:{watch("region") ?? " unknown"}
                    </span>
                    <span className="text-[9px] border border-gray-500/40 px-2 py-1 rounded-2xl font-black uppercase">
                      Blast radius:{watch("blastRadius") ?? " unknown"}
                    </span>
                  </div>
                </div>
                {/* <div className=" border border-gray-400 rounded-xl p-4 space-y-4"></div> */}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RaiseIncident;

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
  <div
    className={`bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip`}
  >
    <div className="p-4 border-b border-[#1F2937] flex justify-between items-center ">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-neutral-300 text-sm max-w-lg">{subtitle}</p>
      </div>
      {leftTop && <>{leftTop}</>}
    </div>
    <div className="px-4 py-4">{children}</div>
  </div>
);

type TModalProps = {
  open: boolean;
  closeModal: () => void;
  onChangeValue: (value: string) => void;
  label: string;
  actionLabel: string;
};

const AddCodeEngineSignal = ({
  closeModal,
  onChangeValue,
  open,
  actionLabel,
  label,
}: TModalProps) => {
  const [value, setValue] = useState("");

  const handleAddItem = () => {
    onChangeValue(value);
    closeModal();
  };
  return (
    <Modal isOpen={open} onClose={closeModal} className="!bg-dark">
      <p className="text-white font-bold">{label}</p>
      <div className="py-6">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder=" "
          className="!bg-[#08132F]"
          labelClassName="!text-white"
          label={label}
        />
        <div className="flex justify-end gap-4 items-center">
          <CButton onClick={closeModal} className="w-fit">
            Cancel
          </CButton>
          <CButton onClick={handleAddItem} className="w-fit">
            {actionLabel}
          </CButton>
        </div>
      </div>
    </Modal>
  );
};
