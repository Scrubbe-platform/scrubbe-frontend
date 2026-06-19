"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CodeTab = "Config" | "TypeScript" | "Python" | "CURL" | "Go";
type AITab = "ChatGPT" | "Claude" | "Cursor" | "VS Code" | "Windsurf";

// ─── Constants ────────────────────────────────────────────────────────────────

const CODE_SNIPPETS: Record<CodeTab, string> = {
  Config: `{
  "mcpServers": {
    "scrubbe": {
      "command": "npx",
      "args": ["@scrubbe/mcp-server"],
      "env": { "SCRUBBE_API_KEY": "sk_live_xxxxxxxx" }
    }
  }
}`,
  TypeScript: `import { ScrubbeMCP } from "@scrubbe/sdk";

const mcp = new ScrubbeMCP({
  apiKey: process.env.SCRUBBE_API_KEY,
});

const result = await mcp.query(
  "What caused incident SI-1045937?"
);`,
  Python: `from scrubbe import ScrubbeMCP

mcp = ScrubbeMCP(api_key=os.environ["SCRUBBE_API_KEY"])

result = mcp.query(
    "What caused incident SI-1045937?"
)

print(result.answer, result.confidence)`,
  CURL: `curl -X POST https://mcp.scrubbe.io/query \\
  -H "Authorization: Bearer sk_live_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What caused incident SI-1045937?"}'`,
  Go: `client := scrubbe.NewClient(os.Getenv("SCRUBBE_API_KEY"))

result, err := client.Query(ctx,
  "What caused incident SI-1045937?",
)
if err != nil {
  log.Fatal(err)
}`,
};

const AI_DEMOS: Record<AITab, { label: string; question: string }> = {
  ChatGPT: {
    label: "ChatGPT → Scrubbe",
    question: "What caused incident SI-1045937?",
  },
  Claude: {
    label: "Claude → Scrubbe",
    question: "What caused incident SI-1045937?",
  },
  Cursor: {
    label: "Cursor → Scrubbe",
    question: "What caused incident SI-1045937?",
  },
  "VS Code": {
    label: "VS Code → Scrubbe",
    question: "What caused incident SI-1045937?",
  },
  Windsurf: {
    label: "Windsurf → Scrubbe",
    question: "What caused incident SI-1045937?",
  },
};

const ACCESS_DOMAINS = [
  {
    domain: "Incidents",
    context:
      "Active and historical incidents, timelines, and correlated signals",
  },
  {
    domain: "Services",
    context: "Service ownership, dependencies, and health",
  },
  {
    domain: "Deployments",
    context: "Release history and rollout status across environments",
  },
  {
    domain: "Infrastructure",
    context: "Clusters, hosts, and cloud resources",
  },
  {
    domain: "Handover",
    context: "Shift intelligence and unresolved work in flight",
  },
  {
    domain: "Policies",
    context: "Governance and execution controls",
  },
  {
    domain: "Risks",
    context: "Service risk assessments and trend scoring",
  },
  {
    domain: "Remediation",
    context: "Historical fixes, actions taken, and outcomes",
  },
];

const GOVERNANCE_RULES = [
  { letter: "a", bold: "Which users", rest: "can access which systems" },
  { letter: "b", bold: "Which assistants", rest: "can invoke which actions" },
  { letter: "c", bold: "Which environments", rest: "are reachable at all" },
  {
    letter: "d",
    bold: "Which remediation actions",
    rest: "require human approval",
  },
  { letter: "e", bold: "What data", rest: "is ever exposed to a model" },
];

const WHY_REASONS = [
  {
    num: "01",
    title: "Reduce investigation time.",
    body: "Engineers stop switching across eight tools and ask one question instead. Time-to-understanding during an incident drops from hours to minutes.",
  },
  {
    num: "02",
    title: "Bring operational context into every AI workflow.",
    body: "The same governed context powers triage in Claude, code review in Cursor, and incident response in your internal copilot — without rebuilding integrations for each.",
  },
  {
    num: "03",
    title: "Maintain governance while adopting AI.",
    body: "Extend AI across operations without surrendering the access controls, audit trails, and policy boundaries your enterprise already depends on.",
  },
];

const AI_CLIENTS = ["ChatGPT", "Claude", "Cursor", "VS Code", "Windsurf"];
const ENTERPRISE_SYSTEMS = [
  "Incidents",
  "Deployments",
  "Infrastructure",
  "Code",
  "Policies",
  "Handover",
  "Risks",
];

// ─── Mosaic background (grid of pale-green squares) ──────────────────────────

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

// ─── Section label (italic serif, left column) ───────────────────────────────

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

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="text-[11px] text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Gateway Diagram SVG ─────────────────────────────────────────────────────

function GatewayDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 900 340"
        className="w-full max-w-4xl mx-auto"
        style={{ minWidth: 600 }}
        aria-label="Architecture diagram showing AI clients connecting through Scrubbe MCP gateway to enterprise systems"
      >
        {/* Column labels */}
        <text
          x="80"
          y="24"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          AI CLIENTS
        </text>
        <text
          x="370"
          y="24"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          GATEWAY
        </text>
        <text
          x="590"
          y="24"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          INTELLIGENCE LAYER
        </text>
        <text
          x="820"
          y="24"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          ENTERPRISE
        </text>

        {/* AI Client dots + labels */}
        {AI_CLIENTS.map((client, i) => {
          const y = 80 + i * 44;
          return (
            <g key={client}>
              <text
                x="48"
                y={y + 4}
                fill="#374151"
                fontSize="13"
                fontFamily="system-ui, sans-serif"
                textAnchor="end"
              >
                {client}
              </text>
              <circle cx="60" cy={y} r="4" fill="#3b82f6" />
              {/* Curved line to MCP box */}
              <path
                d={`M64,${y} C180,${y} 230,168 310,168`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.4"
                opacity="0.75"
              />
            </g>
          );
        })}

        {/* Scrubbe MCP box */}
        <rect
          x="310"
          y="136"
          width="130"
          height="65"
          rx="6"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.5"
        />
        <text
          x="375"
          y="163"
          fill="#111827"
          fontSize="13"
          fontWeight="600"
          fontFamily="system-ui"
          textAnchor="middle"
        >
          Scrubbe MCP
        </text>
        <text
          x="375"
          y="179"
          fill="#6b7280"
          fontSize="9"
          fontFamily="monospace"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          AUTH · ROUTING · RBAC
        </text>

        {/* Arrow from MCP to Intelligence Layer */}
        <line
          x1="440"
          y1="168"
          x2="490"
          y2="168"
          stroke="#6b7280"
          strokeWidth="1.5"
          markerEnd="url(#arrow)"
        />

        {/* Intelligence Layer box */}
        <rect
          x="490"
          y="136"
          width="150"
          height="65"
          rx="6"
          fill="none"
          stroke="#374151"
          strokeWidth="1.5"
        />
        <text
          x="565"
          y="160"
          fill="#111827"
          fontSize="13"
          fontWeight="600"
          fontFamily="system-ui"
          textAnchor="middle"
        >
          Operational
        </text>
        <text
          x="565"
          y="176"
          fill="#111827"
          fontSize="13"
          fontWeight="600"
          fontFamily="system-ui"
          textAnchor="middle"
        >
          Intelligence Layer
        </text>
        <text
          x="565"
          y="192"
          fill="#6b7280"
          fontSize="8.5"
          fontFamily="monospace"
          letterSpacing="1"
          textAnchor="middle"
        >
          CORRELATION · CONTEXT GRAPH
        </text>

        {/* Fan lines from Intelligence Layer to enterprise */}
        {ENTERPRISE_SYSTEMS.map((sys, i) => {
          const totalSys = ENTERPRISE_SYSTEMS.length;
          const y = 50 + i * (280 / (totalSys - 1));
          return (
            <g key={sys}>
              <path
                d={`M640,168 C720,168 740,${y} 780,${y}`}
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.2"
              />
              <text
                x="790"
                y={y + 4}
                fill="#374151"
                fontSize="12.5"
                fontFamily="system-ui"
              >
                {sys}
              </text>
            </g>
          );
        })}

        {/* Governance in path box */}
        <rect
          x="310"
          y="220"
          width="330"
          height="56"
          rx="4"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1"
          strokeDasharray="5,3"
        />
        <text
          x="475"
          y="244"
          fill="#1d4ed8"
          fontSize="9.5"
          fontFamily="monospace"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          GOVERNANCE IN PATH
        </text>
        <text
          x="475"
          y="260"
          fill="#6b7280"
          fontSize="8.5"
          fontFamily="monospace"
          letterSpacing="1"
          textAnchor="middle"
        >
          POLICY ENFORCEMENT · APPROVAL GATES · AUDIT LOG
        </text>

        {/* Vertical connectors from boxes to governance */}
        <line
          x1="375"
          y1="201"
          x2="375"
          y2="220"
          stroke="#d1d5db"
          strokeWidth="1"
          strokeDasharray="3,2"
        />
        <line
          x1="565"
          y1="201"
          x2="565"
          y2="220"
          stroke="#d1d5db"
          strokeWidth="1"
          strokeDasharray="3,2"
        />

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScrubbeMCPPage() {
  const [codeTab, setCodeTab] = useState<CodeTab>("Config");
  const [aiTab, setAiTab] = useState<AITab>("Claude");

  return (
    <main
      className="w-full text-[#111827] antialiased overflow-x-hidden"
      style={{ fontFamily: "'Inter', 'Geist', system-ui, sans-serif" }}
    >
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="w-full bg-white pt-20 pb-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <h1
            className="text-[#0f0f0e] leading-[1.05] tracking-tight mb-6"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(2.6rem, 5vw, 4rem)",
              fontWeight: 400,
              maxWidth: 640,
            }}
          >
            Bring operational intelligence into the tools your engineers{" "}
            <em
              className="not-italic"
              style={{ color: "#16a34a", fontStyle: "italic" }}
            >
              already use.
            </em>
          </h1>

          <p
            className="text-[#4b5563] text-[1.0625rem] leading-relaxed mb-4"
            style={{ maxWidth: 560 }}
          >
            Query incidents, deployments, infrastructure, services, handovers,
            policies, risks, and remediation actions directly from your
            preferred AI assistant.
          </p>
          <p
            className="text-[#4b5563] text-[1.0625rem] leading-relaxed mb-10"
            style={{ maxWidth: 560 }}
          >
            Whether your teams work in ChatGPT, Claude, Cursor, VS Code,
            Windsurf, or an internal copilot, Scrubbe MCP provides governed
            access to operational context across the enterprise.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              className="px-6 py-3 rounded-md text-white font-medium text-[0.9375rem] transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0f2d1e 0%, #16a34a 100%)",
              }}
            >
              Connect MCP
            </button>
            <button className="px-6 py-3 rounded-md border border-[#16a34a] text-[#16a34a] font-medium text-[0.9375rem] bg-white hover:bg-[#f0fdf4] transition-colors">
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. THE PROBLEM ───────────────────────────────────────────────── */}
      <section
        className="w-full relative py-20 px-6"
        style={{ background: "#f0faf0" }}
      >
        <MosaicBg />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="pt-1">
              <SectionLabel>The problem</SectionLabel>
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
                Operational knowledge is{" "}
                <em style={{ color: "#16a34a", fontStyle: "italic" }}>
                  trapped
                </em>{" "}
                inside disconnected systems.
              </h2>

              <div
                className="space-y-5 text-[#374151] text-[0.9375rem] leading-[1.7]"
                style={{ maxWidth: 680 }}
              >
                <p>
                  An engineer investigating a deployment failure may need
                  information from GitHub, Kubernetes, Azure DevOps, Datadog,
                  ServiceNow, Terraform, incident records, prior handovers, and
                  internal documentation — each behind its own interface,
                  permission model, and query language.
                </p>
                <p>
                  The cost is not only time. Context that lives in eight systems
                  is context that no single engineer, and no single model, ever
                  sees in full. Decisions get made on fragments.
                </p>
                <p>
                  AI assistants can only reason over the context they receive.
                  Without access to operational context, even the most capable
                  model is forced to operate on incomplete information —{" "}
                  <strong className="text-[#0f0f0e] font-semibold">
                    confidently, and often incorrectly.
                  </strong>
                </p>
                <p>
                  Scrubbe MCP closes that gap by securely exposing governed
                  operational context to the AI systems your teams already use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHAT SCRUBBE DOES ─────────────────────────────────────────── */}
      <section className="w-full relative py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="pt-1">
              <SectionLabel>
                What
                <br />
                Scrubbe Does
              </SectionLabel>
            </div>
            <div>
              <h2
                className="text-[#0f0f0e] leading-tight mb-6"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                A secure intelligence layer between systems and AI.
              </h2>

              <p
                className="text-[#374151] text-[0.9375rem] leading-[1.7] mb-5"
                style={{ maxWidth: 660 }}
              >
                Scrubbe MCP sits between your enterprise systems and your AI
                assistants and governs everything that passes through.
              </p>
              <p
                className="text-[#374151] text-[0.9375rem] leading-[1.7] mb-5"
                style={{ maxWidth: 660 }}
              >
                Rather than wiring AI directly into dozens of systems — each
                integration a new attack surface and a new thing to maintain —
                Scrubbe continuously builds and maintains a single, current
                understanding of your environment:
              </p>
              <p
                className="text-[#0f0f0e] font-semibold text-[0.9375rem] mb-8"
                style={{ maxWidth: 660 }}
              >
                services · incidents · deployments · infrastructure ·
                dependencies · risks · handovers · remediation history.
              </p>

              {/* Flow indicator */}
              <div className="flex items-center gap-0 border-b border-[#e5e7eb] mb-6 overflow-x-auto pb-0">
                {[
                  { label: "AI assistant", muted: false },
                  { label: "→ asks", muted: true, italic: false },
                  { label: "Scrubbe MCP", accent: true },
                  { label: "→ resolves", muted: true },
                  { label: "Enterprise systems", muted: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 text-[0.875rem] whitespace-nowrap border-b-2 ${
                      item.accent
                        ? "border-[#16a34a] text-[#16a34a] font-medium"
                        : "border-transparent"
                    } ${item.muted ? "text-[#9ca3af]" : "text-[#374151]"}`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              <p
                className="text-[#374151] text-[0.9375rem] leading-[1.7]"
                style={{ maxWidth: 660 }}
              >
                The result is one consistent operational understanding that
                behaves identically across every AI surface — so an answer in
                Claude is the same answer in Cursor, governed by the same policy
                and written to the same audit log.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ASK FROM ANY AI ───────────────────────────────────────────── */}
      <section
        className="w-full relative py-20 px-6"
        style={{ background: "#f0faf0" }}
      >
        <MosaicBg />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="pt-1">
              <SectionLabel>
                Ask from Any
                <br />
                AI
              </SectionLabel>
            </div>
            <div>
              <h2
                className="text-[#0f0f0e] leading-tight mb-5"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                Operational questions, answered in plain language.
              </h2>

              <p
                className="text-[#374151] text-[0.9375rem] leading-[1.7] mb-8"
                style={{ maxWidth: 660 }}
              >
                The interface is a question. Ask naturally; Scrubbe resolves the
                systems, correlates the signals, and returns an answer with its
                reasoning and confidence.
              </p>

              {/* AI tabs */}
              <div className="flex items-center gap-0 border-b border-[#e5e7eb] mb-0 overflow-x-auto">
                {(Object.keys(AI_DEMOS) as AITab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAiTab(tab)}
                    className={`px-5 py-3 text-[0.875rem] whitespace-nowrap border-b-2 transition-colors ${
                      aiTab === tab
                        ? "border-[#16a34a] text-[#0f0f0e] font-medium"
                        : "border-transparent text-[#6b7280] hover:text-[#374151]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Demo card */}
              <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden mt-0">
                {/* Label bar */}
                <div className="px-5 py-3 border-b border-[#f3f4f6]">
                  <span
                    className="text-[11px] tracking-widest"
                    style={{ color: "#16a34a", fontFamily: "monospace" }}
                  >
                    {AI_DEMOS[aiTab].label}
                  </span>
                </div>

                {/* Question */}
                <div className="px-5 pt-4 pb-3">
                  <p className="text-[#0f0f0e] font-semibold text-[1.0625rem]">
                    {AI_DEMOS[aiTab].question}
                  </p>
                </div>

                {/* Answer */}
                <div className="px-5 pb-2">
                  <div className="border-l-2 border-[#e5e7eb] pl-4 py-1">
                    <p className="text-[0.9375rem] text-[#111827] leading-relaxed mb-3">
                      Incident <strong>SI-1045937</strong> was triggered by a
                      failed deployment to the <strong>payments-api</strong>{" "}
                      service.
                    </p>

                    <p
                      className="text-[11px] text-[#9ca3af] mb-2"
                      style={{ fontFamily: "monospace" }}
                    >
                      Detected
                    </p>
                    <ul className="space-y-1 mb-4">
                      {[
                        "Kubernetes rollout failure",
                        "Readiness probe failures",
                        "Error rate increased from 0.2% to 18%",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[0.875rem] text-[#374151]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {[
                      {
                        label: "Likely root cause",
                        value:
                          "Configuration mismatch introduced in deployment ",
                        code: "81f2c4d",
                      },
                      { label: "Confidence", value: "94%", code: null },
                      {
                        label: "Remediation",
                        value: "Rollback deployment to build ",
                        code: "2.13.7",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start gap-4 py-2 border-t border-[#f3f4f6] text-[0.875rem]"
                      >
                        <span
                          className="text-[#9ca3af] w-36 flex-shrink-0"
                          style={{ fontFamily: "monospace", fontSize: "11px" }}
                        >
                          {row.label}
                        </span>
                        <span className="text-[#0f0f0e] font-medium">
                          {row.value}
                          {row.code && (
                            <code
                              className="text-[#0f0f0e]"
                              style={{
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                            >
                              {row.code}
                            </code>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Try links */}
                <div className="px-5 py-4 border-t border-[#f3f4f6] flex flex-wrap gap-4 items-center">
                  <span className="text-[0.8125rem] text-[#9ca3af]">Try:</span>
                  {[
                    "What caused incident SI-1045937?",
                    "Which services are currently at risk?",
                  ].map((q) => (
                    <button
                      key={q}
                      className="text-[0.8125rem] text-[#16a34a] hover:underline"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHAT YOUR AI CAN ACCESS ───────────────────────────────────── */}
      <section className="w-full relative py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="pt-1">
              <SectionLabel>
                What your
                <br />
                AI can access
              </SectionLabel>
            </div>
            <div>
              <h2
                className="text-[#0f0f0e] leading-tight mb-5"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                Access scoped by domain.
              </h2>

              <p
                className="text-[#374151] text-[0.9375rem] leading-[1.7] mb-8"
                style={{ maxWidth: 660 }}
              >
                Each domain maps to governed context that Scrubbe maintains and
                exposes only to authorized users and assistants. Nothing outside
                this surface is reachable.
              </p>

              {/* Domain table */}
              <div
                className="border border-[#e5e7eb] rounded-lg overflow-hidden"
                style={{ maxWidth: 680 }}
              >
                {/* Header */}
                <div className="grid grid-cols-[1fr_1.6fr] border-b border-[#e5e7eb] bg-white">
                  <div
                    className="px-5 py-3 text-[#9ca3af] text-[11px] tracking-widest"
                    style={{ fontFamily: "monospace" }}
                  >
                    Domain
                  </div>
                  <div
                    className="px-5 py-3 text-[#9ca3af] text-[11px] tracking-widest"
                    style={{ fontFamily: "monospace" }}
                  >
                    Available context
                  </div>
                </div>

                {ACCESS_DOMAINS.map((row, i) => (
                  <div
                    key={row.domain}
                    className={`grid grid-cols-[1fr_1.6fr] border-b border-[#f3f4f6] last:border-b-0 ${
                      i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    }`}
                  >
                    <div className="px-5 py-4 text-[0.9375rem] font-medium text-[#0f0f0e]">
                      {row.domain}
                    </div>
                    <div className="px-5 py-4 text-[0.875rem] text-[#6b7280] leading-snug">
                      {row.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. GOVERNED BY POLICY ────────────────────────────────────────── */}
      <section className="w-full py-20 px-6 bg-white border-t border-[#f3f4f6]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="pt-1">
              <SectionLabel>
                Governed
                <br />
                by policy
              </SectionLabel>
            </div>
            <div style={{ maxWidth: 680 }}>
              <h2
                className="text-[#0f0f0e] leading-tight mb-6"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                Scrubbe MCP does not give AI unrestricted access to production.
              </h2>

              <p className="text-[#374151] text-[0.9375rem] leading-[1.7] mb-8">
                Every request passes through policy enforcement before it ever
                reaches a system of record. Governance lives in the path of the
                request, not beside it. Administrators define, centrally:
              </p>

              <div className="space-y-0">
                {GOVERNANCE_RULES.map((rule, i) => (
                  <div
                    key={rule.letter}
                    className="flex items-start gap-5 py-4 border-b border-[#f3f4f6] last:border-b-0"
                  >
                    <span
                      className="text-[#16a34a] text-[0.8125rem] w-5 flex-shrink-0 pt-0.5"
                      style={{ fontFamily: "monospace" }}
                    >
                      {rule.letter}.
                    </span>
                    <p className="text-[0.9375rem] text-[#374151]">
                      <strong className="text-[#0f0f0e] font-semibold">
                        {rule.bold}
                      </strong>{" "}
                      {rule.rest}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[#374151] text-[0.9375rem] leading-[1.7] mt-8">
                Every interaction is logged, attributable, and auditable — the
                same controls you already run your enterprise on, extended
                cleanly to AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CONNECT IN MINUTES ────────────────────────────────────────── */}
      <section
        className="w-full relative py-20 px-6"
        style={{ background: "#f0faf0" }}
      >
        <MosaicBg />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-20">
            <div className="pt-1">
              <SectionLabel>
                Connect in
                <br />
                minutes
              </SectionLabel>
            </div>
            <div style={{ maxWidth: 720 }}>
              <h2
                className="text-[#0f0f0e] leading-tight mb-5"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                One server. Any client. Any language.
              </h2>

              <p className="text-[#374151] text-[0.9375rem] leading-[1.7] mb-7">
                Register the Scrubbe MCP server in your assistant, or call the
                gateway directly from your own services.
              </p>

              {/* Code tabs */}
              <div className="flex items-center gap-0 border-b border-[#d1fae5] overflow-x-auto">
                {(Object.keys(CODE_SNIPPETS) as CodeTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodeTab(tab)}
                    className={`px-5 py-3 text-[0.875rem] whitespace-nowrap border-b-2 transition-colors ${
                      codeTab === tab
                        ? "border-[#16a34a] text-[#0f0f0e] font-medium"
                        : "border-transparent text-[#6b7280] hover:text-[#374151]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Code block */}
              <div className="relative bg-[#0f0f0e] rounded-b-lg rounded-tr-lg overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <CopyButton text={CODE_SNIPPETS[codeTab]} />
                </div>
                <pre
                  className="p-6 text-[0.8125rem] leading-[1.7] overflow-x-auto"
                  style={{ fontFamily: "monospace", color: "#e2e8f0" }}
                >
                  <code>{CODE_SNIPPETS[codeTab]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. ONE GATEWAY ───────────────────────────────────────────────── */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-14">
            <div>
              <h2
                className="text-[#0f0f0e] leading-tight mb-5"
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)",
                  fontWeight: 400,
                }}
              >
                One gateway in the path of every request.
              </h2>
              <p
                className="text-[#374151] text-[0.9375rem] leading-[1.7]"
                style={{ maxWidth: 440 }}
              >
                Clients never touch systems of record directly. Every query is
                authenticated, authorized, policy-checked, and logged as it
                flows through the intelligence layer.
              </p>
            </div>
          </div>

          <GatewayDiagram />
        </div>
      </section>

      {/* ── 9. WHY ORGANIZATIONS ADOPT ───────────────────────────────────── */}
      <section
        className="w-full relative py-20 px-6"
        style={{ background: "#f0faf0" }}
      >
        <MosaicBg />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <h2
            className="text-[#0f0f0e] mb-14"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 400,
            }}
          >
            Why Organizations adopt Scrubbe
          </h2>

          <div className="space-y-0">
            {WHY_REASONS.map((item) => (
              <div
                key={item.num}
                className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-16 py-10 border-b border-[#d1e8d1] last:border-b-0"
              >
                <div
                  className="text-[2.5rem] font-light text-[#c8dcc8]"
                  style={{ fontFamily: "monospace", lineHeight: 1 }}
                >
                  {item.num}
                </div>
                <div style={{ maxWidth: 640 }}>
                  <h3
                    className="text-[#0f0f0e] mb-4"
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)",
                      fontWeight: 400,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#374151] text-[0.9375rem] leading-[1.75]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. CTA ──────────────────────────────────────────────────────── */}
      <section
        className="w-full relative py-24 px-6 overflow-hidden"
        style={{ background: "#050f08" }}
      >
        {/* Ambient green light streaks */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background: `
              radial-gradient(ellipse 60% 80% at 65% 50%, rgba(22,163,74,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 30% 60% at 55% 30%, rgba(22,163,74,0.12) 0%, transparent 60%)
            `,
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <h2
              className="text-white leading-tight"
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
              }}
            >
              Start using Scrubbe MCP.
            </h2>

            <div>
              <p className="text-[#9ca3af] text-[0.9375rem] leading-[1.7] mb-8">
                Connect your preferred AI assistant and begin querying
                operational intelligence from across your enterprise — governed,
                audited, and consistent on every surface.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  className="px-7 py-3.5 rounded-md font-medium text-white text-[0.9375rem] transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #86efac 100%)",
                  }}
                >
                  Get Started
                </button>
                <button className="px-7 py-3.5 rounded-md border border-white text-white font-medium text-[0.9375rem] hover:bg-white/10 transition-colors">
                  Read Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
