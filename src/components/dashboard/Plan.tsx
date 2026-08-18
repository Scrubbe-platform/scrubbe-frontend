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
    "Dedicated control plane",
    "On-prem / VPC deployment",
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
    <div className="inline-flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-1">
      <button
        onClick={() => setBillingCycle("Monthly")}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
          billingCycle === "Monthly"
            ? "bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 shadow-sm"
            : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setBillingCycle("Yearly")}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
          billingCycle === "Yearly"
            ? "bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 shadow-sm"
            : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200"
        }`}
      >
        Yearly
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-IMSLightGreen text-white font-bold">−20%</span>
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-lg overflow-hidden">
      {selectPlan && activePlan ? (
        /* ── UPGRADE DETAIL VIEW: two-panel ── */
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row min-h-0">

            {/* Left: Current plan */}
            <div className="sm:w-[40%] border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-800 p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Current Plan</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-IMSLightGreen" />
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Active</span>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-zinc-100">{currentPlanName}</h3>
                {currentPlanPrice === 0 ? (
                  <p className="text-2xl font-bold text-black dark:text-zinc-100 mt-0.5">Free</p>
                ) : (
                  <div className="mt-0.5">
                    <p className="text-xl font-bold text-black dark:text-zinc-100">
                      ${currentPlanPrice.toLocaleString()}<span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">/mo platform</span>
                    </p>
                    {currentPlanPerUser > 0 && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">+ ${currentPlanPerUser}/seat/mo</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Target plan */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Upgrading to</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-black dark:text-zinc-100">{activePlan.name}</h3>
                  {activePlan.isPopular && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-IMSLightGreen text-IMSLightGreen font-semibold">
                      Most popular
                    </span>
                  )}
                </div>
              </div>

              {/* Billing toggle */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Billing cycle</p>
                <BillingToggle />
              </div>

              {/* Seat stepper */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Team seats</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden">
                    <button
                      onClick={() => setSeats((s) => Math.max(1, s - 1))}
                      className="px-3 py-2 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      aria-label="Remove a seat"
                    >
                      <MinusIcon />
                    </button>
                    <span className="px-4 py-2 text-black dark:text-zinc-100 font-ibm text-sm min-w-[2.5rem] text-center tabular-nums">
                      {seats}
                    </span>
                    <button
                      onClick={() => setSeats((s) => s + 1)}
                      className="px-3 py-2 text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      aria-label="Add a seat"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{seats === 1 ? "agent / seat" : "agents / seats"}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>Platform fee</span>
                  <span>${displayPlatformPrice(activePlan.price)}/{cycleLabel}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>{seats} seat{seats !== 1 ? "s" : ""} × ${displayPerUserPrice(activePlan.perUserPrice)}/{cycleLabel}</span>
                  <span>${(Math.round((activePlan.perUserPrice ?? 0) * (billingCycle === "Yearly" ? 12 * 0.8 : 1)) * seats).toLocaleString()}/{cycleLabel}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black dark:text-zinc-100 mt-1">
                  <span>Total</span>
                  <span>
                    ${computedTotal?.toLocaleString()}
                    <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">/{cycleLabel}</span>
                  </span>
                </div>
                {billingCycle === "Yearly" && (
                  <p className="text-[10px] text-IMSLightGreen mt-0.5">20% annual discount applied</p>
                )}
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">14-day free trial included</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => handlePayment(activePlan)}
                disabled={loading === activePlan?.type}
                className="w-full py-2.5 px-5 rounded-xl bg-IMSLightGreen text-white font-semibold text-sm hover:bg-IMSLightGreen/90 active:bg-IMSLightGreen/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
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
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/30">
            <button
              onClick={() => setSelectPlan(null)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-200 transition-colors"
            >
              <ArrowLeftIcon /> All plans
            </button>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600">Secure checkout via Stripe</p>
          </div>
        </div>
      ) : (
        /* ── PLAN LIST VIEW ── */
        <div className="p-5 flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-black dark:text-zinc-100">Available plans</h2>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">Platform fee + per seat · 14-day free trial on all paid plans</p>
            </div>
            <BillingToggle />
          </div>

          {/* Plan cards */}
          <div className="flex flex-col gap-4">

            {/* Dynamic plans from API */}
            {plans?.map((value: any) => {
              const isFree = isFreePlan(value.price);
              const isPopular = value.isPopular;
              const platformDisplay = isFree ? null : displayPlatformPrice(value.price);
              const perUserDisplay = isFree ? null : displayPerUserPrice(value.perUserPrice);

              return (
                <div
                  key={value.id}
                  className={`rounded-2xl border p-5 flex flex-col gap-3.5 transition-all duration-150 ${
                    isPopular
                      ? "border-2 border-IMSLightGreen"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    {/* Name + badges */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-black dark:text-zinc-100">{value.name}</span>
                        {isPopular && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-IMSLightGreen text-IMSLightGreen font-semibold">
                            Most popular
                          </span>
                        )}
                      </div>
                      {/* Pricing */}
                      {isFree ? (
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">No credit card required</p>
                      ) : (
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                          ${platformDisplay}/{cycleLabel} platform + ${perUserDisplay}/seat/{cycleLabel}
                        </p>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                      {isFree ? (
                        <p className="text-2xl font-bold text-black dark:text-zinc-100">Free</p>
                      ) : (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-black dark:text-zinc-100">
                            ${platformDisplay}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">platform/{cycleLabel}</p>
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
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap disabled:opacity-50 ${
                          isPopular
                            ? "bg-IMSLightGreen text-white hover:bg-IMSLightGreen/90"
                            : "bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        {loading === value.type ? (
                          <span className="flex items-center gap-1.5"><SpinnerIcon /> …</span>
                        ) : isFree ? (
                          "Get started"
                        ) : (
                          "Select"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Key features */}
                  {value.values && (
                    <>
                      <div className="border-t border-zinc-100 dark:border-zinc-800" />
                      <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                        {[
                          value.values.Incidents,
                          value.values.Integration,
                          value.values.Support,
                        ]
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((f: string) => (
                            <span key={f} className="text-[13px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-IMSLightGreen shrink-0" />
                              {f}
                            </span>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Static Enterprise card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-black dark:text-zinc-100">{ENTERPRISE_CARD.name}</span>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Starting at $6,000/mo · custom per-seat pricing</p>
                </div>
                <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                  <p className="text-2xl font-bold text-black dark:text-zinc-100">Custom</p>
                  <a
                    href="mailto:sales@scrubbe.com"
                    className="px-5 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-150 whitespace-nowrap"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-800" />
              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                {ENTERPRISE_CARD.features.map((f) => (
                  <span key={f} className="text-[13px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-IMSLightGreen shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Loading skeletons */}
            {!plans && (
              <>{[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      <div className="h-3 w-44 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    </div>
                    <div className="h-6 w-14 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}</>
            )}
          </div>

          <p className="text-[12px] text-zinc-400 dark:text-zinc-500 text-center">
            All prices in USD · Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      )}
    </div>
  );
};

export default Plan;
