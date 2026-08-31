export default function KeyDiagram() {
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 bg-white dark:bg-zinc-900/40 shadow-2xs">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        What API keys power
      </div>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="shrink-0 bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2">
          <svg
            width="320"
            height="170"
            viewBox="0 0 320 170"
            fill="none"
            className="font-mono"
          >
            <rect
              x="120"
              y="8"
              width="80"
              height="30"
              rx="4"
              className="fill-[#0A0A0A] dark:fill-zinc-800"
            />
            <text
              x="160"
              y="28"
              textAnchor="middle"
              className="fill-[#02DD82]"
              fontWeight="600"
              fontSize="11"
            >
              API KEY
            </text>
            <line
              x1="160"
              y1="38"
              x2="160"
              y2="58"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="50"
              y1="58"
              x2="270"
              y2="58"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="50"
              y1="58"
              x2="50"
              y2="72"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="160"
              y1="58"
              x2="160"
              y2="72"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="270"
              y1="58"
              x2="270"
              y2="72"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <rect
              x="10"
              y="72"
              width="80"
              height="26"
              rx="3"
              className="fill-[#f4f4f4] dark:fill-zinc-800 stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <text
              x="50"
              y="89"
              textAnchor="middle"
              fontSize="10.5"
              className="fill-[#6b6b6b] dark:fill-zinc-400"
            >
              SDKs
            </text>
            <rect
              x="120"
              y="72"
              width="80"
              height="26"
              rx="3"
              className="fill-[#f4f4f4] dark:fill-zinc-800 stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <text
              x="160"
              y="89"
              textAnchor="middle"
              fontSize="10.5"
              className="fill-[#6b6b6b] dark:fill-zinc-400"
            >
              MCP
            </text>
            <rect
              x="230"
              y="72"
              width="80"
              height="26"
              rx="3"
              className="fill-[#f4f4f4] dark:fill-zinc-800 stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <text
              x="270"
              y="89"
              textAnchor="middle"
              fontSize="10.5"
              className="fill-[#6b6b6b] dark:fill-zinc-400"
            >
              CI/CD
            </text>
            <line
              x1="160"
              y1="98"
              x2="160"
              y2="112"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="60"
              y1="112"
              x2="260"
              y2="112"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="60"
              y1="112"
              x2="60"
              y2="124"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="160"
              y1="112"
              x2="160"
              y2="124"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <line
              x1="260"
              y1="112"
              x2="260"
              y2="124"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <text
              x="60"
              y="138"
              textAnchor="middle"
              fontSize="10"
              className="fill-[#9b9b9b] dark:fill-zinc-500"
            >
              Infrastructure
            </text>
            <text
              x="160"
              y="138"
              textAnchor="middle"
              fontSize="10"
              className="fill-[#9b9b9b] dark:fill-zinc-500"
            >
              Incidents
            </text>
            <text
              x="260"
              y="138"
              textAnchor="middle"
              fontSize="10"
              className="fill-[#9b9b9b] dark:fill-zinc-500"
            >
              Automation
            </text>
            <line
              x1="160"
              y1="140"
              x2="160"
              y2="152"
              className="stroke-[#e4e4e4] dark:stroke-zinc-700"
              strokeWidth="1"
            />
            <rect
              x="90"
              y="152"
              width="140"
              height="16"
              rx="3"
              className="fill-[#e8fdf4] dark:fill-emerald-500/10 stroke-[#a7f3d0] dark:stroke-emerald-500/20"
              strokeWidth="1"
            />
            <text
              x="160"
              y="164"
              textAnchor="middle"
              fontSize="10"
              className="fill-[#047857] dark:fill-emerald-400"
            >
              Knowledge Intelligence
            </text>
          </svg>
        </div>
        <div className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-3 pt-1">
          <p>
            API keys in Scrubbe are not developer tokens. They are{" "}
            <strong className="text-zinc-900 dark:text-zinc-100 font-medium">
              operational identities
            </strong>{" "}
            — each carrying a defined service scope, a permission envelope, an
            environment boundary, and a full audit timeline.
          </p>
          <p>
            Every authenticated action — whether an SDK reading an incident, an
            MCP server querying the knowledge corpus, or an automation
            triggering a playbook — is recorded against the key that made the
            call.
          </p>
        </div>
      </div>
    </div>
  );
}
