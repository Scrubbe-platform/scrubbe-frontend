"use client";
import EmptyState from "@/components/ui/EmptyState";
import React from "react";
const page = () => {
  return (
    <div>
      <div className="h-[800px] w-full bg-no-repeat bg-cover relative z-10">
        <img
          src="/IMS/blog-banner.jpg"
          className=" w-full h-full object-cover brightness-50 absolute z-0"
          alt=""
        />
        <div className="container mx-auto px-4">
          <div className=" absolute flex flex-col max-sm:items-center justify-center h-full">
            <h1 className="text-white sm:text-start text-center text-4xl md:text-5xl font-bigshotOne">
              Insights on Reliability,
              <br className=" hidden md:flex" /> Incidents & Resilience
            </h1>

            <div className="flex sm:flex-row flex-col sm:gap-0 gap-5 items-center mt-3">
              <input
                type="text"
                name=""
                id=""
                placeholder="Search posts about SLAs, Devops etc"
                className="h-[42px] w-[300px] text-center sm:text-start px-4 bg-white outline-none max-sm:rounded-lg sm:rounded-l-lg"
              />
              <div className="h-[42px] max-sm:rounded-lg sm:rounded-r-lg bg-IMSLightGreen text-white flex items-center px-6 font-semibold cursor-pointer">
                Search
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" container mx-auto mt-4 px-4 space-y-3">
        <p className=" text-xl font-bold">Blog Posts</p>
        <EmptyState
          title="No Blog Post"
          description="Check back soon to get updates on our new blog posts. See you soon."
        />
      </div>
    </div>
  );
};

export default page;
