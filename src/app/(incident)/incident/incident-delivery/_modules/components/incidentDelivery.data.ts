import { IncidentDetailRecord } from "@/lib/incident/incident.types";

type RawRecord = Record<string, unknown>;

interface DeliveryPayload {
  isLive: boolean;
  provider?: string;
  org?: string;
  repo?: string;
  service: string;
  receivedAt: string;
  eventType: string;
  action: string;
  conclusion: string;
  failureCategory: string;
  failing: string[];
  pr?: { number: string; title: string };
  commit?: { sha: string; author: string };
  artifacts?: { diffUrl?: string; runUrl?: string };
}

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === "object" ? (value as RawRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];

/**
 * `incident.raw` is populated server-side by matching the auto-raised
 * ticket back to the GitHub/GitLab webhook delivery that created it (see
 * `findIncidentDeliveryRaw` in incident.service.ts). Most webhook events
 * still don't carry a real PR number or commit SHA, so only surface fields
 * that are actually present — never invent plausible-looking values.
 */
export const buildDeliveryPayload = (
  incident: IncidentDetailRecord
): DeliveryPayload => {
  const raw = asRecord(incident.raw);
  const pr = asRecord(raw.pr);
  const commit = asRecord(raw.commit);
  const artifacts = asRecord(raw.artifacts);

  const repo = asString(raw.repo);
  const prNumber = asString(pr.number);
  const commitSha = asString(commit.sha);
  const isLive = Boolean(repo || prNumber || commitSha);

  return {
    isLive,
    provider: asString(raw.provider),
    org: asString(raw.org),
    repo,
    service: incident.service || incident.affectedSystem || "service",
    receivedAt: incident.createdAt || new Date().toISOString(),
    eventType: asString(raw.eventType) ?? incident.sourceType ?? incident.source ?? "incident",
    action: asString(raw.action) ?? incident.status ?? "opened",
    conclusion: asString(raw.conclusion) ?? incident.status ?? "open",
    failureCategory: asString(raw.failureCategory) ?? incident.category ?? incident.subCategory ?? "incident",
    failing: asStringArray(raw.failing),
    pr: prNumber
      ? { number: prNumber, title: asString(pr.title) ?? incident.title ?? incident.summary ?? "" }
      : undefined,
    commit: commitSha
      ? { sha: commitSha, author: asString(commit.author) ?? incident.assignedToName ?? incident.assignedToEmail ?? "" }
      : undefined,
    artifacts: artifacts.runUrl || artifacts.diffUrl
      ? { runUrl: asString(artifacts.runUrl), diffUrl: asString(artifacts.diffUrl) }
      : undefined,
  };
};
