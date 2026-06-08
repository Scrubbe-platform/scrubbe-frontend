import React from "react";
import CodeEnginePage from "./_modules/components/CodeEngineContent";
import IncidentOverview from "@/components/IMS/incident/NewIncidentList";

const page = () => {
  return (
    <IncidentOverview tabs="code-engine">
      <CodeEnginePage />
    </IncidentOverview>
  );
};

export default page;
