"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";
import { LEAD } from "./incidentDelivery.data";
import Button from "@/components/ui/Button1";

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
          {incident.ticketId || LEAD.ticketId}
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

      <div className="flex items-center gap-3">
        <Button
          onClick={() =>
            router.push(`/incident/evidence-explorer?id=${incident.id}`)
          }
          size="sm"
        >
          Evidence Explorer
        </Button>
        <Button
          className=""
          variant="outline-dark"
          onClick={() => {}}
          size="sm"
        >
          Repull Signals
        </Button>
      </div>
    </div>
  );
};

export default Header;
