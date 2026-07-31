import { ServiceRecord, ealOf, evaluationId, readiness } from "./serviceCatalog.data";
import { auditLog } from "./serviceDetail.data";

const COLUMNS: { key: keyof ServiceRecord; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "owner", label: "Owner" },
  { key: "tier", label: "Tier" },
  { key: "health", label: "Health" },
  { key: "env", label: "Environment" },
  { key: "runtime", label: "Runtime" },
  { key: "cloud", label: "Cloud" },
  { key: "region", label: "Region" },
  { key: "lang", label: "Language" },
  { key: "version", label: "Version" },
  { key: "incidents", label: "Open incidents" },
  { key: "slo", label: "SLO %" },
  { key: "availability", label: "Availability %" },
];

function escapeCsv(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const GOV_COLUMNS = ["Readiness score", "Stored automation level", "Binding constraint", "Evaluation ID"];

function governanceCells(s: ServiceRecord): string[] {
  const e = ealOf(s);
  return [String(readiness(s).score), e.blocked ? "Gate blocked" : `L${e.level}`, e.binding, evaluationId(s)];
}

export function servicesToCsv(services: ServiceRecord[]): string {
  const header = [...COLUMNS.map((c) => c.label), ...GOV_COLUMNS].join(",");
  const rows = services.map((s) =>
    [...COLUMNS.map((c) => escapeCsv(s[c.key])), ...governanceCells(s).map(escapeCsv)].join(","),
  );
  return [header, ...rows].join("\n");
}

export function servicesToJson(services: ServiceRecord[]): string {
  const data = services.map((s) => {
    const e = ealOf(s);
    const r = readiness(s);
    return {
      id: s.id,
      name: s.name,
      owner: s.owner,
      tier: s.tier,
      health: s.health,
      environment: s.env,
      runtime: s.runtime,
      cloud: s.cloud,
      region: s.region,
      language: s.lang,
      version: s.version,
      openIncidents: s.incidents,
      slo: s.slo,
      availability: s.availability,
      governance: {
        readinessScore: r.score,
        readinessBand: r.band,
        storedAutomationLevel: e.blocked ? "Gate blocked" : `L${e.level}`,
        bindingConstraint: e.binding,
        bindingWhy: e.bindingWhy,
        evaluationId: evaluationId(s),
      },
    };
  });
  return JSON.stringify(data, null, 2);
}

export function auditLedgerToCsv(services: ServiceRecord[]): string {
  const header = ["Timestamp", "Service", "Service ID", "Actor", "Action", "Detail"].join(",");
  const rows = services.flatMap((s) =>
    auditLog(s).map((entry) => [entry.when, s.name, s.id, entry.actor, entry.action, entry.detail].map(escapeCsv).join(",")),
  );
  return [header, ...rows].join("\n");
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, csv: string) {
  downloadBlob(filename, csv, "text/csv;charset=utf-8;");
}

export function downloadJson(filename: string, json: string) {
  downloadBlob(filename, json, "application/json;charset=utf-8;");
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseServicesCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}
