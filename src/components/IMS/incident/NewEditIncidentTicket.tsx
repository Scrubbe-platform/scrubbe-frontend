import React, { ReactNode, useEffect, useRef, useState } from "react";
import { z } from "zod";
import CButton from "../../ui/Cbutton";
import { Controller, useForm } from "react-hook-form";
import TextArea from "../../ui/text-area";
import { IoDocumentTextSharp, IoLocation } from "react-icons/io5";
import { TiSpanner } from "react-icons/ti";
import { useFetch } from "@/hooks/useFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { querykeys } from "@/lib/constant";
import useTicketDetails from "@/hooks/useTicketDetails";
import { AiFillInfoCircle } from "react-icons/ai";
import Select from "../../ui/select";
import {
  FaUser,
  FaToolbox,
  FaBolt,
  FaExclamation,
  FaArrowAltCircleUp,
  FaFolder,
} from "react-icons/fa";
import { HiOutlinePaperClip } from "react-icons/hi";
import { RiInformationLine } from "react-icons/ri";
import Input from "../../ui/input";
import PostMortem from "../../IncidentTicket/PostMortem";
import clsx from "clsx";
import Modal from "../../ui/Modal";
import { Calendar, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Ticket, Tticket } from "@/types";
import CreateWarRoom from "../CreateWarRoom";
import AiStarIcon from "@/components/icons/ai-star";

const formScheme = z.object({
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
  customerCommNeeded: z.boolean().default(false),
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
  postActions: z.array(z.string()).default([]),
  ezraFocusMode: z.string().optional(),
  ezraInstructions: z.string().optional(),
});

type FormType = z.infer<typeof formScheme>;

const priorityColors = (priority: string) => {
  return (
    <div className="flex items-center gap-2 ">
      <div
        className={clsx(
          "px-3 py-1 text-xs rounded-md capitalize",
          priority === "CRITICAL"
            ? "bg-red-100 text-red-500"
            : priority === "HIGH"
            ? "text-orange-500 bg-orange-100"
            : priority === "MEDIUM"
            ? "bg-yellow-100 text-yellow-500"
            : priority === "LOW"
            ? "bg-blue-100 text-blue-500"
            : "bg-gray-100 text-gray-500"
        )}
      >
        {priority}
      </div>
    </div>
  );
};
const NewEditIncidentTicket = () => {
  const { put, get } = useFetch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [uploadedLogo, setUploadedLogo] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useTicketDetails();
  const ticket = data as Tticket;
  const [openPostMortem, setOpenPostMortem] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormType>({
    resolver: zodResolver(formScheme as any),
    mode: "onChange",
  });
  const [openWarRoom, setOpenWarRoom] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      // const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (file.size > maxSize) {
        return;
      }

      // Set the uploaded logo for immediate local preview
      setUploadedLogo(file);

      // Also update the store (this will handle base64 conversion asynchronously)
    }
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
    refetchOnWindowFocus: false,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ data }: { data: FormType }) => {
      try {
        const newData = {
          ...data,
          incidentId: ticket?.id,
        };

        const res = await put(endpoint.incident_ticket.create, newData);
        if (res.success) {
          toast.success("Incident ticket updated successfully");
          queryClient.refetchQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
          //   if (data.status === "RESOLVED" || data.status === "CLOSED") {
          //     setOpenPostMortem(true);
          //     return;
          //   }
          //   if (data.priority === "CRITICAL") {
          //     setOpenWarRoom(true);
          //   }
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to update incident ticket");
      }
    },
  });

  console.log({ errors });

  const handleUpdateTicket = (data: FormType) => {
    mutateAsync({ data });
  };

  useEffect(() => {
    if (ticket) {
      Object.entries(ticket).map(([key, value]) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(key as any, value ?? "")
      );
      setValue("owningSquad", ticket?.owningSquad ?? "");

      setValue("incidentCommander", ticket?.incidentCommander ?? "");
    }
  }, [ticket]);

  const statusColor: { [key: string]: string } = {
    OPEN: "bg-blue-500",
    ACKNOWLEDGED: "bg-cyan-500",
    INVESTIGATION: "bg-amber-500",
    MITIGATED: "bg-orange-500",
    RESOLVED: "bg-emerald-500",
    CLOSED: "bg-gray-500",
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto w-full flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-[60%] rounded-md bg-gray-200" />
        <div className="grid grid-cols-5 gap-4">
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12">
      <form
        onSubmit={handleSubmit(handleUpdateTicket as any)}
        className="p-4 space-y-5 shadow-md mt-6 rounded-xl col-span-8"
      >
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
              {/* <div className="space-y-1.5">
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
              </div> */}
              {/* <div className="space-y-1.5">
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
              </div> */}

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
            <div className="grid grid-cols-3 mt-3 gap-6">
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
                </div>
                <div className="space-y-1.5 mt-3">
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
                        placeholder="Write the detailed technical story : What changed , which services , which signals , why it’s failing . This is where analysts dump everything they know "
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
          </section>
        </StepWrapper>

        <div className="flex gap-2 justify-end">
        <CButton className="w-fit border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan">
          <AiStarIcon stroke="#06eefd"/>
          Ezra Lead
        </CButton>
        <CButton className="w-fit border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan">
          <AiStarIcon stroke="#06eefd"/>
          Ezra Analyst
        </CButton>
          {/* <CButton
            type="button"
            onClick={() => router.back()}
            className="w-fit border border-IMSLightGreen shadow-none hover:bg-IMSLightGreen hover:text-white text-IMSLightGreen dark:border-gray-700 bg-transparent"
          >
            Back
          </CButton> */}

          <CButton
            isLoading={isPending}
            disabled={!isValid}
            type="submit"
            className="w-fit  bg-IMSCyan text-black hover:bg-IMSGreen shadow-none"
          >
            Save Changes
          </CButton>
        </div>
      </form>
      {/* <Modal
        onClose={() => setOpenPostMortem(false)}
        isOpen={openPostMortem}
        className="!p-0"
      >
        <PostMortem onClose={() => setOpenPostMortem(false)} ticket={ticket} />
      </Modal> */}
      <div></div>

      <Modal isOpen={openWarRoom} onClose={() => setOpenWarRoom(false)}>
        <CreateWarRoom onClose={() => setOpenWarRoom(false)} />
      </Modal>
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
