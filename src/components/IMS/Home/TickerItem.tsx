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
        width={30}
        height={30}
        className="object-contain"
      />
      <span className="text-base italic font-semibold whitespace-nowrap text-black">
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
    <div className="relative w-full overflow-hidden py-3.5 border-y">
      {/* Left fade */}

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
