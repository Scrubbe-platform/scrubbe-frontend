import { notFound, redirect } from "next/navigation";

const LEGACY_ROUTE_MAP: Record<string, string> = {
  "decision-logs": "/incident/incident-delivery",
  "delivery-incidents": "/incident/incident-delivery",
  connections: "/connections",
  "service-map": "/incident/code-engine",
  notification: "/incident/settings/notification",
  "post-mortems": "/incident/postmortems",
  ezra: "/incident/ezra",
  "ezra/incident-summaries": "/incident/ezra",
  "runbooks": "/incident/playbooks",
  "runtime-warning": "/incident/code-engine",
  "signal-graph": "/incident/signal-graph",
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
  searchParams?: Record<string, string | string[] | undefined>;
};

const appendSearchParams = (
  target: string,
  searchParams?: Record<string, string | string[] | undefined>
) => {
  if (!searchParams) {
    return target;
  }

  const nextSearchParams = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "undefined") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => nextSearchParams.append(key, entry));
      return;
    }

    nextSearchParams.set(key, value);
  });

  const queryString = nextSearchParams.toString();
  return queryString ? `${target}?${queryString}` : target;
};

export default function LegacyIncidentRoute({
  params,
  searchParams,
}: Props) {
  const legacyPath = params.legacy.join("/");
  const target = LEGACY_ROUTE_MAP[legacyPath];

  if (!target) {
    notFound();
  }

  redirect(appendSearchParams(target, searchParams));
}
