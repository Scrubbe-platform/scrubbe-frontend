"use client";
import MetricCard from "@/components/IMS/Dashboard/MetricCard";
import SlaCard from "@/components/IMS/Dashboard/SLACard";
import ActiveIncidentTable from "@/components/IMS/Portal/ActiveIncidentTable";
import CButton from "@/components/ui/Cbutton";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { BiLike } from "react-icons/bi";
import { FaClock, FaUser } from "react-icons/fa";
import { MdBookmark } from "react-icons/md";

const Page = () => {
  const router = useRouter();
  return (
    <div className=" space-y-6">
      <div className="flex justify-between items-center">
        <p className=" text-xl font-bold">ITSM Enterprise Dashboard</p>
        <CButton
          className=" w-fit"
          onClick={() => router.push("/portal/ticket")}
        >
          Raise Incident <Plus />
        </CButton>
      </div>

      <div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Average Resolution Time"
            value="0hrs"
            icon={<FaClock size={20} />}
            iconColor="bg-blue-50 text-blue-700"
          />
          <SlaCard
            value="CSAT Score"
            title="0%"
            compliance={92}
            icon={<BiLike size={20} />}
            iconColor="bg-emerald-50 text-emerald-700"
          />
          <SlaCard
            value="First Contact Resolution"
            title="0%"
            compliance={78}
            icon={<FaUser size={20} />}
            iconColor="bg-purple-100 text-purple-700"
          />
          <MetricCard
            title="Open Incidents"
            value="0"
            icon={<MdBookmark size={20} />}
            iconColor="bg-emerald-50 text-emerald-700"
          />
        </div>
      </div>

      <ActiveIncidentTable />
    </div>
  );
};

export default Page;
