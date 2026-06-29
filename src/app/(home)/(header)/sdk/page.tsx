// app/developer/sdks/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Info,
  Layers,
  Layers2,
  HelpCircle,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import {
  SdkLanguage,
  LangMeta,
  WebhookEvent,
  ChangelogItem,
} from "./_module/types/developer";
import { ALL_SNIPPETS } from "./_module/libs/constant";
import CodePane from "./_module/components/CodePane";

const LANG_META: Record<SdkLanguage, LangMeta> = {
  python: {
    label: "Python",
    reg: "PyPI",
    pkg: "scrubbe-sdk",
    requires: "Python ≥ 3.10 · httpx",
    title: "~/incident-bot",
    cmd: "pip install scrubbe-sdk",
    out: "Successfully installed scrubbe-sdk-1.0.0",
  },
  typescript: {
    label: "TypeScript / JS",
    reg: "npm",
    pkg: "@scrubbe/sdk",
    requires: "Node ≥ 18 · Deno · CF Workers",
    title: "~/incident-bot",
    cmd: "npm install @scrubbe/sdk",
    out: "added 1 package in 1.2s",
  },
  java: {
    label: "Java",
    reg: "Maven Central",
    pkg: "com.scrubbe:scrubbe-sdk",
    requires: "JDK 17 · Jackson 2.15.3",
    title: "~/incident-service",
    cmd: "mvn dependency:get -Dartifact=com.scrubbe:scrubbe-sdk:1.0.0",
    out: "Resolved from Maven Central",
  },
  csharp: {
    label: "C# / .NET",
    reg: "NuGet",
    pkg: "Scrubbe.Sdk",
    requires: ".NET 8.0+ · async/await",
    title: "~/incident-service",
    cmd: "dotnet add package Scrubbe.Sdk",
    out: "Installed Scrubbe.Sdk 1.0.0",
  },
  go: {
    label: "Go",
    reg: "pkg.go.dev",
    pkg: "github.com/scrubbe/sdk-go",
    requires: "Go 1.21+ · zero dependencies",
    title: "~/incident-bot",
    cmd: "go get github.com/scrubbe/sdk-go",
    out: "go: added github.com/scrubbe/sdk-go v1.0.0",
  },
  cli: {
    label: "Scrubbe CLI",
    reg: "brew",
    pkg: "scrubbe",
    requires: "macOS · Linux · Windows WSL2",
    title: "~",
    cmd: "brew install scrubbe",
    out: "✓  scrubbe 0.9.2 installed",
  },
};

const WEBHOOK_EVENTS: WebhookEvent[] = [
  {
    name: "incident.created",
    desc: "A new incident was opened.",
    schema: "IncidentCreatedPayload",
  },
  {
    name: "incident.updated",
    desc: "Priority, state, or service assignment changed.",
    schema: "IncidentUpdatedPayload",
  },
  {
    name: "incident.resolved",
    desc: "Incident marked resolved with an optional summary.",
    schema: "IncidentResolvedPayload",
  },
  {
    name: "playbook.executed",
    desc: "A playbook run completed (executed, parked, blocked).",
    schema: "PlaybookExecutedPayload",
  },
  {
    name: "playbook.approval_required",
    desc: "Execution gated pending human approval.",
    schema: "ApprovalRequiredPayload",
  },
  {
    name: "approval.granted",
    desc: "A pending approval was approved by an operator.",
    schema: "ApprovalGrantedPayload",
  },
  {
    name: "handover.created",
    desc: "A new shift handover was generated.",
    schema: "HandoverCreatedPayload",
  },
  {
    name: "postmortem.published",
    desc: "A post-mortem was finalised and published.",
    schema: "PostmortemPublishedPayload",
  },
  {
    name: "agent.investigation_completed",
    desc: "An AI investigation finished.",
    schema: "InvestigationPayload",
  },
];

const CHANGELOG_DATA: ChangelogItem[] = [
  {
    date: "2026-06-10",
    version: "v1.0.0",
    tags: ["feature"],
    changes: [
      "Public GA of Python, TypeScript, Java, C# / .NET, and Go SDKs",
      "C# SDK adds first-class dependency injection and IAsyncEnumerable streaming",
      "Go SDK ships with zero external dependencies and channel-based SSE",
      "Scrubbe CLI v0.9.2 for macOS, Linux, and Windows WSL2",
      "MCP module for knowledge-base queries across all GA SDKs",
    ],
  },
  {
    date: "2026-05-14",
    version: "v0.9.0",
    tags: ["feature", "fix"],
    changes: [
      "Added client.mcp module to Python and TypeScript SDKs",
      "Retry now supports respect_retry_after to honour 429 headers",
      "Fixed OAuth2 token refresh race condition under concurrent requests",
      "CLI: added scrubbe incident stream for live SSE output",
    ],
  },
  {
    date: "2026-04-02",
    version: "v0.8.0",
    tags: ["breaking", "feature"],
    changes: [
      "[Breaking] playbook.run() now raises a typed GovernanceApprovalRequired error instead of returning null on gated executions — update all catch blocks",
      "Added approval_url and eal_required fields to the governance error",
      "New client.approval module for polling approval state",
      "Typed exception hierarchy — all SDK errors now derive from a common base",
    ],
  },
];

export default function CompleteDeveloperPlatform() {
  const [lang, setLang] = useState<SdkLanguage>("python");
  const [pm, setPm] = useState("npm");
  const [flavour, setFlavour] = useState("maven");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const meta = LANG_META[lang];

  // ── Dynamic Side Navigation Generator per Active Runtime Language ──
  const sections = useMemo(() => {
    if (lang === "python")
      return [
        {
          id: "install",
          title: "Installation",
          file: "bash",
          label: "sh",
          snip: "py-install",
          d: "Install from PyPI. No build step required.",
        },
        {
          id: "quickstart",
          title: "Quick start",
          file: "main.py",
          label: "py",
          snip: "py-quickstart",
          d: "An async client built on httpx. Paginate lazily and subscribe to live event streams.",
        },
        {
          id: "auth",
          title: "Authentication",
          file: "auth.py",
          label: "py",
          snip: "py-auth",
          d: "Resolution paths: explicit key, OAuth2 client credentials, or environment configs.",
        },
        {
          id: "config",
          title: "Configuration",
          file: "client.py",
          label: "py",
          snip: "py-config",
          d: "Tune connection timeouts and jitter retry distributions.",
        },
        {
          id: "errors",
          title: "Error handling",
          file: "errors.py",
          label: "py",
          snip: "py-errors",
          d: "Governance gates raise GovernanceApprovalRequiredError — never a silent null.",
        },
        {
          id: "incident",
          title: "Incident operations",
          file: "incident.py",
          label: "py",
          snip: "py-incident",
          d: "The full core lifecycle: create, annotate timeline logs, and resolve.",
        },
        {
          id: "mcp",
          title: "MCP queries",
          file: "mcp.py",
          label: "py",
          snip: "py-mcp",
          d: "Ask the knowledge base in natural language; responses cite source incidents.",
        },
        {
          id: "dev",
          title: "Development",
          file: "bash",
          label: "sh",
          snip: "py-dev",
          d: "Set up local developer orchestration packages safely.",
        },
      ];
    if (lang === "typescript")
      return [
        {
          id: "install",
          title: "Installation",
          file: "bash",
          label: "sh",
          snip: `ts-install-${pm}`,
          d: "Ships dual CJS + ESM with declaration maps. Runs on Node, Deno, and Edge Workers.",
        },
        {
          id: "quickstart",
          title: "Quick start",
          file: "index.ts",
          label: "ts",
          snip: "ts-quickstart",
          d: "Async iterators power both cursor pagination and live log streams.",
        },
        {
          id: "auth",
          title: "Authentication",
          file: "auth.ts",
          label: "ts",
          snip: "ts-auth",
          d: "Load parameters directly via explicit initialization vectors.",
        },
        {
          id: "config",
          title: "Configuration",
          file: "client.ts",
          label: "ts",
          snip: "ts-config",
          d: "Fine-tune cluster timeouts across serverless runtimes.",
        },
        {
          id: "errors",
          title: "Error handling",
          file: "errors.ts",
          label: "ts",
          snip: "ts-errors",
          d: "Intercept approval gates using native TypeScript prototypes.",
        },
        {
          id: "dev",
          title: "Development",
          file: "bash",
          label: "sh",
          snip: "ts-dev",
          d: "Build distribution outputs using standard compiler loops.",
        },
      ];
    if (lang === "java")
      return [
        {
          id: "install",
          title: "Dependency Config",
          file: flavour === "maven" ? "pom.xml" : "build.gradle.kts",
          label: flavour === "maven" ? "xml" : "groovy",
          snip: `jv-${flavour}`,
          d: "Published to Maven Central. Choose your build tool matrix using the drop-down selector below.",
        },
        {
          id: "quickstart",
          title: "Quick start",
          file: "Main.java",
          label: "java",
          snip: "jv-quickstart",
          d: "A try-with-resources client layer executing directly on the JDK HTTP stack.",
        },
        {
          id: "auth",
          title: "Authentication",
          file: "Auth.java",
          label: "java",
          snip: "jv-auth",
          d: "Load explicit keys or profile configurations using builder patterns.",
        },
        {
          id: "config",
          title: "Configuration",
          file: "Client.java",
          label: "java",
          snip: "jv-config",
          d: "Supply a custom HttpClient instance for mock proxy testing.",
        },
        {
          id: "errors",
          title: "Error handling",
          file: "Errors.java",
          label: "java",
          snip: "jv-errors",
          d: "Catches typed GovernanceApprovalRequiredException gates explicitly.",
        },
        {
          id: "incident",
          title: "Incident operations",
          file: "Incident.java",
          label: "java",
          snip: "jv-incident",
          d: "Resources are Jackson-bound records mapping cleanly to domain endpoints.",
        },
        {
          id: "mcp",
          title: "MCP queries",
          file: "Mcp.java",
          label: "java",
          snip: "jv-mcp",
          d: "Query the operational knowledge corpus in natural language.",
        },
        {
          id: "pom",
          title: "Complete pom.xml",
          file: "pom.xml",
          label: "xml",
          snip: "jv-pom",
          d: "The complete Maven configuration manifest setup.",
        },
        {
          id: "dev",
          title: "Build & test",
          file: "bash",
          label: "sh",
          snip: "jv-dev",
          d: "Compile and verify build targets using standard lifecycle hooks.",
        },
      ];
    if (lang === "csharp")
      return [
        {
          id: "install",
          title: "Installation",
          file: "bash",
          label: "sh",
          snip:
            pm === "Package Manager" ? "cs-install-nuget" : "cs-install-dotnet",
          d: "Install from NuGet via the .NET CLI or visual studio package consoles.",
        },
        {
          id: "quickstart",
          title: "Quick start",
          file: "Program.cs",
          label: "cs",
          snip: "cs-quickstart",
          d: "The client is IDisposable and fully async. IAsyncEnumerable streams records lazily.",
        },
        {
          id: "auth",
          title: "Authentication",
          file: "Auth.cs",
          label: "cs",
          snip: "cs-auth",
          d: "Authenticate via direct credentials strings or local environmental maps.",
        },
        {
          id: "config",
          title: "Client Config",
          file: "Client.cs",
          label: "cs",
          snip: "cs-config",
          d: "Pass precise custom TimeSpan timeouts directly.",
        },
        {
          id: "di",
          title: "Dependency Injection",
          file: "Program.cs",
          label: "cs",
          snip: "cs-di",
          d: "Register the thread-safe client lifecycle as a single application singleton.",
        },
        {
          id: "errors",
          title: "Error handling",
          file: "Errors.cs",
          label: "cs",
          snip: "cs-errors",
          d: "All pipeline errors inherit from ScrubbeException tracking request contexts.",
        },
        {
          id: "incident",
          title: "Incident operations",
          file: "Incident.cs",
          label: "cs",
          snip: "cs-incident",
          d: "Mutate states using compiled C# record contracts.",
        },
        {
          id: "mcp",
          title: "MCP queries",
          file: "Mcp.cs",
          label: "cs",
          snip: "cs-mcp",
          d: "Ask language models questions about previous operational anomalies.",
        },
        {
          id: "dev",
          title: "Build & test",
          file: "bash",
          label: "sh",
          snip: "cs-dev",
          d: "Compile and process standard packing pipelines.",
        },
      ];
    if (lang === "go")
      return [
        {
          id: "install",
          title: "Installation",
          file: "bash",
          label: "sh",
          snip: "go-install",
          d: "Add the module dependency. Go 1.21+ with zero external module requirements.",
        },
        {
          id: "quickstart",
          title: "Quick start",
          file: "main.go",
          label: "go",
          snip: "go-quickstart",
          d: "A context-aware client. SSE telemetry streams arrive natively over channels.",
        },
        {
          id: "auth",
          title: "Authentication",
          file: "auth.go",
          label: "go",
          snip: "go-auth",
          d: "Set configurations cleanly inside standard Options structs.",
        },
        {
          id: "config",
          title: "Configuration",
          file: "client.go",
          label: "go",
          snip: "go-config",
          d: "Isolate connect and read delays while executing jitter retries.",
        },
        {
          id: "errors",
          title: "Error handling",
          file: "errors.go",
          label: "go",
          snip: "go-errors",
          d: "Utilize errors.As to match governance and timeout flags.",
        },
        {
          id: "incident",
          title: "Incident operations",
          file: "incident.go",
          label: "go",
          snip: "go-incident",
          d: "Open records and evaluate real-time event updates.",
        },
        {
          id: "mcp",
          title: "MCP queries",
          file: "mcp.go",
          label: "go",
          snip: "go-mcp",
          d: "Natural language search querying deep architectural corpuses.",
        },
        {
          id: "dev",
          title: "Development",
          file: "bash",
          label: "sh",
          snip: "go-dev",
          d: "Standard Makefile recipes for compilation and verification.",
        },
      ];
    if (lang === "cli")
      return [
        {
          id: "install",
          title: "Installation",
          file: "bash",
          label: "sh",
          snip:
            pm === "brew"
              ? "cli-install-brew"
              : pm === "curl"
                ? "cli-install-sh"
                : "cli-install-npm",
          d: "Install via Homebrew, curl, or npm. The compiled binary is self-updating.",
        },
        {
          id: "auth",
          title: "Authentication",
          file: "bash",
          label: "sh",
          snip: "cli-auth",
          d: "Log in securely once. Session tokens persist locally inside your machine sandbox.",
        },
        {
          id: "inc",
          title: "Incidents operations",
          file: "bash",
          label: "sh",
          snip: "cli-incidents",
          d: "List open anomalies or spin up active logs directly from terminal prompts.",
        },
        {
          id: "play",
          title: "Playbooks management",
          file: "bash",
          label: "sh",
          snip: "cli-playbook",
          d: "Run playbooks from the shell. Approval gates are handled inline.",
        },
        {
          id: "cfg",
          title: "Configuration",
          file: "bash",
          label: "sh",
          snip: "cli-config",
          d: "Alter output serializers between JSON, standard table matrices, or YAML lines.",
        },
      ];
    return [];
  }, [lang, pm, flavour]);

  const CHOOSE_SDK_ROWS = [
    {
      id: "python",
      lang: "Python",
      prefix: "py",
      desc: "Data, ML, and automation scripts; async-first incident bots built on httpx.",
      reg: "PyPI · scrubbe-sdk",
    },
    {
      id: "typescript",
      lang: "TypeScript / JS",
      prefix: "ts",
      desc: "Web apps, serverless, and edge runtimes — Node 18+, Deno, and Cloudflare Workers.",
      reg: "npm · @scrubbe/sdk",
    },
    {
      id: "java",
      lang: "Java",
      prefix: "jv",
      desc: "JVM services and existing enterprise platforms on JDK 17 with Jackson binding.",
      reg: "Maven Central · com.scrubbe:scrubbe-sdk",
    },
    {
      id: "csharp",
      lang: "C# / .NET",
      prefix: "c#",
      desc: ".NET 8 services wanting first-class dependency injection and IAsyncEnumerable streaming.",
      reg: "NuGet · Scrubbe.Sdk",
    },
    {
      id: "go",
      lang: "Go",
      prefix: "go",
      desc: "High-throughput services and CLIs that need zero external dependencies and channel-based streaming.",
      reg: "pkg.go.dev · github.com/scrubbe/sdk-go",
    },
    {
      id: "cli",
      lang: "CLI",
      prefix: "›_",
      desc: "Operators and CI pipelines — full platform control from the terminal, no code required.",
      reg: "Homebrew · scrubbe",
    },
  ];

  const switchLang = (target: SdkLanguage) => {
    setLang(target);
    if (target === "typescript") setPm("npm");
    else if (target === "csharp") setPm("dotnet CLI");
    else if (target === "cli") setPm("brew");
    setIsDropdownOpen(false);
  };

  // Automated window scroll vector tracking
  const scrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(`sec-${anchorId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen selection:bg-emerald-500/20 antialiased">
      <div className="max-w-[1040px] mx-auto p-6 sm:p-12 lg:py-16 space-y-16">
        {/* ─── NATIVE ARTICLE HERO HEAD ─── */}
        <div className="space-y-4 max-w-[880px]">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-zinc-950 font-serif">
            Build on <span className="text-emerald-500">Scrubbe</span>
          </h1>
          <p className="text-base sm:text-lg font-light text-zinc-600 leading-relaxed max-w-2xl font-serif">
            Official clients for the Scrubbe Operational Intelligence Platform —
            across five runtimes and the command line . Create incidents, stream
            live events, run governed playbooks, and query the knowledge base
            against{" "}
            <code className="font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
              api.scrubbe.com
            </code>
            .
          </p>
        </div>

        {/* ─── SECTION 1: EDITORIAL PRINCIPLES ─── */}
        <section className="space-y-4 max-w-[880px]">
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            The case for building on Scrubbe
          </div>
          <h2 className="font-serif text-2xl tracking-tight text-zinc-900">
            A single governed surface for incident operations
          </h2>
          <p className="text-zinc-600 text-[13.5px] leading-relaxed max-w-3xl">
            Most teams reach for an incident platform when manual coordination
            stops scaling — when the cost of a missed signal, an unapproved
            change, or an unrecorded decision becomes material . Scrubbe is
            built for that moment . Every client below speaks to one platform,
            enforces one governance model, and writes to one audit trail .
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-zinc-200 rounded-lg overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-200 mt-6 shadow-2xs">
            <div className="p-5 bg-white">
              <div className="font-mono text-[11px] text-zinc-400 mb-2">01</div>

              <h4 className="font-serif text-base font-semibold text-zinc-900 mb-1">
                Governed by default
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Every mutating call passes the policy gate . When human approval
                is required, the SDK raises a typed error carrying the approval
                id .
              </p>
            </div>
            <div className="p-5 bg-white">
              <div className="font-mono text-[11px] text-zinc-400 mb-2">02</div>

              <h4 className="font-serif text-base font-semibold text-zinc-900 mb-1">
                One surface, five runtimes
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                The same logical API across Python, TypeScript, Java, C#, and Go
                — plus the CLI . Learn the model once and apply it wherever your
                stack runs .
              </p>
            </div>
            <div className="p-5 bg-white">
              <div className="font-mono text-[11px] text-zinc-400 mb-2">03</div>

              <h4 className="font-serif text-base font-semibold text-zinc-900 mb-1">
                Auditable end to end
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Every state transition is recorded . Incident IDs are stable (
                <code>SI-XXXXXX</code>), and the audit module exports the full
                trail on demand .
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: ADOPTION PATH ─── */}
        <section className="space-y-4 max-w-[880px]">
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            How teams adopt
          </div>
          <h2 className="font-serif text-2xl tracking-tight text-zinc-900">
            From first call to governed production
          </h2>
          <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white mt-4 shadow-2xs">
            <div className="flex items-center gap-3 p-3.5 border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700">
              <span className="font-mono text-[9px] font-bold border border-zinc-300 rounded px-1.5 py-0.5 uppercase tracking-wide bg-white">
                Exhibit 1
              </span>
              <span className="font-serif text-[14px]">
                The four stages of Scrubbe adoption
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
              {[
                {
                  s: "Stage 1",
                  n: "Connect",
                  d: "Authenticate, read incidents, and open your first one. No writes to production systems.",
                  c: ["incident.create", "incident.list", "service.health"],
                },
                {
                  s: "Stage 2",
                  n: "Instrument",
                  d: "Ingest signals, enrich timelines, and stream live events into your own tooling.",
                  c: ["event.ingest", "timeline.add", "incident.subscribe"],
                },
                {
                  s: "Stage 3",
                  n: "Automate",
                  d: "Run governed playbooks behind named-operator approval. Gates surface as typed errors.",
                  c: ["playbook.run", "approval.approve", "workbench.complete"],
                },
                {
                  s: "Stage 4",
                  n: "Operate",
                  d: "Close the loop at scale: audit, postmortems, and knowledge queries across the corpus.",
                  c: ["postmortem.publish", "mcp.query", "audit.export"],
                },
              ].map((stage, i) => (
                <div
                  key={i}
                  className="p-4 bg-white flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="font-mono text-[9.5px] text-zinc-400 mb-1">
                      {stage.s}
                    </div>
                    <div className="font-serif text-base font-semibold text-zinc-900 mb-1">
                      {stage.n}
                    </div>
                    <p className="text-zinc-500 text-[11.5px] leading-relaxed">
                      {stage.d}
                    </p>
                  </div>
                  <div className="space-y-1 font-mono text-[10.5px] text-zinc-800">
                    {stage.c.map((call) => (
                      <div key={call} className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">▸</span>

                        {call}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CHOOSE AN SDK PANEL */}
        <section className="space-y-4 max-w-[880px]" id="choose">
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Selecting a client
          </div>
          <h2 className="font-serif text-2xl tracking-tight text-zinc-900">
            Choose the SDK that matches your stack
          </h2>
          <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white mt-4 shadow-2xs">
            <div className="flex items-center gap-3 p-3.5 border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700">
              <span className="font-mono text-[9px] font-bold border border-zinc-300 rounded px-1.5 py-0.5 uppercase tracking-wide bg-white">
                Exhibit 2
              </span>
              <span className="font-serif text-[14px]">
                Picking a client by environment
              </span>
            </div>
            <div className="divide-y divide-zinc-200">
              {CHOOSE_SDK_ROWS.map((row) => (
                <div
                  key={row.id}
                  onClick={() => switchLang(row.id as SdkLanguage)}
                  className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 p-4 items-baseline hover:bg-zinc-50/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 text-[13px] font-bold text-zinc-900 group-hover:text-zinc-950">
                    <span className="font-mono text-[9.5px] font-bold border border-zinc-200 rounded min-w-[24px] h-5 flex items-center justify-center text-zinc-500 bg-zinc-50">
                      {row.prefix}
                    </span>
                    {row.lang}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <p className="text-zinc-600 text-xs leading-relaxed max-w-xl">
                      {row.desc}
                    </p>
                    <span className="font-mono text-[10px] text-zinc-400 font-medium whitespace-nowrap sm:text-right">
                      {row.reg}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: THE REFERENCE ENGINE INTERFACE ─── */}
        <section
          className="space-y-5 pt-4 border-t border-zinc-100"
          id="reference"
        >
          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            SDK &amp; CLI reference
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden divide-x divide-zinc-200 text-center shadow-2xs">
            {(
              [
                "python",
                "typescript",
                "java",
                "csharp",
                "go",
                "cli",
              ] as SdkLanguage[]
            ).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                className={`p-3 text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  lang === l
                    ? "bg-white text-zinc-900 border-b-2 border-zinc-950 shadow-inner font-bold"
                    : "text-zinc-500 hover:bg-zinc-100/50 hover:text-zinc-900"
                }`}
              >
                <span className="font-mono text-[9px] border border-zinc-300 rounded px-1 text-zinc-400 bg-zinc-50">
                  {l.slice(0, 2)}
                </span>
                <span className="capitalize">
                  {l === "csharp" ? "C#" : l === "typescript" ? "TS / JS" : l}
                </span>
              </button>
            ))}
          </div>

          {/* Terminal Block Header */}
          <div className="rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-100 overflow-hidden shadow-md">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40 select-none">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-mono text-[10.5px] text-zinc-500 ml-2">
                {meta.title}
              </span>
              <span className="ml-auto font-mono text-[9.5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                scrubbe-sdk · v1.0.0
              </span>
            </div>
            <div className="p-4 font-mono text-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">$</span>
                <span className="text-zinc-200">{meta.cmd} </span>
              </div>
              <div className="text-zinc-500 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {meta.out}
              </div>
            </div>
          </div>

          {/* Dropdown Filters Ribbon Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">
                SDK Language
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-8 min-w-[160px] flex items-center justify-between bg-white border border-zinc-200 px-3 rounded font-semibold text-zinc-800 shadow-2xs hover:border-zinc-300"
                >
                  <span>{meta.label}</span>
                  <ChevronDown size={12} className="text-zinc-400" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50 overflow-hidden">
                    {(
                      [
                        "python",
                        "typescript",
                        "java",
                        "csharp",
                        "go",
                        "cli",
                      ] as SdkLanguage[]
                    ).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => switchLang(l)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 transition-colors capitalize font-medium flex justify-between ${lang === l ? "text-emerald-600 bg-emerald-50/20" : "text-zinc-700"}`}
                      >
                        {l === "csharp"
                          ? "C#"
                          : l === "typescript"
                            ? "TS / JS"
                            : l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div
              className="text-zinc-500 font-medium"
              dangerouslySetInnerHTML={{
                __html: `Requires <strong>${meta.requires}</strong>`,
              }}
            />

            <div className="font-mono bg-white border border-zinc-200 text-zinc-600 px-3 py-1 rounded flex items-center gap-2 shadow-2xs">
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1 rounded border tracking-wide uppercase">
                {meta.reg}
              </span>
              <span>{meta.pkg}</span>
            </div>
          </div>

          {/* Sub package-manager selector strips  */}
          {lang === "typescript" && (
            <div className="flex gap-2 p-1 bg-zinc-100 w-fit rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500">
              {["npm", "yarn", "pnpm"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPm(opt)}
                  className={`px-3 py-1 rounded-md transition-all ${pm === opt ? "bg-white text-zinc-900 shadow-2xs font-bold" : "hover:text-zinc-800"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {lang === "java" && (
            <div className="flex gap-2 p-1 bg-zinc-100 w-fit rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500">
              {[
                "maven",
                "gradle",
                "sbt",
                "ivy",
                "grape",
                "lein",
                "buildr",
                "bld",
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFlavour(opt)}
                  className={`px-3 py-1 rounded-md transition-all ${flavour === opt ? "bg-white text-zinc-900 shadow-2xs font-bold" : "hover:text-zinc-800"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {lang === "csharp" && (
            <div className="flex gap-2 p-1 bg-zinc-100 w-fit rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500">
              {["dotnet CLI", "Package Manager"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPm(opt)}
                  className={`px-3 py-1 rounded-md transition-all ${pm === opt ? "bg-white text-zinc-900 shadow-2xs font-bold" : "hover:text-zinc-800"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          {lang === "cli" && (
            <div className="flex gap-2 p-1 bg-zinc-100 w-fit rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-500">
              {["brew", "curl", "npm"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPm(opt)}
                  className={`px-3 py-1 rounded-md transition-all ${pm === opt ? "bg-white text-zinc-900 shadow-2xs font-bold" : "hover:text-zinc-800"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* ─── CRITICAL CHANGE: TWO-COLUMN LAYOUT WITH STICKY LEFT SUB-NAV ───  */}
          <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] gap-8 items-start pt-4">
            {/* LEFT SIDE COLUMN: DYNAMIC STICKY "ON THIS PAGE" RAIL  */}
            <div className="hidden md:block sticky top-20 bg-white border border-zinc-100 rounded-lg p-3.5 space-y-2.5 max-h-[calc(100vh-120px)] overflow-y-auto shadow-3xs">
              <div className="font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest pb-1.5 border-b border-zinc-100">
                On this page
              </div>
              <nav className="flex flex-col gap-2 text-[11.5px] font-semibold text-zinc-500">
                {sections.map((sec, i) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToAnchor(sec.id)}
                    className="text-left hover:text-zinc-950 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="font-mono text-[9px] text-zinc-300 group-hover:text-zinc-400 font-normal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {sec.title}
                  </button>
                ))}
                <div className="h-[1px] bg-zinc-100 my-1" />
                <button
                  type="button"
                  onClick={() => scrollToAnchor("webhooks")}
                  className="text-left hover:text-zinc-950 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="font-mono text-[9px] text-zinc-300 font-normal">
                    W
                  </span>{" "}
                  Webhooks
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("comparison")}
                  className="text-left hover:text-zinc-950 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="font-mono text-[9px] text-zinc-300 font-normal">
                    C
                  </span>{" "}
                  Comparison
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("changelog")}
                  className="text-left hover:text-zinc-950 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="font-mono text-[9px] text-zinc-300 font-normal">
                    V
                  </span>{" "}
                  Changelog
                </button>
              </nav>
            </div>

            {/* MOBILE ONLY FALLBACK DROPDOWN (Shown on small viewports instead of left sidebar rail)  */}
            <div className="block md:hidden border border-zinc-200 rounded-xl bg-zinc-50/50 p-4 space-y-3 shadow-2xs w-full">
              <div className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-1 border-b border-zinc-200">
                On this page
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-zinc-500">
                {sections.map((sec, i) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToAnchor(sec.id)}
                    className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                  >
                    <span className="font-mono text-[9px] text-zinc-300 font-normal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {sec.title}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => scrollToAnchor("webhooks")}
                  className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  <span className="font-mono text-[9px] text-zinc-300 font-normal">
                    W
                  </span>{" "}
                  Webhooks
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("comparison")}
                  className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  <span className="font-mono text-[9px] text-zinc-300 font-normal">
                    C
                  </span>{" "}
                  Comparison
                </button>
                <button
                  type="button"
                  onClick={() => scrollToAnchor("changelog")}
                  className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  <span className="font-mono text-[9px] text-zinc-300 font-normal">
                    V
                  </span>{" "}
                  Changelog
                </button>
              </div>
            </div>

            {/* RIGHT SIDE COLUMN: THE MAIN CODE SECTIONS FLOW CONTENT  */}
            <div className="space-y-12 min-w-0 w-full">
              {sections.map((sec, sIdx) => {
                const codeText = ALL_SNIPPETS[sec.snip];
                return (
                  <div
                    key={sec.id}
                    id={`sec-${sec.id}`}
                    className="space-y-4 scroll-mt-24"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-zinc-400 font-bold">
                        {String(sIdx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        {sec.title}
                      </h3>
                    </div>
                    <p className="text-zinc-500 text-[13px] leading-relaxed">
                      {sec.d}
                    </p>
                    {codeText && (
                      <CodePane
                        fileName={sec.file}
                        langLabel={sec.label}
                        codeText={codeText}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: WEBHOOKS MATRIX ─── */}
        <section
          className="space-y-4 pt-10 border-t border-zinc-100"
          id="sec-webhooks"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span>—</span> Webhooks
          </div>
          <p className="text-zinc-600 text-[13px] leading-relaxed max-w-2xl">
            Scrubbe pushes real-time event payloads to any HTTPS endpoint you
            register . Signatures are verified securely with HMAC-SHA256 filters
            using your generated webhook secret .
          </p>
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-zinc-700">
              Payload signature verification sample
            </div>
            <CodePane
              fileName="webhook_verify.py"
              langLabel="python"
              codeText={ALL_SNIPPETS["wh-verify"]}
            />
          </div>
          <div className="space-y-3 pt-4">
            <div className="text-xs font-bold text-zinc-700">
              Event catalogue matrix
            </div>
            <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-2xs bg-white">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-mono text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Event Name</th>
                    <th className="px-4 py-3">Description Context</th>
                    <th className="px-4 py-3 text-right">Payload Schema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {WEBHOOK_EVENTS.map((e) => (
                    <tr
                      key={e.name}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-zinc-900 font-bold">
                        {e.name}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500 leading-normal max-w-sm">
                        {e.desc}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-[11px] text-zinc-400">
                        {e.schema}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: CLIENT CAPABILITY GRID (EXHIBIT 3) ─── */}
        <section
          className="space-y-4 pt-10 border-t border-zinc-100"
          id="sec-comparison"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span>—</span> SDK comparison
          </div>
          <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white mt-4 shadow-2xs">
            <div className="flex items-center gap-3 p-3.5 border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700">
              <span className="font-mono text-[9px] font-bold border border-zinc-300 rounded px-1.5 py-0.5 uppercase tracking-wide bg-white">
                Exhibit 3
              </span>
              <span className="font-serif text-[14px]">
                Capability matrix across clients
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-center text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-500">
                  <tr>
                    <th className="p-3 text-left font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 pl-6">
                      Capability
                    </th>
                    <th>Python</th>
                    <th>TS / JS</th>
                    <th>Java</th>
                    <th>C#</th>
                    <th>Go</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {[
                    {
                      c: "Lazy cursor pagination",
                      r: ["y", "y", "p", "y", "y"],
                    },
                    {
                      c: "Event streaming (SSE)",
                      r: ["y", "y", "p", "y", "y"],
                    },
                    {
                      c: "OAuth2 client credentials",
                      r: ["y", "y", "y", "y", "y"],
                    },
                    {
                      c: "Credential configuration profiles",
                      r: ["y", "y", "n", "y", "y"],
                    },
                    {
                      c: "Retry logic with full jitter",
                      r: ["y", "y", "y", "y", "y"],
                    },
                    {
                      c: "Automatic idempotency keys",
                      r: ["y", "y", "p", "y", "y"],
                    },
                    {
                      c: "Governance approval error types",
                      r: ["y", "y", "y", "y", "y"],
                    },
                    {
                      c: "MCP knowledge query modules",
                      r: ["y", "y", "p", "y", "y"],
                    },
                    {
                      c: "Native Dependency injection",
                      r: ["n", "n", "n", "y", "n"],
                    },
                    {
                      c: "Edge serverless runtime support",
                      r: ["n", "y", "n", "n", "n"],
                    },
                  ].map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="p-3 text-left font-semibold text-zinc-800 pl-6">
                        {row.c}
                      </td>
                      {row.r.map((state, i) => (
                        <td key={i} className="p-3">
                          {state === "y" && (
                            <span className="text-emerald-600 font-black text-sm">
                              ✓
                            </span>
                          )}
                          {state === "n" && (
                            <span className="text-zinc-300 font-normal">—</span>
                          )}

                          {state === "p" && (
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              Planned
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── CHANGELOG TIMELINE FEED ─── */}
        <section
          className="space-y-4 pt-10 border-t border-zinc-100"
          id="sec-changelog"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            Changelog
          </div>
          <div className="divide-y divide-zinc-200 border-t border-zinc-100 mt-4">
            {CHANGELOG_DATA.map((item) => (
              <div
                key={item.version}
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-5 items-start"
              >
                <div className="sm:col-span-2 font-mono text-[11px] font-semibold text-zinc-400 pt-0.5">
                  {item.date}
                </div>
                <div className="sm:col-span-10 space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs font-bold text-zinc-900">
                    <span>{item.version}</span>
                    {item.tags.map((tag: any) => (
                      <span
                        key={tag}
                        className="text-[9.5px] font-bold px-2 py-0.5 border rounded uppercase tracking-wide bg-emerald-50 border-emerald-200 text-emerald-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ul className="space-y-1.5 text-[12.5px] text-zinc-600 list-none">
                    {item.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex gap-2 leading-relaxed">
                        <span className="text-zinc-300 font-mono">—</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Shared Baseboard Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50/50 py-8 px-8 mt-24">
        <div className="max-w-[1040px] mx-auto flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400">
          <span className="text-zinc-700 font-semibold">
            Scrubbe Operational Intelligence Platform
          </span>
          <span className="text-zinc-200">·</span>
          <a href="#" className="hover:text-zinc-600 transition-colors">
            Docs
          </a>
          <a href="#" className="hover:text-zinc-600 transition-colors">
            GitHub
          </a>
          <div className="flex items-center gap-1.5 ml-auto">
            <span>base_url</span>
            <code className="font-mono text-[11px] text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
              https://api.scrubbe.com
            </code>
          </div>
        </div>
      </footer>
    </div>
  );
}
