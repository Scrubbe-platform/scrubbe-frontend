// lib/icp/chart-notes.ts

export const CHART_NOTES: Record<string, { title: string; tag: string; note: string }> = {
    mttr: {
        title: "MTTR Trend",
        tag: "Mean time to resolution · last 30 days",
        note: "Mean time to resolution has trended steadily downward across the window, falling from roughly forty hours to about fifteen. The green trend line confirms the decline is structural rather than noise, with each dip being held rather than reverting. This tracks closely with the rise in autonomous remediation success. The occasional upward spikes correspond to novel incident types the playbooks have not yet learned, where the orchestrator falls back to slower, human-paced resolution.",
    },
    categories: {
        title: "Top Recurring Incident Categories",
        tag: "Share of incidents by category",
        note: "Performance degradation is the single largest source of incidents at 28%, with deployment- and release-related issues close behind at 22%. Together these two categories account for half of all incidents, which is precisely where orchestration improvements and pre-deploy checks will return the most leverage. The shape of this distribution is a good sign: no single category dominates so heavily that it masks systemic problems elsewhere.",
    },
    effective: {
        title: "Most Effective Remediations",
        tag: "Success rate by remediation type",
        note: "Restart Service and Rollback Deployment are the workhorses of the remediation library, succeeding 92% and 91% of the time. These rates feed directly into the confidence scores that gate autonomous execution. A remediation with a consistently high success rate earns a higher automation stage, which is how the system safely widens what it is allowed to do on its own.",
    },
    cluster: {
        title: "Similar Incident Clusters",
        tag: "Vector-embedded incident similarity",
        note: "Each point is an incident embedded by similarity, so tight clusters represent recurring, well-understood failure patterns while scattered points are genuinely novel events. The dominant cluster is the recurring class the system has seen most — likely the performance-degradation incidents. The smaller, looser groupings are where human review still adds the most value.",
    },
    remDonut: {
        title: "Remediation Success Rate",
        tag: "Overall autonomous + assisted success",
        note: "Overall remediation success sits at 87.6%, up 7.3 points over the prior thirty days. The remaining twelve percent is not all failure: a good portion is deliberately conservative blocks where guardrails halted on uncertainty rather than risked an unsafe action. The combination to watch is a rising success rate alongside a falling human override rate, and that is exactly what is happening here.",
    },
    compliance: {
        title: "Policy Compliance",
        tag: "Overall policy compliance rate",
        note: "Policy compliance sits at 96.2%, up 2.4 points. Five policy violations were recorded this period, down 37.5% from the prior window. The remaining violations are concentrated in the Risk-Guardrail policy, where novel incident types occasionally trigger actions before coverage is complete.",
    },
    ealTrend: {
        title: "EAL Transition Trend",
        tag: "Effective Automation Level distribution over time",
        note: "60.9% of incidents are now handled at EAL 3 or above — autonomously or conditionally automated — up from 48% thirty days ago. EAL 4 headcount grew 33% as the learning loop validated new playbook classes against the blast-radius model. EAL 0 and 1 are reserved for novel incident types where precedent is insufficient.",
    },
    sloBurn: {
        title: "Error Budget Burn Rate",
        tag: "SLO error budget consumption over 7 days",
        note: "Payment API and Search Service are burning error budget fastest. Search Service has already breached its SLO, burning at 4.2x — well above the 2.5x alert threshold. Payment API is trending toward breach if the current trajectory holds. Checkout Service remains well within budget at 0.42x burn rate.",
    },
    costTrend: {
        title: "Monthly Cost Avoidance Trend",
        tag: "Autonomous savings and reduced escalations",
        note: "Autonomous cost avoidance has grown from $62K to $198K over eight months — a 3.2x increase driven by the compounding effect of the learning loop. Reduced escalations contribute an additional $52K monthly, reflecting fewer incidents requiring senior engineering attention.",
    },
    orchTrend: {
        title: "Workflow Evolution Over Time",
        tag: "Orchestration improvement metrics",
        note: "MTTR improvement and efficiency gain have both trended upward steadily, with MTTR improvement leading at 32% and efficiency gain at 28%. The gap between the two is narrowing, suggesting that workflow optimizations are becoming more broadly applicable across incident types.",
    },
    agentAcc: {
        title: "Agent Accuracy Over Time",
        tag: "Per-agent accuracy trends",
        note: "All six agents show positive accuracy trajectories. Incident Triage Agent leads at 94%, having gained 6 points over the window. Code Analysis Agent trails at 87% but shows the steepest improvement curve, suggesting rapid learning from newly encountered code patterns.",
    },
    agentHealth: {
        title: "Agent Health",
        tag: "Fleet-wide agent health score",
        note: "90.4% fleet health with all six agents in a healthy state. The 4.2% improvement reflects both accuracy gains and reduced latency drift. No agent currently requires intervention or retraining outside the normal learning cycle.",
    },
    costBars: {
        title: "Engineer Hours Saved by Category",
        tag: "Breakdown of autonomous time savings",
        note: "Performance degradation incidents account for the largest share of saved engineer hours at 520h, reflecting the high frequency and well-understood remediation patterns for this category. Deployment and release incidents follow at 410h, driven primarily by automated rollback success rates above 90%. The long tail of infrastructure and configuration savings is growing as the playbook library expands into less common incident types.",
    },
};