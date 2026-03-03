/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Modal from "../ui/Modal";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import TicketComments from "./TicketComments";
import Collaboration from "./Collaboration";
import History from "./History";
import TreatIntel from "./TreatIntel";
import { motion } from "framer-motion";
import moment from "moment";
import PostMortem from "./PostMortem";
import useTicketDetails from "@/hooks/useTicketDetails";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import EditIncidentTicket from "../IMS/EditIncidentTicket";
import { Ticket } from "@/types";
// import { Ticket } from './IncidateTicketPage';

const TABS = [
  "Details",
  "Comments",
  "Collaboration",
  "History",
  "Threat intel",
];

// type TicketDetailsProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   ticket: Ticket;
// };

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

const TicketDetails = () => {
  const [tab, setTab] = useState(0);
  const [isExcuteLockAccount, setIsExcuteLockAccount] = useState(false);
  const [isMergeTicket, setIsMergeTicket] = useState(false);
  const [isEscalateTicket, setIsEscalateTicket] = useState(false);
  const [openPostMortem, setOpenPostMortem] = useState(false);
  const { data, isLoading } = useTicketDetails();
  const ticket = data as Ticket;
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto w-full flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-[60%] rounded-md bg-gray-200" />
        <div className="grid grid-cols-5 gap-4">
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="p-6 mx-auto w-full">
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer"
          onClick={() => router.back()}
        >
          <ChevronLeft />{" "}
          <h1 className="text-2xl font-bold dark:text-white">Ticket Details</h1>
        </div>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-green text-green"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-green"
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
          {tab === 0 && (
            <div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-base">
                <div className="text-gray-500 dark:text-gray-200">
                  Incident ID :
                </div>
                <div className=" text-right dark:text-white">
                  {ticket?.ticketId}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Username :
                </div>
                <div className=" text-right dark:text-white">
                  {ticket?.userName}
                </div>
                <div className="text-gray-500 dark:text-gray-200">Reason:</div>
                <div className="text-right dark:text-white">
                  {ticket?.reason}
                </div>
                <div className="text-gray-500 dark:text-gray-200">Created:</div>
                <div className="text-right dark:text-white">
                  {moment(ticket?.createdAt).format("YYYY-MM-DD")}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Risk Score:
                </div>
                <div className="text-right dark:text-white">
                  {ticket?.riskScore}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  SLA status:
                </div>
                <div className="text-right dark:text-white">
                  Due {ticket?.slaStatus}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Recommended Actions :
                </div>
                <div className="text-right dark:text-white capitalize">
                  {ticket?.recommendedActions.map(
                    (action) => `${action.split("_").join(" ").toLowerCase()}, `
                  )}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Related Logs :
                </div>
                <div className="text-right dark:text-white">
                  <a href="#" className="text-blue-700 underline">
                    View SIEM logs
                  </a>
                </div>
              </div>
              {IS_STANDALONE ? null : (
                <div className="mb-4 text-base">
                  <div className="font-semibold dark:text-white mb-2">
                    Recommended Playbooks :
                  </div>
                  {ticket?.recommendedActions?.map((action) => (
                    <div
                      key={action}
                      className="flex items-center justify-between gap-3 mb-2"
                    >
                      <span className="w-44 dark:text-white capitalize">
                        {action.split("_").join(" ").toLowerCase()}
                      </span>
                      <div>
                        <span className="bg-yellow-100 text-yellow-700 rounded px-3 py-1 text-xs font-medium">
                          Pending
                        </span>
                        <button
                          className="ml-2 border border-green text-green rounded text-sm px-3 py-1 font-medium hover:bg-blue-50 transition-colors"
                          onClick={() => setIsExcuteLockAccount(true)}
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-4 text-base">
                <div className="font-semibold dark:text-white mb-2">
                  Playbook Status
                </div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="w-44 dark:text-white">Lock Account</span>
                  <span className="bg-yellow-100 text-yellow-700 rounded px-3 py-1 text-xs font-medium">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="w-44 dark:text-white">Notify User</span>
                  <span className="bg-yellow-100 text-yellow-700 rounded px-3 py-1 text-xs font-medium">
                    Pending
                  </span>
                </div>
              </div>
              <div className="my-6">
                <EditIncidentTicket />
              </div>

              {/* Action Buttons */}
              {/* <div className="grid grid-cols-3 gap-3 mb-3 text-base">
                <button
                  className="bg-green text-white border rounded-lg py-2 font-medium hover:bg-green"
                  onClick={() => setIsMergeTicket(true)}
                >
                  Merge Tickets
                </button>
                <button
                  onClick={() => setIsEscalateTicket(true)}
                  className="bg-green text-white border rounded-lg py-2 font-medium hover:bg-green"
                >
                  Escalate
                </button>
               
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3 text-base">
                <button className="bg-green text-white rounded-lg py-2 font-medium hover:bg-green">
                  Sync to Jira
                </button>
                <button className="bg-green text-white rounded-lg py-2 font-medium hover:bg-green">
                  Sync to Servicenow
                </button>
                <button className="bg-green text-white rounded-lg py-2 font-medium hover:bg-green">
                  Sync to Freshdesk
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-base">
                <button
                  onClick={() => setOpenPostMortem(true)}
                  className="bg-green text-white rounded-lg py-2 font-medium hover:bg-green"
                >
                  Post Mortem
                </button>

              
              </div> */}
            </div>
          )}

          {/* Comments Tab */}
          {/* {tab === 1 && <TicketComments ticket={ticket} />} */}

          {/* Collaboration Tab */}
          {tab === 2 && <Collaboration ticket={ticket} />}

          {/* History Tab */}
          {tab === 3 && <History />}

          {/* Threat intel Tab */}
          {tab === 4 && <TreatIntel />}
          {/* Other tabs can be implemented as needed */}
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

      <Modal
        className="!p-0 !min-w-[800px]"
        isOpen={openPostMortem}
        onClose={() => setOpenPostMortem(false)}
      >
        <PostMortem ticket={ticket} onClose={() => setOpenPostMortem(false)} />
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
