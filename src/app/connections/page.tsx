"use client";
import React, { ReactNode, useState } from "react";
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
  {
    name: "github",
    title: "Github",
    subtitle: "App install . org/repo",
    Icon: RiGithubLine,
  },
  {
    name: "gitlab",
    title: "Gitlab",
    subtitle: "Cloud or self hosted",
    Icon: RiGitlabLine,
  },
  {
    name: "bitbucket",
    title: "Bitbucket",
    subtitle: "Workspace Integration",
    Icon: TbBrandBitbucket,
  },
  {
    name: "azure",
    title: "Azure Devops/ other",
    subtitle: "Projects & repos",
    Icon: VscAzure,
  },
  // {
  //     name: "azure",
  //     title: "Azure Devops/ other",
  //     subtitle: "Projects & repos",
  //     Icon: VscAzure,
  // },
];

const deploymentModel = [
  {
    name: "github-actions",
    title: "GitHub Actions",
    subtitle: "Auto-detected from GitHub repos",
    Icon: RiGithubLine,
  },
  {
    name: "gitlab-ci",
    title: "GitLab CI",
    subtitle: "Pipelines & environments",
    Icon: RiGitlabLine,
  },
  {
    name: "circle-ci",
    title: "CircleCI",
    subtitle: "Jobs & Workflows",
    Icon: FaArrowsRotate,
  },
  {
    name: "jenkins",
    title: "Jenkins",
    subtitle: "Webhooks & job mapping",
    Icon: VscTypeHierarchy,
  },
  {
    name: "azure-pipelines",
    title: "Azure Pipelines / Other",
    subtitle: "Multi-cloud CI/CD",
    Icon: VscTypeHierarchy,
  },
  {
    name: "others",
    title: "Other CI/CD",
    subtitle: "Generic webhooks / API",
    Icon: PiPlugBold,
  },
  // {
  //     name: "azure",
  //     title: "Azure Devops/ other",
  //     subtitle: "Projects & repos",
  //     Icon: VscAzure,
  // },
];
const containersModel = [
  {
    name: "docker",
    title: "Docker Hub",
    subtitle: "Image tags & digests",
    Icon: IoCubeOutline,
  },
  {
    name: "amazon-ecr",
    title: "Amazon ECR",
    subtitle: "AWS container registry",
    Icon: AiOutlineCloud,
  },
  {
    name: "grc",
    title: "GCR / Artifact",
    subtitle: "Google container registry",
    Icon: WiNightCloudy,
  },
  {
    name: "kubernetes-eks",
    title: "Kubernetes - EKS",
    subtitle: "AWS cluster mapping",
    Icon: AiOutlineKubernetes,
  },
  {
    name: "kubernetes-gke",
    title: "Kubernetes - GKE/AKS",
    subtitle: "Cluster & namespace view",
    Icon: BiGrid,
  },
  {
    name: "others",
    title: "Other  Kubernates",
    subtitle: "Read-only kubeconfig",
    Icon: CgNotes,
  },
];

const databaseModel = [
  {
    name: "postgres",
    title: "Postgres SQL",
    subtitle: "Read replica / analytics DB",
    Icon: BsDatabase,
  },
  {
    name: "mysql",
    title: "MySQL / MariaDB",
    subtitle: "Replica / reporting DB",
    Icon: LuPuzzle,
  },
  {
    name: "mongodb",
    title: "MongoDB",
    subtitle: "Operational data",
    Icon: BiLogoMongodb,
  },
  {
    name: "Snowflake",
    title: "Snowflake",
    subtitle: "Warehouse metrics",
    Icon: RxStack,
  },
  {
    name: "bigquery",
    title: "BigQuery / DWH",
    subtitle: "Analytics / Lawyer",
    Icon: LuPuzzle,
  },
  {
    name: "others",
    title: "Other DB / JDBC",
    subtitle: "Custom read -only connector",
    Icon: LuPuzzle,
  },
];

const fraudModel = [
  {
    name: "internal-fraud",
    title: "Internal Fraud DB",
    subtitle: "Risk metrics & watchlists",
    Icon: RiShieldFlashLine,
  },
  {
    name: "events-stream",
    title: "Events / stream",
    subtitle: "Kafta / Kinesis / Pub-sub",
    Icon: LuPuzzle,
  },

  {
    name: "third-party",
    title: "Third-Party risk APIs",
    subtitle: "Device / behaviour / KYC",
    Icon: LuGitPullRequest,
  },
  {
    name: "scrubbe",
    title: "Scrubbe  Fraud API",
    subtitle: "Native risks & Signals",
    Icon: LuPuzzle,
  },
  {
    name: "others",
    title: "Custom Fraud Signals",
    subtitle: "HTTP / stream ingestion",
    Icon: MdOutlineOfflineBolt,
  },
];
const Page = () => {
  const [modalType, setModalType] = useState("none");
  const [isOpen, setIsOpen] = useState(false);
  const [integration, setIntegration] = useState("");
  return (
    <div className="bg-[#08132F] min-h-screen text-[#D1D5DB] font-sans p-10">
      {isOpen && (
        <ConfigureIntegration
          open={isOpen}
          setOpen={setIsOpen}
          type={modalType}
          integration={integration}
        />
      )}
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex justify-between items-start mb-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-white mb-3">
              Connect your engineering stack{" "}
            </h1>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Scrubbe turns failed deployments, fraud spikes and noisy alerts
              into signal-rich incidents with fix-ready code. Wire in your
              repos, pipelines, runtimes, data and fraud signals so Code Engine
              and Ezra can see everything that matters.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-1.5 border border-white rounded text-xs font-bold text-white hover:bg-transparent"
          >
            Skip for now
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="px-4 py-1.5 flex items-center gap-2 border border-gray-400  text-xs font-bold text-white hover:bg-transparent rounded-md">
            <BiGitRepoForked size={14} />
            Step 1 of 3 · Engineering graph{" "}
          </div>
          <div className="px-4 py-1.5 flex items-center gap-2 border border-gray-400  text-xs font-bold text-white hover:bg-transparent rounded-md">
            <GoShield size={14} />
            Read-only integration model{" "}
          </div>
        </div>

        <div className="flex gap-10">
          <div className="space-y-6 flex-1">
            <StepWrapper
              title="1. CODE & REPOS  ( REQUIRED )"
              subtitle="Where your services and deployments live."
              description="Scrubbe watches commits and deployment statuses here so it can raise incidents when something breaks and suggest fixes with Code Engine."
              tag="Read-only integration model"
              footer="At least one repo provider must be connected before you continue. You can fine-tune which repos and services Scrubbe watches later."
            >
              <div className="grid grid-cols-3 gap-4">
                {integrationModel.map(({ Icon, ...rest }) => (
                  <div
                    key={rest.name}
                    className="border border-white/50 rounded-lg p-2 flex justify-between gap-2"
                    onClick={() => {
                      setIsOpen(true);
                      setModalType("code_repos");
                      setIntegration(rest.title);
                    }}
                  >
                    <div className="flex gap-2 items-center">
                      <div className=" size-9 rounded-full bg-[#08132F] flex justify-center items-center border border-gray-400">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-base text-white font-semibold">
                          {rest.title}
                        </p>
                        <p className="text-sm">{rest.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-IMSCyan underline underline-offset-2 text-sm cursor-pointer">
                      Configure
                    </div>
                  </div>
                ))}
              </div>
            </StepWrapper>
            <StepWrapper
              title="2. CI/CD PIPELINES ( RECOMMENDED )"
              subtitle="See failed deployments the moment they happen."
              description="Scrubbe correlates pipeline runs with incidents so you can see “this deploy broke that service” and let Code Engine propose the safest fix path."
              tag="MTTR & deployment analytics"
              footer="CI/CD integrations help Scrubbe compute deployment velocity, MTTR and “blast radius” for incidents."
            >
              <div className="grid grid-cols-3 gap-4">
                {deploymentModel.map(({ Icon, ...rest }) => (
                  <div
                    key={rest.name}
                    onClick={() => {
                      setIsOpen(true);
                      setModalType("cicd");
                      setIntegration(rest.title);
                    }}
                    className="border border-white/50 rounded-lg p-2 flex justify-between gap-2"
                  >
                    <div className="flex gap-2 items-center">
                      <div className=" size-9 rounded-full bg-[#08132F] flex justify-center items-center border border-gray-400">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-base text-white font-semibold">
                          {rest.title}
                        </p>
                        <p className="text-sm">{rest.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-IMSCyan underline underline-offset-2 text-sm cursor-pointer">
                      Configure
                    </div>
                  </div>
                ))}
              </div>
            </StepWrapper>
            <StepWrapper
              title="3. RUNTIME & CLUSTERS"
              subtitle="Map incidents to real containers and pods."
              description="Connect Docker registries and Kubernetes clusters so Scrubbe can see which images and pods are behind a failing deploy and surface that context in incidents."
              tag="Optional but powerful"
              footer="These connections let Scrubbe answer “which image / pod is behind this incident?” without leaving the UI."
            >
              <div className="grid grid-cols-3 gap-4">
                {containersModel.map(({ Icon, ...rest }) => (
                  <div
                    key={rest.name}
                    onClick={() => {
                      setIsOpen(true);
                      setModalType("runtime");
                      setIntegration(rest.title);
                    }}
                    className="border border-white/50 rounded-lg p-2 flex justify-between gap-2"
                  >
                    <div className="flex gap-2 items-center">
                      <div className=" size-9 rounded-full bg-[#08132F] flex justify-center items-center border border-gray-400">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-base text-white font-semibold">
                          {rest.title}
                        </p>
                        <p className="text-sm">{rest.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-IMSCyan underline underline-offset-2 text-sm cursor-pointer">
                      Configure
                    </div>
                  </div>
                ))}
              </div>
            </StepWrapper>
            <StepWrapper
              title="4. DATASTORES & WAREHOUSES"
              subtitle="Know the real impact: rows, records and money."
              description="Connect read replicas or analytics warehouses so Scrubbe and Ezra can quantify impact, potential loss and affected customers without touching production write paths."
              tag="Impact & loss analysis"
              footer="Use replicas or warehouses, not primary write nodes. Scrubbe needs enough data to understand impact, not to run your production workloads."
            >
              <div className="grid grid-cols-3 gap-4">
                {databaseModel.map(({ Icon, ...rest }) => (
                  <div
                    key={rest.name}
                    onClick={() => {
                      setIsOpen(true);
                      setModalType("datastores");
                      setIntegration(rest.title);
                    }}
                    className="border border-white/50 rounded-lg p-2 flex justify-between gap-2"
                  >
                    <div className="flex gap-2 items-center">
                      <div className=" size-9 rounded-full bg-[#08132F] flex justify-center items-center border border-gray-400">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-base text-white font-semibold">
                          {rest.title}
                        </p>
                        <p className="text-sm">{rest.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-IMSCyan underline underline-offset-2 text-sm cursor-pointer">
                      Configure
                    </div>
                  </div>
                ))}
              </div>
            </StepWrapper>
            <StepWrapper
              title="5. FRAUD METRICS & SIGNALS"
              subtitle="Teach incidents what “bad money” looks like."
              description="Connect your fraud and risk signals so Scrubbe can tell the difference between a noisy technical incident and a real fraud or abuse event that needs leadership attention."
              tag="Money & abuse awareness"
              footer="Fraud integrations are optional, but if you’re a payments or fintech business this is where Scrubbe becomes “fraud-aware”, not just “infra-aware”."
            >
              <div className="grid grid-cols-3 gap-4">
                {fraudModel.map(({ Icon, ...rest }) => (
                  <div
                    key={rest.name}
                    onClick={() => {
                      setIsOpen(true);
                      setModalType("fraud_metrics");
                      setIntegration(rest.title);
                    }}
                    className="border border-white/50 rounded-lg p-2 flex justify-between gap-2"
                  >
                    <div className="flex gap-2 items-center">
                      <div className=" size-9 rounded-full bg-[#08132F] flex justify-center items-center border border-gray-400">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-base text-white font-semibold">
                          {rest.title}
                        </p>
                        <p className="text-sm">{rest.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-IMSCyan underline underline-offset-2 text-sm cursor-pointer">
                      Configure
                    </div>
                  </div>
                ))}
              </div>
            </StepWrapper>
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-green" />
              <p className="text-sm">
                Once connected, Scrubbe will start listening for failed
                deployments, anomalies and fraud patterns and map them into
                incidents.
              </p>
            </div>
          </div>

          <aside className="flex-[.5] space-y-6 ">
            <div className="border-zinc-400 border bg-[#08132F] p-6 rounded-lg">
              <h3 className="text-base font-bold text-white mb-1">
                What Scrubbe will do{" "}
              </h3>

              <ul className="list-disc pl-3 space-y-2">
                <li className="text-sm text-white font-medium">
                  Watch for failed deployments, critical fraud spikes and broken
                  flows tied to your services.
                </li>
                <li className="text-sm text-white font-medium">
                  Raise signal-rich incidents instead of generic tickets, with
                  code, pipelines, runtimes, data and fraud context linked.
                </li>
                <li className="text-sm text-white font-medium">
                  Feed Code Engine and Ezra so they can propose fixes and
                  summarise differently for leaders, SREs and fraud teams.
                </li>
              </ul>
            </div>

            <div className="border-zinc-400 border bg-[#08132F] p-6 rounded-lg">
              <h3 className="text-base font-bold text-white mb-1">
                Access & security{" "}
              </h3>

              <ul className="list-disc pl-3 space-y-2">
                <li className="text-sm text-white font-medium">
                  No write access granted to code, clusters or databases.
                </li>
                <li className="text-sm text-white font-medium">
                  Secrets and tokens stored encrypted at rest.
                </li>
                <li className="text-sm text-white font-medium">
                  You can revoke any integration at any time from Settings {">"}{" "}
                  Integrations.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Page;

const StepWrapper = ({
  subtitle,
  title,
  description,
  children,
  footer,
  tag,
}: {
  title: string;
  description: string;
  subtitle: string;
  children: ReactNode;
  footer: string;
  tag: string;
}) => (
  <div
    className={`bg-gradient-to-b from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip`}
  >
    <div className="p-4 border-b border-[#1F2937] flex justify-between items-start ">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-white text-base font-bold">{subtitle}</p>
        <p className="text-neutral-300 text-sm max-w-lg">{description}</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors border-green text-green">
        <GoShield size={16} />
        <span className="text-xs font-bold uppercase">{tag}</span>
      </div>
    </div>
    <div className="px-4 py-4">
      {children}

      <p className="text-neutral-300 text-sm pt-6">{footer}</p>
    </div>
  </div>
);
