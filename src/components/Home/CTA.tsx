"use client";
import React from "react";
import CButton from "../ui/Cbutton";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};

const CTA = () => {
  return (
    <section className="h-full bg-gradient-to-b from-white to-gray-50 px-4 md:px-6 lg:px-20 xl:px-20 py-20 relative overflow-clip">
      <motion.div
        className=" max-w-[1600px] mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.p
          className=" text-center text-xl md:text-2xl font-semibold"
          variants={itemVariants}
        >
          Scrubbe empowers modern teams to stop fraud, verify trust, and
          automate response <br className=" md:block hidden" /> with clarity and
          speed. Whether you&apos;re launching your first security layer or
          scaling to <br className=" md:block hidden" /> millions, Scrubbe is
          built to grow with you
        </motion.p>
        <motion.div
          className="flex md:flex-row flex-col justify-center items-center gap-5"
          variants={itemVariants}
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <CButton className=" md:w-fit w-full px-7">
              Start Free Trial
            </CButton>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <CButton className=" md:w-fit w-full bg-transparent border border-colorScBlue text-colorScBlue px-7">
              Talk to our team
            </CButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTA;
