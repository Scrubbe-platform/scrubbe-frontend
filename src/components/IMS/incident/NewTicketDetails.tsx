"use client";

import React, { useState } from "react";
import Modal from "../../ui/Modal";
import Select from "../../ui/select";
import CButton from "../../ui/Cbutton";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import TicketComments from "../../IncidentTicket/TicketComments";
import useTicketDetails from "@/hooks/useTicketDetails";
import History from "../../IncidentTicket/History";
import NewEditIncidentTicket from "./NewEditIncidentTicket";
import Collaboration from "../../IncidentTicket/Collaboration";

const TABS = ["Details", "Comments", "Timeline", "Collaboration"];

const NewTicketDetails = () => {
  const [tab, setTab] = useState(0);
  const [isExcuteLockAccount, setIsExcuteLockAccount] = useState(false);
  const [isMergeTicket, setIsMergeTicket] = useState(false);
  const [isEscalateTicket, setIsEscalateTicket] = useState(false);
  const router = useRouter();
  const ticketQuery = useTicketDetails();
  const ticket = ticketQuery.data ?? null;

  if (ticketQuery.isLoading) {
    return (
      <div className="bg-dark text-white p-6 space-y-4">
        <div className="h-6 w-48 rounded-md bg-white/10" />
        <div className="h-24 rounded-xl bg-white/[0.03]" />
        <div className="h-96 rounded-xl bg-white/[0.03]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-dark text-white p-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h1 className="text-2xl font-bold">Incident not found</h1>
          <p className="mt-3 text-sm text-slate-400">
            This incident could not be resolved from the current route.
          </p>
          <button
            type="button"
            onClick={() => router.push("/incident/tickets")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-green-500/40 px-4 py-2 text-sm font-semibold text-green-400"
          >
            <ChevronLeft size={16} />
            Back to incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-white">
      <div className="p-6 mx-auto w-full">
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer text-white"
          onClick={() => router.push("/incident/tickets")}
        >
          <ChevronLeft />
          <h1 className="text-xl font-bold text-white">{ticket.ticketId}</h1>
        </div>

        <p className="font-semibold mb-2">
          {ticket.title ?? "Incident details"}
        </p>
        <p className="text-sm mb-2">
          {ticket.summary ||
            ticket.techDescription ||
            "Review the live incident record, collaborate with responders, and track the timeline from one shared contract."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div>{ticket.state ?? ticket.status}</div>
          <div>{ticket.severity ?? ticket.priority}</div>
          <p className="p-1 px-2 text-xs rounded-md capitalize border">
            {ticket.environment || "Unknown environment"} /{" "}
            {ticket.region || "Unknown region"}
          </p>
          <p className="p-1 px-2 text-xs rounded-md capitalize border">
            {ticket.service}
          </p>
          <p className="p-1 px-2 text-xs rounded-md capitalize border">
            {ticket.sourceType}
          </p>
        </div>

        <div className="flex gap-8 border-b border-gray-400 mb-6">
          {TABS.map((item, index) => (
            <button
              key={item}
              className={`py-2 px-2 flex-1 text-sm font-medium border-b-2 transition-colors ${
                tab === index
                  ? "border-IMSCyan text-IMSCyan"
                  : "border-transparent text-white hover:text-IMSCyan"
              }`}
              onClick={() => setTab(index)}
            >
              {item}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 0 && <NewEditIncidentTicket />}
          {tab === 1 && <TicketComments ticket={ticket} />}
          {tab === 2 && <History />}
          {tab === 3 && <Collaboration ticket={ticket} />}
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
              className="border-gray-300 border bg-transparent w-fit"
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
              className="border-colorScBlue text-colorScBlue border bg-transparent w-fit"
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
              className="border-gray-300 border bg-transparent w-fit"
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
