import NewIncidentList from "@/components/IMS/incident/NewIncidentList";
import React from "react";
import { redirect } from "next/navigation";

const page = () => {
  redirect("/incident/tickets");
  return (
    <div>
      <NewIncidentList />
    </div>
  );
};

export default page;
