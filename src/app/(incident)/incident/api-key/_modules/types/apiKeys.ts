import { formatDistanceToNow } from "date-fns";

export type KeyType = "SDK" | "Integration" | "MCP" | "Automation" | "Agent";
export type KeyStatus = "active" | "expired" | "revoked" | "suspended";

// Server-side model (from GET /apikey/apikeys)
export interface ServerApiKey {
  id: string;
  name: string;
  environment: "PRODUCTION" | "DEVELOPMENT";
  scopes: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// Server response from POST /apikey/createapikey (includes raw key — shown once)
export interface CreatedApiKey extends ServerApiKey {
  key: string;
}

// UI display type used by all components
export interface ApiKey {
  id: string;
  name: string;
  environment: "PRODUCTION" | "DEVELOPMENT";
  scopes: string[];
  type: KeyType;
  services: string[];
  perms: string[];
  used: string;
  status: KeyStatus;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface AuditEntry {
  time: string;
  type: "auth" | "read" | "write" | "config" | "error";
  event: string;
  meta: string;
  actor: string;
}

export interface ToastMessage {
  id: string;
  msg: string;
  type: "success" | "warning" | "error" | "info";
}

function deriveType(scopes: string[]): KeyType {
  if (scopes.some((s) => s.startsWith("mcp."))) return "MCP";
  if (scopes.some((s) => s.startsWith("agent."))) return "Agent";
  if (scopes.some((s) => s.startsWith("deployment.") || s.startsWith("automation.")))
    return "Automation";
  if (scopes.some((s) => s.startsWith("integration.") || s.startsWith("github.") || s.startsWith("slack.")))
    return "Integration";
  return "SDK";
}

function deriveStatus(key: ServerApiKey): KeyStatus {
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) return "expired";
  if (!key.isActive) return "suspended";
  return "active";
}

function deriveUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return "Never";
  try {
    return formatDistanceToNow(new Date(lastUsedAt), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function toUiKey(sk: ServerApiKey): ApiKey {
  return {
    id: sk.id,
    name: sk.name,
    environment: sk.environment,
    scopes: sk.scopes,
    type: deriveType(sk.scopes),
    services: sk.scopes.length > 0 ? sk.scopes : ["All Services"],
    perms: sk.scopes,
    used: deriveUsed(sk.lastUsedAt),
    status: deriveStatus(sk),
    createdAt: sk.createdAt,
    expiresAt: sk.expiresAt,
    isActive: sk.isActive,
  };
}
