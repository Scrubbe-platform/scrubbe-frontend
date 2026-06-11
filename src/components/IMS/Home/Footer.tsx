"use client";

import Link from "next/link";
import { BsSlack } from "react-icons/bs";
import { FaMediumM } from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────
// Nav columns
// ─────────────────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/#" },
      { label: "Platform", href: "/#" },
      { label: "Ezra", href: "/#" },
      { label: "Playbooks", href: "/#" },
      { label: "Connectors", href: "/#" },
      { label: "Pricing", href: "/#" },
    ],
  },
  {
    heading: "Developer",
    links: [
      { label: "Documentation", href: "/#" },
      { label: "API Reference", href: "/#" },
      { label: "SDKs", href: "/#" },
      { label: "Changelog", href: "/#" },
      { label: "MCP", href: "/#" },
    ],
  },
  {
    heading: "Security",
    links: [
      { label: "SOC 2 Type II", href: "/#" },
      { label: "GDPR", href: "/#" },
      { label: "Audit Trail", href: "/#" },
      { label: "Data Residency", href: "/#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#" },
      { label: "Blog", href: "/#" },
      { label: "Careers", href: "/#" },
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
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M12.6 1.5h2.3L9.9 7.2 15.5 14.5H11L7.4 9.8 3.2 14.5H0.9L6.3 8.4 1 1.5h4.7l3.3 4.3L12.6 1.5zM11.8 13h1.3L4.3 2.8H2.9L11.8 13z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/scrubbe/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M13.6 1H2.4C1.6 1 1 1.6 1 2.4v11.2C1 14.4 1.6 15 2.4 15h11.2c.8 0 1.4-.6 1.4-1.4V2.4C15 1.6 14.4 1 13.6 1zM5.3 12.5H3.3V6.4h2v6.1zM4.3 5.5C3.6 5.5 3 4.9 3 4.2s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3zM13 12.5h-2V9.3c0-.8-.7-1.4-1.4-1.4-.8 0-1.4.6-1.4 1.4v3.2H6.2V6.4h2v.9c.4-.6 1.2-1 2-1 1.5 0 2.8 1.2 2.8 2.7v3.5z"
          fill="white"
        />
      </svg>
    ),
  },
  // {
  //   label: "GitHub",
  //   href: "https://github.com/scrubbe",
  //   icon: (
  //     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  //       <path
  //         fillRule="evenodd"
  //         clipRule="evenodd"
  //         d="M8 1a7 7 0 00-2.21 13.64c.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.03-.78-1.03-.64-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.78-3.18-3.46 0-.76.27-1.39.72-1.87-.07-.18-.31-.89.07-1.85 0 0 .58-.19 1.92.72A6.68 6.68 0 018 5.37c.59 0 1.19.08 1.74.23 1.34-.91 1.92-.72 1.92-.72.38.96.14 1.67.07 1.85.45.48.72 1.11.72 1.87 0 2.69-1.64 3.28-3.2 3.46.25.22.47.65.47 1.3v1.94c0 .19.12.4.48.34A7 7 0 008 1z"
  //         fill="white"
  //       />
  //     </svg>
  //   ),
  // },
  {
    label: "Slack",
    href: "https://scrubbecommunity.slack.com/archives/C0B0ZSFG7M0",
    icon: <BsSlack color="#fff" size={18} />,
  },
  {
    label: "Medium",
    href: " https://scrubbe.medium.com/",
    icon: <FaMediumM color="#fff" size={18} />,
  },
];

// ─────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="w-full" style={{ background: "#0a0a0a" }}>
      <div className="max-w-[1200px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_auto] gap-12">
          {/* ── LEFT: Brand + address + socials ── */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <Link href={"/"} className="h-[30px] w-[220px]">
                <img
                  src="/IMS/whitelogo.png"
                  alt="scrubbe.png"
                  className="object-contain h-full "
                />
              </Link>
            </div>

            {/* Tagline */}
            <p className="text-[13px] font-semibold text-white leading-snug mb-4">
              Machine-First Governed Incident
              <br />
              Intelligence
            </p>

            {/* Address */}
            <p
              className="text-[13px] leading-relaxed mb-6"
              style={{ color: "#6b7280" }}
            >
              1207 Delaware Ave #3296
              <br />
              Wilmington, DE 19806, United
              <br />
              States
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
                  style={{ background: "#1f2937" }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── MIDDLE: Nav columns ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {NAV_COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="text-[14px] font-bold text-white mb-4">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13.5px] transition-colors hover:text-white"
                        style={{ color: "#6b7280" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── RIGHT: Systems Operational pill ── */}
          <div className="flex items-start justify-end">
            <Link href="/system-status"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold whitespace-nowrap"
              style={{
                border: "1px solid #22c55e",
                color: "#22c55e",
                background: "transparent",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#22c55e" }}
              />
              Systems Operational
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: "#1f2937" }}>
        <div className="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">
          <p className="text-[12px]" style={{ color: "#4b5563" }}>
            © {new Date().getFullYear()} Scrubbe Inc. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: "#4b5563" }}>
            Built for engineers who can't afford to guess.
          </p>
        </div>
      </div>
    </footer>
  );
}
