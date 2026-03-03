"use client";
import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Blogs = () => {
  const router = useRouter();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between ">
        <p className=" text-3xl font-bold">Blogs</p>
        <CButton
          onClick={() => router.push("/admin/blogs/create-blog")}
          className=" w-fit"
        >
          <Plus /> Create Blog
        </CButton>
      </div>

      <div className=" mt-4">
        <EmptyState
          image={
            <img src="/IMS/empty-state.svg" className=" w-[200px]" alt="" />
          }
          title="No Blog post published yet!"
          description=""
          action={
            <CButton
              onClick={() => router.push("/admin/blogs/create-blog")}
              className=" w-fit"
            >
              <Plus /> Create Blog
            </CButton>
          }
        />
      </div>
    </div>
  );
};

export default Blogs;
