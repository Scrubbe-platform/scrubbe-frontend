"use client";
import Button from "@/components/ui/Button1";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useRef } from "react";
import CustomConnectorWorkbench from "./_module/components/CustomConnection";
import SuggestionConnectorSection from "./_module/components/SuggestionConnectorSection";

export interface ConnectorItem {
  name: string;
  subtext: string;
}

interface ConnectorCategoryGroup {
  category: string;
  items: ConnectorItem[];
}

export type WorkbenchStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface KeyValueMappingRow {
  id: string;
  sourceKey: string;
  targetValue: string;
}

export interface CustomConnectorForm {
  name: string;
  description: string;
  category: string;
  businessOwner: string;
  connectionType: string;
  baseUrl: string;
  authMethod: string;
  supportedEventTypes: string[];
  eventMappings: KeyValueMappingRow[];
  serviceMappings: KeyValueMappingRow[];
  environmentMappings: KeyValueMappingRow[];
  downstreamConsumers: string[];
  signalImportance: "Informational" | "Low" | "Medium" | "High" | "Critical";
}

const CONNECTORS_DIRECTORY: ConnectorCategoryGroup[] = [
  {
    category: "Source Control",
    items: [
      {
        name: "GitHub",
        subtext: "Pull requests, commits, merges, and code ownership.",
      },
      {
        name: "GitLab",
        subtext: "Merge requests, pipelines, and repository activity.",
      },
      {
        name: "Bitbucket",
        subtext: "Pull requests, commits, and branch events.",
      },
    ],
  },
  {
    category: "CI/CD & Delivery",
    items: [
      {
        name: "CircleCI",
        subtext: "Build and deployment outcomes, pipeline failures.",
      },
      {
        name: "TeamCity",
        subtext: "Build chains, test results, and artifacts.",
      },
      { name: "Argo CD", subtext: "GitOps sync status and rollout health." },
      {
        name: "Octopus Deploy",
        subtext: "Release promotions and deployment targets.",
      },
    ],
  },
  {
    category: "Cloud & Infrastructure",
    items: [
      {
        name: "AWS",
        subtext: "CloudWatch alarms, resource changes, and service events.",
      },
      { name: "Azure", subtext: "activity logs, and alerts." },
      {
        name: "Google Cloud",
        subtext: "Operations signals and resource events.",
      },
      {
        name: "Kubernetes",
        subtext: "Deployment events, pod health, and rollouts.",
      },
    ],
  },
  {
    category: "Observability",
    items: [
      {
        name: "Datadog",
        subtext: "Monitors, traces, and service degradation signals.",
      },
      { name: "Grafana", subtext: "Alerts and dashboard threshold breaches." },
      { name: "Prometheus", subtext: "Alerting rules and metric anomalies." },
      { name: "New Relic", subtext: "APM alerts and error analytics." },
    ],
  },
  {
    category: "Incident Management",
    items: [
      {
        name: "PagerDuty",
        subtext: "Escalations, on-call routing, and incident lifecycle.",
      },
      {
        name: "Opsgenie",
        subtext: "Alerts, schedules, and escalation policies.",
      },
    ],
  },
  {
    category: "Collaboration",
    items: [
      {
        name: "Slack",
        subtext: "Response coordination and incident channels.",
      },
      {
        name: "Microsoft Teams",
        subtext: "Response coordination and notifications.",
      },
    ],
  },
  {
    category: "Security",
    items: [
      { name: "Snyk", subtext: "Vulnerability findings and dependency risk." },
      { name: "Elastic", subtext: "Security signals and log analytics." },
      { name: "Splunk", subtext: "Security events and operational logs." },
    ],
  },
  {
    category: "Data",
    items: [
      { name: "MongoDB", subtext: "Database events and operational state." },
    ],
  },
  {
    category: "Execution Management",
    items: [
      { name: "Jira", subtext: "Remediation tracking and work items." },
      { name: "Linear", subtext: "Issues, cycles, and remediation tasks." },
    ],
  },
];

const CONNECTED_SYSTEMS = [
  "Source Control",
  "CI/CD & Delivery",
  "Cloud & Infra",
  "Observability",
  "Incident Mgmt",
  "Collaboration",
  "Security",
  "Data & Execution",
];

const CONSUMED_BY = [
  "Incident Detection",
  "Autonomous Investigation",
  "Remediation Agents",
  "Knowledge Intelligence",
  "Post-Incident Learning",
  "Executive Reporting",
  "Handover Intelligence",
  "Operational Governance",
];

const FOUNDATION_ROWS = [
  {
    muted: "Instead of presenting engineers with disconnected alerts,",
    bold: "Scrubbe presents ",
    accent: "explanations.",
  },
  {
    muted: "Instead of displaying isolated symptoms,",
    bold: "Scrubbe identifies ",
    accent: "relationships.",
  },
  {
    muted: "Instead of requiring manual investigation,",
    bold: "Scrubbe orchestrates ",
    accent: "autonomous analysis.",
  },
  {
    muted: "Scrubbe orchestrates autonomous analysis.",
    bold: "Scrubbe ",
    accent: "continuously learns",
    tail: " from every incident, remediation, handover, and review.",
  },
];

const COMPOUNDING = [
  "Investigations become faster.",
  "Root cause identification becomes more accurate.",
  "Remediation decisions become more informed.",
  "Operational risk becomes more visible.",
  "Organizational learning becomes continuous.",
];

const ISOLATION_BULLETS = [
  <>
    A deployment failure observed in <strong>CircleCI</strong> is correlated
    with a pull request merged in GitHub.
  </>,
  <>
    A service degradation detected by <strong>Datadog</strong> is linked to a{" "}
    <strong>Kubernetes</strong> deployment event.
  </>,
  <>
    A CloudWatch alarm originating from <strong>AWS</strong> is connected to a
    historical incident that required a similar remediation.
  </>,
  <>
    An alert escalated through <strong>PagerDuty</strong> automatically triggers
    investigative workflows that gather evidence from observability platforms,
    repositories, infrastructure providers, ticketing systems, and historical
    operational records.
  </>,
];

function MosaicBg({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1e8d1 1px, transparent 1px),
            linear-gradient(to bottom, #d1e8d1 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.45,
        }}
      />
      {/* scattered filled squares */}
      {[
        { top: "8%", left: "4%", size: 52 },
        { top: "8%", left: "14%", size: 52 },
        { top: "8%", left: "28%", size: 52 },
        { top: "8%", left: "42%", size: 52 },
        { top: "8%", left: "57%", size: 52 },
        { top: "8%", left: "71%", size: 52 },
        { top: "8%", left: "85%", size: 52 },
        { top: "35%", left: "4%", size: 52 },
        { top: "35%", left: "20%", size: 52 },
        { top: "35%", left: "85%", size: 52 },
        { top: "62%", left: "4%", size: 52 },
        { top: "62%", left: "20%", size: 52 },
        { top: "62%", left: "85%", size: 52 },
        { top: "88%", left: "4%", size: 52 },
        { top: "88%", left: "14%", size: 52 },
        { top: "88%", left: "28%", size: 52 },
        { top: "88%", left: "57%", size: 52 },
        { top: "88%", left: "71%", size: 52 },
        { top: "88%", left: "85%", size: 52 },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: "#e8f5e8",
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[#1a1a1a] leading-tight"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontStyle: "italic",
        fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
      }}
    >
      {children}
    </p>
  );
}

function SerHead({
  children,
  size = "lg",
  className = "",
}: {
  children: React.ReactNode;
  size?: "lg" | "xl";
  className?: string;
}) {
  return (
    <h2
      className={`text-[#0f0f0e] leading-tight ${className}`}
      style={{
        fontFamily: "'Georgia','Times New Roman',serif",
        fontSize:
          size === "xl"
            ? "clamp(2rem,3.5vw,2.75rem)"
            : "clamp(1.65rem,3vw,2.25rem)",
        fontWeight: 400,
      }}
    >
      {children}
    </h2>
  );
}

// ─── Monospace outline button ─────────────────────────────────────────────────

function MonoButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-3 border border-[#16a34a] text-[#16a34a] rounded-md text-[0.8125rem] tracking-wider hover:bg-[#f0fdf4] transition-colors"
      style={{ fontFamily: "monospace" }}
    >
      {children}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M2 4L5 7L8 4"
          stroke="#16a34a"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
export default function ConnectorsPage() {
  // --- UI Interactivity States ---
  const [selectedConnector, setSelectedConnector] = useState<{
    name: string;
    cat: string;
    sig: string;
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const directoryRef = useRef<HTMLDivElement>(null);

  // --- Flatten Lookups Map Index ---
  const lookupMap = useMemo(() => {
    const map: Record<string, { cat: string; sig: string }> = {};
    CONNECTORS_DIRECTORY.forEach((g) => {
      g.items.forEach((i) => {
        map[i.name] = { cat: g.category, sig: i.subtext };
      });
    });
    return map;
  }, []);

  const handleSelectConnector = (name: string) => {
    const found = lookupMap[name];
    if (found) {
      setSelectedConnector({ name, cat: found.cat, sig: found.sig });
      setIsDropdownOpen(false);
    }
  };

  const handleInlineLinkSelect = (name: string) => {
    handleSelectConnector(name);
    directoryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  function SignalsDiagram() {
    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1000 380"
          className="w-full"
          style={{ minWidth: 640 }}
        >
          {/* Column labels */}
          {[
            [155, "CONNECTED SYSTEMS"],
            [480, "INGESTION"],
            [720, "OPERATIONAL GRAPH"],
            [890, "CONSUMED BY"],
          ].map(([x, label]) => (
            <text
              key={String(label)}
              x={Number(x)}
              y={30}
              fill="#9ca3af"
              fontSize="9.5"
              fontFamily="monospace"
              letterSpacing="2"
              textAnchor="middle"
            >
              {String(label)}
            </text>
          ))}

          {/* Connected systems */}
          {CONNECTED_SYSTEMS.map((sys, i) => {
            const y = 70 + i * 36;
            return (
              <g key={sys}>
                <text
                  x={270}
                  y={y + 4}
                  fill="#374151"
                  fontSize="13"
                  fontFamily="system-ui,sans-serif"
                  textAnchor="end"
                >
                  {sys}
                </text>
                <circle cx={284} cy={y} r={3.5} fill="#3b82f6" />
                <path
                  d={`M288,${y} C360,${y} 400,185 440,185`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.3"
                  opacity="0.7"
                />
              </g>
            );
          })}

          {/* Connectors box */}
          <rect
            x={440}
            y={155}
            width={120}
            height={60}
            rx={5}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth={1.5}
          />
          <text
            x={500}
            y={181}
            fill="#111827"
            fontSize="13.5"
            fontWeight="600"
            fontFamily="system-ui"
            textAnchor="middle"
          >
            Connectors
          </text>
          <text
            x={500}
            y={197}
            fill="#6b7280"
            fontSize="8.5"
            fontFamily="monospace"
            letterSpacing="1.5"
            textAnchor="middle"
          >
            NORMALISE · CORRELATE
          </text>

          {/* Arrow */}
          <line
            x1={560}
            y1={185}
            x2={610}
            y2={185}
            stroke="#6b7280"
            strokeWidth={1.4}
            markerEnd="url(#arr)"
          />

          {/* Intelligence Layer box */}
          <rect
            x={610}
            y={155}
            width={140}
            height={60}
            rx={5}
            fill="none"
            stroke="#374151"
            strokeWidth={1.5}
          />
          <text
            x={680}
            y={179}
            fill="#111827"
            fontSize="13"
            fontWeight="600"
            fontFamily="system-ui"
            textAnchor="middle"
          >
            Operational
          </text>
          <text
            x={680}
            y={195}
            fill="#111827"
            fontSize="13"
            fontWeight="600"
            fontFamily="system-ui"
            textAnchor="middle"
          >
            Intelligence Layer
          </text>
          <text
            x={680}
            y={209}
            fill="#6b7280"
            fontSize="8"
            fontFamily="monospace"
            letterSpacing="1"
            textAnchor="middle"
          >
            CONTEXT GRAPH
          </text>

          {/* Fan lines to consumed by */}
          {CONSUMED_BY.map((item, i) => {
            const y = 58 + i * 33;
            return (
              <g key={item}>
                <path
                  d={`M750,185 C800,185 820,${y} 855,${y}`}
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="1.2"
                />
                <text
                  x={862}
                  y={y + 4}
                  fill="#374151"
                  fontSize="12"
                  fontFamily="system-ui"
                >
                  {item}
                </text>
              </g>
            );
          })}

          <defs>
            <marker
              id="arr"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L7,3 z" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#15140f] text-[17px] font-light leading-relaxed antialiased space-y-10">
      {/* HERO SECTION */}
      <section className="py-[118px] px-10 border-b border-[#efece4] max-w-[1160px] mx-auto">
        <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-[1.08] tracking-tight max-w-[15ch]">
          Operational intelligence is only as powerful as the information{" "}
          <em className="font-serif font-medium text-IMSLightGreen italic">
            available to it.
          </em>
        </h1>
        <p className="max-w-[60ch] mt-8 text-xl font-normal text-[#15140f]">
          Connectors are the intelligence ingestion layer of the Scrubbe
          platform — continuously collecting operational signals from across
          your estate and turning them into structured intelligence.
        </p>
        <div className="flex gap-8 flex-wrap items-center mt-11">
          <Button
            onClick={() => {
              setIsDropdownOpen(true);
              directoryRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Connect a System
          </Button>
          <Button onClick={() => {}} variant="outline-green">
            View Integration Documentation
          </Button>
        </div>
      </section>

      {/* SECTION 01: FRAGMENTATION CRITERIA */}
      <div>
        <div className="bg-[#EDFBEE] min-h-[600px] flex flex-col justify-center">
          <section className="py-22 px-10 border-b  border-[#efece4] max-w-[1160px] mx-auto grid grid-cols-1 md:grid-cols-[180px_1fr] gap-14 items-start">
            <div className="sticky top-28 before:mb-4">
              <SectionLabel>The problem</SectionLabel>
            </div>
            <div className="max-w-[760px]">
              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
                Modern incidents rarely originate from a{" "}
                <em className="font-serif text-IMSLightGreen italic">
                  single source.
                </em>
              </h2>
              <p className="mt-5 text-[#42413a]">
                A deployment may introduce a defect. Infrastructure may amplify
                its impact. Monitoring platforms may detect degradation.
                Alerting systems may escalate the issue. Collaboration tools may
                coordinate the response. Ticketing platforms may track
                remediation efforts.
              </p>
              <p className="mt-5 text-[#42413a]">
                Yet despite the interconnected nature of modern systems,
                operational data remains fragmented across dozens of
                disconnected tools. Engineering teams are forced to assemble
                context manually — moving between repositories, pipelines, and
                observability systems in an effort to understand what happened.
              </p>
              <p className="mt-5 font-medium text-[#15140f]">
                Scrubbe was designed to eliminate this fragmentation.
              </p>
            </div>
          </section>
        </div>
        <section
          className="w-full relative py-20 px-6"
          style={{ background: "#f0faf0" }}
        >
          <MosaicBg />
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
              <div className="sticky top-28 before:mb-4">
                <SectionLabel>The ingestion layer</SectionLabel>
              </div>
              <div>
                <h2
                  className="text-[#0f0f0e] leading-tight mb-7"
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 400,
                  }}
                >
                  Every connected system becomes part of an operational graph.
                </h2>

                <div
                  className="space-y-5 text-[#374151] text-[0.9375rem] leading-[1.7]"
                  style={{ maxWidth: 680 }}
                >
                  <p>
                    Connectors continuously collect operational signals and
                    transform them into structured intelligence.
                  </p>
                  <p>
                    That intelligence is consumed by incident workflows,
                    autonomous investigations, remediation agents, knowledge
                    intelligence, post-incident learning systems, executive
                    reporting, and operational governance processes.
                  </p>
                  <p>
                    Rather than treating integrations as isolated point-to-point
                    connections, Scrubbe treats every connected system as part
                    of a broader operational graph. Each event, alert,
                    deployment, configuration change, approval action,
                    infrastructure signal, communication thread, and remediation
                    activity contributes to a continuously evolving
                    understanding of operational health.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 04: CONNECTORS DIRECTORY CONTEXT INTERFACE */}
      <section
        ref={directoryRef}
        className="py-22 px-10 border-b border-[#efece4] max-w-[1160px] mx-auto grid grid-cols-1 md:grid-cols-[180px_1fr] gap-14 items-start"
        id="directory"
      >
        <div className="sticky top-28 before:mb-4">
          <SectionLabel>The questions that matter</SectionLabel>
        </div>
        <div className="max-w-[760px] w-full">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
            This enables Scrubbe to answer the questions that matter most under
            pressure.
          </h2>
          <p className="mt-8 text-[#15140f] text-base font-light leading-relaxed">
            To answer these questions, Scrubbe continuously correlates
            information across source control systems such as{" "}
            <button
              onClick={() => handleInlineLinkSelect("GitHub")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              GitHub
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("GitLab")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              GitLab
            </button>
            , and{" "}
            <button
              onClick={() => handleInlineLinkSelect("Bitbucket")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Bitbucket
            </button>
            ; deployment and delivery platforms including{" "}
            <button
              onClick={() => handleInlineLinkSelect("CircleCI")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              CircleCI
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("TeamCity")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              TeamCity
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("Argo CD")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Argo CD
            </button>
            , and Aut{" "}
            <button
              onClick={() => handleInlineLinkSelect("Octopus Deploy")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Octopus Deploy
            </button>
            ; cloud and infrastructure providers such as{" "}
            <button
              onClick={() => handleInlineLinkSelect("AWS")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              AWS
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("Azure")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Azure
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("Google Cloud")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Google Cloud
            </button>
            , and{" "}
            <button
              onClick={() => handleInlineLinkSelect("Kubernetes")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Kubernetes
            </button>
            ; observability platforms including{" "}
            <button
              onClick={() => handleInlineLinkSelect("Datadog")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Datadog
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("Grafana")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Grafana
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("Prometheus")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Prometheus
            </button>
            , and biographies{" "}
            <button
              onClick={() => handleInlineLinkSelect("New Relic")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              New Relic
            </button>
            ; incident management systems such as{" "}
            <button
              onClick={() => handleInlineLinkSelect("PagerDuty")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              PagerDuty
            </button>
            , and{" "}
            <button
              onClick={() => handleInlineLinkSelect("Opsgenie")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Opsgenie
            </button>
            ; collaboration environments including{" "}
            <button
              onClick={() => handleInlineLinkSelect("Slack")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Slack
            </button>{" "}
            and{" "}
            <button
              onClick={() => handleInlineLinkSelect("Microsoft Teams")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Microsoft Teams
            </button>
            ; security platforms including{" "}
            <button
              onClick={() => handleInlineLinkSelect("Snyk")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Snyk
            </button>
            ,{" "}
            <button
              onClick={() => handleInlineLinkSelect("Elastic")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Elastic
            </button>
            , and{" "}
            <button
              onClick={() => handleInlineLinkSelect("Splunk")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Splunk
            </button>
            ; data platforms such as{" "}
            <button
              onClick={() => handleInlineLinkSelect("MongoDB")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              MongoDB
            </button>
            ; and execution management systems including{" "}
            <button
              onClick={() => handleInlineLinkSelect("Jira")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Jira
            </button>{" "}
            and{" "}
            <button
              onClick={() => handleInlineLinkSelect("Linear")}
              className="text-[#15140f] border-b border-[#1a4dd8] hover:text-[#1a4dd8] hover:bg-[#1a4dd8]/5 transition-all px-0.5"
            >
              Linear
            </button>
            .
          </p>

          {/* EXPANDABLE DROP-DOWN PANEL GRID */}
          <div className="mt-8">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-3 font-mono text-[13px] tracking-wider uppercase border border-[#e3e0d6] rounded-[3px] py-3.5 px-5 hover:border-[#15140f] transition"
            >
              Browse all connectors
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="mt-3.5 border border-[#e3e0d6] rounded-[4px] max-h-[420px] overflow-y-auto bg-white shadow-2xs animate-wzin">
                {CONNECTORS_DIRECTORY.map((group) => (
                  <div
                    key={group.category}
                    className="border-b border-[#efece4] last:border-none"
                  >
                    <div className="font-mono text-[11px] font-medium tracking-widest uppercase text-[#9d9a8f] bg-[#faf9f6] py-3 px-5 border-b border-[#efece4]">
                      {group.category}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleSelectConnector(item.name)}
                        className="flex items-center justify-between w-full text-left py-3.5 px-5 border-b border-[#efece4] last:border-none hover:bg-[#faf9f6] hover:pl-7 transition-all"
                      >
                        <span className="font-serif text-lg font-medium">
                          {item.name}
                        </span>
                        <span className="text-[13px] text-[#9d9a8f] font-light truncate max-w-[65%]">
                          {item.subtext}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* DETAIL DRAWER SLOT COMPONENT */}
            <div className="mt-6 border-t-2 border-[#15140f] pt-6 min-h-[90px]">
              {!selectedConnector ? (
                <span className="font-serif text-lg text-[#9d9a8f] italic">
                  No connector selected — choose one above to view the signals
                  it contributes to the operational graph.
                </span>
              ) : (
                <div className="animate-wzin">
                  <div className="font-mono text-[11px] font-medium tracking-widest uppercase text-IMSLightGreen mb-2">
                    {selectedConnector.cat}
                  </div>
                  <div className="font-serif text-3xl font-medium">
                    {selectedConnector.name}
                  </div>
                  <div className="text-[#42413a] font-light mt-2.5 max-w-[54ch]">
                    {selectedConnector.sig}
                  </div>
                  <div className="flex gap-6 items-center mt-4 flex-wrap">
                    <span className="inline-flex items-center gap-2 font-mono text-[13px] tracking-wider uppercase text-[#0f7a5a]">
                      <span className="w-1.5 h-1.5 bg-[#0f7a5a] rounded-full" />{" "}
                      Ingestion Active
                    </span>
                    <button
                      onClick={() => useRouter().push("/auth/signin")}
                      className="inline-flex items-center gap-2 text-sm font-medium pb-0.5 border-b border-[#15140f] hover:text-IMSLightGreen hover:border-IMSLightGreen transition"
                    >
                      Connect {selectedConnector.name} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section
        className="w-full relative py-20 px-6"
        style={{ background: "#f0faf0" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="sticky top-28 before:mb-4">
              <SectionLabel>
                The
                <br />
                connected
                <br />
                estate
              </SectionLabel>
            </div>
            <div style={{ maxWidth: 740 }}>
              <SerHead size="xl" className="mb-8">
                Relationships individual systems cannot see in isolation.
              </SerHead>

              <div className="space-y-0">
                {ISOLATION_BULLETS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 py-5 border-b border-[#d1e8d1] last:border-b-0"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#374151] flex-shrink-0" />
                    <p className="text-[#374151] text-[0.9375rem] leading-[1.75]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. THE CONNECTED ESTATE (Foundation) ─────────────────────────── */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="sticky top-28 before:mb-4">
              <SectionLabel>
                The
                <br />
                connected
                <br />
                estate
              </SectionLabel>
            </div>
            <div style={{ maxWidth: 740 }}>
              <SerHead size="xl" className="mb-8">
                This foundation moves Scrubbe beyond traditional monitoring.
              </SerHead>

              <div className="space-y-0">
                {FOUNDATION_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className="py-5 border-b border-[#f3f4f6] last:border-b-0"
                  >
                    <p className="text-[#9ca3af] text-[0.875rem] leading-[1.6] mb-0.5">
                      {row.muted}
                    </p>
                    <p className="text-[#0f0f0e] text-[0.9375rem] font-medium leading-[1.6]">
                      {row.bold}
                      <span style={{ color: "#16a34a" }}>{row.accent}</span>
                      {row.tail && (
                        <span className="text-[#0f0f0e] font-normal">
                          {row.tail}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. COMPOUNDING RETURNS ───────────────────────────────────────── */}
      <section
        className="w-full relative py-20 px-6"
        style={{ background: "#f0faf0" }}
      >
        <MosaicBg />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="sticky top-28 before:mb-4">
              <SectionLabel>Compound­ing Returns</SectionLabel>
            </div>
            <div style={{ maxWidth: 740 }}>
              <SerHead size="xl" className="mb-8">
                As more systems connect, understanding becomes comprehensive.
              </SerHead>

              <div className="space-y-0 mb-10">
                {COMPOUNDING.map((item, i) => (
                  <div
                    key={i}
                    className="py-5 border-b border-[#d1e8d1] last:border-b-0"
                  >
                    <p
                      className="text-[#0f0f0e] leading-tight"
                      style={{
                        fontFamily: "'Georgia','Times New Roman',serif",
                        fontSize: "clamp(1.1rem,2vw,1.375rem)",
                        fontWeight: 400,
                      }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[#6b7280] text-[0.875rem] leading-[1.75]">
                The outcome is not simply better integrations. It is a connected
                operational ecosystem where intelligence flows freely between
                systems — enabling engineering organizations to detect,
                understand, remediate, and learn from incidents with
                unprecedented speed and confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SIGNALS IN. INTELLIGENCE OUT. ─────────────────────────────── */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <h2
              className="text-[#0f0f0e] leading-tight mb-5"
              style={{
                fontFamily: "'Georgia','Times New Roman',serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 400,
              }}
            >
              Signals in. Intelligence out.
            </h2>
            <p
              className="text-[#374151] text-[0.9375rem] leading-[1.75]"
              style={{ maxWidth: 560 }}
            >
              Connectors normalise every signal into one canonical model, build
              the operational graph, and feed every downstream system that
              depends on it.
            </p>
          </div>

          <SignalsDiagram />
        </div>
      </section>

      <SuggestionConnectorSection />

      <CustomConnectorWorkbench />

      {/* ── 11. CTA ──────────────────────────────────────────────────────── */}
      <section
        className="w-full relative py-24 px-6 overflow-hidden"
        style={{ background: "#050f08" }}
      >
        {/* Ambient green streaks */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 55% 80% at 62% 45%, rgba(22,163,74,0.20) 0%, transparent 68%),
              radial-gradient(ellipse 28% 55% at 52% 25%, rgba(22,163,74,0.13) 0%, transparent 60%)
            `,
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <h2
              className="text-white leading-tight"
              style={{
                fontFamily: "'Georgia','Times New Roman',serif",
                fontSize: "clamp(2rem,4vw,3.25rem)",
                fontWeight: 700,
              }}
            >
              A connected operational ecosystem.
            </h2>

            <div>
              <p className="text-[#9ca3af] text-[0.9375rem] leading-[1.75] mb-8">
                Connect your systems, map your own, and let intelligence flow
                freely across detection, investigation, remediation, and
                learning.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  className="px-7 py-3.5 rounded-md font-semibold text-white text-[0.9375rem] hover:opacity-90 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg,#16a34a 0%,#86efac 100%)",
                  }}
                >
                  Connect a System
                </button>
                <button className="px-7 py-3.5 rounded-md border border-white text-white font-medium text-[0.9375rem] hover:bg-white/10 transition-colors">
                  View Integration Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
