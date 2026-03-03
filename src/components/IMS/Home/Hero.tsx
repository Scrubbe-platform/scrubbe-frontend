/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CButton from "@/components/ui/Cbutton";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Animation variants for the staggered fade-in effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Delay each child's animation by 0.3s
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

const Hero = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[url('/IMS/hero-mobile-bg.png')] md:bg-[url('/IMS/hero-bg.png')]  bg-cover bg-center  relative z-0">
      <div className="flex md:flex-row gap-5 mx-auto max-w-7xl items-center min-h-screen md:pt-0 pt-20">
        <motion.div
          className="container mx-auto flex flex-col gap-3 justify-center md:items-start items-center h-full p-4 flex-1 z-10 md:pt-0 pt-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants as any}
            className="border-2 border-[#009FAD] w-fit md:px-3 py-2 px-2 rounded-full text-sm text-white bg-gradient-to-b from-[#009FAD] top-[#060809B2]"
          >
            <p>No noise. No runbooks. No “what happened?” at 3 AM.</p>
          </motion.div>
          <motion.div
            variants={itemVariants as any}
            className="text-white text-4xl  font-bigshotOne md:text-start text-center max-w-xl"
          >
            The AI Engineering{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan via-[#8250BE] to-[#8250BE]">
              Incident Platform
            </span>{" "}
            That Detect, triage, explain, and fix failures across code,
            pipelines, and production — from one unified control plane.
          </motion.div>
          <motion.p
            variants={itemVariants as any}
            className="text-white text-lg md:text-xl max-w-lg mt-5 md:text-start text-center"
          >
            From merge conflicts and broken pipelines to full production outages
            and fraud spikes, Scrubbe resolves engineering incidents end-to-end
            with AI-powered diagnostics and remediation.
          </motion.p>
          <motion.div
            variants={itemVariants as any}
            className="flex flex-row md:justify-start justify-center gap-4 mt-4 md:mt-10 md:max-w-sm w-full"
          >
            <CButton
              onClick={() => router.push("/auth/business-signup")}
              className="  w-full px-5 h-[50px] bg-IMSCyan hover:bg-IMSCyan shadow-none text-base"
            >
              Get Started
            </CButton>
            <CButton className=" w-full px-5  h-[50px] border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan shadow-none text-base">
              Book a Demo
            </CButton>
          </motion.div>

          <motion.div
            variants={itemVariants as any}
            className="h-[300px] md:hidden flex"
          >
            <img
              src="/IMS/light-colour.gif"
              alt="cube-blocks"
              className="h-full object-cover rotate-[-30deg] opacity-70"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className=" min-w-[800px] absolute right-[-10%] md:flex hidden"
        >
          <img
            src="/IMS/light-colour.gif"
            alt="cube-blocks"
            className="h-screen object-cover opacity-70"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
