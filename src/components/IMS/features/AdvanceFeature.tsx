"use client";
import React, { ReactNode, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";

const featureTabs = [
  "Detection",
  "Response",
  "Resolution",
  "Analysis",
  "Resilience",
  "Automation",
  "Chaos Engineering",
];
const AdvanceFeature = () => {
  const [selectTab, setSelectTab] = useState(featureTabs[0]);

  let content: ReactNode;
  switch (selectTab) {
    case featureTabs[0]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">Detection Capabilities</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Custom Integrations — Connect to CI/CD pipelines, cloud providers,
              or monitoring tools. 
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Proactive Monitoring & Predictive Analytics — Forecast incidents
              using AI and chaos engineering
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;
    case featureTabs[1]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">Response Tools</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Access Control (RBAC) — Granular permissions for Admins, Analysts,
              and Viewers.
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Mobile App for On-the-Go Management — Real-time incident response
              via iOS and Android
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Global Team Support — Multi-language and time zone-aware
              interfaces{" "}
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;
    case featureTabs[2]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">Resolution Features</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              API-First Architecture — Full REST API support for automation and
              custom workflows. 
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Vendor & Third-Party Incident Management — Collaborate with
              external partners
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;
    case featureTabs[3]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">Analysis Insights</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Audit & Compliance Logs — Full traceability of incident actions.. 
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Climate Resilience Intelligence — Predict weather-related
              disruptions
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Advanced Analytics & Custom KPIs — Tailored dashboards for
              business insights.{" "}
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;
    case featureTabs[4]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">Resilience Measures</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Data Encryption & Privacy — 256-bit encryption and read-only
              tokens
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              High Availability & Disaster Recovery — Geo-redundant deployments
              for uptime.
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;
    case featureTabs[5]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">Automation Features</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Customizable Runbooks & Automation Scripts — Low-code playbooks
              for resolutions
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Training & Simulation Modules — Virtual drills for team
              readiness. 
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Compliance Automation — One-click compliance reporting.{" "}
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;
    case featureTabs[6]:
      content = (
        <div className=" space-y-2">
          <p className="text-lg font-medium">
            Compliance Automation — One-click compliance reporting.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              AI-Driven Chaos Experiments — Simulate failures using natural
              language prompts. 
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Fault Injection Library — Kubernetes-native chaos simulations
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Cloud-Native Resilience Testing — Multi-cloud fault simulations{" "}
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Network Chaos Simulation — Precise traffic control. {" "}
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex gap-2">
              <FaCheck size={18} className=" text-IMSLightGreen" />
              Enterprise Chaos Orchestration — Full lifecycle management. 
            </span>
            <div className="flex text-IMSLightGreen gap-2 items-center">
              <span>Learn more</span>
              <FaArrowRightLong />
            </div>
          </div>
        </div>
      );
      break;

    default:
      break;
  }
  return (
    <div className=" min-h-[400px] container mx-auto py-10 md:px-10 px-4">
      <p className="text-4xl sm:text-5xl text-center font-bigshotOne">
        Advanced Features
      </p>
      <div className="flex flex-col mt-4 max-w-6xl mx-auto overflow-clip">
        <div className="overflow-x-auto pb-4">
          <div className="flex flex-row gap-3 mx-auto  justify-between w-full border-b border-zinc-200 ">
            {featureTabs.map((tab) => (
              <div
                className={`${
                  tab === selectTab &&
                  "text-IMSLightGreen border-b-2 border-IMSLightGreen"
                } pb-2 cursor-pointer text-nowrap`}
                key={tab}
                onClick={() => setSelectTab(tab)}
              >
                <p>{tab}</p>
              </div>
            ))}
          </div>
        </div>
        <div className=" border p-4 rounded-md border-neutral-200 mt-4">
          {content}
        </div>
      </div>
    </div>
  );
};

export default AdvanceFeature;
