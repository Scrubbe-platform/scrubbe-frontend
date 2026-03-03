"use client";
import { motion } from "framer-motion";
import React from "react";
import { FaDatabase } from "react-icons/fa6";
import { HiLightningBolt } from "react-icons/hi";
import { RiSettings4Fill } from "react-icons/ri";
import EzraDashboard from "./EzraDashboard/Index";
import Cbutton from "../ezra-landing/Cbutton";
import { useRouter } from "next/navigation";

const features = [
  {
    title: "Real time Summary generation on dashboards",
    Icon: HiLightningBolt,
  },
  {
    title: "Automated tagging of incidents and sessions",
    Icon: RiSettings4Fill,
  },
  {
    title: "Natural language Q&A on datasets and logs",
    Icon: FaDatabase,
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const FraudAnalyst = () => {
  const router = useRouter();
  return (
    <section className=" bg-[url('/grainy_bg.png')] bg-colorScBlack  relative overflow-clip">
      <div className=" max-w-[1440px] h-full mx-auto flex flex-col items-center justify-between gap-y-6 relative z-10 px-4 md:px-6 lg:px-20 xl:px-20 pt-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="flex flex-col items-center gap-y-6 w-full"
        >
          <motion.h2
            variants={itemVariants}
            className="xl:text-[48px]  text-[24px] md:text-[36px] font-bold text-center text-white"
          >
            AI-Powered Security & Fraud <br className=" md:block hidden" />{" "}
            Analyst
          </motion.h2>
          <motion.p variants={itemVariants} className=" text-white text-center">
            Ezra acts as a full-time AI analyst, continuously reviewing incoming
            events, surfacing <br className=" md:block hidden" /> suspicious
            behaviors, and generating plain-language insights you can act on
            instantly. Ezra scales with your team —{" "}
            <br className=" md:block hidden" /> no analyst burnout, no missed
            threats.
          </motion.p>

          <motion.div
            variants={containerVariants}
            className="flex gap-4 md:gap-[24px] justify-center"
          >
            {features.map(({ Icon, title }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="w-[100px] sm:w-[170px] h-[123px] bg-colorScBlue/20 flex flex-col justify-center items-center gap-3 rounded-lg"
              >
                <div>
                  <Icon className=" text-md sm:text-lg" color="#2664EA" />
                </div>
                <p className=" text-center text-white text-xs sm:text-sm w-[90%] sm:w-[80%]">
                  {title}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Cbutton onClick={() => router.push("/ezra")}>Try Ezra</Cbutton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="md:flex hidden w-full sm:w-[90%] h-[500px] rounded-t-3xl z-10 mt-20 overflow-clip"
        >
          <EzraDashboard />
        </motion.div>
        <img src="/Ezradashboard.png" className="md:hidden block" alt="Ezradashboard.png" />
      </div>
      <motion.div
        initial={{ opacity: 0.1, scale: 0.7 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeOut",
        }}
        className=" bottom-[-50%] h-full w-[90%] absolute bg-blue-50/60 opacity-10 rounded-full blur-3xl z-0 "
      />
    </section>
  );
};

export default FraudAnalyst;
