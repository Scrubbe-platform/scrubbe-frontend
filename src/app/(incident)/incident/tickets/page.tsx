"use client";
import NewIncidentList from "@/components/IMS/incident/NewIncidentList";
import React from "react";
import IncidentLibraryPage from "./_modules/components/IncidentLibrary";
import { useIncidentWorkspace } from "@/hooks/useIncidentWorkspace";

const Page = () => {
  const { incidentId } = useIncidentWorkspace();
  return (
    <>
      {incidentId ? (
        <NewIncidentList tabs="overview" />
      ) : (
        <IncidentLibraryPage />
      )}
    </>
  );
};

export default Page;
