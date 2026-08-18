"use client";
import Plan from "@/components/dashboard/Plan";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import useAuthStore from "@/lib/stores/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const [openPlan, setOpenPlan] = useState(false);
  const searchParams = useSearchParams();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { get, patch, post } = useFetch();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Auto-open Plan modal when redirected from pricing page with ?plan= param
  useEffect(() => {
    if (searchParams.get("plan")) {
      setOpenPlan(true);
    }
  }, [searchParams]);

  const { data } = useQuery({
    queryKey: ["SUBSCRIPTION"],
    queryFn: async () => {
      const res = await get(
        `${endpoint.plans.getUserSubscription}/${user?.id}/subscriptions`
      );
      if (res.success) {
        return res.data.data;
      }
      return null;
    },
  });

  // Auto-checkout if user was redirected here after login with a stored plan intent
  useEffect(() => {
    const raw = localStorage.getItem("scrubbe_plan_intent");
    if (!raw || !user) return;
    try {
      const intent = JSON.parse(raw) as { planType: string; billingCycle: string };
      localStorage.removeItem("scrubbe_plan_intent");
      post(endpoint.plans.create_session, {
        planType: intent.planType,
        billingCycle: intent.billingCycle,
        successUrl: `${window.location.origin}/incident/billings`,
        cancelUrl: `${window.location.origin}/incident/billings`,
      }).then((res) => {
        if (res.success) {
          window.location.href = res.data.data.url;
        } else {
          toast.error("Could not start checkout. Please try again from the billing page.");
        }
      });
    } catch {
      localStorage.removeItem("scrubbe_plan_intent");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await post("/pricing/billing-portal", {
        returnUrl: `${window.location.origin}/incident/billings`,
      });
      if (res.success && res.data?.data?.url) {
        window.location.href = res.data.data.url;
      } else {
        toast.error("Could not open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!data?.id) throw new Error("No active subscription found");
      const res = await patch(`${endpoint.plans.cancel}/${data.id}/cancel`, {});
      if (!res.success) throw new Error((res.data as string) ?? "Failed to cancel subscription");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Subscription will be cancelled at the end of the billing period");
      queryClient.invalidateQueries({ queryKey: ["SUBSCRIPTION"] });
      setConfirmCancel(false);
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to cancel subscription");
    },
  });

  const planName = data?.plan?.name ?? "Starter";
  const planPrice = data?.plan?.price ?? 0;
  const billingEnd = data?.currentPeriodEnd
    ? new Date(data.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const isCancelPending = data?.cancelAtPeriodEnd;

  return (
    <div className=" p-4">
      <p className=" text-lg font-bold text-black dark:text-zinc-100"> Billing and Usage </p>

      <div className="p-4 rounded-lg bg-white dark:bg-zinc-900/40 border border-neutral-200 dark:border-zinc-800">
        <div className="  flex flex-row justify-between  gap-3">
          <div className="flex flex-col gap-2 justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className=" font-medium text-base text-black dark:text-zinc-100">{planName} Plan</p>
                <div className={`text-xs px-2 py-1 rounded-lg w-fit border ${isCancelPending ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-400 dark:border-rose-500/30" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500 dark:border-emerald-500/30"}`}>
                  {isCancelPending ? "Cancelling" : data?.status ?? "Active"}
                </div>
              </div>
              <p className=" font-bold text-black dark:text-zinc-100">${planPrice}/month</p>
            </div>

            <div>
              <p className="text-sm font-medium mt-2 text-black dark:text-zinc-200">Next Billing date</p>
              <p className="text-sm mt-1 text-zinc-500 dark:text-zinc-400">
                {billingEnd
                  ? isCancelPending
                    ? `Subscription ends on ${billingEnd}`
                    : `Your plan renews on ${billingEnd}`
                  : "No active subscription"}
              </p>
            </div>
          </div>
          <div className=" flex-col flex justify-between items-end gap-2">
            <p className=" text-2xl font-bold text-black dark:text-zinc-100">${planPrice}/month</p>
            <p className=" text-sm text-zinc-500 dark:text-zinc-400">{data?.plan?.maxAgents ?? 1} agents available</p>
            <CButton
              onClick={() => setOpenPlan(true)}
              className=" text-IMSLightGreen bg-transparent hover:bg-transparent border border-IMSLightGreen rounded-lg p-1 text-sm flex items-center gap-2 px-2 w-fit"
            >
              <span>View Plan</span>
              <ChevronRight size={15} />
            </CButton>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-300 dark:border-zinc-800 mt-3 pt-3">
          {!isCancelPending ? (
            confirmCancel ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-zinc-400">Are you sure you want to cancel?</p>
                <CButton
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="!w-fit bg-rose-500 hover:bg-rose-600 text-sm"
                >
                  {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
                </CButton>
                <CButton
                  onClick={() => setConfirmCancel(false)}
                  className="!w-fit bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-none text-sm"
                >
                  Keep Plan
                </CButton>
              </div>
            ) : (
              <CButton
                onClick={() => setConfirmCancel(true)}
                className="!w-fit bg-rose-500 hover:bg-rose-600"
              >
                Cancel Plan
              </CButton>
            )
          ) : (
            <p className="text-sm text-rose-500 font-medium">Cancellation scheduled</p>
          )}
          <div className="flex items-center gap-2">
            {data?.plan && data.plan.type !== "starter" && (
              <CButton
                onClick={openBillingPortal}
                disabled={portalLoading}
                className="!w-fit bg-transparent border border-IMSLightGreen text-IMSLightGreen hover:bg-transparent shadow-none text-sm"
              >
                {portalLoading ? "Opening..." : "Manage Billing"}
              </CButton>
            )}
            <CButton className=" !w-fit" onClick={() => setOpenPlan(true)}>
              Upgrade Plan
            </CButton>
          </div>
        </div>
      </div>

      <Modal onClose={() => setOpenPlan(false)} isOpen={openPlan} className="sm:max-w-2xl">
        <Plan />
      </Modal>
    </div>
  );
};

export default Page;
