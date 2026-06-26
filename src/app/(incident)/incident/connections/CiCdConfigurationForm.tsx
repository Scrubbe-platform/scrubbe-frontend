import React from "react";
import ConnectionConfigurationForm from "./ConnectionConfigurationForm";

type Props = {
  integration: string;
  integrationType: string;
  onSuccess?: () => void;
};

const CICD_DEFAULT_BASE_URLS: Record<string, string> = {
  "github-actions": "https://api.github.com",
  "gitlab-ci": "https://gitlab.com",
  "circle-ci": "https://circleci.com",
  jenkins: "https://jenkins.example.com",
  "azure-pipelines": "https://dev.azure.com",
  "cicd-custom": "https://ci.example.com",
};

const CiCdConfigurationForm = ({
  integration,
  integrationType,
  onSuccess,
}: Props) => {
  return (
    <ConnectionConfigurationForm
      integration={integration}
      integrationType={integrationType}
      category="cicd"
      sectionTitle="CI/CD pipelines"
      description="Scrubbe reads pipeline runs, job outcomes and deployment stages so it can correlate failed runs with incidents and compute MTTR and deployment velocity."
      baseUrlLabel="Base URL / host"
      baseUrlPlaceholder="eg https://github.com or https://jenkins.example.com"
      credentialLabel="App installation / PAT / token"
      credentialPlaceholder="Paste a read-only token or key"
      scopeLabel="Org / project / workspace"
      scopePlaceholder="eg scrubbe-core, analytics-d"
      notesPlaceholder="Example: GitHub org for customer-facing services only. Jenkins instance is internal only."
      helperText="Scrubbe uses this to read pipeline results and deployment metadata, never to push changes."
      defaultBaseUrl={CICD_DEFAULT_BASE_URLS[integrationType]}
      onSuccess={onSuccess}
    />
  );
};

export default CiCdConfigurationForm;
