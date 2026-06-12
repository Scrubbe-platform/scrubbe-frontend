"use client";
import React, { ReactNode, useState } from "react";
import { AiOutlineBranches } from "react-icons/ai";
import { GoShieldCheck } from "react-icons/go";
import {
  IoBookOutline,
  IoDocumentOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import SideModal from "@/components/ui/SideModal";
import Govern from "./Modal/Govern";
import Playbook from "./Modal/Playbook";
import AnalystNote from "./Modal/AnalystNote";
import { IncidentDetailRecord } from "@/lib/incident/incident.types";

const Header = ({ incident }: { incident: IncidentDetailRecord }) => {
  const [isGoverned, setIsGoverned] = useState(false);
  const [isAnalystNote, setIsAnalystNote] = useState(false);
  const [isPlaybook, setIsPlaybook] = useState(false);

  const sourceLabel = incident.sourceType || incident.source || "Manual";

  const tags = [
    {
      title: `Source: ${sourceLabel}`,
      icon: (
        <AiOutlineBranches className="size-3.5 text-amber-500 dark:text-amber-400" />
      ),
      onClick: () => undefined,
    },
    {
      title: "Playbook Active",
      icon: (
        <IoBookOutline className="size-3.5 text-violet-500 dark:text-violet-400" />
      ),
      onClick: () => setIsPlaybook(true),
    },
    {
      title: "Analyst Note",
      icon: (
        <IoDocumentOutline className="size-3.5 text-black dark:text-zinc-400" />
      ),
      onClick: () => setIsAnalystNote(true),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* Left — title block */}
        <div className="space-y-1.5 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
            Scrubbe · Analyst Investigation
          </p>
          <p className="text-[16px] font-semibold text-black dark:text-white leading-snug">
            {incident.ticketId} ·{" "}
            {incident.title || "Delivery incident investigation"}
          </p>
          <p className="text-[13px] leading-relaxed text-black dark:text-zinc-400">
            Analyst view for what went wrong across delivery signals, evidence,
            remediation, verification, and the decision log for{" "}
            <span className="text-black dark:text-zinc-300 font-medium">
              {incident.service || "the selected service"}
            </span>
            .
          </p>
        </div>

        {/* Right — tags */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(({ icon, title, onClick }) => (
            <Tag key={title} icon={icon} title={title} onClick={onClick} />
          ))}
        </div>
      </div>

      {/* Modals */}
      {isGoverned && (
        <SideModal
          isOpen={isGoverned}
          onClose={() => setIsGoverned(false)}
          title="Governed orchestration"
          subTitle="What Governed means"
        >
          <Govern />
        </SideModal>
      )}
      {isPlaybook && (
        <SideModal
          isOpen={isPlaybook}
          onClose={() => setIsPlaybook(false)}
          title="Playbook"
          subTitle="Active playbook"
        >
          <Playbook />
        </SideModal>
      )}
      {isAnalystNote && (
        <SideModal
          isOpen={isAnalystNote}
          onClose={() => setIsAnalystNote(false)}
          title="Analyst Note"
          subTitle="Add note (author + timestamp)"
        >
          <AnalystNote
            incident={incident}
            onClose={() => setIsAnalystNote(false)}
          />
        </SideModal>
      )}
    </>
  );
};

const Tag = ({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
  >
    {icon}
    {title}
  </button>
);

export default Header;
