/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ProgressBar from "@/components/ezra/ProgressBar";
import TicketComments from "@/components/IMS/Portal/TicketComment";
import History from "@/components/IncidentTicket/History";
import usePortalTicketDetails from "@/hooks/usePortalTicketDetails";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const TABS = [
  "Details",
  "Comments",
  // "Collaboration",
  "History",
  // "Threat intel",
];
const Page = () => {
  const [tab, setTab] = useState(0);
  const { data, isLoading } = usePortalTicketDetails();
  const router = useRouter();
  const ticket = data as any;

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
    <div className="bg-white p-8 rounded-lg w-full max-w-5xl mx-auto ">
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
                  {ticket?.ticketNumber}
                </div>
                {/* <div className="text-gray-500 dark:text-gray-200">
                  Username :
                </div>
                <div className=" text-right dark:text-white">
                  {ticket?.userName}
                </div> */}
                <div className="text-gray-500 dark:text-gray-200">Title:</div>
                <div className="text-right dark:text-white">
                  {ticket?.shortDescription}
                </div>
                <div className="text-gray-500 dark:text-gray-200">Status:</div>
                <div className="text-right dark:text-white">
                  {ticket?.status}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Priority:
                </div>
                <div className="text-right dark:text-white">
                  {ticket?.priority}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Category:
                </div>
                <div className="text-right dark:text-white">
                  {ticket?.category}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  SLA Progress:
                </div>
                <div className=" dark:text-white flex justify-end ">
                  <div className="flex flex-col items-center max-w-40 w-full ">
                    <p>{ticket?.slaStatus ?? "70"}%</p>
                    <ProgressBar value={70} color="bg-IMSLightGreen" />
                  </div>
                </div>
                <div className="text-gray-500 dark:text-gray-200 ">
                  Date Created:
                </div>
                <div className="text-right dark:text-white">
                  {moment(ticket?.createdAt).format("YYYY-MM-DD")}
                </div>
                <div className="text-gray-500 dark:text-gray-200">
                  Description:
                </div>
                <div className="text-right dark:text-white">
                  {ticket?.description}
                </div>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {tab === 1 && <TicketComments ticket={ticket} />}

          {/* Collaboration Tab */}
          {/* {tab === 2 && <Collaboration ticket={ticket} />} */}

          {/* History Tab */}
          {tab === 2 && <History />}

          {/* Threat intel Tab */}
          {/* {tab === 4 && <TreatIntel />} */}
          {/* Other tabs can be implemented as needed */}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
