"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { LEAD } from "./incidentDelivery.data";

const Header = ({ incident }: { incident: IncidentDetailRecord }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
      {/* Left — title block */}
      <div className="space-y-1.5 max-w-xl">
        <p className="text-[13px] text-black dark:text-zinc-500">
          Scrubbe - Analyst Investigation
        </p>
        <p className="text-[22px] font-bold text-black dark:text-white leading-snug">
          {incident.ticketId || LEAD.ticketId} · {incident.title || LEAD.title}
        </p>
        <p className="text-[13px] leading-relaxed text-black dark:text-zinc-400">
          Analyst view for what went wrong across delivery signals, evidence,
          remediation, verification, and the decision log for{" "}
          <span className="text-black dark:text-zinc-300">
            {incident.service || LEAD.service}
          </span>
          .
        </p>
      </div>

      {/* Right — Evidence Explorer */}
      <button
        type="button"
        onClick={() => router.push(`/incident/evidence-explorer?id=${incident.id}`)}
        className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors"
      >
        Evidence Explorer
      </button>
    </div>
  );
};

export default Header;
