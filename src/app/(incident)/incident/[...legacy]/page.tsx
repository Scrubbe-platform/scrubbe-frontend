import { notFound, redirect } from "next/navigation";

const LEGACY_ROUTE_MAP: Record<string, string> = {
  "decision-logs": "/incident/incident-delivery",
  "delivery-incidents": "/incident/incident-delivery",
  connections: "/connections",
  "service-map": "/incident/code-engine",
  notification: "/incident/settings/notification",
  "post-mortems": "/incident/postmortems",
  ezra: "/incident/ai-suggestion",
  "ezra/incident-summaries": "/incident/ai-suggestion",
  "runbooks": "/incident/playbooks",
  "runtime-warning": "/incident/code-engine",
  "signal-graph": "/incident/code-engine",
  guardrails: "/incident/policies",
  workflows: "/incident/pipelines",
  "past-incidents": "/incident/postmortems",
  permissions: "/incident/settings/security",
  "multi-tenancy": "/incident/settings",
  "risk-exposure": "/incident/policies",
  signals: "/incident/ingestion",
  audit: "/incident/timeline",
  sandbox: "/incident/tickets/create",
  support: "/incident/tickets",
  documentation: "/incident/playbooks",
  "knowledge-base": "/incident/postmortems",
  "reports-export": "/incident/postmortems",
  "status-communication-center": "/incident/incident-delivery",
  "climate-resilience-intelligence": "/incident/code-engine",
  anlytics: "/incident/code-engine",
};

type Props = {
  params: {
    legacy: string[];
  };
};

export default function LegacyIncidentRoute({ params }: Props) {
  const legacyPath = params.legacy.join("/");
  const target = LEGACY_ROUTE_MAP[legacyPath];

  if (!target) {
    notFound();
  }

  redirect(target);
}
