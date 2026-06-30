"use client";
import React, { useRef, useState } from "react";
import {
  X,
  ChevronDown,
  Calendar,
  Clock,
  Upload,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Switch } from "@heroui/react";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import useMember from "@/hooks/useMember";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────

interface WorkbenchFormData {
  businessImpact: string;
  businessImpactLevel: string;
  scopeOfImpact: string[];
  otherScope: string;
  regionsAffected: string[];
  tenantsAffected: string;
  affectedServices: string[];
  detectionDate: string;
  detectionTime: string;
  startDate: string;
  startTime: string;
  estimatedEndDate: string;
  estimatedEndTime: string;
  unknownEndTime: boolean;
  rootCause: string;
  mitigation: string;
  riskJustification: string;
  incidentCommander: string;
  technicalLead: string;
  commsLead: string;
  communicationPlan: string;
  stakeholdersNotified: string;
  initiateWarRoom: boolean;
  additionalContext: string;
  attachments: File[];
}

interface Props {
  incident: IncidentDetailRecord;
}

// ── Shared input style ────────────────────────────────────────────

const inputCls =
  "w-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors";

const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 mb-1 block">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);
const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">
    {children}
  </p>
);
const SelectInput = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none pr-8`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
    />
  </div>
);
const SectionHead = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[14px] font-black text-zinc-900 dark:text-zinc-100 mb-4 mt-2">
    {children}
  </h3>
);

// ── Main component ────────────────────────────────────────────────

const MajorIncidentWorkbench: React.FC<Props> = ({ incident }) => {
  const { post, get } = useFetch();
  const queryClient = useQueryClient();
  const { data: members = [] } = useMember();
  const { data: serviceNodes = [] } = useQuery({
    queryKey: ["service-map-list"],
    queryFn: async () => {
      const res = await get(endpoint.service_map.list);
      return res.success ? (res.data?.data ?? []) : [];
    },
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();
  const memberOptions = [
    "",
    ...members.map(
      (m) => `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim() || m.email,
    ),
  ];

  const [form, setForm] = useState<WorkbenchFormData>({
    businessImpact: "",
    businessImpactLevel: "",
    scopeOfImpact: [],
    otherScope: "",
    regionsAffected: [],
    tenantsAffected: "",
    affectedServices: [],
    detectionDate: new Date().toLocaleDateString("en-CA"),
    detectionTime: "09:05am",
    startDate: new Date().toLocaleDateString("en-CA"),
    startTime: "09:05am",
    estimatedEndDate: "",
    estimatedEndTime: "",
    unknownEndTime: false,
    rootCause: "",
    mitigation: "",
    riskJustification: "",
    incidentCommander: "",
    technicalLead: "",
    commsLead: "",
    communicationPlan: "Slack",
    stakeholdersNotified: "",
    initiateWarRoom: true,
    additionalContext: "",
    attachments: [],
  });

  const set =
    <K extends keyof WorkbenchFormData>(key: K) =>
    (val: WorkbenchFormData[K]) =>
      setForm((p) => ({ ...p, [key]: val }));

  const toggleScope = (val: string) =>
    setForm((p) => ({
      ...p,
      scopeOfImpact: p.scopeOfImpact.includes(val)
        ? p.scopeOfImpact.filter((v) => v !== val)
        : [...p.scopeOfImpact, val],
    }));

  const { mutateAsync: declare, isPending } = useMutation({
    mutationFn: async () => {
      const attachmentMeta = form.attachments.map((f) => ({
        name: f.name,
        type: f.type,
      }));
      const res = await post(
        `${endpoint.incident_ticket.declare_major}/${incident.id}/declare-major`,
        {
          ...form,
          attachments: attachmentMeta,
        },
      );
      if (!res.success) throw new Error("Failed to declare");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Major Incident declared successfully");
      queryClient.invalidateQueries({ queryKey: ["incident", incident.id] });
      router.push(`/incident/workbench`);
    },
    onError: () => toast.error("Failed to declare Major Incident"),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setForm((p) => ({
      ...p,
      attachments: [...p.attachments, ...Array.from(files)],
    }));
  };

  const SCOPE_OPTIONS = [
    "Customer / External User",
    "Internal Users",
    "Multiple Business Units",
    "Third-Party / Partners",
    "Others",
  ];

  const REGIONS = [
    "US-EAST-1",
    "US-WEST-2",
    "EU-WEST-1",
    "EU-CENTRAL-1",
    "AP-SE-1",
    "SA-EAST-1",
    "Global",
  ];

  return (
    <div className="bg-white">
      <div className=" w-full mx-auto max-w-6xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        {/* Close */}

        {/* ── Header ── */}
        <div className="px-7 pt-7 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
            Workbench
          </p>
          <h1 className="text-[20px] font-black text-zinc-900 dark:text-zinc-100 mb-1">
            Declare Major Incident (Upgrade to P0)
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
            Upgrading this Incident to P0 will declare it as a Major Incident.
            Please provide the required information below.
          </p>
        </div>

        {/* ── Incident meta strip ── */}
        <div className="px-7 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-3 text-[12px]">
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 mb-0.5 font-medium">
                Incident ID
              </p>
              <p className="font-bold text-zinc-800 dark:text-zinc-100">
                {incident.ticketId}
              </p>
            </div>
            <div className="flex-1 min-w-[160px]">
              <p className="text-zinc-400 dark:text-zinc-500 mb-0.5 font-medium">
                Short Description
              </p>
              <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                {incident.title}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 mb-0.5 font-medium">
                Current Priority
              </p>
              <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded px-2 py-0.5">
                {incident.severity}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <ArrowRight size={14} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 mb-0.5 font-medium">
                Target Priority
              </p>
              <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded px-2 py-0.5">
                P0 (MAJOR INCIDENT)
              </span>
            </div>
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 mb-0.5 font-medium">
                Status
              </p>
              <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                {incident.status ?? "In Progress"}
              </p>
            </div>
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 mb-0.5 font-medium">
                Reported by
              </p>
              <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                {incident.assignedToName ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">
                Reported on
              </p>
              <p className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-200">
                {incident.createdAt
                  ? new Date(incident.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <button
              onClick={() =>
                window.open(`/incident/tickets?id${incident.id}`, "_blank")
              }
              className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors"
            >
              View Incident
            </button>
          </div>
        </div>

        {/* ── Two column body ── */}
        <div className="grid grid-cols-[1fr_260px] min-h-0">
          {/* ── Left — form ── */}
          <div className="px-7 py-6 border-r border-zinc-100 dark:border-zinc-800 space-y-7 overflow-y-auto">
            <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
              All starred fields are required to pass the declaration gate.
            </p>

            {/* ── Impact and Severity ── */}
            <div>
              <SectionHead>Impact and Severity</SectionHead>

              <div className="space-y-4">
                <div>
                  <FieldLabel required>Business Impact</FieldLabel>
                  <FieldHint>
                    Describe the impact to the business and affected services
                  </FieldHint>
                  <textarea
                    value={form.businessImpact}
                    onChange={(e) => set("businessImpact")(e.target.value)}
                    rows={3}
                    placeholder="eg. Customers are unable to complete transactions. Impacting online banking, mobile app and payments"
                    className={`${inputCls} resize-none leading-relaxed`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Business impact level</FieldLabel>
                    <FieldHint>When did the impact begin?</FieldHint>
                    <SelectInput
                      value={form.businessImpactLevel}
                      onChange={set("businessImpactLevel")}
                      placeholder="Select"
                      options={["Critical", "High", "Medium", "Low"]}
                    />
                  </div>
                  <div>
                    <FieldLabel>SLO burn rate</FieldLabel>
                    <FieldHint>
                      No observability integration is connected yet.
                    </FieldHint>
                    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-[13px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/30">
                      Not available
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel required>Scope of Impact</FieldLabel>
                  <FieldHint>Who and What is affected?</FieldHint>
                  <div className="space-y-2">
                    {SCOPE_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.scopeOfImpact.includes(opt)}
                          onChange={() => toggleScope(opt)}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 accent-emerald-500"
                        />
                        <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
                          {opt}
                        </span>
                        {opt === "Others" &&
                          form.scopeOfImpact.includes("Others") && (
                            <input
                              type="text"
                              value={form.otherScope}
                              onChange={(e) =>
                                set("otherScope")(e.target.value)
                              }
                              placeholder="Please Specify"
                              className={`${inputCls} flex-1`}
                            />
                          )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Regions affected (optional)</FieldLabel>
                    <SelectInput
                      value={form.regionsAffected[0] ?? ""}
                      onChange={(v) => set("regionsAffected")([v])}
                      placeholder="Select regions"
                      options={REGIONS}
                    />
                  </div>
                  <div>
                    <FieldLabel>Tenants affected (optional)</FieldLabel>
                    <input
                      type="text"
                      value={form.tenantsAffected}
                      onChange={(e) => set("tenantsAffected")(e.target.value)}
                      placeholder="Type a tenant and press enter"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Affected Services</FieldLabel>
                  <FieldHint>
                    {serviceNodes.length > 0
                      ? "Resolved from the service dependency graph."
                      : "No services have been registered in the service map yet."}
                  </FieldHint>
                  <SelectInput
                    value={form.affectedServices[0] ?? ""}
                    onChange={(v) => set("affectedServices")([v])}
                    placeholder="Select"
                    options={serviceNodes.map((s: { name: string }) => s.name)}
                  />
                </div>
              </div>
            </div>

            {/* ── Timeline ── */}
            <div>
              <SectionHead>Timeline</SectionHead>
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Detection time</FieldLabel>
                  <FieldHint>
                    When Scrubbe / on-call first detected it.
                  </FieldHint>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={form.detectionDate}
                        onChange={(e) => set("detectionDate")(e.target.value)}
                        className={`${inputCls} pr-8`}
                      />
                      <Calendar
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.detectionTime}
                        onChange={(e) => set("detectionTime")(e.target.value)}
                        placeholder="09:05am"
                        className={`${inputCls} pr-8`}
                      />
                      <Clock
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel required>Start Time of Impact</FieldLabel>
                  <FieldHint>When did the impact begin?</FieldHint>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => set("startDate")(e.target.value)}
                        className={`${inputCls} pr-8`}
                      />
                      <Calendar
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.startTime}
                        onChange={(e) => set("startTime")(e.target.value)}
                        placeholder="09:05am"
                        className={`${inputCls} pr-8`}
                      />
                      <Clock
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Estimated End Time (if Known)</FieldLabel>
                  <FieldHint>
                    When do you expect the impact to be resolved
                  </FieldHint>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="relative">
                      <input
                        type="date"
                        value={form.estimatedEndDate}
                        onChange={(e) =>
                          set("estimatedEndDate")(e.target.value)
                        }
                        disabled={form.unknownEndTime}
                        className={`${inputCls} pr-8 disabled:opacity-40`}
                        placeholder="Select date (if known)"
                      />
                      <Calendar
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.estimatedEndTime}
                        onChange={(e) =>
                          set("estimatedEndTime")(e.target.value)
                        }
                        disabled={form.unknownEndTime}
                        className={`${inputCls} pr-8 disabled:opacity-40`}
                        placeholder="Select time (if known)"
                      />
                      <Clock
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.unknownEndTime}
                      onChange={(e) => set("unknownEndTime")(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
                      Unknown at this time
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Diagnosis & response ── */}
            <div>
              <SectionHead>Diagnosis &amp; response</SectionHead>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Root Cause (as known)</FieldLabel>
                  <FieldHint>
                    What is the known or suspected root cause?
                  </FieldHint>
                  <textarea
                    value={form.rootCause}
                    onChange={(e) => set("rootCause")(e.target.value)}
                    rows={3}
                    placeholder="e.g Database degradation due to high load"
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <FieldLabel>Mitigation/Workaround</FieldLabel>
                  <FieldHint>
                    What services are being taken to mitigate the impact?
                  </FieldHint>
                  <textarea
                    value={form.mitigation}
                    onChange={(e) => set("mitigation")(e.target.value)}
                    rows={3}
                    placeholder="e.g scaling database, engaging vendor support"
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <FieldLabel required>
                    Risk justification for P0 upgrade
                  </FieldLabel>
                  <FieldHint>
                    Why does this warrant a Major Incident? This rationale is
                    recorded with the approval.
                  </FieldHint>
                  <textarea
                    value={form.riskJustification}
                    onChange={(e) => set("riskJustification")(e.target.value)}
                    rows={3}
                    placeholder="e.g Customer failing transactions failing across all channels; SLO error budget exhausted."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* ── Roles & Ownership ── */}
            <div>
              <SectionHead>Roles &amp; Ownership</SectionHead>
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Incident Commander</FieldLabel>
                  <FieldHint>Owns all decisions.</FieldHint>
                  <SelectInput
                    value={form.incidentCommander}
                    onChange={set("incidentCommander")}
                    placeholder="Select"
                    options={memberOptions.filter(Boolean)}
                  />
                </div>
                <div>
                  <FieldLabel>Technical Lead (optional)</FieldLabel>
                  <FieldHint>Validates root-cause hypothesis</FieldHint>
                  <SelectInput
                    value={form.technicalLead}
                    onChange={set("technicalLead")}
                    placeholder="Select"
                    options={memberOptions.filter(Boolean)}
                  />
                </div>
                <div>
                  <FieldLabel>Comms Lead (optional)</FieldLabel>
                  <FieldHint>Owns internal &amp; external updates.</FieldHint>
                  <SelectInput
                    value={form.commsLead}
                    onChange={set("commsLead")}
                    placeholder="Select"
                    options={memberOptions.filter(Boolean)}
                  />
                </div>
              </div>
            </div>

            {/* ── Communication & Notifications ── */}
            <div>
              <SectionHead>Communication &amp; Notifications</SectionHead>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Communication Plan</FieldLabel>
                  <FieldHint>
                    How will updates be communicated to stakeholders?
                  </FieldHint>
                  <SelectInput
                    value={form.communicationPlan}
                    onChange={set("communicationPlan")}
                    options={[
                      "Slack",
                      "Microsoft Teams",
                      "Email",
                      "PagerDuty",
                      "Statuspage",
                    ]}
                  />
                </div>
                <div>
                  <FieldLabel>Stakeholders Notified (So far)</FieldLabel>
                  <FieldHint>List key stakeholders or group notified</FieldHint>
                  <input
                    type="text"
                    value={form.stakeholdersNotified}
                    onChange={(e) =>
                      set("stakeholdersNotified")(e.target.value)
                    }
                    placeholder="eg Leadership, Support Teams, Product Owners"
                    className={inputCls}
                  />
                </div>
                <div className="flex items-start justify-between border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/40">
                  <div className="flex-1 pr-4">
                    <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">
                      Initiate war room / bridge on declaration
                    </p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Auto-create the incident room, exec channel and
                      engineering deep-dive, and start a bridge call.
                    </p>
                  </div>
                  <Switch
                    isSelected={form.initiateWarRoom}
                    onChange={(e) => set("initiateWarRoom")(e.target.checked)}
                    color="success"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* ── Additional Context ── */}
            <div>
              <SectionHead>Additional Context</SectionHead>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Anything else to add?</FieldLabel>
                  <FieldHint>
                    Provide any additional information that may be helpful
                  </FieldHint>
                  <textarea
                    value={form.additionalContext}
                    onChange={(e) => set("additionalContext")(e.target.value)}
                    rows={3}
                    placeholder="Additional context, links, attachments etc"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div>
                  <FieldLabel>Attachments (optional)</FieldLabel>
                  <FieldHint>
                    Add any relevant documents, screenshots or logs
                  </FieldHint>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed px-6 py-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragOver
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/5"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/20 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <Upload size={20} className="text-zinc-400 mb-2" />
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      Drag and drop files here or{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                        Browse
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                      Max file size 50mb. Allowed types: PDF, PNG, JPG, TXT,
                      LOG, ZIP
                    </p>
                    {form.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {form.attachments.map((f, i) => (
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
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.log,.zip"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
              </div>
            </div>

            {/* Required note */}
            <div className="flex items-center gap-2 text-[12px] text-zinc-400 dark:text-zinc-500">
              <Info size={13} />
              <span>
                Fields marked with{" "}
                <span className="text-red-500 font-bold">*</span> are required
              </span>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="px-5 py-6 space-y-5 bg-zinc-50 dark:bg-zinc-900/30">
            {/* Warning */}
            <div className="border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle
                  size={14}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400">
                  Declaring a Major Incident
                </p>
              </div>
              <p className="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed mb-2">
                Upgrading to P0 will automatically declare this as a Major
                Incident.
              </p>
              <ul className="space-y-1 text-[12px] text-amber-700 dark:text-amber-300 mb-2">
                {[
                  "This will initiate major incident procedures.",
                  "It will be visible in the major incidents workbench",
                  "Stakeholders and Subscribers will be notified",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-1.5">
                    <span className="mt-0.5 shrink-0">·</span>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Please provide accurate information before proceeding.
              </p>
            </div>

            {/* What happens next */}
            <div className="border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 rounded-xl p-4">
              <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 mb-3">
                What happens next?
              </p>
              <div className="space-y-3">
                {[
                  {
                    n: 1,
                    title: "Major Incident will be declared",
                    sub: "Incident priority will be set to P0 automatically.",
                  },
                  {
                    n: 2,
                    title: "Notifications will be sent",
                    sub: "Subscribers and stakeholders will be notified.",
                  },
                  {
                    n: 3,
                    title: "Major incident bridge may be initiated",
                    sub: "A bridge call or war room may be started.",
                  },
                  {
                    n: 4,
                    title: "Updates and communications",
                    sub: "Regular updates will be expected.",
                  },
                ].map(({ n, title, sub }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">
                      {n}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">
                        {title}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div className="border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 rounded-xl p-4">
              <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                What happens next?
              </p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                Review our Major Incident Management policy and guidelines
                before declaring.
              </p>
              <button
                onClick={() => router.push("/incident/policies")}
                className="w-full py-2.5 rounded-xl border border-emerald-500 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors"
              >
                View Guidelines
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end px-7 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => declare()}
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending
                ? "Declaring…"
                : "Declare Major Incident (Upgrade to P0)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MajorIncidentWorkbench;
