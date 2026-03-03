"use client";
import Plan from "@/components/dashboard/Plan";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import useAuthStore from "@/lib/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [openPlan, setOpenPlan] = useState(false);
  const { get } = useFetch();
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["SUBSCRIPTION"],
    queryFn: async () => {
      const res = await get(
        `${endpoint.plans.getUserSubscription}/${user?.id}/subscriptions`
      );
      console.log(res);
      if (res.success) {
        return res.data.data;
      }
      return null;
    },
  });
  console.log(data);
  return (
    <div className=" p-4">
      <p className=" text-lg font-bold"> Billing and Usage </p>

      <div className="p-4 rounded-lg bg-white border border-neutral-200">
        <div className="  flex flex-row justify-between  gap-3">
          <div className="flex flex-col gap-2 justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className=" font-medium text-base">Start Plan </p>
                <div className=" text-xs px-2 py-1 bg-emerald-100 text-emerald-600 border border-emerald-500 rounded-lg w-fit">
                  Active
                </div>
              </div>
              <p className=" font-bold">$15/agent/month</p>
            </div>

            <div>
              <p className="text-sm font-medium mt-2">Next Billing date</p>
              <p className="text-sm mt-1 ">
                Your plan will expire on Oct 17, 2024 (10days left)
              </p>
            </div>
          </div>
          <div className=" flex-col flex justify-between items-end gap-2">
            <p className=" text-2xl font-bold">$60/month</p>
            <p className=" text-sm">4 agents available</p>
            <CButton
              onClick={() => setOpenPlan(true)}
              className=" text-IMSLightGreen bg-transparent hover:bg-transparent border border-IMSLightGreen rounded-lg p-1 text-sm flex items-center gap-2 px-2 w-fit"
            >
              <span>View Plan</span>
              <ChevronRight size={15} />
            </CButton>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-300 mt-3 pt-3">
          <CButton className=" !w-fit bg-rose-500 hover:bg-rose-600">
            Cancel Plan
          </CButton>
          <CButton className=" !w-fit">Upgrade Plan</CButton>
        </div>
      </div>

      <Modal onClose={() => setOpenPlan(false)} isOpen={openPlan}>
        <Plan />
      </Modal>
    </div>
  );
};

export default Page;
