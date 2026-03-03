/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

interface FeatureRow {
  feature: string;
  scrubbeIms: boolean;
  serviceNow: boolean;
  pagerDuty: boolean;
}

const featuresData: FeatureRow[] = [
  {
    feature: "GitHub/GitLab Integration",
    scrubbeIms: true,
    serviceNow: false,
    pagerDuty: false,
  },
  {
    feature: "War Room Creation",
    scrubbeIms: true,
    serviceNow: true,
    pagerDuty: true,
  },
  {
    feature: "Multi-Channel Alerts",
    scrubbeIms: true,
    serviceNow: true,
    pagerDuty: true,
  },
  {
    feature: "Email Incident Raising",
    scrubbeIms: true,
    serviceNow: true,
    pagerDuty: false,
  },
  {
    feature: "Seamless Integrations",
    scrubbeIms: true,
    serviceNow: true,
    pagerDuty: true,
  },
];

// Animation variants for the entire table container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger delay for each child (header and rows)
    },
  },
};

// Animation variants for each individual table row and header
const rowVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function FeatureComparisonTable() {
  return (
    <div className="bg-white min-h-[600px] py-10 px-4">
      <motion.div
        className="container mx-auto z-10 relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12 font-bigshotOne"
          variants={rowVariants as any}
        >
          How Scrubbe IMS Outshines the Rest
        </motion.h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
          <motion.table
            className="w-full divide-y divide-gray-200"
            variants={containerVariants}
          >
            <motion.thead
              className="bg-[#2c4b4d]"
              variants={rowVariants as any}
            >
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap"
                >
                  Features
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap"
                >
                  Scrubbe IMS
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap"
                >
                  ServiceNow
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap"
                >
                  PagerDuty
                </th>
              </tr>
            </motion.thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {featuresData.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  variants={rowVariants as any}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-center">
                    {row.scrubbeIms ? (
                      <FaCheck className="text-green-500 mx-auto" />
                    ) : (
                      <FaTimes className="text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-center">
                    {row.serviceNow ? (
                      <FaCheck className="text-green-500 mx-auto" />
                    ) : (
                      <FaTimes className="text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-center">
                    {row.pagerDuty ? (
                      <FaCheck className="text-green-500 mx-auto" />
                    ) : (
                      <FaTimes className="text-red-500 mx-auto" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </motion.div>
    </div>
  );
}
