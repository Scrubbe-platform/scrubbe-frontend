import React from "react";
import ConnectionConfigurationForm from "./ConnectionConfigurationForm";

type Props = {
  integration: string;
  integrationType: string;
  onSuccess?: () => void;
};

const FRAUD_DEFAULT_BASE_URLS: Record<string, string> = {
  "internal-fraud": "https://fraud-db.internal",
  "events-stream": "https://stream.example.com",
  "third-party": "https://api.risk-provider.com",
  "scrubbe-fraud-api": "https://api.scrubbe.com/fraud",
  "fraud-custom": "https://fraud-signals.example.com",
};

const FraudConfigurationForm = ({
  integration,
  integrationType,
  onSuccess,
}: Props) => {
  return (
    <ConnectionConfigurationForm
      integration={integration}
      integrationType={integrationType}
      category="fraud_metrics"
      sectionTitle="Fraud metrics & signals"
      description="Scrubbe listens to fraud metrics, events and risk APIs, so incidents can distinguish noisy technical issues from real fraud, abuse or money leakage."
      baseUrlLabel="API base URL / broker host"
      baseUrlPlaceholder="eg https://risk.example.com or https://stream.example.com"
      credentialLabel="API key / stream auth"
      credentialPlaceholder="Paste a read-only token or key"
      scopeLabel="Tenant / topic / dataset"
      scopePlaceholder="eg fraud-prod, risk-events"
      notesPlaceholder="Example: Production payment abuse signals only. Sandbox event stream is handled elsewhere."
      helperText="Scrubbe uses this to read fraud metrics and abuse signals, never to alter production systems."
      defaultBaseUrl={FRAUD_DEFAULT_BASE_URLS[integrationType]}
      onSuccess={onSuccess}
    />
  );
};

export default FraudConfigurationForm;
