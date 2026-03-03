"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import React, { ReactNode, useState } from "react";
import CorePackage from "./CorePackage";
import AllModules from "./AllModules";
import IndividualModule from "./IndividualModule";
import AutoTracking from "./AutoTracking";
import ManualTracking from "./ManualTracking";
import DeviceFingerprint from "./DeviceFingerprint";
import LocationTesting from "./LocationTesting";
import NetworkInfo from "./NetworkInfo";
import UserActivity from "./UserActivity";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

const packages = [
  {
    label: "Core Packages",
    value: "core-packages",
  },
  {
    label: "All Modules",
    value: "all-modules",
  },
  {
    label: "Individual Modules",
    value: "individual-modules",
  },
  {
    label: "Auto Tracking",
    value: "auto-tracking",
  },
  {
    label: "Manual Tracking",
    value: "manual-tracking",
  },
  {
    label: "Device Fingerprint",
    value: "device-fingerprint",
  },
  {
    label: "Location Tracking",
    value: "location-tracking",
  },
  {
    label: "Network Info",
    value: "network-info",
  },
  {
    label: "User Activity",
    value: "user-activity",
  },
];
const GetStartedWithScrubbe = () => {
  const [selectPackage, setSelectPackage] = useState("core-packages");
  const router = useRouter();
  let content: ReactNode;
  switch (selectPackage) {
    case packages[0].value:
      content = <CorePackage />;
      break;

    case packages[1].value:
      content = <AllModules />;
      break;

    case packages[2].value:
      content = <IndividualModule />;
      break;

    case packages[3].value:
      content = <AutoTracking />;
      break;

    case packages[4].value:
      content = <ManualTracking />;
      break;

    case packages[5].value:
      content = <DeviceFingerprint />;
      break;

    case packages[6].value:
      content = <LocationTesting />;
      break;

    case packages[7].value:
      content = <NetworkInfo />;
      break;

    case packages[8].value:
      content = <UserActivity />;
      break;

    default:
      break;
  }
  return (
    <div className=" min-h-[800px] bg-[#E2E5FF] px-4 md:px-6 lg:px-20 xl:px-20 py-20">
      <div className=" max-w-[1440px] mx-auto gap-y-8 flex flex-col items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col items-center w-full"
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold  text-center mb-2"
            variants={itemVariants}
          >
            Scrubbe Fingerprint SDK - Get Started
          </motion.h2>
          <motion.div
            className="w-24 h-2 bg-teal-400 mx-auto rounded-full"
            variants={itemVariants}
          />
          <motion.p
            className=" text-lg font-medium text-center mt-3"
            variants={itemVariants}
          >
            Unleash cutting-edge device intelligence with Scrubbe’s
            industry-leading Fingerprint SDK.{" "}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className=" bg-white shadow-md rounded-lg w-full p-4 md:p-6 mt-6 overflow-x-hidden"
          >
            <div className="flex flex-row md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-x-auto">
              {packages.map((value) => (
                <button
                  className={clsx(
                    "p-3 rounded-md border border-[#6A5ACD] transition-all duration-200 ease-out text-sm text-nowrap",
                    selectPackage == value.value
                      ? "bg-[#6A5ACD] text-white font-semibold"
                      : "bg-[#FAF9FF] text-[#6A5ACD]"
                  )}
                  key={value.value}
                  onClick={() => setSelectPackage(value.value)}
                >
                  {value.label}
                </button>
              ))}
            </div>
            <motion.div
              variants={itemVariants}
              key={selectPackage}
              initial="hidden"
              animate="show"
              className="mt-4 rounded-md bg-gray-50 relative "
            >
              {content}
            </motion.div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            className={clsx(
              "p-3 rounded-md flex mt-4 items-center gap-3 border border-[#6A5ACD] transition-all duration-200 ease-out text-sm text-nowrap bg-[#6A5ACD] text-white font-semibold"
            )}
            onClick={() => router.push("/auth/signin")}
          >
            Get Started <ArrowRight />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default GetStartedWithScrubbe;
