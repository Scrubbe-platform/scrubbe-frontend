"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
// ─────────────────────────────────────────────────────────────────
// Nav data
// ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "PRODUCT",
    links: [
      {
        title: "How it works",
        desc: "The full incident decision loop",
        href: "/how-it-works",
      },
      {
        title: "Platform",
        desc: "Core orchestration engine",
        href: "/platform",
      },
      {
        title: "Ezra",
        desc: "AI code & root cause intelligence",
        href: "/ezra",
      },
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
    ],
  },
  {
    label: "CHALLENGES",
    links: [
      {
        title: "Alert fatigue",
        desc: "Collapse noise into signal",
        href: "/challenges/alert-fatigue",
      },
      {
        title: "Manual triage",
        desc: "Automate detection-to-decision",
        href: "/challenges/manual-triage",
      },
      {
        title: "Ungoverned automation",
        desc: "Policy-first AI execution",
        href: "/challenges/governance",
      },
      {
        title: "Blast radius risk",
        desc: "Map impact before acting",
        href: "/challenges/blast-radius",
      },
    ],
  },
  {
    label: "SOLUTIONS",
    links: [
      {
        title: "For SRE teams",
        desc: "Lower MTTR, safer remediation",
        href: "/solutions/sre",
      },
      {
        title: "For Platform teams",
        desc: "Governed incident control layer",
        href: "/solutions/platform",
      },
      {
        title: "For Engineering leaders",
        desc: "Reliability without heroics",
        href: "/solutions/leaders",
      },
      {
        title: "For Compliance teams",
        desc: "Audit-first execution evidence",
        href: "/solutions/compliance",
      },
    ],
  },
  {
    label: "CONNECTIONS",
    links: [
      {
        title: "GitHub",
        desc: "Push events & deployment signals",
        href: "/connectors/github",
      },
      {
        title: "Datadog",
        desc: "Metric alerts & SLO breaches",
        href: "/connectors/datadog",
      },
      {
        title: "PagerDuty",
        desc: "Incident triggers & escalations",
        href: "/connectors/pagerduty",
      },
      {
        title: "Slack",
        desc: "War room & approval workflows",
        href: "/connectors/slack",
      },
      { title: "All connectors →", desc: "", href: "/connectors" },
    ],
  },
  {
    label: "PRICING",
    links: [
      { title: "Plans", desc: "Compare tiers and features", href: "/pricing" },
      {
        title: "Enterprise",
        desc: "Custom contracts & SLAs",
        href: "/pricing/enterprise",
      },
    ],
  },
  {
    label: "RESOURCES",
    links: [
      { title: "Documentation", desc: "Guides, APIs, and SDKs", href: "/docs" },
      { title: "Blog", desc: "Engineering deep-dives", href: "/blog" },
      { title: "Changelog", desc: "What's new in Scrubbe", href: "/changelog" },
      { title: "Status", desc: "Live system health", href: "/status" },
    ],
  },
  {
    label: "SECURITY",
    links: [
      {
        title: "SOC 2 Type II",
        desc: "Certified compliance",
        href: "/security/soc2",
      },
      {
        title: "GDPR",
        desc: "Data residency & privacy",
        href: "/security/gdpr",
      },
      {
        title: "Audit Trail",
        desc: "Immutable action logging",
        href: "/security/audit-trail",
      },
    ],
  },
];

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
// Desktop dropdown
// ─────────────────────────────────────────────────────────────────

function DropdownMenu({
  item,
  open,
}: {
  item: (typeof NAV_ITEMS)[0];
  open: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
          style={{ minWidth: 260, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
        >
          <div className="p-2">
            {item.links.map((link) => (
              <Link
                key={link.href}
                href={"/#"}
                className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-[13.5px] font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {link.title}
                </span>
                {link.desc && (
                  <span className="text-[12px] text-gray-400 mt-0.5">
                    {link.desc}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// Desktop nav item with dropdown
// ─────────────────────────────────────────────────────────────────

function NavItem({ item }: { item: (typeof NAV_ITEMS)[0] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        {item.label}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className="text-gray-400" />
        </motion.div>
      </button>
      <DropdownMenu item={item} open={open} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mobile menu
// ─────────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-[360px] bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <ScrubbeLogo />
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 border-none cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item, i) => (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setExpandedIndex(expandedIndex === i ? null : i)
                    }
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left bg-transparent border-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-[13px] font-bold tracking-wider text-gray-700">
                      {item.label}
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
                          {item.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={onClose}
                              className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors group"
                            >
                              <span className="text-[13px] font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                                {link.title}
                              </span>
                              {link.desc && (
                                <span className="text-[11.5px] text-gray-400 mt-0.5">
                                  {link.desc}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Bottom CTAs */}
            <div className="px-5 py-5 border-t border-gray-100 space-y-3">
              <Link
                href="/docs"
                onClick={onClose}
                className="block w-full text-center py-3 rounded-xl text-[14px] font-bold text-emerald-600 border border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/get-started"
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
      <header
        className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 h-[60px] flex items-center">
          {/* Logo */}
          <ScrubbeLogo />

          {/* Desktop nav — divider after logo */}
          <div className="hidden xl:flex items-center flex-1">
            <div className="w-px h-8 bg-gray-200 mx-5 shrink-0" />

            {/* Nav items with vertical dividers between each */}
            <nav className="flex items-center">
              {NAV_ITEMS.map((item, i) => (
                <div key={item.label} className="flex items-center">
                  <NavItem item={item} />
                  {i < NAV_ITEMS.length - 1 && (
                    <div className="w-px h-5 bg-gray-200 mx-3 shrink-0" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden xl:flex items-center gap-3 ml-auto">
            <Link
              href="/docs"
              className="px-5 py-2 rounded-lg text-[13.5px] font-bold text-emerald-600 border border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/get-started"
              className="px-5 py-2.5 rounded-lg text-[13.5px] font-bold text-white border-none transition-all hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg, #1a2a1a 0%, #14532d 60%, #22c55e 100%)",
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: right-side CTAs + hamburger */}
          <div className="flex xl:hidden items-center gap-3 ml-auto">
            <Link
              href="/get-started"
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

      {/* Spacer so page content doesn't hide under fixed nav */}
      <div className="h-[60px]" />

      {/* Mobile drawer */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
