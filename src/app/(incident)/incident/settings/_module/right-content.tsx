import { GitBranch, Lock } from "lucide-react";
import React, { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

const RightContent = () => {
  const { get } = useFetch();
  const { data: sso } = useQuery({
    queryKey: ["ims-sso-status"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_sso);
      return res.success ? (res.data?.data ?? null) : null;
    },
    refetchOnWindowFocus: false,
  });

  const { data: connectors = [] } = useQuery({
    queryKey: ["connectors-connections-status"],
    queryFn: async () => {
      const res = await get(endpoint.connectors.connections);
      return res.success ? (res.data?.data?.connections ?? res.data?.data ?? []) : [];
    },
    refetchOnWindowFocus: false,
  });

  const ssoConfigured = Boolean(sso?.available);
  const connectedCount = connectors.filter((c: { status?: string }) => c.status === "HEALTHY").length;

  return (
    <div>
      <div className=" p-6 overflow-y-auto bg-[#030D25]">
        <div className="w-full mx-auto space-y-8">
          {/* HEADER */}
          <div>
            <h1 className="text-base font-bold text-white">Admin status</h1>
            <p className="text-[#94A3B8] text-base">
              Health + audit of configuration changes.
            </p>
          </div>

          {/* STATUS CARDS SECTION */}
          <div className="border border-neutral-500 rounded-2xl p-3 space-y-2 ">
            <StatusRow
              icon={<GitBranch size={16} className="text-orange-400" />}
              label="Delivery ingestion"
              value={connectedCount > 0 ? `${connectedCount} connected` : "None connected"}
              isWarning={connectedCount === 0}
            />
            <StatusRow
              icon={<Lock size={16} className="text-lime-400" />}
              label="SSO"
              value={ssoConfigured ? (sso?.provider ?? "Configured") : "Not configured"}
              isWarning={!ssoConfigured}
            />
          </div>

          {/* RECENT SETTINGS CHANGES */}
          <section className="border border-neutral-500 rounded-2xl p-3 space-y-2">
            <h3 className="text-base font-bold text-white">
              Recent settings changes
            </h3>
            <p className="text-sm text-[#64748B]">
              Saved sections appear here.
            </p>
            <div className="py-4 text-[#94A3B8] italic text-sm">
              No changes yet.
            </div>
          </section>

          {/* ONBOARDING STEPS */}
          <section className="border border-neutral-500 rounded-2xl p-4 space-y-2">
            <h3 className="text-base font-bold text-white">
              Next steps for enterprise onboarding
            </h3>
            <ul className="space-y-4">
              <OnboardingItem
                number="1"
                text="Configure Git provider + CI source (Delivery Ingestion)."
              />
              <OnboardingItem
                number="2"
                text="Set policies (auto-suggest threshold, merge approval)."
              />
              <OnboardingItem
                number="3"
                text="Configure SSO + SCIM (Security & SSO)."
              />
              <OnboardingItem
                number="4"
                text="Set notification routes (Slack + approvals)."
              />
              <OnboardingItem
                number="5"
                text="Validate in a sandbox repo before production."
              />
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({
  icon,
  label,
  value,
  isWarning,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isWarning?: boolean;
}) => (
  <div className="flex justify-between items-center rounded-xl">
    <div className="flex items-center gap-2 px-2 py-1.5 border border-neutral-500 rounded-lg">
      <span className="text-[#00CAD8]">{icon}</span>
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
    <div
      className={`px-4 py-1.5 rounded-lg border border-neutral-500 text-xs font-medium ${
        isWarning ? "text-[#94A3B8]" : "text-white"
      }`}
    >
      {value}
    </div>
  </div>
);

const OnboardingItem = ({ number, text }: { number: string; text: string }) => (
  <li className="flex gap-4 group">
    <span className="text-[#64748B] font-mono text-sm pt-0.5">{number}.</span>
    <p className="text-[#D1D5DB] text-sm leading-relaxed group-hover:text-white transition-colors cursor-default">
      {text}
    </p>
  </li>
);

export default RightContent;
