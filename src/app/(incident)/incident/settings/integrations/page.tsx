"use client";

import React, { ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Minus,
  Pencil,
  PlugZap,
  RefreshCw,
  TestTube2,
  Trash2,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import SettingWrapper from "../_module/setting-wrapper";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { ingestionUrlForSource, normalizeApiBase } from "@/lib/api/base-url";
import { querykeys } from "@/lib/constant";
import useAuthStore from "@/lib/stores/auth.store";

type ConnectionStatus =
  | "CONNECTING"
  | "HEALTHY"
  | "DEGRADED"
  | "REVOKED"
  | "ERROR";

type ConnectionCategory =
  | "messaging_paging"
  | "observability"
  | "runtime"
  | "ticketing"
  | "webhooks";

type SlackConfig = {
  teamName?: string;
  incomingWebhook?: {
    url?: string;
  };
};

type LegacyIntegration = {
  id: string;
  provider: string;
  isActive: boolean;
  config?: SlackConfig | null;
};

type ConnectionRecord = {
  id: string;
  type: string;
  title: string;
  category: ConnectionCategory | string;
  displayName: string;
  baseUrl: string | null;
  scope: string | null;
  environmentTags: string[];
  notes: string | null;
  authMethod: string;
  capabilities: string[];
  status: ConnectionStatus;
  credentialConfigured: boolean;
  installedAt: string;
  updatedAt: string;
  lastTestAt: string | null;
  lastEventAt: string | null;
  lastError: string | null;
  lastIncidentId?: string | null;
  lastIncidentTicketId?: string | null;
};

type ConnectionDraft = {
  displayName: string;
  baseUrl: string;
  credential: string;
  scope: string;
  environmentTags: string;
  notes: string;
};

type ConnectorCardDefinition = {
  key: string;
  title: string;
  section: string;
  description: string;
  mode: "oauth" | "manual";
  category?: ConnectionCategory;
  defaultDisplayName: string;
  placeholderBaseUrl?: string;
  placeholderCredential?: string;
  placeholderScope?: string;
  requiresCredential?: boolean;
  webhookSource?: "pagerduty" | "datadog" | "prometheus" | "kubernetes" | "webhook";
  manifestSource?: "kubernetes";
  statusHint: string;
};

const CONNECTOR_CARDS: ConnectorCardDefinition[] = [
  {
    key: "slack",
    title: "Slack",
    section: "Messaging & paging",
    description: "Notifications, approvals, and Ezra handoffs for active incidents.",
    mode: "oauth",
    defaultDisplayName: "Slack workspace",
    statusHint: "OAuth-backed chat routing and summaries.",
  },
  {
    key: "pagerduty",
    title: "PagerDuty",
    section: "Messaging & paging",
    description:
      "PagerDuty incident webhooks can auto-raise incidents and keep the on-call handoff anchored in Scrubbe.",
    mode: "manual",
    category: "messaging_paging",
    defaultDisplayName: "PagerDuty",
    placeholderBaseUrl: "https://api.pagerduty.com",
    placeholderCredential: "PagerDuty API token",
    placeholderScope: "on-call, p1-routing",
    webhookSource: "pagerduty",
    statusHint: "Webhook-driven incident creation with last-incident tracking.",
  },
  {
    key: "datadog",
    title: "Datadog",
    section: "Observability & alerts",
    description:
      "Datadog alert webhooks enrich incidents with signal context and help Ezra reason from the monitor that fired.",
    mode: "manual",
    category: "observability",
    defaultDisplayName: "Datadog",
    placeholderBaseUrl: "https://api.datadoghq.com",
    placeholderCredential: "Datadog API key",
    placeholderScope: "prod-monitors",
    webhookSource: "datadog",
    statusHint: "Monitor-driven incident ingestion and investigation context.",
  },
  {
    key: "kubernetes-eks",
    title: "Kubernetes",
    section: "Observability & alerts",
    description:
      "Install the Scrubbe cluster agent to stream warning events, pod crashes, OOM kills, unavailable workloads, and node readiness failures into ingestion.",
    mode: "manual",
    category: "runtime",
    defaultDisplayName: "Kubernetes cluster",
    placeholderBaseUrl: "https://cluster.example.com",
    placeholderCredential: "Scrubbe API key or read-only kubeconfig reference",
    placeholderScope: "production, payments",
    webhookSource: "kubernetes",
    manifestSource: "kubernetes",
    statusHint: "Runtime event ingestion for pod, workload, and node incidents.",
  },
  {
    key: "grafana",
    title: "Grafana",
    section: "Observability & alerts",
    description:
      "Link Grafana dashboards and alerting credentials so investigations start with the right runtime evidence.",
    mode: "manual",
    category: "observability",
    defaultDisplayName: "Grafana",
    placeholderBaseUrl: "https://grafana.example.com",
    placeholderCredential: "Grafana service account token",
    placeholderScope: "runtime-dashboards",
    statusHint: "Dashboard linking and alert context.",
  },
  {
    key: "prometheus",
    title: "Prometheus",
    section: "Observability & alerts",
    description:
      "Alertmanager webhooks can feed Scrubbe directly when your runtime alerts live outside Datadog.",
    mode: "manual",
    category: "observability",
    defaultDisplayName: "Prometheus Alertmanager",
    placeholderBaseUrl: "https://alertmanager.example.com",
    placeholderScope: "prod-alerts",
    requiresCredential: false,
    webhookSource: "prometheus",
    statusHint: "Alertmanager webhook ingestion.",
  },
  {
    key: "jira",
    title: "Jira",
    section: "Ticketing & custom",
    description:
      "Track follow-up work in Jira once an incident is stabilized, without losing the incident context in Scrubbe.",
    mode: "manual",
    category: "ticketing",
    defaultDisplayName: "Jira",
    placeholderBaseUrl: "https://your-domain.atlassian.net",
    placeholderCredential: "Jira API token",
    placeholderScope: "incident-followups",
    statusHint: "Follow-up sync and incident cross-linking.",
  },
  {
    key: "linear",
    title: "Linear",
    section: "Ticketing & custom",
    description:
      "Route remediation follow-ups into Linear so post-incident work lands in the same team workflow.",
    mode: "manual",
    category: "ticketing",
    defaultDisplayName: "Linear",
    placeholderBaseUrl: "https://api.linear.app",
    placeholderCredential: "Linear API key",
    placeholderScope: "incident-remediation",
    statusHint: "Issue sync for remediation and follow-up work.",
  },
  {
    key: "webhook-custom",
    title: "Custom webhook",
    section: "Ticketing & custom",
    description:
      "Bring in alerts from internal tools that do not have a native connector yet and still get auto-raised incidents.",
    mode: "manual",
    category: "webhooks",
    defaultDisplayName: "Custom inbound webhook",
    placeholderBaseUrl: "https://internal-alerting.example.com",
    placeholderScope: "payments, internal-alerting",
    requiresCredential: false,
    webhookSource: "webhook",
    statusHint: "Generic webhook ingestion for internal systems.",
  },
];

const formatTimestamp = (value?: string | null) => {
  if (!value) return "Not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet";
  return date.toLocaleString();
};

const toDraft = (
  definition: ConnectorCardDefinition,
  connection?: ConnectionRecord | null,
): ConnectionDraft => ({
  displayName: connection?.displayName ?? definition.defaultDisplayName,
  baseUrl: connection?.baseUrl ?? definition.placeholderBaseUrl ?? "",
  credential: "",
  scope: connection?.scope ?? "",
  environmentTags: connection?.environmentTags?.join(", ") ?? "",
  notes: connection?.notes ?? "",
});

const webhookUrlForSource = (
  source: ConnectorCardDefinition["webhookSource"],
) => {
  if (!source) return null;
  return ingestionUrlForSource(source);
};

const manifestUrlForSource = (source?: ConnectorCardDefinition["manifestSource"]) => {
  if (source !== "kubernetes") return null;
  return `${normalizeApiBase()}${endpoint.ingestion.kubernetes_manifest}`;
};

const statusTone = (status: ConnectionStatus | "CONNECTED" | "NOT_CONNECTED") => {
  switch (status) {
    case "HEALTHY":
    case "CONNECTED":
      return {
        border: "border-[#00CAD8]/50",
        text: "text-[#00CAD8]",
        label: "Connected",
      };
    case "CONNECTING":
      return {
        border: "border-amber-400/40",
        text: "text-amber-300",
        label: "Connecting",
      };
    case "ERROR":
    case "DEGRADED":
      return {
        border: "border-rose-400/40",
        text: "text-rose-300",
        label: "Needs attention",
      };
    case "REVOKED":
      return {
        border: "border-[#64748B]/40",
        text: "text-[#64748B]",
        label: "Revoked",
      };
    default:
      return {
        border: "border-[#64748B]/40",
        text: "text-[#64748B]",
        label: "Not connected",
      };
  }
};

const IntegrationSettingsPage = () => {
  const { get, post, remove } = useFetch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ConnectionDraft>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const { data: integrations = [] } = useQuery({
    queryKey: [querykeys.INTEGRATIONS, user?.id],
    queryFn: async () => {
      const res = await get(`${endpoint.incident_ticket.integrations}/${user?.id}`);
      if (!res.success) return [];
      return (
        (res.data?.data ?? res.data?.integrations ?? res.data) as LegacyIntegration[]
      ).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  const { data: connections = [], isLoading } = useQuery({
    queryKey: [querykeys.CONNECTOR_CONNECTIONS],
    queryFn: async () => {
      const res = await get(endpoint.connectors.connections);
      if (!res.success) return [];
      return (
        (res.data?.connections ?? res.data?.data?.connections ?? []) as ConnectionRecord[]
      ).filter(Boolean);
    },
    enabled: !!user,
  });

  const slackIntegration = useMemo(
    () =>
      integrations.find(
        (integration) =>
          integration.provider.toLowerCase() === "slack" ||
          integration.provider.toLowerCase() === "slack workspace",
      ),
    [integrations],
  );

  const connectionMap = useMemo(
    () =>
      connections.reduce<Record<string, ConnectionRecord>>((acc, connection) => {
        acc[connection.type] = connection;
        return acc;
      }, {}),
    [connections],
  );

  const sections = useMemo(() => {
    const grouped = CONNECTOR_CARDS.reduce<Record<string, ConnectorCardDefinition[]>>(
      (acc, definition) => {
        if (!acc[definition.section]) acc[definition.section] = [];
        acc[definition.section].push(definition);
        return acc;
      },
      {},
    );

    return Object.entries(grouped);
  }, []);

  const invalidateConnectorQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [querykeys.CONNECTOR_CONNECTIONS] }),
      queryClient.invalidateQueries({ queryKey: [querykeys.INTEGRATIONS, user?.id] }),
    ]);
  };

  const openEditor = (
    definition: ConnectorCardDefinition,
    connection?: ConnectionRecord | null,
  ) => {
    setDrafts((current) => ({
      ...current,
      [definition.key]: toDraft(definition, connection),
    }));
    setActiveEditor((current) => (current === definition.key ? null : definition.key));
  };

  const updateDraft = (
    key: string,
    field: keyof ConnectionDraft,
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? toDraft(
          CONNECTOR_CARDS.find((entry) => entry.key === key)!,
        )),
        [field]: value,
      },
    }));
  };

  const connectSlack = async () => {
    setBusyKey("slack-connect");
    try {
      const res = await get(endpoint.integration.slack);
      const url = res.data?.data?.url ?? res.data?.url;
      if (!res.success || typeof url !== "string") {
        toast.error("Unable to start Slack connection");
        return;
      }
      window.location.href = url;
    } finally {
      setBusyKey(null);
    }
  };

  const saveManualConnection = async (definition: ConnectorCardDefinition) => {
    const draft = drafts[definition.key] ?? toDraft(definition, connectionMap[definition.key]);
    if (!definition.category) return;

    if (
      definition.requiresCredential !== false &&
      !connectionMap[definition.key]?.credentialConfigured &&
      !draft.credential.trim()
    ) {
      toast.error(`${definition.title} requires a credential before it can be saved`);
      return;
    }

    setBusyKey(`${definition.key}-save`);
    try {
      const res = await post(endpoint.connectors.connections, {
        type: definition.key,
        category: definition.category,
        displayName: draft.displayName.trim() || definition.defaultDisplayName,
        baseUrl: draft.baseUrl.trim() || undefined,
        credential: draft.credential.trim() || undefined,
        scope: draft.scope.trim() || undefined,
        environmentTags: draft.environmentTags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: draft.notes.trim() || undefined,
      });

      if (!res.success) {
        toast.error(
          typeof res.data === "string" ? res.data : `Unable to save ${definition.title}`,
        );
        return;
      }

      toast.success(`${definition.title} connection saved`);
      setActiveEditor(null);
      setDrafts((current) => ({
        ...current,
        [definition.key]: {
          ...draft,
          credential: "",
        },
      }));
      await invalidateConnectorQueries();
    } finally {
      setBusyKey(null);
    }
  };

  const testConnection = async (definition: ConnectorCardDefinition) => {
    const connection = connectionMap[definition.key];
    if (!connection) {
      toast.error(`Connect ${definition.title} before testing it`);
      return;
    }

    setBusyKey(`${definition.key}-test`);
    try {
      const res = await post(`${endpoint.connectors.test}/${connection.id}/test`);
      if (!res.success) {
        toast.error(
          typeof res.data === "string"
            ? res.data
            : `${definition.title} test did not complete`,
        );
        return;
      }

      toast.success(
        res.data?.message ?? `${definition.title} test completed successfully`,
      );
      await invalidateConnectorQueries();
    } finally {
      setBusyKey(null);
    }
  };

  const deleteConnection = async (definition: ConnectorCardDefinition) => {
    const connection = connectionMap[definition.key];
    if (!connection) return;

    setBusyKey(`${definition.key}-delete`);
    try {
      const res = await remove(endpoint.connectors.connection, connection.id);
      if (!res.success) {
        toast.error(
          typeof res.data === "string" ? res.data : `Unable to remove ${definition.title}`,
        );
        return;
      }

      toast.success(`${definition.title} disconnected`);
      if (activeEditor === definition.key) {
        setActiveEditor(null);
      }
      await invalidateConnectorQueries();
    } finally {
      setBusyKey(null);
    }
  };

  const copyWebhook = async (url: string, title: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${title} webhook copied`);
    } catch {
      toast.error("Unable to copy webhook URL");
    }
  };

  const openLastIncident = (connection?: ConnectionRecord | null) => {
    if (!connection?.lastIncidentId) return;
    router.push(`/incident?id=${connection.lastIncidentId}`);
  };

  return (
    <div>
      <SettingWrapper
        title="Integrations"
        description="Connect the tools Scrubbe listens to and acts on"
        sub="Live connectors now cover chat, alerting, ticketing, dashboards, and custom webhooks."
      >
        <div className="space-y-8 pt-5">
          {sections.map(([section, definitions]) => (
            <section
              key={section}
              className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-5"
            >
              <div className="flex justify-between items-center px-1">
                <h3 className="text-white font-bold text-lg">{section}</h3>
                <ArrowRight size={18} className="text-[#64748B]" />
              </div>

              <div className="space-y-4">
                {definitions.map((definition) => {
                  const connection = connectionMap[definition.key];
                  const slackConnected = Boolean(slackIntegration?.isActive);
                  const slackConfig = (slackIntegration?.config ?? {}) as SlackConfig;
                  const isSlack = definition.key === "slack";
                  const isConnected = isSlack
                    ? slackConnected
                    : Boolean(connection);
                  const tone = statusTone(
                    isSlack
                      ? slackConnected
                        ? "CONNECTED"
                        : "NOT_CONNECTED"
                      : connection?.status ?? "NOT_CONNECTED",
                  );
                  const webhookUrl = webhookUrlForSource(definition.webhookSource);
                  const lastIncidentTicketId = connection?.lastIncidentTicketId ?? null;
                  const isEditorOpen = activeEditor === definition.key;
                  const draft =
                    drafts[definition.key] ?? toDraft(definition, connection);
                  const manifestUrl = manifestUrlForSource(definition.manifestSource);

                  return (
                    <div
                      key={definition.key}
                      className="p-5 border border-neutral-500 rounded-2xl space-y-4 group hover:border-[#00CAD8]/30 transition-colors"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-white text-[15px] font-bold">
                              {definition.title}
                            </span>
                            <StatusBadge
                              borderClass={tone.border}
                              textClass={tone.text}
                              label={tone.label}
                              icon={
                                isConnected ? <Check size={14} /> : <Minus size={14} />
                              }
                            />
                          </div>
                          <p className="text-[#CBD5E1] text-sm max-w-3xl">
                            {definition.description}
                          </p>
                          <p className="text-[#64748B] text-xs">
                            {definition.statusHint}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isSlack ? (
                            <ActionButton
                              label={slackConnected ? "Reconnect" : "Connect"}
                              icon={<PlugZap size={14} />}
                              loading={busyKey === "slack-connect"}
                              onClick={connectSlack}
                            />
                          ) : (
                            <>
                              <ActionButton
                                label={connection ? "Configure" : "Connect"}
                                icon={<Pencil size={14} />}
                                onClick={() => openEditor(definition, connection)}
                              />
                              {connection ? (
                                <ActionButton
                                  label="Test"
                                  icon={<TestTube2 size={14} />}
                                  loading={busyKey === `${definition.key}-test`}
                                  variant="secondary"
                                  onClick={() => testConnection(definition)}
                                />
                              ) : null}
                              {connection?.lastIncidentId ? (
                                <ActionButton
                                  label="Open incident"
                                  icon={<ExternalLink size={14} />}
                                  variant="secondary"
                                  onClick={() => openLastIncident(connection)}
                                />
                              ) : null}
                              {connection ? (
                                <ActionButton
                                  label="Disconnect"
                                  icon={<Trash2 size={14} />}
                                  variant="danger"
                                  loading={busyKey === `${definition.key}-delete`}
                                  onClick={() => deleteConnection(definition)}
                                />
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                        <DetailPill
                          label="Connection"
                          value={
                            isSlack
                              ? slackConfig.teamName || (slackConnected ? "Workspace connected" : "Not connected")
                              : connection?.displayName ?? "Not configured"
                          }
                        />
                        <DetailPill
                          label="Last test"
                          value={isSlack ? "OAuth handled" : formatTimestamp(connection?.lastTestAt)}
                        />
                        <DetailPill
                          label="Last event"
                          value={
                            isSlack
                              ? slackConnected
                                ? "Messaging ready"
                                : "No workspace connected"
                              : formatTimestamp(connection?.lastEventAt)
                          }
                        />
                        <DetailPill
                          label="Latest incident"
                          value={lastIncidentTicketId ?? "No connector-raised incident yet"}
                        />
                      </div>

                      {connection?.lastError ? (
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                          {connection.lastError}
                        </div>
                      ) : null}

                      {webhookUrl ? (
                        <div className="rounded-2xl border border-white/10 bg-[#071126] px-4 py-4 space-y-3">
                          <div className="flex items-center gap-2 text-white text-sm font-semibold">
                            <Webhook size={14} className="text-[#00CAD8]" />
                            Inbound webhook
                          </div>
                          <p className="text-xs text-[#94A3B8]">
                            Point the provider at this endpoint and include your Scrubbe API key in the
                            <span className="text-white font-mono"> X-API-Key </span>
                            header.
                          </p>
                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <span className="text-xs font-mono text-[#CBD5E1] truncate flex-1">
                              {webhookUrl}
                            </span>
                            <button
                              type="button"
                              className="text-[#00CAD8] hover:text-white transition-colors"
                              onClick={() => copyWebhook(webhookUrl, definition.title)}
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {manifestUrl ? (
                        <div className="rounded-2xl border border-white/10 bg-[#071126] px-4 py-4 space-y-3">
                          <div className="flex items-center gap-2 text-white text-sm font-semibold">
                            <Webhook size={14} className="text-[#00CAD8]" />
                            Kubernetes agent manifest
                          </div>
                          <p className="text-xs text-[#94A3B8]">
                            Download the in-cluster agent manifest, replace the
                            <span className="text-white font-mono"> SCRUBBE_API_KEY </span>
                            placeholder, then apply it to your cluster.
                          </p>
                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <span className="text-xs font-mono text-[#CBD5E1] truncate flex-1">
                              {manifestUrl}
                            </span>
                            <button
                              type="button"
                              className="text-[#00CAD8] hover:text-white transition-colors"
                              onClick={() => copyWebhook(manifestUrl, "Kubernetes manifest")}
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {isEditorOpen && definition.mode === "manual" ? (
                        <div className="rounded-2xl border border-[#00CAD8]/20 bg-[#071126] px-4 py-4 space-y-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {connection ? "Update connection" : "Configure connection"}
                              </p>
                              <p className="text-[#94A3B8] text-xs">
                                Save the connector metadata Scrubbe should use for this provider.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-[#64748B] hover:text-white transition-colors"
                              onClick={() => setActiveEditor(null)}
                            >
                              Close
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <InputField
                              label="Display name"
                              value={draft.displayName}
                              placeholder={definition.defaultDisplayName}
                              onChange={(value) =>
                                updateDraft(definition.key, "displayName", value)
                              }
                            />
                            <InputField
                              label="Base URL"
                              value={draft.baseUrl}
                              placeholder={definition.placeholderBaseUrl ?? "Optional"}
                              onChange={(value) =>
                                updateDraft(definition.key, "baseUrl", value)
                              }
                            />
                            <InputField
                              label={
                                definition.requiresCredential === false
                                  ? "Credential"
                                  : "Credential or token"
                              }
                              value={draft.credential}
                              placeholder={definition.placeholderCredential ?? "Leave blank to keep the current secret"}
                              type="password"
                              onChange={(value) =>
                                updateDraft(definition.key, "credential", value)
                              }
                            />
                            <InputField
                              label="Scope tags"
                              value={draft.scope}
                              placeholder={definition.placeholderScope ?? "Optional"}
                              onChange={(value) =>
                                updateDraft(definition.key, "scope", value)
                              }
                            />
                            <InputField
                              label="Environment tags"
                              value={draft.environmentTags}
                              placeholder="prod, payments, eu-west-1"
                              onChange={(value) =>
                                updateDraft(definition.key, "environmentTags", value)
                              }
                            />
                            <TextAreaField
                              label="Notes"
                              value={draft.notes}
                              placeholder="Anything the on-call team should remember about this connector"
                              onChange={(value) =>
                                updateDraft(definition.key, "notes", value)
                              }
                            />
                          </div>

                          <div className="flex flex-wrap justify-end gap-2">
                            <ActionButton
                              label="Cancel"
                              variant="secondary"
                              onClick={() => setActiveEditor(null)}
                            />
                            <ActionButton
                              label="Save connection"
                              icon={<RefreshCw size={14} />}
                              loading={busyKey === `${definition.key}-save`}
                              onClick={() => saveManualConnection(definition)}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <Loader2 size={16} className="animate-spin" />
              Loading connector state...
            </div>
          ) : null}
        </div>
      </SettingWrapper>
    </div>
  );
};

const StatusBadge = ({
  borderClass,
  textClass,
  label,
  icon,
}: {
  borderClass: string;
  textClass: string;
  label: string;
  icon: ReactNode;
}) => (
  <div
    className={`flex items-center gap-1.5 px-3 py-1 border rounded-full bg-[#0B1224] ${borderClass}`}
  >
    <span className={textClass}>{icon}</span>
    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
      {label}
    </span>
  </div>
);

const ActionButton = ({
  label,
  onClick,
  icon,
  loading,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) => {
  const tone =
    variant === "danger"
      ? "text-rose-200 border-rose-400/30 hover:bg-rose-500/10"
      : variant === "secondary"
        ? "text-white border-white/15 hover:bg-white/5"
        : "text-[#00CAD8] border-[#00CAD8] hover:bg-[#00CAD8]/5";

  return (
    <button
      type="button"
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border inline-flex items-center gap-2 ${tone}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
};

const DetailPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-[#071126] px-4 py-3">
    <p className="text-[11px] uppercase tracking-[0.2em] text-[#64748B]">{label}</p>
    <p className="text-sm text-white mt-1 break-words">{value}</p>
  </div>
);

const InputField = ({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) => (
  <label className="space-y-2">
    <span className="text-xs uppercase tracking-[0.18em] text-[#64748B]">
      {label}
    </span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white placeholder:text-[#475569] outline-none focus:border-[#00CAD8]/50"
    />
  </label>
);

const TextAreaField = ({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => (
  <label className="space-y-2 lg:col-span-2">
    <span className="text-xs uppercase tracking-[0.18em] text-[#64748B]">
      {label}
    </span>
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm text-white placeholder:text-[#475569] outline-none focus:border-[#00CAD8]/50 resize-none"
    />
  </label>
);

export default IntegrationSettingsPage;
