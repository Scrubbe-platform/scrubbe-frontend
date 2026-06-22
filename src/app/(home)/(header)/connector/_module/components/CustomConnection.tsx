"use client";

import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import React, { useState } from "react";
export type WorkbenchStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface KeyValueMappingRow {
  id: string;
  sourceKey: string;
  targetValue: string;
}

export interface CustomConnectorForm {
  name: string;
  description: string;
  category: string;
  businessOwner: string;
  connectionType: string;
  baseUrl: string;
  authMethod: string;
  clientCredentialId: string;
  secret: string;
  supportedEventTypes: string[];
  eventMappings: KeyValueMappingRow[];
  serviceMappings: KeyValueMappingRow[];
  environmentMappings: KeyValueMappingRow[];
  downstreamConsumers: string[];
  signalImportance: "Informational" | "Low" | "Medium" | "High" | "Critical";
}

interface CustomConnectorWorkbenchProps {
  onNotifyToast: (message: string) => void;
}

export default function CustomConnectorWorkbench() {
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkbenchStep>(1);

  // --- Initial Form State Matching The HTML Data Payload Defaults Exactly ---
  const [formData, setFormData] = useState<CustomConnectorForm>({
    name: "",
    description: "",
    category: "Source Control",
    businessOwner: "Platform Engineering",
    connectionType: "REST API",
    baseUrl: "",
    authMethod: "API Key",
    clientCredentialId: "",
    secret: "",
    supportedEventTypes: ["Deployment"],
    eventMappings: [
      {
        id: "1",
        sourceKey: "deployment.failed",
        targetValue: "Deployment Failure",
      },
      {
        id: "2",
        sourceKey: "release.promoted",
        targetValue: "Deployment Success",
      },
      {
        id: "3",
        sourceKey: "service.degraded",
        targetValue: "Service Health Alert",
      },
    ],
    serviceMappings: [
      { id: "1", sourceKey: "Payment-Service", targetValue: "Payment API" },
      { id: "2", sourceKey: "customer-api", targetValue: "Customer Service" },
    ],
    environmentMappings: [
      { id: "1", sourceKey: "production", targetValue: "Production" },
      { id: "2", sourceKey: "live", targetValue: "Production" },
      { id: "3", sourceKey: "prod-us-east", targetValue: "Production" },
    ],
    downstreamConsumers: ["Incident Detection", "Incident Enrichment"],
    signalImportance: "Medium",
  });

  // --- Row Manipulation Handlers for Mapping Interfaces ---
  const addMappingRow = (
    target: "eventMappings" | "serviceMappings" | "environmentMappings",
  ) => {
    const placeholders = {
      eventMappings: {
        sourceKey: "deployment.failed",
        targetValue: "Deployment Failure",
      },
      serviceMappings: {
        sourceKey: "Payment-Service",
        targetValue: "Payment API",
      },
      environmentMappings: {
        sourceKey: "production",
        targetValue: "Production",
      },
    };

    const newRow: KeyValueMappingRow = {
      id: Date.now().toString(),
      sourceKey: "",
      targetValue: "",
    };

    setFormData((prev) => ({ ...prev, [target]: [...prev[target], newRow] }));
  };

  const updateMappingRow = (
    target: "eventMappings" | "serviceMappings" | "environmentMappings",
    id: string,
    field: "sourceKey" | "targetValue",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [target]: prev[target].map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const removeMappingRow = (
    target: "eventMappings" | "serviceMappings" | "environmentMappings",
    id: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [target]: prev[target].filter((row) => row.id !== id),
    }));
  };

  const handleCheckboxChange = (
    target: "supportedEventTypes" | "downstreamConsumers",
    value: string,
    isChecked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [target]: isChecked
        ? [...prev[target], value]
        : prev[target].filter((item) => item !== value),
    }));
  };

  const handleCreateConnector = () => {
    if (!formData.name.trim()) {
      setCurrentStep(1);
      return;
    }
    setCurrentStep(7);
  };

  const activeMappingsCount = (
    target: "eventMappings" | "serviceMappings" | "environmentMappings",
  ) => {
    return formData[target].filter((r) => r.sourceKey.trim()).length;
  };

  function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
      <p
        className="text-[#1a1a1a] leading-tight"
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontStyle: "italic",
          fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
        }}
      >
        {children}
      </p>
    );
  }

  function SerHead({
    children,
    size = "lg",
    className = "",
  }: {
    children: React.ReactNode;
    size?: "lg" | "xl";
    className?: string;
  }) {
    return (
      <h2
        className={`text-[#0f0f0e] leading-tight ${className}`}
        style={{
          fontFamily: "'Georgia','Times New Roman',serif",
          fontSize:
            size === "xl"
              ? "clamp(2rem,3.5vw,2.75rem)"
              : "clamp(1.65rem,3vw,2.25rem)",
          fontWeight: 400,
        }}
      >
        {children}
      </h2>
    );
  }

  function MonoButton({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 px-5 py-3 border border-[#16a34a] text-[#16a34a] rounded-md text-[0.8125rem] tracking-wider hover:bg-[#f0fdf4] transition-colors"
        style={{ fontFamily: "monospace" }}
      >
        {children}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 4L5 7L8 4"
            stroke="#16a34a"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <section
      className="w-full py-16 px-6 bg-white border-t border-[#e5e7eb]"
      id="workbench"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
          <div className="sticky top-28 before:mb-4">
            <SectionLabel>
              Custom
              <br />
              Connector
              <br />
              Workbench
            </SectionLabel>
          </div>

          <div style={{ maxWidth: 640 }}>
            <SerHead size="lg" className="mb-5">
              Bring your own systems into the graph.
            </SerHead>
            <p className="mt-5 text-[#42413a] max-w-[62ch]">
              Internal platforms, legacy tooling, and bespoke services can be
              modelled directly. The workbench guides you from connectivity
              through event mapping, service correlation, and operational
              intelligence routing — so a custom source behaves exactly like a
              native one.
            </p>

            <div className="flex gap-[30px] items-center flex-wrap mt-[30px]">
              <MonoButton
                onClick={() => {
                  setIsWorkbenchOpen(!isWorkbenchOpen);
                  if (!isWorkbenchOpen) setCurrentStep(1);
                }}
              >
                {isWorkbenchOpen
                  ? "Close Workbench"
                  : "Create Custom Connector"}
                <svg
                  className="w-[15px] h-[15px] transform group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </MonoButton>
            </div>

            {/* EXPANDABLE WORKBENCH GRID BOX SYSTEM */}
            {isWorkbenchOpen && (
              <div className="mt-10 border-t-[1.5px] border-[#15140f] pt-[30px] animate-wzin">
                <div className="flex justify-between items-baseline flex-wrap gap-3.5">
                  <span className="font-serif text-2xl sm:text-3xl font-normal">
                    Custom Connector Workbench
                  </span>
                  <button onClick={() => setIsWorkbenchOpen(false)}>
                    Close ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-[54px] mt-[30px] items-start">
                  {/* INTERACTIVE NAVIGATION CONTROL RAIL */}
                  <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible border-t border-[#efece4] sticky top-[100px] z-10 bg-[#faf9f6] md:bg-transparent">
                    {(
                      [
                        { step: 1, label: "Connector Information" },
                        { step: 2, label: "Connectivity" },
                        { step: 3, label: "Event Mapping" },
                        { step: 4, label: "Service Correlation" },
                        { step: 5, label: "Intelligence Mapping" },
                        { step: 6, label: "Review & Create" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.step}
                        type="button"
                        disabled={currentStep === 7}
                        onClick={() => setCurrentStep(s.step)}
                        className={`flex gap-3.5 items-baseline w-full text-left py-[15px] border-b border-[#efece4] transition-all whitespace-nowrap px-3 md:px-0 hover:pl-1.5 ${
                          currentStep === s.step
                            ? "font-medium border-b-2 md:border-b-[#15140f]"
                            : ""
                        }`}
                      >
                        <span
                          className={`font-mono text-xs ${currentStep === s.step ? "text-[#1a4dd8]" : "text-[#9d9a8f]"}`}
                        >
                          0{s.step}
                        </span>
                        <span
                          className={`font-serif text-lg ${currentStep === s.step ? "text-[#15140f]" : "text-[#6e6c63]"}`}
                        >
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* DYNAMIC FORM STEPS CONTENT ENGINE */}
                  <div className="w-full max-w-[660px] min-h-[300px]">
                    {/* STEP 1: GENERAL METADATA CONNECTOR INFO */}
                    {currentStep === 1 && (
                      <div className="space-y-7 animate-wzin">
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                          Connector Information
                        </h3>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Connector name{" "}
                            <span className="text-[#1a4dd8]">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Internal Deployment Platform"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                name: e.target.value,
                              }))
                            }
                          />
                          <span className="text-[13.5px] text-[#9d9a8f] font-light">
                            e.g. Internal Deployment Platform · Acme Monitoring
                            · CorpBuild · Legacy Operations Hub
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Description
                          </label>
                          <TextArea
                            rows={2}
                            placeholder="Provides deployment and release events from Acme's internal deployment platform."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                          <span className="text-[13.5px] text-[#9d9a8f] font-light">
                            A short explanation of what the connector does.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[26px_34px]">
                          <div className="flex flex-col gap-2">
                            <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                              Connector category
                            </label>
                            <select
                              value={formData.category}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  category: e.target.value,
                                }))
                              }
                              className="w-full border-none border-b border-[#e3e0d6] bg-transparent py-2.5 text-[17px] font-light text-[#15140f] outline-none cursor-pointer focus:border-[#1a4dd8]"
                            >
                              {[
                                "Source Control",
                                "CI/CD",
                                "Deployment",
                                "Infrastructure",
                                "Monitoring",
                                "Observability",
                                "Incident Management",
                                "Security",
                                "Collaboration",
                                "Ticketing",
                                "Database",
                                "Cloud Platform",
                                "Custom",
                              ].map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                              Business owner
                            </label>
                            <Input
                              type="text"
                              placeholder="Platform Engineering"
                              value={formData.businessOwner}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  businessOwner: e.target.value,
                                }))
                              }
                            />
                            <span className="text-[13.5px] text-[#9d9a8f] font-light">
                              The team responsible for this connector.
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#efece4] pt-6 mt-10">
                          <span />
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: NETWORK CONNECTIVITY ENDPOINTS AND AUTH */}
                    {currentStep === 2 && (
                      <div className="space-y-7 animate-wzin">
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                          Connectivity
                        </h3>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Connection type
                          </label>
                          <div className="flex flex-wrap gap-[14px_28px] mt-1">
                            {[
                              "REST API",
                              "GraphQL API",
                              "Webhook",
                              "Message Queue",
                              "Kafka",
                              "RabbitMQ",
                              "Database",
                              "Custom SDK",
                            ].map((type) => (
                              <label
                                key={type}
                                className="inline-flex items-center gap-2.5 text-[16px] text-[#42413a] cursor-pointer relative font-light"
                              >
                                <Input
                                  type="radio"
                                  name="ctype"
                                  value={type}
                                  checked={formData.connectionType === type}
                                  onChange={() =>
                                    setFormData((p) => ({
                                      ...p,
                                      connectionType: type,
                                    }))
                                  }
                                  className="accent-[#1a4dd8]"
                                />
                                {type}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Base URL
                          </label>
                          <Input
                            type="text"
                            placeholder="https://api.company.com"
                            value={formData.baseUrl}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                baseUrl: e.target.value,
                              }))
                            }
                            className="w-full border-none border-b border-[#e3e0d6] bg-transparent py-2.5 text-[17px] font-light text-[#15140f] outline-none focus:border-[#1a4dd8] transition-colors font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Authentication method
                          </label>
                          <select
                            value={formData.authMethod}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                authMethod: e.target.value,
                              }))
                            }
                            className="w-full border-none border-b border-[#e3e0d6] bg-transparent py-2.5 text-[17px] font-light text-[#15140f] outline-none cursor-pointer focus:border-[#1a4dd8]"
                          >
                            {[
                              "API Key",
                              "Bearer Token",
                              "OAuth 2.0",
                              "Basic Authentication",
                              "JWT",
                              "Mutual TLS",
                            ].map((method) => (
                              <option key={method} value={method}>
                                {method}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[26px_34px]">
                          <div className="flex flex-col gap-2">
                            <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                              Credential / client ID
                            </label>
                            <Input
                              type="password"
                              placeholder="••••••••••••"
                              value={formData.clientCredentialId}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  clientCredentialId: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                              Secret
                            </label>
                            <Input
                              type="password"
                              placeholder="••••••••••••"
                              value={formData.secret}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  secret: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 text-[12.5px] text-[#9d9a8f] font-mono tracking-wider mt-3.5 bg-[#f5f5f4]/30 p-2 rounded">
                          <svg
                            className="w-3.5 h-3.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Credentials are stored vault-backed, encrypted at
                          rest, and never exposed to assistants.
                        </div>

                        <div className="flex justify-between items-center border-t border-[#efece4] pt-6 mt-10">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="font-mono text-[13px] tracking-wider uppercase text-[#6e6c63] hover:text-[#15140f]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CANONICAL EVENTS DICTIONARY MAPPING */}
                    {currentStep === 3 && (
                      <div className="space-y-7 animate-wzin">
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                          Event Mapping
                        </h3>
                        <p className="text-[16.5px] text-[#42413a] font-light">
                          This is where Scrubbe becomes powerful. Map incoming
                          events into Scrubbe's canonical model.
                        </p>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Supported event types
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_24px] mt-1">
                            {[
                              "Alert",
                              "Deployment",
                              "Build",
                              "Incident",
                              "Approval",
                              "Change",
                              "Rollback",
                              "Security Finding",
                              "Service Health",
                              "Infrastructure Event",
                              "Database Event",
                              "Custom Event",
                            ].map((eType) => (
                              <label
                                key={eType}
                                className="inline-flex items-center gap-2.5 text-[16px] text-[#42413a] cursor-pointer font-light"
                              >
                                <Input
                                  type="checkbox"
                                  value={eType}
                                  checked={formData.supportedEventTypes.includes(
                                    eType,
                                  )}
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      "supportedEventTypes",
                                      eType,
                                      e.target.checked,
                                    )
                                  }
                                  className="accent-[#1a4dd8] w-4 h-4 rounded-[3px]"
                                />
                                {eType}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Event mapping — external event → canonical model
                          </label>
                          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                            {formData.eventMappings.map((row) => (
                              <div
                                key={row.id}
                                className="flex items-center gap-4"
                              >
                                <Input
                                  type="text"
                                  placeholder="deployment.failed"
                                  value={row.sourceKey}
                                  onChange={(e) =>
                                    updateMappingRow(
                                      "eventMappings",
                                      row.id,
                                      "sourceKey",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-transparent border-b border-[#e3e0d6] py-1 text-[16px] font-mono outline-none focus:border-[#1a4dd8]"
                                />
                                <span className="text-[#9d9a8f] font-mono text-sm shrink-0">
                                  →
                                </span>
                                <Input
                                  type="text"
                                  placeholder="Deployment Failure"
                                  value={row.targetValue}
                                  onChange={(e) =>
                                    updateMappingRow(
                                      "eventMappings",
                                      row.id,
                                      "targetValue",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-transparent border-b border-[#e3e0d6] py-1 text-[16px] font-light outline-none focus:border-[#1a4dd8]"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMappingRow("eventMappings", row.id)
                                  }
                                  className="text-[#9d9a8f] hover:text-[#b4452f] text-2xl font-light px-1 select-none"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addMappingRow("eventMappings")}
                            className="self-start font-mono text-xs tracking-wider uppercase text-[#1a4dd8] mt-3.5 hover:opacity-60 transition-opacity"
                          >
                            + Add mapping
                          </button>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#efece4] pt-6 mt-10">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="font-mono text-[13px] tracking-wider uppercase text-[#6e6c63] hover:text-[#15140f]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: INFRASTRUCTURE & OWNERSHIP CORRELATION */}
                    {currentStep === 4 && (
                      <div className="space-y-7 animate-wzin">
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                          Service Correlation
                        </h3>
                        <p className="text-[16.5px] text-[#42413a] font-light">
                          Scrubbe must understand ownership. Map external
                          identifiers to your canonical services and
                          environments.
                        </p>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Service mapping — external → internal
                          </label>
                          <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
                            {formData.serviceMappings.map((row) => (
                              <div
                                key={row.id}
                                className="flex items-center gap-4"
                              >
                                <Input
                                  type="text"
                                  placeholder="Payment-Service"
                                  value={row.sourceKey}
                                  onChange={(e) =>
                                    updateMappingRow(
                                      "serviceMappings",
                                      row.id,
                                      "sourceKey",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-transparent border-b border-[#e3e0d6] py-1 text-[16px] font-mono outline-none focus:border-[#1a4dd8]"
                                />
                                <span className="text-[#9d9a8f] font-mono text-sm shrink-0">
                                  →
                                </span>
                                <Input
                                  type="text"
                                  placeholder="Payment API"
                                  value={row.targetValue}
                                  onChange={(e) =>
                                    updateMappingRow(
                                      "serviceMappings",
                                      row.id,
                                      "targetValue",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-transparent border-b border-[#e3e0d6] py-1 text-[16px] font-light outline-none focus:border-[#1a4dd8]"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMappingRow("serviceMappings", row.id)
                                  }
                                  className="text-[#9d9a8f] hover:text-[#b4452f] text-2xl font-light px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addMappingRow("serviceMappings")}
                            className="self-start font-mono text-xs tracking-wider uppercase text-[#1a4dd8] mt-3.5 hover:opacity-60 transition-opacity"
                          >
                            + Add service
                          </button>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Environment mapping — external → internal
                          </label>
                          <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
                            {formData.environmentMappings.map((row) => (
                              <div
                                key={row.id}
                                className="flex items-center gap-4"
                              >
                                <Input
                                  type="text"
                                  placeholder="production"
                                  value={row.sourceKey}
                                  onChange={(e) =>
                                    updateMappingRow(
                                      "environmentMappings",
                                      row.id,
                                      "sourceKey",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-transparent border-b border-[#e3e0d6] py-1 text-[16px] font-mono outline-none focus:border-[#1a4dd8]"
                                />
                                <span className="text-[#9d9a8f] font-mono text-sm shrink-0">
                                  →
                                </span>
                                <Input
                                  type="text"
                                  placeholder="Production"
                                  value={row.targetValue}
                                  onChange={(e) =>
                                    updateMappingRow(
                                      "environmentMappings",
                                      row.id,
                                      "targetValue",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-transparent border-b border-[#e3e0d6] py-1 text-[16px] font-light outline-none focus:border-[#1a4dd8]"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMappingRow(
                                      "environmentMappings",
                                      row.id,
                                    )
                                  }
                                  className="text-[#9d9a8f] hover:text-[#b4452f] text-2xl font-light px-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addMappingRow("environmentMappings")}
                            className="self-start font-mono text-xs tracking-wider uppercase text-[#1a4dd8] mt-3.5 hover:opacity-60 transition-opacity"
                          >
                            + Add environment
                          </button>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#efece4] pt-6 mt-10">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="font-mono text-[13px] tracking-wider uppercase text-[#6e6c63] hover:text-[#15140f]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: DOWNSTREAM LOGIC CONSUMERS OPTIONS */}
                    {currentStep === 5 && (
                      <div className="space-y-7 animate-wzin">
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                          Operational Intelligence Mapping
                        </h3>
                        <p className="text-[16.5px] text-[#42413a] font-light">
                          This is unique to Scrubbe. Choose which systems should
                          consume this connector.
                        </p>

                        <div className="flex flex-col gap-2">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Consumed by
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px_24px] mt-1">
                            {[
                              "Incident Detection",
                              "Incident Enrichment",
                              "Knowledge Intelligence",
                              "Intelligence Control Plane",
                              "Executive Reporting",
                              "Handover Intelligence",
                              "Post-Incident Learning",
                              "Agent Orchestration",
                              "Risk Intelligence",
                            ].map((intel) => (
                              <label
                                key={intel}
                                className="inline-flex items-center gap-2.5 text-[16px] text-[#42413a] cursor-pointer font-light"
                              >
                                <Input
                                  type="checkbox"
                                  value={intel}
                                  checked={formData.downstreamConsumers.includes(
                                    intel,
                                  )}
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      "downstreamConsumers",
                                      intel,
                                      e.target.checked,
                                    )
                                  }
                                  className="accent-[#1a4dd8] w-4 h-4 rounded-[3px]"
                                />
                                {intel}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 max-w-[320px]">
                          <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                            Signal importance
                          </label>
                          <select
                            value={formData.signalImportance}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                signalImportance: e.target.value as any,
                              }))
                            }
                            className="w-full border-none border-b border-[#e3e0d6] bg-transparent py-2.5 text-[17px] font-light text-[#15140f] outline-none cursor-pointer focus:border-[#1a4dd8]"
                          >
                            {[
                              "Informational",
                              "Low",
                              "Medium",
                              "High",
                              "Critical",
                            ].map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex justify-between items-center border-t border-[#efece4] pt-6 mt-10">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="font-mono text-[13px] tracking-wider uppercase text-[#6e6c63] hover:text-[#15140f]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(6)}
                            className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors"
                          >
                            Review →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 6: VERIFY STATE PRE-CREATION COMPILE */}
                    {currentStep === 6 && (
                      <div className="space-y-7 animate-wzin">
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
                          Review &amp; Create
                        </h3>
                        <p className="text-[16.5px] text-[#42413a] font-light">
                          Confirm the configuration. Scrubbe will begin
                          ingesting and correlating signals immediately.
                        </p>

                        <div className="border-t border-[#efece4] mt-[18px] text-[17px] font-light divide-y divide-[#efece4]">
                          {[
                            [
                              "Connector name",
                              formData.name || "—",
                              !formData.name,
                            ],
                            ["Category", formData.category],
                            [
                              "Business owner",
                              formData.businessOwner || "—",
                              !formData.businessOwner,
                            ],
                            ["Connection type", formData.connectionType],
                            [
                              "Base URL",
                              formData.baseUrl || "—",
                              !formData.baseUrl,
                            ],
                            ["Authentication", formData.authMethod],
                            [
                              "Event types",
                              formData.supportedEventTypes.join(", ") || "—",
                              !formData.supportedEventTypes.length,
                            ],
                            [
                              "Event mappings",
                              `${activeMappingsCount("eventMappings")} mapped`,
                            ],
                            [
                              "Service mappings",
                              `${activeMappingsCount("serviceMappings")} mapped`,
                            ],
                            [
                              "Environment mappings",
                              `${activeMappingsCount("environmentMappings")} mapped`,
                            ],
                            [
                              "Consumed by",
                              formData.downstreamConsumers.join(", ") || "—",
                              !formData.downstreamConsumers.length,
                            ],
                            ["Signal importance", formData.signalImportance],
                          ].map(([k, v, isEmpty], i) => (
                            <div
                              key={i}
                              className="flex gap-[18px] py-3 items-baseline"
                            >
                              <span className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f] w-[200px] shrink-0">
                                {k as string}
                              </span>
                              <span
                                className={`text-[#15140f] overflow-hidden text-ellipsis ${isEmpty ? "text-[#9d9a8f] italic" : ""}`}
                              >
                                {v as string}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-[#efece4] pt-6 mt-10">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="font-mono text-[13px] tracking-wider uppercase text-[#6e6c63] hover:text-[#15140f]"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={handleCreateConnector}
                            className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors"
                          >
                            Create connector
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUCCESS SCREEN */}
                    {currentStep === 7 && (
                      <div className="text-left py-1.5 animate-wzin">
                        <svg
                          className="w-[54px] h-[54px] text-[#1a4dd8]"
                          viewBox="0 0 52 52"
                        >
                          <circle
                            cx="26"
                            cy="26"
                            r="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            className="animate-drawCircle"
                            style={{
                              strokeDasharray: 151,
                              strokeDashoffset: 151,
                            }}
                          />
                          <path
                            fill="none"
                            d="M15 27l8 8 15-16"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-drawCheck"
                            style={{
                              strokeDasharray: 40,
                              strokeDashoffset: 40,
                            }}
                          />
                        </svg>
                        <h3 className="font-serif text-2xl sm:text-3xl font-normal mt-[18px] tracking-tight">
                          Connector created.
                        </h3>
                        <p className="text-[16.5px] text-[#42413a] font-light mt-2.5 max-w-[54ch]">
                          &ldquo;{formData.name}&rdquo; is now ingesting signals
                          into the operational graph and feeding{" "}
                          {formData.downstreamConsumers.length} downstream{" "}
                          {formData.downstreamConsumers.length === 1
                            ? "system"
                            : "systems"}
                          . It behaves exactly like a native connector.
                        </p>
                        <div className="flex gap-[30px] items-center flex-wrap mt-7">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                name: "",
                                baseUrl: "",
                                description: "",
                                secret: "",
                                clientCredentialId: "",
                              }));
                              setCurrentStep(1);
                            }}
                            className="inline-flex items-center gap-2 text-sm font-medium pb-1 border-b border-[#e3e0d6] text-[#6e6c63] hover:text-[#15140f] hover:border-[#15140f] transition-all"
                          >
                            Create another
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
