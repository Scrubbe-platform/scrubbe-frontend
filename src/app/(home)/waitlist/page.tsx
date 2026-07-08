// app/early-access/page.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Mail,
  Briefcase,
  Building,
  Globe,
  Linkedin,
  Users,
  Tag,
  Cloud,
  Layers,
  Code,
  BarChart3,
  Bell,
  ShieldCheck,
  Clock,
  Eye,
  Settings,
  Puzzle,
  FileText,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Edit3,
  ChevronDown,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// ─── ZOD VALIDATION SCHEMA DEFINITION ───────────────────────────────────────
const earlyAccessSchema = z.object({
  // Personal Information (Required)
  fullName: z.string().min(1, "Full name is required"),
  workEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Please provide a valid work email"),
  jobTitle: z.string().min(1, "Job title is required"),

  // Company Information (Required)
  company: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().min(1, "Company website is required"),
  companySize: z.string().min(1, "Please select your company size"),
  industry: z.string().min(1, "Please select an industry"),
  country: z.string().min(1, "Please select your country"),

  // Engineering Environment (Required)
  cloudProvider: z.string().min(1, "Please select a cloud provider"),
  deploymentModel: z.string().min(1, "Please select a deployment model"),
  primaryLanguage: z
    .string()
    .min(1, "Please select a primary programming language"),
  observabilityStack: z.string().min(1, "Please select an observability stack"),
  incidentPlatform: z
    .string()
    .min(1, "Please select an incident management platform"),

  // Optional Metrics & Configurations
  linkedin: z.string().optional(),
  challenges: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  incidentsPerMonth: z.string().optional(),
  teamSize: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type EarlyAccessFormValues = z.infer<typeof earlyAccessSchema>;

const CHALLENGES_PRESETS = [
  {
    id: "slow_response",
    label: "Slow incident response",
    icon: <Clock size={14} />,
  },
  { id: "too_many_alerts", label: "Too many alerts", icon: <Bell size={14} /> },
  {
    id: "manual_investigation",
    label: "Manual investigation",
    icon: <User size={14} />,
  },
  { id: "high_mttr", label: "High MTTR", icon: <Layers size={14} /> },
  {
    id: "poor_visibility",
    label: "Poor root cause visibility",
    icon: <Eye size={14} />,
  },
  {
    id: "lack_automation",
    label: "Lack of automation",
    icon: <Settings size={14} />,
  },
  {
    id: "fragmented_tooling",
    label: "Fragmented tooling",
    icon: <Puzzle size={14} />,
  },
  {
    id: "operational_governance",
    label: "Operational governance",
    icon: <ShieldCheck size={14} />,
  },
  { id: "compliance", label: "Compliance", icon: <FileText size={14} /> },
  {
    id: "executive_reporting",
    label: "Executive reporting",
    icon: <BarChart3 size={14} />,
  },
  {
    id: "knowledge_gaps",
    label: "Skill / knowledge gaps",
    icon: <HelpCircle size={14} />,
  },
  { id: "other", label: "Other", icon: <MessageSquare size={14} /> },
];

const INTERESTS_PRESETS = [
  { id: "ai_investigation", label: "AI Incident Investigation" },
  { id: "causal_engine", label: "Causal Reconstruction Engine" },
  { id: "incident_delivery", label: "Incident Delivery" },
  { id: "playbooks_automation", label: "Playbooks & Automation" },
  { id: "operational_rules", label: "Operational Rules" },
  { id: "decision_center", label: "Decision Center" },
  { id: "war_rooms", label: "War Rooms" },
  { id: "ai_agents", label: "AI Agents" },
  { id: "incident_coach", label: "Incident Coach" },
  { id: "iqa", label: "Incident Quality Assurance" },
];

export default function ScrubbeEarlyAccessPage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EarlyAccessFormValues>({
    resolver: zodResolver(earlyAccessSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      jobTitle: "",
      company: "",
      companyWebsite: "",
      linkedin: "",
      challenges: [],
      interests: [],
      companySize: "",
      industry: "",
      country: "",
      cloudProvider: "",
      deploymentModel: "",
      primaryLanguage: "",
      observabilityStack: "",
      incidentPlatform: "",
      incidentsPerMonth: "",
      teamSize: "",
      additionalNotes: "",
    },
  });

  const activeChallenges = watch("challenges") || [];

  const handleToggleChallenge = (id: string) => {
    if (activeChallenges.includes(id)) {
      setValue(
        "challenges",
        activeChallenges.filter((c) => c !== id),
      );
    } else {
      setValue("challenges", [...activeChallenges, id]);
    }
  };

  const onSubmitForm = (data: EarlyAccessFormValues) => {
    console.log("Committed Early Access Dataset Context Matrix: ", data);
    alert("Application data validated securely via Zod!");
  };

  return (
    <div className="min-h-screen bg-[#071311] bg-radial-gradient text-white select-none pb-12 font-ibm antialiased">
      {/* ─── MAIN HERO BRAND OVERVIEW STRIP ─── */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center relative space-y-6">
        {/* Logo element branding */}
        <div className="flex items-center justify-center gap-2 select-none">
          <motion.div
            key="logo-full"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-20 w-[160px] shrink-0 relative"
          >
            <Image
              src="/IMS/whitelogo.png"
              alt="scrubbe"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>

        {/* Headings aligned to original asset proportions */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl tracking-tight text-white leading-tight">
            Join the Scrubbe <br className="sm:hidden" />
            <span className="text-emerald-400 font-bold px-1">
              Early Access
            </span>{" "}
            Program
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed pt-1">
            Be among the first engineering teams to experience autonomous
            incident response powered by AI agents that investigate,
            reconstruct, and resolve—faster.
          </p>
        </div>
      </div>

      {/* ─── CENTRAL DATA CAPTURE CARD CONTAINER ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl text-zinc-900 shadow-2xl p-6 sm:p-10 border border-zinc-100 relative overflow-hidden">
          {/* Card Context Header Split line banner elements */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-zinc-100 gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                  Request Early Access
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5 max-w-sm leading-normal">
                  Tell us about your team so we can prioritize and personalize
                  your early access experience.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN DUAL SPLIT FORM CHANNELS GRID GRID */}
          <form
            onSubmit={handleSubmit(onSubmitForm)}
            className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8 items-start"
          >
            {/* ========================================================
                LEFT FORM STRIP: DATA PRIMARY SYSTEM ATTRIBUTES
                ======================================================== */}
            <div className="space-y-6">
              {/* SECTION BLOCK 1: YOUR INFORMATION */}
              <div className="space-y-3.5">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  Your Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 relative">
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        {...register("fullName")}
                        placeholder="Full Name"
                        className={`w-full h-10 pl-10 pr-3 text-xs font-semibold border rounded-xl outline-none focus:border-emerald-500 bg-white ${errors.fullName ? "border-red-500" : "border-zinc-200"}`}
                      />
                    </div>
                    {errors.fullName && (
                      <span className="text-[11px] text-red-500 font-medium pl-1">
                        {errors.fullName.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 relative">
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="email"
                        {...register("workEmail")}
                        placeholder="Work Email"
                        className={`w-full h-10 pl-10 pr-3 text-xs font-semibold border rounded-xl outline-none focus:border-emerald-500 bg-white ${errors.workEmail ? "border-red-500" : "border-zinc-200"}`}
                      />
                    </div>
                    {errors.workEmail && (
                      <span className="text-[11px] text-red-500 font-medium pl-1">
                        {errors.workEmail.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <Briefcase
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="text"
                      {...register("jobTitle")}
                      placeholder="Job Title"
                      className={`w-full h-10 pl-10 pr-3 text-xs font-semibold border rounded-xl outline-none focus:border-emerald-500 bg-white ${errors.jobTitle ? "border-red-500" : "border-zinc-200"}`}
                    />
                  </div>
                  {errors.jobTitle && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.jobTitle.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 relative">
                    <div className="relative">
                      <Building
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        {...register("company")}
                        placeholder="Company"
                        className={`w-full h-10 pl-10 pr-3 text-xs font-semibold border rounded-xl outline-none focus:border-emerald-500 bg-white ${errors.company ? "border-red-500" : "border-zinc-200"}`}
                      />
                    </div>
                    {errors.company && (
                      <span className="text-[11px] text-red-500 font-medium pl-1">
                        {errors.company.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 relative">
                    <div className="relative">
                      <Globe
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        {...register("companyWebsite")}
                        placeholder="Company Website"
                        className={`w-full h-10 pl-10 pr-3 text-xs font-semibold border rounded-xl outline-none focus:border-emerald-500 bg-white ${errors.companyWebsite ? "border-red-500" : "border-zinc-200"}`}
                      />
                    </div>
                    {errors.companyWebsite && (
                      <span className="text-[11px] text-red-500 font-medium pl-1">
                        {errors.companyWebsite.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Linkedin
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="url"
                    {...register("linkedin")}
                    placeholder="LinkedIn (optional)"
                    className="w-full h-10 pl-10 pr-3 text-xs font-semibold border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* SECTION BLOCK 2: COMPANY INFORMATION */}
              <div className="space-y-3.5">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  Company Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 relative">
                    <div className="relative">
                      <Users
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <select
                        {...register("companySize")}
                        className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.companySize ? "border-red-500" : "border-zinc-200"}`}
                      >
                        <option value="">Company Size</option>
                        {[
                          "1-10",
                          "11-50",
                          "51-200",
                          "201-500",
                          "501-2000",
                          "2000+",
                        ].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt} employees
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                    {errors.companySize && (
                      <span className="text-[11px] text-red-500 font-medium pl-1">
                        {errors.companySize.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 relative">
                    <div className="relative">
                      <Tag
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <select
                        {...register("industry")}
                        className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.industry ? "border-red-500" : "border-zinc-200"}`}
                      >
                        <option value="">Industry</option>
                        {[
                          "Technology",
                          "Finance",
                          "Healthcare",
                          "E-commerce",
                          "SaaS",
                          "Telecommunications",
                          "Other",
                        ].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                    {errors.industry && (
                      <span className="text-[11px] text-red-500 font-medium pl-1">
                        {errors.industry.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <Globe
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("country")}
                      className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.country ? "border-red-500" : "border-zinc-200"}`}
                    >
                      <option value="">Country</option>
                      {[
                        "United States",
                        "United Kingdom",
                        "Canada",
                        "Germany",
                        "France",
                        "Turkey",
                        "Other",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.country && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.country.message}
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION BLOCK 3: ENGINEERING ENVIRONMENT */}
              <div className="space-y-3.5">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  Engineering Environment
                </span>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <Cloud
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("cloudProvider")}
                      className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.cloudProvider ? "border-red-500" : "border-zinc-200"}`}
                    >
                      <option value="">Cloud Providers</option>
                      {[
                        "AWS",
                        "Google Cloud (GCP)",
                        "Azure",
                        "On-Premises",
                        "Hybrid",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.cloudProvider && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.cloudProvider.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <Layers
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("deploymentModel")}
                      className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.deploymentModel ? "border-red-500" : "border-zinc-200"}`}
                    >
                      <option value="">Deployment Model</option>
                      {[
                        "Kubernetes / EKS / GKE",
                        "Serverless (Lambda/Cloud Functions)",
                        "Traditional VM / EC2 Instances",
                        "Bare Metal",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.deploymentModel && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.deploymentModel.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <Code
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("primaryLanguage")}
                      className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.primaryLanguage ? "border-red-500" : "border-zinc-200"}`}
                    >
                      <option value="">Primary Programming Languages</option>
                      {[
                        "TypeScript / JavaScript",
                        "Go (Golang)",
                        "Python",
                        "Java",
                        "Rust",
                        "C++",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.primaryLanguage && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.primaryLanguage.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <BarChart3
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("observabilityStack")}
                      className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.observabilityStack ? "border-red-500" : "border-zinc-200"}`}
                    >
                      <option value="">Observability Stack</option>
                      {[
                        "Datadog",
                        "Prometheus + Grafana",
                        "New Relic",
                        "Dynatrace",
                        "Splunk",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.observabilityStack && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.observabilityStack.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 relative">
                  <div className="relative">
                    <Bell
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("incidentPlatform")}
                      className={`w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border rounded-xl outline-none appearance-none cursor-pointer ${errors.incidentPlatform ? "border-red-500" : "border-zinc-200"}`}
                    >
                      <option value="">Incident Management Platform</option>
                      {[
                        "PagerDuty",
                        "Opsgenie",
                        "Splunk On-Call",
                        "FireHydrant",
                        "Manual Slack Alerting",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                  {errors.incidentPlatform && (
                    <span className="text-[11px] text-red-500 font-medium pl-1">
                      {errors.incidentPlatform.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================
                RIGHT FORM STRIP: COMPLIANCE READINESS CHIPS & CHECKLISTS
                ======================================================== */}
            <div className="space-y-6">
              {/* MULTISELECT 1: CURRENT CHALLENGES CHIPS MATRIX */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  Current Challenges{" "}
                  <span className="text-zinc-400 font-medium lowercase">
                    (Select all that apply)
                  </span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CHALLENGES_PRESETS.map((item) => {
                    const selected = activeChallenges.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleChallenge(item.id)}
                        className={`h-9 border px-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                          selected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={
                            selected ? "text-emerald-600" : "text-zinc-400"
                          }
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHECKLIST CHECKBOX LAYER: WHAT INTERESTS YOU MOST */}
              <div className="space-y-3.5">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  What Interests You Most?{" "}
                  <span className="text-zinc-400 font-medium lowercase">
                    (Select all that apply)
                  </span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTERESTS_PRESETS.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2.5 px-3 py-2 border rounded-xl bg-zinc-50/50 hover:bg-zinc-50 border-zinc-100 cursor-pointer transition-colors text-xs font-semibold text-zinc-700"
                    >
                      <input
                        type="checkbox"
                        value={item.id}
                        {...register("interests")}
                        className="accent-emerald-600 h-3.5 w-3.5 rounded border-zinc-300"
                      />
                      <span className="truncate">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION BLOCK 4: ABOUT YOUR INCIDENTS */}
              <div className="space-y-3.5">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  About Your Incidents
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Activity
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("incidentsPerMonth")}
                      className="w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Production incidents per month</option>
                      {["0-5", "6-20", "21-50", "51-100", "100+"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt} events
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>

                  <div className="relative">
                    <Users
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <select
                      {...register("teamSize")}
                      className="w-full h-10 pl-10 pr-8 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-xl outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Engineering team size</option>
                      {["1-5", "6-20", "21-100", "101-500", "500+"].map(
                        (opt) => (
                          <option key={opt} value={opt}>
                            {opt} engineers
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* TEXTAREA PRIMARY BLOCK: TELL US MORE */}
              <div className="space-y-2">
                <span className="text-[10.5px] font-bold text-emerald-600 tracking-wider block uppercase">
                  Tell Us More{" "}
                  <span className="text-zinc-400 font-medium lowercase">
                    (Optional)
                  </span>
                </span>
                <div className="relative">
                  <Edit3
                    size={14}
                    className="absolute left-3.5 top-3 text-zinc-400"
                  />
                  <textarea
                    rows={3}
                    {...register("additionalNotes")}
                    placeholder="Share your top incident response challenges and how Scrubbe can help your team."
                    className="w-full pl-10 pr-3 py-2.5 text-xs font-medium border border-zinc-200 rounded-xl bg-white outline-none leading-relaxed resize-none text-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* FULL LENGTH FOOTER SUBMISSION LAYOUT DECK ROW */}
            <div className="lg:col-span-2 pt-6 border-t text-center space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#00C896] hover:bg-[#02b386] disabled:opacity-50 text-[#071311] font-bold text-sm flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-500/10 active:scale-98 transition-all"
              >
                {isSubmitting
                  ? "Submitting Request..."
                  : "Request Early Access →"}
              </button>
              <p className="text-[11.5px] text-zinc-400 font-medium max-w-lg mx-auto leading-normal">
                Our team reviews every application to ensure we onboard
                organizations where Scrubbe can deliver the most value.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
