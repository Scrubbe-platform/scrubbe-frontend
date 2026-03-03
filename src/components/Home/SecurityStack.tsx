"use client";
import { MoveRight } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

const securityStack = [
  {
    title: "Playbook Builder-Response Automation",
    description:
      "Orchestrate your fraud and incident response from a single visual editor. Drag-and-drop actions to define triggers, responses, and notifications across Slack, PagerDuty, internal APIs, and more.",
    features: [
      "Account lockout upon risky activity",
      "	Analyst assignment and escalation ",
      "Slack/email alerts with context and playbook audit trail",
    ],
    featureName: "Automate",
    bgColor: "bg-colorScBlue lg:top-0 top-[100px]",
    color: "text-white",
    cta: "Get started",
  },
  {
    title: "SIEM Ingestion & Detection Engine",
    description:
      "Connect data from AWS, Azure, GitHub, GCP, APIs, and databases. Scrubbe ingests logs, normalizes data, correlates across sources, and sends it into a rule engine for high-fidelity detection.",
    features: [
      "JSON/syslog/API ingest pipeline",
      "Field mapping, parsing, and enrichment",
      "Auto-correlation of multi-source behavior",
    ],
    featureName: "Include",
    bgColor: "bg-colorScIndigo lg:top-0 top-[150px]",
    color: "text-white",
    cta: "Get started",
  },
  {
    title: "Fraud-Aware APIs for Transactions, Sessions, Logins",
    description:
      "Use our REST APIs to detect fraud signals in real-time across account creation, login, session continuation, and payment attempts. Designed for fast decisioning in production environments.",
    features: [
      "JSON/syslog/API ingest pipeline",
      "Field mapping, parsing, and enrichment",
      "Auto-correlation of multi-source behavior",
    ],
    featureName: "Includes",
    bgColor: "bg-cyan-500 lg:top-0 top-[200px]",
    color: "text-white",
    cta: "Go to API Documentation",
  },
  {
    title: "Incident Management & Alert Routing",
    description:
      "Scrubbe transforms raw signals into structured incidents — complete with timelines, analysts, severity scores, and playbook responses.",
    features: [
      "Real-time incident queue & triage dashboard",
      "Severity scoring with AI context (via Ezra) ",
      "Analyst assignment & response timeline",
    ],
    featureName: "What It Includes",
    bgColor: "bg-orange-400 lg:top-0 top-[250px]",
    color: "text-black",
    cta: "Explore the Incident Dashboard",
  },
  {
    title: "Behavioral Anomaly Dashboards",
    description:
      "Visualize user and system anomalies as they emerge. Scrubbe ships with pre-built dashboards for login abuse, credential stuffing, phishing, suspicious sessions, geolocation risk, and device anomalies.",
    features: [
      "Group & per-user drilldowns",
      "View by session, fingerprint, IP, endpoint",
      "Analyst filters, timestamps, and live updates",
    ],
    featureName: "Feature",
    bgColor: "bg-colorScGreen lg:top-0 top-[300px]",
    color: "text-white",
    cta: "Get started",
  },
  {
    title: "Scrubbe Authentication SDK",
    description:
      "Deploy our client-side SDKs to capture behavioral biometrics, fingerprint data, and session activity. Available for web, mobile, and server environments with seamless setup.",
    features: [
      "JavaScript, Python, Node.js, React Native",
      "Custom event tracking",
    ],
    featureName: "Support",
    bgColor: "bg-colorScLightBlue lg:top-0 top-[350px]",
    color: "text-black",
    cta: "Install the SDK Now",
  },
];

// Helper hook to detect mobile
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, [breakpoint]);
  return isMobile;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const SecurityStack = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const isMobile = useIsMobile();
  return (
    <section className="h-full relative bg-gradient-to-b from-white to-gray-50 px-4 md:px-6 lg:px-20 xl:px-20 py-20 overflow-clip">
      <div className=" max-w-[1600px] mx-auto space-y-8 ">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold  text-center mb-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            From Ingestion to Automation — One Unified
            <br className=" md:block hidden" /> Security Stack
          </motion.h2>
          <motion.div
            className="w-24 h-2 bg-teal-400 mx-auto mb-12 rounded-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
        </motion.div>
        <motion.p
          className=" md:text-lg text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Scrubbe combines data ingestion, behavior analysis, AI playbooks, and
          incident response in a <br className=" md:block hidden" /> single
          connected platform.
        </motion.p>
        <motion.div
          className="hidden lg:flex lg:flex-row flex-col lg:-space-x-[10%] lg:space-y-0 -space-y-[400px] items-center justify-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {securityStack.map((stack, index) => {
            const isActive = activeCard === index;
            // Animate horizontally on desktop, vertically on mobile
            let inactiveAnim = {};
            if (typeof activeCard === "number") {
              inactiveAnim = isMobile
                ? {
                    scale: 0.92,
                    opacity: 0.5,
                    y: index < activeCard ? -60 : 60,
                    x: 0,
                  }
                : {
                    scale: 0.92,
                    opacity: 0.5,
                    x: index < activeCard ? -60 : 60,
                    y: 0,
                  };
            }
            return (
              <motion.div
                key={index}
                layout
                variants={itemVariants}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`w-[300px] overflow-hidden md:w-[362px] min-h-[473px] rounded-xl relative shadow-sm transition-all duration-200 hover:shadow-2xl ${stack.bgColor} ${stack.color} cursor-pointer`}
                style={{
                  zIndex: isActive ? 10 : 1,
                  position: isActive ? "relative" : "static",
                }}
                animate={
                  activeCard === null
                    ? { scale: 1, opacity: 1, x: 0, y: 0 }
                    : isActive
                    ? {
                        scale: 1.08,
                        opacity: 1,
                        x: 0,
                        y: 0,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                      }
                    : inactiveAnim
                }
                onClick={() => setActiveCard(isActive ? null : index)}
              >
                <div className=" flex flex-col justify-between p-4 h-[473px] relative">
                  <img
                    src="/card-bg.png"
                    className=" absolute h-full w-full object-cover opacity-25"
                    alt="card-bg.png"
                  />
                  <div className=" space-y-3 h-full">
                    <h2 className=" font-medium text-xl">{stack.title}</h2>
                    <p>{stack.description}</p>
                    <div>
                      <p>{stack.featureName}:</p>
                      <ul className=" list-disc pl-5">
                        {stack.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-medium text-sm flex-1 cursor-pointer">
                    {stack.cta} <MoveRight />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="min-h-[1800px] relative lg:hidden">
          <div className="flex flex-col gap-4 items-center justify-center">
            {securityStack.map((stack, index) => (
              <div
                key={index}
                className={`sticky w-full ${stack.bgColor} ${stack.color} min-h-[473px] rounded-xl shadow-sm transition-all duration-200 hover:shadow-2xl  cursor-pointer`}
              >
                <div className="flex flex-col justify-between p-4 h-[473px] relative">
                  <img
                    src="/card-bg.png"
                    className="absolute inset-0 h-full w-full object-cover opacity-25"
                  />
                  <div className="space-y-3 h-full">
                    <h2 className="font-medium text-xl">{stack.title}</h2>
                    <p>{stack.description}</p>
                    <div>
                      <p>{stack.featureName}:</p>
                      <ul className="list-disc pl-5">
                        {stack.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-sm flex-1 cursor-pointer">
                    {stack.cta} <MoveRight />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityStack;
