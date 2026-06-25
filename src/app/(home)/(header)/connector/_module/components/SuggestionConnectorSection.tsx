"use client";

import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import React, { useState } from "react";
export interface SuggestConnectorForm {
  name: string;
  category: string;
  signalsNote: string;
  email: string;
  priority: "Nice to have" | "Important" | "Blocking adoption";
}

export default function SuggestConnectorSection() {
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // --- Controlled Form State Matching Document Fields Exactly ---
  const [formData, setFormData] = useState<SuggestConnectorForm>({
    name: "",
    category: "Source Control",
    signalsNote: "",
    email: "",
    priority: "Nice to have",
  });

  const handleInputChange = (
    field: keyof SuggestConnectorForm,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    // Simulate API Ingestion Pipeline Transmission (e.g., POST /api/connectors/suggest)
    setIsSubmitSuccess(true);

    // Optional: Reset form fields but keep context open for feedback acknowledgment
    setFormData({
      name: "",
      category: "Source Control",
      signalsNote: "",
      email: "",
      priority: "Nice to have",
    });

    // Auto-collapse success announcement window after grace tracking period
    setTimeout(() => {
      setIsSubmitSuccess(false);
    }, 5000);
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
    <section className="w-full py-16 px-6 bg-white border-t border-[#e5e7eb]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
          {/* LEFT RAIL TRACK METADATA INDICATORS */}
          <div className="sticky top-28 before:mb-4">
            <SectionLabel>
              Request a<br />
              Connector
            </SectionLabel>
          </div>

          {/* RIGHT MAIN CORE NARRATIVE WORKSPACE BLOCK */}
          <div className="w-full max-w-[640px]">
            <SerHead size="lg" className="mb-5">
              Don't see a system you depend on?
            </SerHead>
            <p className="text-[#374151] text-[0.9375rem] leading-[1.75] mb-7">
              Tell us what to build next. Connector requests are reviewed by the
              integrations team and prioritised against demand across the
              platform.
            </p>

            <div className="flex gap-[30px] items-center flex-wrap mt-[30px]">
              <MonoButton
                onClick={() => {
                  setIsSuggestOpen(!isSuggestOpen);
                  if (isSuggestOpen) setIsSubmitSuccess(false);
                }}
              >
                Suggest a Connector
              </MonoButton>
            </div>

            {/* CONTROLLABLE ANCHOR STEP SLIDE EXPAND WRAPPER */}
            {isSuggestOpen && (
              <div className="mt-10 border-t-[1.5px] border-[#15140f] pt-[28px] animate-wzin">
                <form
                  onSubmit={handleFormSubmit}
                  className="space-y-7"
                  autoComplete="off"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[26px_34px]">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                        System / vendor name{" "}
                        <span className="text-[#1a4dd8]">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. ServiceNow, Honeycomb, Terraform Cloud"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="w-full border rounded-md h-[] border-[#e3e0d6] bg-transparent py-2.5 text-sm font-light text-[#15140f] outline-none cursor-pointer focus:border-[#1a4dd8]"
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
                          "Other",
                        ].map((categoryOpt) => (
                          <option key={categoryOpt} value={categoryOpt}>
                            {categoryOpt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                      What signals should it contribute?
                    </label>
                    <TextArea
                      rows={2}
                      placeholder="e.g. Change requests, approvals, and CMDB ownership data."
                      value={formData.signalsNote}
                      onChange={(e) =>
                        handleInputChange("signalsNote", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[26px_34px]">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                        Work email
                      </label>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[11px] tracking-widest uppercase text-[#9d9a8f]">
                        Priority for your team
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          handleInputChange("priority", e.target.value as any)
                        }
                        className="w-full border rounded-md h-[38px] border-[#e3e0d6] bg-transparent py-2.5 text-sm font-light text-[#15140f] outline-none cursor-pointer focus:border-[#1a4dd8]"
                      >
                        <option value="Nice to have">Nice to have</option>
                        <option value="Important">Important</option>
                        <option value="Blocking adoption">
                          Blocking adoption
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* FOOT ACTION TRIGGER BUTTONS ROW */}
                  <div className="mt-[30px] flex items-center gap-6 flex-wrap">
                    <button
                      type="submit"
                      className="font-mono text-[13px] tracking-wider uppercase text-white bg-[#15140f] py-3.5 px-6 rounded-[3px] hover:bg-[#1a4dd8] transition-colors font-medium"
                    >
                      Submit request
                    </button>

                    {isSubmitSuccess && (
                      <span className="inline-flex items-center gap-2.5 text-[#0f7a5a] text-sm font-mono tracking-wide animate-wzin">
                        <svg
                          className="w-4 h-4 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Request received — we'll be in touch.
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
