"use client";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaCheck } from "react-icons/fa";

const useCases: { [key: string]: { title: string; cases: string[] } } = {
  cloud: {
    title: "Enterprise Cloud Infrastructure: Mastering CI/CD Resilience",
    cases: [
      "Real-time detection for Jenkins, GitHub Actions, AWS CodePipeline.",
      "AI-driven root cause analysis for commits or config drifts.",
      "Automated isolation and rollback orchestration.",
      "Collaborative war rooms for DevOps, security, SREs.",
      "50% MTTR reduction with SOC2/ISO 27001 compliance.",
      "AI-driven root cause analysis for commits or config drifts.",
    ],
  },
  service_provider: {
    title: "Enterprise IT Service Providers: Optimizing SLA Compliance",
    cases: [
      "Automated P1-P4 classification with ServiceNow integration.",
      "AI predictions for escalation and breach prevention.",
      "Multi-tier dashboards for global ops centers.",
      "99.9% SLA uptime with compliance reporting.",
      "GDPR, HIPAA-compliant encrypted logs.",
    ],
  },
  climate: {
    title: "Enterprise Climate & Energy Operations: Forecasting Disruptions",
    cases: [
      "AI-driven 24-72 hour disruption forecasts.",
      "Geo-targeted alerts with GIS integration.",
      "Real-time multi-site monitoring dashboards.",
      "40% reduction in weather-induced downtime.",
      "NERC CIP compliance with immutable logs.",
    ],
  },
  fraud: {
    title: "Enterprise Fintech & Fraud Operations: Securing Transactions",
    cases: [
      "Real-time anomaly detection for Stripe, Plaid APIs.",
      "Auto-quarantine of suspicious transaction flows.",
      "AI root cause analysis for DDoS or credential attacks.",
      "60% reduction in fraud losses with PCI-DSS compliance",
      "Transparent dashboards for regulatory reporting.",
    ],
  },
};
const UseCase = () => {
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState<string>("cloud");
  const router = useRouter();
  return (
    <div>
      <div className=" min-h-[300px] container mx-auto py-10 md:px-10 px-4">
        <p className="text-4xl sm:text-5xl text-center font-bigshotOne">
          Real-World Use Cases
        </p>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-10 mt-6">
          <div
            onClick={() => {
              setModalType("cloud");
              setOpen(true);
            }}
            className=" p-4 bg-[#FFF4E6] h-[174px] rounded-xl flex flex-col gap-3 "
          >
            <p className="font-medium text-xl md:text-2xl">
              Cloud Infrastructure Teams
            </p>
            <p>Real-time detection of CI/CD failures.</p>
          </div>
          <div
            onClick={() => {
              setModalType("service_provider");
              setOpen(true);
            }}
            className=" p-4 bg-[#E7F3FF] h-[174px] rounded-xl flex flex-col gap-3 "
          >
            <p className="font-medium text-xl md:text-2xl">
              IT Service Providers
            </p>
            <p>SLA-driven incident resolution tracking.</p>
          </div>
          <div
            onClick={() => {
              setModalType("climate");
              setOpen(true);
            }}
            className=" p-4 bg-[#F7EBFF] h-[174px] rounded-xl flex flex-col gap-3 "
          >
            <p className="font-medium text-xl md:text-2xl">
              Climate & Energy Ops
            </p>
            <p>Predict weather-related disruptions.</p>
          </div>
          <div
            onClick={() => {
              setModalType("fraud");
              setOpen(true);
            }}
            className=" p-4 bg-[#FEF2C3] h-[174px] rounded-xl flex flex-col gap-3 "
          >
            <p className="font-medium text-xl md:text-2xl">
              Fintech & Fraud Ops
            </p>
            <p>Detect abnormal API or transaction failures.</p>
          </div>
        </div>

        <Modal isOpen={open} onClose={() => setOpen(false)}>
          <div className=" space-y-3 p-4">
            <p className=" font-semibold">{useCases[modalType].title}</p>
            <div className=" space-y-2">
              {useCases[modalType].cases.map((item, idx) => (
                <span className="flex gap-2" key={idx}>
                  <FaCheck size={18} className=" text-IMSLightGreen" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Modal>
      </div>

      <div className=" min-h-[300px] bg-[#00474D] mx-auto py-10 md:px-10 px-4 flex flex-col justify-center items-center gap-5">
        <p className="text-white text-4xl sm:text-5xl font-bigshotOne text-center">
          Your Next Incident Doesn’t Have to Be a Disaster
        </p>
        <div className="flex sm:flex-row flex-col gap-3 mt-4 ">
          <CButton
            className="w-[300px]"
            onClick={() => router.push("/auth/signin")}
          >
            Get Started
          </CButton>
          <CButton className="w-[300px] text-IMSLightGreen bg-white hover:text-white">
            Download Brochure
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default UseCase;
