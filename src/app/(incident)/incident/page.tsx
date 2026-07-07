import NewIncidentList from "@/components/IMS/incident/NewIncidentList";
import React from "react";
import { redirect } from "next/navigation";
import WorkspaceLoader from "@/components/ui/LoaderUI/WorkspaceLoader";

const page = () => {
  // redirect("/incident/tickets");
  return <WorkspaceLoader />;
};

export default page;
