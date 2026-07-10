import { ActionGroup, CondGroup, FieldDef } from "./type";


export const VT = {
    SELECT: "select" as const,
    TEXT: "text" as const,
    NUM: "num" as const,
    PRIORITY: "priority" as const,
    DAYS: "days" as const,
    TIMERANGE: "timerange" as const,
    DURATION: "duration" as const,
    BOOL: "bool" as const,
}

export const FIELDS = {
    service: {
        label: "Service",
        ops: ["equals", "not equals", "is any of"],
        val: {
            type: VT.SELECT,
            options: [
                "Checkout Service",
                "Payments Service",
                "Search Service",
                "Auth Service",
                "Cart Service",
                "Inventory Service",
            ],
        },
    },
    priority: {
        label: "Priority",
        ops: ["equals", "greater or equal", "less or equal", "not equals"],
        val: { type: VT.PRIORITY },
    },
    status: {
        label: "Status",
        ops: ["equals", "not equals"],
        val: {
            type: VT.SELECT,
            options: [
                "Detected",
                "Triaged",
                "Investigating",
                "Mitigating",
                "Resolved",
                "Monitoring",
            ],
        },
    },
    category: {
        label: "Category",
        ops: ["equals", "not equals"],
        val: {
            type: VT.SELECT,
            options: [
                "Availability",
                "Performance",
                "Security",
                "Data",
                "Configuration",
            ],
        },
    },
    environment: {
        label: "Environment",
        ops: ["equals", "not equals"],
        val: { type: VT.SELECT, options: ["Production", "Staging", "Development"] },
    },
    team: {
        label: "Team",
        ops: ["equals", "is any of"],
        val: {
            type: VT.SELECT,
            options: ["Platform Engineering", "Payments", "SRE", "Security", "Data"],
        },
    },
    health: {
        label: "Service Health",
        ops: ["equals", "not equals"],
        val: {
            type: VT.SELECT,
            options: ["Healthy", "Degraded", "Down", "Degraded or Down"],
        },
    },
    riskScore: {
        label: "Risk Score",
        ops: ["greater or equal", "greater than", "less than"],
        val: { type: VT.NUM, placeholder: "e.g. 70" },
    },
    sloBreach: { label: "SLO Breach", ops: ["is"], val: { type: VT.BOOL } },
    timeOfDay: {
        label: "Time of Day",
        ops: ["outside", "between", "equals"],
        val: { type: VT.TIMERANGE },
        hint: "Matches incidents in the specified time window.",
    },
    businessHours: {
        label: "Business Hours",
        ops: ["is"],
        val: { type: VT.BOOL },
        hint: "Evaluates against the configured business-hours calendar.",
    },
    dayOfWeek: {
        label: "Day of Week",
        ops: ["is any of", "is not"],
        val: { type: VT.DAYS },
        hint: "Matches incidents on the selected days.",
    },
    acknowledged: {
        label: "Incident Acknowledged",
        ops: ["is"],
        val: { type: VT.BOOL },
    },
    notAckFor: {
        label: "Incident Not Acknowledged",
        ops: ["for more than", "for at least"],
        val: { type: VT.DURATION },
        hint: "Unacknowledged for the specified duration.",
    },
    incidentAge: {
        label: "Incident Age",
        ops: ["more than", "less than"],
        val: { type: VT.DURATION },
        hint: "How long the incident has been open.",
    },
    motherExists: {
        label: "Mother Incident",
        ops: ["exists", "does not exist"],
        val: { type: VT.BOOL, fixed: true },
    },
    childExists: {
        label: "Child Incident",
        ops: ["exists", "does not exist"],
        val: { type: VT.BOOL, fixed: true },
    },
    childCount: {
        label: "Child Incident Count",
        ops: ["greater than", "greater or equal", "equals"],
        val: { type: VT.NUM, placeholder: "e.g. 5" },
    },
    affectedServices: {
        label: "Affected Services",
        ops: ["greater than", "greater or equal"],
        val: { type: VT.NUM, placeholder: "e.g. 3" },
    },
    similarFound: {
        label: "Similar Incident Found",
        ops: ["is"],
        val: { type: VT.BOOL },
    },
    knownResolution: {
        label: "Known Resolution Exists",
        ops: ["is"],
        val: { type: VT.BOOL },
    },
    knownRisk: {
        label: "Known Risk",
        ops: ["exists", "does not exist"],
        val: { type: VT.BOOL, fixed: true },
    },
    problemRecord: {
        label: "Open Problem Record",
        ops: ["exists", "does not exist"],
        val: { type: VT.BOOL, fixed: true },
    },
    ezraConfidence: {
        label: "Ezra Confidence",
        ops: ["less than", "less or equal", "greater or equal", "greater than"],
        val: { type: VT.NUM, placeholder: "e.g. 80", unit: "%" },
        hint: "Ezra's diagnostic confidence, 0–100%.",
    },
    rootCauseType: {
        label: "Root Cause Type",
        ops: ["equals", "not equals", "is any of"],
        val: {
            type: VT.SELECT,
            options: [
                "Deployment",
                "Configuration",
                "Infrastructure",
                "Capacity",
                "Dependency",
                "Data",
                "Unknown",
            ],
        },
    },
    rootCauseCount: {
        label: "Number of Root Causes",
        ops: ["equals", "greater than", "greater or equal"],
        val: { type: VT.NUM, placeholder: "e.g. 1" },
    },
    investigationDuration: {
        label: "Investigation Duration",
        ops: ["for more than", "for at least", "less than"],
        val: { type: VT.DURATION },
        hint: "How long agents have been investigating.",
    },
    evidenceQuality: {
        label: "Evidence Quality",
        ops: ["equals", "not equals", "is any of"],
        val: {
            type: VT.SELECT,
            options: ["High", "Medium", "Low", "Insufficient"],
        },
    },
    contradictoryFindings: {
        label: "Contradictory Findings",
        ops: ["is"],
        val: { type: VT.BOOL },
        hint: "Agents surfaced conflicting evidence.",
    },
    remediationRisk: {
        label: "Remediation Risk",
        ops: ["equals", "is any of", "not equals"],
        val: { type: VT.SELECT, options: ["Low", "Medium", "High", "Critical"] },
    },
    remediationConfidence: {
        label: "Remediation Confidence",
        ops: ["less than", "less or equal", "greater or equal", "greater than"],
        val: { type: VT.NUM, placeholder: "e.g. 90", unit: "%" },
        hint: "Confidence in the proposed remediation.",
    },
    rollbackAvailable: {
        label: "Rollback Available",
        ops: ["is"],
        val: { type: VT.BOOL },
        hint: "A safe rollback path exists.",
    },
    blastRadius: {
        label: "Blast Radius",
        ops: ["greater than", "greater or equal", "less than", "less or equal"],
        val: { type: VT.NUM, placeholder: "e.g. 10", unit: "services" },
        hint: "Services within the computed blast radius.",
    },
    executionType: {
        label: "Execution Type",
        ops: ["equals", "not equals", "is any of"],
        val: {
            type: VT.SELECT,
            options: ["Autonomous", "Semi-autonomous", "Manual", "Approval-gated"],
        },
    },
    revenueImpact: {
        label: "Revenue at Risk",
        ops: ["greater or equal", "greater than", "less than"],
        val: { type: VT.NUM, placeholder: "e.g. 50000", unit: "£/hr" },
        hint: "Estimated revenue exposure per hour.",
    },
    customerImpact: {
        label: "Affected Users",
        ops: ["greater than", "greater or equal", "less than"],
        val: { type: VT.NUM, placeholder: "e.g. 100000" },
        hint: "Estimated impacted end users.",
    },
    slaBreachRisk: {
        label: "SLA Breach Risk",
        ops: ["equals", "is any of", "not equals"],
        val: {
            type: VT.SELECT,
            options: ["None", "At risk", "Imminent", "Breached"],
        },
    },
    complianceRisk: {
        label: "Compliance Risk",
        ops: ["equals", "is any of", "not equals"],
        val: {
            type: VT.SELECT,
            options: ["None", "Low", "Elevated", "High", "Regulatory"],
        },
    },
    serviceTier: {
        label: "Service Tier",
        ops: ["equals", "not equals", "is any of"],
        val: { type: VT.SELECT, options: ["Tier-1", "Tier-2", "Tier-3"] },
    },
    requiredApprovals: {
        label: "Required Approvals",
        ops: ["equals", "is any of", "not equals"],
        val: {
            type: VT.SELECT,
            options: [
                "Auto-approved",
                "Manager approval",
                "Multi-stage approval",
                "CAB approval",
                "Emergency CAB (eCAB)",
                "Executive approval",
            ],
        },
        hint: "The approval level a remediation must clear.",
    },
    changeType: {
        label: "Change Type",
        ops: ["equals", "is any of", "not equals"],
        val: {
            type: VT.SELECT,
            options: [
                "Standard change",
                "Normal change",
                "Pre-approved change",
                "Emergency change",
            ],
        },
        hint: "ITIL-style change classification.",
    },
    changeWindow: {
        label: "Change Window",
        ops: ["equals", "is any of", "not equals"],
        val: {
            type: VT.SELECT,
            options: [
                "Inside business hours",
                "Outside business hours",
                "Maintenance window",
                "Pre-approved window",
                "Change freeze",
            ],
        },
        hint: "The window in which the change would execute.",
    },
    emergencyOverride: {
        label: "Emergency Override",
        ops: ["is"],
        val: { type: VT.BOOL },
        hint: "An eCAB emergency override has been granted.",
    },
} satisfies Record<string, FieldDef>;

export const ACTIONS = {
    createIncident: {
        name: "Create Incident",
        detail: "Priority: Same as triggering event",
        group: "Incident",
    },
    updateIncident: {
        name: "Update Incident",
        detail: "Set status to Investigating",
        group: "Incident",
    },
    escalateIncident: {
        name: "Escalate Incident",
        detail: "Escalate to Platform Engineering",
        group: "Incident",
    },
    closeIncident: {
        name: "Close Incident",
        detail: "Resolution: Auto-resolved",
        group: "Incident",
    },
    startWarRoom: {
        name: "Start War Room",
        detail: "War Room Type: Incident Response",
        group: "War Room",
    },
    addResponders: {
        name: "Add Responders",
        detail: "On-call + service owners",
        group: "War Room",
    },
    assignCommander: {
        name: "Assign Commander",
        detail: "Senior on-call engineer",
        group: "War Room",
    },
    assignTeam: {
        name: "Assign Team",
        detail: "Team: Platform Engineering (On-call)",
        group: "War Room",
    },
    attachPlaybook: {
        name: "Attach Playbook",
        detail: "Playbook: Checkout Service Failure",
        group: "Playbook",
    },
    recommendPlaybook: {
        name: "Recommend Playbook",
        detail: "Suggest top-ranked playbook",
        group: "Playbook",
    },
    executePlaybook: {
        name: "Execute Playbook",
        detail: "Run within approved automation level",
        group: "Playbook",
    },
    searchSimilar: {
        name: "Search Similar Incidents",
        detail: "Attach findings to incident",
        group: "Knowledge",
    },
    attachResolutions: {
        name: "Attach Previous Resolutions",
        detail: "Top 3 prior resolutions",
        group: "Knowledge",
    },
    attachRca: {
        name: "Attach Previous RCA",
        detail: "Linked root-cause analyses",
        group: "Knowledge",
    },
    attachRisks: {
        name: "Attach Open Risks",
        detail: "Known risks for the service",
        group: "Knowledge",
    },
    createChild: {
        name: "Create Child Incident",
        detail: "Per affected downstream service",
        group: "Mother/Child",
    },
    linkChild: {
        name: "Link Child Incident",
        detail: "Attach to existing mother incident",
        group: "Mother/Child",
    },
    propagateResolution: {
        name: "Propagate Resolution",
        detail: "Sync resolution to children",
        group: "Mother/Child",
    },
    syncFindings: {
        name: "Sync Findings",
        detail: "Share findings across the cluster",
        group: "Mother/Child",
    },
    sendNotification: {
        name: "Send Notification",
        detail: "Channel: Slack (#incidents), Email (On-call)",
        group: "Notification",
    },
    requireApproval: {
        name: "Require Approval",
        detail: "Hold actions for human approval",
        group: "Governance",
    },
    createWorkbench: {
        name: "Create Workbench",
        detail: "Open major-incident workbench",
        group: "Governance",
    },
    executiveReview: {
        name: "Executive Review",
        detail: "Notify incident commander chain",
        group: "Governance",
    },
    blockAutomation: {
        name: "Block Automation",
        detail: "Prevent automated remediation",
        group: "Governance",
    },
    autoRollback: {
        name: "Auto Rollback",
        detail: "Roll back the triggering deployment",
        group: "Remediation",
    },
    escalateNow: {
        name: "Escalate Immediately",
        detail: "Page on-call and incident commander now",
        group: "Governance",
    },
    executiveApproval: {
        name: "Require Executive Approval",
        detail: "Gate execution behind executive sign-off",
        group: "Governance",
    },
    disableAutonomy: {
        name: "Disable Autonomous Execution",
        detail: "Force human-in-the-loop for this incident",
        group: "Agent Governance",
    },
    secondAgent: {
        name: "Require Verification Agent",
        detail: "Add an independent second agent to verify",
        group: "Agent Governance",
    },
    investigationAgent: {
        name: "Launch Investigation Agent",
        detail: "Spin up an additional diagnostic agent",
        group: "Agent Governance",
    },
    escalateHuman: {
        name: "Escalate to Human",
        detail: "Hand off from agent to on-call engineer",
        group: "Agent Governance",
    },
    autoApprove: {
        name: "Auto-approve Execution",
        detail: "Execute autonomously — no human approval required",
        group: "Execution Governance",
    },
    managerApproval: {
        name: "Require Manager Approval",
        detail: "Hold for service-owner or manager sign-off",
        group: "Execution Governance",
    },
    multiStageApproval: {
        name: "Require Multi-stage Approval",
        detail: "Sequential sign-off: owner → manager → change lead",
        group: "Execution Governance",
    },
    cabApproval: {
        name: "Require CAB Approval",
        detail: "Route to the Change Advisory Board for review",
        group: "Execution Governance",
    },
    ecabApproval: {
        name: "Require Emergency CAB (eCAB)",
        detail: "Convene the Emergency CAB for expedited sign-off",
        group: "Execution Governance",
    },
} satisfies Record<string, { name: string; detail: string; group: string }>;

export const ACT_GROUPS: ActionGroup[] = [
    {
        sec: "Execution Governance",
        keys: [
            "autoApprove",
            "managerApproval",
            "multiStageApproval",
            "cabApproval",
            "ecabApproval",
            "executiveApproval",
        ],
    },
    {
        sec: "Agent Governance",
        keys: [
            "disableAutonomy",
            "secondAgent",
            "investigationAgent",
            "escalateHuman",
        ],
    },
    {
        sec: "Governance",
        keys: [
            "requireApproval",
            "executiveReview",
            "createWorkbench",
            "blockAutomation",
            "escalateNow",
        ],
    },
    { sec: "Remediation", keys: ["autoRollback"] },
    {
        sec: "Incident",
        keys: [
            "createIncident",
            "escalateIncident",
            "updateIncident",
            "closeIncident",
        ],
    },
    {
        sec: "War Room",
        keys: ["startWarRoom", "addResponders", "assignCommander", "assignTeam"],
    },
    {
        sec: "Playbook",
        keys: ["attachPlaybook", "recommendPlaybook", "executePlaybook"],
    },
    {
        sec: "Knowledge",
        keys: ["searchSimilar", "attachResolutions", "attachRca", "attachRisks"],
    },
    {
        sec: "Mother / Child",
        keys: ["createChild", "linkChild", "propagateResolution", "syncFindings"],
    },
    { sec: "Notification", keys: ["sendNotification"] },
];

export const COND_GROUPS: CondGroup[] = [
    {
        sec: "EXECUTION GOVERNANCE",
        fields: [
            "requiredApprovals",
            "changeType",
            "changeWindow",
            "emergencyOverride",
        ],
    },
    {
        sec: "AI ANALYSIS",
        fields: [
            "ezraConfidence",
            "rootCauseType",
            "investigationDuration",
            "evidenceQuality",
            "contradictoryFindings",
        ],
    },
    {
        sec: "REMEDIATION",
        fields: [
            "remediationRisk",
            "remediationConfidence",
            "rollbackAvailable",
            "blastRadius",
            "executionType",
        ],
    },
    {
        sec: "BUSINESS IMPACT",
        fields: [
            "revenueImpact",
            "customerImpact",
            "slaBreachRisk",
            "complianceRisk",
        ],
    },
    { sec: "AGENT GOVERNANCE", fields: ["environment", "serviceTier"] },
    {
        sec: "SERVICE & SIGNAL",
        fields: ["service", "health", "priority", "status", "category"],
    },
    {
        sec: "TIME & STATE",
        fields: [
            "timeOfDay",
            "dayOfWeek",
            "businessHours",
            "notAckFor",
            "incidentAge",
        ],
    },
    {
        sec: "CORRELATION",
        fields: [
            "childCount",
            "motherExists",
            "similarFound",
            "problemRecord",
            "knownRisk",
        ],
    },
];