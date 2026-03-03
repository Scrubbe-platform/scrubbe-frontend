import EmptyState from "@/components/ui/EmptyState";
import React from "react";

const page = () => {
  return (
    <div>
      <EmptyState
        image={
          <img src="/IMS/underconstruction.svg" className=" w-[200px]" alt="" />
        }
        title="Under Development"
        description=""
      />
    </div>
  );
};

export default page;
