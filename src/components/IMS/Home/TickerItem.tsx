"use client";

import Image from "next/image";

// ─────────────────────────────────────────────────────────────────
// Integration list — icon paths follow /IMS/icons/{name} convention
// ─────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: "GitHub", icon: "/integration/github2.png" },
  { name: "GitLab", icon: "/integration/gitlab.png" },
  { name: "Kubernetes", icon: "/integration/kubernetes.png" },
  { name: "AWS", icon: "/integration/aws.png" },
  { name: "Datadog", icon: "/integration/datadog.png" },
  { name: "Prometheus", icon: "/integration/prometheus.png" },
  { name: "PagerDuty", icon: "/integration/pagerduty.png" },
  { name: "Grafana", icon: "/integration/grafana.png" },
  { name: "Azure", icon: "/integration/azure.png" },
  { name: "Bitbucket", icon: "/integration/bitbucket.png" },
  { name: "Github Actions", icon: "/integration/github-actions.png" },
];

// ─────────────────────────────────────────────────────────────────
// Single ticker item
// ─────────────────────────────────────────────────────────────────

function TickerItem({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-2.5 px-8 shrink-0">
      <Image
        src={icon}
        alt={name}
        width={22}
        height={22}
        className="object-contain"
      />
      <span
        className="text-sm font-semibold whitespace-nowrap"
        style={{ color: "#d1d5db" }}
      >
        {name}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Ticker Track
// ─────────────────────────────────────────────────────────────────

export default function TickerTrack() {
  // Duplicate list so the marquee loops seamlessly
  const items = [...INTEGRATIONS, ...INTEGRATIONS];

  return (
    <div
      className="relative w-full overflow-hidden py-3.5"
      style={{ background: "#111827" }}
    >
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #111827 0%, transparent 100%)",
        }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, #111827 0%, transparent 100%)",
        }}
      />

      {/* Scrolling track */}
      <div
        className="flex items-center"
        style={{
          animation: "ticker 28s linear infinite",
          width: "max-content",
        }}
      >
        {items.map((item, i) => (
          <TickerItem
            key={`${item.name}-${i}`}
            name={item.name}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Keyframe injected inline — no Tailwind config needed */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
