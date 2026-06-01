import SideModal from "@/components/ui/SideModal";
import React, { ReactNode, useState } from "react";
import { AiOutlineBranches } from "react-icons/ai";
import { GoShieldCheck } from "react-icons/go";
import {
  IoBookOutline,
  IoDocumentOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
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
      title: "Governed",
      icon: <GoShieldCheck className="size-4 text-emerald-400" />,
      onClick: () => setIsGoverned(true),
    },
    {
      title: `Source : ${sourceLabel}`,
      icon: <AiOutlineBranches className="size-4 text-orange-400" />,
      onClick: () => undefined,
    },
    {
      title: "Playbook Active",
      icon: <IoBookOutline className="size-4 text-fuchsia-500" />,
      onClick: () => setIsPlaybook(true),
    },
    {
      title: "Decision Log",
      icon: <IoDocumentTextOutline className="size-4 text-blue-500" />,
      onClick: () => undefined,
    },
    {
      title: "Analyst Note",
      icon: <IoDocumentOutline className="size-4 text-yellow-500" />,
      onClick: () => setIsAnalystNote(true),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between text-gray-900 dark:text-white">
        <div className="space-y-3">
          <p className="text-lg font-semibold">Scrubbe · Analyst Investigation</p>
          <p className="font-semibold">
            {incident.ticketId} · {incident.title || "Delivery incident investigation"}
          </p>
          <p className="max-w-xl text-base">
            Analyst view for what went wrong across delivery signals, evidence,
            remediation, verification, and the decision log for{" "}
            {incident.service || "the selected service"}.
          </p>
        </div>
        <div className="flex max-w-2xl flex-wrap items-center gap-4">
          {tags.map(({ icon, title, onClick }) => (
            <ButtonTags Icon={icon} key={title} title={title} onClick={onClick} />
          ))}
        </div>
      </div>

      {isGoverned ? (
        <SideModal
          isOpen={isGoverned}
          onClose={() => setIsGoverned(false)}
          title="Governed orchestration"
          subTitle="What Governed means"
        >
          <Govern />
        </SideModal>
      ) : null}

      {isPlaybook ? (
        <SideModal
          isOpen={isPlaybook}
          onClose={() => setIsPlaybook(false)}
          title="Playbook"
          subTitle="Active playbook"
        >
          <Playbook />
        </SideModal>
      ) : null}

      {isAnalystNote ? (
        <SideModal
          isOpen={isAnalystNote}
          onClose={() => setIsAnalystNote(false)}
          title="Analyst Note"
          subTitle="Add note (author + timestamp)"
        >
          <AnalystNote />
        </SideModal>
      ) : null}
    </div>
  );
};

const ButtonTags = ({
  Icon,
  title,
  onClick,
}: {
  Icon: ReactNode;
  title: string;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-400 px-2 py-1 text-sm"
    >
      {Icon}
      {title}
    </div>
  );
};

export default Header;
