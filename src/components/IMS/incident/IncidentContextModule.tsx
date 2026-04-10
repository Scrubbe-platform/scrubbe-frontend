import React from "react";

// --- Types ---

interface ContextField {
  label: string;
  value: string;
  valueColor?: string;
  isDescription?: boolean;
}

// --- Sub-Components ---

const ContextBox = ({
  label,
  value,
  valueColor = "text-white",
  isDescription = false,
}: ContextField) => (
  <div
    className={`p-5 bg-darkEzra border border-white/5 rounded-2xl ${
      isDescription ? "col-span-full" : "col-span-1"
    }`}
  >
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
      {label}
    </p>
    <p
      className={`text-[13px] font-semibold leading-relaxed ${valueColor} ${
        isDescription ? "text-slate-300 font-medium" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

// --- Main Component ---

const IncidentContextModule: React.FC = () => {
  const fields: ContextField[] = [
    {
      label: "Affected Service",
      value: "checkout-service",
      valueColor: "text-blue-400",
    },
    { label: "Environment", value: "K8s · prod · eu-west-1" },
    {
      label: "Triggering Event",
      value: "deployment_failed - deploy #311",
      valueColor: "text-blue-400",
    },
    { label: "Commit", value: "4f3a91c - main" },
    {
      label: "Error Budget Consumed",
      value: "81% (112% this incident)",
      valueColor: "text-red-500",
    },
    {
      label: "Impact Classification",
      value: "1 service - Contained - Reversible",
      valueColor: "text-amber-400",
    },
  ];

  return (
    <div className="p-6">
      <div className="w-full flex flex-col gap-4 p-4 rounded-xl border border-white/20">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-[0.15em] mb-1 px-1">
          Incident Context
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {fields.map((field, idx) => (
            <ContextBox key={idx} {...field} />
          ))}

          {/* Description Row (Full Width) */}
          <ContextBox
            label="Description"
            isDescription
            value="checkout-service failed Integration tests after deploying commit 4f3a91c. Tests timeout on db-core (eu-west-1) — pool of 50 connections fully exhausted within 8 seconds of increased load. Error rate spiked to 7.8%. Pattern matches DB pool exhaustion class — 9 prior resolutions on record."
          />

          {/* Footer Metrics */}
          <div className="col-span-1 p-5 bg-darkEzra border border-white/5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Assigned to
            </p>
            <p className="text-[13px] font-semibold text-white">
              Alice Chen - SRE Lead
            </p>
          </div>

          <div className="col-span-1 p-5 bg-darkEzra border border-white/5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Priority
            </p>
            <p className="text-[13px] font-bold text-red-500">P1-Critical</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentContextModule;
