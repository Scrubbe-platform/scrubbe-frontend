"use client";
import React, { useState } from "react";
import DetectionWrapper from "./DetectionStackItem/DetectionWrapper";
import { motion } from "framer-motion";

export const detectionTabs = [
  {
    name: "Text",
  },
  {
    name: "Data Ingestion",
  },
  {
    name: " Automation Number",
  },
];

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

const DetectionStack = () => {
  const [selected, setSelected] = useState(detectionTabs[0].name);
  return (
    <section className=" px-4 md:px-6 lg:px-20 xl:px-20 py-20 relative overflow-clip z-10 h-auto">
      <div className=" absolute inset-0 rotate-180 bg-top bg-[url('/detection_bg.png')] bg-no-repeat bg-cover -z-10" />
      <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-10 md:grid md:grid-cols-2 place-items-center">
        <motion.div
          className=" space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-[24px] md:text-[36px] font-bold text-white"
            variants={itemVariants}
          >
            Deep Integration with Detection Stack
          </motion.h2>
          <motion.div
            className=" flex gap-3 text-zinc-300 border border-zinc-300 w-fit p-2 rounded-full"
            variants={itemVariants}
          >
            {detectionTabs.map((tab) => (
              <div
                className={` text-xs sm:text-sm p-1 sm:p-2 px-1 sm:px-3 rounded-2xl cursor-pointer transition-all duration-150 delay-100 ${
                  tab.name == selected
                    ? "border border-zinc-300 bg-colorScBlack"
                    : "border-none"
                }`}
                key={tab.name}
                onClick={() => setSelected(tab.name)}
              >
                {tab.name}
              </div>
            ))}
          </motion.div>
          <motion.div className=" text-zinc-300" variants={itemVariants}>
            <p>
              Ezra doesn&apos;t operate in isolation — it&apos;s fully embedded
              within Scrubbe&apos;s pipeline:
            </p>
            <aside>
              <ul className=" list-disc pl-5">
                <li>
                  Has access to NLRI rule logic, anomaly scores, session
                  timelines, fingerprint intelligence?
                </li>
                <li>
                  Sees real-time alerts, dashboard filters, analyst queries, and
                  threat metadata?
                </li>
                <li>
                  Can trigger playbooks, escalate incidents, or generate reports
                </li>
              </ul>
              <br />
              <p>
                Most AI co-pilots stop at &quot;Here&apos;s what happened.&quot;
                Ezra goes further: &quot;Here&apos;s why it matters, and what to
                do next.&quot;
              </p>
            </aside>
          </motion.div>
        </motion.div>
        <motion.div
          className=" bg-white h-full md:min-h-[500px] w-full max-w-[600px] p-5 rounded-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <DetectionWrapper name={selected} />
        </motion.div>
      </div>
    </section>
  );
};

export default DetectionStack;
