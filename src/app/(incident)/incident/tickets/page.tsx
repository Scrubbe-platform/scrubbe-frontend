"use client";
import NewIncidentList from "@/components/IMS/incident/NewIncidentList";
import React from "react";
import IncidentLibraryPage from "./_modules/components/IncidentLibrary";
import { useIncidentWorkspace } from "@/hooks/useIncidentWorkspace";
import Header from "@/components/IMS/DashboardHeader";

const Page = () => {
  const { incidentId } = useIncidentWorkspace();
  return (
    <>
      <Header title="Incident Library" />
      {incidentId ? (
        <NewIncidentList tabs="overview" />
      ) : (
        <IncidentLibraryPage />
      )}
    </>
  );
};

export default Page;
