// lib/icp/panel-notes.ts

export interface PanelNote {
    title: string;
    tag: string;
    stats: { label: string; value: string; delta: string; color: string }[];
    note: string;
    ctx: string;
}

export const PANEL_NOTES: Record<string, PanelNote> = {
    learning: {
        title: "Learning Overview Dashboard",
        tag: "Closed-loop learning across the whole platform",
        stats: [
            { label: "MTTR Improvement", value: "32.8%", delta: "↑ vs 30d", color: "#06A663" },
            { label: "Autonomous Success", value: "89.3%", delta: "↑ 6.7%", color: "#06A663" },
            { label: "Incidents Resolved", value: "156", delta: "↑ 18.4%", color: "#0F172A" },
            { label: "Override Rate", value: "8.7%", delta: "↓ 3.1%", color: "#A855F7" },
        ],
        ctx: "MTTR improvement 32.8%, autonomous success 89.3%, 156 incidents resolved, override 8.7%; top categories Performance 28% / Deploy 22%; best remediations Restart 92% / Rollback 91%.",
        note: "The Learning Overview is the platform's scorecard: every tile and chart here is a downstream effect of the same closed loop, where resolved incidents are written back as knowledge and feed the next proposal. The headline is that resolution time is falling while volume rises — the system is absorbing more load without a matching rise in human effort. Autonomous success near ninety percent against a falling override rate confirms it is acting more often and acting correctly more often at once.\n\nRead the category mix as your roadmap: Performance and Deployment together are half of all incidents, so pre-deploy checks and reliability work return the most leverage there. The remediation success bars are not just a scoreboard — they directly set the confidence that gates autonomous execution, which is how a consistently strong remediation safely earns a higher automation stage.",
    },
    remediation: {
        title: "Remediation Intelligence",
        tag: "Success, risk and the actions the system trusts",
        stats: [
            { label: "Overall Success", value: "87.6%", delta: "↑ 7.3pts", color: "#06A663" },
            { label: "High-risk Ops", value: "4", delta: "guardrailed", color: "#B45309" },
            { label: "Top Action", value: "Restart Svc", delta: "92%", color: "#06A663" },
            { label: "Highest Risk", value: "DB Failover", delta: "24%", color: "#DC2626" },
        ],
        ctx: "Overall remediation success 87.6% (+7.3pts). Top: Restart 92%, Rollback 91%, Scale Up 87%. Highest risk: DB Failover 24%, Schema Change 18%, Full Cache Flush 16%.",
        note: "This panel answers two questions at once: which remediations the system can be trusted to run, and which it must be restrained from. Overall success at 87.6% is up over seven points, driven by the outcome write-back loop sharpening proposals over time. The top actions — Restart and Rollback — are the workhorses precisely because they are reversible and clean, which is why they carry the highest automation stages.\n\nThe risk column is the more important half. A high failure rate is not just informational: it is the trigger that forces an action above the 20% threshold into mandatory approval with a passing blast-radius check, so a Schema Change or DB Failover can never slip through on autopilot. Use the By Service and By Environment lenses to see where residual failures concentrate — they almost always cluster around a small number of high-blast-radius operations rather than spreading evenly.",
    },
    governance: {
        title: "Governance Dashboard",
        tag: "Every autonomous action, evaluated against versioned policy",
        stats: [
            { label: "Policy Compliance", value: "96.2%", delta: "↑ 2.4%", color: "#06A663" },
            { label: "Autonomous Actions", value: "312", delta: "↑ 23.1%", color: "#0F172A" },
            { label: "Approved", value: "284", delta: "91.0%", color: "#06A663" },
            { label: "Denied / Violations", value: "28 / 5", delta: "↓ 37.5%", color: "#DC2626" },
        ],
        ctx: "Policy compliance 96.2% (+2.4pts). 312 autonomous actions, 284 approved (91%), 28 denied, 5 policy violations (down 37.5%).",
        note: "Governance is what makes autonomy defensible rather than reckless. Compliance at 96.2% means almost every action — autonomous or manual — was evaluated against an explicit, versioned policy and passed. The 3.8% gap is not unaccounted action; it is where guardrails correctly denied or escalated, which is the system working as designed.\n\nThe decisive property here is auditability: every figure on this panel is reconstructable from the append-only audit trail, each entry stamped with the exact policy version in force at decision time. That is what lets you defend the compliance number to a security or compliance reviewer rather than merely asserting it.",
    },
    eal: {
        title: "EAL Distribution & Autonomy Posture",
        tag: "How much the system is trusted to do on its own",
        stats: [
            { label: "At EAL 3+", value: "60.9%", delta: "↑ from 48%", color: "#06A663" },
            { label: "EAL 4 (Full Auto)", value: "28", delta: "↑ 33%", color: "#A855F7" },
            { label: "EAL 0–1 (Manual)", value: "20", delta: "novel only", color: "#B45309" },
            { label: "Net Posture", value: "Expanding", delta: "within policy", color: "#06A663" },
        ],
        ctx: "60.9% of incidents handled at EAL 3+, up from 48%. EAL 3 (Conditional Auto) 42.9%, EAL 4 (Full Auto) 18% / up 33%. EAL 0–1 reserved for novel incidents.",
        note: "EAL — the Effective Automation Level — is the single number that captures how much the platform is trusted to act without a human. Today 60.9% of incidents resolve at EAL 3 or above, up from 48% a month ago, with the Full-Auto tier growing a third as the learning loop validated new playbook classes against the blast-radius model.\n\nThe mechanism to keep in mind is that the effective level is always the strictest of three independent limits: what the playbook is rated for, what policy permits, and what the live risk classifier computes for this specific incident. Any one of them can pull the level down, and none can be overridden upward without explicit policy approval. That is why an expanding posture here is safe to celebrate — it reflects earned trust under a ceiling, not a relaxation of control.",
    },
    slo: {
        title: "SLO Health & Error Budget",
        tag: "Where reliability targets and burn rate stand",
        stats: [
            { label: "Services Tracked", value: "6", delta: "", color: "#0F172A" },
            { label: "Healthy", value: "4", delta: "", color: "#06A663" },
            { label: "At Risk", value: "1", delta: "burn > 2.5×", color: "#B45309" },
            { label: "Breached", value: "1", delta: "budget spent", color: "#DC2626" },
        ],
        ctx: "6 services tracked. Search Service breached (budget -0.8h, burn 4.2×). Payment API at risk (burn 3.1×). Others healthy.",
        note: "This panel reframes reliability as a budget rather than a binary. Each service has an error budget — the headroom its SLO target permits — and a burn rate showing how fast that headroom is being spent. Most services sit comfortably, but Search Service has already gone negative and Payment API is burning above the 2.5× alert threshold.\n\nBurn rate matters more than the point-in-time percentage because it is predictive: a service can be within its SLO today and still be on track to breach by the weekend. The right operator move is to treat the two flagged services as change-freeze candidates until their burn drops back under threshold.",
    },
    cost: {
        title: "Cost & Engineering Efficiency",
        tag: "The financial case for autonomy",
        stats: [
            { label: "Engineer Hours Saved", value: "1,840h", delta: "↑ 22.3%", color: "#06A663" },
            { label: "Cost Avoidance", value: "$218K", delta: "↑ 31.4%", color: "#06A663" },
            { label: "Avg Resolution Cost", value: "$94", delta: "↓ $41", color: "#06A663" },
            { label: "ROI on Automation", value: "6.2×", delta: "↑ 0.9×", color: "#A855F7" },
        ],
        ctx: "1,840 engineer-hours saved (+22.3%), $218K cost avoidance (+31.4%), avg resolution cost $94 (down $41 vs manual), ROI 6.2×.",
        note: "This panel translates operational gains into money, which is the language that funds the platform. Engineer hours saved and cost avoidance both climbed over twenty percent, while the average cost to resolve an incident fell well below the manual baseline. The combined 6.2× return is the number most useful outside engineering — it converts MTTR and autonomy charts into a finance argument a board will act on.\n\nThe category bars double as a prioritisation signal: where hours-saved has plateaued, the cause is usually an incident class that has no authored playbook yet. A targeted knowledge-artifact effort on those categories closes the gap faster and more cheaply than any model change.",
    },
    orch: {
        title: "Orchestration Evolution",
        tag: "How learned workflow changes compound over time",
        stats: [
            { label: "MTTR Improvement", value: "~58%", delta: "vs baseline", color: "#06A663" },
            { label: "Efficiency Gain", value: "~50%", delta: "vs baseline", color: "#3B82F6" },
            { label: "Expected MTTR ↓", value: "23.6%", delta: "projected", color: "#06A663" },
            { label: "Improvements Live", value: "3/5", delta: "rolled out", color: "#0F172A" },
        ],
        ctx: "MTTR improvement ~58% vs baseline, efficiency gain ~50%. 23.6% further MTTR reduction expected. 3 of 5 improvements rolled out, 1 testing, 1 proposed.",
        note: "Orchestration evolution is the compounding effect of the learning loop: each resolved incident generates a knowledge artifact, each artifact sharpens the next proposal, and each confirmed improvement becomes a permanent workflow change. The result is a ratchet — gains are held, not reverted, and new improvements stack on top of old ones.\n\nThe Current vs Optimized Flow visualisation captures the net effect: the escalation step has been eliminated entirely by the auto-triage improvement, removing a full human handoff from the critical path. The projected 23.6% further MTTR reduction comes from the two improvements still in testing and proposed stages — if they validate, the ratchet tightens again.",
    },
    agents: {
        title: "Agent Intelligence",
        tag: "Per-agent accuracy, throughput and learning trajectory",
        stats: [
            { label: "Fleet Health", value: "90.4%", delta: "↑ 4.2%", color: "#06A663" },
            { label: "Top Agent", value: "Triage", delta: "94%", color: "#02DD82" },
            { label: "Total Tasks", value: "1,581", delta: "across 6 agents", color: "#0F172A" },
            { label: "Lowest Accuracy", value: "Code Analysis", delta: "87%", color: "#22D3EE" },
        ],
        ctx: "Fleet health 90.4% (+4.2%). 6 agents, all healthy. Triage 94%, Root Cause 92%, Remediation 93%, Code Analysis 87% (steepest improvement curve).",
        note: "All six agents show positive accuracy trajectories, which is the fundamental health signal for the intelligence layer. Incident Triage leads at 94%, having gained six points over the window, and Remediation Agent sits close behind at 93% — these two are the bookends of the autonomous pipeline, so their combined strength is what makes end-to-end auto-resolution viable.\n\nCode Analysis trails at 87% but shows the steepest improvement curve, suggesting rapid learning from newly encountered code patterns. The right reading is not concern but opportunity: this is the agent with the most headroom, and targeted investment in its training data would lift the weakest link in the chain. No agent currently requires intervention or retraining outside the normal learning cycle.",
    },
};