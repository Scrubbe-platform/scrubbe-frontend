"use client";
import React from "react";
import Cbutton from "../ezra-landing/Cbutton";
import { BsSendFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

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

const incidents = [
  {
    id: 1,
    type: "Critical",
    title: "Credential Stuffing Attempt Detected",
    time: "09:13 UTC",
    targetApp: "auth.scrubbaapp.io",
    detectedBy: "ScrubbAuditor AI (Device fingerprint SDK + Behavior anomaly)",
    summary:
      "Multiple failed login attempts (57 in 4 mins) from the same device fingerprint across 8 user accounts, originating from Lagos (IP range 197.x.x.x). Passwords used matched known breach patterns.",
    actionTaken: [
      "IP temporarily blacklisted",
      "Fingerprint tagged as suspicious",
      "Alert sent to client SecOps",
    ],
  },
  {
    id: 2,
    type: "Critical",
    title: "Admin Token Misuse",
    time: "11:42 UTC",
    source: "Internal API usage from unknown origin",
    summary:
      "A production admin token was used from a previously unseen location (Bangladesh) with attempted access to the /revoke-access endpoint. No changes made. Access blocked.",
    actionTaken: [
      "Token revoked",
      "Email alert sent to super-admin",
      "Incident escalated for human review",
    ],
  },
  // You can add more incidents here following the same structure
];

const EzraConversation = () => {
  return (
    <section className=" relative overflow-clip z-10 h-auto bg-white">
      {/* <div className="bg-[url('/talk_bg.png')] bg-center bg-no-repeat bg-cover absolute inset-0 -z-10 " /> */}
      {/* background */}
      <div className=" absolute w-full h-full flex">
        {Array(20)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex h-full">
              <div className="w-[120px] h-full bg-[#EFF6FF]" />
              <div className="w-[120px] h-full bg-[#E5F0FE]" />
              <div className="w-[120px] h-full bg-[#FFFFFF]" />
            </div>
          ))}
      </div>
      <div className=" absolute inset-0 -z-10 " />
      <div className="px-4 md:px-6 lg:px-20 xl:px-20 py-20 max-w-[1440px] mx-auto gap-y-8 flex flex-col items-center ">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col items-center w-full"
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold  text-center mb-2 text-black"
            variants={itemVariants}
          >
            Talk to Ezra. Investigate Threats in Plain English
          </motion.h2>
          <motion.div
            className="w-24 h-2 bg-teal-400 mx-auto rounded-full"
            variants={itemVariants}
          />
          <motion.p
            className=" text-lg text-black font-medium text-center mt-3"
            variants={itemVariants}
          >
            Security conversations supercharged with Ezra
          </motion.p>
          <motion.div
            className=" w-full bg-black h-[400px] md:h-[700px] rounded-lg overflow-clip flex flex-col relative mt-10 "
            variants={itemVariants}
          >
            <div className=" h-6 w-full bg-colorScBlue" />
            <div className=" flex-1 flex flex-col w-full h-full gap-4 p-5">
              <div className="flex-1 flex flex-col gap-3 w-full mt-4 h-full">
                <div className="flex justify-end">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      delay: 2,
                      damping: 4,
                      stiffness: 60,
                    }}
                    className=" bg-zinc-600 w-fit p-2 rounded-md rounded-tl-none"
                  >
                    <p className=" text-[50%] sm:text-[100%] text-white">
                      Ezra summarize the incident for today
                    </p>
                    <p className=" text-[30%] sm:text-[80%] text-white text-end">
                      {new Date(Date.now())
                        .toISOString()
                        .replace("T", " ")
                        .replace("Z", "")}
                    </p>
                  </motion.div>
                </div>
                <div className="flex h-[60%] sm:h-[70%] md:max-h-[500px] ">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      delay: 3.5,
                      damping: 4,
                      stiffness: 40,
                    }}
                    className="md:w-[50%] w-[60%] h-[90%] bg-[#23489B] rounded-lg p-3 space-y-2"
                  >
                    <p className=" text-white font-medium text-[60%] sm:text-[100%] ">
                      Incident Summary for today{" "}
                    </p>
                    <div className=" w-full bg-white max-h-[85%] overflow-scroll rounded-md p-4">
                      <div className=" w-full space-y-2">
                        <motion.div
                          className=" text-[50%] sm:text-[80%]  text-zinc-500 space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{
                            duration: 0.3,
                          }}
                        >
                          <div className="p-6 border-b border-gray-200">
                            <h2 className=" font-semibold text-gray-800">
                              Ezra Summary Output – July 24, 2025
                            </h2>
                            <p className=" text-gray-600 mt-1">
                              Date: Thursday, July 24, 2025
                            </p>
                            <p className=" text-gray-600">
                              Total Incidents Detected: 6
                            </p>
                          </div>

                          <div className="p-6 space-y-8">
                            {incidents.map((incident) => (
                              <div
                                key={incident.id}
                                className="border-b pb-8 last:border-b-0 last:pb-0"
                              >
                                <h3 className="font-semibold text-gray-800">
                                  <span
                                    className={`font-bold ${
                                      incident.type === "Critical"
                                        ? "text-red-600"
                                        : "text-yellow-600"
                                    }`}
                                  >
                                    [{incident.type}]
                                  </span>{" "}
                                  {incident.title}
                                </h3>
                                <ul className="list-disc list-inside text-gray-700  mt-2 space-y-1">
                                  <li>
                                    <span className="font-medium">Time:</span>{" "}
                                    {incident.time}
                                  </li>
                                  {incident.targetApp && (
                                    <li>
                                      <span className="font-medium">
                                        Target App:
                                      </span>{" "}
                                      {incident.targetApp}
                                    </li>
                                  )}
                                  {incident.detectedBy && (
                                    <li>
                                      <span className="font-medium">
                                        Detected By:
                                      </span>{" "}
                                      {incident.detectedBy}
                                    </li>
                                  )}
                                  {incident.source && (
                                    <li>
                                      <span className="font-medium">
                                        Source:
                                      </span>{" "}
                                      {incident.source}
                                    </li>
                                  )}
                                  <li>
                                    <span className="font-medium">
                                      Summary:
                                    </span>{" "}
                                    {incident.summary}
                                  </li>
                                </ul>
                                <h4 className="font-semibold text-gray-800 mt-4">
                                  Action Taken:
                                </h4>
                                <ul className="list-disc list-inside text-gray-700  mt-1 space-y-1">
                                  {incident.actionTaken.map((action, index) => (
                                    <li key={index}>{action}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    <p className=" text-white text-[60%] sm:text-[100%]  text-end">
                      {new Date(Date.now())
                        .toISOString()
                        .replace("T", " ")
                        .replace("Z", "")}
                    </p>
                  </motion.div>
                </div>
                <div
                  className="flex gap-3 items-center absolute w-[95%] bottom-10"
                  // initial={{ opacity: 0, y: 20 }}
                  // whileInView={{ opacity: 1, y: 0 }}
                  // viewport={{ once: true, amount: 0.3 }}
                  // transition={{ duration: 0.7, delay: 2.8 }}
                >
                  <div className=" flex-1 bg-zinc-800 flex gap-3 items-center border border-zinc-600 rounded-lg h-10 px-2">
                    <img src="ezrastar.svg" alt="" />
                    <p className="  text-zinc-400  ">
                      <TypeAnimation
                        sequence={[
                          `Ezra summarize the incident for today`, // Types 'One'
                          2000, // Waits 1s
                          ``, // Types 'One'
                          4000, // Waits 1s
                          `Ezra summarize the incident for today`, // Types 'One'
                          2000, // Waits 1s
                          () => {},
                        ]}
                        wrapper="span"
                        cursor={true}
                        repeat={Infinity}
                        className="link"
                        style={{ display: "inline-block", fontSize: "100%" }}
                      />
                    </p>
                  </div>
                  <div className=" size-10 rounded-lg flex justify-center items-center bg-colorScBlue">
                    <BsSendFill className=" text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div className="mt-8" variants={itemVariants}>
            <Cbutton>Start Investigating with Ezra</Cbutton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default EzraConversation;
