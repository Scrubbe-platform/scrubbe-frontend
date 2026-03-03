"use client";
import Capabilities from "@/components/ezra-landing/Capabilities";
import Hero from "@/components/ezra-landing/Hero";
import LiveSOC from "@/components/ezra-landing/LiveSOC";
import OurMetrics from "@/components/ezra-landing/OurMetrics";
import RealTimeLogs from "@/components/ezra-landing/RealTimeLogs";
import React from "react";
import { motion } from "framer-motion";
import NavbarEzra from "@/components/landing/header/NavbarEzra";
import FooterEzra from "@/components/landing/footer/FooterEzra";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const page = () => {
  return (
    <>
      <NavbarEzra />
      <div className="bg-darkEzra ">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          variants={sectionVariants}
        >
          <Hero />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          variants={sectionVariants}
        >
          <Capabilities />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          variants={sectionVariants}
        >
          <RealTimeLogs />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          variants={sectionVariants}
        >
          <LiveSOC />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          variants={sectionVariants}
        >
          <OurMetrics />
        </motion.div>
      </div>
      <FooterEzra />
    </>
  );
};

export default page;
