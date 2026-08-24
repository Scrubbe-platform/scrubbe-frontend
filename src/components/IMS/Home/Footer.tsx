"use client";

import Link from "next/link";
import { BsSlack, BsGithub } from "react-icons/bs";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

// ─────────────────────────────────────────────────────────────────
// Nav columns — row 1: Product / Platform / Developer
// row 2: Security / Company
// ─────────────────────────────────────────────────────────────────

const ROW_1 = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Platform", href: "/platform" },
      { label: "Incident Response", href: "/#" },
      { label: "Multi-Agent Investigation", href: "/#" },
      { label: "Remediation", href: "/#" },
      { label: "Governance", href: "/#" },
      { label: "Playbooks", href: "/#" },
      { label: "Connectors", href: "/connector" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Intelligent Control Plane", href: "/#" },
      { label: "Asset Inventory", href: "/#" },
      { label: "Service Catalogue", href: "/#" },
      { label: "Operational Rules", href: "/#" },
      { label: "Incident Quality Assurance", href: "/#" },
      { label: "Handover", href: "/#" },
      { label: "Postmortem", href: "/#" },
      { label: "On-call", href: "/#" },
    ],
  },
  {
    heading: "Developer",
    links: [
      { label: "Documentation", href: "/#" },
      { label: "API Reference", href: "/#" },
      { label: "SDK & CLI", href: "/sdk" },
      { label: "MCP", href: "/mcp" },
      { label: "Integrations", href: "/connector" },
      { label: "Changelog", href: "/#" },
      { label: "Developer Portal", href: "/#" },
    ],
  },
];

const ROW_2 = [
  {
    heading: "Security",
    links: [
      { label: "Security Overview", href: "/#" },
      { label: "SOC 2 Type II", href: "/#" },
      { label: "GDPR", href: "/#" },
      { label: "Audit Trail", href: "/#" },
      { label: "Data Residency", href: "/#" },
      { label: "Access Control", href: "/#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/career" },
      { label: "Contact us", href: "/contact-us" },
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms-service" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// Social icons
// ─────────────────────────────────────────────────────────────────

const SOCIALS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/_Scrubbe",
    icon: <FaXTwitter color="#fff" size={16} />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/scrubbe/",
    icon: <FaLinkedinIn color="#fff" size={16} />,
  },
  {
    label: "GitHub",
    href: "https://github.com/scrubbe",
    icon: <BsGithub color="#fff" size={16} />,
  },
  {
    label: "Slack",
    href: "https://scrubbecommunity.slack.com/archives/C0B0ZSFG7M0",
    icon: <BsSlack color="#fff" size={16} />,
  },
];

// ─────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      {/* Giant wordmark banner */}
      <div className="max-w-[1480px] mx-auto px-6 pt-6">
        <div
          className="rounded-t-3xl overflow-hidden relative"
          style={{ background: "#07271A", height: "clamp(180px, 19vw, 340px)" }}
        >
          <p
            className="font-bold text-white leading-none select-none tracking-tight whitespace-nowrap"
            style={{ fontSize: "clamp(180px, 22vw, 400px)" }}
          >
            scrubbe
          </p>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* ── LEFT: Brand + newsletter + socials ── */}
          <div>
            <p className="text-lg font-bold text-black leading-snug mb-3">
              Autonomous incident response
              <br />
              for engineering teams.
            </p>

            <p className="text-[13.5px] text-gray-500 leading-relaxed mb-6">
              Scrubbe investigates, decides and remediates production incidents
              - safely and at scale.
            </p>

            <p className="text-[13px] font-bold text-black mb-2">Newsletter</p>
            <form className="flex items-stretch gap-2 mb-6">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-white whitespace-nowrap border-0 cursor-pointer hover:brightness-110 transition-all"
                style={{ background: "#0e2a1c" }}
              >
                Subscribe
              </button>
            </form>

            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-black hover:bg-gray-800 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Nav grid + status pill ── */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1">
                {ROW_1.map((col) => (
                  <div key={col.heading}>
                    <p className="text-[14px] font-bold text-black mb-4">
                      {col.heading}
                    </p>
                    <ul className="space-y-3">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-[13.5px] text-gray-500 transition-colors hover:text-black"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Link
                href="/system-status"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold whitespace-nowrap self-start border"
                style={{ borderColor: "#22c55e", color: "#16a34a" }}
              >
                <span style={{ color: "#16a34a" }}>•</span>
                Systems Operational
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-10">
              {ROW_2.map((col) => (
                <div key={col.heading}>
                  <p className="text-[14px] font-bold text-black mb-4">
                    {col.heading}
                  </p>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[13.5px] text-gray-500 transition-colors hover:text-black"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-[1480px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12.5px] text-gray-500">
            © {new Date().getFullYear()} Scrubbe Inc. All rights reserved.
          </p>
          <p className="text-[12.5px] text-gray-500">
            1207 Delaware Ave #3296 , Wilmington, DE 19806, United States
          </p>
        </div>
      </div>
    </footer>
  );
}
