/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import CButton from "@/components/ui/Cbutton";
import { useRouter } from "next/navigation";

// Variants for the staggered animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
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

const Contact = () => {
  const router = useRouter();
  return (
    <div className="bg-[#060709] ">
      <motion.div
        className="min-h-[400px] py-10 px-4 container mx-auto flex flex-col justify-center items-center gap-4 relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="absolute left-1/3 translate-x-[-15%] bg-gradient-to-r from-IMSCyan to-cyan-200 blur-3xl opacity-20 w-[50%] h-full rounded-full" />

        <motion.p
          className="text-white text-4xl md:text-5xl sm:text-4xl text-center font-bigshotOne max-w-xl"
          variants={itemVariants as any}
        >
          <span className="text-IMSCyan">The Incident Platform</span> That
          Actually Learns
        </motion.p>
        <motion.p
          className="md:text-lg text-white max-w-2xl text-center"
          variants={itemVariants as any}
        >
          The first IMS that prevents repeat failures, reconstructs incidents
          automatically, and eliminates shift handovers.{" "}
        </motion.p>
        <motion.div
          variants={itemVariants as any}
          className="flex flex-col sm:flex-row md:justify-start justify-center gap-4 md:max-w-sm w-full mt-3"
        >
          <CButton
            onClick={() => router.push("/auth/business-signup")}
            className="  w-full px-5 h-[45px] bg-IMSCyan hover:bg-IMSDarkGreen shadow-none text-base"
          >
            Start for Free
          </CButton>
          <CButton className=" w-full px-5  h-[45px] border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan shadow-none text-base">
            Book Demo
          </CButton>
        </motion.div>
        {/* <motion.div
          className="flex sm:flex-row flex-col sm:gap-0 gap-5 items-center mt-3"
          variants={itemVariants as any}
        >
          <input
            type="text"
            name=""
            id=""
            placeholder="Enter your email for demo"
            className="h-[42px] w-[300px] text-center sm:text-start px-2 bg-white outline-none max-sm:rounded-lg sm:rounded-l-lg"
          />
          <div className="h-[42px] max-sm:rounded-lg sm:rounded-r-lg bg-IMSCyan text-white flex items-center px-6 font-semibold cursor-pointer">
            Schedule a Demo
          </div>
        </motion.div> */}
      </motion.div>
    </div>
  );
};

export default Contact;
