"use client";
import { motion } from "framer-motion";
import React from "react";

const items = [
  {
    icon: "/IMS/icons/search1.png",
    title: "Turn chaos into reliable, repeatable fixes.",
    smallTitle: "MISSION",
    description:
      "Our mission is to give engineering and fraud teams a system where every incident teaches the platform how to respond better next time. Scrubbe doesn’t just open tickets — it learns from code diffs, failed pipelines, production metrics and fraud signals, then reuses those patterns to cut MTTR and prevent repeat failures.",
  },
  {
    icon: "/IMS/icons/document.png",
    title: "A world where incidents close themselves — safely.",
    smallTitle: "VISION",
    description:
      "Our vision is a reliability layer where most incidents are auto-detected, auto-analyzed and auto-remediated, with humans focusing on strategy, not firefighting. Scrubbe becomes the incident brain for modern fintechs, SaaS platforms and digital businesses, respecting guardrails, approvals and compliance from day one.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger delay for each major section
    },
  },
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
const OurMission = () => {
  return (
    <div className=" max-w-[1440px] h-full mx-auto flex flex-col items-center gap-y-6 relative z-10 px-4 md:px-6 lg:px-20 xl:px-20 py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        className="grid md:grid-cols-2 gap-5"
      >
        {items.map((item) => (
          <motion.div
            key={item.title}
            className="min-h-[218px] border border-IMSCyan/30 p-4 space-y-2 flex flex-col justify-center relative"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variants={itemVariants as any}
          >
            <div className="h-4 w-[2px] bg-IMSCyan absolute top-0 right-[-1px]" />
            <div className="h-4 w-[2px] bg-IMSCyan absolute -top-2 left-[-1px]" />
            <div className="h-4 w-[2px] bg-IMSCyan absolute bottom-0 left-[-1px]" />
            <div className="h-4 w-[2px] bg-IMSCyan absolute bottom-0 right-[-1px]" />
            <div className="h-[2px] w-4 bg-IMSCyan absolute bottom-0 right-[-1px]" />
            <div className="h-[2px] w-4 bg-IMSCyan absolute bottom-0 left-[-1px]" />
            <div className="h-[2px] w-4 bg-IMSCyan absolute -top-2 right-[-1px]" />
            <div className="h-[2px] w-4 bg-IMSCyan absolute -top-2 left-[-1px]" />
            <div className="size-14">
              <img
                src={item.icon}
                alt={item.title}
                className="  object-cover"
              />
            </div>
            <p className="text-sm text-white">{item.smallTitle}</p>
            <p className="font-semibold text-lg text-white">{item.title}</p>
            <p className="text-base text-white">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default OurMission;
