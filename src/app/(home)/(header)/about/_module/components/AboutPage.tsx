import {
  Activity,
  ArrowRight,
  Bell,
  Clock,
  FileText,
  GitFork,
  Layers,
  Monitor,
  Search,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button1";
// import Footer from "@/components/marketing/Footer";
import AnalogClock from "./AnalogClock";
import Image from "next/image";
// import HeroGraphic from "@/components/about/HeroGraphic";

// ─── Static content ──────────────────────────────────────────────────────
// Everything below is copy lifted from the design mock. Swap freely once
// real/approved copy is finalized — nothing here is wired to a CMS.

const SIGNAL_SOURCES = [
  { label: "Deployments", Icon: Layers },
  { label: "Infra Events", Icon: Server },
  { label: "CI/CD", Icon: Clock },
  { label: "Telemetry", Icon: Activity },
  { label: "Monitoring Alerts", Icon: Bell },
  { label: "Runtime Failures", Icon: Zap },
  { label: "Service Deps", Icon: GitFork },
];

const PLATFORM_PILLARS = [
  {
    eyebrow: "Parallel Investigation",
    title: "Agents that investigate in concert, not in sequence.",
    body: "Specialized agents investigate code changes, CI/CD pipelines, infrastructure signals, logs, alerts, and service dependencies simultaneously — eliminating the sequential, manual correlation that defines most incident response today.",
  },
  {
    eyebrow: "Root Cause Correlation",
    title: "Causality established before action is proposed.",
    body: "The platform correlates what changed, identifies the most likely root cause, determines the safest remediation path, and verifies expected impact. No action is proposed until evidence is sufficient to support the hypothesis.",
  },
  {
    eyebrow: "Policy-Governed Execution",
    title: "Organizations retain control at every automation threshold.",
    body: "Approved remediation executes under configurable policy controls. The effective automation level is the intersection of playbook stage, policy ceiling, and risk classification — computed at match time, never assumed.",
  },
  {
    eyebrow: "Immutable Audit Trail",
    title: "Every decision traceable to its evidence and policy context.",
    body: "Every investigation step, recommendation, approval, and execution outcome is written to an append-only audit trail with the exact policy version that governed it. Governance is foundational — not a reporting layer added afterward.",
  },
];

const GOVERNANCE_PRINCIPLES = [
  {
    Icon: Search,
    title: "Evidence-driven",
    body: "No action without a correlated evidence graph anchoring the root cause hypothesis. Severity is computed by policy — never assumed from the originating connector.",
  },
  {
    Icon: Shield,
    title: "Policy-bounded",
    body: "The effective automation level is the minimum of playbook stage, policy ceiling, and risk classification. Computed once at playbook match — never re-evaluated or overridden at execution time.",
  },
  {
    Icon: FileText,
    title: "Always auditable",
    body: "Append-only audit trail with policy version snapshots at every state transition — from Detected through Post-Mortem. Every approval and outcome is traceable to the human or agent that authorized it.",
  },
  {
    Icon: Monitor,
    title: "Integration-native",
    body: "Built around an open connector model. Investigation quality compounds with every system connected — monitoring, ITSM, CI/CD, cloud, and communication platforms from day one.",
  },
];

const WORLD_CLOCKS = [
  { city: "San Francisco", timeZone: "America/Los_Angeles" },
  { city: "London", timeZone: "Europe/London" },
  { city: "Abuja", timeZone: "Africa/Lagos" },
];

const BELIEFS = [
  "Systems should understand before they act",
  "Governance belongs at the core, not the periphery",
  "Every remediation action deserves a traceable justification",
  "Investigation quality determines resolution quality",
  "Human control must always be preserved at configurable thresholds",
  "Operational intelligence is a strategic capability, not a tool category",
  "Fragmented signals are solvable when context travels with the event",
];

function SectionKicker({ number, label }: { number: string; label: string }) {
  return (
    <div className="font-mono text-xs">
      <div className="tracking-[0.15em] text-emerald-600">{number}</div>
      <div className="mt-1 tracking-[0.15em] text-neutral-500">{label}</div>
    </div>
  );
}

function SectionHeading({ lead, accent }: { lead: string; accent: string }) {
  return (
    <h2 className="font-serif text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-neutral-900">
      {lead}
      <br />
      <span className="italic text-emerald-600">{accent}</span>
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.35),_transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.15] text-white">
              Building the operational
              <br />
              <span className="italic text-emerald-400">
                intelligence layer
              </span>
              <br />
              for modern engineering.
            </h1>
            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-neutral-300">
              Production systems have grown too complex for human operators to
              manually correlate signals, investigate failures, coordinate
              response, and execute remediation at the speed modern business
              demands.
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-300">
              Scrubbe was founded to solve that problem. We are building an
              autonomous incident response platform that helps engineering teams
              investigate, understand, and resolve production incidents faster —
              through AI-powered operational intelligence that is governed,
              traceable, and policy-aware from the ground up.
            </p>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src={"/IMS/stack.png"}
              alt="stack"
              height={300}
              width={300}
            />
          </div>
        </div>
      </section>

      {/* ── Sections 01–04 share one continuous mint background ── */}
      <div className="bg-emerald-50">
        {/* 01 — Mission */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div className="lg:w-48 lg:flex-shrink-0">
              <SectionKicker number="01" label="Mission" />
            </div>
            <div className="max-w-3xl">
              <SectionHeading
                lead="Reduce the time between"
                accent="failure and resolution."
              />

              <p className="mt-6 text-[15px] leading-relaxed text-neutral-600">
                Every production incident creates pressure. Teams scramble to
                identify what changed, determine what failed, understand the
                blast radius, and coordinate a safe response across multiple
                systems and stakeholders — simultaneously, under time pressure,
                often outside business hours.
              </p>

              <blockquote className="my-7 border-l-2 border-emerald-500 pl-5">
                <p className="font-serif text-lg italic leading-snug text-neutral-900">
                  &ldquo;The challenge is no longer a lack of data. The
                  challenge is turning operational data into actionable
                  intelligence.&rdquo;
                </p>
                <cite className="mt-2 block font-mono text-xs not-italic tracking-wide text-neutral-500">
                  Paschal Ifediora, Founder &amp; CEO
                </cite>
              </blockquote>

              <p className="text-[15px] leading-relaxed text-neutral-600">
                Our mission is to help organizations move from reactive incident
                management to{" "}
                <strong className="font-semibold text-neutral-900">
                  intelligent, coordinated, and governed incident response
                </strong>
                . We believe this transition is one of the most consequential
                operational shifts available to engineering organizations today
                — not a marginal improvement, but a structural one.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                The cost of incidents is frequently measured not by the failure
                itself, but by the time required to understand it. Scrubbe
                closes that gap by deploying investigation before execution —
                ensuring that every remediation action is grounded in evidence,
                not assumption.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — The Problem */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div className="lg:w-48 lg:flex-shrink-0">
              <SectionKicker number="02" label="The Problem" />
            </div>
            <div className="max-w-3xl">
              <SectionHeading
                lead="Signal volume is not the issue."
                accent="Fragmentation is."
              />

              <p className="mt-6 text-[15px] leading-relaxed text-neutral-600">
                Modern engineering environments generate an overwhelming volume
                of operational signals. The information required to understand
                an incident almost always exists within the organization&apos;s
                systems. The problem is that it is scattered, disconnected, and
                requires manual interpretation under pressure.
              </p>

              <div className="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                {SIGNAL_SOURCES.map(({ label, Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-4 text-center"
                  >
                    <Icon
                      className="h-[18px] w-[18px] text-neutral-700"
                      strokeWidth={1.75}
                    />
                    <span className="font-mono text-[10px] leading-tight text-neutral-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-7 text-[15px] leading-relaxed text-neutral-600">
                Engineers spend valuable time manually connecting evidence,
                validating assumptions, coordinating teams, and determining safe
                next steps — while production impact continues to compound. The
                cost is measured not in the failure itself, but in the hours
                required to understand it.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                Scrubbe addresses this fragmentation by deploying specialized AI
                agents that investigate these signals in parallel, correlating
                what changed, identifying the most probable root cause, and
                presenting a traceable evidence graph before any remediation is
                proposed.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — The Platform */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div className="lg:w-48 lg:flex-shrink-0">
              <SectionKicker number="03" label="The Platform" />
            </div>
            <div className="max-w-3xl">
              <SectionHeading
                lead="An autonomous incident"
                accent="response platform."
              />

              <p className="mt-6 text-[15px] leading-relaxed text-neutral-600">
                Scrubbe is an autonomous incident response platform for
                engineering teams. During production incidents, Scrubbe deploys
                specialized AI agents that investigate code changes, CI/CD
                pipelines, infrastructure signals, logs, alerts, and service
                dependencies in parallel.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
                {PLATFORM_PILLARS.map((pillar) => (
                  <div key={pillar.eyebrow} className="bg-white p-6">
                    <div className="font-mono text-[10px] tracking-[0.1em] text-emerald-600">
                      {pillar.eyebrow}
                    </div>
                    <h3 className="mt-3 font-serif text-lg leading-snug text-neutral-900">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                      {pillar.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-px rounded-xl border border-neutral-200 bg-white p-6">
                <div className="font-mono text-[10px] tracking-[0.1em] text-emerald-600">
                  War Room Coordination
                </div>
                <h3 className="mt-3 font-serif text-lg leading-snug text-neutral-900">
                  Incident command, auto-initiated for high-severity events.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  When a P0 or P1 incident remains without an approved action
                  for more than twenty minutes, Scrubbe automatically creates a
                  private Slack channel, a Microsoft Teams channel, and a Zoom
                  instant meeting — joining engineers wherever they work,
                  without manual coordination overhead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 04 — Our Approach */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div className="lg:w-48 lg:flex-shrink-0">
              <SectionKicker number="04" label="Our Approach" />
            </div>
            <div className="max-w-3xl">
              <SectionHeading lead="Investigation before" accent="execution." />

              <p className="mt-6 text-[15px] leading-relaxed text-neutral-600">
                Many automation platforms focus on acting faster. We believe
                systems should first understand what happened. Scrubbe is
                designed around a principle that is simple to state but
                difficult to engineer: the quality of remediation depends on the
                quality of investigation.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                Before any action is proposed or executed, the platform gathers
                evidence, establishes causality, evaluates risk, and validates
                remediation options. This approach reduces operational
                uncertainty while improving confidence in response decisions —
                and creates the traceable foundation that enterprise governance
                programs require.
              </p>

              <blockquote className="my-7 border-l-2 border-emerald-500 pl-5">
                <p className="font-serif text-lg italic leading-snug text-neutral-900">
                  Operational automation must be safe. Scrubbe is built with
                  governance as a foundational capability, not an afterthought.
                </p>
              </blockquote>

              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
                {GOVERNANCE_PRINCIPLES.map(({ Icon, title, body }) => (
                  <div key={title} className="bg-white p-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <Icon
                        className="h-[18px] w-[18px] text-emerald-700"
                        strokeWidth={1.75}
                      />
                    </div>
                    <h3 className="mt-4 text-[15px] font-medium text-neutral-400">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Global coverage ── */}
      <section className="relative overflow-hidden bg-black px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0px,transparent_56px,rgba(16,185,129,0.14)_56px,rgba(16,185,129,0.14)_60px)]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-fuchsia-700/35 blur-[110px]" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-sans text-2xl font-semibold leading-snug text-white sm:text-[28px]">
            Building the Future of Reliability – One Incident at a Time.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-300">
            Production incidents do not follow business hours. Engineering teams
            coordinate across regions, hand off investigations between time
            zones, and respond to incidents at every hour of the day.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-300">
            Scrubbe is designed for globally distributed operations, helping
            organizations investigate, coordinate, and resolve incidents
            wherever their teams are located — continuously, without manual
            handoff between regions.
          </p>

          <div className="relative mx-auto mt-10 max-w-md rounded-2xl bg-neutral-50 p-8 shadow-2xl">
            <h3 className="text-center text-lg font-semibold text-neutral-900">
              We operate around the clock, so your systems never sleep
            </h3>
            <div className="mt-7 flex items-center justify-center gap-8">
              {WORLD_CLOCKS.map((clock) => (
                <AnalogClock
                  key={clock.city}
                  city={clock.city}
                  timeZone={clock.timeZone}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 — Looking Ahead ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="lg:w-48 lg:flex-shrink-0">
            <SectionKicker number="05" label="Looking Ahead" />
          </div>
          <div className="grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <SectionHeading
                lead="The future is operational"
                accent="intelligence."
              />

              <p className="mt-6 text-[15px] leading-relaxed text-neutral-600">
                The future of operations is not simply more dashboards, alerts,
                or workflows. The future is operational intelligence — systems
                capable of reasoning across code, infrastructure, deployments,
                and production environments to understand failures and
                coordinate response.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                We believe engineering teams will increasingly rely on platforms
                that can investigate, reason, and respond effectively. This is
                becoming a{" "}
                <span className="font-medium text-emerald-600">
                  strategic capability
                </span>{" "}
                for every technology organization — not a tool category, but an
                operational foundation.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                Our goal is to help teams spend less time searching for answers
                and more time delivering reliable systems. Scrubbe is building
                the intelligence layer that connects operational signals to
                safe, governed, explainable action.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
                Engineering systems continue to grow in scale and complexity.
                The ability to investigate, reason, and respond effectively is
                no longer optional. It is the infrastructure every modern
                engineering organization will need to build on.
              </p>
            </div>

            <div className="rounded-2xl bg-[#05090c] p-6">
              <div className="font-mono text-xs tracking-[0.1em] text-emerald-400">
                What we believe
              </div>
              <ul className="mt-5 space-y-4">
                {BELIEFS.map((belief) => (
                  <li
                    key={belief}
                    className="flex gap-2.5 text-sm leading-snug text-neutral-300"
                  >
                    <ArrowRight
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500"
                      strokeWidth={2}
                    />
                    {belief}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#00474d] px-6 py-16 text-center">
        <h2 className="font-serif text-2xl leading-snug text-white sm:text-3xl">
          Ready to transform how your team
          <br />
          <span className="italic text-emerald-300">
            responds to incidents?
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-emerald-100/80">
          Talk to our team about deploying governed incident intelligence for
          your engineering organization.
        </p>
        <div className="mt-7">
          <Button variant="outline-green" size="md">
            Talk to us
          </Button>
        </div>
      </section>
    </div>
  );
}
