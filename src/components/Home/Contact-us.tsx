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
  Shield,
} from "lucide-react";
import { getCalApi } from "@calcom/embed-react";
import { FaSlack } from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface WayItem {
  iconBg: string;
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
// Static data — company address removed
// ─────────────────────────────────────────────────────────────────

const WAYS: WayItem[] = [
  {
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: <Calendar size={18} />,
    title: "Book a Demo",
    desc: "Schedule a personalised demo with our team",
  },
  {
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: <FaSlack size={18} />,
    title: "Message us on Slack",
    desc: "Chat with us instantly on Slack",
  },
  {
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: <Users size={18} />,
    title: "Join our community",
    desc: "Connect with other engineers, share ideas and get help",
  },
  {
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: <Mail size={18} />,
    title: "Email us",
    desc: "Contact@scrubbe.com",
  },
  {
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: <MessageSquare size={18} />,
    title: "Live Chat",
    desc: "Available Mon-Fri, 9am-6pm UTC",
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
// FAQ Row — bigger text
// ─────────────────────────────────────────────────────────────────

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left bg-transparent border-none cursor-pointer group"
      >
        <span className="text-base font-semibold text-gray-800 leading-snug group-hover:text-emerald-600 transition-colors flex-1">
          {item.q}
        </span>
        {open ? (
          <ChevronUp size={17} className="text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={17} className="text-gray-400 shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-5 whitespace-pre-line pr-6">
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

  const inputCls =
    "w-full border-2 border-gray-200 rounded-lg px-3.5 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white";

  const labelCls = "text-sm text-gray-500 font-medium block mb-1.5";

  const half = Math.ceil(FAQ_ITEMS.length / 2);
  const leftFAQ = FAQ_ITEMS.slice(0, half);
  const rightFAQ = FAQ_ITEMS.slice(half);

  return (
    <div className="bg-white min-h-screen font-sans pt-20">
      {/* ── CONTACT SECTION ── */}
      <section className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-14 items-start">
        {/* ── LEFT ── */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Contact us
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-emerald-500 mb-2">
            We'd love to hear from you
          </p>
          <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-xs">
            Reach out for any questions, partnerships, support, or to see
            Scrubbe in action.
          </p>

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            Ways to reach us
          </p>

          <div className="flex flex-col gap-5">
            {WAYS.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${w.iconBg}`}
                >
                  {w.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {w.title}
                    </span>
                    {w.badge && (
                      <span className="text-[11px] font-bold bg-purple-100 text-purple-600 border border-purple-300 rounded px-2 py-0.5">
                        {w.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{w.desc}</p>
                </div>
                <ArrowRight
                  size={15}
                  className="text-gray-300 group-hover:text-emerald-400 transition-colors mt-2.5 shrink-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT — FORM CARD ── */}
        <div className="border-2 border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
          {/* Top two action buttons */}
          <div className="grid grid-cols-2 border-b-2 border-gray-300">
            {/* Book a Demo — Cal.com button */}
            <button
              data-cal-namespace="demo"
              data-cal-link="scrubbe/scrubbe-demo"
              data-cal-config='{"layout":"month_view","theme":"light"}'
              className="flex items-center gap-3 p-4 bg-transparent cursor-pointer text-left hover:bg-emerald-50 active:bg-emerald-100 transition-colors border-r-2 border-gray-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                <Calendar size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  Book a Demo
                </p>
                <p className="text-xs text-gray-400 leading-snug mt-0.5">
                  Schedule a personalised demo with our team
                </p>
              </div>
            </button>

            {/* Send us a message button */}
            <button className="flex items-center gap-3 p-4 bg-transparent border-none cursor-pointer text-left hover:bg-gray-50 active:bg-gray-100 transition-colors group w-full">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                <MessageSquare size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-gray-600 transition-colors">
                  Send us a message
                </p>
                <p className="text-xs text-gray-400 leading-snug mt-0.5">
                  We'll get back to you soon
                </p>
              </div>
            </button>
          </div>

          {/* Form body */}
          <div className="p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Your Details
            </p>

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={set("fullName")}
                />
              </div>
              <div>
                <label className={labelCls}>Work Email</label>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="Enter your work email"
                  value={form.workEmail}
                  onChange={set("workEmail")}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Company Name</label>
                <input
                  className={inputCls}
                  placeholder="Enter your company name"
                  value={form.companyName}
                  onChange={set("companyName")}
                />
              </div>
              <div>
                <label className={labelCls}>What best describes you</label>
                <select
                  className={`${inputCls} ${
                    !form.role ? "text-gray-400" : "text-gray-700"
                  }`}
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
            <div className="mb-5">
              <label className={labelCls}>How can we help you</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Tell us a bit about your use case and goals"
                value={form.message}
                onChange={set("message")}
              />
            </div>

            {/* CTA */}
            <button className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold text-base transition-colors">
              Continue to Confirm
            </button>

            {/* Security note */}
            <p className="flex items-center justify-center gap-1.5 text-sm text-gray-400 mt-3">
              <Shield size={13} />
              Your information is secured and will never be shared
            </p>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="border-t-2 border-gray-200" />

      {/* ── FAQ SECTION ── */}
      <section className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-gray-500">
            Got questions? We've got answers.{" "}
            <span className="font-medium cursor-pointer hover:underline">
              Browse our frequently asked questions
            </span>{" "}
            to find what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
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
