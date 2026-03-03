"use client";
import { useFingerprintDisplay } from "@/lib/fingerprint/fingerprintdisplay";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Switch from "../ui/Switch";
import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";

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

const Fingerprint = () => {
  const { loading, fingerprint, formattedItems, hasConsent } =
    useFingerprintDisplay();
  console.log({ formattedItems, fingerprint, loading, hasConsent });
  const [viewAsJSON, setViewAsJSON] = useState(false);
  return (
    <section className="  relative overflow-clip z-10 h-auto ">
      <div
        className="
          w-full h-auto top-0 left-0 right-0 bottom-0 bg-white
          absolute overflow-hidden
          before:content-['']
          before:absolute
          before:inset-0
          before:bg-[radial-gradient(#f3f4f6_2px,transparent_4px)]
          before:bg-[size:16px_16px]
          -z-10
        "
      ></div>

      <div className=" px-4 md:px-6 lg:px-20 xl:px-20 py-20 max-w-[1440px] mx-auto space-y-8 ">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold  text-center mb-2 text-black"
            variants={itemVariants}
          >
            Fingerprint Intelligence API
          </motion.h2>
          <motion.div
            className="w-24 h-2 bg-teal-400 mx-auto mb-12 rounded-full"
            variants={itemVariants}
          />
          <motion.p
            className=" md:text-lg text-center text-black font-medium"
            variants={itemVariants}
          >
            Scrubbe assigns a unique identity to each device, browser, and
            session through advanced <br className=" md:block hidden" />{" "}
            fingerprinting. Detect reuse, spoofing, and unknown devices
            instantly
          </motion.p>
          <motion.div
            className=" max-w-5xl mx-auto bg-white rounded-2xl shadow p-6 md:p-10 border border-blue-200 mt-10"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Your Device FingerPrint
                </h3>
                <p className="text-gray-600 mb-6 text-base font-medium">
                  Below is a sample of the type of data Scrubbe can collect and
                  analyse to identify Potentially Security Threats
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className=" text-sm flex text-nowrap">View as JSON</p>
                <Switch checked={viewAsJSON} onChange={setViewAsJSON} />
              </div>
            </div>
            {viewAsJSON ? (
              <CodeHighlighter
                language=""
                code={`
${JSON.stringify(fingerprint, null, 2)}
              `}
              />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-blue-200">
                <table className="w-full min-w-[500px]  ">
                  <tbody className=" text-sm md:text-base">
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50 w-1/4 sm:w-1/3">
                        VPN Status
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[0].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Device Type
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[1].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Timestamp
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[4].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        OS Model
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[5].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        IP address
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[6].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Region/City
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[7].value}-{formattedItems[8].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Browser Information
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[9].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Network Provider
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[10].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        User Fingerprint ID
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[11].value}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Device Trust Score
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          formattedItems[12].value >= 50
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {formattedItems[12].value}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Fingerprint;
