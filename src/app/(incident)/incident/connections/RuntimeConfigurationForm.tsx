import React from "react";
import ConnectionConfigurationForm from "./ConnectionConfigurationForm";

type Props = {
  integration: string;
  integrationType: string;
  onSuccess?: () => void;
};

const RUNTIME_DEFAULT_BASE_URLS: Record<string, string> = {
  docker: "https://hub.docker.com",
  "amazon-ecr": "https://console.aws.amazon.com/ecr",
  "gcr-artifact": "https://console.cloud.google.com/artifacts",
  "kubernetes-eks": "https://eks.amazonaws.com",
  "kubernetes-gke": "https://container.googleapis.com",
  "runtime-custom": "https://cluster.example.com",
};

const RuntimeConfigurationForm = ({
  integration,
  integrationType,
  onSuccess,
}: Props) => {
  return (
    <ConnectionConfigurationForm
      integration={integration}
      integrationType={integrationType}
      category="runtime"
      sectionTitle="Runtimes & clusters"
      description="Scrubbe maps images, tags, pods and clusters behind each service, so incidents can say exactly which container or pod is impacted in production."
      baseUrlLabel="Cluster API / registry URL"
      baseUrlPlaceholder="eg https://registry.example.com or https://cluster.example.com"
      credentialLabel="Cluster / registry credentials"
      credentialPlaceholder="Paste a read-only token, kubeconfig, or key"
      scopeLabel="Cluster / namespace label"
      scopePlaceholder="eg payments-cluster, production"
      notesPlaceholder="Example: Customer-facing workloads only. Internal batch cluster is managed separately."
      helperText="Scrubbe uses this to read registry and cluster metadata, never to mutate runtimes."
      defaultBaseUrl={RUNTIME_DEFAULT_BASE_URLS[integrationType]}
      onSuccess={onSuccess}
    />
  );
};

export default RuntimeConfigurationForm;
