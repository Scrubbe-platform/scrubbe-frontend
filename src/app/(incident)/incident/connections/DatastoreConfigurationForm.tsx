import React from "react";
import ConnectionConfigurationForm from "./ConnectionConfigurationForm";

type Props = {
  integration: string;
  integrationType: string;
  onSuccess?: () => void;
};

const DATASTORE_DEFAULT_BASE_URLS: Record<string, string> = {
  postgres: "postgresql://db.example.com:5432/app",
  mysql: "mysql://db.example.com:3306/app",
  mongodb: "mongodb://db.example.com:27017/app",
  snowflake: "https://app.snowflake.com",
  bigquery: "https://console.cloud.google.com/bigquery",
  "datastore-custom": "https://warehouse.example.com",
};

const DatastoresConfigurationForm = ({
  integration,
  integrationType,
  onSuccess,
}: Props) => {
  return (
    <ConnectionConfigurationForm
      integration={integration}
      integrationType={integrationType}
      category="datastores"
      sectionTitle="Datastores & warehouses"
      description="Scrubbe queries read replicas or warehouses to estimate affected rows, customers and potential financial impact without touching primary write nodes."
      baseUrlLabel="Read replica / warehouse host"
      baseUrlPlaceholder="eg postgres://db.example.com:5432/app"
      credentialLabel="DB user / credentials (read-only)"
      credentialPlaceholder="Paste a read-only credential bundle or token"
      scopeLabel="Schema / database / dataset"
      scopePlaceholder="eg scrubbe_core, analytics_dw"
      notesPlaceholder="Example: Read replica only for customer payments metrics. Production write node is excluded."
      helperText="Scrubbe uses this to understand impact and loss, not to run production write workloads."
      defaultBaseUrl={DATASTORE_DEFAULT_BASE_URLS[integrationType]}
      onSuccess={onSuccess}
    />
  );
};

export default DatastoresConfigurationForm;
