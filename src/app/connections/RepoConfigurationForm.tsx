import React from "react";
import ConnectionConfigurationForm from "./ConnectionConfigurationForm";

type Props = {
  integration: string;
  integrationType: string;
  onSuccess?: () => void;
};

const REPO_DEFAULT_BASE_URLS: Record<string, string> = {
  github: "https://github.com",
  gitlab: "https://gitlab.com",
  bitbucket: "https://bitbucket.org",
  "azure-devops": "https://dev.azure.com",
};

const RepoConfigurationForm = ({
  integration,
  integrationType,
  onSuccess,
}: Props) => {
  return (
    <ConnectionConfigurationForm
      integration={integration}
      integrationType={integrationType}
      category="code_repos"
      sectionTitle="Code & repos"
      description="Scrubbe reads repo metadata, commits, branches and deployment status to understand which changes might have broken a service. No code is modified."
      baseUrlLabel="Base URL / host (if self-hosted)"
      baseUrlPlaceholder="eg https://github.com or https://gitlab.example.com"
      credentialLabel="App installation / PAT / token"
      credentialPlaceholder="Paste a read-only token or key"
      scopeLabel="Org / project / workspace"
      scopePlaceholder="eg scrubbe-core, analytics-d"
      notesPlaceholder="Example: GitHub org for customer-facing services only. Jenkins instance is internal only."
      helperText="Scrubbe uses this to read metadata, pipeline results and metrics, never to push changes."
      defaultBaseUrl={REPO_DEFAULT_BASE_URLS[integrationType]}
      onSuccess={onSuccess}
    />
  );
};

export default RepoConfigurationForm;
