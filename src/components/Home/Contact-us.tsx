"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  MessageSquare,
  Users,
  Mail,
  MapPin,
  Shield,
  Clock,
  Hash,
} from "lucide-react";
import { getCalApi } from "@calcom/embed-react";
import { FaSlack } from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface WayItem {
  bgColor: string;
  iconColor: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}

interface FAQItem {
  q: string;
  a: string;
}

// ─────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────

const WAYS: WayItem[] = [
  {
    bgColor: "#e6f7f1",
    iconColor: "#16a34a",
    icon: <Calendar size={16} />,
    title: "Book a Demo",
    desc: "Schedule a personalised demo with our team",
  },
  {
    bgColor: "#e6f7f1",
    iconColor: "#16a34a",
    icon: <FaSlack size={16} />,
    title: "Message us on Slack",
    desc: "Chat with us instantly on Slack",
    badge: "Slack",
  },
  {
    bgColor: "#e6f7f1",
    iconColor: "#16a34a",
    icon: <Users size={16} />,
    title: "Join our community",
    desc: "Connect with other engineers, share ideas and get help",
  },
  {
    bgColor: "#e6f7f1",
    iconColor: "#16a34a",
    icon: <Mail size={16} />,
    title: "Email us",
    desc: "hello@scrubbe.com",
  },
  {
    bgColor: "#e6f7f1",
    iconColor: "#16a34a",
    icon: <MessageSquare size={16} />,
    title: "Live Chat",
    desc: "Available Mon-Fri, 9am-6pm UTC",
  },
  {
    bgColor: "#e6f7f1",
    iconColor: "#16a34a",
    icon: <MapPin size={16} />,
    title: "Company Address",
    desc: "Scrubbe Ltd, London, United Kingdom",
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What is Scrubbe?",
    a: "Scrubbe is a governed multi-agent orchestration platform for engineering incidents. It connects signals across your stack, analyses root cause, proposes fixes, and executes remediation safely under policy control.",
  },
  {
    q: "How is Scrubbe different from incident management tools?",
    a: "Traditional tools help you coordinate people during incidents. Scrubbe coordinates systems and actions — from detection to resolution — while enforcing policies, approvals, and auditability.",
  },
  {
    q: "What problem does Scrubbe solve?",
    a: "Engineering teams spend too much time:\n* investigating alerts manually\n* correlating signals across teams\n* deciding what action is safe\nScrubbe reduces this by turning signals into governed, executable decisions.",
  },
  {
    q: "Who is Scrubbe for?",
    a: "* SRE teams\n* Engineering platforms\n* DevOps teams\n* Infrastructure teams\n* High-scale engineering orgs with production systems",
  },
  {
    q: "How It Works",
    a: "Scrubbe follows a structured pipeline:\n1. Ingest signals (alerts, logs, metrics, code changes)\n2. Correlate and identify root cause\n3. Evaluate policies and risk\n4. Propose fixes or actions\n5. Execute safely (with approval if required)",
  },
  {
    q: "What are 'agents' in Scrubbe?",
    a: "Agents are specialised components that:\n* analyse signals\n* generate fixes\n* validate outcomes\n* explain decisions\n\nEach agent operates under governance rules.",
  },
  {
    q: "What is meant by 'governed execution'?",
    a: "Every action in Scrubbe is:\n* checked against policies\n* optionally gated by approvals\n* logged in an audit trail\n\nNothing runs blindly.",
  },
  {
    q: "Can Scrubbe automatically fix issues?",
    a: "Yes—but only when policies allow it.\nYou control:\n* what can be automated\n* what requires approval\n* what is restricted",
  },
  {
    q: "What tools does Scrubbe integrate with?",
    a: "Scrubbe connects to:\n* observability tools (metrics, logs, alerts)\n* code repositories\n* CI/CD pipelines\n* cloud infrastructure\n* communication tools",
  },
  {
    q: "Do we need to replace our existing tools?",
    a: "No. Scrubbe sits on top of your stack and orchestrates it.",
  },
  {
    q: "How does Scrubbe use our data?",
    a: "Scrubbe processes operational signals to:\n* understand incidents\n* generate decisions\n* execute actions\n\nData usage is scoped, controlled, and auditable.",
  },
  {
    q: "Is our data secure?",
    a: "Yes. Scrubbe is built with:\n* strict access controls\n* encrypted data handling\n* audit logging\n* policy enforcement",
  },
  {
    q: "Does Scrubbe support approvals and access control?",
    a: "Yes. You can define:\n* who can approve actions\n* what actions require approval\n* role-based permissions",
  },
  {
    q: "Is there an audit trail?",
    a: "Every action is recorded:\n* what happened\n* why it happened\n* who approved it\n* what system executed it",
  },
  {
    q: "What outcomes can we expect?",
    a: "* Faster incident resolution (lower MTTR)\n* Reduced manual investigation\n* Consistent, repeatable responses\n* Lower operational risk\n* Better system reliability",
  },
  {
    q: "How does Scrubbe reduce MTTR?",
    a: "By:\n* correlating signals automatically\n* identifying root cause faster\n* proposing actionable fixes\n* removing manual coordination delays",
  },
  {
    q: "Does Scrubbe replace engineers?",
    a: "No. It augments engineers by:\n* removing repetitive work\n* accelerating decision-making\n* enforcing safety\n\nEngineers remain in control.",
  },
  {
    q: "How long does it take to get started?",
    a: "Initial setup can take hours to days depending on:\n* integrations\n* policy configuration\n* environment complexity",
  },
  {
    q: "Do we need to define policies upfront?",
    a: "Yes—policies are central to Scrubbe. They define:\n* what's allowed\n* what's risky\n* what needs approval",
  },
  {
    q: "Can we start small?",
    a: "Yes. You can:\n* start with visibility only\n* enable suggestions\n* gradually move to execution",
  },
  {
    q: "How does a demo work?",
    a: "A guided session where we:\n* connect sample signals\n* show correlation and analysis\n* demonstrate policy evaluation\n* walk through fix generation and execution",
  },
  {
    q: "Can we use our own environment in the demo?",
    a: "Yes, depending on readiness and security requirements.",
  },
  {
    q: "How is Scrubbe priced?",
    a: "Pricing is typically based on:\n* scale of systems monitored\n* number of environments\n* usage of orchestration/execution features",
  },
  {
    q: "Is there a free trial?",
    a: "Available depending on onboarding stage and use case.",
  },
  {
    q: "What makes Scrubbe defensible?",
    a: "* Policy-driven account of actions\n* Multi-agent orchestration architecture\n* Deep integration across systems\n* Audit-first design",
  },
  {
    q: "Why now?",
    a: "* Increasing system complexity\n* Alert fatigue across teams\n* Rise of AI-generated actions without governance\n* Need for safe, automated remediation",
  },
  {
    q: "What category does Scrubbe belong to?",
    a: "Scrubbe defines a new category: Governed AI Incident Orchestration.",
  },
  {
    q: "Why not just use alerts and runbooks?",
    a: "Because alerts tell you something is wrong, runbooks tell you what to try, but Scrubbe decides, validates, and executes — safely.",
  },
];

// ─────────────────────────────────────────────────────────────────
// FAQ Row
// ─────────────────────────────────────────────────────────────────

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f3f4f6" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            color: "#111827",
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {item.q}
        </span>
        {open ? (
          <ChevronUp
            size={15}
            style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }}
          />
        ) : (
          <ChevronDown
            size={15}
            style={{ color: "#9ca3af", flexShrink: 0, marginTop: 2 }}
          />
        )}
      </button>
      {open && (
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.7,
            paddingBottom: 16,
            whiteSpace: "pre-line",
            paddingRight: 24,
          }}
        >
          {item.a}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    workEmail: "",
    companyName: "",
    role: "",
    message: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "demo" });
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#10b981" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    color: "#374151",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#9ca3af",
    display: "block",
    marginBottom: 6,
  };

  const half = Math.ceil(FAQ_ITEMS.length / 2);
  const leftFAQ = FAQ_ITEMS.slice(0, half);
  const rightFAQ = FAQ_ITEMS.slice(half);

  return (
    <div
      style={{
        background: "#fff",
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      className="pt-20"
    >
      {/* ── TOP CONTACT SECTION ── */}
      <section
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "56px 32px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 56,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 4px",
              letterSpacing: -0.5,
            }}
          >
            Contact us
          </h1>
          <p
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#10b981",
              margin: "0 0 8px",
            }}
          >
            We'd love to hear from you
          </p>
          <p
            style={{
              fontSize: 13.5,
              color: "#6b7280",
              lineHeight: 1.65,
              margin: "0 0 36px",
              maxWidth: 320,
            }}
          >
            Reach out for any questions, partnerships, support, or to see
            Scrubbe in action.
          </p>

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#9ca3af",
              marginBottom: 20,
            }}
          >
            Ways to reach us
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {WAYS.map((w, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                {/* Icon box */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: w.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: w.iconColor,
                  }}
                >
                  {w.icon}
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {w.title}
                    </span>
                    {w.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: "#f3e8ff",
                          color: "#9333ea",
                          border: "1px solid #e9d5ff",
                          borderRadius: 4,
                          padding: "1px 6px",
                        }}
                      >
                        {w.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>
                    {w.desc}
                  </p>
                </div>
                {/* Arrow */}
                <ArrowRight
                  size={14}
                  style={{ color: "#d1d5db", marginTop: 10, flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — BOOKING FORM CARD */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            background: "#fff",
          }}
        >
          {/* Top two quick-action cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {/* Book a Demo — Cal.com trigger */}
            <button
              data-cal-namespace="demo"
              data-cal-link="scrubbe/secret"
              data-cal-config='{"layout":"month_view","theme":"light"}'
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px",
                background: "none",
                border: "none",
                borderRight: "1px solid #e5e7eb",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#e6f7f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Calendar size={16} style={{ color: "#10b981" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                    margin: "0 0 2px",
                  }}
                >
                  Book a Demo
                </p>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#9ca3af",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  Schedule a personalised demo with our team
                </p>
              </div>
            </button>

            {/* Send a message */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={16} style={{ color: "#6b7280" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                    margin: "0 0 2px",
                  }}
                >
                  Send us a message
                </p>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "#9ca3af",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  We'll get back to you soon
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: "24px" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#9ca3af",
                margin: "0 0 20px",
              }}
            >
              Your Details
            </p>

            {/* Row 1: Full Name + Work Email */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={set("fullName")}
                />
              </div>
              <div>
                <label style={labelStyle}>Work Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Enter your work email"
                  value={form.workEmail}
                  onChange={set("workEmail")}
                />
              </div>
            </div>

            {/* Row 2: Company Name + Role */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label style={labelStyle}>Company Name</label>
                <input
                  style={inputStyle}
                  placeholder="Enter your company name"
                  value={form.companyName}
                  onChange={set("companyName")}
                />
              </div>
              <div>
                <label style={labelStyle}>What best describes you</label>
                <select
                  style={{
                    ...inputStyle,
                    color: form.role ? "#374151" : "#9ca3af",
                  }}
                  value={form.role}
                  onChange={set("role")}
                >
                  <option value="">Enter your role</option>
                  <option>SRE</option>
                  <option>Engineering Manager</option>
                  <option>DevOps Engineer</option>
                  <option>CTO / VP Engineering</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>How can we help you</label>
              <textarea
                style={{ ...inputStyle, resize: "none" }}
                rows={3}
                placeholder="Tell us a bit about your use case and goals"
                value={form.message}
                onChange={set("message")}
              />
            </div>

            {/* Date + Time */}

            {/* CTA */}
            <button
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                background: "#10b981",
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.2,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#059669")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#10b981")}
            >
              Continue to Confirm
            </button>

            {/* Security note */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginTop: 12,
              }}
            >
              <Shield size={11} style={{ color: "#9ca3af" }} />
              <span style={{ fontSize: 11.5, color: "#9ca3af" }}>
                Your information is secured and will never be shared
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ borderTop: "1px solid #f3f4f6", maxWidth: "100%" }} />

      {/* ── FAQ SECTION ── */}
      <section
        style={{ maxWidth: 1160, margin: "0 auto", padding: "64px 32px 80px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 12px",
              letterSpacing: -0.3,
            }}
          >
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 13.5, color: "#6b7280", margin: 0 }}>
            Got questions? We've got answers.{" "}
            <span
              style={{ color: "#10b981", fontWeight: 500, cursor: "pointer" }}
            >
              Browse our frequently asked questions
            </span>{" "}
            to find what you're looking for.
          </p>
        </div>

        {/* Two-column FAQ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 64px",
          }}
        >
          <div>
            {leftFAQ.map((item, i) => (
              <FAQRow key={i} item={item} />
            ))}
          </div>
          <div>
            {rightFAQ.map((item, i) => (
              <FAQRow key={i} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
