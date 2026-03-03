import { create } from "zustand";

interface PlaybookBuilderState {
  playbookActions: string[];
  playbookTriggers: string[];
  playbookMetrics: string[];
  addPlaybookTrigger: (trigger: string) => void;
  addPlaybookAction: (action: string) => void;
  addPlaybookMetric: (metric: string) => void;
}
const usePlaybookBuilderStore = create<PlaybookBuilderState>((set) => ({
  playbookActions: [
    "Block IP",
    "Log event",
    "Terminate Session",
    "Blacklist User",
    "Block User",
    "Force MFA",
    "Add to Watchlist",
    "Send to Ezra for AI Review",
    "Trigger another playbook",
  ],
  playbookTriggers: ["Send Alert", "Notify Security Agent"],
  playbookMetrics: [
    "Unauthorized access",
    "Failed Login",
    "Phishing Email",
    "Severity = High",
  ],
  addPlaybookAction: (action) =>
    set((state) => ({ playbookActions: [...state.playbookActions, action] })),
  addPlaybookTrigger(trigger) {
    set((state) => ({
      playbookTriggers: [...state.playbookTriggers, trigger],
    }));
  },
  addPlaybookMetric(metric) {
    set((state) => ({
      playbookMetrics: [...state.playbookMetrics, metric],
    }));
  },
}));

export default usePlaybookBuilderStore;
