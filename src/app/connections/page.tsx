"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineCloud, AiOutlineKubernetes } from "react-icons/ai";
import { BiGitRepoForked, BiGrid, BiLogoMongodb } from "react-icons/bi";
import { BsDatabase } from "react-icons/bs";
import { CgNotes } from "react-icons/cg";
import { FaArrowsRotate } from "react-icons/fa6";
import { GoShield } from "react-icons/go";
import { IoCubeOutline } from "react-icons/io5";
import { LuGitPullRequest, LuPuzzle } from "react-icons/lu";
import { MdOutlineOfflineBolt } from "react-icons/md";
import { PiPlugBold } from "react-icons/pi";
import { RiGithubLine, RiGitlabLine, RiShieldFlashLine } from "react-icons/ri";
import { RxStack } from "react-icons/rx";
import { TbBrandBitbucket } from "react-icons/tb";
import { VscAzure, VscTypeHierarchy } from "react-icons/vsc";
import { WiNightCloudy } from "react-icons/wi";
import ConfigureIntegration from "./ConfigureIntegration";

const integrationModel = [
  { name: "github",       title: "Github",              subtitle: "App install . org/repo",        Icon: RiGithubLine     },
  { name: "gitlab",       title: "Gitlab",              subtitle: "Cloud or self hosted",           Icon: RiGitlabLine     },
  { name: "bitbucket",    title: "Bitbucket",           subtitle: "Workspace Integration",          Icon: TbBrandBitbucket },
  { name: "azure-devops", title: "Azure Devops / other",subtitle: "Projects & repos",               Icon: VscAzure         },
];

const deploymentModel = [
  { name: "github-actions",  title: "GitHub Actions",         subtitle: "Auto-detected from GitHub repos", Icon: RiGithubLine     },
  { name: "gitlab-ci",       title: "GitLab CI",              subtitle: "Pipelines & environments",        Icon: RiGitlabLine     },
  { name: "circle-ci",       title: "CircleCI",               subtitle: "Jobs & Workflows",                Icon: FaArrowsRotate   },
  { name: "jenkins",         title: "Jenkins",                subtitle: "Webhooks & job mapping",          Icon: VscTypeHierarchy },
  { name: "azure-pipelines", title: "Azure Pipelines / Other",subtitle: "Multi-cloud CI/CD",               Icon: VscTypeHierarchy },
  { name: "cicd-custom",     title: "Other CI/CD",            subtitle: "Generic webhooks / API",          Icon: PiPlugBold       },
];

const containersModel = [
  { name: "docker",         title: "Docker Hub",          subtitle: "Image tags & digests",       Icon: IoCubeOutline      },
  { name: "amazon-ecr",     title: "Amazon ECR",          subtitle: "AWS container registry",     Icon: AiOutlineCloud     },
  { name: "gcr-artifact",   title: "GCR / Artifact",      subtitle: "Google container registry",  Icon: WiNightCloudy      },
  { name: "kubernetes-eks", title: "Kubernetes - EKS",    subtitle: "AWS cluster mapping",        Icon: AiOutlineKubernetes},
  { name: "kubernetes-gke", title: "Kubernetes - GKE/AKS",subtitle: "Cluster & namespace view",   Icon: BiGrid             },
  { name: "runtime-custom", title: "Other Kubernetes",    subtitle: "Read-only kubeconfig",       Icon: CgNotes            },
];

const databaseModel = [
  { name: "postgres",         title: "Postgres SQL",    subtitle: "Read replica / analytics DB",  Icon: BsDatabase   },
  { name: "mysql",            title: "MySQL / MariaDB", subtitle: "Replica / reporting DB",       Icon: LuPuzzle     },
  { name: "mongodb",          title: "MongoDB",         subtitle: "Operational data",             Icon: BiLogoMongodb},
  { name: "snowflake",        title: "Snowflake",       subtitle: "Warehouse metrics",            Icon: RxStack      },
  { name: "bigquery",         title: "BigQuery / DWH",  subtitle: "Analytics / Layer",            Icon: LuPuzzle     },
  { name: "datastore-custom", title: "Other DB / JDBC", subtitle: "Custom read-only connector",   Icon: LuPuzzle     },
];

const fraudModel = [
  { name: "internal-fraud",    title: "Internal Fraud DB",     subtitle: "Risk metrics & watchlists",  Icon: RiShieldFlashLine  },
  { name: "events-stream",     title: "Events / stream",       subtitle: "Kafka / Kinesis / Pub-sub",  Icon: LuPuzzle           },
  { name: "third-party",       title: "Third-Party risk APIs", subtitle: "Device / behaviour / KYC",   Icon: LuGitPullRequest   },
  { name: "scrubbe-fraud-api", title: "Scrubbe Fraud API",     subtitle: "Native risks & Signals",     Icon: LuPuzzle           },
  { name: "fraud-custom",      title: "Custom Fraud Signals",  subtitle: "HTTP / stream ingestion",    Icon: MdOutlineOfflineBolt},
];

const CONFIGURATION_SECTIONS = [
  { modalType: "code_repos",    items: integrationModel  },
  { modalType: "cicd",          items: deploymentModel   },
  { modalType: "runtime",       items: containersModel   },
  { modalType: "datastores",    items: databaseModel     },
  { modalType: "fraud_metrics", items: fraudModel        },
] as const;

const findConfigurationPreset = (integrationName: string) => {
  const normalized = integrationName.trim().toLowerCase();
  for (const section of CONFIGURATION_SECTIONS) {
    const match = section.items.find((item) => item.name === normalized);
    if (match) return { modalType: section.modalType, integration: match.title, integrationType: match.name };
  }
  return null;
};

const Page = () => {
  const [modalType, setModalType]           = useState("none");
  const [isOpen, setIsOpen]                 = useState(false);
  const [integration, setIntegration]       = useState("");
  const [integrationType, setIntegrationType] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const requested = searchParams.get("integration");
    if (!requested) return;
    const preset = findConfigurationPreset(requested);
    if (!preset) return;
    setIsOpen(true);
    setModalType(preset.modalType);
    setIntegration(preset.integration);
    setIntegrationType(preset.integrationType);
  }, [searchParams]);

  const openModal = (type: string, title: string, name: string) => {
    setIsOpen(true);
    setModalType(type);
    setIntegration(title);
    setIntegrationType(name);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen text-black dark:text-zinc-200 font-sans p-10">
      {isOpen && (
        <ConfigureIntegration
          open={isOpen}
          setOpen={setIsOpen}
          type={modalType}
          integration={integration}
          integrationType={integrationType}
        />
      )}

      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-black dark:text-zinc-100 mb-3">
              Connect your engineering stack
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Scrubbe turns failed deployments, fraud spikes and noisy alerts into signal-rich incidents
              with fix-ready code. Wire in your repos, pipelines, runtimes, data and fraud signals so
              Code Engine and Ezra can see everything that matters.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-1.5 border border-zinc-500 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => router.push("/incident")}
          >
             Back
          </button>
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-3">
          {[
            { icon: <BiGitRepoForked size={13} />, label: "Step 1 of 3 · Engineering graph" },
            { icon: <GoShield size={13} />,        label: "Read-only integration model"     },
          ].map(({ icon, label }) => (
            <div key={label} className="px-3 py-1.5 flex items-center gap-2 border border-zinc-500 dark:border-zinc-700 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 rounded-md">
              {icon} {label}
            </div>
          ))}
        </div>

        <div className="flex gap-10">
          <div className="space-y-6 flex-1">

            {/* Step 1 */}
            <StepWrapper title="1. CODE & REPOS  ( REQUIRED )" subtitle="Where your services and deployments live." description="Scrubbe watches commits and deployment statuses here so it can raise incidents when something breaks and suggest fixes with Code Engine." tag="Read-only integration model" footer="At least one repo provider must be connected before you continue. You can fine-tune which repos and services Scrubbe watches later.">
              <div className="grid grid-cols-3 gap-4">
                {integrationModel.map(({ Icon, ...rest }) => (
                  <IntegrationCard key={rest.name} Icon={Icon} title={rest.title} subtitle={rest.subtitle} onClick={() => openModal("code_repos", rest.title, rest.name)} />
                ))}
              </div>
            </StepWrapper>

            {/* Step 2 */}
            <StepWrapper title="2. CI/CD PIPELINES ( RECOMMENDED )" subtitle="See failed deployments the moment they happen." description='Scrubbe correlates pipeline runs with incidents so you can see "this deploy broke that service" and let Code Engine propose the safest fix path.' tag="MTTR & deployment analytics" footer='CI/CD integrations help Scrubbe compute deployment velocity, MTTR and "blast radius" for incidents.'>
              <div className="grid grid-cols-3 gap-4">
                {deploymentModel.map(({ Icon, ...rest }) => (
                  <IntegrationCard key={rest.name} Icon={Icon} title={rest.title} subtitle={rest.subtitle} onClick={() => openModal("cicd", rest.title, rest.name)} />
                ))}
              </div>
            </StepWrapper>

            {/* Step 3 */}
            <StepWrapper title="3. RUNTIME & CLUSTERS" subtitle="Map incidents to real containers and pods." description='Connect Docker registries and Kubernetes clusters so Scrubbe can see which images and pods are behind a failing deploy and surface that context in incidents.' tag="Optional but powerful" footer='These connections let Scrubbe answer "which image / pod is behind this incident?" without leaving the UI.'>
              <div className="grid grid-cols-3 gap-4">
                {containersModel.map(({ Icon, ...rest }) => (
                  <IntegrationCard key={rest.name} Icon={Icon} title={rest.title} subtitle={rest.subtitle} onClick={() => openModal("runtime", rest.title, rest.name)} />
                ))}
              </div>
            </StepWrapper>

            {/* Step 4 */}
            <StepWrapper title="4. DATASTORES & WAREHOUSES" subtitle="Know the real impact: rows, records and money." description="Connect read replicas or analytics warehouses so Scrubbe and Ezra can quantify impact, potential loss and affected customers without touching production write paths." tag="Impact & loss analysis" footer="Use replicas or warehouses, not primary write nodes. Scrubbe needs enough data to understand impact, not to run your production workloads.">
              <div className="grid grid-cols-3 gap-4">
                {databaseModel.map(({ Icon, ...rest }) => (
                  <IntegrationCard key={rest.name} Icon={Icon} title={rest.title} subtitle={rest.subtitle} onClick={() => openModal("datastores", rest.title, rest.name)} />
                ))}
              </div>
            </StepWrapper>

            {/* Step 5 */}
            <StepWrapper title="5. FRAUD METRICS & SIGNALS" subtitle='Teach incidents what "bad money" looks like.' description="Connect your fraud and risk signals so Scrubbe can tell the difference between a noisy technical incident and a real fraud or abuse event that needs leadership attention." tag="Money & abuse awareness" footer='Fraud integrations are optional, but if you are a payments or fintech business this is where Scrubbe becomes "fraud-aware", not just "infra-aware".'>
              <div className="grid grid-cols-3 gap-4">
                {fraudModel.map(({ Icon, ...rest }) => (
                  <IntegrationCard key={rest.name} Icon={Icon} title={rest.title} subtitle={rest.subtitle} onClick={() => openModal("fraud_metrics", rest.title, rest.name)} />
                ))}
              </div>
            </StepWrapper>

            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-sm text-black dark:text-zinc-400">
                Once connected, Scrubbe will start listening for failed deployments, anomalies and fraud patterns and map them into incidents.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex-[0.5] space-y-6">
            {[
              {
                title: "What Scrubbe will do",
                items: [
                  "Watch for failed deployments, critical fraud spikes and broken flows tied to your services.",
                  "Raise signal-rich incidents instead of generic tickets, with code, pipelines, runtimes, data and fraud context linked.",
                  "Feed Code Engine and Ezra so they can propose fixes and summarise differently for leaders, SREs and fraud teams.",
                ],
              },
              {
                title: "Access & security",
                items: [
                  "No write access granted to code, clusters or databases.",
                  "Secrets and tokens stored encrypted at rest.",
                  "You can revoke any integration at any time from Settings > Integrations.",
                ],
              },
            ].map(({ title, items }) => (
              <div key={title} className="border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-6 rounded-xl">
                <h3 className="text-[14px] font-semibold text-black dark:text-zinc-100 mb-3">{title}</h3>
                <ul className="list-disc pl-4 space-y-2">
                  {items.map((item) => (
                    <li key={item} className="text-[13px] text-black dark:text-zinc-400 leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </div>
      </div>
   );
};

export default Page;

// ── StepWrapper — original structure, gradient removed ────────────

const StepWrapper = ({
  subtitle, title, description, children, footer, tag,
}: {
  title: string; description: string; subtitle: string;
  children: ReactNode; footer: string; tag: string;
}) => (
  <div className="border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 rounded-xl transition-all overflow-clip">
    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-black dark:text-zinc-100 uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-black dark:text-zinc-200 text-sm font-semibold">{subtitle}</p>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-lg">{description}</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black dark:text-zinc-400 shrink-0 ml-4">
        <GoShield size={14} />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{tag}</span>
      </div>
    </div>
    <div className="px-4 py-4">
      {children}
      <p className="text-zinc-500 dark:text-zinc-400 text-sm pt-6">{footer}</p>
    </div>
  </div>
);

// ── Integration card ──────────────────────────────────────────────

const IntegrationCard = ({
  Icon, title, subtitle, onClick,
}: {
  Icon: React.ElementType; title: string; subtitle: string; onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/40 rounded-lg p-2 flex justify-between gap-2 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
  >
    <div className="flex gap-2 items-center">
      <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex justify-center items-center border border-zinc-500 dark:border-zinc-700 shrink-0">
        <Icon className="size-5 text-black dark:text-zinc-400" />
      </div>
      <div>
        <p className="text-[13px] text-black dark:text-zinc-100 font-semibold leading-tight">{title}</p>
        <p className="text-[11px] text-black dark:text-zinc-400">{subtitle}</p>
      </div>
    </div>
    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 underline underline-offset-2 shrink-0 self-center">
      Configure
    </span>
  </div>
);