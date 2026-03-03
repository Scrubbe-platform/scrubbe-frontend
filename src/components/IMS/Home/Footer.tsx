/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import React from "react";
import { IconType } from "react-icons";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

// Animation variants for the staggered effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger delay for each child section
      delayChildren: 0.2, // Initial delay before the first child animates
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

const Footer = () => {
  return (
    <div className="bg-white">
      <motion.div
        className="container flex sm:flex-row flex-col mx-auto justify-between items-center min-h-[400px] px-4 py-10 gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          className="space-y-5 md:flex-[.6] w-full"
          variants={itemVariants as any}
        >
          <h2 className="text-5xl md:text-6xl font-bigshotOne text-IMSLightGreen">
            Scrubbe
          </h2>
          <p>
            1207 Delaware Ave #3296 <br /> Wilmington, DE 19806, United States
          </p>
          <div className="w-full">
            <div className="flex items-center gap-4">
              <SocialLink
                icon={FaSquareXTwitter}
                href="https://x.com/_Scrubbe"
              />
              <SocialLink
                icon={FaLinkedin}
                href="https://www.linkedin.com/company/scrubbe/"
              />
              <SocialLink
                icon={FaInstagram}
                href="https://www.instagram.com/scrubbehq/"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 max-sm:w-full"
          variants={itemVariants as any}
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="md:text-lg font-medium flex flex-col gap-2">
              <Link href={"#"}>
                <p>Documentation</p>
              </Link>
              <Link href={"#"}>
                <p>API Reference</p>
              </Link>
              <Link href={"/contact-us"}>
                <p>Contact Us</p>
              </Link>
            </div>
            <div className="md:text-lg font-medium flex flex-col gap-2">
              <Link href={"/privacy-policy"}>
                <p>Privacy Policy</p>
              </Link>
              <Link href={"/terms-service"}>
                <p>Terms of Service</p>
              </Link>
              <Link href={"/cookie-policy"}>
                <p>Cookie Policy</p>
              </Link>
              <Link href={"/data-processing-agreement"}>
                <p>Data Processing Agreement</p>
              </Link>
              <Link href={"/contact-us"}>
                <p>Support</p>
              </Link>
            </div>
            <div className="md:text-lg font-medium flex flex-col gap-2">
              <Link href={"/blog"}>
                <p>Blog</p>
              </Link>
              <Link href={"/career"}>
                <p>Careers</p>
              </Link>
            </div>
          </div>
          {/* <div className="flex flex-col sm:flex-row items-center mt-5 sm:gap-0 gap-4">
            <input
              type="text"
              name=""
              id=""
              placeholder="Enter your email for demo"
              className="h-[42px] w-full max-w-[300px] px-2 bg-white outline-none max-sm:rounded-lg sm:rounded-l-lg border-1 border-IMSLightGreen"
            />
            <div className="h-[42px] text-nowrap max-sm:rounded-lg sm:rounded-r-lg bg-IMSLightGreen text-white flex items-center px-3 md:px-6 font-semibold cursor-pointer">
              Schedule a Demo
            </div>
          </div> */}
        </motion.div>
      </motion.div>

      <div className="bg-[#00474D]">
        <div className="flex justify-between items-center md:flex-row flex-col container min-h-[50px] text-white py-3 px-4 mx-auto">
          @2025 Scrubbe IMS. All rights reserved.
          <div>
            Contact:
            <Link href={"mailto:support@scrubbe.com"} className="underline">
              support@scrubbe.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Type definitions
interface SocialLinkProps {
  icon: IconType;
  href: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ icon: Icon, href }) => (
  <Link
    href={href}
    className={
      "size-[40px] bg-black rounded-full flex items-center justify-center"
    }
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon size={24} className="text-white" />
  </Link>
);

export default Footer;
