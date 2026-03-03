"use client";
import { usePostMortermForm } from "@/lib/stores/post-morterm";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = [
  "Basic Details",
  "Root Cause Analysis",
  "Resolution Details",
  "Knowledge base draft",
  "Follow up actions",
];
const Page = () => {
  const [tab, setTab] = useState(1);
  const { back } = useRouter();
  const { incident } = usePostMortermForm();
  const { id } = useParams();
  console.log({ incident });
  useEffect(() => {
    if (!incident) {
      back();
    }
  }, []);
  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-bold dark:text-white text-black">
        Postmortems
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
                <p className=" text-base font-light">{id}</p>
              </div>

              {/* Date Resolved */}
              <div>
                <h2 className="text-lg font-medium  mb-1">Date Resolved :</h2>
                <p className=" text-base font-light">
                  {incident?.ResolveIncident.updatedAt}
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
          {tab === 2 && (
            <div className="space-y-6">
              {/* Cause Category */}
              <div>
                <h2 className=" text-base font-bold text-gray-700">
                  Cause Category :
                </h2>
                <p className="text-gray-900 mt-1 text-base ">
                  {incident?.ResolveIncident.causeCategory}
                </p>
              </div>

              {/* Root cause */}
              <div>
                <h2 className=" text-base font-bold text-gray-700">
                  Root cause :
                </h2>
                <p className="text-gray-900 mt-1">
                  {incident?.ResolveIncident.rootCause}
                </p>
              </div>

              {/* 5 Whys Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  5 Whys:
                </h2>

                {/* Why 1 */}
                <div className="mb-4">
                  <h3 className=" text-base font-bold text-gray-900">Why 1</h3>
                  <p className="text-gray-700 mt-1">
                    {incident?.ResolveIncident.why1}
                  </p>
                </div>

                {/* Why 2 */}
                <div className="mb-4">
                  <h3 className=" text-base font-bold text-gray-900">Why 2:</h3>
                  <p className="text-gray-700 mt-1">
                    {incident?.ResolveIncident.why2}
                  </p>
                </div>

                {/* Why 3 */}
                <div className="mb-4">
                  <h3 className=" text-base font-bold text-gray-900">Why 3:</h3>
                  <p className="text-gray-700 mt-1">
                    {incident?.ResolveIncident.why3}
                  </p>
                </div>

                {/* Why 4 */}
                <div className="mb-4">
                  <h3 className=" text-base font-bold text-gray-900">Why 4:</h3>
                  <p className="text-gray-700 mt-1">
                    {incident?.ResolveIncident.why4}
                  </p>
                </div>

                {/* Why 5 */}
                <div className="mb-4">
                  <h3 className=" text-base font-bold text-gray-900">Why 5:</h3>
                  <p className="text-gray-700 mt-1">
                    {incident?.ResolveIncident.why5}
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === 3 && (
            <div className="space-y-6">
              {/* Temporary Fix section */}
              <div>
                <h2 className="text-lg font-bold mb-2">Temporary Fix :</h2>
                <div className="list-none space-y-1  text-base font-light">
                  <p>{incident?.ResolveIncident.temporaryFix}</p>
                </div>
              </div>

              {/* Permanent Fix section */}
              <div>
                <h2 className="text-lg font-bold mb-2">Permanent Fix</h2>
                <p className="list-none space-y-1  text-base font-light">
                  {incident?.ResolveIncident?.permanentFix}
                </p>
              </div>
            </div>
          )}

          {tab === 4 && (
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <h2 className="text-lg font-bold mb-1">Title :</h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.knowledgeTitleInternal}
                </p>
              </div>

              {/* Summary Section */}
              <div>
                <h2 className="text-lg font-bold mb-1">Summary</h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.knowledgeSummaryInternal}
                </p>
              </div>

              {/* Identification Steps Section */}
              <div>
                <h2 className="text-lg font-bold mb-2">
                  Identification Steps:
                </h2>
                <p>{incident?.ResolveIncident?.resolutionStepsInternal}</p>
              </div>

              {/* Resolution Steps Section */}
              <div>
                <h2 className="text-lg font-bold mb-2">Resolution Steps:</h2>
                <div className="list-disc list-inside space-y-1">
                  {incident?.ResolveIncident?.resolutionStepsInternal}
                </div>
              </div>

              {/* Preventive Measures Section */}
              <div>
                <h2 className="text-lg font-bold mb-2">Preventive measures</h2>
                <p className="list-disc list-inside space-y-1">
                  {incident?.ResolveIncident?.preventiveMeasuresInternal}
                </p>
              </div>

              {/* Tags Section */}
              <div>
                <h2 className="text-lg font-bold mb-2">Tags</h2>
                <div className="flex space-x-2">
                  {incident?.ResolveIncident?.knowledgeTagsInternal?.map(
                    (tag) => (
                      <span
                        key={tag}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold mb-2">Follow up task</h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.followUpTask}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Follow up owner</h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.followUpOwner}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Follow up due date</h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.followUpDueDate}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">Follow up status</h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.followUpStatus}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2">
                  Follow up ticketing systems
                </h2>
                <p className=" text-base">
                  {incident?.ResolveIncident?.followUpTicketingSystems}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
