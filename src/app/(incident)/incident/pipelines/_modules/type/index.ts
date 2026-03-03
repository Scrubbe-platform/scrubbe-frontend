/**
 * Represents the health status of a specific CI/CD stage
 */
export type StageStatus = 'success' | 'warning' | 'error';

/**
 * Represents the primary status of a run/incident
 */
export type RunStatusType = 'error' | 'warning' | 'success';

export interface ActivityItem {
  id: string;
  run: string;
  timestamp: string;
  repoName: string;
  repoPath: string;
  service: string;
  metadata: {
    pr: string;
    sha: string;
    env: string;
  };
  status: {
    label: string;
    type: RunStatusType;
    subLabel: string | null;
  };
  trigger: {
    title: string;
    description: string;
  };
  details: {
    incidentStatus: string; // e.g., "active • S4"
    stages: Array<{
      name: string;
      status: StageStatus;
    }>;
    codeEngine: {
      id: string;
      confidence: string;
      risk: 'Low' | 'Med' | 'High' | 'Critical';
      paths: string;
    };
    affectedFiles: string[];
    gateReason: string;
  };
  evidence: {
    runUrl: string;
    logsUrl: string;
    incidentId: string;
  };
}