"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Snippet = {
  label: string;
  code: string;
};

type Language = {
  id: string;
  name: string;
  snippets: Snippet[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const LANGUAGES: Language[] = [
  {
    id: "javascript",
    name: "Javascript",
    snippets: [
      {
        label: "npm",
        code: `npm install @scrubbe/sdk\n# or\nyarn add @scrubbe/sdk\n# or\npnpm add @scrubbe/sdk`,
      },
    ],
  },
  {
    id: "java",
    name: "Java",
    snippets: [
      {
        label: "Maven",
        code: `<dependency>\n  <groupId>com.scrubbe</groupId>\n  <artifactId>scrubbe-sdk</artifactId>\n  <version>1.0.0</version>\n</dependency>`,
      },
      {
        label: "Gradle",
        code: `implementation 'com.scrubbe:scrubbe-sdk:1.0.0'`,
      },
      {
        label: "ivy",
        code: `<dependency org="com.scrubbe" name="scrubbe-sdk" rev="1.0.0" />`,
      },
      {
        label: "sbt",
        code: `libraryDependencies += "com.scrubbe" % "scrubbe-sdk" % "1.0.0"`,
      },
      {
        label: "grape",
        code: `@Grab(group='com.scrubbe', module='scrubbe-sdk', version='1.0.0')`,
      },
      {
        label: "leiningen",
        code: `[com.scrubbe/scrubbe-sdk "1.0.0"]`,
      },
      {
        label: "buildr",
        code: `'com.scrubbe:scrubbe-sdk:jar:1.0.0'`,
      },
    ],
  },
  {
    id: "python",
    name: "Python",
    snippets: [
      {
        label: "pip",
        code: `pip install scrubbe-sdk==1.0.0`,
      },
    ],
  },
  {
    id: "go",
    name: "Go",
    snippets: [
      {
        label: "sh",
        code: `go get github.com/scrubbe/sdk-go`,
      },
    ],
  },
  {
    id: "csharp",
    name: "C#",
    snippets: [
      {
        label: "sh",
        code: `sh\ngo get github.com/scrubbe/sdk-go`,
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScrubbeSDKSection() {
  const [activeId, setActiveId] = useState("javascript");
  const [copied, setCopied] = useState(false);

  const active = LANGUAGES.find((l) => l.id === activeId)!;

  // Java has multiple snippet types; track which one is selected
  const [snippetIndex, setSnippetIndex] = useState<Record<string, number>>({});
  const currentSnippetIdx = snippetIndex[activeId] ?? 0;
  const currentSnippet =
    active.snippets[currentSnippetIdx] ?? active.snippets[0];

  const handleTabChange = (id: string) => {
    setActiveId(id);
    setCopied(false);
  };

  const handleSnippetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSnippetIndex((prev) => ({
      ...prev,
      [activeId]: Number(e.target.value),
    }));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasMultipleSnippets = active.snippets.length > 1;

  return (
    <section className="w-full bg-white dark:bg-neutral-950 py-16 px-4">
      <div className="mx-auto max-w-[1200px]">
        {/* Heading */}
        <div className="mb-10">
          <h2
            className="font-serif text-[2.75rem] leading-[1.1] font-black tracking-tight text-neutral-950 dark:text-white"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Start building with
            <br />
            Scrubbe.
          </h2>
          <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400 max-w-xl">
            Integrate Scrubbe's code intelligence engine into your project with
            a single install command
          </p>
        </div>

        {/* Panel */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col sm:flex-row">
          {/* Left nav */}
          <nav className="sm:w-[220px] flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800 flex sm:flex-col flex-row overflow-x-auto">
            {LANGUAGES.map((lang) => {
              const isActive = lang.id === activeId;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleTabChange(lang.id)}
                  className={`
                    relative text-left px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap
                    border-b border-neutral-200 dark:border-neutral-800 last:border-b-0
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500
                    ${
                      isActive
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }
                  `}
                >
                  {/* Green left accent on active */}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 rounded-r-full" />
                  )}
                  {lang.name}
                </button>
              );
            })}
          </nav>

          {/* Right content */}
          <div className="flex-1 p-6 sm:p-8 bg-white dark:bg-neutral-950">
            {/* Language title */}
            <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-1">
              {active.name}
            </h3>

            {/* Snippet type selector (Java only) */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Installation
              </span>
              {hasMultipleSnippets && (
                <div className="relative">
                  <select
                    value={currentSnippetIdx}
                    onChange={handleSnippetChange}
                    className="appearance-none text-xs font-medium pl-2.5 pr-6 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {active.snippets.map((s, i) => (
                      <option key={i} value={i}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px]">
                    ▾
                  </span>
                </div>
              )}
            </div>

            {/* Code block */}
            <div className="relative rounded-lg bg-neutral-950 dark:bg-black overflow-hidden">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {/* Copy icon */}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <rect
                    x="5"
                    y="5"
                    width="9"
                    height="9"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                {copied ? "Copied!" : "Copy"}
              </button>
              <pre className="text-sm font-mono text-neutral-200 p-5 pt-4 overflow-x-auto leading-relaxed whitespace-pre">
                <code>{currentSnippet.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex justify-end mt-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 rounded-lg px-5 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            View full SDK Docs
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
