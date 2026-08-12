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

const Plan = () => {
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const { get, post } = useFetch();
  const { user } = useAuthStore();
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState("");
  const [selectPlan, setSelectPlan] = useState<any | null>(null);
  const router = useRouter();

  const { data } = useQuery({
    queryKey: [querykeys.PRICING],
    queryFn: async () => {
      const res = await get(endpoint.plans.get);
      if (res.success) {
        return res.data?.data?.map((plan: any) => ({
          name: plan?.name,
          values: {
            ...plan?.features[0],
            Price: plan.type === "enterprise" ? "Custom Pricing" : plan.price,
          },
          isPopular: plan?.isPopular,
          stripePriceId: plan?.stripePriceId,
          billingCycle: plan?.billingCycle,
          type: plan?.type,
          id: plan?.id,
        }));
      }
      return null;
    },
  });

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

  const mobilePlan = useMemo(() => {
    const features = [
      "Incidents",
      "Integration",
      "Dashboards & Reporting",
      "SLA Tracking",
      "MSP Clients",
      "Access Control",
      "Support",
    ];
    const cycle: { [key: string]: string } = { Monthly: "month", Yearly: "year" };
    const requestedCycle = cycle[billingCycle];

    let source = data?.filter((value: any) => value.billingCycle === requestedCycle);
    const usingFallback = billingCycle === "Yearly" && (!source || source.length === 0);
    if (usingFallback) {
      source = data?.filter((value: any) => value.billingCycle === "month");
    }

    return source?.map((value: any) => {
      const feature = Object.entries(value.values).filter(([key, items]) => {
        if (!features.includes(key)) return false;
        const v = items as any;
        if (!v || v === "❌" || v === "No" || v === false || v === "false") return false;
        return true;
      });

      const yearlyPrice =
        usingFallback && typeof value.values.Price === "number" && value.values.Price > 0
          ? Math.round(value.values.Price * 12 * 0.85)
          : null;

      return {
        ...value,
        billingCycle: usingFallback ? "year" : value.billingCycle,
        values: {
          ...value.values,
          Price: yearlyPrice !== null ? yearlyPrice : value.values.Price,
          _monthlyPrice: value.values.Price,
        },
        feature: feature?.map((f) =>
          f[1] === "Basic" ? "Basic Dashboards & Reporting" : f[1]
        ),
      };
    });
  }, [data, billingCycle]);

  // Derive the active version of selectPlan after billing cycle toggle
  const activePlan = useMemo(() => {
    if (!selectPlan || !mobilePlan) return selectPlan;
    return mobilePlan.find((p: any) => p.type === selectPlan.type) ?? selectPlan;
  }, [selectPlan, mobilePlan]);

  const handlePayment = async (plan: any) => {
    if (!plan) return;
    setLoading(plan.type);

    const cycle = billingCycle === "Monthly" ? "month" : "year";

    try {
      if (plan.values.Price === 0 || plan.values.Price === "0" || plan.type === "starter") {
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

  const isFreePlan = (price: any) => price === 0 || price === "0";
  const isCustomPlan = (price: any) => typeof price === "string" && price !== "0";

  const computedTotal = useMemo(() => {
    if (!activePlan) return null;
    const p = activePlan.values.Price;
    if (typeof p !== "number" || p === 0) return null;
    return p * (seats > 0 ? seats : 1);
  }, [activePlan, seats]);

  const currentPlanName = subscription?.plan?.name ?? "Free";
  const currentPlanPrice = subscription?.plan?.price ?? 0;
  const currentPlanFeatures = (mobilePlan?.find((p: any) => p.id === subscription?.plan?.id) ?? mobilePlan?.[0])?.feature ?? [];

  return (
    <div className="bg-IMSGreen rounded-lg overflow-hidden">
      {selectPlan && activePlan ? (
        /* ── UPGRADE DETAIL: two-panel layout ── */
        <div className="flex flex-col h-full">
          {/* Panel row */}
          <div className="flex flex-col sm:flex-row min-h-0">
            {/* Left: Current plan */}
            <div className="sm:w-[42%] border-b sm:border-b-0 sm:border-r border-white/10 p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Current Plan</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#02DD86]" />
                  <span className="text-[11px] text-white/60 font-medium">Active</span>
                </div>
                <h3 className="text-xl font-bold text-white font-Poppins leading-tight">{currentPlanName}</h3>
                <p className="text-2xl font-bold text-white/90 mt-0.5 font-Poppins">
                  {currentPlanPrice === 0 ? "Free" : `$${currentPlanPrice}`}
                  {currentPlanPrice !== 0 && <span className="text-sm font-normal text-white/40">/mo</span>}
                </p>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {currentPlanFeatures.slice(0, 5).map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/30 flex-shrink-0"><CheckIcon /></span>
                    <span className="text-[11px] text-white/50">{f}</span>
                  </div>
                ))}
                {currentPlanFeatures.length === 0 && (
                  <>
                    {["Basic incident management", "1 integration", "Community support"].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <span className="text-white/30 flex-shrink-0"><CheckIcon /></span>
                        <span className="text-[11px] text-white/50">{f}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Right: Target plan config */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              {/* Header */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Upgrading to</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white font-Poppins capitalize">{activePlan.name}</h3>
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
                <div className="inline-flex items-center rounded-lg bg-white/6 border border-white/10 p-0.5">
                  <button
                    onClick={() => setBillingCycle("Monthly")}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                      billingCycle === "Monthly"
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("Yearly")}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      billingCycle === "Yearly"
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Yearly
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#02DD86]/25 text-[#02DD86] font-bold">
                      −15%
                    </span>
                  </button>
                </div>
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
                  <p className="text-[11px] text-white/40">
                    {seats === 1 ? "agent / seat" : "agents / seats"}
                  </p>
                </div>
              </div>

              {/* Price summary */}
              <div className="mt-auto pt-4 border-t border-white/8">
                {isFreePlan(activePlan.values.Price) ? (
                  <p className="text-2xl font-bold text-white font-Poppins">Free forever</p>
                ) : isCustomPlan(activePlan.values.Price) ? (
                  <p className="text-xl font-bold text-white font-Poppins">Custom pricing</p>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-white font-Poppins">
                      ${computedTotal?.toLocaleString()}
                      <span className="text-sm font-normal text-white/40">
                        /{billingCycle === "Monthly" ? "month" : "year"}
                      </span>
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      ${activePlan.values.Price}/seat · {seats} seat{seats !== 1 ? "s" : ""}
                      {billingCycle === "Yearly" && (
                        <span className="ml-2 text-[#02DD86] font-medium">Save 15%</span>
                      )}
                    </p>
                  </div>
                )}
                <p className="text-[11px] text-white/30 mt-1">Includes 14-day free trial</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => handlePayment(activePlan)}
                disabled={loading === activePlan?.type}
                className="w-full py-2.5 px-5 rounded-xl bg-[#02DD86] text-IMSGreen font-semibold text-sm hover:bg-[#00c97a] active:bg-[#00b56e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
              >
                {loading === activePlan?.type ? (
                  <>
                    <SpinnerIcon />
                    Processing…
                  </>
                ) : isFreePlan(activePlan.values.Price) ? (
                  "Get Started Free"
                ) : (
                  <>
                    Continue
                    <ArrowRightIcon />
                  </>
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
              <ArrowLeftIcon />
              All plans
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
              <p className="text-[11px] text-white/40 mt-0.5">Choose the plan that fits your team</p>
            </div>
            {/* Billing toggle */}
            <div className="inline-flex items-center rounded-lg bg-white/6 border border-white/10 p-0.5">
              <button
                onClick={() => setBillingCycle("Monthly")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  billingCycle === "Monthly"
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("Yearly")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  billingCycle === "Yearly"
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Yearly
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#02DD86]/25 text-[#02DD86] font-bold">
                  −15%
                </span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="flex flex-col gap-2.5">
            {mobilePlan?.map((value: any) => {
              const isFree = isFreePlan(value.values.Price);
              const isCustom = isCustomPlan(value.values.Price);
              const isPopular = value.isPopular;

              return (
                <div
                  key={value?.id}
                  className={`rounded-xl border p-4 flex flex-col gap-3 transition-all duration-150 ${
                    isPopular
                      ? "border-[#02DD86]/40 bg-[#02DD86]/5"
                      : "border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: name + features */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white font-Poppins capitalize">
                          {value?.name}
                        </span>
                        {isPopular && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#02DD86]/20 text-[#02DD86] border border-[#02DD86]/30 font-bold uppercase tracking-wide">
                            Most popular
                          </span>
                        )}
                        {value.billingCycle === "year" && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/15 font-medium">
                            Annual
                          </span>
                        )}
                      </div>

                      {/* Feature pills */}
                      {value?.feature && value.feature.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {value.feature.slice(0, 3).map((f: string) => (
                            <span
                              key={f}
                              className="text-[10px] px-2 py-0.5 rounded bg-white/6 text-white/40 border border-white/8"
                            >
                              {f}
                            </span>
                          ))}
                          {value.feature.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/6 text-white/30">
                              +{value.feature.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: price + CTA */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {isFree ? (
                        <p className="text-lg font-bold text-white font-Poppins">Free</p>
                      ) : isCustom ? (
                        <p className="text-sm font-bold text-white font-Poppins">Custom</p>
                      ) : (
                        <div className="text-right">
                          <p className="text-lg font-bold text-white font-Poppins">
                            ${Number(value?.values.Price).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-white/35">
                            /seat/{billingCycle === "Monthly" ? "mo" : "yr"}
                          </p>
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
                        disabled={loading === value?.type}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                          isFree
                            ? "bg-white/8 text-white/70 hover:bg-white/12 border border-white/12"
                            : isPopular
                            ? "bg-[#02DD86] text-IMSGreen hover:bg-[#00c97a]"
                            : "bg-white/10 text-white hover:bg-white/16 border border-white/15"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading === value?.type ? (
                          <span className="flex items-center gap-1.5">
                            <SpinnerIcon /> Processing…
                          </span>
                        ) : isFree ? (
                          "Get Started"
                        ) : (
                          <span className="flex items-center gap-1">
                            Select <ArrowRightIcon />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading skeleton */}
            {!mobilePlan && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/3 p-4 animate-pulse">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-24 bg-white/10 rounded" />
                        <div className="h-3 w-40 bg-white/6 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <p className="text-[10px] text-white/25 text-center">
            All plans include a 14-day free trial · Secure checkout via Stripe
          </p>
        </div>
      )}
    </div>
  );
};

export default Plan;
