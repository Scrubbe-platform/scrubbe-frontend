import { IncidentDetailRecord } from "@/lib/incident/incident.types";

type RawRecord = Record<string, unknown>;

interface DeliveryPayload {
  provider: string;
  org: string;
  repo: string;
  service: string;
  receivedAt: string;
  eventType: string;
  action: string;
  conclusion: string;
  failureCategory: string;
  failing: string[];
  pr: { number: string; title: string };
  commit: { sha: string; author: string };
  artifacts: { diffUrl: string; runUrl: string };
}

const asRecord = (value: unknown): RawRecord =>
  value && typeof value === "object" ? (value as RawRecord) : {};

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];

const buildRepoName = (incident: IncidentDetailRecord) => {
  const serviceName = incident.service || incident.affectedSystem || "service";
  return `scrubbe/${serviceName.replace(/\s+/g, "-").toLowerCase()}`;
};

export const buildDeliveryPayload = (
  incident: IncidentDetailRecord
): DeliveryPayload => {
  const raw = asRecord(incident.raw);
  const pr = asRecord(raw.pr);
  const commit = asRecord(raw.commit);
  const artifacts = asRecord(raw.artifacts);
  const repo = asString(raw.repo, buildRepoName(incident));
  const service = asString(raw.service, incident.service || incident.affectedSystem || "service");
  const receivedAt = incident.createdAt || new Date().toISOString();
  const eventType = asString(raw.eventType, incident.sourceType || incident.source || "incident");
  const action = asString(raw.action, incident.status || "opened");
  const conclusion = asString(raw.conclusion, incident.status || "open");
  const failureCategory = asString(raw.failureCategory, incident.category || incident.subCategory || "incident");
  const failing = asStringArray(raw.failing);
  const prNumber = asString(pr.number, incident.ticketId.replace(/\D+/g, "").slice(-3) || "1");
  const prTitle = asString(pr.title, incident.title || incident.summary || incident.reason || "Selected incident");
  const commitSha = asString(commit.sha, incident.id.slice(0, 7));
  const commitAuthor = asString(
    commit.author,
    incident.assignedToName || incident.assignedToEmail || incident.reportedBy || "scrubbe"
  );
  const runUrl = asString(
    artifacts.runUrl,
    `https://github.example/${repo}/actions/runs/${incident.id.slice(0, 8)}`
  );
  const diffUrl = asString(
    artifacts.diffUrl,
    `https://github.example/${repo}/pull/${prNumber}/files`
  );

  return {
    provider: asString(raw.provider, "github"),
    org: asString(raw.org, "scrubbe"),
    repo,
    service,
    receivedAt,
    eventType,
    action,
    conclusion,
    failureCategory,
    failing:
      failing.length > 0
        ? failing
        : [
            incident.service
              ? `services/${incident.service.replace(/\s+/g, "-").toLowerCase()}/index.ts`
              : "src/incident/index.ts",
          ],
    pr: {
      number: prNumber,
      title: prTitle,
    },
    commit: {
      sha: commitSha,
      author: commitAuthor,
    },
    artifacts: {
      diffUrl,
      runUrl,
    },
  };
};
