"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, X, Menu, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────────

function Arrow() {
  return <ArrowRight size={13} className="text-emerald-500 shrink-0 mt-0.5" />;
}

// Card used in Product, Challenges, Resources, Security
function NavCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col p-3 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-bold text-gray-900 group-hover:text-emerald-700 leading-snug">
          {title}
        </span>
        <Arrow />
      </div>
      {desc && (
        <span className="text-[11.5px] text-gray-500 mt-1 leading-snug">
          {desc}
        </span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRODUCT dropdown
// Left: label + headline + desc + 2-col link cards + image slot
// Bottom right: 2 plain link cards
// ─────────────────────────────────────────────────────────────────

function ProductDropdown() {
  const cards = [
    {
      title: "How it works",
      desc: "The full incident decision loop",
      href: "/how-it-works",
    },
    { title: "Platform", desc: "Core orchestration engine", href: "/platform" },
    { title: "Ezra", desc: "AI code & root cause intelligence", href: "/ezra" },
    {
      title: "Playbooks",
      desc: "Reusable, versioned response plans",
      href: "/playbooks",
    },
    {
      title: "Connectors",
      desc: "Native integrations across your stack",
      href: "/connectors",
    },
  ];
  const bottom = [
    {
      title: "Pipeline",
      desc: "Direct path into the live workflow and state model.",
      href: "/pipeline",
    },
    {
      title: "Governance",
      desc: "Jump to policy, approval, and audit-focused sections.",
      href: "/governance",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-0 h-full">
      {/* Left */}
      <div className="p-6 border-r border-gray-100">
        <p className="text-[11px] font-bold text-emerald-500 mb-2 tracking-wide uppercase">
          Platform navigation
        </p>
        <h3 className="text-[20px] font-black text-gray-900 leading-tight mb-2">
          Move through the product with space for visual navigation.
        </h3>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
          Each destination now has a larger target area, supporting imagery,
          diagrams, or product previews without cramping the menu.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <NavCard key={c.href} {...c} />
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col">
        {/* Image slot */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full aspect-[4/3] border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
            <Image
              src="/IMS/images/nav/product-preview.png"
              alt="Product preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
        {/* Bottom 2 cards */}
        <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
          {bottom.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="p-4 hover:bg-gray-50 transition-colors group border-r border-gray-100 last:border-0"
            >
              <p className="text-[13px] font-bold text-gray-900 group-hover:text-emerald-600 mb-1">
                {b.title}
              </p>
              <p className="text-[11.5px] text-gray-500 leading-snug">
                {b.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHALLENGES dropdown — same layout as Product
// ─────────────────────────────────────────────────────────────────

function ChallengesDropdown() {
  const cards = [
    {
      title: "Fragmented Signals",
      desc: "Multiple tools, no unified incident context",
      href: "/challenges/fragmented-signals",
    },
    {
      title: "Root cause clarity",
      desc: "Faster path from symptoms to cause",
      href: "/challenges/root-cause",
    },
    {
      title: "Incident Response",
      desc: "Coordination under pressure",
      href: "/challenges/incident-response",
    },
    {
      title: "Decision Bottlenecks",
      desc: "Reduce waiting at approval gates",
      href: "/challenges/decision-bottlenecks",
    },
    {
      title: "Automation Safety",
      desc: "Guardrails before execution",
      href: "/challenges/automation-safety",
    },
    {
      title: "Alert Fatigue",
      desc: "Collapse noise into signal",
      href: "/challenges/alert-fatigue",
    },
    {
      title: "Repeated Incidents",
      desc: "Turn outcomes into learned patterns",
      href: "/challenges/repeated-incidents",
    },
    {
      title: "Manual triage",
      desc: "Automate decision-to-decision",
      href: "/challenges/manual-triage",
    },
    {
      title: "Scaling Reliability",
      desc: "Grow operational confidence as systems grow",
      href: "/challenges/scaling-reliability",
    },
    {
      title: "Ungoverned automation",
      desc: "Policy-first AI execution",
      href: "/challenges/ungoverned-automation",
    },
  ];
  const bottom = [
    {
      title: "Blast radius risk",
      desc: "Map impact before acting",
      href: "/challenges/blast-radius",
    },
    {
      title: "Control Layer",
      desc: "Governed automation with human checkpoints",
      href: "/challenges/control-layer",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-0 h-full">
      <div className="p-6 border-r border-gray-100">
        <p className="text-[11px] font-bold text-emerald-500 mb-2 tracking-wide uppercase">
          Problem navigation
        </p>
        <h3 className="text-[20px] font-black text-gray-900 leading-tight mb-2">
          Browse challenges through clearer, larger destination cards.
        </h3>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
          This gives each problem area enough space for a thumbnail, diagram, or
          contextual illustration while still acting like a fast nav menu.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <NavCard key={c.href} {...c} />
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full aspect-[4/3] border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
            <Image
              src="/IMS/images/nav/challenges-preview.png"
              alt="Challenges preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0 border-t border-gray-100">
          {bottom.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="p-4 hover:bg-gray-50 transition-colors group border-r border-gray-100 last:border-0"
            >
              <p className="text-[13px] font-bold text-gray-900 group-hover:text-emerald-600 mb-1">
                {b.title}
              </p>
              <p className="text-[11.5px] text-gray-500 leading-snug">
                {b.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SOLUTIONS dropdown — 3-column layout: By Industry | By Use Case | By Team
// ─────────────────────────────────────────────────────────────────

function SolutionsDropdown() {
  const cols = [
    {
      heading: "By Industry",
      links: [
        { title: "Fintech", href: "/solutions/fintech" },
        { title: "E-Commerce", href: "/solutions/ecommerce" },
        { title: "Saas", href: "/solutions/saas" },
        { title: "Healthcare", href: "/solutions/healthcare" },
        { title: "Gaming", href: "/solutions/gaming" },
        { title: "Enterprise", href: "/solutions/enterprise" },
      ],
    },
    {
      heading: "By Use Case",
      links: [
        { title: "Incident Detection", href: "/solutions/incident-detection" },
        { title: "Root Cause Analysis", href: "/solutions/root-cause" },
        {
          title: "Automated Remediation",
          href: "/solutions/automated-remediation",
        },
        {
          title: "Deployment Monitoring",
          href: "/solutions/deployment-monitoring",
        },
        {
          title: "Incident Intelligence",
          href: "/solutions/incident-intelligence",
        },
        { title: "Governance", href: "/solutions/governance" },
      ],
    },
    {
      heading: "By Team",
      links: [
        {
          title: "Platform Engineering",
          href: "/solutions/platform-engineering",
        },
        { title: "SRE / Devops", href: "/solutions/sre-devops" },
        {
          title: "Engineering Leadership",
          href: "/solutions/engineering-leadership",
        },
        { title: "Security", href: "/solutions/security" },
        { title: "QA/Release", href: "/solutions/qa-release" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-gray-100 p-2">
      {cols.map((col) => (
        <div key={col.heading} className="px-5 py-4">
          <p className="text-[11px] text-gray-400 font-medium mb-4">
            {col.heading}
          </p>
          <div className="space-y-1">
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between py-1.5 text-[14px] text-gray-700 hover:text-emerald-600 transition-colors group"
              >
                {link.title}
                <ArrowRight
                  size={13}
                  className="text-gray-300 group-hover:text-emerald-500 transition-colors"
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CONNECTIONS dropdown — 2-col, 3-row grouped sections with green dot labels
// ─────────────────────────────────────────────────────────────────

function ConnectionsDropdown() {
  const sections = [
    {
      label: "Code & Version Control",
      links: [
        { title: "GitHub", href: "/connectors/github" },
        { title: "GitLab", href: "/connectors/gitlab" },
        { title: "Bitbucket", href: "/connectors/bitbucket" },
      ],
      caption: "Track deployments & commits that trigger incidents",
    },
    {
      label: "Cloud & Infrastructure",
      links: [
        { title: "AWS", href: "/connectors/aws" },
        { title: "Azure", href: "/connectors/azure" },
        { title: "Google Cloud", href: "/connectors/google-cloud" },
      ],
      caption: "Monitor infra signals, scaling events & service health",
    },
    {
      label: "Orchestration & Runtime",
      links: [{ title: "Kubernetes", href: "/connectors/kubernetes" }],
      caption: "Track deployments & commits that trigger incidents",
    },
    {
      label: "Warroom & Alerts",
      links: [
        { title: "Slack", href: "/connectors/slack" },
        { title: "Microsoft Teams", href: "/connectors/teams" },
      ],
      caption: "Ingests alert & Spin up context-rich warrooms",
    },
    {
      label: "Observability",
      links: [
        { title: "Datadog", href: "/connectors/datadog" },
        { title: "Prometheus", href: "/connectors/prometheus" },
        { title: "Grafana", href: "/connectors/grafana" },
      ],
      caption: "Metrics, logs & alerts from your existing stack",
    },
    {
      label: "Build Your Own",
      links: [
        { title: "Node.js SDK", href: "/sdk/nodejs" },
        { title: "Python SDK", href: "/sdk/python" },
        { title: "Webhook Ingestion", href: "/sdk/webhooks" },
      ],
      caption: "Send custom signals from any system into Scrubbe",
    },
  ];

  return (
    <div className="grid grid-cols-2 divide-y divide-gray-100">
      {sections.map((s, i) => (
        <div
          key={s.label}
          className="p-5"
          style={{ borderRight: i % 2 === 0 ? "1px solid #f3f4f6" : "none" }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {s.label}
            </p>
          </div>
          <div className="space-y-1 mb-3">
            {s.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between py-1 text-[15px] text-gray-800 hover:text-emerald-600 transition-colors group"
              >
                {link.title}
                <ArrowRight
                  size={13}
                  className="text-gray-300 group-hover:text-emerald-500 transition-colors"
                />
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-2">
            <p className="text-[11.5px] text-gray-400 italic leading-snug">
              {s.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RESOURCES dropdown — same 2-col card layout as Product/Challenges
// ─────────────────────────────────────────────────────────────────

function ResourcesDropdown() {
  const cards = [
    {
      title: "Documentation",
      desc: "APIs, SDKs, and integration guides",
      href: "/docs",
    },
    {
      title: "Reports",
      desc: "Incident Intelligence and operational trends",
      href: "/reports",
    },
    {
      title: "Product Demo",
      desc: "Guided walkthroughs and UI tours",
      href: "/demo",
    },
    {
      title: "Architecture",
      desc: "How the governed pipeline fits together",
      href: "/architecture",
    },
    {
      title: "Blog",
      desc: "Notes from engineering and platform design",
      href: "/blog",
    },
    {
      title: "Community",
      desc: "Notes from engineering and platform design",
      href: "/community",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-0 h-full">
      <div className="p-6 border-r border-gray-100">
        <p className="text-[11px] font-bold text-emerald-500 mb-2 tracking-wide uppercase">
          Resource navigation
        </p>
        <h3 className="text-[20px] font-black text-gray-900 leading-tight mb-2">
          Resources now have room for previews, covers, and thumbnails.
        </h3>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
          The larger dropdown makes this area feel like a lightweight discovery
          panel rather than a cramped list of links.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <NavCard key={c.href} {...c} />
          ))}
        </div>
      </div>

      <div className="p-6 flex items-center justify-center">
        <div className="w-full aspect-[4/3] border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
          <Image
            src="/IMS/images/nav/resources-preview.png"
            alt="Resources preview"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECURITY dropdown — same 2-col card layout
// ─────────────────────────────────────────────────────────────────

function SecurityDropdown() {
  const cards = [
    {
      title: "Security Overview",
      desc: "Platform-wide safeguards and principles",
      href: "/security/overview",
    },
    {
      title: "Data Protection",
      desc: "Handling, storage, and isolation controls",
      href: "/security/data-protection",
    },
    {
      title: "Access Controls",
      desc: "Permissions, approvals and operator boundaries",
      href: "/security/access-controls",
    },
    {
      title: "Governance & Policies",
      desc: "Versioned rules and execution limits",
      href: "/security/governance",
    },
    {
      title: "Audit & Traceability",
      desc: "Immutable decision records and timeline",
      href: "/security/audit",
    },
    {
      title: "Compliance",
      desc: "Reporting-friendly controls and review paths",
      href: "/security/compliance",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-0 h-full">
      <div className="p-6 border-r border-gray-100">
        <h3 className="text-[20px] font-black text-gray-900 leading-tight mb-2">
          Security now has a larger, more structured dropdown for trust content.
        </h3>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
          This makes room for security diagrams, certification marks, and
          governance previews while keeping the links easy to scan.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <NavCard key={c.href} {...c} />
          ))}
        </div>
      </div>

      <div className="p-6 flex items-center justify-center">
        <div className="w-full aspect-[4/3] border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden">
          <Image
            src="/IMS/images/nav/security-preview.png"
            alt="Security preview"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dropdown panel wrapper — each menu has its own width/layout
// ─────────────────────────────────────────────────────────────────

type DropdownKey =
  | "PRODUCT"
  | "CHALLENGES"
  | "SOLUTIONS"
  | "CONNECTIONS"
  | "PRICING"
  | "RESOURCES"
  | "SECURITY";

const DROPDOWN_WIDTHS: Record<DropdownKey, number> = {
  PRODUCT: 860,
  CHALLENGES: 860,
  SOLUTIONS: 560,
  CONNECTIONS: 700,
  PRICING: 260,
  RESOURCES: 860,
  SECURITY: 860,
};

function DropdownContent({ label }: { label: string }) {
  switch (label) {
    case "PRODUCT":
      return <ProductDropdown />;
    case "CHALLENGES":
      return <ChallengesDropdown />;
    case "SOLUTIONS":
      return <SolutionsDropdown />;
    case "CONNECTIONS":
      return <ConnectionsDropdown />;
    case "RESOURCES":
      return <ResourcesDropdown />;
    case "SECURITY":
      return <SecurityDropdown />;
    case "PRICING":
      return (
        <div className="p-3 space-y-1">
          {[
            {
              title: "Plans",
              desc: "Compare tiers and features",
              href: "/pricing",
            },
            {
              title: "Enterprise",
              desc: "Custom contracts & SLAs",
              href: "/pricing/enterprise",
            },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
            >
              <span className="text-[13.5px] font-semibold text-gray-800 group-hover:text-emerald-600">
                {l.title}
              </span>
              <span className="text-[12px] text-gray-400 mt-0.5">{l.desc}</span>
            </Link>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// Nav items list
// ─────────────────────────────────────────────────────────────────

const NAV_LABELS: DropdownKey[] = [
  "PRODUCT",
  "CHALLENGES",
  "SOLUTIONS",
  "CONNECTIONS",
  "PRICING",
  "RESOURCES",
  "SECURITY",
];

function NavItem({ label }: { label: DropdownKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const width = DROPDOWN_WIDTHS[label];

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-0.5 py-1 text-[11.5px] font-bold tracking-wider text-gray-600 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer"
      >
        {label}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
            style={{
              width,
              // Prevent going off screen right edge
              left: label === "SECURITY" || label === "RESOURCES" ? "auto" : 0,
              right: label === "SECURITY" || label === "RESOURCES" ? 0 : "auto",
              boxShadow: "0 12px 48px rgba(0,0,0,0.10)",
            }}
          >
            <DropdownContent label={label} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Scrubbe logo
// ─────────────────────────────────────────────────────────────────

function ScrubbeLogo() {
  return (
    <Link href="/">
      <div className="relative w-32 h-8 xl:w-40 xl:h-10">
        <Image
          src="/IMS/blacklogo.png"
          alt="Scrubbe Logo"
          fill
          sizes="(max-width: 1280px) 128px, 160px"
          className="object-contain"
        />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mobile menu
// ─────────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Flat link list per label for mobile
  const MOBILE_LINKS: Record<DropdownKey, { title: string; href: string }[]> = {
    PRODUCT: [
      { title: "How it works", href: "/how-it-works" },
      { title: "Platform", href: "/platform" },
      { title: "Ezra", href: "/ezra" },
      { title: "Playbooks", href: "/playbooks" },
      { title: "Connectors", href: "/connectors" },
    ],
    CHALLENGES: [
      { title: "Fragmented Signals", href: "/challenges/fragmented-signals" },
      { title: "Root cause clarity", href: "/challenges/root-cause" },
      { title: "Alert Fatigue", href: "/challenges/alert-fatigue" },
      { title: "Manual triage", href: "/challenges/manual-triage" },
      { title: "Blast radius risk", href: "/challenges/blast-radius" },
    ],
    SOLUTIONS: [
      { title: "By Industry: Fintech", href: "/solutions/fintech" },
      { title: "SRE / Devops", href: "/solutions/sre-devops" },
      {
        title: "Platform Engineering",
        href: "/solutions/platform-engineering",
      },
      {
        title: "Engineering Leadership",
        href: "/solutions/engineering-leadership",
      },
    ],
    CONNECTIONS: [
      { title: "GitHub", href: "/connectors/github" },
      { title: "Datadog", href: "/connectors/datadog" },
      { title: "Slack", href: "/connectors/slack" },
      { title: "Kubernetes", href: "/connectors/kubernetes" },
      { title: "AWS", href: "/connectors/aws" },
    ],
    PRICING: [
      { title: "Plans", href: "/pricing" },
      { title: "Enterprise", href: "/pricing/enterprise" },
    ],
    RESOURCES: [
      { title: "Documentation", href: "/docs" },
      { title: "Blog", href: "/blog" },
      { title: "Product Demo", href: "/demo" },
      { title: "Reports", href: "/reports" },
    ],
    SECURITY: [
      { title: "Security Overview", href: "/security/overview" },
      { title: "Compliance", href: "/security/compliance" },
      { title: "Audit & Traceability", href: "/security/audit" },
      { title: "Data Protection", href: "/security/data-protection" },
    ],
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[360px] bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <ScrubbeLogo />
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 border-none cursor-pointer"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-1">
              {NAV_LABELS.map((label, i) => (
                <div key={label}>
                  <button
                    onClick={() =>
                      setExpandedIndex(expandedIndex === i ? null : i)
                    }
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left bg-transparent border-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-[13px] font-bold tracking-wider text-gray-700">
                      {label}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} className="text-gray-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="pl-3 pb-2 space-y-0.5">
                          {MOBILE_LINKS[label].map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={onClose}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-emerald-50 group transition-colors"
                            >
                              <span className="text-[13px] font-semibold text-gray-800 group-hover:text-emerald-600">
                                {link.title}
                              </span>
                              <ArrowRight
                                size={13}
                                className="text-gray-300 group-hover:text-emerald-500"
                              />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="px-5 py-5 border-t border-gray-100 space-y-3">
              <Link
                href="/docs"
                onClick={onClose}
                className="block w-full text-center py-3 rounded-xl text-[14px] font-bold text-emerald-600 border border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/auth/signin"
                onClick={onClose}
                className="block w-full text-center py-3 rounded-xl text-[14px] font-bold text-white border-none"
                style={{
                  background:
                    "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
                }}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 border-b border-gray-200 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-5 h-[60px] flex items-center">
          <ScrubbeLogo />

          <div className="hidden xl:flex items-center flex-1">
            <div className="w-px h-8 bg-gray-200 mx-5 shrink-0" />
            <nav className="flex items-center">
              {NAV_LABELS.map((label, i) => (
                <div key={label} className="flex items-center">
                  <NavItem label={label} />
                  {i < NAV_LABELS.length - 1 && (
                    <div className="w-px h-5 bg-gray-200 mx-3 shrink-0" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="hidden xl:flex items-center gap-3 ml-auto">
            <Link
              href="/docs"
              className="px-5 py-2 rounded-lg text-[13.5px] font-bold text-emerald-600 border border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/auth/signin"
              className="px-5 py-2.5 rounded-lg text-[13.5px] font-bold text-white border-none hover:brightness-110 transition-all"
              style={{
                background:
                  "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
              }}
            >
              Get Started
            </Link>
          </div>

          <div className="flex xl:hidden items-center gap-3 ml-auto">
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-lg text-[13px] font-bold text-white border-none"
              style={{
                background: "linear-gradient(90deg, #1a2a1a 0%, #22c55e 100%)",
              }}
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 border-none cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <Menu size={18} className="text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <div className="h-[60px]" />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
