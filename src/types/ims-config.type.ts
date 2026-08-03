// Shape of the IMS config record returned by GET /auth/ims-config (see useGetConfig).
// `metadata` is a legacy JSON blob the backend used before these became real
// columns — it duplicates most of the top-level SSO/policy fields below, so
// prefer the top-level fields and treat `metadata` as a fallback only.

export interface ImsPolicies {
  allowPDF: boolean;
  flagFraud: boolean;
  enforceSSO: boolean;
  auditLogging: boolean;
  restrictExport: boolean;
  requireWorkEmail: boolean;
  requireTwoApprovals: boolean;
}

export interface SsoAttributeMapping {
  email: string;
  groups: string;
  last_name: string;
  first_name: string;
  external_id: string;
}

export interface SsoConfiguration {
  domain: string | null;
  acs_url: string | null;
  idp_url: string | null;
  ssoType: string | null;
  audience: string | null;
  provider: string | null;
  client_id: string | null;
  entity_id: string | null;
  tenant_id: string | null;
  issuer_url: string | null;
  jitEnabled: boolean;
  scimEnabled: boolean;
  auditLogging: boolean;
  autoRoleSync: boolean;
  groupMapping: string | null;
  client_secret: string | null;
  discovery_url: string | null;
  group_mapping: Record<string, string>;
  attribute_mapping: SsoAttributeMapping;
  client_secret_configured: boolean;
}

export interface SsoTestReport {
  stage: string | null;
  message: string | null;
  outcome: "SUCCESS" | "FAILURE" | string;
  remediation: string | null;
  providerSlug: string | null;
}

export type ConnectorStatus = "HEALTHY" | "DEGRADED" | "DOWN" | string;

export interface ConnectorConnection {
  id: string;
  type: string;
  notes: string | null;
  scope: string | null;
  title: string;
  status: ConnectorStatus;
  baseUrl: string | null;
  category: string;
  lastError: string | null;
  updatedAt: string;
  authMethod: string;
  lastTestAt: string | null;
  displayName: string;
  installedAt: string;
  installedBy: string;
  lastEventAt: string | null;
  capabilities: string[];
  lastIncidentId: string | null;
  environmentTags: string[];
  credentialEncrypted: string | null;
  credentialConfigured: boolean;
  lastIncidentTicketId: string | null;
}

export interface ConnectorConnectionEvent {
  id: string;
  kind: string;
  status: string;
  message: string;
  createdAt: string;
  connectionId: string;
}

// The legacy `metadata` blob — same shape as the top-level fields it duplicates.
export type ImsConfigMetadata = Partial<
  Pick<
    ImsConfig,
    | "orgName"
    | "policies"
    | "ssoDomain"
    | "ssoStatus"
    | "jitEnabled"
    | "oidcIssuer"
    | "ssoDomains"
    | "ssoEnabled"
    | "scimEnabled"
    | "ssoEnforced"
    | "ssoProvider"
    | "auditLogging"
    | "oidcAudience"
    | "oidcClientId"
    | "oidcTenantId"
    | "allowedDomains"
    | "allowedProviders"
    | "oidcDiscoveryUrl"
    | "ssoConfiguration"
    | "connectorConnections"
    | "connectorConnectionEvents"
    | "oidcClientSecretConfigured"
  > & { ssoLastTestReport?: SsoTestReport | null }
>;

export interface ImsConfig {
  id: string;
  businessId: string;
  alertEmail: string | null;
  slackChannel: string | null;
  slaEnabled: boolean;
  autoEscalate: boolean;
  notifyOnCreate: boolean;
  notifyOnResolve: boolean;
  timezone: string;
  createdAt: string;
  updatedAt: string;

  orgName: string;
  companyName: string;
  primaryDomain: string;
  companyPurpose: string;

  policies: ImsPolicies;

  ssoDomain: string | null;
  ssoStatus: "DRAFT" | "ACTIVE" | "DISABLED" | string;
  ssoEnabled: boolean;
  ssoEnforced: boolean;
  ssoProvider: string | null;
  ssoProtocol: string | null;
  ssoDomains: string[];
  allowedDomains: string[];
  allowedProviders: string[];

  jitEnabled: boolean;
  scimEnabled: boolean;
  auditLogging: boolean;

  oidcIssuer: string | null;
  oidcAudience: string | null;
  oidcClientId: string | null;
  oidcTenantId: string | null;
  oidcDiscoveryUrl: string | null;
  oidcClientSecretConfigured: boolean;

  samlEntityId: string | null;
  samlAcsUrl: string | null;
  samlIdpMetadataUrl: string | null;
  samlIdpUrl: string | null;

  ssoConfiguration: SsoConfiguration;
  attributeMapping: SsoAttributeMapping;
  groupMapping: Record<string, string>;

  ssoLastTestReport: SsoTestReport | null;
  lastSsoTestReport: SsoTestReport | null;
  lastSsoTestPassedAt: string | null;

  connectorConnections: ConnectorConnection[];
  connectorConnectionEvents: ConnectorConnectionEvent[];

  metadata?: ImsConfigMetadata;
}
