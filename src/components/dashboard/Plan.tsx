/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import Input from "../ui/input";

const Plan = () => {
  const [billingCycle, setBillingCycle] = useState("Monthly"); // State for Monthly/Yearly toggle
  const { get, post } = useFetch();
  const [agent, setAgent] = useState<any>(1);
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
            Price: plan.type == "enterprise" ? "Custom Pricing" : plan.price,
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
    const cycle: { [key: string]: string } = {
      Monthly: "month",
      Yearly: "year",
    };
    return data
      ?.filter((value: any) => value.billingCycle === cycle[billingCycle])
      ?.map((value: any) => {
        const feature = Object.entries(value.values).filter(([key, items]) => {
          if (features.includes(key) && items !== "❌") {
            return items;
          }
        });

        return {
          ...value,
          feature: feature?.map((value) =>
            value[1] === "Basic" ? `Basic Dashboards & Reporting` : value[1]
          ),
        };
      });
  }, [data, billingCycle]);

  const handlePayment = async (plan: any) => {
    console.log({ plan });
    if (plan) {
      const data = {
        planType: plan.type,
        billingCycle: plan.billingCycle,
        quantity: agent > 0 ? agent : 1,
        successUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billing`,
        cancelUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident/billing`,
      };
      setLoading(plan.type);
      const res = await post(endpoint.plans.create_session, data);
      setLoading("");
      console.log(res);
      if (res.status === 401) {
        toast.error("Please signup to continue");
        router.push("/auth/signin?to=payment");
        return;
      }
      if (res.success) {
        window.location.href = res.data.data.url;
      }
    }
  };
  return (
    <div>
      {selectPlan ? (
        <div>
          <p className=" capitalize text-2xl font-semibold mb-5">
            Upgrade to {selectPlan?.type}
          </p>
          <div
            className=" bg-white rounded-lg py-4 px-4 flex flex-col justify-between gap-3 min-h-[400px] border border-neutral-200 mb-3"
            key={selectPlan?.id}
          >
            <div className="flex flex-col gap-2">
              <p className=" text-lg font-bold text-IMSLightGreen">
                {selectPlan?.name}{" "}
                {selectPlan.isPopular && (
                  <span className=" px-3 py-1 bg-[#4A4187] text-white text-xs rounded-full whitespace-nowrap">
                    Most popular
                  </span>
                )}
              </p>
              <p className=" text-[#4A4187] font-bold text-2xl">
                {" "}
                {typeof selectPlan?.values.Price === "string"
                  ? `${selectPlan?.values.Price} (+14 days free trial on request)`
                  : `$${
                      Number(agent) < 1
                        ? selectPlan?.values.Price.toLocaleString()
                        : Number(
                            selectPlan?.values.Price * agent
                          ).toLocaleString()
                    }/agent/${billingCycle}(+14 days free trial)`}
              </p>

              <div>
                {selectPlan.billingCycle === "year" && (
                  <div className=" text-xs px-2 py-1 bg-emerald-100 text-emerald-600 border border-emerald-500 rounded-lg w-fit">
                    Save 15%
                  </div>
                )}
              </div>
              <p>{selectPlan.values.Description}</p>
              <p>Features Include</p>
              <ul className=" list-disc pl-4 space-y-1">
                {selectPlan?.feature?.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <Input
            label="Enter team size"
            value={agent}
            type="number"
            onChange={(e) => setAgent(e.target.value)}
          />
          <div className="flex justify-between items-center mb-2">
            <p>{billingCycle} Total</p>
            <p className=" font-semibold">
              ${Number(selectPlan.values.Price) * agent}
            </p>
          </div>
          <button
            onClick={() => handlePayment(selectPlan)}
            disabled={loading === selectPlan?.type}
            className="bg-IMSLightGreen hover:bg-IMSDarkGreen text-white  font-semibold py-2 px-4 rounded transition-colors duration-200 w-full text-nowrap"
          >
            Proceed to Payment
          </button>
        </div>
      ) : (
        <>
          <p className=" text-lg font-medium">View Plans</p>

          <div className=" flex-col flex items-center gap-2">
            <p className=" text-center font-semibold"> Other Plans</p>
            <div className="inline-flex rounded-full bg-[#3D665E] p-1">
              <button
                onClick={() => setBillingCycle("Monthly")}
                className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 text-white ${
                  billingCycle === "Monthly" ? "bg-[#194042] " : ""
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("Yearly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 text-white ${
                  billingCycle === "Yearly" ? "bg-[#194042] " : ""
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="grid gap-5 mt-4">
            {mobilePlan?.map((value: any) => (
              <div
                className=" bg-white rounded-lg py-4 px-4 flex flex-col justify-between gap-3 min-h-[500px] border border-neutral-200"
                key={value?.id}
              >
                <div className="flex flex-col gap-2">
                  <p className=" text-lg font-bold text-IMSLightGreen">
                    {value?.name}{" "}
                    {value.isPopular && (
                      <span className=" px-3 py-1 bg-[#4A4187] text-white text-xs rounded-full whitespace-nowrap">
                        Most popular
                      </span>
                    )}
                  </p>
                  <p className=" text-[#4A4187] font-bold text-2xl">
                    {" "}
                    {typeof value?.values.Price === "string"
                      ? `${value?.values.Price} (+14 days free trial on request)`
                      : `$${
                          Number(agent) < 1
                            ? Number(value?.values.Price).toLocaleString()
                            : Number(
                                value?.values.Price * agent
                              ).toLocaleString()
                        }/agent/${billingCycle}(+14 days free trial)`}
                  </p>

                  <div>
                    {value.billingCycle === "year" && (
                      <div className=" text-xs px-2 py-1 bg-emerald-100 text-emerald-600 border border-emerald-500 rounded-lg w-fit">
                        Save 15%
                      </div>
                    )}
                  </div>
                  <p>{value.values.Description}</p>
                  <p>Features Include</p>
                  <ul className=" list-disc pl-4 space-y-1">
                    {value?.feature?.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectPlan(value)}
                  disabled={loading === value?.type}
                  className="bg-IMSLightGreen hover:bg-IMSDarkGreen text-white  font-semibold py-2 px-4 rounded transition-colors duration-200 w-full text-nowrap"
                >
                  Upgrade to <span className=" capitalize">{value?.type}</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Plan;
