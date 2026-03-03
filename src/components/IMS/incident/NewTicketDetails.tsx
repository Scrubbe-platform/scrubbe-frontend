"use client";
import React, { useState } from "react";
import Modal from "../../ui/Modal";
import Select from "../../ui/select";
import CButton from "../../ui/Cbutton";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import EditIncidentTicket from "../EditIncidentTicket";
import TicketComments from "../../IncidentTicket/TicketComments";
import useTicketDetails from "@/hooks/useTicketDetails";
import Collaboration from "../../IncidentTicket/Collaboration";
import History from "../../IncidentTicket/History";
import TreatIntel from "../../IncidentTicket/TreatIntel";
import { Ticket, Tticket } from "@/types";
import { priorityColors, statusColors } from "./NewIncidentList";
import NewEditIncidentTicket from "./NewEditIncidentTicket";

const TABS = [
  "Details",
  "Comments",
//   "Collaboration",
  "Timeline",
  // "Threat intel",
];

const NewTicketDetails = () => {
  const [tab, setTab] = useState(0);
  const [isExcuteLockAccount, setIsExcuteLockAccount] = useState(false);
  const [isMergeTicket, setIsMergeTicket] = useState(false);
  const [isEscalateTicket, setIsEscalateTicket] = useState(false);
  const router = useRouter();
  const { data } = useTicketDetails();
  const ticket = data as Tticket;

  return (
    <div className="bg-dark text-white">
      <div className="p-6 mx-auto w-full">
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft />{" "}
          <h1 className="text-xl font-bold text-white">{data?.ticketId}</h1>
        </div>
        <p className="font-semibold mb-2">
          checkout-service DB pool exhaustion
        </p>
        <p className="text-sm mb-2">
          This is where incidents live in Scrubbe: signal-rich, CI/CD-linked,
          and ready for Ezra summaries. Filter by priority, type, service, time
          window, or ownership — then click an incident to work it end-to-end.
        </p>

        {
            ticket && <div className="flex items-center gap-3">
            <div>{priorityColors(ticket?.state ?? "")}</div>
            <div>{statusColors(ticket?.severity ?? "")}</div>
            <p className="p-1 px-2 text-xs rounded-md capitalize border">
              {ticket?.environment} • {ticket?.region}
            </p>
            <p className="p-1 px-2 text-xs rounded-md capitalize border">
             {ticket?.serviceArea}
            </p>
            <p className="p-1 px-2 text-xs rounded-md capitalize border">
            {ticket?.sourceType}
            </p>
          </div>
        }

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-400 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`py-2 px-2 flex-1 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-IMSCyan text-IMSCyan"
                  : "border-transparent text-white hover:text-IMSCyan"
              }`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Details Tab */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 0 && <NewEditIncidentTicket />}
          {tab === 1 && <TicketComments ticket={ticket} />}

          {/* Collaboration Tab */}
          {/* {tab === 2 && <Collaboration ticket={ticket} />} */}

          {/* History Tab */}
          {tab === 3 && <History />}

          {/* Threat intel Tab */}
          {/* {tab === 4 && <TreatIntel />} */}
        </motion.div>
      </div>

      <Modal
        isOpen={isExcuteLockAccount}
        onClose={() => setIsExcuteLockAccount(false)}
      >
        <div className="p-6 max-w-2xl w-full">
          <h1 className="text-2xl font-bold dark:text-white mb-4">
            Confirm Playbook Execution
          </h1>

          <div className="mb-4 flex justify-between">
            <b className="dark:text-white">Playbook:</b>
            <p className="dark:text-white">Lock Account</p>
          </div>

          <div className="mb-4 flex justify-between">
            <b className="dark:text-white">Description:</b>
            <p className="dark:text-white">Locks a compromised user account</p>
          </div>

          <div className="mb-4">
            <b className="dark:text-white">Steps:</b>
            <ul className="list-disc list-inside dark:text-white space-y-1 mt-2">
              <li>Suspend account in AD</li>
              <li>Notify user via email</li>
              <li>Lock account</li>
            </ul>
          </div>

          <div className="flex justify-end gap-4">
            <CButton
              className=" border-gray-300 border bg-transparent w-fit"
              onClick={() => setIsExcuteLockAccount(false)}
            >
              Cancel
            </CButton>
            <CButton
              className="bg-green w-fit text-white rounded-lg py-2 font-medium hover:bg-green"
              onClick={() => setIsExcuteLockAccount(false)}
            >
              Execute
            </CButton>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isMergeTicket} onClose={() => setIsMergeTicket(false)}>
        <div className="p-6 max-w-2xl w-full">
          <h1 className="text-2xl font-bold dark:text-white mb-4">
            Merge Tickets
          </h1>

          <Select
            label="Select Ticket"
            options={[
              {
                value: "INC39828-emma Taylor-Suspicious login location",
                label: "INC39828-emma Taylor-Suspicious login location",
              },
              {
                value: "INC39828-emma Taylor-Suspicious login location",
                label: "INC39828-emma Taylor-Suspicious login location",
              },
            ]}
          />

          <div className="flex justify-end gap-4">
            <CButton
              className=" border-colorScBlue text-colorScBlue border bg-transparent w-fit"
              onClick={() => setIsMergeTicket(false)}
            >
              Cancel
            </CButton>
            <CButton
              className="bg-green w-fit text-white rounded-lg py-2 font-medium hover:bg-green"
              onClick={() => setIsMergeTicket(false)}
            >
              Execute
            </CButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEscalateTicket}
        onClose={() => setIsEscalateTicket(false)}
      >
        <div className="p-6 max-w-2xl w-full">
          <h1 className="text-2xl font-bold dark:text-white mb-4">
            Escalate Ticket
          </h1>

          <Select
            label="Escalation Level"
            options={[
              { value: "Tier 2 Analyst", label: "Tier 2 Analyst" },
              { value: "Security Manager", label: "Security Manager" },
            ]}
          />

          <div className="flex justify-end gap-4">
            <CButton
              className=" border-gray-300 border bg-transparent w-fit"
              onClick={() => setIsEscalateTicket(false)}
            >
              Cancel
            </CButton>
            <CButton
              className="bg-green w-fit text-white rounded-lg py-2 font-medium hover:bg-green"
              onClick={() => setIsEscalateTicket(false)}
            >
              Execute
            </CButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewTicketDetails;
