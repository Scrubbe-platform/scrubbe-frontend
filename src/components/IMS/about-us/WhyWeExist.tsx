import React from "react";
import { FiSettings } from "react-icons/fi";
import { RiStackFill } from "react-icons/ri";

const items = [
  {
    label: "layer1-ims",
    title: "Scrubbe Incident Management",
    description:
      "Incidents created from deploy failures, SLO breaches, fraud spikes, or analyst signals — not random forms.",
    secondary: "Source of truth for “what went wrong, where and when”.",
  },
  {
    label: "LAYER 2 - PIPELINES",
    title: "CI/CD & runtime signals",
    description:
      "Build, test, scan, deploy and canary steps stitched into a single failure graph with historical behaviour per step.",
    secondary: "“Step 4 regressed · 3 similar failures this month.”",
  },
  {
    label: "LAYER 3 - CODE ENGINE",
    title: "Deployment-aware remediation",
    description:
      "Diff-based reasoning that understands PRs, pipelines and blast radius. Produces PR-ready patches, not generic code blobs.",
    secondary: "Patch generated from incident context · guardrail-aware.",
  },
  {
    label: "LAYER 4 - FRAUD & BEHAVIOUR",
    title: "Risk signals, not just CPU graphs",
    description:
      "Device, velocity, geo and transaction patterns plugged into the same incident story — especially for fintech, payments and marketplaces",
    secondary: "“Auth success, but fraud spike · treat as P1.”",
  },
  {
    label: "LAYER 5 - EZRA",
    title: "AI analyst on top of your data",
    description:
      "Asks and answers “why now, where else, what next?” over incidents, code, pipelines and fraud — in the language of engineers, SREs and risk teams.",
    secondary: "“Explain this incident to my CFO in 3 bullet points.”",
  },
  {
    label: "HOW IT CONNECTS",
    title: "",
    description:
      "IMS tells Code Engine what broke. Pipelines tell it where the failure lives. Guardrails and RBAC control how far it’s allowed to go.",
  },
];

const items2 = [
  {
    label: "DEV & SRE",
    title: "From “what log?” to “here’s the patch.”",
    description:
      "You see git blame, failing step, metrics and the proposed diff in one place. No hunting across 5 tools.",
  },
  {
    label: "FRAUD & RISK",
    title: "Fraud spikes treated as incidents",
    description:
      "Device and transaction anomalies can auto-raise incidents, trigger playbooks, and drive safe mitigations.",
  },
  {
    label: "PLATFORM LEADERS",
    title: "From status pages to reliability portfolio.",
    description:
      "MTTR, deployment velocity, incident classes and fraud patterns across teams in one narrative",
  },
];

const WhyWeExist = () => {
  return (
    <div className="w-full min-h-[600px] relative z-0 overflow-clip">
      <div className="text-white max-w-[1440px] w-full mx-auto h-full grid  gap-5 px-4 md:px-6 lg:px-20 xl:px-20 py-20">
        <>
          <div className="flex items-center justify-between w-full">
            <p>THE SCRUBBE ECOSYSTEM</p>
            <div className="p-2 rounded-xl border flex items-center gap-2">
              <RiStackFill />
              <p className="text-sm">Code • Pipelines • Fraud • AI</p>
            </div>
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-bigshotOne ">
            One{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan to-[#8250BE]">
              incident brain.
            </span>{" "}
            Multiple specialised surfaces.
          </h1>

          <div className="border border-gray-400 rounded-2xl p-5 md:p-8 space-y-4">
            <div className="grid md:grid-cols-3 gap-5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className=" bg-gradient-to-t space-y-1 from-[#004B571A] to-[#0074834D] border border-IMSCyan/30 rounded-2xl p-4 flex-col gap-3 text-white"
                >
                  <p className="text-sm uppercase pb-2">{item.label}</p>
                  <p className=" font-semibold">{item.title}</p>
                  <p className="text-base opacity-60">{item.description}</p>
                  <p className="text-sm text-green">{item?.secondary}</p>
                </div>
              ))}
            </div>
            <div className="h-[1px] w-full bg-gray-400" />
            <p>
              IMS captures the incident, Pipelines show where it failed, Code
              Engine proposes safe changes, Fraud adds risk context, and Ezra
              turns it into a narrative humans and leadership can trust.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {items2.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#030D25]  border border-IMSCyan/30 rounded-2xl p-4 flex-col gap-3 text-white"
                >
                  <p className="text-sm uppercase pb-2">{item.label}</p>
                  <p className=" font-semibold ">{item.title}</p>
                  <p className="text-base opacity-50">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>

        <>
          <div className="flex items-center justify-between w-full pt-10">
            <p>POSITION</p>
            <div className="p-2 rounded-xl border flex items-center gap-2">
              <FiSettings />
              <p className="text-sm">Built for engineering, not back-office</p>
            </div>
          </div>

          <h1 className="text-white text-3xl md:text-5xl font-bigshotOne ">
            Scrubbe is not a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan to-[#8250BE]">
              generic ITSM tool.{" "}
            </span>{" "}
          </h1>

          <div className="border border-gray-400 rounded-2xl p-5 md:p-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-[#030D25] transition-all duration-200 cursor-pointer border border-IMSCyan/30 rounded-2xl p-4 flex flex-col gap-3 text-white">
                <p className=" font-semibold">Typical ITSM</p>
                <ul className=" pl-5 space-y-2 list-disc text-sm">
                  <li>Tickets created by manual forms and email.</li>
                  <li>Incident views unaware of git, CI, or fraud data.</li>
                  <li>Long workflows, approvals and generic SLAs.</li>
                  <li>
                    Good for HR & facilities, weak for code-level failures.
                  </li>
                </ul>
              </div>
              <div className="bg-[#032528B2] transition-all duration-200 cursor-pointer  border border-IMSCyan/30 rounded-2xl p-4 flex flex-col gap-3 text-white">
                <p className=" font-semibold">Scrubbe IMS + Code Engine</p>
                <ul className=" pl-5 space-y-2 list-disc text-sm">
                  <li>
                    Incidents auto-created from deploy failures, SLO breaches,
                    fraud anomalies.
                  </li>
                  <li>
                     Code Engine suggests PR-ready patches with guardrails.
                  </li>
                  <li>
                    Pipelines, logs, metrics and fraud stitched into one story.
                  </li>
                  <li>
                    Built for Dev, SRE, Platform & Fraud — not HR tickets.
                  </li>
                </ul>
              </div>
            </div>
            <p>
              If you mainly need password reset and laptop tracking workflows,
              Scrubbe is not the right tool. If you care about production
              incidents tied to code and money, that’s exactly where we live.
            </p>
          </div>
        </>

        <>
          <div className="flex items-center justify-between w-full pt-10">
            <p>WHY WE STARTED SCRUBBE</p>
            {/* <div className="p-2 rounded-xl border flex items-center gap-2">
              <FiSettings />
              <p className="text-sm">Built for engineering, not back-office</p>
            </div> */}
          </div>

          <h1 className="text-white text-3xl md:text-5xl font-bigshotOne ">
            Built from{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-IMSCyan to-[#8250BE]">
              frustration
            </span>{" "}
            with how incidents actually felt.
          </h1>

          <div className="border border-gray-400 rounded-2xl p-5 md:p-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-[#030D25] hover:bg-[#032528B2]  transition-all duration-200 cursor-pointer border border-IMSCyan/30 rounded-2xl p-4 flex flex-col gap-3 text-white">
                <p className="text-base">
                  Scrubbe was born out of on-call shifts where incidents bounced
                  between tools and teams, and nobody had a single place that
                  understood code, pipelines, fraud signals and impact.
                </p>
                <div>
                  <p>We kept seeing the same patterns:</p>
                  <ul className=" pl-5 space-y-2 list-disc text-base">
                    <li>
                      CI failed, but the ticketing system didn’t know why.
                    </li>
                    <li>
                      Fraud spikes treated separately from engineering
                      incidents.
                    </li>
                    <li>
                      “AI assistants” suggesting code without respect for blast
                      radius or approvals.
                    </li>
                    <li>
                      Built for Dev, SRE, Platform & Fraud — not HR tickets.
                    </li>
                  </ul>
                </div>
                <p className="text-base">
                  Scrubbe is our answer: a reliability platform where incidents,
                  code diffs, pipelines, and fraud metrics live in the same
                  brain, and where AI is used to make safer, faster decisions —
                  not just generate more noise.
                </p>
              </div>
              <div className=" space-y-6">
                <div className="bg-[#030D25] hover:bg-[#032528B2] transition-all duration-200 cursor-pointer  border border-IMSCyan/30 rounded-2xl p-4 flex flex-col gap-3 text-white">
                  <p className=" font-semibold">Scrubbe IMS + Code Engine</p>
                  <ul className=" pl-5 space-y-2 list-disc text-sm">
                    <li>
                      Incidents auto-created from deploy failures, SLO breaches,
                      fraud anomalies.
                    </li>
                    <li>
                      Code Engine suggests PR-ready patches with guardrails.
                    </li>
                    <li>
                      Pipelines, logs, metrics and fraud stitched into one
                      story.
                    </li>
                    <li>
                      Built for Dev, SRE, Platform & Fraud — not HR tickets.
                    </li>
                  </ul>
                </div>

                <div className="bg-[#030D25] hover:bg-[#032528B2] transition-all duration-200 cursor-pointer  border border-IMSCyan/30 rounded-2xl p-4 flex flex-col gap-3 text-white">
                  <p className=" font-semibold">WHERE WE’RE GOING</p>
                  <p className="text-base py-2">
                    We’re still early. We’re actively working with design
                    partners who:
                  </p>
                  <ul className=" pl-5 space-y-2 list-disc text-sm">
                    <li>Code-first: every serious incident touches git.</li>
                    <li>
                      Code Engine suggests PR-ready patches with guardrails.
                    </li>
                    <li>
                      Signal-rich: metrics and fraud data are first-class.
                    </li>
                    <li>
                      Human-centric: SREs own the call; Scrubbe does the heavy
                      lifting.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default WhyWeExist;
