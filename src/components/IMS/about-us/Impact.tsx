/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";

const usecases = [
  {
    title: "Cloud Providers",
    description: "Proactive monitoring and SLA tracking to prevent outages.",
  },
  {
    title: "Fintech",
    description:
      "Incident automation and compliance-grade reporting for audits.",
  },
  {
    title: "Energy & Utilities",
    description: "Predictive fault detection and grid resilience insights.",
  },
  {
    title: "AI/ML Teams",
    description:
      "Monitored pipelines for data drift, model failure, and training anomalies.",
  },
  {
    title: "IT Service Providers",
    description:
      "Unified customer support and incident tracking across tenants.",
  },
];

// Animation variants for the staggered effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay for each child item
    },
  },
};

const itemVariants = {
  hidden: { x: -100, opacity: 0 }, // Starts 100px to the left and invisible
  visible: {
    x: 0, // Slides to its final position
    opacity: 1, // Fades in
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageVariants = {
  hidden: { x: 200, opacity: 0 }, // Starts 200px to the right and invisible
  visible: {
    x: 0, // Slides to its final position
    opacity: 1, // Fades in
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

const Impact = () => {
  return (
    <div className="bg-gradient-to-b from-[#00223B] to-[#00474D] min-h-[700px] grid md:grid-cols-2 place-items-center py-10 relative z-10 overflow-hidden">
      <motion.img
        src="/IMS/about/green_orb.png"
        className=" right-[-100px] h-full max-h-[600px] -z-10 hidden md:flex "
        alt="Use Case illustration"
        variants={imageVariants as any}
        initial="hidden"
        animate="visible"
      />
      <motion.div
        className="flex flex-col gap-4 px-4 md:pl-10 container mx-auto w-full flex-1"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <motion.p
          className="text-3xl md:text-5xl max-w-2xl font-bigshotOne text-white leading-7"
          variants={itemVariants as any}
        >
          How We Impact Industries{" "}
        </motion.p>
        <motion.p className=" text-white" variants={itemVariants as any}>
          Scrubbe powers resilience across every critical domain.
        </motion.p>

        <div className="max-w-2xl space-y-7">
          {usecases.map((usecase, index) => (
            <motion.div
              key={index}
              className="flex gap-4"
              variants={itemVariants as any}
            >
              <div className="flex items-center justify-center text-white font-bold h-[40px] min-w-[40px] rounded-full bg-gradient-to-b from-IMSLightGreen to-IMSDarkGreen">
                {index + 1}
              </div>
              <div>
                <p className="flex text-xl font-bold text-white md:text-2xl ">
                  {usecase.title}
                </p>
                <p className="text-white">{usecase.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className=" text-white text-xl font-semibold"
          variants={itemVariants as any}
        >
          Your uptime is our reputation.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Impact;
