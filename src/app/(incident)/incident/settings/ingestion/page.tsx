"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Book, Check, ChevronRight, Copy, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SettingWrapper from "../_module/setting-wrapper";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import useAuthStore from "@/lib/stores/auth.store";
import GithubConfiguration from "@/components/IncidentTicket/Configuration/GithubConfiguration";
import GitlabConfiguration from "@/components/IncidentTicket/Configuration/GitlabConfiguration";
import BitbucketConfiguration from "@/components/IncidentTicket/Configuration/BitbucketConfiguration";

type RepoSummary = {
  id: number | string;
  name: string;
  fullName: string;
  defaultBranch?: string | null;
};

type RepoConnectorConfig = {
  repoCount?: number;
  repos?: RepoSummary[];
  lastSyncedAt?: string | null;
  lastEventAt?: string | null;
  lastEventType?: string | null;
  lastRepoSeen?: string | null;
  lastIncidentId?: string | null;
  lastIncidentTicketId?: string | null;
  webhookReady?: boolean;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  webhookSecretPreview?: string | null;
  webhookSecretRotatedAt?: string | null;
  authMode?: string;
  appInstallUrl?: string | null;
  installation?: {
    configured?: boolean;
    targetLogin?: string | null;
    installationId?: number | null;
  };
};

type IntegrationRecord = {
  id: string;
  provider: string;
  isActive: boolean;
  config?: RepoConnectorConfig | null;
};

type RepoConnectorView = {
  key: "github" | "gitlab" | "bitbucket";
  label: string;
  description: string;
  ciLabel: string;
  ciDescription: string;
  playbookLabel: string;
  lastIncidentHint: string;
  integration?: IntegrationRecord;
  config: RepoConnectorConfig;
  connected: boolean;
  repoLabel: string;
  metrics: {
    label: string;
    value: string;
    caption: string;
  }[];
};

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  slack: "Slack",
  googlemeet: "Google Meet",
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return "No events yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No events yet";
  return date.toLocaleString();
};

const toConfig = (value?: RepoConnectorConfig | null): RepoConnectorConfig =>
  value ?? {};

const IngestionPage = () => {
  const { get, post } = useFetch();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [configurationTarget, setConfigurationTarget] = useState<
    RepoConnectorView["key"] | null
  >(null);
  const [rotatingSecretKey, setRotatingSecretKey] = useState<string | null>(null);

  useEffect(() => {
    const connected = Array.from(searchParams.entries()).find(
      ([, value]) => value === "connected"
    );

    if (!connected) return;

    const [provider] = connected;
    toast.success(`${PROVIDER_LABELS[provider] ?? provider} connected successfully`);
    router.replace("/incident/settings/ingestion");
  }, [router, searchParams]);

  const { data: integrations = [], isLoading, refetch } = useQuery({
    queryKey: [querykeys.INTEGRATIONS, user?.id],
    queryFn: async () => {
      const res = await get(`${endpoint.incident_ticket.integrations}/${user?.id}`);
      if (res.success) return (res.data?.data ?? []) as IntegrationRecord[];
      return [];
    },
    enabled: !!user?.id,
  });

  const findIntegration = (providerName: string) =>
    integrations.find(
      (integration) =>
        integration.provider.toLowerCase() === providerName.toLowerCase()
    );

  const handleConnect = async (oauthEndpoint: string, label: string) => {
    const res = await get(oauthEndpoint);
    if (res.success) {
      const url = res.data?.data?.url ?? res.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
    }
    toast.error(`Failed to start ${label} connection`);
  };

  const openRoutingConfiguration = (connector: RepoConnectorView) => {
    if (!connector.connected) {
      toast.error(`Connect ${connector.label} before configuring monitored repositories`);
      return;
    }

    setConfigurationTarget(connector.key);
  };

  const openExternal = (url?: string | null, label = "configuration") => {
    if (!url) {
      toast.error(`No ${label} URL is available yet`);
      return;
    }
    window.location.href = url;
  };

  const copyToClipboard = async (value: string | null | undefined, label: string) => {
    if (!value) {
      toast.error(`${label} is not available yet`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  const rotateWebhookSecret = async (connector: RepoConnectorView) => {
    const rotateEndpoint =
      connector.key === "github"
        ? endpoint.integration.github_webhook_secret_rotate
        : connector.key === "gitlab"
          ? endpoint.integration.gitlab_webhook_secret_rotate
          : null;

    if (!rotateEndpoint) {
      toast.error(`${connector.label} webhook secret rotation is not available yet`);
      return;
    }

    setRotatingSecretKey(connector.key);
    try {
      const res = await post(rotateEndpoint);
      if (!res.success) {
        toast.error(
          typeof res.data === "string"
            ? res.data
            : `Unable to rotate ${connector.label} webhook secret`
        );
        return;
      }

      const secret = res.data?.data?.webhookSecret ?? res.data?.webhookSecret;
      if (secret) {
        await copyToClipboard(secret, `${connector.label} webhook secret`);
      }
      toast.success(`${connector.label} webhook secret rotated`);
      await refetch();
    } finally {
      setRotatingSecretKey(null);
    }
  };

  const openLastIncident = (config: RepoConnectorConfig) => {
    if (!config.lastIncidentId) {
      toast.error("No connector-raised incident has been recorded yet");
      return;
    }
    router.push(`/incident?id=${config.lastIncidentId}&tab=overview`);
  };

  const githubIntegration = findIntegration("github");
  const gitlabIntegration = findIntegration("gitlab");
  const bitbucketIntegration = findIntegration("bitbucket");

  const githubConfig = toConfig(githubIntegration?.config);
  const gitlabConfig = toConfig(gitlabIntegration?.config);
  const bitbucketConfig = toConfig(bitbucketIntegration?.config);

  const githubInstalled = Boolean(githubConfig.installation?.configured);

  const repoConnectors: RepoConnectorView[] = [
    {
      key: "github",
      label: "GitHub",
      description:
        "OAuth connects the account, the GitHub app completes webhook delivery, and connector events raise incidents with suggested remediation.",
      ciLabel: "GitHub Actions",
      ciDescription:
        "Workflow run, check, deployment, and protected status events feed auto-incident creation and code-remediation suggestions.",
      playbookLabel: githubInstalled
        ? "default: GitHub failure triage and PR remediation"
        : "default: Install the GitHub app to enable auto-remediation",
      lastIncidentHint:
        "A failed GitHub workflow, check, deployment, or protected status will create the incident and seed remediation automatically.",
      integration: githubIntegration,
      config: githubConfig,
      connected: Boolean(githubIntegration?.isActive),
      repoLabel:
        githubConfig.lastRepoSeen ??
        githubConfig.repos?.[0]?.fullName ??
        "Connect GitHub to map repos",
      metrics: [
        {
          label: "Repos synced",
          value: Boolean(githubIntegration?.isActive)
            ? String(githubConfig.repoCount ?? 0)
            : "--",
          caption: Boolean(githubIntegration?.isActive)
            ? `Last sync: ${formatTimestamp(githubConfig.lastSyncedAt)}`
            : "Connect GitHub to ingest repositories",
        },
        {
          label: "Last event",
          value: githubConfig.lastEventType ?? "Waiting",
          caption: formatTimestamp(githubConfig.lastEventAt),
        },
        {
          label: "Install target",
          value: githubConfig.installation?.targetLogin ?? "Not installed",
          caption: githubConfig.authMode ?? "oauth",
        },
      ],
    },
    {
      key: "gitlab",
      label: "GitLab",
      description:
        "OAuth syncs projects, webhooks ingest pipeline, job, and deployment failures, and connector events seed merge-request-ready remediation.",
      ciLabel: "GitLab CI",
      ciDescription:
        "Pipeline Hook, Job Hook, and Deployment Hook events feed auto-incident creation and remediation guidance.",
      playbookLabel: "default: GitLab pipeline triage and merge request remediation",
      lastIncidentHint:
        "A failed GitLab pipeline, job, or deployment will create the incident and attach remediation context automatically.",
      integration: gitlabIntegration,
      config: gitlabConfig,
      connected: Boolean(gitlabIntegration?.isActive),
      repoLabel:
        gitlabConfig.lastRepoSeen ??
        gitlabConfig.repos?.[0]?.fullName ??
        "Connect GitLab to map projects",
      metrics: [
        {
          label: "Projects synced",
          value: Boolean(gitlabIntegration?.isActive)
            ? String(gitlabConfig.repoCount ?? 0)
            : "--",
          caption: Boolean(gitlabIntegration?.isActive)
            ? `Last sync: ${formatTimestamp(gitlabConfig.lastSyncedAt)}`
            : "Connect GitLab to ingest projects",
        },
        {
          label: "Last event",
          value: gitlabConfig.lastEventType ?? "Waiting",
          caption: formatTimestamp(gitlabConfig.lastEventAt),
        },
        {
          label: "Last project",
          value:
            gitlabConfig.lastRepoSeen ??
            gitlabConfig.repos?.[0]?.fullName ??
            "Waiting",
          caption: gitlabConfig.authMode ?? "oauth",
        },
      ],
    },
    {
      key: "bitbucket",
      label: "Bitbucket",
      description:
        "OAuth syncs repositories, secure webhooks ingest pipeline and deployment failures, and connector events seed PR-based remediation.",
      ciLabel: "Bitbucket Pipelines",
      ciDescription:
        "Pipeline, commit-status, and deployment events feed auto-incident creation and remediation guidance.",
      playbookLabel: "default: Bitbucket pipeline triage and PR remediation",
      lastIncidentHint:
        "A failed Bitbucket pipeline, status check, or deployment will create the incident and seed remediation automatically.",
      integration: bitbucketIntegration,
      config: bitbucketConfig,
      connected: Boolean(bitbucketIntegration?.isActive),
      repoLabel:
        bitbucketConfig.lastRepoSeen ??
        bitbucketConfig.repos?.[0]?.fullName ??
        "Connect Bitbucket to map repositories",
      metrics: [
        {
          label: "Repos synced",
          value: Boolean(bitbucketIntegration?.isActive)
            ? String(bitbucketConfig.repoCount ?? 0)
            : "--",
          caption: Boolean(bitbucketIntegration?.isActive)
            ? `Last sync: ${formatTimestamp(bitbucketConfig.lastSyncedAt)}`
            : "Connect Bitbucket to ingest repositories",
        },
        {
          label: "Last event",
          value: bitbucketConfig.lastEventType ?? "Waiting",
          caption: formatTimestamp(bitbucketConfig.lastEventAt),
        },
        {
          label: "Last repo",
          value:
            bitbucketConfig.lastRepoSeen ??
            bitbucketConfig.repos?.[0]?.fullName ??
            "Waiting",
          caption: bitbucketConfig.authMode ?? "oauth",
        },
      ],
    },
  ];

  const activeConnector =
    repoConnectors.find((connector) => connector.connected) ?? repoConnectors[0];

  return (
    <div>
      <Modal
        isOpen={configurationTarget === "github"}
        onClose={() => setConfigurationTarget(null)}
      >
        <GithubConfiguration />
      </Modal>
      <Modal
        isOpen={configurationTarget === "gitlab"}
        onClose={() => setConfigurationTarget(null)}
      >
        <GitlabConfiguration />
      </Modal>
      <Modal
        isOpen={configurationTarget === "bitbucket"}
        onClose={() => setConfigurationTarget(null)}
      >
        <BitbucketConfiguration />
      </Modal>
      <SettingWrapper
        title="CI/CD & PR Ingestion"
        description="Where delivery incidents come from"
        sub="Connect Git providers and CI to auto-raise incidents and generate safe PR-based remediation."
      >
        <div className="grid 2xl:grid-cols-2 gap-8 pt-5 items-start">
          <section className="bg-transparent border border-slate-300 dark:border-white/10 rounded-[24px] p-6 space-y-5">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">Git providers</h3>
              <ChevronRight size={18} className="text-slate-500 dark:text-slate-400" />
            </div>

            <div className="space-y-4">
              {repoConnectors.map((connector) => {
                const isGitHub = connector.key === "github";
                const canInstallGitHubApp =
                  isGitHub &&
                  Boolean(connector.config.appInstallUrl) &&
                  !githubInstalled;

                return (
                  <RepoConnectorCard
                    key={connector.key}
                    label={connector.label}
                    description={connector.description}
                    isConnected={connector.connected}
                    metrics={connector.metrics}
                    lastIncidentId={connector.config.lastIncidentId}
                    lastIncidentTicketId={connector.config.lastIncidentTicketId}
                    lastIncidentHint={connector.lastIncidentHint}
                    webhookUrl={connector.config.webhookUrl}
                    webhookSecret={connector.config.webhookSecret}
                    webhookSecretPreview={connector.config.webhookSecretPreview}
                    webhookSecretRotatedAt={connector.config.webhookSecretRotatedAt}
                    isSecretRotating={rotatingSecretKey === connector.key}
                    onCopyWebhookUrl={() =>
                      copyToClipboard(connector.config.webhookUrl, `${connector.label} webhook URL`)
                    }
                    onCopyWebhookSecret={() =>
                      copyToClipboard(connector.config.webhookSecret, `${connector.label} webhook secret`)
                    }
                    onRotateWebhookSecret={() => rotateWebhookSecret(connector)}
                    onOpenLastIncident={() => openLastIncident(connector.config)}
                    controls={
                      isLoading ? (
                        <Loader2 size={16} className="animate-spin text-slate-500 dark:text-slate-400" />
                      ) : connector.connected ? (
                        <>
                          <StatusBadge
                            label="Connected"
                            icon={<Check size={14} />}
                          />
                          <StatusBadge
                            label={
                              connector.config.webhookReady
                                ? "Webhook Ready"
                                : "Webhook Pending"
                            }
                          />
                          {isGitHub ? (
                            <StatusBadge
                              label={githubInstalled ? "App Installed" : "Install App"}
                            />
                          ) : null}
                          {canInstallGitHubApp ? (
                            <ActionButton
                              label="Install App"
                              onClick={() =>
                                openExternal(connector.config.appInstallUrl, "install")
                              }
                            />
                          ) : (
                            <ActionButton
                              label="Reconnect"
                              onClick={() =>
                                handleConnect(
                                  connector.key === "github"
                                    ? endpoint.integration.github
                                    : connector.key === "gitlab"
                                      ? endpoint.integration.gitlab
                                      : endpoint.integration.bitbucket,
                                  connector.label
                                )
                              }
                            />
                          )}
                        </>
                      ) : (
                        <ActionButton
                          label="Connect"
                          color="cyan"
                          onClick={() =>
                            handleConnect(
                              connector.key === "github"
                                ? endpoint.integration.github
                                : connector.key === "gitlab"
                                  ? endpoint.integration.gitlab
                                  : endpoint.integration.bitbucket,
                              connector.label
                            )
                          }
                        />
                      )
                    }
                  />
                );
              })}
            </div>
          </section>

          <section className="bg-transparent border border-slate-300 dark:border-white/10 rounded-[24px] p-6 space-y-5">
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">CI/CD sources</h3>
              <ChevronRight size={18} className="text-slate-500 dark:text-slate-400" />
            </div>

            <div className="space-y-4">
                {repoConnectors.map((connector) => (
                <div
                  key={connector.ciLabel}
                  className="p-5 border border-slate-300 dark:border-white/10 rounded-2xl space-y-3 bg-white dark:bg-slate-950/80"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <span className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">
                        {connector.ciLabel}
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-normal mt-2">
                        {connector.ciDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={
                          connector.connected && connector.config.webhookReady
                            ? "Live"
                            : "Waiting on webhook"
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-5 border border-slate-300 dark:border-white/10 rounded-2xl space-y-3 bg-white dark:bg-slate-950/80">
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">Jenkins</span>
                  <ActionButton
                    label="Configure"
                    color="cyan"
                    onClick={() => router.push("/connections?integration=jenkins")}
                  />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-normal">
                  Build hooks and log ingestion are still pending implementation.
                </p>
              </div>

              <div className="p-5 border border-slate-300 dark:border-white/10 rounded-2xl space-y-4 bg-white dark:bg-slate-950/80">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">
                      Delivery incident routing
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-normal">
                      Connector metadata seeds which repo and playbook will be
                      used when a failure auto-raises an incident.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openRoutingConfiguration(activeConnector)}
                    disabled={!activeConnector.connected}
                    className="text-IMSCyan border border-IMSCyan px-3 py-1 rounded-lg text-xs font-bold hover:bg-IMSCyan/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 border border-slate-300 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                    <Database size={14} className="text-pink-400 dark:text-pink-300" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {activeConnector.repoLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 border border-slate-300 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                    <Book size={14} className="text-yellow-400 dark:text-yellow-300" />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {activeConnector.playbookLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pt-6 flex justify-end">
          <CButton
            className="w-fit px-4"
            onClick={() =>
              activeConnector.connected
                ? openRoutingConfiguration(activeConnector)
                : handleConnect(
                    activeConnector.key === "github"
                      ? endpoint.integration.github
                      : activeConnector.key === "gitlab"
                        ? endpoint.integration.gitlab
                        : endpoint.integration.bitbucket,
                    activeConnector.label
                  )
            }
          >
            {activeConnector.connected
              ? `Configure ${activeConnector.label}`
              : `Connect ${activeConnector.label}`}
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};

const RepoConnectorCard = ({
  label,
  description,
  controls,
  isConnected,
  metrics,
  lastIncidentId,
  lastIncidentTicketId,
  lastIncidentHint,
  webhookUrl,
  webhookSecret,
  webhookSecretPreview,
  webhookSecretRotatedAt,
  isSecretRotating,
  onCopyWebhookUrl,
  onCopyWebhookSecret,
  onRotateWebhookSecret,
  onOpenLastIncident,
}: {
  label: string;
  description: string;
  controls: ReactNode;
  isConnected: boolean;
  metrics: {
    label: string;
    value: string;
    caption: string;
  }[];
  lastIncidentId?: string | null;
  lastIncidentTicketId?: string | null;
  lastIncidentHint: string;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  webhookSecretPreview?: string | null;
  webhookSecretRotatedAt?: string | null;
  isSecretRotating?: boolean;
  onCopyWebhookUrl: () => void;
  onCopyWebhookSecret: () => void;
  onRotateWebhookSecret: () => void;
  onOpenLastIncident: () => void;
}) => (
  <div className="p-5 border border-slate-300 dark:border-white/10 rounded-2xl space-y-4 bg-white dark:bg-slate-950/80">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <span className="text-slate-900 dark:text-slate-100 text-[15px] font-bold">{label}</span>
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-normal max-w-[30rem]">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{controls}</div>
    </div>

    <div className="grid gap-3 md:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          caption={metric.caption}
        />
      ))}
    </div>

    {isConnected ? (
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-slate-900/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Last auto-raised incident
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {lastIncidentTicketId ?? "Waiting for a connector event"}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{lastIncidentHint}</p>
            </div>
            <ActionButton
              label="Open last incident"
              onClick={onOpenLastIncident}
              disabled={!lastIncidentId}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-IMSCyan/20 bg-white dark:bg-slate-950/80 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Provider webhook setup
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Use this URL and workspace secret in {label} webhook settings.
              </p>
            </div>
            <ActionButton
              label={isSecretRotating ? "Rotating" : "Rotate secret"}
              onClick={onRotateWebhookSecret}
              disabled={isSecretRotating}
            />
          </div>

          <SecretRow
            label="Webhook URL"
            value={webhookUrl ?? "Webhook URL unavailable"}
            onCopy={onCopyWebhookUrl}
          />
          <SecretRow
            label="Workspace secret"
            value={webhookSecret ?? webhookSecretPreview ?? "Secret unavailable"}
            onCopy={onCopyWebhookSecret}
          />
          <p className="text-[10px] text-slate-600 dark:text-slate-400">
            Last rotated: {formatTimestamp(webhookSecretRotatedAt)}
          </p>
        </div>
      </div>
    ) : null}
  </div>
);

const SecretRow = ({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-3 py-2">
    <div className="min-w-0 flex-1">
      <p className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</p>
      <p className="truncate font-mono text-xs text-slate-700 dark:text-slate-300">{value}</p>
    </div>
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg border border-IMSCyan/40 p-2 text-IMSCyan hover:bg-IMSCyan/10"
      aria-label={`Copy ${label}`}
    >
      <Copy size={14} />
    </button>
  </div>
);

const StatusBadge = ({
  label,
  icon,
}: {
  label: string;
  icon?: ReactNode;
}) => (
  <div className="flex items-center gap-1.5 px-3 py-1 border border-IMSCyan/50 rounded-full bg-white dark:bg-slate-900/40">
    {icon ? <span className="text-IMSCyan">{icon}</span> : null}
    <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
      {label}
    </span>
  </div>
);

const ActionButton = ({
  label,
  color,
  onClick,
  disabled,
}: {
  label: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border text-IMSCyan border-IMSCyan hover:bg-IMSCyan/5 ${
      disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""
    }`}
  >
    {label}
  </button>
);

const MetricCard = ({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) => (
  <div className="rounded-2xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-slate-900/40 p-4">
    <p className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
    <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{caption}</p>
  </div>
);

export default IngestionPage;
