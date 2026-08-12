"use client";

import PricingHero from "@/components/IMS/pricing/Hero";
import { useFetch } from "@/hooks/useFetch";
import useAuthStore from "@/lib/stores/auth.store";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────

const PLANS = {
  starter: {
    name: "Starter Plan",
    platform: 350,
    perUser: 20,
    incIncluded: 20,
    execIncluded: 50,
    incOver: 15,
    execOver: 0.75,
  },
  growth: {
    name: "Growth Plan",
    platform: 900,
    perUser: 25,
    incIncluded: 75,
    execIncluded: 250,
    incOver: 12,
    execOver: 0.6,
  },
  scale: {
    name: "Scale Plan",
    platform: 2500,
    perUser: 40,
    incIncluded: 250,
    execIncluded: 1000,
    incOver: 10,
    execOver: 0.5,
  },
  enterprise: {
    name: "Enterprise Plan",
    platform: 6000,
    perUser: 60,
    incIncluded: 1000,
    execIncluded: 5000,
    incOver: 8,
    execOver: 0.3,
  },
} as const;
type PlanKey = keyof typeof PLANS;

const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

// ─────────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────────

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00D26A"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative h-[22px] flex items-center">
      {/* Track */}
      <div className="absolute inset-x-0 h-2 rounded-full bg-[#F2F5F3] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00D26A] transition-[width] duration-[60ms]"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Native input — invisible but interactive */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-x-0 opacity-0 cursor-pointer h-[22px] m-0 p-0 z-10"
      />
      {/* Thumb */}
      <div
        className="absolute w-[22px] h-[22px] rounded-full bg-white border-[3px] border-[#00D26A] pointer-events-none transition-[left] duration-[60ms]"
        style={{
          left: `calc(${pct}% - 11px)`,
          boxShadow: "0 4px 12px rgba(0,210,106,.22)",
        }}
      />
    </div>
  );
}

function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (a: boolean) => void;
}) {
  return (
    <div className="inline-grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-[#F2F5F3] border border-[#E5EAE7]">
      <button
        onClick={() => onChange(false)}
        className={`min-w-[112px] rounded-[10px] px-3.5 py-2.5 text-[13px] font-extrabold transition-all cursor-pointer border-0 ${
          !annual
            ? "bg-white text-[#0A1F14] shadow-sm"
            : "bg-transparent text-[#5B6B62]"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange(true)}
        className={`min-w-[112px] rounded-[10px] px-3.5 py-2.5 text-[13px] font-extrabold transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
          annual
            ? "bg-white text-[#0A1F14] shadow-sm"
            : "bg-transparent text-[#5B6B62]"
        }`}
      >
        Yearly
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#00D26A] text-white text-[10px] tracking-wider">
          -20%
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 1. CALCULATOR
// ─────────────────────────────────────────────────────────────────

function Calculator() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { post } = useFetch();
  const [annual, setAnnual] = useState(false);
  const [planKey, setPlanKey] = useState<PlanKey>("growth");
  const [ctaLoading, setCtaLoading] = useState(false);
  const [team, setTeam] = useState(25);
  const [inc, setInc] = useState(75);
  const [exec, setExec] = useState(250);

  const plan = PLANS[planKey];
  const disc = annual ? 0.8 : 1;
  const platform = plan.platform * disc;
  const users = team * plan.perUser * disc;
  const incOver = Math.max(0, inc - plan.incIncluded) * plan.incOver * disc;
  const execOver = Math.max(0, exec - plan.execIncluded) * plan.execOver * disc;
  const total = platform + users + incOver + execOver;

  const incI =
    inc <= 50
      ? { label: "Low", cls: "bg-[#E6FBF0] text-[#00A855]" }
      : inc <= 200
      ? { label: "Medium", cls: "bg-[#FFF4D9] text-[#8A6500]" }
      : { label: "High", cls: "bg-[#FFE6E0] text-[#B33C19]" };

  const execI =
    exec <= 100
      ? { label: "Safe (manual)", cls: "bg-[#E6FBF0] text-[#00A855]" }
      : exec <= 700
      ? { label: "Balanced", cls: "bg-[#FFF4D9] text-[#8A6500]" }
      : { label: "Highly automated", cls: "bg-[#FFE6E0] text-[#B33C19]" };

  const TABS: { key: PlanKey; label: string }[] = [
    { key: "starter", label: "Starter" },
    { key: "growth", label: "Growth" },
    { key: "scale", label: "Scale" },
    { key: "enterprise", label: "Enterprise" },
  ];

  const handleTab = (key: PlanKey) => {
    setPlanKey(key);
    setInc(PLANS[key].incIncluded);
    setExec(PLANS[key].execIncluded);
  };

  const handleCalcCta = async () => {
    const billing = annual ? "year" : "month";
    if (planKey === "starter") {
      if (user) {
        router.push(`${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billings`);
      } else {
        router.push("/auth/business-signup");
      }
      return;
    }
    if (planKey === "enterprise") {
      return; // handled by cal.com elsewhere
    }
    const planType = planKey === "scale" ? "professional" : planKey;
    if (user) {
      setCtaLoading(true);
      try {
        const res = await post("/pricing/checkout/create-session", {
          planType,
          billingCycle: billing,
          successUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billings`,
          cancelUrl: window.location.href,
        });
        if (res.success) {
          window.location.href = res.data.data.url;
        } else {
          alert(typeof res.data === "string" ? res.data : "Checkout failed. Please try again.");
        }
      } catch {
        alert("Something went wrong. Please try again.");
      } finally {
        setCtaLoading(false);
      }
    } else {
      localStorage.setItem("scrubbe_plan_intent", JSON.stringify({ planType, billingCycle: billing }));
      const cb = encodeURIComponent(`${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billings`);
      router.push(`/auth/signin?callbackUrl=${cb}`);
    }
  };

  return (
    <div className="my-20 bg-white border border-[#E5EAE7] rounded-3xl overflow-hidden shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px]">
        {/* Controls */}
        <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-[#E5EAE7]">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0A1F14]">
                Build your plan
              </h2>
              <p className="text-sm text-[#5B6B62] mt-1">
                Drag the controls to model your real incident workload.
              </p>
            </div>
            <BillingToggle annual={annual} onChange={setAnnual} />
          </div>

          {/* Plan tabs */}
          <div className="flex gap-1 p-1 bg-[#F2F5F3] rounded-xl mb-8 overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTab(key)}
                className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-0 transition-all whitespace-nowrap ${
                  planKey === key
                    ? "bg-white text-[#0A1F14] shadow-sm"
                    : "bg-transparent text-[#5B6B62]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-9">
            {/* Team */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <span className="text-sm font-semibold uppercase tracking-[.05em] text-[#1A2E22]">
                  Team size
                </span>
                <span className="font-mono font-semibold text-base md:text-lg text-[#0A1F14]">
                  <strong className="text-[#00A855]">
                    {team >= 500 ? "500+" : team}
                  </strong>{" "}
                  responders
                </span>
              </div>
              <Slider value={team} min={1} max={500} onChange={setTeam} />
              <div className="flex justify-between mt-2.5 text-xs text-[#5B6B62]">
                <span>1</span>
                <span>50</span>
                <span>200</span>
                <span>500+</span>
              </div>
            </div>

            {/* Incidents */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <span className="text-sm font-semibold uppercase tracking-[.05em] text-[#1A2E22]">
                  Incident capacity
                </span>
                <span className="font-mono font-semibold text-base md:text-lg text-[#0A1F14]">
                  <strong className="text-[#00A855]">{inc}</strong> / month
                </span>
              </div>
              <Slider value={inc} min={10} max={500} onChange={setInc} />
              <div className="flex justify-between mt-2.5 text-xs text-[#5B6B62]">
                <span>10</span>
                <span>100</span>
                <span>250</span>
                <span>500</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-sm">
                <span className="text-[#5B6B62]">Intensity:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${incI.cls}`}
                >
                  {incI.label}
                </span>
                <span className="text-[#5B6B62] text-xs">
                  Coordinated incidents · not raw alerts
                </span>
              </div>
            </div>

            {/* Exec */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <span className="text-sm font-semibold uppercase tracking-[.05em] text-[#1A2E22]">
                  Automation level
                </span>
                <span className="font-mono font-semibold text-base md:text-lg text-[#0A1F14]">
                  <strong className="text-[#00A855]">{exec}</strong> actions /
                  month
                </span>
              </div>
              <Slider value={exec} min={0} max={2000} onChange={setExec} />
              <div className="flex justify-between mt-2.5 text-xs text-[#5B6B62]">
                <span>Safe (manual)</span>
                <span>Balanced</span>
                <span>Highly automated</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-sm">
                <span className="text-[#5B6B62]">Posture:</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${execI.cls}`}
                >
                  {execI.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost panel */}
        <div className="bg-gradient-to-b from-[#F7FCF9] to-[#EEFAF3] p-6 md:p-10">
          <div
            className="bg-white rounded-2xl p-6 md:p-7 border border-[#00D26A]/20"
            style={{ boxShadow: "0 4px 16px rgba(10,31,20,.06)" }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.08em] text-[#00A855]">
              <span className="w-2 h-2 rounded-full bg-[#00D26A] inline-block" />
              {plan.name}
            </div>
            <h3 className="text-sm text-[#5B6B62] mt-3.5 font-medium">
              {annual ? "Estimated yearly" : "Estimated monthly"}
            </h3>
            <div className="text-5xl font-extrabold tracking-tight mt-2 mb-1 leading-none text-[#0A1F14]">
              <span className="text-[28px] align-top mr-0.5 text-[#5B6B62]">
                $
              </span>
              {Math.round(total).toLocaleString()}
            </div>
            <p className="text-sm text-[#5B6B62]">
              {annual
                ? "per year, billed annually"
                : "per month, billed monthly"}
            </p>

            <div className="my-6 border-t border-dashed border-[#E5EAE7] pt-5 space-y-1.5">
              {[
                { label: "Platform", amt: fmt(platform) },
                {
                  label: `Users (${team >= 500 ? "500+" : team})`,
                  amt: fmt(users),
                },
                { label: "Incident overage", amt: fmt(incOver) },
                { label: "Execution overage", amt: fmt(execOver) },
              ].map(({ label, amt }) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 text-sm"
                >
                  <span className="text-[#5B6B62]">{label}</span>
                  <span className="font-mono font-semibold text-[#0A1F14]">
                    {amt}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-[#FAFBFA] rounded-xl mb-4 border border-[#E5EAE7]">
              <div>
                <p className="font-semibold text-sm text-[#0A1F14]">
                  {annual ? "Yearly billing selected" : "Annual option"}
                </p>
                <p className="text-xs text-[#5B6B62] mt-0.5">
                  Switch to yearly for {fmt(plan.platform * 0.8)}/mo ·{" "}
                  <span className="bg-[#00D26A] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                    SAVE 20%
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCalcCta}
              disabled={ctaLoading}
              className="w-full py-3.5 rounded-xl bg-[#00D26A] text-white font-semibold text-[15px] cursor-pointer border-0 disabled:opacity-70"
              style={{ boxShadow: "0 4px 14px rgba(0,210,106,.22)" }}
            >
              {ctaLoading ? "Redirecting…" : "Start free trial"}
            </button>
          </div>

          {/* ROI strip */}
          <div className="mt-6 bg-white rounded-xl border border-dashed border-[#00D26A]/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#5B6B62] mb-2.5">
              ROI estimate
            </p>
            {[
              "Saves ~<strong>120–180</strong> engineering hours / month",
              "Cuts incident resolution time up to <strong>65%</strong>",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5">
                <CheckIcon />
                <span
                  className="text-[13px] text-[#1A2E22]"
                  dangerouslySetInnerHTML={{ __html: t }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. MTTR ROI CALCULATOR
// ─────────────────────────────────────────────────────────────────

function MttrRoi() {
  const [eng, setEng] = useState(8);
  const [inc, setInc] = useState(120);
  const [mttr, setMttr] = useState(90);
  const [cost, setCost] = useState(120);

  const newMttr = Math.max(1, Math.round(mttr * (1 - 0.73)));
  const hoursSaved = +(((inc * mttr * 0.73) / 60) * eng).toFixed(1);
  const monthly = Math.round(hoursSaved * cost);
  const annual = monthly * 12;
  const deduped = Math.round(inc * 0.94);

  const controls = [
    {
      label: "Average engineers on-call",
      value: eng,
      min: 2,
      max: 50,
      set: setEng,
      display: `${eng} engineers`,
      scale: ["2", "12", "30", "50"],
    },
    {
      label: "Incidents per month",
      value: inc,
      min: 10,
      max: 2000,
      step: 10,
      set: setInc,
      display: `${inc.toLocaleString()} incidents`,
      scale: ["10", "500", "1,250", "2,000"],
    },
    {
      label: "Average MTTR today",
      value: mttr,
      min: 15,
      max: 480,
      step: 5,
      set: setMttr,
      display: `${mttr} min`,
      scale: ["15m", "2h", "5h", "8h"],
    },
    {
      label: "Avg engineer hourly cost",
      value: cost,
      min: 50,
      max: 300,
      step: 5,
      set: setCost,
      display: `$${cost}/hr`,
      scale: ["$50", "$125", "$220", "$300"],
    },
  ];

  const results = [
    {
      v: `${hoursSaved.toLocaleString()} hrs`,
      l: "Engineer-hours returned each month",
      green: false,
    },
    { v: fmt(monthly), l: "Engineering time saved per month", green: true },
    {
      v: deduped.toLocaleString(),
      l: "Noisy incidents removed from queue",
      green: false,
    },
    {
      v: `${newMttr} min`,
      l: "New MTTR estimate after reduction",
      green: true,
    },
  ];

  return (
    <section
      className="py-16 md:py-[104px] border-t border-b border-[#E5EAE7]"
      style={{
        background:
          "radial-gradient(circle at top left,rgba(0,210,106,.14),transparent 34%),linear-gradient(180deg,#F7FCF9 0%,#fff 72%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-[clamp(28px,5vw,58px)] font-medium leading-[1.02] tracking-tight text-[#0A1F14] mb-3.5">
            What does a 73% MTTR <br /> reduction actually mean for <br /> your
            team?
          </h2>
          <p className="text-[17px] text-[#5B6B62] max-w-[680px]">
            Model the operational lift behind faster recovery: fewer
            engineer-hours lost, fewer duplicate incidents in the queue, and a
            clearer estimate of monthly savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input panel */}
          <div
            className="bg-white/95 border border-[#00D26A]/20 rounded-3xl p-6 md:p-8"
            style={{ boxShadow: "0 12px 40px rgba(10,31,20,.08)" }}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xl font-extrabold tracking-tight text-[#0A1F14]">
                  Tune your current incident load
                </p>
                <p className="text-sm text-[#5B6B62] mt-1">
                  The calculator uses Scrubbe's benchmark assumptions as the
                  baseline.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#E6FBF0] text-[#00A855] text-xs font-bold whitespace-nowrap self-start">
                <span
                  className="w-[7px] h-[7px] rounded-full bg-[#00D26A] inline-block"
                  style={{ boxShadow: "0 0 0 5px rgba(0,210,106,.18)" }}
                />
                73% MTTR reduction
              </div>
            </div>

            {controls.map(
              ({ label, value, min, max, step, set, display, scale }, i) => (
                <div key={i} className="py-5 border-t border-[#F2F5F3]">
                  <div className="flex flex-wrap justify-between items-baseline gap-4 mb-3.5">
                    <span className="text-[13px] font-extrabold uppercase tracking-[.08em] text-[#1A2E22]">
                      {label}
                    </span>
                    <span className="font-mono text-base md:text-lg font-bold text-[#0A1F14] whitespace-nowrap">
                      {display}
                    </span>
                  </div>
                  <Slider
                    value={value}
                    min={min}
                    max={max}
                    step={step ?? 1}
                    onChange={set}
                  />
                  <div className="flex justify-between mt-2.5 text-xs text-[#5B6B62]">
                    {scale.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="mt-2 p-4 rounded-[14px] bg-[#FAFBFA] text-[13px] text-[#5B6B62]">
              Based on median Scrubbe customer data: 73% MTTR reduction, 94%
              deduplication rate, and sub-30-second signal-to-incident creation.
            </div>
          </div>

          {/* Output panel */}
          <aside
            className="flex flex-col border border-[#00D26A]/30 rounded-3xl overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at top right,rgba(0,210,106,.18),transparent 42%),#071F13",
            }}
          >
            <div className="px-6 md:px-8 pt-8 pb-7 border-b border-white/10">
              <p className="font-mono text-white/60 text-xs tracking-[.12em] uppercase mb-2.5">
                Estimated annual saving
              </p>
              <div className="text-[clamp(40px,6vw,72px)] leading-none font-extrabold tracking-[-0.055em] text-white">
                $
                <span className="text-[#00D26A]">
                  {annual.toLocaleString()}
                </span>
              </div>
              <p className="mt-3.5 text-white/65 text-[15px]">
                Engineer time only. Downtime, churn risk, and compliance
                exposure are not included.
              </p>
            </div>

            <div className="grid grid-cols-2">
              {results.map(({ v, l, green }, i) => (
                <div
                  key={i}
                  className={`p-4 md:p-6 ${
                    i % 2 === 0 ? "border-r border-white/10" : ""
                  } ${i < 2 ? "border-b border-white/10" : ""}`}
                >
                  <p
                    className={`text-[22px] md:text-[28px] font-extrabold leading-none tracking-tight ${
                      green ? "text-[#00D26A]" : "text-white"
                    }`}
                  >
                    {v}
                  </p>
                  <p className="mt-2 text-white/55 text-xs leading-snug">{l}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto px-6 py-5 border-t border-white/10 font-mono text-white/40 text-[11px] leading-relaxed">
              <strong className="text-[#00D26A] font-bold">Formula:</strong>{" "}
              incidents × MTTR × 73% reduction × engineers × hourly cost.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. PRICING TIERS
// ─────────────────────────────────────────────────────────────────

const TIERS = [
  {
    key: "starter",
    tag: "Starter",
    dot: "#00D26A",
    title: "Control Foundation",
    pos: "Structured incident response without automation risk.",
    mp: 350,
    mu: 20,
    cap: [
      "20 incidents / month",
      "Up to 3-step orchestration per incident",
      "50 execution credits",
    ],
    over: "$15 / additional incident\n$0.75 / execution",
    ftitle: "Includes",
    feats: [
      "Incident ingestion (alerts, logs, webhooks)",
      "AI-assisted analysis (single-agent)",
      "Slack + Email integration",
      "Timeline + audit logs",
      "Manual approvals only",
    ],
    cta: "Start with Starter",
    ctaP: false,
    badge: null,
  },
  {
    key: "growth",
    tag: "Growth",
    dot: "#2C7BFF",
    title: "Coordinated Response",
    pos: "Turn incidents into coordinated, policy-driven workflows.",
    mp: 900,
    mu: 25,
    cap: [
      "75 incidents / month",
      "Up to 8-step orchestration per incident",
      "250 execution credits",
    ],
    over: "$12 / additional incident\n$0.60 / execution",
    ftitle: "Everything in Starter, plus",
    feats: [
      "Multi-agent orchestration",
      "Policy engine (govern execution)",
      "Blast radius mapping",
      "GitHub / GitLab / CI integrations",
      "War room automation (Slack, Teams, Zoom)",
      "Runbook execution",
    ],
    cta: "Start free trial",
    ctaP: true,
    badge: "Most popular",
  },
  {
    key: "scale",
    tag: "Scale",
    dot: "#8B5CF6",
    title: "Automated Resolution",
    pos: "Resolve incidents automatically — without losing control.",
    mp: 2500,
    mu: 40,
    cap: [
      "250 incidents / month",
      "Unlimited orchestration depth",
      "1,000 execution credits",
    ],
    over: "$10 / additional incident\n$0.50 / execution",
    ftitle: "Everything in Growth, plus",
    feats: [
      "Policy-controlled auto-remediation",
      "Cross-system correlation (infra + logs + alerts)",
      "Custom agent workflows",
      "Incident replay + simulation",
      "Advanced audit + compliance logs",
    ],
    cta: "Talk to sales",
    ctaP: false,
    badge: null,
  },
  {
    key: "enterprise",
    tag: "Enterprise",
    dot: "#1A2E22",
    title: "Full Control Plane",
    pos: "Mission-critical incident infrastructure for regulated environments.",
    mp: 6000,
    mu: 0,
    cap: [
      "Custom incident volume (500–5,000+)",
      "Custom execution pricing ($0.20–$0.40)",
    ],
    over: "",
    ftitle: "Includes",
    feats: [
      "Dedicated control plane",
      "On-prem / VPC deployment",
      "Advanced RBAC + SSO + SCIM",
      "Custom policy frameworks",
      "Compliance integrations",
      "SLA-backed support",
    ],
    cta: "Book demo",
    ctaP: false,
    badge: null,
  },
];

function Tiers() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { post } = useFetch();
  const [annual, setAnnual] = useState(false);
  const [ctaLoading, setCtaLoading] = useState<string | null>(null);
  const disc = annual ? 0.8 : 1;

  const handleTierCta = async (key: string) => {
    const billing = annual ? "year" : "month";

    // Enterprise/scale book-demo — handled by cal.com data attributes; nothing extra
    if (key === "enterprise" || key === "scale") return;

    if (key === "starter") {
      if (user) {
        router.push(`${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billings`);
      } else {
        router.push("/auth/business-signup");
      }
      return;
    }

    // Always redirect to the billings page with plan intent in the URL.
    // Calling the checkout API from scrubbe.com causes cross-domain auth issues
    // (token lives in incidents.scrubbe.com localStorage, not here).
    // The billings page is the authenticated context where checkout works reliably.
    const incidentBase = process.env.NEXT_PUBLIC_INCIDENT_URL;
    const billingUrl = `${incidentBase}/incident/billings?plan=${key}&billing=${billing}`;
    setCtaLoading(key);
    window.location.href = billingUrl;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-[#0A1F14] mb-3">
            Pick the plan that matches your incident posture
          </h2>
          <p className="text-[17px] text-[#5B6B62] max-w-[580px] mx-auto">
            Every tier includes ingestion, AI analysis, full audit logs, and
            Slack integration.
          </p>
          <div className="mt-6 flex justify-center">
            <BillingToggle annual={annual} onChange={setAnnual} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((t) => {
            const platform = t.mp * disc;
            const isFeat = t.key === "growth";
            return (
              <div
                key={t.key}
                className={`relative flex flex-col bg-white rounded-[20px] p-7 ${
                  isFeat ? "border-[#00D26A]" : "border-[#E5EAE7]"
                } border`}
                style={
                  isFeat
                    ? { boxShadow: "0 12px 40px rgba(0,210,106,.18)" }
                    : undefined
                }
              >
                {t.badge && (
                  <span
                    className="absolute -top-3 right-6 px-3 py-1.5 bg-[#00D26A] text-white text-[11px] font-bold uppercase tracking-[.06em] rounded-lg"
                    style={{ boxShadow: "0 12px 40px rgba(0,210,106,.18)" }}
                  >
                    {t.badge}
                  </span>
                )}

                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#5B6B62]">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: t.dot }}
                  />
                  {t.tag}
                </div>
                <h3 className="text-[22px] font-extrabold tracking-tight text-[#0A1F14] mt-3 mb-1.5">
                  {t.title}
                </h3>
                <p className="text-[13px] text-[#5B6B62] mb-5 min-h-[38px]">
                  {t.pos}
                </p>

                <div className="text-[36px] font-extrabold tracking-tight leading-none text-[#0A1F14]">
                  {t.key === "enterprise" ? "From " : ""}
                  {fmt(platform)}
                  <small className="text-[13px] text-[#5B6B62] font-medium">
                    {" "}
                    / mo{t.key !== "enterprise" ? " platform" : ""}
                  </small>
                </div>
                <div className="min-h-[19px] mt-1.5 text-[12px] font-bold text-[#00A855]">
                  {annual
                    ? `Billed yearly: ${fmt(t.mp * 0.8 * 12)} platform / year`
                    : ""}
                </div>
                <div className="mt-1 text-[13px] text-[#5B6B62] font-mono">
                  {t.mu > 0
                    ? `+ ${fmt(t.mu * disc)} / user / month${
                        annual ? " effective" : ""
                      }`
                    : "Custom user pricing"}
                </div>

                <hr className="border-0 border-t border-[#E5EAE7] my-5" />

                <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#5B6B62] mb-2.5">
                  Included capacity
                </p>
                <ul className="flex flex-col gap-2.5 text-sm mb-4 list-none p-0">
                  {t.cap.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-[#1A2E22]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] mt-2 shrink-0 inline-block" />
                      {c}
                    </li>
                  ))}
                </ul>

                {t.over ? (
                  <div className="bg-[#FAFBFA] rounded-[10px] px-3.5 py-3 text-xs text-[#5B6B62] mb-4 leading-[1.7] font-mono whitespace-pre-line">
                    {t.over}
                  </div>
                ) : (
                  <div className="h-[60px]" />
                )}

                <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#5B6B62] mb-2.5">
                  {t.ftitle}
                </p>
                <ul className="flex flex-col gap-2.5 text-sm mb-4 flex-1 list-none p-0">
                  {t.feats.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[#1A2E22]"
                    >
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleTierCta(t.key)}
                  disabled={ctaLoading === t.key}
                  data-cal-namespace={t.key === "enterprise" || t.key === "scale" ? "hero-demo" : undefined}
                  data-cal-link={t.key === "enterprise" || t.key === "scale" ? "scrubbe/decision-system-demo" : undefined}
                  data-cal-config={t.key === "enterprise" || t.key === "scale" ? '{"layout":"month_view","theme":"light"}' : undefined}
                  className={`w-full px-4 py-3 rounded-[10px] font-semibold text-sm cursor-pointer mt-auto transition-all disabled:opacity-70 ${
                    t.ctaP
                      ? "bg-[#00D26A] text-white border-0"
                      : "bg-white text-[#0A1F14] border border-[#E5EAE7] hover:border-[#00D26A]"
                  }`}
                  style={
                    t.ctaP
                      ? { boxShadow: "0 4px 14px rgba(0,210,106,.22)" }
                      : undefined
                  }
                >
                  {ctaLoading === t.key ? "Redirecting…" : t.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. COMPARE TABLE
// ─────────────────────────────────────────────────────────────────

const CMP = [
  { f: "Incident ingestion", s: true, g: true, sc: true, e: true },
  { f: "Multi-agent orchestration", s: false, g: true, sc: true, e: true },
  { f: "Policy engine", s: false, g: true, sc: true, e: true },
  { f: "Blast radius mapping", s: false, g: true, sc: true, e: true },
  { f: "Auto-remediation", s: false, g: false, sc: true, e: true },
  { f: "Cross-system correlation", s: false, g: false, sc: true, e: true },
  { f: "Custom agents", s: false, g: false, sc: true, e: true },
  { f: "Compliance controls", s: false, g: false, sc: true, e: true },
];

function CompareTable() {
  return (
    <section className="py-16 bg-[#FAFBFA]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-[#0A1F14] mb-3">
            Compare capabilities
          </h2>
          <p className="text-[17px] text-[#5B6B62] max-w-[580px] mx-auto">
            The features that change as your incident posture matures.
          </p>
        </div>
        <div className="bg-white border border-[#E5EAE7] rounded-[20px] overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[480px]">
            <thead>
              <tr>
                {["Capability", "Starter", "Growth", "Scale", "Enterprise"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`${
                        i === 0 ? "text-left" : "text-center"
                      } px-4 md:px-6 py-5 bg-white border-b border-[#E5EAE7] font-bold text-[13px] uppercase tracking-[.05em] text-[#0A1F14]`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {CMP.map((row) => (
                <tr
                  key={row.f}
                  className="border-b border-[#F2F5F3] hover:bg-[#FAFBFA]"
                >
                  <td className="px-4 md:px-6 py-4 font-medium text-[#1A2E22]">
                    {row.f}
                  </td>
                  {([row.s, row.g, row.sc, row.e] as boolean[]).map((v, i) => (
                    <td key={i} className="px-4 md:px-6 py-4 text-center">
                      {v ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E6FBF0] text-[#00A855]">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F2F5F3] text-[#C7CFC9]">
                          —
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
  );
}

// ─────────────────────────────────────────────────────────────────
// 5. USAGE EXPLAINER
// ─────────────────────────────────────────────────────────────────

function UsageExplainer() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-tight text-[#0A1F14] mb-3">
            How usage works
          </h2>
          <p className="text-[17px] text-[#5B6B62] max-w-[580px] mx-auto">
            Two simple meters. Both are designed so you don't pay for noise.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E5EAE7] rounded-[20px] p-6 md:p-9">
            <h3 className="text-[22px] font-bold tracking-tight text-[#0A1F14] mb-2">
              What counts as an incident?
            </h3>
            <p className="text-sm text-[#5B6B62] mb-6">
              A coordinated event requiring analysis, decision-making, and/or
              remediation across one or more systems.
            </p>
            {[
              {
                icon: "✓",
                green: true,
                text: (
                  <span>
                    Correlated alerts collapsed into a single incident ={" "}
                    <strong>1 incident</strong>
                  </span>
                ),
              },
              {
                icon: "×",
                green: false,
                text: (
                  <span>
                    Duplicate or noisy alerts already grouped together ={" "}
                    <strong>not counted</strong>
                  </span>
                ),
              },
              {
                icon: "✓",
                green: true,
                text: (
                  <span>
                    Multi-system event correlated by Scrubbe ={" "}
                    <strong>1 incident</strong>
                  </span>
                ),
              },
            ].map(({ icon, green, text }, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 py-2.5 text-sm text-[#1A2E22] ${
                  i > 0 ? "border-t border-[#F2F5F3]" : ""
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                    green
                      ? "bg-[#E6FBF0] text-[#00A855]"
                      : "bg-[#FFEEE9] text-[#B33C19]"
                  }`}
                >
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#E5EAE7] rounded-[20px] p-6 md:p-9">
            <h3 className="text-[22px] font-bold tracking-tight text-[#0A1F14] mb-2">
              What is an execution?
            </h3>
            <p className="text-sm text-[#5B6B62] mb-6">
              Any automated action taken by Scrubbe on your behalf — each
              consumes one credit.
            </p>
            {[
              "Restarting services",
              "Rolling back deployments",
              "Creating PRs and patches",
              "Running runbooks",
              "Triggering CI / CD pipelines",
            ].map((t, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 py-2.5 text-sm text-[#1A2E22] ${
                  i > 0 ? "border-t border-[#F2F5F3]" : ""
                }`}
              >
                <span className="w-7 h-7 rounded-lg bg-[#E6FBF0] text-[#00A855] flex items-center justify-center shrink-0 font-bold">
                  →
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6. FAQ
// ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How is Scrubbe pricing calculated?",
    a: "Each plan starts with a monthly platform fee, then adds responder access based on team size. Your included incident capacity and execution credits are built into the plan, and the calculator estimates any overages when your monthly incident or automation usage is above the included amount.",
  },
  {
    q: "What changes when we choose yearly billing?",
    a: "Yearly billing applies a 20% discount. The plan cards show the discounted effective monthly platform and user rates, while the Build your plan calculator shows the estimated annual total billed yearly.",
  },
  {
    q: "What counts as an incident?",
    a: "An incident is a coordinated event that needs analysis, decision-making, or remediation across one or more systems. Correlated alerts grouped into one event count as one incident, and duplicate or noisy alerts already collapsed by Scrubbe are not counted separately.",
  },
  {
    q: "What is an execution credit?",
    a: "An execution credit is consumed when Scrubbe takes an automated action on your behalf, such as restarting a service, rolling back a deployment, creating a PR, running a runbook, or triggering CI/CD. Manual review and approval steps do not create extra execution charges by themselves.",
  },
  {
    q: "What happens if we exceed included capacity?",
    a: "Overages are charged by plan. Starter adds $15 per additional incident and $0.75 per execution. Growth adds $12 per additional incident and $0.60 per execution. Scale adds $10 per additional incident and $0.50 per execution. Enterprise uses custom incident volume and custom execution pricing.",
  },
  {
    q: "Which plan should we pick?",
    a: "Starter fits teams standardizing incident response with manual approvals. Growth fits teams coordinating policy-driven workflows. Scale is for teams ready for policy-controlled auto-remediation. Enterprise is for regulated environments needing dedicated control plane, VPC deployment, SSO/SCIM, and SLA-backed support.",
  },
  {
    q: "Are integrations included?",
    a: "Every tier includes ingestion, AI analysis, full audit logs, and Slack integration. Starter includes Slack and email. Growth adds GitHub, GitLab, CI integrations, and war room automation. Scale and Enterprise expand into advanced automation, compliance controls, and custom workflows.",
  },
  {
    q: "Does the ROI calculator affect my price?",
    a: "No. The ROI calculator is an estimate of engineering time returned from faster incident resolution. It does not change your plan price, capacity, or overage calculations.",
  },
  {
    q: "Is Enterprise pricing fixed?",
    a: "Enterprise starts from $6,000 per month. Final pricing depends on incident volume, execution pricing, deployment model, support requirements, compliance controls, and custom user pricing.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-16 md:py-24 bg-[#FAFBFA] border-t border-b border-[#E5EAE7]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] gap-9 md:gap-14 items-start">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3.5 font-mono text-xs font-bold uppercase tracking-[.12em] text-[#00A855]">
              <span className="w-[26px] h-0.5 bg-[#00D26A] inline-block" />
              Pricing FAQ
            </div>
            <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold leading-[1.05] tracking-tight text-[#0A1F14] mb-3.5">
              Answers before you model the bill.
            </h2>
            <p className="text-base text-[#5B6B62] max-w-[390px]">
              Scrubbe pricing combines a platform fee, responder access,
              included monthly capacity, and usage-based overages for larger
              incident workloads.
            </p>
          </div>

          {/* Accordion */}
          <div className="border-t border-[#E5EAE7]">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-[#E5EAE7]">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 cursor-pointer text-[#0A1F14] text-[15px] md:text-[17px] font-extrabold tracking-tight bg-transparent border-0 text-left"
                >
                  {faq.q}
                  <span
                    className={`grid place-items-center w-7 h-7 rounded-full shrink-0 border border-[#E5EAE7] text-[#00A855] text-xl leading-none transition-all ${
                      open === i ? "bg-[#E6FBF0]" : "bg-white"
                    }`}
                  >
                    {open === i ? "−" : "+"}
                  </span>
                </button>
                {open === i && (
                  <p className="text-[15px] text-[#5B6B62] leading-[1.75] pb-5 md:pr-12">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 7. VALUE REFRAME
// ─────────────────────────────────────────────────────────────────

function ValueReframe() {
  const pts = [
    "Reduce resolution time",
    "Eliminate coordination overhead",
    "Prevent incorrect fixes",
    "Safely automate recovery",
  ];
  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{
        background: "url('./IMS/valueframe.jpg')",
        color: "white",
      }}
    >
      <div
        className="absolute -top-1/2 -right-1/5 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle,rgba(0,210,106,.18) 0%,transparent 70%)",
        }}
      />
      <div className="max-w-[880px] mx-auto px-6 text-center relative">
        <h2 className="text-[clamp(26px,4vw,44px)] font-extrabold tracking-tight text-white mb-4">
          One incident can cost more than your{" "}
          <em className="not-italic text-[#00D26A]">monthly plan</em>.
        </h2>
        <p className="text-base md:text-lg text-white/75 max-w-[600px] mx-auto mb-9">
          Every minute of unresolved coordination is real money — engineering
          time, customer trust, and regulatory exposure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[720px] mx-auto">
          {pts.map((pt) => (
            <div
              key={pt}
              className="flex items-center gap-3 px-5 py-4 rounded-xl text-left text-[15px] font-medium text-white border border-white/10 bg-white/5"
            >
              <CheckIcon size={20} />
              {pt}
            </div>
          ))}
        </div>
        <p className="mt-10 pt-7 border-t border-white/10 text-base text-white/70 italic">
          <strong className="not-italic text-white font-semibold">
            Scrubbe doesn't just detect incidents
          </strong>{" "}
          — it controls how they are resolved.
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// 8. FINAL CTA
// ─────────────────────────────────────────────────────────────────

function FinalCta() {
  const router = useRouter();
  return (
    <section className="py-18 md:py-[100px] text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-[clamp(28px,5vw,56px)] font-extrabold tracking-tight leading-[1.05] text-[#0A1F14] mb-5 max-w-[800px] mx-auto">
          From incident chaos
          <br />
          to{" "}
          <em className="not-italic text-[#00A855]">controlled resolution</em>.
        </h2>
        <p className="text-base md:text-lg text-[#5B6B62] mb-9">
          Spin up your control plane in minutes. No credit card required.
        </p>
        <div className="flex flex-wrap gap-3.5 justify-center">
          <button
            onClick={() => router.push("/auth/business-signup")}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#00D26A] text-white font-semibold text-[15px] cursor-pointer border-0"
            style={{ boxShadow: "0 4px 14px rgba(0,210,106,.22)" }}
          >
            Start free trial
          </button>
          <button
            data-cal-namespace="hero-demo"
            data-cal-link="scrubbe/decision-system-demo"
            data-cal-config='{"layout":"month_view","theme":"light"}'
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white text-[#0A1F14] font-semibold text-[15px] cursor-pointer border border-[#E5EAE7] hover:border-[#00D26A] transition-colors"
          >
            Book demo
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <main className="font-sans antialiased bg-white text-[#0A1F14]">
      <PricingHero />
      <div className="max-w-[1200px] mx-auto px-6">
        <Calculator />
      </div>
      <MttrRoi />
      <Tiers />
      <CompareTable />
      <UsageExplainer />
      <Faq />
      <ValueReframe />
      <FinalCta />
    </main>
  );
}
