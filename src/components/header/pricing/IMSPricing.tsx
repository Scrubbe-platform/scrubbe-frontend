/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import TableLoader from "@/components/ui/LoaderUI/TableLoader";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const pricingData = {
  features: [
    "Price",
    "Description",
    "Users",
    "Incidents",
    "Integration",
    "Dashboards & Reporting",
    "SLA Tracking",
    "MSP Clients",
    "Access Control",
    "Support",
    "Action",
  ],
  Monthly: [
    {
      name: "Starter",
      values: {
        Description:
          "For small teams getting started with incident management.",
        Price: "$0/month",
        Users: "Up to 10 users",
        Incidents: "Unlimited incidents with postmortems",
        Integration: "Basic GitHub and GitLab",
        "Dashboards & Reporting": "Basic",
        "SLA Tracking": "❌",
        "MSP Clients": "1 single tenant",
        "Access Control": "❌",
        Support: "Community",
        Action: "Get started for free",
      },
      isPopular: false,
    },
    {
      name: "Growth",
      values: {
        Description: "For scaling startups and SMBs that need structure.",
        Price: "$9/user/month",
        Users: "Up to 50 users",
        Incidents: "Unlimited incidents with postmortems",
        Integration: "Full: Slack, GitHub, GitLab, Zoom, Google Meet",
        "Dashboards & Reporting": "Basic",
        "SLA Tracking": "MTTR and MTTA",
        "MSP Clients": "Up to 5",
        "Access Control": "❌",
        Support: "Email (24-hour response)",
        Action: "Start 14 days free trial",
      },
      isPopular: false,
    },
    {
      name: "Pro",
      values: {
        Description: "For MSPs and mission-critical businesses.",
        Price: "$19/user/month",
        Users: "Unlimited users",
        Incidents: "Unlimited incidents with postmortems",
        Integration:
          "Full: Slack, GitHub, GitLab, Zoom, Google Meet, Custom API/Webhooks",
        "Dashboards & Reporting": "Advanced with fraud and incidents", // Corrected from "Advanced with fraud reports"
        "SLA Tracking": "Enforcement with auto escalations, 99.9% uptime",
        "MSP Clients": "Unlimited",
        "Access Control": "Role-based",
        Support: "Priority email and chat",
        Action: "Start 14 days free trial",
      },
      isPopular: true,
    },
    {
      name: "Enterprise",
      values: {
        Description:
          "For banks, telcos, governments, and large organizations with compliance needs.",
        Price: "Custom from $9/user/month",
        Users: "Unlimited users",
        Incidents: "Unlimited incidents with postmortems",
        Integration:
          "Full: Slack, GitHub, GitLab, Zoom, Google Meet, Custom API/Webhooks, SSO (Azure AD, Okta, AWS Cognito)",
        "Dashboards & Reporting": "Advanced with compliance (PCI, ISO, SOC2)",
        "SLA Tracking": "Enforcement with auto escalations, 99.9% uptime",
        "MSP Clients": "Unlimited",
        "Access Control": "Role-based",
        Support: "24/7 phone, dedicated manager",
        Action: "Start 14 days free trial",
      },
      isPopular: false,
    },
  ],
  Yearly: [
    {
      name: "Starter",
      values: {
        Description:
          "For small teams getting started with incident management.",
        Price: "$0/month",
        Users: "Up to 10 users",
        Incidents: "Unlimited incidents with postmortems",
        Integration: "Basic GitHub and GitLab",
        "Dashboards & Reporting": "Basic",
        "SLA Tracking": "❌",
        "MSP Clients": "1 single tenant",
        "Access Control": "❌",
        Support: "Community",
        Action: "Get started for free",
      },
      isPopular: false,
    },
    {
      name: "Growth",
      values: {
        Description: "For scaling startups and SMBs that need structure.",
        Price: "$90/user/month",
        Users: "Up to 50 users",
        Incidents: "Unlimited incidents with postmortems",
        Integration: "Full: Slack, GitHub, GitLab, Zoom, Google Meet",
        "Dashboards & Reporting": "Basic",
        "SLA Tracking": "MTTR and MTTA",
        "MSP Clients": "Up to 5",
        "Access Control": "❌",
        Support: "Email (24-hour response)",
        Action: "Start 14 days free trial",
      },
      isPopular: false,
    },
    {
      name: "Pro",
      values: {
        Description: "For MSPs and mission-critical businesses.",
        Price: "$190/user/month",
        Users: "Unlimited users",
        Incidents: "Unlimited incidents with postmortems",
        Integration:
          "Full: Slack, GitHub, GitLab, Zoom, Google Meet, Custom API/Webhooks",
        "Dashboards & Reporting": "Advanced with fraud and incidents", // Corrected from "Advanced with fraud reports"
        "SLA Tracking": "Enforcement with auto escalations, 99.9% uptime",
        "MSP Clients": "Unlimited",
        "Access Control": "Role-based",
        Support: "Priority email and chat",
        Action: "Start 14 days free trial",
      },
      isPopular: true,
    },
    {
      name: "Enterprise",
      values: {
        Description:
          "For banks, telcos, governments, and large organizations with compliance needs.",
        Price: "Custom from $9/user/month",
        Users: "Unlimited users",
        Incidents: "Unlimited incidents with postmortems",
        Integration:
          "Full: Slack, GitHub, GitLab, Zoom, Google Meet, Custom API/Webhooks, SSO (Azure AD, Okta, AWS Cognito)",
        "Dashboards & Reporting": "Advanced with compliance (PCI, ISO, SOC2)",
        "SLA Tracking": "Enforcement with auto escalations, 99.9% uptime",
        "MSP Clients": "Unlimited",
        "Access Control": "Role-based",
        Support: "24/7 phone, dedicated manager",
        Action: "Start 14 days free trial",
      },
      isPopular: false,
    },
  ],
};

const PricingTable = () => {
  const [billingCycle, setBillingCycle] = useState("Monthly"); // State for Monthly/Yearly toggle
  const { get, post } = useFetch();
  const [agent, setAgent] = useState<any>(1);
  const [loading, setLoading] = useState("");
  const router = useRouter();

  const { data, isLoading } = useQuery({
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

  console.log({ data });

  const plans = useMemo(() => {
    const monthly = data?.filter((plan: any) => plan.billingCycle === "month");
    const yearly = data?.filter((plan: any) => plan.billingCycle === "year");
    return {
      features: [
        "Price",
        "Description",
        "Users",
        "Incidents",
        "Integration",
        "Dashboards & Reporting",
        "SLA Tracking",
        "MSP Clients",
        "Access Control",
        "Support",
        "Action",
      ],
      Yearly: yearly,
      Monthly: monthly,
    };
  }, [data, billingCycle]);

  const mobilePlan = useMemo(() => {
    const features = [
      "Incidents",
      "Integration",
      "Dashboards & Reporting",
      "SLA Tracking",
      "MSP Clients",
      "Access Control",
      "Support",
      // "Action",
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

  console.log({ mobilePlan });

  const handlePayment = async (plan: any) => {
    console.log({ plan });
    if (plan) {
      const data = {
        planType: plan.type,
        billingCycle: plan.billingCycle,
        quantity: agent > 0 ? agent : 1,
        successUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/incident`,
        cancelUrl: `${process.env.NEXT_PUBLIC_INCIDENT_URL}/pricing`,
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
    <div className="bg-[#00263D] min-h-screen px-4  md:px-8 py-[10rem] font-sans">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center flex flex-col justify-center items-center mb-10 bg-gradient-to-r from-[#5A519F] to-[#8D4C9A] rounded-[30px] p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Scrubbe IMS Pricing
          </h1>
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
          <div className="flex items-center gap-2 mx-auto mt-6 ">
            <p className="text-white">Enter team size:</p>
            <div>
              <input
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                type="number"
                className=" max-w-[56px] rounded-md bg-white px-2"
                min={1}
                max={120}
              />
              <span className="text-white pl-1">agents</span>
            </div>
          </div>
        </div>

        {/* Pricing Table Grid */}
        {isLoading ? (
          <TableLoader />
        ) : (
          <>
            <div className="hidden lg:grid grid-cols-[auto_1fr_1fr_1fr_1fr] bg-[#fff] rounded-lg overflow-hidden shadow-xl">
              {/* Table Headers */}
              <div className="p-4 border-b border-r border-IMSLightGreen font-semibold  text-left">
                Features
              </div>
              {(plans as any)[billingCycle]?.map((plan: any, index: number) => (
                <div
                  key={plan.name}
                  className={`relative flex gap-3 items-center p-4 border-b ${
                    index < (pricingData as any)[billingCycle]?.length - 1
                      ? "border-r "
                      : ""
                  } border-IMSLightGreen font-semibold transition-colors duration-200 bg-[#5F509E] text-white `}
                >
                  <h3 className="text-lg uppercase">{plan.name}</h3>
                  {plan.isPopular && (
                    <span className=" px-3 py-1 bg-[#FF6B6B]  text-xs rounded-full whitespace-nowrap">
                      Most popular
                    </span>
                  )}
                </div>
              ))}

              {/* Table Body - Features and Values */}
              {plans.features?.map((feature, featureIndex) => (
                <React.Fragment key={feature}>
                  {/* Feature Name Column */}
                  <div
                    className={`p-4 border-r border-IMSLightGreen text-sm text-left font-bold ${
                      feature === "Description" ? "" : ""
                    } ${
                      featureIndex === pricingData?.features?.length - 1
                        ? "border-b-0 " // No bottom border for the last row
                        : "border-b border-IMSLightGreen bg-[#F5FFF6] "
                    }`}
                  >
                    {feature}
                  </div>

                  {/* Values for each plan */}
                  {(plans as any)[billingCycle]?.map(
                    (plan: any, planIndex: number) => (
                      <div
                        key={plan.name + feature}
                        className={`p-4 text-sm  ${
                          planIndex < (plans as any)[billingCycle]?.length - 1
                            ? "border-r"
                            : ""
                        } ${
                          featureIndex === plans?.features?.length - 1
                            ? "border-b-0"
                            : "border-b border-IMSLightGreen"
                        }`}
                      >
                        {feature === "Action" ? (
                          <button
                            onClick={() => handlePayment(plan)}
                            disabled={loading === plan.values.type}
                            className="bg-IMSLightGreen hover:bg-IMSDarkGreen text-white  font-semibold py-2 px-4 rounded transition-colors duration-200 w-full text-nowrap"
                          >
                            {plan.values[feature]}
                          </button>
                        ) : feature === "Price" ? (
                          <span className={"font-bold text-[#5A519F]"}>
                            {typeof plan.values[feature] === "string"
                              ? `${plan.values[feature]} (+14 days free trial on request)`
                              : `$${
                                  Number(agent) < 1
                                    ? plan.values[feature].toLocaleString()
                                    : Number(
                                        plan.values[feature] * agent
                                      ).toLocaleString()
                                }/agent/${billingCycle}(+14 days free trial )`}
                          </span>
                        ) : (
                          <span
                            className={
                              feature === "Description"
                                ? " text-black"
                                : "text-black"
                            }
                          >
                            {(plan as any).values[feature]}
                          </span>
                        )}
                      </div>
                    )
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className=" lg:hidden grid sm:grid-cols-2 gap-5">
              {mobilePlan?.map((value: any) => (
                <div
                  className=" bg-white rounded-lg py-4 px-4 flex flex-col justify-between gap-3 min-h-[500px]"
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
                              ? value?.values.Price.toLocaleString()
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
                    onClick={() => handlePayment(value)}
                    disabled={loading === value?.type}
                    className="bg-IMSLightGreen hover:bg-IMSDarkGreen text-white  font-semibold py-2 px-4 rounded transition-colors duration-200 w-full text-nowrap"
                  >
                    {value?.values?.Action}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricingTable;
