"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────
// Connector data — icons follow /IMS/icons/{name} convention
// ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Monitoring",
  "CI/CD",
  "Incident Management",
  "Cloud",
  "Collaboration",
  "Security",
] as const;

const CONNECTORS = [
  {
    name: "GitHub",
    id: "github",
    icon: "/integration/github.png",
    desc: "Push events, PR merges, failed checks, deployment statuses",
    category: "CI/CD",
    comingSoon: false,
  },
  {
    name: "Kubernetes",
    id: "kubernetes",
    icon: "/integration/kubernetes.png",
    desc: "CrashLoopBackOff, pod restarts, OOMKilled, failed deployments",
    category: "Cloud",
    comingSoon: true,
  },
  {
    id: "datadog",
    name: "Datadog",
    icon: "/integration/datadog.png",
    desc: "Metric alerts, SLO breaches, anomaly detection, monitors",
    category: "Monitoring",
    comingSoon: true,
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    icon: "/integration/pagerDuty.png",
    desc: "Alert triggered, incident acknowledged, resolved events",
    category: "Incident Management",
    comingSoon: true,
  },
  {
    id: "aws",
    name: "AWS",
    icon: "/integration/aws.png",
    desc: "CloudWatch alarms, ECS task failures, Lambda errors",
    category: "Cloud",
    comingSoon: true,
  },
  {
    id: "prometheus",
    name: "Prometheus",
    icon: "/integration/prometheus.png",
    desc: "Alertmanager webhook receiver, rule evaluation events",
    category: "Monitoring",
    comingSoon: true,
  },
  {
    id: "gitlab",
    name: "Gitlab",
    icon: "/integration/gitlab.png",
    desc: "Pipeline failures, merge requests, job status change",
    category: "CI/CD",
    comingSoon: false,
  },
  {
    id: "grafana",
    name: "Grafana",
    icon: "/integration/grafana.png",
    desc: "Alerting webhooks, dashboard annotations, on-call alerts",
    category: "Monitoring",
    comingSoon: true,
  },
  {
    id: "azure",
    name: "Azure",
    icon: "/integration/azure.png",
    desc: "Azure monitor alerts, AKS events, App Service",
    category: "Cloud",
    comingSoon: true,
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    icon: "/integration/google-cloud.png",
    desc: "Cloud Monitoring alerts, GKE events, Cloud Run errors",
    category: "Cloud",
    comingSoon: true,
  },
  {
    id: "vercel",
    name: "Vercel",
    icon: "/integration/vercel.png",
    desc: "Deploy intelligence . Application Runtime Signals. Release impact Analysis",
    category: "CI/CD",
    comingSoon: true,
  },
  {
    id: "slack",
    name: "Slack",
    icon: "/integration/slack.png",
    desc: "Incident notifications, approval requests, resolution summaries",
    category: "Collaboration",
    comingSoon: true,
  },
  {
    id: "jira",
    name: "Jira",
    icon: "/integration/jira.png",
    desc: "Auto-create tickets on incident raise, sync state transitions",
    category: "Incident Management",
    comingSoon: true,
  },
  {
    id: "circleci",
    name: "Circle CI",
    icon: "/integration/circle.png",
    desc: "Monitors CI/CD workflows and job execution. Captures pipeline failures and deployment events.",
    category: "CI/CD",
    comingSoon: true,
  },
  {
    id: "argocd",
    name: "Argo CD",
    icon: "/integration/argo.png",
    desc: "Tracks Git-to-cluster deployments and synchronization events.",
    category: "CI/CD",
    comingSoon: true,
  },
  {
    id: "octopus",
    name: "Octopus Deploy",
    icon: "/integration/octopus.png",
    desc: "Tracks release promotions across environments. Captures deployment approvals and execution history.",
    category: "CI/CD",
    comingSoon: true,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    icon: "/integration/mongo.png",
    desc: "Correlates database degradation with application failures.",
    category: "Cloud",
    comingSoon: true,
  },
  {
    id: "teamcity",
    name: "Team City",
    icon: "/integration/teamcity.png",
    desc: "Monitors build executions and failures.Provides build artifacts and pipeline execution evidence.",
    category: "CI/CD",
    comingSoon: true,
  },
  {
    id: "neon",
    name: "Neon",
    icon: "/integration/neon.png",
    desc: "Database Health Intelligence. Application Runtime Signals. Release Impact Analysis",
    category: "Cloud",
    comingSoon: true,
  },
  {
    id: "new-relic",
    name: "New Relic",
    icon: "/integration/new-relic.png",
    desc: "APM alerts, error rate spikes, Apdex threshold breaches",
    category: "Monitoring",
    comingSoon: true,
  },
  {
    id: "opsgenie",
    name: "OpsGenie",
    icon: "/integration/opsgenie.png",
    desc: "Alert received, escalation triggered, om-call handoff events",
    category: "Incident Management",
    comingSoon: true,
  },
  {
    id: "synk",
    name: "Synk",
    icon: "/integration/snyc.png",
    desc: "Critical CVEs in production dependencies, license violations",
    category: "Security",
    comingSoon: true,
  },
  {
    id: "elastic",
    name: "Elastic",
    icon: "/integration/elastic.png",
    desc: "Log-based alert rules, watcher triggers, security signals",
    category: "Monitoring",
    comingSoon: true,
  },
  {
    id: "splunk",
    name: "Splunk",
    icon: "/integration/splunk.png",
    desc: "Notable events, correlation search results, adaptive responses",
    category: "Security",
    comingSoon: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: "/integration/teams.png",
    desc: "Incident notifications, approval actions, war room channels",
    category: "Collaboration",
    comingSoon: true,
  },
  {
    id: "linear",
    name: "Linear",
    icon: "/integration/linear.png",
    desc: "Team's execution workflow, structured follow-up issues for hardening actions and operational improvements",
    category: "Incident Management",
    comingSoon: true,
  },
];

// ─────────────────────────────────────────────────────────────────
// Compact connector card — icon + name only
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
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: 0.03 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-white border cursor-pointer border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative w-11 h-11 flex items-center justify-center">
        <Image
          src={connector.icon}
          alt={connector.name}
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-[14px] font-bold text-black tracking-tight">
        {connector.name}
      </h3>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function ConnectorsSection({ filter }: { filter?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>("All");
  const router = useRouter();

  const available = CONNECTORS.filter((item) => item.id !== filter);
  const filtered = available.filter(
    (item) => activeCategory === "All" || item.category === activeCategory,
  );
  const total = available.length;

  return (
    <section
      ref={ref}
      className="relative w-full py-16 px-6"
      style={{ background: "#f2f3f5" }}
    >
      <div className="relative z-10 max-w-[1480px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif font-bold text-gray-950 leading-[1.15]"
          style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}
        >
          Your stack already has the signals.
          <br />
          Scrubbe connects the dots.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-[15px] text-gray-500 leading-relaxed mt-4 mb-8 max-w-[720px]"
        >
          Scrubbe connects to the systems your engineering teams already use,
          turning fragmented operational data into the context required to
          investigate, decide and remediate incidents. Your existing tools stay
          in place. Scrubbe makes them work together.
        </motion.p>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold border cursor-pointer transition-colors ${
                activeCategory === cat
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Two-column layout: photo + card | connector grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-6">
          {/* Left — photo + summary card */}
          <div>
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src="/IMS/integration.png"
                alt="Systems Scrubbe connects to"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 mt-4">
              <p className="text-[12px] font-bold text-emerald-600 tracking-wide uppercase">
                {total}+ Native integrations for all categories
              </p>
              <p className="text-[14px] text-gray-500 leading-relaxed mt-2">
                Signals from every platform are normalised into a single,
                deduplicated event stream - so you act on incidents, not noise.
              </p>
            </div>
          </div>

          {/* Right — connector grid */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.slice(0, 12).map((c, i) => (
                <ConnectorCard
                  key={c.id}
                  connector={c}
                  index={i}
                  inView={inView}
                  onClick={() => router.push(`/connector/${c.id}`)}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-end mt-4"
            >
              <Link
                href="/connector"
                className="text-[14px] font-semibold text-emerald-600 underline underline-offset-4 hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5"
              >
                Browse all {total}+ Integration
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
