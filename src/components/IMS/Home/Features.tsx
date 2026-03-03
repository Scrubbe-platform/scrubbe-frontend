/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

const items = [
  {
    icon: "/IMS/icons/search1.png",
    title: "Magic Insight Engine",
    description:
      "Automatically reconstructs the true incident timeline and delivers root cause in one sentence before the human even opens the ticket.",
  },
  {
    icon: "/IMS/icons/document.png",
    title: "Automatic On-Call Handover",
    description:
      "Every shift ends with a perfectly written summary. Zero effort. Zero gaps.",
  },
  {
    icon: "/IMS/icons/ai.png",
    title: "AI-Generated Simulations",
    description:
      "Your worst outages become live training drills. Teams get better. Repeat failures disappear.",
  },
];

const arrows = [
  {
    normal: "/IMS/arrow/right-down.svg",
    glow: "/IMS/arrow/right-down-glow.svg",
  },
  {
    normal: "/IMS/arrow/left-down.svg",
    glow: "/IMS/arrow/left-down-glow.svg",
  },
  {
    normal: "/IMS/arrow/up-right.svg",
    glow: "/IMS/arrow/up-right-glow.svg",
  },
  {
    normal: "/IMS/arrow/up-left.svg",
    glow: "/IMS/arrow/up-left-glow.svg",
  },
];

const Features = () => {
  const [arrowindex, setArrowIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setArrowIndex((prev) => {
        if (prev === 0) {
          return 1;
        } else if (prev === 1) {
          return 3;
        } else if (prev === 3) {
          return 2;
        } else if (prev === 2) {
          return 0;
        }
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
  return (
    <section className=" min-h-[700px] bg-[#060709] ">
      <motion.div
        className="container mx-auto py-10 px-5 flex-col gap-6 flex max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((item) => (
            <motion.div
              key={item.title}
              className="h-[218px] border border-IMSCyan/30 p-4 space-y-2 flex flex-col justify-center relative"
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
              <p className="font-semibold text-lg text-white">{item.title}</p>
              <p className="text-base text-white">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10 min-h-[400px] py-5 md:py-20 relative z-10 mx-auto">
          <div className=" w-[40%] h-[300px] bg-IMSCyan opacity-10 rounded-[100%] blur-3xl absolute left-1/3 top-1/3 -z-10" />
          <div className="flex flex-col justify-center space-y-10">
            <motion.div variants={itemVariants as any} className=" space-y-5">
              <h2 className=" text-white text-3xl md:text-4xl font-bigshotOne max-w-sm">
                Auto-Deployment Failure Handling
              </h2>
              <ul className=" list-disc space-y-3 text-white text-base pl-4">
                <li>
                  Detects failed or rolled-back GitHub/GitLab deploys instantly
                </li>
                <li>Creates incident with full commit context and diff</li>
                <li>
                  Delivers AI-powered code intelligence or rollback commands
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants as any} className=" space-y-5">
              <h2 className=" text-white text-3xl md:text-4xl font-bigshotOne max-w-md">
                Fraud & Threshold-Triggered Incidents
              </h2>
              <ul className=" list-disc space-y-3 text-white text-base pl-4">
                <li>Connect any fraud, risk, or business metric </li>
                <li>Incidents open automatically on breach</li>
                <li>Execute workflows without human delay </li>
              </ul>
            </motion.div>
          </div>
          <motion.div
            variants={itemVariants as any}
            className=" scale-85 md:scale-100"
          >
            {/* <motion.img src="/IMS/auto-image.svg" alt="auto" /> */}
            <div className="grid grid-cols-2 gap-7">
              {arrows.map(({ glow, normal }, index) => {
                return (
                  <div
                    className="relative"
                    key={index === arrowindex ? -1 : index}
                  >
                    <motion.img
                      src={normal}
                      alt="auto"
                      transition={{
                        duration: 1,
                        ease: "easeIn",
                        type: "tween",
                        delay: 1,
                      }}
                    />
                    <motion.img
                      src={glow}
                      alt="auto"
                      animate={{
                        opacity: arrowindex == index ? 1 : 0,
                      }}
                      className="absolute top-0"
                      initial={{ opacity: 0 }}
                      transition={{
                        duration: 1,
                        ease: "easeIn",
                        type: "tween",
                        delay: 1,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Features;
