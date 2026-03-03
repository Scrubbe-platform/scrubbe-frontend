"use client";
import AiSuggestion from "@/components/IMS/Dashboard/AiSuggestion";
import useTicketDetails from "@/hooks/useTicketDetails";
import { Ticket } from "@/types";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TABS = ["Incident Details", "AI Suggestions", "Next Action"];
const Page = () => {
  const [tab, setTab] = useState(1);
  const { back } = useRouter();
  const { data } = useTicketDetails();

  const incident = data as Ticket

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold dark:text-white text-black">
        AI Suggestion
      </div>
      <div className=" p-4 bg-white rounded-lg space-y-4">
        <div
          onClick={() => back()}
          className="flex items-center gap-1 text-sm cursor-pointer"
        >
          <ChevronLeft size={18} />
          Back
        </div>
        <div className="flex gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`py-2 px-2 text-sm font-medium border-b-2 transition-colors ${
                tab === i + 1
                  ? "border-green text-green"
                  : "border-transparent  dark:text-gray-400 hover:text-green"
              }`}
              onClick={() => setTab(i + 1)}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 1 && (
            <div className="space-y-6">
              {/* Incident ID */}
              <div>
                <h2 className="text-lg font-medium  mb-1">Incident ID :</h2>
                <p className=" text-base font-light">{incident?.ticketId}</p>
              </div>

              {/* Date Resolved */}
              <div>
                <h2 className="text-lg font-medium  mb-1">Date Resolved :</h2>
                <p className=" text-base font-light">
                  {incident?.ResolveIncident?.updatedAt}
                </p>
              </div>

              {/* Incident Title */}
              <div>
                <h2 className="text-lg font-medium  mb-1">Incident Title</h2>
                <p className=" text-base font-light">{incident?.reason}</p>
              </div>

              {/* Incident Description */}
              <div>
                <h2 className="text-lg font-medium  mb-1">
                  Incident Description
                </h2>
                <p className=" text-base font-light">{incident?.description}</p>
              </div>

              {/* Priority */}
              <div>
                <h2 className="text-lg font-medium  mb-1">Priority :</h2>
                <p className=" text-base font-light">{incident?.priority}</p>
              </div>

              {/* Assigned to */}
              <div>
                <h2 className="text-lg font-medium  mb-1">Assigned to :</h2>
                <p className=" text-base font-light">
                  {incident?.assignedToEmail ?? "N/A"}
                </p>
              </div>
            </div>
          )}
          {tab === 2 && <AiSuggestion />}
          {tab === 3 && <div></div>}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
