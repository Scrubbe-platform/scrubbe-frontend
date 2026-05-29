"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { id } from "zod/v4/locales";

// ─────────────────────────────────────────────────────────────────
// Connector data — icons follow /IMS/icons/{name} convention
// ─────────────────────────────────────────────────────────────────
const CONNECTORS = [
  {
    name: "GitHub",
    id: "github",
    icon: "/integration/github.png",
    desc: "Push events, PR merges, failed checks, deployment statuses",
    comingSoon: false,
  },
  {
    name: "Kubernetes",
    id: "kubernetes",
    icon: "/integration/kubernetes.png",
    desc: "CrashLoopBackOff, pod restarts, OOMKilled, failed deployments",
    comingSoon: true,
  },
  {
    id: "datadog",
    name: "Datadog",
    icon: "/integration/datadog.png",
    desc: "Metric alerts, SLO breaches, anomaly detection, monitors",
    comingSoon: true,
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    icon: "/integration/pagerduty.png",
    desc: "Alert triggered, incident acknowledged, resolved events",
    comingSoon: true,
  },
  {
    id: "aws",
    name: "AWS",
    icon: "/integration/aws.png",
    desc: "CloudWatch alarms, ECS task failures, Lambda errors",
    comingSoon: true,
  },
  {
    id: "prometheus",
    name: "Prometheus",
    icon: "/integration/prometheus.png",
    desc: "Alertmanager webhook receiver, rule evaluation events",
    comingSoon: true,
  },
  {
    id: "gitlab",
    name: "Gitlab",
    icon: "/integration/gitlab.png",
    desc: "Pipeline failures, merge requests, job status change",
    comingSoon: false,
  },
  {
    id: "grafana",
    name: "Grafana",
    icon: "/integration/grafana.png",
    desc: "Alerting webhooks, dashboard annotations, on-call alerts",
    comingSoon: true,
  },
  {
    id: "azure",
    name: "Azure",
    icon: "/integration/azure.png",
    desc: "Azure monitor alerts, AKS events, App Service",
    comingSoon: true,
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    icon: "/integration/google-cloud.png",
    desc: "Cloud Monitoring alerts, GKE events, Cloud Run errors",
    comingSoon: true,
  },
  {
    id: "slack",
    name: "Slack",
    icon: "/integration/slack.png",
    desc: "Incident notifications, approval requests, resolution summaries",
    comingSoon: true,
  },
  {
    id: "jira",
    name: "Jira",
    icon: "/integration/jira.png",
    desc: "Auto-create tickets on incident raise, sync state transitions",
    comingSoon: true,
  },
  {
    id: "github-actions",
    name: "Github Actions",
    icon: "/integration/github-actions.png",
    desc: "Workflow failures, deployment events, environment status",
    comingSoon: true,
  },
  {
    id: "new-relic",
    name: "New Relic",
    icon: "/integration/new-relic.png",
    desc: "APM alerts, error rate spikes, Apdex threshold breaches",
    comingSoon: true,
  },
  {
    id: "opsgenie",
    name: "OpsGenie",
    icon: "/integration/opsgenie.png",
    desc: "Alert received, escalation triggered, om-call handoff events",
    comingSoon: true,
  },
  {
    id: "synk",
    name: "Synk",
    icon: "/integration/snyc.png",
    desc: "Critical CVEs in production dependencies, license violations",
    comingSoon: true,
  },
  {
    id: "elastic",
    name: "Elastic",
    icon: "/integration/elastic.png",
    desc: "Log-based alert rules, watcher triggers, security signals",
    comingSoon: true,
  },
  {
    id: "splunk",
    name: "Splunk",
    icon: "/integration/splunk.png",
    desc: "Notable events, correlation search results, adaptive responses",
    comingSoon: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: "/integration/teams.png",
    desc: "Incident notifications, approval actions, war room channels",
    comingSoon: true,
  },
  {
    id: "bit-bucket",
    name: "Bit Bucket",
    icon: "/integration/bitbucket.png",
    desc: "Repository push, pipeline failures, pull request events",
    comingSoon: true,
  },
  {
    id: "linear",
    name: "Linear",
    icon: "/integration/linear.png",
    desc: "Team's execution workflow, structured follow-up issues for hardening actions and operational improvements",
    comingSoon: true,
  },
];

// ─────────────────────────────────────────────────────────────────
// Connector Card
// ─────────────────────────────────────────────────────────────────

function ConnectorCard({
  connector,
  index,
  inView,
  onClick,
}: {
  connector: (typeof CONNECTORS)[0];
  index: number;
  inView: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.45,
        delay: 0.04 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-white border relative border-gray-200 rounded-xl p-5 flex flex-col items-center text-center hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
      onClick={onClick}
    >
      {connector.comingSoon && (
        <div className="absolute top-2 right-2 border p-0.5 rounded-md text-[8px] text-zinc-400 border-zinc-400">
          coming soon
        </div>
      )}
      {/* Icon */}
      <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
        <Image
          src={connector.icon}
          alt={connector.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Name */}
      <h3 className="text-[14px] font-bold text-gray-900 mb-2 tracking-tight">
        {connector.name}
      </h3>

      {/* Description */}
      <p className="text-[12px] text-gray-500 leading-relaxed">
        {connector.desc}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function ConnectorsSection({ filter }: { filter?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  return (
    <section
      ref={ref}
      className="relative w-full py-16 px-6 overflow-hidden"
      style={{ background: "#f9fafb" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="cgrid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cgrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-black text-gray-950 leading-[1.08] tracking-[-0.03em] mb-4"
          style={{ fontSize: "clamp(30px, 4vw, 56px)" }}
        >
          Native connectors.
          <br />
          One unified pipeline.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-[14.5px] text-gray-500 leading-relaxed mb-12 max-w-lg"
        >
          Every integration speaks the same language. Signals from 18 sources
          are normalised, deduplicated, and evaluated by the same governance
          layer — so your team gets one incident, not eighteen alerts.
        </motion.p>

        {/* Connector grid — 6 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
          {CONNECTORS.filter((item) => item.id !== filter)
            .slice(0, showAll ? CONNECTORS.length + 1 : 12)
            .map((c, i) => (
              <ConnectorCard
                key={c.name}
                connector={c}
                index={i}
                inView={inView}
                onClick={() => router.push(`/connector/${c.id}`)}
              />
            ))}
        </div>

        {/* Show all Connectors button — bottom right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-end"
        >
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-6 py-3 text-[14px] font-semibold text-gray-800 border border-gray-300 rounded-lg bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 cursor-pointer"
          >
            Show {showAll ? "less" : "all"} Connectors
          </button>
        </motion.div>
      </div>
    </section>
  );
}
