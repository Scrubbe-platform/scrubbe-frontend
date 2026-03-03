/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Variants for the text and number cards, with a stagger effect
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.5, // Delay the start of child animations
      staggerChildren: 0.3, // Stagger effect for the children
    },
  },
};

const textItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const Impacts = () => {
  return (
    <div className="bg-[#060709] py-10 px-4 relative overflow-clip z-10">
      <div className="size-[400px] rounded-full opacity-30 bg-IMSCyan absolute left-[10%] -top-[10%] blur-3xl z-20" />

      <div className="flex gap-10 md:flex-row flex-col container h-full items-center mx-auto min-h-[600px] max-w-7xl">
        {/* Animated Icon Section */}
        <motion.div
          className="flex-[.8] flex justify-center items-center h-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="relative flex items-center justify-center z-10">
            <div className="absolute -translate-y-10 z-10 opacity-25">
              <img src="/IMS/grid-bg.svg" alt="" />
            </div>
            <img
              src="/IMS/incident-analytics.png"
              alt=""
              className=" md:min-w-[600px] md:h-[400px] object-cover "
            />
            {/* <motion.div
              initial={{
                borderRadius: "100%",
                rotate: 0,
                scale: 1.3,
              }}
              animate={{
                borderRadius: "10%",
                rotate: "45deg",
                scale: 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "mirror",
              }}
              className="absolute size-[150px] md:size-[230px] shadow-inner bg-gradient-to-r flex justify-center items-center rounded-lg from-lime-400 to-IMSCyan"
            ></motion.div>
            <div className="absolute ">
              <IoIosInfinite className="text-8xl" />
            </div> */}
          </div>
        </motion.div>

        {/* Animated Text and Cards Section */}
        <motion.div
          className="flex-1 relative z-10"
          variants={textContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="absolute -translate-y-10 -z-10">
            <img src="/IMS/line.svg" alt="" />
          </div>
          <motion.h2
            className="text-white text-4xl md:text-5xl sm:text-4xl mb-12 font-bigshotOne"
            variants={textItemVariants as any}
          >
            Why Teams Switch From Traditional ITSM & Alert Tools{" "}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              className="h-[133px] rounded-md flex flex-col items-center justify-center p-3 bg-[#243131]"
              variants={textItemVariants as any}
            >
              <p className="text-white text-3xl md:text-4xl sm:text-4xl font-bold text-center font-electrolize">
                40%
              </p>
              <p className="text-xl text-white text-center max-w-sm">
                Faster mean time to resolution{" "}
              </p>
            </motion.div>
            <motion.div
              className="h-[133px] rounded-md flex flex-col items-center justify-center p-3 bg-[#243131]"
              variants={textItemVariants as any}
            >
              <p className="text-white text-3xl md:text-4xl sm:text-4xl font-bold text-center font-electrolize">
                70%
              </p>
              <p className="text-xl text-white text-center max-w-sm">
                Fewer on-call handover mistake{" "}
              </p>
            </motion.div>
            <motion.div
              className="h-[133px] rounded-md flex flex-col items-center justify-center p-3 bg-[#243131]"
              variants={textItemVariants as any}
            >
              <p className="text-white text-3xl md:text-4xl sm:text-4xl font-bold text-center font-electrolize">
                3x
              </p>
              <p className="text-xl text-white text-center max-w-sm">
                Improvement in root cause identification speed{" "}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto flex md:flex-row md:justify-between flex-col gap-10 py-5 max-w-7xl">
        <motion.div
          variants={textItemVariants as any}
          className="flex flex-col gap-10"
        >
          <h2 className="text-white text-4xl leading-[45px] md:text-5xl font-bigshotOne max-w-xs">
            {" "}
            A Different Class of Intelligence
          </h2>
          <Link href={""}>
            <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
              <p>View Comparison</p>
              <ArrowRight className="size-3" />
            </div>
          </Link>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
          <motion.div
            variants={textItemVariants as any}
            className=" border transition-all duration-150 ease-linear rounded-lg px-4 py-6 hover:bg-gradient-to-b from-[#0074834D] to-[#004B571A] bg-[#080A0F] border-[#1F2937] hover:border-IMSCyan text-white space-y-2 min-h-[320px]"
          >
            <p className="font-semibold text-lg">
              IDE-Based AI Coding Assistants
            </p>
            <p className="text-base">
              Great at writing new code inside your editor — boilerplate,
              refactors, helpers. But they don’t sit inside your pipeline or
              incident history.
            </p>
            <ul className=" list-disc space-y-3 text-white text-sm pl-4">
              <li>See the file you’re editing, not the failing pipeline. </li>
              <li>Don’t track which suggestion actually fixed production.</li>
              <li>No built-in MTTR, incident, or risk awareness</li>
              <li>Optimised for productivity, not reliability.</li>
            </ul>
          </motion.div>
          <motion.div
            variants={textItemVariants as any}
            className=" border transition-all duration-150 ease-linear rounded-lg px-4 py-6 hover:bg-gradient-to-b from-[#0074834D] to-[#004B571A] border-[#1F2937] hover:border-IMSCyan text-white space-y-2 min-h-[320px]"
          >
            <p className="font-semibold text-lg">
              Scrubbe Incident Intelligence{" "}
            </p>
            <p className="text-base">
              Scrubbe lives where outages actually happen — in your CI/CD,
              metrics, logs, fraud signals, and on-call workflows — and writes
              code only when it needs to unbreak something.
            </p>
            <ul className=" list-disc space-y-3 text-white text-sm pl-4">
              <li>
                Tied to incidents, pipelines, and environments, not just files{" "}
              </li>
              <li>
                Learns from what really fixed similar incidents in production
              </li>
              <li>
                Drives closed-loop remediation from failure → fix → verified
              </li>
              <li>
                Built to reduce MTTR and repeat failures, not just keystrokes.
              </li>
            </ul>
            <p className=" text-base">
              Use your favourite editor AI to write features. Use Scrubbe when
              the features take production down.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Impacts;
