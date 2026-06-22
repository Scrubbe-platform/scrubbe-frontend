export type KeyType = 'SDK' | 'Integration' | 'MCP' | 'Automation' | 'Agent';
export type KeyStatus = 'active' | 'expired' | 'revoked' | 'suspended';

export interface ApiKey {
    id: string;
    name: string;
    type: KeyType;
    services: string[];
    perms: string[];
    used: string;
    status: KeyStatus;
}

export interface AuditEntry {
    time: string;
    type: 'auth' | 'read' | 'write' | 'config' | 'error';
    event: string;
    meta: string;
    actor: string;
}

export interface ToastMessage {
    id: string;
    msg: string;
    type: 'success' | 'warning' | 'error' | 'info';
}