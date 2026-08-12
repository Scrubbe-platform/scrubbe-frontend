/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import useAuthStore from "@/lib/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

// ── Inline icons ──────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M9 3L4 7l5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

// ── Static Enterprise card (no DB plan — custom pricing) ─────────────────────
const ENTERPRISE_CARD = {
  name: "Enterprise",
  type: "enterprise_custom",
  isPopular: false,
  price: null,
  perUserPrice: null,
  features: [
    "500–5,000+ incidents/month",
    "Custom execution credits",
    "Dedicated control plane",
    "On-prem / VPC deployment",
    "Advanced RBAC, SSO, SCIM",
    "24/7 dedicated support",
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isFreePlan = (price: any) => price === 0 || price === "0";

function formatPrice(platform: number, perUser: number, seats: number, cycle: "Monthly" | "Yearly") {
  const multiplier = cycle === "Yearly" ? 12 * 0.8 : 1;
  const total = (platform + perUser * seats) * multiplier;
  return Math.round(total);
}

const Plan = () => {
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const { get, post } = useFetch();
  const { user } = useAuthStore();
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState("");
  const [selectPlan, setSelectPlan] = useState<any | null>(null);
  const router = useRouter();

  // ── Fetch plans from API ────────────────────────────────────────────────────
  const { data: rawPlans } = useQuery({
    queryKey: [querykeys.PRICING],
    queryFn: async () => {
      const res = await get(endpoint.plans.get);
      if (res.success) {
        return res.data?.data?.map((plan: any) => ({
          id: plan?.id,
          name: plan?.name,
          type: plan?.type,
          tier: plan?.tier,
          billingCycle: plan?.billingCycle,
          stripePriceId: plan?.stripePriceId,
          isPopular: plan?.isPopular,
          price: plan?.price,           // platform fee
          perUserPrice: plan?.perUserPrice ?? 0,
          values: {
            ...plan?.features?.[0],
            Price: plan?.price,
          },
        }));
      }
      return null;
    },
  });

  // ── Fetch current subscription ──────────────────────────────────────────────
  const { data: subscription } = useQuery({
    queryKey: ["SUBSCRIPTION"],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await get(`${endpoint.plans.getUserSubscription}/${user.id}/subscriptions`);
      if (res.success) return res.data.data;
      return null;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // ── Compute displayed plans (monthly only; yearly computed from monthly) ────
  const plans = useMemo(() => {
    if (!rawPlans) return null;
    // Only show monthly plans — yearly pricing is computed client-side
    return rawPlans.filter((p: any) => p.billingCycle === "month" || p.billingCycle === "Monthly");
  }, [rawPlans]);

  // ── Checkout handler ────────────────────────────────────────────────────────
  const handlePayment = async (plan: any) => {
    if (!plan) return;
    setLoading(plan.type);

    const cycle = billingCycle === "Monthly" ? "month" : "year";

    try {
      // Free plan — no Stripe checkout needed
      if (isFreePlan(plan.price) || plan.type === "starter") {
        const res = await post(endpoint.plans.create_subscription, { planId: plan.id });
        setLoading("");
        if (res.status === 401) {
          toast.error("Please sign in to continue");
          router.push("/auth/signin?to=payment");
          return;
        }
        if (res.success) {
          toast.success("Free plan activated!");
          router.refresh();
        } else {
          toast.error(typeof res.data === "string" ? res.data : "Failed to activate free plan");
        }
        return;
      }

      const res = await post(endpoint.plans.create_session, {
        planId: plan.id,
        planType: plan.type,
        billingCycle: cycle,
        quantity: seats > 0 ? seats : 1,
        successUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billings`,
        cancelUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billings`,
      });
      setLoading("");

      if (res.status === 401) {
        toast.error("Please sign in to continue");
        router.push("/auth/signin?to=payment");
        return;
      }
      if (res.success) {
        window.location.href = res.data.data.url;
      } else {
        toast.error(typeof res.data === "string" ? res.data : "Checkout failed. Please try again.");
      }
    } catch {
      setLoading("");
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Current plan info for the left panel
  const currentPlanName = subscription?.plan?.name ?? "Free";
  const currentPlanPrice = subscription?.plan?.price ?? 0;
  const currentPlanPerUser = subscription?.plan?.perUserPrice ?? 0;

  // Active plan after billing cycle change (price recomputed)
  const activePlan = useMemo(() => {
    if (!selectPlan || !plans) return selectPlan;
    return plans.find((p: any) => p.id === selectPlan.id) ?? selectPlan;
  }, [selectPlan, plans]);

  const computedTotal = useMemo(() => {
    if (!activePlan) return null;
    const p = activePlan.price;
    const pu = activePlan.perUserPrice ?? 0;
    if (typeof p !== "number" || p === 0) return null;
    return formatPrice(p, pu, seats > 0 ? seats : 1, billingCycle);
  }, [activePlan, seats, billingCycle]);

  // ── Price display helpers ─────────────────────────────────────────────────
  const displayPlatformPrice = (p: number) => {
    if (billingCycle === "Yearly") return Math.round(p * 12 * 0.8).toLocaleString();
    return p.toLocaleString();
  };
  const displayPerUserPrice = (pu: number) => {
    if (billingCycle === "Yearly") return Math.round(pu * 12 * 0.8).toLocaleString();
    return pu.toLocaleString();
  };
  const cycleLabel = billingCycle === "Monthly" ? "mo" : "yr";

  // ── Billing toggle ──────────────────────────────────────────────────────────
  const BillingToggle = () => (
    <div className="inline-flex items-center rounded-lg bg-white/6 border border-white/10 p-0.5">
      <button
        onClick={() => setBillingCycle("Monthly")}
        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
          billingCycle === "Monthly" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setBillingCycle("Yearly")}
        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
          billingCycle === "Yearly" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
        }`}
      >
        Yearly
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#02DD86]/25 text-[#02DD86] font-bold">−20%</span>
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-IMSGreen rounded-lg overflow-hidden">
      {selectPlan && activePlan ? (
        /* ── UPGRADE DETAIL VIEW: two-panel ── */
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row min-h-0">

            {/* Left: Current plan */}
            <div className="sm:w-[40%] border-b sm:border-b-0 sm:border-r border-white/10 p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Current Plan</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#02DD86]" />
                  <span className="text-[11px] text-white/60 font-medium">Active</span>
                </div>
                <h3 className="text-xl font-bold text-white font-Poppins">{currentPlanName}</h3>
                {currentPlanPrice === 0 ? (
                  <p className="text-2xl font-bold text-white/90 font-Poppins mt-0.5">Free</p>
                ) : (
                  <div className="mt-0.5">
                    <p className="text-xl font-bold text-white/90 font-Poppins">
                      ${currentPlanPrice.toLocaleString()}<span className="text-sm font-normal text-white/40">/mo platform</span>
                    </p>
                    {currentPlanPerUser > 0 && (
                      <p className="text-xs text-white/40">+ ${currentPlanPerUser}/seat/mo</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Target plan */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Upgrading to</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white font-Poppins">{activePlan.name}</h3>
                  {activePlan.isPopular && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#02DD86]/20 text-[#02DD86] border border-[#02DD86]/30 font-semibold">
                      Most popular
                    </span>
                  )}
                </div>
              </div>

              {/* Billing toggle */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Billing cycle</p>
                <BillingToggle />
              </div>

              {/* Seat stepper */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Team seats</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-white/12 bg-white/6 overflow-hidden">
                    <button
                      onClick={() => setSeats((s) => Math.max(1, s - 1))}
                      className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Remove a seat"
                    >
                      <MinusIcon />
                    </button>
                    <span className="px-4 py-2 text-white font-ibm text-sm min-w-[2.5rem] text-center tabular-nums">
                      {seats}
                    </span>
                    <button
                      onClick={() => setSeats((s) => s + 1)}
                      className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Add a seat"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  <p className="text-[11px] text-white/40">{seats === 1 ? "agent / seat" : "agents / seats"}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="mt-auto pt-4 border-t border-white/8 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>Platform fee</span>
                  <span>${displayPlatformPrice(activePlan.price)}/{cycleLabel}</span>
                </div>
                <div className="flex justify-between text-[11px] text-white/40">
                  <span>{seats} seat{seats !== 1 ? "s" : ""} × ${displayPerUserPrice(activePlan.perUserPrice)}/{cycleLabel}</span>
                  <span>${(Math.round((activePlan.perUserPrice ?? 0) * (billingCycle === "Yearly" ? 12 * 0.8 : 1)) * seats).toLocaleString()}/{cycleLabel}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white mt-1">
                  <span>Total</span>
                  <span>
                    ${computedTotal?.toLocaleString()}
                    <span className="text-xs font-normal text-white/40">/{cycleLabel}</span>
                  </span>
                </div>
                {billingCycle === "Yearly" && (
                  <p className="text-[10px] text-[#02DD86] mt-0.5">20% annual discount applied</p>
                )}
                <p className="text-[10px] text-white/30 mt-1">14-day free trial included</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => handlePayment(activePlan)}
                disabled={loading === activePlan?.type}
                className="w-full py-2.5 px-5 rounded-xl bg-[#02DD86] text-IMSGreen font-semibold text-sm hover:bg-[#00c97a] active:bg-[#00b56e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
              >
                {loading === activePlan?.type ? (
                  <><SpinnerIcon /> Processing…</>
                ) : (
                  <>Continue <ArrowRightIcon /></>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between gap-3 bg-white/3">
            <button
              onClick={() => setSelectPlan(null)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeftIcon /> All plans
            </button>
            <p className="text-[10px] text-white/25">Secure checkout via Stripe</p>
          </div>
        </div>
      ) : (
        /* ── PLAN LIST VIEW ── */
        <div className="p-5 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-white font-Poppins">Available Plans</h2>
              <p className="text-[11px] text-white/40 mt-0.5">Platform fee + per seat · 14-day free trial on all paid plans</p>
            </div>
            <BillingToggle />
          </div>

          {/* Plan cards */}
          <div className="flex flex-col gap-2.5">

            {/* Dynamic plans from API */}
            {plans?.map((value: any) => {
              const isFree = isFreePlan(value.price);
              const isPopular = value.isPopular;
              const platformDisplay = isFree ? null : displayPlatformPrice(value.price);
              const perUserDisplay = isFree ? null : displayPerUserPrice(value.perUserPrice);

              return (
                <div
                  key={value.id}
                  className={`rounded-xl border p-4 flex flex-col gap-2.5 transition-all duration-150 ${
                    isPopular
                      ? "border-[#02DD86]/40 bg-[#02DD86]/5"
                      : "border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Name + badges */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white font-Poppins">{value.name}</span>
                        {isPopular && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#02DD86]/20 text-[#02DD86] border border-[#02DD86]/30 font-bold uppercase tracking-wide">
                            Most popular
                          </span>
                        )}
                      </div>
                      {/* Pricing */}
                      {isFree ? (
                        <p className="text-[11px] text-white/40">No credit card required</p>
                      ) : (
                        <p className="text-[11px] text-white/40">
                          ${platformDisplay}/{cycleLabel} platform + ${perUserDisplay}/seat/{cycleLabel}
                        </p>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {isFree ? (
                        <p className="text-lg font-bold text-white font-Poppins">Free</p>
                      ) : (
                        <div className="text-right">
                          <p className="text-lg font-bold text-white font-Poppins">
                            ${platformDisplay}
                          </p>
                          <p className="text-[10px] text-white/35">platform/{cycleLabel}</p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (isFree) {
                            handlePayment(value);
                          } else {
                            setSelectPlan(value);
                            setSeats(1);
                          }
                        }}
                        disabled={loading === value.type}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap disabled:opacity-50 ${
                          isFree
                            ? "bg-white/8 text-white/70 hover:bg-white/12 border border-white/12"
                            : isPopular
                            ? "bg-[#02DD86] text-IMSGreen hover:bg-[#00c97a]"
                            : "bg-white/10 text-white hover:bg-white/16 border border-white/15"
                        }`}
                      >
                        {loading === value.type ? (
                          <span className="flex items-center gap-1"><SpinnerIcon /> …</span>
                        ) : isFree ? (
                          "Get Started"
                        ) : (
                          <span className="flex items-center gap-1">Select <ArrowRightIcon /></span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Key features */}
                  {value.values && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {[
                        value.values.Incidents,
                        value.values.Integration,
                        value.values.Support,
                      ]
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((f: string) => (
                          <span key={f} className="text-[10px] text-white/45 flex items-center gap-1">
                            <span className="text-[#02DD86]/50 text-[8px]">●</span>
                            {f}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Static Enterprise card */}
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white font-Poppins">Enterprise</span>
                  <p className="text-[11px] text-white/40">Starting at $6,000/mo · custom per-seat pricing</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-lg font-bold text-white font-Poppins">Custom</p>
                  <a
                    href="mailto:sales@scrubbe.com"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/16 border border-white/15 transition-all duration-150 whitespace-nowrap"
                  >
                    Contact sales
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {["500–5,000+ incidents/month", "Dedicated control plane", "On-prem / VPC deployment"].map((f) => (
                  <span key={f} className="text-[10px] text-white/45 flex items-center gap-1">
                    <span className="text-[#02DD86]/50 text-[8px]">●</span>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Loading skeletons */}
            {!plans && (
              <>{[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/3 p-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-20 bg-white/10 rounded" />
                      <div className="h-3 w-44 bg-white/6 rounded" />
                    </div>
                    <div className="h-6 w-14 bg-white/10 rounded" />
                  </div>
                </div>
              ))}</>
            )}
          </div>

          <p className="text-[10px] text-white/25 text-center">
            All prices in USD · Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      )}
    </div>
  );
};

export default Plan;
