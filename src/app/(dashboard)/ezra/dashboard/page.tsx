"use client";
import React from "react";
import StatCard from "@/components/ezra/StatCard";
import AlertCard from "@/components/ezra/AlertCard";
import ProgressBar from "@/components/ezra/ProgressBar";
import { Button } from "@/components/ui/button";
import Cbutton from "@/components/ezra-landing/Cbutton";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { EzraChatWidget } from "@/components/ezra/EzraChatWidget";
const Dashboard = () => {
  return (
    <div className=" p-4 space-y-7">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        <StatCard
          title="Security Score"
          value={20}
          subtitle={
            <>
              <span className="inline-flex items-center gap-1 text-green-500 dark:text-green-400">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                +5 from yesterday
              </span>
            </>
          }
          progress={53}
          progressColor="bg-blue-400"
        />
        <StatCard
          title="Active Threats"
          value={10}
          subtitle={
            <>
              <div className="text-red-400 flex items-center gap-1">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
                -8 resolved today
              </div>
              <div className="text-yellow-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />
                12 high priority
              </div>
            </>
          }
        />
        <StatCard
          title="Response Time"
          value={30}
          postfix="m"
          subtitle={<span className="text-green-400">45% faster than SLA</span>}
        />
        <StatCard
          title="AI Confidence"
          value={20}
          postfix="%"
          subtitle={
            <span className="text-green-400">
              Learning from Analyst feedback
            </span>
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="dark:bg-[#151e2e] bg-white rounded-xl dark:shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col">
          <div className="text-sm font-semibold text-colorScBlue mb-3">
            Real time alerts
          </div>
          <AlertCard
            color="border-blue-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
          <AlertCard
            color="border-green-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
          <AlertCard
            color="border-yellow-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
          <AlertCard
            color="border-red-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
        </div>

        <div className="dark:bg-[#151e2e] bg-white rounded-xl dark:shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col">
          <div className="text-sm font-semibold text-colorScBlue mb-3">
            Identity Risk Scores
          </div>
          <div className="mb-4 dark:bg-[#232b3b] bg-[#F9FAFB] p-2 rounded-lg space-y-2">
            <div className="flex justify-between dark:text-white  text-sm mb-1">
              <span className=" text-sm font-semibold">High Risk Users</span>
              <span className="text-blue-400  text-sm">38%</span>
            </div>
            <ProgressBar value={38} color="bg-blue-500" />
          </div>
          <div className="mb-4 dark:bg-[#232b3b] bg-[#F9FAFB] p-2 rounded-lg space-y-2">
            <div className="flex justify-between dark:text-white text-sm mb-1">
              <span className=" text-sm font-semibold">Abnormal Logins</span>
              <span className="text-green-400  text-sm">25%</span>
            </div>
            <ProgressBar value={25} color="bg-green-500" />
          </div>
          <div className="mb-4 dark:bg-[#232b3b] bg-[#F9FAFB] p-2 rounded-lg space-y-2">
            <div className="flex justify-between dark:text-white text-sm mb-1">
              <span className=" text-sm font-semibold">
                Session Hijack Alerts
              </span>
              <span className="text-green-400  text-sm">25%</span>
            </div>
            <ProgressBar value={25} color="bg-green-500" />
          </div>
          <div className="mb-4 dark:bg-[#232b3b] bg-[#F9FAFB] p-2 rounded-lg space-y-2">
            <div className="flex justify-between dark:text-white text-sm mb-1">
              <span className=" text-sm font-semibold">Abnormal Users</span>
              <span className="text-green-400  text-sm">25%</span>
            </div>
            <ProgressBar value={25} color="bg-green-500" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="dark:bg-[#151e2e] bg-white rounded-xl dark:shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col gap-2">
          <div className="text-sm font-semibold text-colorScBlue mb-3">
            Auto-Respond Status
          </div>

          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Ouarantine Actions</span>
            <span className="dark:text-green-400 text-green-500">
              12 Active
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Playbooks Running</span>
            <span className="dark:text-green-400 text-green-500">
              7 in Progress
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Simulations Complete</span>
            <span className="dark:text-green-400 text-green-500">
              156 today
            </span>
          </div>

          <Cbutton>Generate New Playbook</Cbutton>
        </div>

        <div className="dark:bg-[#151e2e] bg-white rounded-xl dark:shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col gap-2">
          <div className="text-sm font-semibold text-colorScBlue mb-3">
            Compliance Dashboard
          </div>

          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>GDPR Compliance</span>
            <span className="dark:text-green-400 text-green-500 flex items-center gap-1">
              <Check size={16} /> 98%
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>NIST Framework</span>
            <span className="dark:text-green-400 text-green-500 flex items-center gap-1">
              <Check size={16} /> 94%
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>ISO 27001</span>
            <span className="dark:text-green-400 text-green-500 flex items-center gap-1">
              <Check size={16} /> 98%
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>SOX Compliance</span>
            <span className="dark:text-green-400 text-green-500 flex items-center gap-1">
              <Check size={16} /> 98%
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="dark:bg-[#151e2e] bg-white rounded-xl dark:shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col gap-2">
          <div className="text-sm font-semibold text-colorScBlue mb-3">
            System Integration{" "}
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            Splunk SIEM
            <div className=" h-2 w-2 rounded-full dark:bg-green-400 bg-green-600" />
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            Crowdstrike EDR{" "}
            <div className=" h-2 w-2 rounded-full dark:bg-green-400 bg-green-600" />
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            Sentinel One{" "}
            <div className=" h-2 w-2 rounded-full dark:bg-green-400 bg-green-600" />
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            PagerDuty{" "}
            <div className=" h-2 w-2 rounded-full dark:bg-green-400 bg-green-600" />
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            Slack Notification{" "}
            <div className=" h-2 w-2 rounded-full dark:bg-green-400 bg-green-600" />
          </div>
        </div>

        <div className="dark:bg-[#151e2e] bg-white rounded-xl dark:shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col gap-2">
          <div className="text-sm font-semibold text-colorScBlue mb-3">
            Ezra Brief Today{" "}
          </div>

          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Security Posture:</span>
            <span>Strong-87/100 score</span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Key Threats:</span>
            <span>3 APT campaigns detected , likely nation state actors</span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Action Taken:</span>
            <span>23 threats neutralized , 12 accounts secured</span>
          </div>
          <div className="flex items-center gap-2 justify-between dark:text-white text-sm">
            <span>Trend:</span>
            <span>Attack volume down 15% from last week</span>
          </div>

          <Button
            size={"sm"}
            className="w-fit bg-transparent border dark:border-white dark:text-white text-black  mt-2"
          >
            Email Full reports
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.2 }}
      >
        <EzraChatWidget />
      </motion.div>
    </div>
  );
};

export default Dashboard;
