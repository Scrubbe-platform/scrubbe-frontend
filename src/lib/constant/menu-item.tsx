import Product from "@/components/IMS/Home/Nav/Product";
import Usecase from "@/components/IMS/Home/Nav/Usecase";
import { BookOpen, Grid, Key, Lock, Play } from "lucide-react";
import { ReactNode } from "react";
import { IconType } from "react-icons";
import { BiSupport } from "react-icons/bi";
import { CiWarning } from "react-icons/ci";
import { FaChartLine } from "react-icons/fa";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import { IoMdTrendingUp } from "react-icons/io";
import { IoDocumentTextOutline, IoFilter } from "react-icons/io5";
import { LuComponent, LuDraftingCompass } from "react-icons/lu";
import { MdOutlineShield } from "react-icons/md";
import { RxFilter } from "react-icons/rx";
import { SlGrid } from "react-icons/sl";
import { TbBolt } from "react-icons/tb";

type MenuItem = {
  label: string;
  href?: string;
  dropdownOptions?: MenuOption[];
};

export type MenuOption = {
  id: string;
  label: string;
  Icon: IconType;
  href: string;
  description: string;
  hrefLabel: string;
  subText: string;
  tags: string[];
  analytics: {
    value: string;
    label: string;
    color?: string;
  }[];
  subSection: {
    isCode: boolean;
    code?: string;
    tags: string[];
    subTags: string[];
    title: string;
  };
  rightComponent?: ReactNode;
};

export const menuItems: MenuItem[] = [
  {
    label: "Product",
    dropdownOptions: [
      {
        id: "product",
        label: "Overview",
        Icon: SlGrid,
        href: "#",
        hrefLabel: "View Product Overview",
        description:
          "The Governed Multi-Agent Platform for Engineering Incidents",
        subText:
          "Scrubbe is a centralised orchestration platform that coordinates AI agents through the full incident lifecycle — from detection to resolution — under a strict policy and approval framework.",
        tags: [
          "Orchestrator",
          "Policy Engine",
          "Execution Gate",
          "Audit Trail",
        ],
        analytics: [
          { value: "<800ms", label: "Agent dispatch", color: "text-blue-400" },
          {
            value: "100%",
            label: "Actions audited",
            color: "text-emerald-400",
          },
          { value: "0", label: "Ungated executions", color: undefined },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "Detected",
            "Triaging",
            "Awaiting Approval",
            "Remediating",
            "Resolved",
          ],
          subTags: [],
          title: "Incident Lifecycle",
        },
        rightComponent: <Product />,
      },
      {
        id: "product",
        label: "Architecture",
        Icon: LuDraftingCompass,
        href: "#",
        description: "System Architecture",
        hrefLabel: "Explore Architecture",
        subText:
          "A stateless, horizontally scalable orchestrator sits at the centre. Agents connect over WebSockets. Every action flows through the gate before touching infrastructure.",
        tags: [
          "Stateless Orchestrator",
          "WebSockets",
          "REST + Events",
          "JWT Auth",
        ],
        analytics: [
          { value: "Stateless", label: "Orchestrator", color: "text-blue-400" },
          { value: "HA", label: "Event bus", color: undefined },
          { value: "Replay", label: "On reconnect", color: "text-emerald-400" },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "API Gateway",
            "Orchestrator",
            "Execution Gate",
            "Agent Runtime",
            "Audit Store",
          ],
          subTags: ["REST/WS", "Core", "Safety", "Workers", "Append-only"],
          title: "Incident Lifecycle",
        },
        rightComponent: <Product />,
      },
      {
        id: "product",
        label: "Core Capabilities",
        Icon: FaChartLine,
        href: "#",
        description: "Core Capabilities",
        hrefLabel: "View Core Capabilities",
        subText:
          "From the risk-classified execution gate to immutable audit events, every capability in Scrubbe is designed around the principle that AI must act within defined bounds — and prove it.",
        tags: [
          "Risk Classification",
          "Dry-run",
          "Approval Queue",
          "Policy Eval",
        ],
        analytics: [
          { value: "3", label: "Risk tiers", color: "text-orange-400" },
          { value: "<5ms", label: "Policy eval time", color: undefined },
          {
            value: "Immutable",
            label: "Audit events",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: true,
          code: `switch (risk.tier) { 
case 'low':
  autoApprove(); 
  break; 
case 'medium': 
  requestHuman(); 
  break; 
case 'high': 
  hardBlock(); }`,
          tags: [],
          subTags: [],
          title: "Gate Decision",
        },
        rightComponent: <Product />,
      },
      {
        id: "product",
        label: "Platform Components",
        Icon: LuComponent,
        href: "#",
        description: "Platform Components",
        hrefLabel: "Explore Components",
        subText:
          "Each component — Orchestrator, Agent Runtime, Execution Gate, Policy Engine, Audit Trail, Playbooks — is a first-class entity in the domain model, not a configuration flag.",
        tags: ["Orchestrator", "Agent Runtime", "Policy Engine", "Playbooks"],
        analytics: [
          { value: "6", label: "Core components", color: undefined },
          { value: "12", label: "Domain entities", color: "text-blue-400" },
          {
            value: "Versioned",
            label: "All policies",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "Incident",
            "AgentRun",
            "Policy Decision",
            "Approval",
            "AuditEvent",
          ],
          subTags: [],
          title: "Domain Model",
        },
        rightComponent: <Product />,
      },

      {
        id: "product",
        label: "Integrations",
        Icon: TbBolt,
        href: "#",
        description: "Integrations",
        hrefLabel: "View Integration",
        subText:
          "Connect your existing observability stack, alerting tools, and communication platforms. Scrubbe sits between your signals and your infrastructure — not replacing your tools, governing what they do.",
        tags: ["PagerDuty", "Datadog", "Slack", "Jira", "Notion"],
        analytics: [
          { value: "12+", label: "Integrations", color: "text-blue-400" },
          { value: "REST", label: "Webhook ingest", color: undefined },
          {
            value: "SDK",
            label: "Custom agents",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["PagerDuty", "Datadog", "Slack", "Jira", "Custom via SDK"],
          subTags: [],
          title: "Domain Model",
        },
        rightComponent: <Product />,
      },
    ],
  },
  {
    label: "Use Cases",
    dropdownOptions: [
      {
        id: "use case",
        label: "Incident Management",
        Icon: CiWarning,
        href: "#",
        description: "Incident Management",
        hrefLabel: "Explore Incident Management",
        subText:
          "From first alert to resolved ticket, Scrubbe orchestrates diagnosis, approval-gated remediation, stakeholder comms, and postmortem generation — across any stack, within your policy boundaries.",
        tags: [
          "Auto-triage",
          "On-call escalation",
          "Postmortem",
          "1-click approval",
        ],
        analytics: [
          { value: "<90s", label: "To first Finding", color: "text-blue-400" },
          { value: "−68%", label: "MTTR reduction", color: "text-emerald-400" },
          {
            value: "−2.5hr",
            label: "Per postmortem",
            color: undefined,
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["Alert fires", "Diagnostic Agent", "Gate routes", "Resolved"],
          subTags: [],
          title: "Response Flow",
        },
        rightComponent: <Usecase />,
      },

      {
        id: "use case",
        label: "DevOps Automation",
        Icon: IoMdTrendingUp,
        href: "#",
        description: "DevOps Automation",
        hrefLabel: "Explore DevOps Automation",
        subText:
          "Integrate Scrubbe into your CI/CD and deployment pipelines. Agents detect deployment-induced incidents, propose rollbacks, and gate execution until the right approval is confirmed.",
        tags: ["Deployment rollback", "Pipeline gating", "Change approval"],
        analytics: [
          {
            value: "Policy-gated",
            label: "Every rollback",
            color: "text-blue-400",
          },
          { value: "Dry-run", label: "Before execution", color: undefined },
          {
            value: "JWT",
            label: "Identity on all ops",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "Deploy event",
            "Anomaly detected",
            "Rollback proposed",
            "Approved & applied",
          ],
          subTags: [],
          title: "Deployment Gate",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "use case",
        label: "Reliability Engineering",
        Icon: MdOutlineShield,
        href: "#",
        description: "Reliability Engineering",
        hrefLabel: "Explore Reliability Engineering",
        subText:
          "Give SRE teams AI agents that know the difference between a blip and a cascade. Scrubbe correlates signals across services, generates structured Findings, and tracks SLO impact in every incident record.",
        tags: ["Deployment rollback", "Pipeline gating", "Change approval"],
        analytics: [
          {
            value: "SLO tracking",
            label: "Every Incident",
            color: "text-blue-400",
          },
          {
            value: "Multi-service",
            label: "Signal correlation",
            color: undefined,
          },
          {
            value: "99.99%",
            label: "Platform uptime SLA",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "Signal ingestion",
            "Cross-service correlation",
            "SLO impact scored",
            "Finding generated",
          ],
          subTags: [],
          title: "SRE Workflow",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "use case",
        label: "Governance & Risk",
        Icon: RxFilter,
        href: "#",
        description: "Governance & Risk",
        hrefLabel: "Explore Governance & Risk",
        subText:
          "For teams in regulated industries or with strict change control requirements. Every agent action is policy-bound, identity-linked, and exportable. Scrubbe makes AI automation auditable by design.",
        tags: ["SOC 2", "RBAC", "SIEM export", "Dual approval"],
        analytics: [
          {
            value: "SOC 2",
            label: "Audit-ready trail",
            color: "text-red-400",
          },
          {
            value: "Multi-party",
            label: "Approval chains",
            color: undefined,
          },
          {
            value: "SIEM",
            label: "Export compatible",
            color: "text-orange-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["SOC 2 Type II", "GDPR / DPA", "ISO 27001", "Dual approval"],
          subTags: [],
          title: "Compliance Status",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "use case",
        label: "AI Operations",
        Icon: RxFilter,
        href: "#",
        description: "AI Operations",
        hrefLabel: "Explore AI Operations",
        subText:
          "Run AI-powered operations at enterprise scale without losing control. Scrubbe's policy engine constrains what AI agents can propose and execute — so you get the speed of automation with the safety of governance.",
        tags: ["Agent orchestration", "Policy constraints", "Custom agents"],
        analytics: [
          {
            value: "Governed",
            label: "Every AI action",
            color: "text-blue-400",
          },
          {
            value: "Extensible",
            label: "Agent SDK",
            color: undefined,
          },
          {
            value: "98.4%",
            label: "Proposal acceptance",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "DiagnosticAgent",
            "RemediationAgent",
            "CommsAgent",
            "Custom Agent",
          ],
          subTags: [],
          title: "Agent Authority Model",
        },
        rightComponent: <Usecase />,
      },
    ],
  },
  {
    label: "Enterprise",
    dropdownOptions: [
      {
        id: "enterprise",
        label: "Security & Identity",
        Icon: Key,
        href: "#",
        description: "Security & Identity",
        hrefLabel: "Explore Security & Identity",
        subText:
          "JWT-native authentication ties every action to a verified identity. RBAC controls what each role can trigger, approve, or view. SSO via SAML 2.0 and OIDC for seamless enterprise IdP integration.",
        tags: ["JWT", "RBAC", "SAML 2.0", "OIDC", "Secrets mgmt"],
        analytics: [
          {
            value: "RBAC",
            label: "Role-scoped access",
            color: "text-indigo-400",
          },
          {
            value: "SAML 2.0",
            label: "SSO support",
            color: "text-emerald-400",
          },
          {
            value: "JWT",
            label: "Every audit event",
            color: undefined,
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["Org Admin", "Policy Admin", "Approver", "Viewer"],
          subTags: [],
          title: "Role Hierarchy",
        },
        rightComponent: <Usecase />,
      },

      {
        id: "enterprise",
        label: "Governance",
        Icon: IoFilter,
        href: "#",
        description: "Governance at Scale",
        hrefLabel: "Explore Governance",
        subText:
          "Policies, approvals, and audit trails are the foundation — not afterthoughts. Prove to auditors, regulators, and boards that every AI action was bounded, approved, and recorded.",
        tags: ["Policy versioning", "Multi-party approval", "Audit export"],
        analytics: [
          {
            value: "Versioned",
            label: "Policy history",
            color: "text-orange-400",
          },
          { value: "Multi-party", label: "Approval chains", color: undefined },
          {
            value: "SIEM",
            label: "Export compatible",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: true,
          code: `name: prod-remediation 
env: production 
severity: critical 
approval: 
required: true 
parties: 2 
version: 3
            `,
          tags: [],
          subTags: [],
          title: "Policy Config",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "enterprise",
        label: "Compliance",
        Icon: HiOutlineDocumentCheck,
        href: "#",
        description: "Compliance",
        hrefLabel: "Explore Compliance",
        subText:
          "Scrubbe produces the evidence your compliance programme needs — immutable audit logs, identity-linked decisions, and one-click exports in the formats your auditors expect.",
        tags: ["SOC 2 Type II", "GDPR", "ISO 27001", "SIEM"],
        analytics: [
          {
            value: "SOC 2",
            label: "Audit in progress",
            color: "text-red-400",
          },
          {
            value: "GDPR",
            label: "DPA available",
            color: undefined,
          },
          {
            value: "ISO",
            label: "Q4 2026",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["SOC 2 Type II", "GDPR / DPA", "ISO 27001", "Dual approval"],
          subTags: [],
          title: "Certification Status",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "enterprise",
        label: "Deployment",
        Icon: Lock,
        href: "#",
        description: "Deployment Options",
        hrefLabel: "Explore Deployment",
        subText:
          "Deploy Scrubbe in the topology that fits your security posture — fully managed cloud, hybrid, or self-hosted. Data residency options ensure incident data stays in your chosen region.",
        tags: ["Managed cloud", "Self-hosted", "EU residency", "US residency"],
        analytics: [
          {
            value: "3",
            label: "Deployment modes",
            color: "text-blue-400",
          },
          {
            value: "EU / US",
            label: "Data residency",
            color: undefined,
          },
          {
            value: "99.99%",
            label: "Uptime SLA",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["Managed Cloud", "Hybrid", "Self-hosted"],
          subTags: [],
          title: "Deployment Modes",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "enterprise",
        label: "Support",
        Icon: BiSupport,
        href: "#",
        description: "SLA & Support",
        hrefLabel: "Explore Support",
        subText:
          "Enterprise customers get a named customer engineer, a dedicated Slack channel, and contractual SLAs on platform uptime and response time. We are in the incident with you.",
        tags: ["Named CE", "<1hr P0", "Private Slack", "Custom SLA"],
        analytics: [
          {
            value: "<1hr",
            label: "P0 response",
            color: "text-emerald-400",
          },
          {
            value: "Named CE",
            label: "Dedicated engineer",
            color: undefined,
          },
          {
            value: "99.99%",
            label: "Uptime SLA",
            color: "text-blue-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["P0 Critical", "P1 High", "P2 Normal", "Uptime"],
          subTags: [],
          title: "Response SLAs",
        },
        rightComponent: <Usecase />,
      },
    ],
  },
  {
    label: "Docs",
    dropdownOptions: [
      {
        id: "docs",
        label: "Getting Started",
        Icon: Play,
        href: "#",
        description: "Getting Started",
        hrefLabel: "Explore Getting Started",
        subText:
          "Deploy Scrubbe and run your first governed incident in under 15 minutes. Covers account setup, connecting your alerting source, configuring your first policy, and validating the gate with a dry-run.",
        tags: ["Setup", "First policy", "Dry-run validation"],
        analytics: [
          {
            value: "15 min",
            label: "To first incident",
            color: "text-blue-400",
          },
          {
            value: "4 steps",
            label: "Setup flow",
          },
          {
            value: "Dry-run",
            label: "Default mode",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "1. Connect alert source",
            "2. Define first policy",
            "3. Enable agents",
            "4. Validate with dry-run",
          ],
          subTags: [],
          title: "Setup Steps",
        },
        rightComponent: <Usecase />,
      },

      {
        id: "docs",
        label: "Concepts",
        Icon: IoFilter,
        href: "#",
        description: "Core Concepts",
        hrefLabel: "Explore Concepts",
        subText:
          "Understand the domain model — Incidents, AgentRuns, Findings, Proposals, PolicyDecisions, Approvals, Executions, and AuditEvents — and how they relate across the incident lifecycle.",
        tags: ["Domain model", "State machine", "Policy evaluation"],
        analytics: [
          {
            value: "12",
            label: "Domain entities",
          },
          { value: "12", label: "Incident states", color: "text-blue-400" },
          {
            value: "Immutable",
            label: "All event records",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          tags: [
            "Incident",
            "Finding",
            "Proposal",
            "PolicyDecision",
            "AuditEvent",
          ],
          subTags: [],
          title: "Key Entities",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "docs",
        label: "SDKs & APIs",
        Icon: HiOutlineDocumentCheck,
        href: "#",
        description: "SDKs & APIs",
        hrefLabel: "View API Reference",
        subText:
          "Full REST and WebSocket API reference, TypeScript SDK, and the Agent SDK for registering custom agents. All routes versioned under /api/v1/ with JWT auth on every call.",
        tags: ["REST", "WebSockets", "TypeScript SDK", "Agent SDK"],
        analytics: [
          {
            value: "v1",
            label: "Versioned API",
            color: "text-blue-400",
          },
          {
            value: "JWT",
            label: "Auth on all calls",
            color: undefined,
          },
          {
            value: "OpenAPI",
            label: "Spec available",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: true,
          code: `const client = 
createClient({ baseUrl: 
'/api/v1', 
token: process.env .SCRUBBE_TOKEN, }); 
await client.incidents
.get(incidentId);
`,
          tags: [],
          subTags: [],
          title: "Example Call",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "docs",
        label: "Integrations",
        Icon: TbBolt,
        href: "#",
        description: "Integrations",
        hrefLabel: "View Integrations Guides",
        subText:
          "Step-by-step guides for connecting PagerDuty, Datadog, Slack, Jira, Notion, and more. Each integration doc covers auth, event mapping, and how Scrubbe routes signals through the orchestrator.",
        tags: ["PagerDuty", "Datadog", "Slack", "Jira"],
        analytics: [
          {
            value: "12+",
            label: "Integrations",
            color: "text-blue-400",
          },
          {
            value: "Webhook",
            label: "Ingest method",
            color: undefined,
          },
          {
            value: "Step-by-step",
            label: "Each guide",
            color: "text-emerald-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: ["PagerDuty", "Datadog", "Slack", "Jira"],
          subTags: [],
          title: "Available Guides",
        },
        rightComponent: <Usecase />,
      },
      {
        id: "docs",
        label: "Tutorials",
        Icon: BookOpen,
        href: "#",
        description: "Tutorials",
        hrefLabel: "Browse Tutorials",
        subText:
          "End-to-end walkthroughs for common workflows — writing your first policy, configuring a playbook for a known incident type, setting up approval routing for production, and building a custom agent.",
        tags: ["First policy", "Playbook setup", "Custom agent"],
        analytics: [
          {
            value: "8",
            label: "Tutorials available",
            color: "text-emerald-400",
          },
          {
            value: "End-to-end",
            label: "Each walkthrough",
            color: undefined,
          },
          {
            value: "Code",
            label: "Included throughout",
            color: "text-blue-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "Write your first policy",
            "Build a playbook",
            "Configure approval routing",
            "Register a custom agent",
          ],
          subTags: [],
          title: "Popular Tutorials",
        },
        rightComponent: <Usecase />,
      },

      {
        id: "docs",
        label: "Reference",
        Icon: IoDocumentTextOutline,
        href: "#",
        description: "Reference",
        hrefLabel: "Open Reference",
        subText:
          "Complete reference documentation for every API endpoint, domain entity, event type, policy field, and SDK method. Auto-generated from source, always in sync with the latest release.",
        tags: [
          "API endpoints",
          "Domain entities",
          "Event types",
          "Policy schema",
        ],
        analytics: [
          {
            value: "Auto-gen",
            label: "Always current",
            color: "text-emerald-400",
          },
          {
            value: "Full schema",
            label: "Every entity",
            color: undefined,
          },
          {
            value: "OpenAPI",
            label: "Spec download",
            color: "text-blue-400",
          },
        ],
        subSection: {
          isCode: false,
          code: undefined,
          tags: [
            "REST Endpoints",
            "WebSocket Events",
            "Policy Schema",
            "Domain Entities",
          ],
          subTags: [],
          title: "Reference Sections",
        },
        rightComponent: <Usecase />,
      },
    ],
  },
  {
    label: "Company",
  },
  // {
  //   label: "More",
  //   dropdownOptions: [
  //     { label: "Knowledge base", href: "#" },
  //     { label: "Security and Trust", href: "#" },
  //     { label: "Case Studies", href: "#" },
  //     { label: "Blog (Technical and Industry Post)", href: "#" },
  //     { label: "White Papers", href: "#" },
  //     { label: "Careers", href: "#" },
  //     { label: "Compliance Checklist", href: "#" },
  //     { label: "About Us", href: "#" },
  //   ],
  // },
];
