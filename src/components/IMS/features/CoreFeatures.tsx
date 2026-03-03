import React from "react";
import { FaScroll } from "react-icons/fa";
import { IoIosVideocam } from "react-icons/io";
import { PiStarFourFill, PiWarningFill } from "react-icons/pi";
import { RiDashboardFill, RiSettings4Fill } from "react-icons/ri";

const features = [
  {
    Icon: RiDashboardFill,
    title: "Unified Incident Dashboard",
    description:
      "Centralized interface to view, track, and manage incidents by severity, priority, and source.",
  },
  {
    Icon: RiSettings4Fill,
    title: "Automated Detection & Alerts",
    description:
      "Real-time incident detection from GitHub, GitLab, or cloud APIs with instant notifications.",
  },
  {
    Icon: PiStarFourFill,
    title: "AI-Powered Root Cause Analysis",
    description:
      "AI-driven analysis of logs, events, and metrics to pinpoint root causes quickly.",
  },
  {
    Icon: PiWarningFill,
    title: "Priority & SLA Management",
    description:
      "Automated incident classification and SLA tracking for compliance and efficiency.",
  },
  {
    Icon: IoIosVideocam,
    title: "Collaborative War Room",
    description:
      "Unite DevOps, SREs, and Security teams for seamless incident resolution.",
  },
  {
    Icon: FaScroll,
    title: "Post-Incident Review & Insights",
    description:
      "Automated post-mortem reports and trend analysis for continuous improvement.",
  },
];
const CoreFeatures = () => {
  return (
    <div className="sm:p-10 p-4 min-h-screen bg-white container mx-auto">
      <div className="bg-IMSDarkGreen md:p-10 p-4 rounded-2xl">
        <p className="text-4xl sm:text-5xl text-white font-bigshotOne">
          Core Features
        </p>
        <p className=" md:text-lg text-white font-semibold max-w-2xl">
          From real-time detection to automated resolution, 11pce empowers
          enterprises to respond faster, collaborate smarter, and build
          resilient systems.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {features.map(({ Icon, description, title }) => (
            <div
              key={title}
              className=" bg-white h-[250px] rounded-lg p-5 gap-3 flex flex-col "
            >
              <div className="bg-emerald-100 size-10 rounded-full flex items-center justify-center text-IMSLightGreen">
                <Icon color="28a745" size={23} />
              </div>
              <p className=" text-xl md:text-2xl font-semibold">{title}</p>
              <p>{description}</p>
              <p></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoreFeatures;
