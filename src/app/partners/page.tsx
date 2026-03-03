"use client";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent, ChangeEvent } from "react";

// Assuming CButton is defined and takes standard button props + className
// If CButton is a separate file, ensure its props are defined correctly.
// For this example, I'll assume CButton is a standard button replacement.
const CButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  onClick,
  ...props
}) => (
  <button
    className={`py-2 px-4 rounded font-semibold transition-colors ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

// --- 1. Interface for Form Data ---
interface IFormData {
  email: string;
  company: string;
  role: string;
  region: string;
  bestDescribes: string[];
  howIncidentsWork: string;
  wantsToPlug: string[];
  howSoon: string;
  stackHighlights: string;
}

const EarlyDesignPartnerProgram: React.FC = () => {
  const router = useRouter();

  const initialFormData: IFormData = {
    email: "",
    company: "",
    role: "",
    region: "UK / Europe",
    bestDescribes: [],
    howIncidentsWork: "",
    wantsToPlug: [],
    howSoon: "",
    stackHighlights: "",
  };

  const [formData, setFormData] = useState<IFormData>(initialFormData);

  // Theme Colors
  const colors = {
    darkBg: "#08132F",
    tealAccent: "#00CAD8", // Updated based on the tag color in your code
    textLight: "#f3f4f6",
    highlightGreen: "#38761d", // Consistent green for internal highlight
  };

  // --- 2. Type-Safe Handlers ---

  // Handler for Checkboxes (Best Describes / Wants to Plug)
  const handleCheckboxChange = (
    group: keyof IFormData,
    value: string
  ): void => {
    setFormData((prevData) => {
      const currentList = prevData[group] as string[]; // Assertion necessary here as group can be any keyof IFormData
      if (currentList && currentList.includes(value)) {
        return {
          ...prevData,
          [group]: currentList.filter((item) => item !== value),
        } as IFormData;
      } else {
        return {
          ...prevData,
          [group]: [...(currentList || []), value],
        } as IFormData;
      }
    });
  };

  // Handler for Radio Buttons (How Soon)
  const handleRadioChange = (group: keyof IFormData, value: string): void => {
    setFormData((prevData) => ({ ...prevData, [group]: value }));
  };

  // Handler for standard text inputs
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  // Handler for Form Submission
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Thank you for your interest! (Check console for data)");
    // Optionally: router.push('/thank-you-page');
  };

  // --- Form Content Data ---
  const bestDescribesOptions = [
    "Dev / product engineering",
    "SRE / platform / infra",
    "Fraud / risk / payments",
    "Security / compliance",
  ];

  const plugOptions = [
    "Scrubbe IMS (incidents)",
    "Code Engine (fix-ready patches)",
    "CI / CD pipelines",
    "Fraud / risk signals",
    "Ezra (AI analyst)",
  ];

  const experimentationOptions = [
    { label: "Actively looking now (0-3 months)", value: "now" },
    { label: "Exploring options (3-6 months)", value: "exploring" },
    { label: "Just curious / future", value: "curious" },
  ];

  return (
    <div
      className="min-h-screen bg-scrubbe-dark-bg p-0 font-sans bg-[#08132F]"
      style={{ backgroundColor: colors.darkBg }}
    >
      <style>{`
        .bg-scrubbe-dark-bg { background-color: ${colors.darkBg}; }
        .text-scrubbe-light { color: ${colors.textLight}; }
        .bg-scrubbe-highlight { background-color: ${colors.highlightGreen}; }
        .border-scrubbe-dark { border-color: #374151; }
        .incident-textarea {
            padding: 1rem;
            min-height: 100px;
            background-color: #0A1635;
            border: 1px solid #374151;
            color: ${colors.textLight};
            resize: none;
            overflow-y: hidden;
        }
      `}</style>

      <div className="container mx-auto ">
        {/* Header Bar */}
        <div className="flex justify-between items-center px-8 pt-8 pb-4">
          <div className="text-xl font-bold text-white flex items-center">
            <div className="h-[30px] w-[220px]">
              {/* NOTE: If you are using next/image, you must import it and ensure src is correct */}
              <img
                src="/IMS/logo-white.png"
                alt="scrubbe.png"
                className="object-contain h-full "
              />
            </div>
          </div>
        </div>

        <div className="bg-[#6F6F6F1A] rounded-3xl p-4 border border-gray-500">
          <div className="flex items-center justify-between px-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
              Early design partner program
            </h1>
            <button
              onClick={() => router.back()}
              className="text-sm font-semibold py-2 px-4 rounded border border-white text-white hover:text-scrubbe-dark-bg transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 w-full mx-auto gap-12 p-8">
            {/* Left Column: Program Details and Form */}
            <div className="md:col-span-2 text-scrubbe-light">
              {/* Program Introduction */}
              <header className="mb-10">
                <h2 className="text-lg lg:text-xl font-medium mb-2">
                  Work with Scrubbe while it&apos;s still sharp and opinionated.
                </h2>
                <p className="text-gray-400 mb-8">
                  We&apos;re pairing with a small number of engineering, SRE and
                  fraud teams who want an AI-first incident & code engine — not
                  another ticket queue.
                </p>

                {/* Tag/Pill Navigation */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    "Dev, SRE, fraud & risk teams",
                    "No spray-and-pray sales",
                    "Influence Code Engine & IMS",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className=" text-sm font-medium py-2 px-4 rounded-xl border"
                      style={{
                        borderColor: colors.tealAccent,
                        color: colors.tealAccent,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              {/* --- Form Section --- */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Row 1: Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Work email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded bg-[#0A1635] border border-scrubbe-dark focus:ring-1 focus:ring-scrubbe-highlight focus:border-scrubbe-highlight"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium mb-2"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      placeholder="acme-payments"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded bg-[#0A1635] border border-scrubbe-dark focus:ring-1 focus:ring-scrubbe-highlight focus:border-scrubbe-highlight"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Role and Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium mb-2"
                    >
                      Your role
                    </label>
                    <input
                      type="text"
                      id="role"
                      placeholder="Head of SRE, Fraud Lead, Platform Engineering"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded bg-[#0A1635] border border-scrubbe-dark focus:ring-1 focus:ring-scrubbe-highlight focus:border-scrubbe-highlight"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium mb-2"
                    >
                      Region / HQ
                    </label>
                    <select
                      id="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded bg-[#0A1635] border border-scrubbe-dark focus:ring-1 focus:ring-scrubbe-highlight focus:border-scrubbe-highlight appearance-none"
                    >
                      <option>UK / Europe</option>
                      <option>US/Canada</option>
                      <option>Africa</option>
                      <option>LatAm</option>
                      <option>Middle East</option>
                      <option>Asia Pacific</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Best Describes (Checkboxes) */}
                <div className="pt-4">
                  <label className="block text-lg font-semibold mb-4">
                    What best describes your team
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {bestDescribesOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="bestDescribes"
                          value={option}
                          checked={formData.bestDescribes.includes(option)}
                          onChange={() =>
                            handleCheckboxChange("bestDescribes", option)
                          }
                          className="form-checkbox h-5 w-5 border-gray-500 rounded text-scrubbe-highlight bg-[#0A1635] checked:bg-scrubbe-highlight focus:ring-scrubbe-highlight"
                          style={{ borderColor: "#374151" }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Row 4: Incident Description (Textarea) */}
                <div className="pt-4">
                  <label
                    htmlFor="howIncidentsWork"
                    className="block text-lg font-semibold mb-2"
                  >
                    How do incidents work in your world today?
                  </label>
                  <div className="relative">
                    <textarea
                      id="howIncidentsWork"
                      placeholder="E.g CI failures open Jira tickets; on-call bounces between legs, dashboards and slack; fraud spikes are handled in a separate tool"
                      value={formData.howIncidentsWork}
                      onChange={handleInputChange}
                      className="w-full incident-textarea rounded"
                    />
                  </div>
                </div>

                {/* Row 5: Plug and Experimentation (Checkboxes and Radios) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* What to plug into */}
                  <div>
                    <label className="block text-lg font-semibold mb-4">
                      What do you want scrubbe to plug into ?
                    </label>
                    <div className="space-y-2">
                      {plugOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name="wantsToPlug"
                            value={option}
                            checked={formData.wantsToPlug.includes(option)}
                            onChange={() =>
                              handleCheckboxChange("wantsToPlug", option)
                            }
                            className="form-checkbox h-5 w-5 border-gray-500 rounded text-scrubbe-highlight bg-[#0A1635] checked:bg-scrubbe-highlight focus:ring-scrubbe-highlight"
                            style={{ borderColor: "#374151" }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* How soon */}
                  <div>
                    <label className="block text-lg font-semibold mb-4">
                      How soon are you looking to experiment?
                    </label>
                    <div className="space-y-3">
                      {experimentationOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="howSoon"
                            value={option.value}
                            checked={formData.howSoon === option.value}
                            onChange={() =>
                              handleRadioChange("howSoon", option.value)
                            }
                            className="form-radio h-5 w-5 border-gray-500 text-scrubbe-highlight bg-[#0A1635] checked:bg-scrubbe-highlight focus:ring-scrubbe-highlight"
                            style={{ borderColor: "#374151" }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 6: Stack Highlights */}
                <div className="pt-4">
                  <label
                    htmlFor="stackHighlights"
                    className="block text-lg font-semibold mb-2"
                  >
                    Stack Highlights (optional )
                  </label>
                  <input
                    type="text"
                    id="stackHighlights"
                    placeholder="Node/Java, Kubernetes, Postgres, Stripe"
                    value={formData.stackHighlights}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded bg-[#0A1635] border border-scrubbe-dark focus:ring-1 focus:ring-scrubbe-highlight focus:border-scrubbe-highlight"
                  />
                </div>

                {/* Disclaimer and Submit Button (inside form) */}
                <div className="pt-3">
                  <p className="text-sm text-gray-400">
                    By submitting, you&apos;re starting a conversation with the
                    Scrubbe team, this is not a generic mailing list.
                  </p>
                </div>

                {/* Submit button moved outside the final action bar to maintain form structure */}
              </form>
            </div>

            {/* Right Column: Benefits and Asks */}
            <div
              className="md:col-span-1 p-6 text-scrubbe-light h-fit"
              style={{ backgroundColor: "#0A1635", borderRadius: "0.5rem" }}
            >
              {/* What you get */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">What you get</h3>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  <li>Early access to Scrubbe IMS + Code Engine as we ship.</li>
                  <li>Direct line to the founders, not a support queue.</li>
                  <li>Real influence on Dev / SRE / fraud workflows.</li>
                  <li>
                    Priority on integrations (GitHub / GitLab / observability /
                    fraud data).
                  </li>
                </ul>
              </div>

              {/* What we ask */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">What we ask</h3>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  <li>Real incidents, not only demo environments.</li>
                  <li>
                    Willingness to share anonymised patterns and workflows.
                  </li>
                  <li>1-2 recurring calls or async reviews per month.</li>
                </ul>
              </div>

              {/* Yellow Highlight Box */}
              <div className="bg-yellow-900 bg-opacity-30 p-4 rounded text-yellow-100 border-l-4 border-yellow-400 mb-8">
                <p className=" text-base">
                  We cap early partners to keep Scrubbe focused. If we&apos;re
                  not a fit yet, we&apos;ll still keep you in the loop as we
                  mature.
                </p>
              </div>

              {/* Partnership Traits Tags */}
              <div className="flex flex-wrap gap-3">
                {[
                  "MTTR-obsessed teams",
                  "High fraud exposure",
                  "On-call ownership culture",
                  "CI/CD heavy",
                ].map((tag) => (
                  <span
                    key={tag}
                    className=" text-sm font-medium py-2 px-4 rounded-xl border"
                    style={{
                      borderColor: colors.tealAccent,
                      color: colors.tealAccent,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 items-center pb-10">
            <CButton
              onClick={() => router.back()}
              className="w-fit h-[40px] hidden xl:flex bg-transparent hover:bg-transparent text-IMSCyan border border-IMSCyan shadow-none text-base"
            >
              Cancel
            </CButton>

            <CButton
              // onClick={() => router.push("/incident/tickets/create")}

              className="w-fit h-[40px] hidden xl:flex bg-IMSCyan shadow-none text-base"
            >
              Submit Interest
            </CButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarlyDesignPartnerProgram;
