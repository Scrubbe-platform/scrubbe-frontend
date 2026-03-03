/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CButton from "@/components/ui/Cbutton";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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

const referenceImages = [
  "cicd-aware",
  "logs",
  "metrics",
  "fraud-risk",
  "magic-insight",
  "on-call",
];

const ApiReference = () => {
  const router = useRouter();
  const [item, setItem] = useState(0);
  return (
    <div className="min-h-[700px] bg-[#060709]">
      <motion.div
        className="container mx-auto py-10 px-5 flex-col gap-6 flex max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.h2
            variants={itemVariants as any}
            className=" text-4xl md:text-5xl text-white font-bigshotOne text-center"
          >
            API-First{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan via-[#8250BE] to-[#8250BE]">
              Incident Management{" "}
            </span>
          </motion.h2>
          <p className=" text-white text-base text-center max-w-xl">
            Scrubbe plugs directly into your CI/CD, logs, metrics, fraud
            systems, and sensors. These examples are real integration patterns
            teams use in production.
          </p>
          <motion.div
            variants={itemVariants as any}
            className="flex flex-row md:justify-start justify-center gap-4 md:max-w-sm w-full mt-3"
          >
            <CButton
              onClick={() => router.push("/auth/business-signup")}
              className="  w-full px-5 h-[40px] bg-IMSCyan hover:bg-IMSCyan shadow-none text-base"
            >
              Get API Keys
            </CButton>
            <CButton className=" w-full px-5  h-[40px] border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan shadow-none text-base">
              View full API Reference{" "}
            </CButton>
          </motion.div>

          <div className="flex py-5">
            {["Logs", "CI/CD-Aware", "Metrics", "Fraud & Risk"].map(
              (value, index) => (
                <div
                  key={index}
                  onClick={() => setItem(index)}
                  className={`min-w-14 sm:min-w-24 px-2 py-2 text-IMSCyan text-center text-sm cursor-pointer ${
                    index === 0 && "rounded-l-lg"
                  } ${index === 3 && "rounded-r-lg"}
                  ${
                    index === item
                      ? "bg-[#098C95] text-black border-none"
                      : "border-IMSCyan border"
                  }
                  `}
                >
                  {value}
                </div>
              )
            )}
          </div>
        </div>

        <div className="grid gap-10 place-content-center mt-4">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={item}
            className="relative group z-10 max-w-2xl h-[600px]"
          >
            <div className="w-full h-full absolute -z-10 bg-IMSCyan scale-50 group-hover:scale-80 blur-3xl transition-all duration-200 ease-linear" />
            <img
              src={`/IMS/${referenceImages[item]}.svg`}
              alt=""
              className="w-full z-10"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApiReference;
