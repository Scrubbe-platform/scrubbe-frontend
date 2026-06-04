"use client";

// ─────────────────────────────────────────────────────────────────
// Shared layout primitives
// ─────────────────────────────────────────────────────────────────

function SectionLayout({
  label,
  title,
  sublabel,
  children,
}: {
  label: string;
  title: string;
  sublabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#f0f4f0] px-4 sm:px-8 md:px-16 py-14 sm:py-20 border-b border-[#dde8dd]">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-16">
        {/* Left sidebar */}
        <div className="md:pt-1">
          <p className="text-[11px] tracking-widest text-zinc-500 font-mono mb-3">
            {label}
          </p>
          <h2 className="font-serif text-[26px] sm:text-[30px] md:text-[34px] leading-tight text-black mb-6">
            {title}
          </h2>
          <div className="w-7 h-[2px] bg-emerald-500 mb-3" />
          <p className="text-[11px] tracking-wider text-emerald-600 font-mono">
            {sublabel}
          </p>
        </div>

        {/* Right content */}
        <div>{children}</div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section 1 — Foundation / Orchestration
// ─────────────────────────────────────────────────────────────────

const agents = [
  {
    name: "Code analysis",
    desc: "Examines recent commits, pull requests, merges, and branch-level change history within the blast radius window of the current incident.",
  },
  {
    name: "Deployment analysis",
    desc: "Evaluates deployment events, artifact versions, rollout timing, feature flag states, and CI/CD execution records across affected services.",
  },
  {
    name: "Runtime investigation",
    desc: "Processes logs, distributed traces, metrics, saturation signals, and runtime anomalies correlated against the incident timeline and service topology.",
  },
  {
    name: "Dependency tracing",
    desc: "Identifies upstream and downstream dependency failures, latency propagation paths, timeout cascades, and third-party service degradation patterns.",
  },
  {
    name: "Remediation planning",
    desc: "Generates candidate remediation paths mapped to active hypotheses, ranked by evidence strength and operational appropriateness before simulation begins.",
  },
  {
    name: "Impact verification",
    desc: "Monitors post-execution recovery signals, confirms service stabilization, and detects secondary degradation introduced by the remediation action itself.",
  },
  {
    name: "Execution validation",
    desc: "Validates that approved actions were applied correctly, confirms execution state integrity, and records the full execution outcome for the audit trail.",
  },
];

function FoundationSection() {
  return (
    <SectionLayout
      label="Foundation"
      title="A governed orchestration layer for production systems"
      sublabel="Orchestration"
    >
      <div className="space-y-5 text-[14px] sm:text-[15px] text-black leading-relaxed mb-8">
        <p>
          During an incident, Scrubbe continuously ingests changes across code,
          CI/CD pipelines, infrastructure, observability systems, service
          topology, and deployment state. It normalizes those signals into a
          single operational context, dispatches specialized agents in parallel,
          correlates evidence across domains, and drives the incident decision
          loop from first detection through verified recovery.
        </p>
        <p>
          The platform is built for live production environments where
          correctness, auditability, and controlled execution matter as much as
          speed. Scrubbe does not optimize for the fastest possible action. It
          optimizes for the correct action, taken safely, with full
          traceability.
        </p>
      </div>

      <div className="border border-[#cdd9cd] rounded-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr] border-b border-[#cdd9cd] bg-[#eaf0ea]">
          <div className="px-4 sm:px-5 py-3 text-[11px] font-mono tracking-widest text-zinc-500">
            Agent
          </div>
          <div className="px-4 sm:px-5 py-3 text-[11px] font-mono tracking-widest text-zinc-500 border-l border-[#cdd9cd]">
            Responsibility boundary
          </div>
        </div>
        {agents.map((a, i) => (
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] border-b border-[#cdd9cd] last:border-0"
          >
            <div className="px-4 sm:px-5 pt-4 pb-1 sm:py-4 text-[13px] font-mono font-semibold text-black sm:border-r border-[#cdd9cd]">
              {a.name}
            </div>
            <div className="px-4 sm:px-5 pt-1 sm:pt-4 pb-4 text-[13px] sm:text-[14px] text-zinc-600 leading-relaxed">
              {a.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-l-4 border-emerald-500 bg-[#eaf0ea] rounded-r-md px-5 py-4">
        <p className="text-[13px] sm:text-[14px] text-black leading-relaxed">
          The platform does not treat agent output as final truth. It
          continuously reconciles agent findings against live production
          evidence, historical context, service topology, policy constraints,
          and execution risk before advancing the decision process.
        </p>
      </div>
    </SectionLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section 2 — Unified operational context
// ─────────────────────────────────────────────────────────────────

const signals = [
  "Recent code changes and commit history",
  "Deployment history and artifact versions",
  "CI/CD execution state and pipeline outcomes",
  "Service dependencies and topology",
  "Logs, traces, and metrics",
  "Infrastructure health and provisioning events",
  "Feature flags and configuration state",
  "Active incident evidence and hypothesis set",
  "Policy constraints and approval requirements",
  "Historical incident patterns and prior resolutions",
];

function UnifiedContextSection() {
  const left = signals.filter((_, i) => i % 2 === 0);
  const right = signals.filter((_, i) => i % 2 !== 0);

  return (
    <SectionLayout
      label="Context"
      title="Unified operational context"
      sublabel="Signal Normalization"
    >
      <div className="space-y-5 text-[14px] sm:text-[15px] text-black leading-relaxed mb-8">
        <p>
          Production incidents rarely fail inside one isolated system. Root
          causes usually span multiple layers of the stack — a deployment in one
          service, a configuration drift in another, a dependency degradation
          that has been slowly propagating for minutes before the first alert
          fires. Treating these as separate problems produces fragmented
          investigations. Scrubbe treats them as one.
        </p>
        <p>
          Scrubbe maintains a continuously updated operational context that
          combines every relevant signal from across the production environment
          into a single shared state. Every agent dispatched during an incident
          operates against this context rather than accessing systems
          independently. As new evidence arrives — a fresh metric anomaly, a
          newly resolved alert, a parallel deployment completing elsewhere in
          the stack — the platform immediately incorporates that signal and
          recalculates downstream reasoning.
        </p>
        <p>
          This means hypothesis rankings, blast radius assessments, and
          remediation confidence scores are never static. They reflect what the
          production environment actually looks like at the moment of each
          decision, not what it looked like when the incident first opened.
        </p>
      </div>

      <div className="border border-[#cdd9cd] rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#cdd9cd] bg-[#eaf0ea]">
          <p className="text-[11px] font-mono tracking-widest text-zinc-500">
            Unified operational context — signal sources
          </p>
        </div>
        {/* Mobile: single column */}
        <div className="sm:hidden divide-y divide-[#cdd9cd]">
          {signals.map((s, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[13px] text-black">{s}</span>
            </div>
          ))}
        </div>
        {/* Desktop: two columns */}
        <div className="hidden sm:grid grid-cols-2">
          <div className="border-r border-[#cdd9cd]">
            {left.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-4 border-b border-[#cdd9cd] last:border-b-0"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[14px] text-black">{s}</span>
              </div>
            ))}
          </div>
          <div>
            {right.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-4 border-b border-[#cdd9cd] last:border-b-0"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[14px] text-black">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section 3 — Parallel investigation
// ─────────────────────────────────────────────────────────────────

const orchestrationSteps = [
  {
    n: "01",
    title: "Correlate evidence across domains",
    desc: "Agent outputs from code, deployment, runtime, and dependency domains are correlated against each other and against the live operational context rather than evaluated in isolation.",
  },
  {
    n: "02",
    title: "Resolve conflicting signals",
    desc: "When agents return contradictory findings — a deployment agent pointing to a configuration change while a runtime agent points to a resource saturation — the orchestration engine weighs each against the full evidence set and resolves the conflict explicitly rather than deferring it.",
  },
  {
    n: "03",
    title: "Rank competing root-cause hypotheses",
    desc: "All plausible explanations for the observed failure are ranked by confidence score — a function of timing, service locality, failure pattern alignment, dependency propagation, and similarity to prior incidents — and maintained as a ranked set that persists through the full decision loop.",
  },
  {
    n: "04",
    title: "Map remediation candidates to operational risk",
    desc: "Each proposed remediation is assessed for its projected blast radius, recovery probability, execution risk, and reversibility before it is considered for policy evaluation. Candidates that carry unacceptable risk profiles are surfaced but not advanced.",
  },
  {
    n: "05",
    title: "Determine which path advances to policy evaluation",
    desc: "Only the remediation candidate that best satisfies the current evidence, risk, and operational constraints is advanced to the policy gate. All other candidates remain ranked and available for immediate activation if the chosen path fails or is blocked.",
  },
];

function ParallelInvestigationSection() {
  return (
    <SectionLayout
      label="Architecture"
      title="Parallel investigation, single decision path"
      sublabel="Orchestration Model"
    >
      <div className="space-y-5 text-[14px] sm:text-[15px] text-black leading-relaxed mb-8">
        <p>
          Speed matters during incidents, but parallelism without coordination
          creates noise. When multiple agents investigate independently and
          return conflicting signals without a central authority to reconcile
          them, the result is not faster resolution — it is a wider disagreement
          about what is actually wrong. Scrubbe separates parallel investigation
          from centralized orchestration to avoid this failure mode entirely.
        </p>
        <p>
          Multiple agents investigate independently and simultaneously across
          their respective domains. The orchestration engine runs separately and
          continuously above them, collecting their outputs, reconciling
          conflicts, and advancing the decision process through a single
          coherent path. No agent output is accepted as truth and forwarded to
          execution without passing through this central reconciliation layer.
        </p>
        <p>
          This architecture allows Scrubbe to scale investigation depth without
          proportionally increasing the complexity of the decision process.
          Adding another agent does not fragment the decision path. The
          orchestration engine absorbs the new input and continues to produce
          one operationally coherent output.
        </p>
      </div>

      <div className="border border-[#cdd9cd] rounded-sm overflow-hidden divide-y divide-[#cdd9cd]">
        {orchestrationSteps.map((s) => (
          <div key={s.n} className="grid grid-cols-1 sm:grid-cols-[64px_1fr]">
            <div className="px-4 sm:px-0 sm:flex sm:items-start sm:justify-center pt-4 sm:pt-5 pb-0 sm:pb-5">
              <span className="text-[12px] font-mono text-black">{s.n}</span>
            </div>
            <div className="px-4 sm:px-6 pt-2 sm:pt-5 pb-5 sm:border-l border-[#cdd9cd]">
              <p className="text-[13px] sm:text-[14px] font-mono font-semibold text-black mb-2">
                {s.title}
              </p>
              <p className="text-[13px] sm:text-[14px] text-zinc-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section 4 — Policy-governed execution
// ─────────────────────────────────────────────────────────────────

const policies = [
  {
    title: "Environment sensitivity",
    desc: "Production, staging, and pre-production environments carry different policy thresholds. Actions permissible in lower environments may require explicit approval or be blocked outright in production.",
  },
  {
    title: "Incident severity",
    desc: "Higher-severity incidents may unlock additional autonomous action authority, or may conversely require more stringent approval chains depending on organizational policy configuration.",
  },
  {
    title: "Service criticality",
    desc: "Services above a configured criticality tier require human approval for any remediation action, regardless of confidence score, blast radius assessment, or incident severity classification.",
  },
  {
    title: "Blast radius threshold",
    desc: "Actions whose projected operational impact exceeds the configured blast radius limit are escalated for approval or blocked, even when the action's evidence chain is strong and reversibility is high.",
  },
  {
    title: "Remediation confidence",
    desc: "A minimum confidence threshold must be met before any autonomous execution is permitted. Candidates below the threshold are surfaced as options for human-initiated action rather than autonomous execution.",
  },
  {
    title: "Reversibility",
    desc: "Actions with low reversibility scores — those that are difficult or impossible to undo cleanly — carry additional policy weight and typically require explicit approval regardless of other conditions.",
  },
  {
    title: "Change freeze windows",
    desc: "Active change freeze periods prohibit autonomous execution entirely. During a freeze, Scrubbe continues to investigate, rank hypotheses, and prepare remediation options — but all execution requires explicit human authorization.",
  },
  {
    title: "Approval requirements",
    desc: "Specific action types, service tiers, or environment combinations may require approval from a named team lead, on-call engineer, or defined approval chain before execution is permitted.",
  },
];

function PolicySection() {
  return (
    <SectionLayout
      label="Governance"
      title="Policy-governed execution"
      sublabel="Execution Policy"
    >
      <div className="space-y-5 text-[14px] sm:text-[15px] text-black leading-relaxed mb-8">
        <p>
          The platform does not execute actions simply because a likely fix
          exists. A high-confidence hypothesis and a well-evidenced remediation
          candidate are necessary conditions for execution, but they are not
          sufficient ones. Every proposed remediation passes through policy
          evaluation before execution is permitted, regardless of how strong the
          evidence is or how low the assessed risk appears.
        </p>
        <p>
          Execution policy in Scrubbe is not a single boolean gate. It is a
          structured evaluation against a configurable set of governance rules
          that reflect the operational constraints of the organization running
          the platform. A remediation that is appropriate for a staging
          environment may be prohibited in production. An action with a low
          blast radius may still require human approval for services above a
          certain criticality tier. Policy captures all of these distinctions
          explicitly, and every evaluation is recorded in full.
        </p>
        <p>
          Only when all applicable policy conditions are satisfied does Scrubbe
          allow execution to proceed. That is how the platform supports
          autonomous incident response without giving up the operational control
          that production environments require.
        </p>
      </div>

      <div className="border border-[#cdd9cd] rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#cdd9cd] bg-[#eaf0ea]">
          <p className="text-[11px] font-mono tracking-widest text-zinc-500">
            Execution policy — evaluated conditions
          </p>
        </div>
        {/* Mobile: single col */}
        <div className="sm:hidden divide-y divide-[#cdd9cd]">
          {policies.map((p, i) => (
            <div key={i} className="px-5 py-5">
              <p className="text-[13px] font-mono font-semibold text-black mb-2">
                {p.title}
              </p>
              <p className="text-[13px] text-zinc-600 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
        {/* Desktop: two col grid */}
        <div className="hidden sm:grid grid-cols-2 divide-y divide-[#cdd9cd]">
          {Array.from({ length: Math.ceil(policies.length / 2) }).map(
            (_, row) => (
              <div key={row} className="contents">
                {policies.slice(row * 2, row * 2 + 2).map((p, col) => (
                  <div
                    key={col}
                    className={`px-5 py-5 ${
                      col === 0 ? "border-r border-[#cdd9cd]" : ""
                    }`}
                  >
                    <p className="text-[13px] font-mono font-semibold text-black mb-2">
                      {p.title}
                    </p>
                    <p className="text-[14px] text-zinc-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </SectionLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section 5 — Controlled execution and verification
// ─────────────────────────────────────────────────────────────────

const executionSteps = [
  {
    n: "01",
    title: "Pre-execution state capture",
    desc: "A full snapshot of the current system state is captured and committed to the incident record before any change is applied. This snapshot is the baseline against which rollback is executed if the action does not produce recovery.",
  },
  {
    n: "02",
    title: "Idempotency safeguards",
    desc: "Each execution is keyed against a combination of the incident identifier and action identifier. Duplicate execution attempts triggered by network interruptions or system failures are intercepted and suppressed before they reach production systems.",
  },
  {
    n: "03",
    title: "Rollback pathways",
    desc: "Every action has an associated rollback pathway defined before execution begins. If verification confirms that the action did not produce recovery, rollback can be initiated immediately without requiring a new remediation planning cycle.",
  },
  {
    n: "04",
    title: "Timeout protections",
    desc: "Execution steps are time-bounded. If an action does not complete within the expected window, Scrubbe surfaces the timeout, initiates rollback evaluation, and prevents the system from being left in a partially applied state.",
  },
  {
    n: "05",
    title: "Execution audit trails",
    desc: "Every step of execution — start time, parameters applied, system responses, completion time, and final state — is committed to the audit trail in real time. The execution record is permanent, structured, and replayable for retrospective review or compliance audit.",
  },
];

function ExecutionSection() {
  return (
    <SectionLayout
      label="Execution"
      title="Controlled execution and verification"
      sublabel="Execution Layer"
    >
      <div className="space-y-5 text-[14px] sm:text-[15px] text-black leading-relaxed mb-8">
        <p>
          When remediation is approved, the platform executes through controlled
          adapters connected to production systems. Execution is not a
          fire-and-forget operation. It is a guarded sequence of steps designed
          to ensure that every change applied to the production environment is
          observable in real time, reversible if needed, and permanently
          attributable to its incident and approver.
        </p>
        <p>
          After execution completes, Scrubbe does not assume success. The
          platform immediately verifies recovery against live production
          signals, checking whether error rates have normalized, whether latency
          has returned to baseline, whether resource utilization is stabilizing,
          and whether any secondary degradation has been introduced as a
          consequence of the remediation action. Service stabilization is
          confirmed before the incident is closed. If verification fails — if
          the action did not produce the expected recovery — the platform
          re-enters the decision cycle with the updated evidence rather than
          terminating prematurely.
        </p>
      </div>

      <div className="border border-[#cdd9cd] rounded-sm overflow-hidden divide-y divide-[#cdd9cd]">
        {executionSteps.map((s) => (
          <div key={s.n} className="grid grid-cols-1 sm:grid-cols-[64px_1fr]">
            <div className="px-4 sm:px-0 sm:flex sm:items-start sm:justify-center pt-4 sm:pt-5 pb-0 sm:pb-5">
              <span className="text-[12px] font-mono text-black">{s.n}</span>
            </div>
            <div className="px-4 sm:px-6 pt-2 sm:pt-5 pb-5 sm:border-l border-[#cdd9cd]">
              <p className="text-[13px] sm:text-[14px] font-mono font-semibold text-black mb-2">
                {s.title}
              </p>
              <p className="text-[13px] sm:text-[14px] text-zinc-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────────────────────────

export default function DocSections() {
  return (
    <main>
      <FoundationSection />
      <UnifiedContextSection />
      <ParallelInvestigationSection />
      <PolicySection />
      <ExecutionSection />
    </main>
  );
}
