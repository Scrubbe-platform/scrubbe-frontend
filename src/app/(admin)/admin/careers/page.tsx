"use client";
import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Careers = () => {
  const router = useRouter();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between ">
        <p className=" text-3xl font-bold">Careers</p>
        <CButton
          onClick={() => router.push("/admin/careers/create-job")}
          className=" w-fit"
        >
          <Plus /> New Job
        </CButton>
      </div>

      <div className=" mt-4">
        <EmptyState
          image={
            <img src="/IMS/empty-state.svg" className=" w-[200px]" alt="" />
          }
          title="No Job post published yet!"
          description=""
          action={
            <CButton
              onClick={() => router.push("/admin/careers/create-job")}
              className=" w-fit"
            >
              <Plus /> New Job
            </CButton>
          }
        />
      </div>
    </div>
  );
};

export default Careers;
