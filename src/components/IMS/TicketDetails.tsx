"use client";
import React, { useState } from "react";
import Modal from "../ui/Modal";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import EditIncidentTicket from "./EditIncidentTicket";
import TicketComments from "../IncidentTicket/TicketComments";
import useTicketDetails from "@/hooks/useTicketDetails";
import Collaboration from "../IncidentTicket/Collaboration";
import History from "../IncidentTicket/History";
import TreatIntel from "../IncidentTicket/TreatIntel";
import { Ticket } from "@/types";

const TABS = [
  "Details",
  "Comments",
  "Collaboration",
  "History",
  // "Threat intel",
];

const TicketDetails = () => {
  const [tab, setTab] = useState(0);
  const [isExcuteLockAccount, setIsExcuteLockAccount] = useState(false);
  const [isMergeTicket, setIsMergeTicket] = useState(false);
  const [isEscalateTicket, setIsEscalateTicket] = useState(false);
  const router = useRouter();
  const { data } = useTicketDetails();
  const ticket = data as Ticket;

  return (
    <div className="">
      <div className="p-6 mx-auto w-full">
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer dark:text-white"
          onClick={() => router.back()}
        >
          <ChevronLeft />{" "}
          <h1 className="text-xl font-bold dark:text-white">
            Incident Details #({data?.ticketId})
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-IMSLightGreen text-IMSLightGreen"
                  : "border-transparent text-gray-500  dark:text-gray-400 hover:text-green"
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
          {tab === 0 && <EditIncidentTicket />}
          {/* {tab === 1 && <TicketComments ticket={ticket} />} */}

          {/* Collaboration Tab */}
          {tab === 2 && <Collaboration ticket={ticket} />}

          {/* History Tab */}
          {tab === 3 && <History />}

          {/* Threat intel Tab */}
          {tab === 4 && <TreatIntel />}
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

export default TicketDetails;
