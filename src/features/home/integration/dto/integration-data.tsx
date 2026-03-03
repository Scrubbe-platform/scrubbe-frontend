import { FaAws } from "react-icons/fa6";
import { FaMicrosoft } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa6";
import { SiDatadog } from "react-icons/si";
import { SiSplunk } from "react-icons/si";
import { MdOutlineSecurity } from "react-icons/md";
import { SiElasticcloud } from "react-icons/si";
import { FaDatabase } from "react-icons/fa6";

export const integrationData = [
  {
    id: "0",
    title: "AWS",
    description: "Monitor CloudTrail, GuardDuty, and S3 security",
    icon: <FaAws size={40} />,
    bgColor: "#5a8cf7",
    hoverBgColor: "#3a6fd6",
  },
  {
    id: "1",
    title: "Azure",
    description: "Ingest Azure Sentinel and Azure Monitor data",
    icon: <FaMicrosoft size={40} />,
    bgColor: "#b18fd7",
    hoverBgColor: "#8f6bb5",
  },
  {
    id: "2",
    title: "GCP",
    description: "Connect with Google Cloud Security Command Center",
    icon: <FaGoogle size={40} />,
    bgColor: "#e38d8d",
    hoverBgColor: "#c06a6a",
  },
  {
    id: "3",
    title: "Datadog",
    description: "Seamless integration with Datadog monitoring",
    icon: <SiDatadog size={40} />,
    bgColor: "#c7c5f7",
    hoverBgColor: "#a9a6e0",
  },
  {
    id: "4",
    title: "Splunk",
    description: "Two-way data exchange with Splunk",
    icon: <SiSplunk size={40} />,
    bgColor: "#8bb8fd",
    hoverBgColor: "#5d9bfb",
  },
  {
    id: "5",
    title: "CrowdStrike",
    description: "Endpoint detection and response",
    icon: <MdOutlineSecurity size={40} />,
    bgColor: "#bc9bd4",
    hoverBgColor: "#9d78b6",
  },
  {
    id: "6",
    title: "Elastic",
    description: "Ingest and analyze Elasticsearch data",
    icon: <SiElasticcloud size={40} />,
    bgColor: "#ae5f5f",
    hoverBgColor: "#8c4545",
  },
  {
    id: "7",
    title: "Data Lake",
    description: "Connect to any S3 or Azure Data Lake",
    icon: <FaDatabase size={40} />,
    bgColor: "#a9a6eb",
    hoverBgColor: "#8784d1",
  },
];