import AiStarIcon from "@/components/icons/ai-star";
import CButton from "@/components/ui/Cbutton";
import { Building, ShieldCheck } from "lucide-react";
import React, { ReactNode } from "react";
import { FaCodeBranch } from "react-icons/fa";
import Sidebar from "./_module/sidebar";
import RightContent from "./_module/right-content";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="dark:bg-dark min-h-screen p-6">
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold dark:text-white">Settings</p>
      </div>
      <p className="text-sm dark:text-white mt-4">
        Configure governance, integrations, delivery failure ingestion, Ezra,
        Code Engine, and security controls (including SSO).
      </p>

      <div className="flex mt-5 gap-5">
        <div className="flex-[.3]">
          <Sidebar />
        </div>
        <div className="flex-1">{children}</div>
        
      </div>
    </div>
  );
};

export default layout;
