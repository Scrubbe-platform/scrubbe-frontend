/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger delay for each major section
    },
  },
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
const HowItWorks = () => {
  return (
    <div className="min-h-[700px] bg-[#060709]">
      <motion.div
        className="container mx-auto py-10 px-5 flex-col gap-6 flex max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        <div>
          <motion.h2
            variants={itemVariants as any}
            className=" text-4xl md:text-5xl text-white font-bigshotOne"
          >
            The{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan via-[#8250BE] to-[#8250BE]">
              Incident Platform{" "}
            </span>{" "}
            Built Around How Teams Actually Work
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-5 md:py-10">
            <motion.div
              variants={itemVariants as any}
              className="flex flex-col justify-center gap-4"
            >
              <div className="flex flex-col gap-3">
                <p className="text-lg font-semibold text-white">
                  Auto-Deployment Failure Tickets
                </p>
                <p className="text-base text-white max-w-lg">
                  Failed deploys from GitHub, GitLab and other repos
                  automatically create incidents with linked commits, diff
                  context, and code intelligence attached
                </p>
                <Link href={""}>
                  <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                    <p>See code intelligence</p>
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-lg font-semibold text-white">
                  Code Intelligence Engine
                </p>
                <p className="text-base text-white max-w-lg">
                  Scrubbe inspects failing deployments and proposes likely
                  patches, rollbacks, or config changes so engineers move faster
                  than generic runbooks.
                </p>
                <Link href={""}>
                  <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                    <p>How it compares</p>
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-lg font-semibold text-white">
                  Fraud & Risk-Triggered Incidents
                </p>
                <p className="text-base text-white max-w-lg">
                  Connect fraud metrics, risk scores, or custom KPIs. Configure
                  thresholds to auto-open incidents and trigger workflows.
                </p>
                <Link href={""}>
                  <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                    <p>Connect Fraud Signals</p>
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-lg font-semibold text-white">
                  Unified Timeline with Ezra
                </p>
                <p className="text-base text-white max-w-lg">
                  Logs, metrics, deploys, fraud events, chat, and manual notes
                  stitched together and visualized through Ezra — one place to
                  see what actually happened.
                </p>
                {/* <Link href={""}>
                <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                  <p>Connect Fraud Signals</p>
                  <ArrowRight className="size-3" />
                </div>
              </Link> */}
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants as any}
              className="relative group z-10"
            >
              <div className="w-full h-full absolute -z-10 bg-IMSCyan scale-50 group-hover:scale-80 blur-3xl transition-all duration-200 ease-linear" />
              <img
                src="/IMS/incident-widget.jpg"
                alt="timeline"
                className="border border-IMSCyan/30 rounded-2xl"
              />
            </motion.div>
          </div>
        </div>

        <div className=" py-10">
          <motion.h2
            variants={itemVariants as any}
            className=" text-4xl md:text-5xl text-white font-bigshotOne"
          >
            See the{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan  to-[#8250BE]">
              {" "}
              Real Root Cause
            </span>{" "}
            — Not Just the Alert{" "}
          </motion.h2>
          <motion.div variants={itemVariants as any} className="py-5">
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-white">
                Most tools stop at alerting. Scrubbe’s Magic Insight Engine
                reconstructs the incident from before the alert fired —
                correlating deploys, latency, error spikes, chat messages, and
                fraud signals into one clear story.
              </p>
              <ul className=" list-disc space-y-3 text-white text-base pl-4">
                <li>Automatic timeline reconstruction </li>
                <li>Single-sentence root cause explanation</li>
                <li>Similarity detection with past incidents</li>
                <li>Service impact and blast radius view</li>
              </ul>
              <Link href={""}>
                <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                  <p>See how we compare</p>
                  <ArrowRight className="size-3" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className=" py-10">
          <motion.h2
            variants={itemVariants as any}
            className=" text-4xl md:text-5xl text-white font-bigshotOne max-w-4xl"
          >
            Code Intelligence — From Failed Deploy to{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan  to-[#8250BE]">
              Suggested Fix{" "}
            </span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-5 md:py-10">
            <motion.div
              variants={itemVariants as any}
              className="relative group z-10"
            >
              <div className="w-full h-full absolute -z-10 bg-IMSCyan scale-50 group-hover:scale-80 blur-3xl transition-all duration-200 ease-linear" />

              <img
                src="/IMS/intelligent-suggestion.svg"
                alt="timeline"
                className=""
              />
            </motion.div>

            <motion.div
              variants={itemVariants as any}
              className="flex flex-col justify-center gap-4"
            >
              <p className="text-base font-semibold text-white">
                When a deployment fails, Scrubbe’s Code Intelligence Engine
                doesn’t just raise an incident — it inspects the failure,
                understands what broke, and proposes a fix that’s ready to ship
                through your pipeline.
              </p>

              <p className="text-lg font-semibold text-white">Pipeline-Aware</p>
              <p className=" text-base text-white">
                Ingests logs, stack traces, test output, and deploy metadata
                from GitHub, GitLab, Bitbucket and more. Every suggestion is
                grounded in the actual failure, not generic code samples.
              </p>
              <p className="text-lg font-semibold text-white">
                PR-Ready Intelligence
              </p>
              <p className=" text-base text-white">
                Generates diff-style patches you can review, approve, and merge
                as a pull request — or apply to a staging branch for automatic
                re-runs.
              </p>
              <p className="text-lg font-semibold text-white">Safe by Design</p>
              <p className=" text-base text-white">
                Configure behaviour by environment: auto-apply and re-test in
                staging, intelligence-only for production, with full audit
                trails and team approvals.{" "}
              </p>
              <ul className=" list-disc space-y-3 text-white text-base pl-4">
                <li>
                  Detects failing deploys and opens incidents automatically{" "}
                </li>
                <li>Proposes multiple fix options with confidence scores</li>
                <li>Explains why the change works in plain language</li>
                <li>Routes intelligence to the right team or channel</li>
              </ul>

              <Link href={""}>
                <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                  <p>Compare with copilot & more</p>
                  <ArrowRight className="size-3" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className=" py-10">
          <motion.h2
            variants={itemVariants as any}
            className=" text-4xl md:text-5xl text-white font-bigshotOne"
          >
            On-Call Handover That{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan via-[#8250BE] to-[#8250BE]">
              {" "}
              Writes
            </span>{" "}
            Itself
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-5 md:py-10">
            <motion.div
              variants={itemVariants as any}
              className="flex flex-col justify-center gap-3"
            >
              <p className="text-lg font-semibold text-white max-w-lg">
                Handover shouldn’t depend on how tired the last engineer was.
                Scrubbe tracks incidents, actions, system health, and open
                investigations then generates a clean summary for the next
                on-call.
              </p>
              <p className="text-base text-white">Shift-level summaries</p>
              <p className="text-base text-white">
                Open incidents + next actions
              </p>
              <p className="text-base text-white">System health snapshot</p>
              <p className="text-base text-white">
                Mobile-ready handover view{" "}
              </p>
              <p className="text-base text-white">
                Eliminates “what happened overnight?” confusion{" "}
              </p>

              <Link href={""}>
                <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                  <p>See how we compare</p>
                  <ArrowRight className="size-3" />
                </div>
              </Link>
            </motion.div>
            <motion.div
              variants={itemVariants as any}
              className="relative group z-10"
            >
              <div className="w-full h-full absolute -z-10 bg-IMSCyan scale-50 group-hover:scale-80 blur-3xl transition-all duration-200 ease-linear" />

              <img
                src="/IMS/on-call-schedule.svg"
                alt="timeline"
                className=""
              />
            </motion.div>
          </div>
        </div>

        <div className=" py-10">
          <motion.h2
            variants={itemVariants as any}
            className=" text-4xl md:text-5xl text-white font-bigshotOne"
          >
            Train for{" "}
            <span className=" text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan via-[#8250BE] to-[#8250BE]">
              {" "}
              Real Outages{" "}
            </span>{" "}
            Before They Happen{" "}
          </motion.h2>

          <motion.div
            variants={itemVariants as any}
            className="flex flex-col justify-center gap-3"
          >
            <p className="text-lg font-semibold text-white max-w-lg">
              Scrubbe analyzes your past incidents, clusters patterns, and turns
              them into realistic simulations. Teams can rehearse real failures
              in staging or shadow environments and actually get better at
              incident response.
            </p>
            <p className="text-base text-white">
              Patterns generated from real history
            </p>
            <p className="text-base text-white">
              Chaos scenarios created automatically
            </p>
            <p className="text-base text-white">
              Team scoring and response metrics
            </p>
            <p className="text-base text-white">Mobile-ready handover view</p>
            <p className="text-base text-white">
              Replay key incidents as drills
            </p>
            <p className="text-base text-white">
              Use for onboarding junior engineers{" "}
            </p>

            <Link href={""}>
              <div className="px-2 py-1 w-fit text-sm flex gap-2 items-center border border-IMSCyan text-IMSCyan rounded-md">
                <p>Explore Simulations</p>
                {/* <ArrowRight className="size-3" /> */}
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HowItWorks;
