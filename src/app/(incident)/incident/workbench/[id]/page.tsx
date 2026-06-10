"use client";
import MajorIncidentWorkbench from "@/components/IMS/Workbench/MajorIncidentWorkbench";
import { useIncidentDetail } from "@/hooks/useIncidentWorkspace";
import { useParams } from "next/navigation";
import React from "react";

const page = () => {
  const id = useParams().id;
  const { data, isLoading } = useIncidentDetail(id as string);
  if (isLoading) return <div>Loading...</div>;
  return <div>{data && <MajorIncidentWorkbench incident={data} />}</div>;
};

export default page;
