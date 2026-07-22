/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  CardHandlers,
  ConfidenceCard,
  HandlerCard,
  QualityCard,
  SimilarCard,
  SlaCard,
  WarroomCard,
  DeployCard,
  WhyCard,
  RollbackAskCard,
  RollbackDoCard,
  PlaybookCard,
  ExecCard,
  OwnerCard,
  DeniedCard,
  AuditCard,
  ExportCard,
  HealthCard,
  RulesCard,
  RestartPreviewCard,
} from "./cards";
import { AuditEntry, Incident, Service, INCIDENTS, SERVICES, NB, NBItem, openIncidentIds } from "./data";

export interface Intent {
  id: string;
  entity: "incident" | "service" | null;
  keys: string[];
  reason: string[] | ((ent: any) => string[]);
  prose?: string | ((ent: any) => string);
  build: (ent: any, h: CardHandlers, audit: AuditEntry[]) => React.ReactNode;
  next: NBItem[] | ((ent: any) => NBItem[]) | null;
  auditOnRun?: { action: string; result: string };
}

export function callable<T>(v: T | ((ent: any) => T) | undefined, ent: any): T | undefined {
  return typeof v === "function" ? (v as (ent: any) => T)(ent) : v;
}

export const INTENTS: Record<string, Intent> = {
  denied: {
    entity: null,
    keys: ["credential", "credentials", "secret", "secrets", "password", "api key", "private key", "aws prod"],
    reason: ["Checking RBAC scope", "Consulting Operational Rules", "Evaluating Secrets Policy", "Generating response"],
    prose: "I can't retrieve that. Production credentials are protected by your tenant's Secrets Policy, and your role doesn't carry a secrets scope.",
    build: (_ent, h) => <DeniedCard h={h} />,
    next: [NB.rules, NB.handler, NB.rootcause],
    auditOnRun: { action: "Requested production credentials", result: "Denied · Secrets Policy" },
    id: "denied",
  },
  audit: {
    id: "audit",
    entity: null,
    keys: ["audit trail", "audit log", "who approved", "approval history"],
    reason: ["Reading Execution History", "Compiling audit trail", "Generating response"],
    prose: "Here are the most recent governed actions in this tenant.",
    build: (_ent, h, audit) => <AuditCard audit={audit} h={h} />,
    next: [NB.rules, NB.exec, NB.handler],
  },
  export: {
    id: "export",
    entity: null,
    keys: ["export"],
    reason: ["Preparing export package", "Checking permissions", "Generating response"],
    prose: "I can package this conversation and its findings. Where should it go?",
    build: (_ent, h) => <ExportCard h={h} />,
    next: [NB.exec, NB.warroom, NB.quality],
  },
  whyFailing: {
    id: "whyFailing",
    entity: "incident",
    keys: ["why is checkout failing", "why is payments", "why is login", "why is it failing", "why is the service failing", "why failing", "root cause", "explain root"],
    reason: (i: Incident) => [`Investigating ${i.id}`, "Reading Signal Graph", `Analyzing deployment ${i.deployment.id}`, "Checking Operational Memory", "Comparing historical incidents", "Generating response"],
    prose: (i: Incident) => `${i.service} is failing because of ${i.rootCause.toLowerCase()} following deployment ${i.deployment.id}.`,
    build: (i: Incident, h) => <WhyCard i={i} h={h} />,
    next: [NB.deploy, NB.rollbackAsk, NB.playbook, NB.sla],
  },
  confidence: {
    id: "confidence",
    entity: "incident",
    keys: ["confidence score", "confidence", "how sure", "how confident"],
    reason: (i: Incident) => [`Reading Signal Graph · ${i.id}`, "Checking Operational Memory", "Comparing historical incidents", "Generating response"],
    build: (i: Incident, h) => <ConfidenceCard i={i} h={h} />,
    next: [NB.rootcause, NB.rollbackAsk, NB.similar],
  },
  handler: {
    id: "handler",
    entity: "incident",
    keys: ["who is handling", "who's handling", "handling", "who is on", "who's on", "commander"],
    reason: (i: Incident) => [`Reading Incident Library · ${i.id}`, "Checking war room roster", "Generating response"],
    build: (i: Incident, h) => <HandlerCard i={i} h={h} />,
    next: [NB.quality, NB.similar, NB.sla, NB.warroom],
  },
  quality: {
    id: "quality",
    entity: "incident",
    keys: ["incident quality", "review quality", "quality review", "quality"],
    reason: ["Consulting Incident Quality", "Reading Incident Library", "Generating response"],
    build: (i: Incident, h) => <QualityCard i={i} h={h} />,
    next: [NB.exec, NB.similar, NB.sla],
  },
  similar: {
    id: "similar",
    entity: "incident",
    keys: ["similar", "seen this before", "seen this", "seen before", "compare with similar", "historical"],
    reason: (i: Incident) => ["Checking Operational Memory", `Comparing against ${i.id}`, "Reading Incident Relationships", "Generating response"],
    prose: (i: Incident) => `This pattern is familiar — I found ${i.similarCount} similar incidents to ${i.id} in operational memory.`,
    build: (i: Incident, h) => <SimilarCard i={i} h={h} />,
    next: [NB.playbook, NB.rollbackAsk, NB.quality],
  },
  sla: {
    id: "sla",
    entity: "incident",
    keys: ["sla", "breach", "slo"],
    reason: (i: Incident) => [`Checking SLA / SLO · ${i.id}`, "Reading Operational Calendar", "Generating response"],
    build: (i: Incident, h) => <SlaCard i={i} h={h} />,
    next: [NB.rollbackDo, NB.warroom, NB.exec],
  },
  warroom: {
    id: "warroom",
    entity: "incident",
    keys: ["war room", "warroom", "summarize war"],
    reason: ["Reading War Room", "Reading Incident Library", "Generating response"],
    build: (i: Incident, h) => <WarroomCard i={i} h={h} />,
    next: [NB.exec, NB.handler, NB.sla],
  },
  deploy: {
    id: "deploy",
    entity: "incident",
    keys: ["show deployment", "deployment", "previous release", "show the deployment"],
    reason: ["Analyzing deployment", "Reading Change Requests", "Generating response"],
    build: (i: Incident, h) => <DeployCard i={i} h={h} />,
    next: [NB.rollbackAsk, NB.rollbackDo, NB.rootcause],
  },
  playbook: {
    id: "playbook",
    entity: "incident",
    keys: ["playbook", "recommended playbook"],
    reason: ["Checking Operational Memory", "Consulting Playbook Library", "Generating response"],
    build: (i: Incident, h) => <PlaybookCard i={i} h={h} />,
    next: [NB.similar, NB.rollbackAsk, NB.quality],
  },
  rollbackAsk: {
    id: "rollbackAsk",
    entity: "incident",
    keys: ["should i rollback", "should i roll back", "recommend rollback", "should we roll back"],
    reason: ["Analyzing deployment", "Consulting Operational Rules", "Weighing Decision Center options", "Generating response"],
    build: (i: Incident, h) => <RollbackAskCard i={i} h={h} />,
    next: [NB.playbook, NB.rollbackDo, NB.sla],
  },
  rollbackDo: {
    id: "rollbackDo",
    entity: "incident",
    keys: ["rollback the deployment", "roll back the deployment", "rollback deployment", "execute rollback", "roll it back"],
    reason: ["Analyzing deployment", "Consulting Operational Rules", "Checking Emergency Approval Policy", "Generating response"],
    prose: (i: Incident) => `I can prepare that rollback for ${i.id} — but an operational rule requires approval before it runs.`,
    build: (i: Incident, h) => <RollbackDoCard i={i} h={h} />,
    next: [NB.warroom, NB.exec, NB.sla],
  },
  exec: {
    id: "exec",
    entity: "incident",
    keys: ["executive", "exec summary", "executive summary", "executive report", "customer update"],
    reason: ["Reading Incident Library", "Consulting Incident Quality", "Reading War Room", "Generating response"],
    build: (i: Incident, h) => <ExecCard i={i} h={h} />,
    next: [NB.warroom, NB.export, NB.sla],
  },
  owner: {
    id: "owner",
    entity: "service",
    keys: ["who owns", "owner", "service owner", "who owns this service"],
    reason: ["Reading Service Catalog", "Checking ownership & on-call", "Generating response"],
    build: (s: Service, h) => <OwnerCard s={s} h={h} />,
    next: [NB.deploy, NB.handler, NB.rootcause],
  },
  health: {
    id: "health",
    entity: null,
    keys: ["platform health", "health review", "incidents open", "estate health"],
    reason: ["Reading Incident Library", "Checking SLA / SLO", "Reading Service Catalog", "Generating response"],
    prose: () => `Your tenant's production estate has ${openIncidentIds().length} open incidents right now.`,
    build: (_ent, h) => <HealthCard h={h} />,
    next: [NB.handler, NB.confidence, NB.rules],
  },
  rules: {
    id: "rules",
    entity: null,
    keys: ["operational rules", "rules active", "change freeze", "freeze"],
    reason: ["Consulting Operational Rules", "Reading Operational Calendar", "Generating response"],
    prose: "Six operational rules are active for your tenant right now.",
    build: (_ent, h) => <RulesCard h={h} />,
    next: [NB.exec, NB.health, NB.auditNB],
  },
  restartPreview: {
    id: "restartPreview",
    entity: null,
    keys: [],
    reason: ["Validating target", "Consulting Operational Rules", "Checking Approval Policy", "Generating response"],
    build: (target: string, h) => <RestartPreviewCard target={target} h={h} />,
    next: () => [NB.rollbackAsk, NB.playbook, NB.warroom],
  },
  fallback: {
    id: "fallback",
    entity: null,
    keys: [],
    reason: ["Reading tenant context", "Checking Operational Memory", "Generating response"],
    prose: () =>
      `Here's what I can see in your tenant's production estate — ${openIncidentIds().length} incidents open, led by SI-92837 (Checkout, P0) with 18 minutes of SLA remaining. Tell me which incident or service to dig into, or ask me to compare or act.`,
    build: () => null,
    next: [NB.confidence, NB.rollbackAsk, NB.similar, NB.health],
  },
};

// "restart" is handled as a special clarify flow outside the generic build/next
// pipeline (see CommandStudio.tsx), but still needs a keyword match slot.
export const RESTART_KEYS = ["restart"];

export const MATCH_ORDER = [
  "denied",
  "audit",
  "export",
  "restart",
  "rollbackDo",
  "rollbackAsk",
  "whyFailing",
  "deploy",
  "confidence",
  "owner",
  "handler",
  "quality",
  "similar",
  "warroom",
  "playbook",
  "sla",
  "rules",
  "health",
  "exec",
];

export function matchIntent(text: string): string {
  const t = text.toLowerCase();
  for (const id of MATCH_ORDER) {
    if (id === "restart") {
      if (RESTART_KEYS.some((k) => t.includes(k))) return "restart";
      continue;
    }
    if (INTENTS[id]?.keys.some((k) => t.includes(k))) return id;
  }
  return "fallback";
}

export function entityObj(type: "incident" | "service" | null, id: string | null): Incident | Service | null {
  if (!type || !id) return null;
  return type === "incident" ? INCIDENTS[id] ?? null : SERVICES[id] ?? null;
}
