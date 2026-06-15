export type InvestigationVariant = "contributed" | "not-contributed";

export interface CausalFactor {
    id: number;
    factor: string;
    confidence: number;
    meaning: string;
}

export interface MetricConfig {
    deployments: number;
    commits: number;
    pullRequests: number;
    repositories: number;
    windowLabel: string;
    windowValue: string;
}

export interface ReportData {
    variant: InvestigationVariant;
    eyebrow: string;
    title: string;
    subtitle: string;
    summaryTitle: string;
    summaryBody: string;
    summarySub: string;
    scopeTitle: string;
    scopeBody: string;
    scopeSub: string;
    analysisTitle: string;
    analysisBody: string;
    analysisSub: string;
    assessmentTitle: string;
    assessmentBadge: string;
    assessmentBody: string;
    metrics: MetricConfig;
    causalFactors: CausalFactor[];
    unfoldedTitle: string;
    unfoldedBody1: string;
    unfoldedBody2: string;
    unfoldedBody3: string;
    highlightText: string;
    actionsTitle: string;
    actions: string[];
}