import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  BookOpen,
  GitBranch,
  KeyRound,
  Network,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.scrubbe.com/api/v1";

const sections = [
  {
    title: "Authentication and SSO",
    description:
      "Start with sign-in, SSO discovery, OAuth callbacks, and tenant security setup.",
    href: "/auth/signin",
    icon: KeyRound,
    links: [
      { label: "Sign in", href: "/auth/signin" },
      { label: "Account setup", href: "/auth/account-setup" },
      { label: "Security settings", href: "/incident/settings/security" },
    ],
  },
  {
    title: "Incident workspace",
    description:
      "Open the live incident shell, ticket list, postmortems, and collaboration surfaces.",
    href: "/incident",
    icon: ShieldCheck,
    links: [
      { label: "Incident workspace", href: "/incident" },
      { label: "Tickets", href: "/incident/tickets" },
      { label: "Postmortems", href: "/incident/postmortems" },
    ],
  },
  {
    title: "Integrations and ingestion",
    description:
      "Connect GitHub, GitLab, Slack, and webhook sources that feed the incident pipeline.",
    href: "/incident/ingestion",
    icon: Network,
    links: [
      { label: "Ingestion hub", href: "/incident/ingestion" },
      { label: "Connections", href: "/connections" },
      { label: "API docs", href: "https://api.scrubbe.com/api/docs" },
    ],
  },
  {
    title: "Playbooks and automation",
    description:
      "Review governed playbook execution, remediation flow, and policy-backed orchestration.",
    href: "/incident/playbooks",
    icon: GitBranch,
    links: [
      { label: "Playbooks", href: "/incident/playbooks" },
      { label: "Policies", href: "/incident/policies" },
      { label: "Pipelines", href: "/incident/pipelines" },
    ],
  },
  {
    title: "Code intelligence and Ezra",
    description:
      "Trace code-linked incidents, repository context, and AI-assisted analysis outputs.",
    href: "/incident/code-engine",
    icon: TerminalSquare,
    links: [
      { label: "Code engine", href: "/incident/code-engine" },
      { label: "Ezra", href: "/incident/ezra" },
      { label: "Signal graph", href: "/incident/signal-graph" },
    ],
  },
  {
    title: "Reference and health",
    description:
      "Inspect the live API contract, platform health, and the endpoints backing the UI.",
    href: "https://api.scrubbe.com/api/docs",
    icon: BookOpen,
    links: [
      { label: "OpenAPI UI", href: "https://api.scrubbe.com/api/docs" },
      { label: "OpenAPI JSON", href: "https://api.scrubbe.com/api/docs.json" },
      { label: "Health", href: "https://api.scrubbe.com/health" },
    ],
  },
];

const quickChecks = [
  "Auth.js sign-in and SSO discovery route through the production host.",
  "Incident views resolve live incident IDs and preserve workspace context.",
  "Integration callbacks land on the ingestion workspace with live status.",
  "Playbooks, Ezra, pipelines, and ingestion surfaces share server-backed contracts.",
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#f4f8f3] text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_55%),linear-gradient(180deg,_#ffffff_0%,_#f4f8f3_100%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Scrubbe product documentation
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-bersley text-5xl leading-tight text-slate-950 sm:text-6xl">
                One home for auth, incident response, integrations, and API reference.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Use this surface to move between live product areas, server reference,
                and the operational paths backing the deployed frontend.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/incident"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open incident workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://api.scrubbe.com/api/docs"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                Open API reference
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Blocks className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Live server contract</p>
                <p className="text-base font-semibold text-slate-950">{apiBaseUrl}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {quickChecks.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Explore by surface
          </p>
          <h2 className="font-bersley text-4xl text-slate-950">
            Jump straight to the operational paths that matter.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Link
                    href={section.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-600"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-2xl font-semibold text-slate-950">
                    {section.title}
                  </h3>
                  <p className="text-sm leading-7 text-slate-600">
                    {section.description}
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                  {section.links.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
