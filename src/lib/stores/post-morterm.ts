import { Ticket } from "@/types";
import { create } from "zustand";

type PostMortermForm = {
  rootCauseAnalysis?: {
    causeCategory: string;
    rootCause: string;
    fiveWhys: {
      why1: string;
      why2: string;
      why3: string;
      why4: string;
      why5: string;
    };
  };
  resolutionDetails?: {
    temporaryFix: string;
    permanentFix: string;
  };
  knowledgeDraft?: {
    internalKb: {
      title: string;
      summary: string;
      identificationSteps: string;
      resolutionSteps: string;
      preventiveMeasures: string;
      tags: string[];
    };
  };
  followUpActions?: {
    task: string;
    owner: string;
    dueDate: string;
    status: string;
    ticketingSystems: string[];
  };
  stakeHolder?: {
    communicationChannel: string;
    targetStakeholders: string[];
    messageContent: string;
  };
};

// types/incident.ts

export interface IncidentData {
  causeCategory: string;
  communicationChannel: string;
  createdAt: string;
  followUpDueDate: string;
  followUpOwner: string;
  followUpStatus: "COMPLETED" | "IN_PROGRESS" | "PENDING"; // Assuming these are the possible statuses
  followUpTask: string;
  followUpTicketingSystems: string[];
  id: string;
  identificationStepsInternal: string;
  incidentTicketId: string;
  knowledgeSummaryCustomer: string | null;
  knowledgeSummaryInternal: string;
  knowledgeTagsInternal: string[];
  knowledgeTitleCustomer: string | null;
  knowledgeTitleInternal: string;
  messageContent: string;
  permanentFix: string;
  preventiveMeasuresInternal: string;
  resolutionStepsInternal: string;
  rootCause: string;
  targetStakeholders: string[];
  temporaryFix: string;
  updatedAt: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
}

type State = {
  formValue: PostMortermForm | null;
  sentStakeholderCommunications: boolean;
  incident: Ticket | null; // The main data object, can be null initially
};

type Action = {
  updateForm: ({ value }: { value: Partial<PostMortermForm> }) => void;
  updateSentStakeholderCommunications: (value: boolean) => void;
  setIncidentData: (data: Ticket) => void;
  clearIncidentData: () => void;
};

export const usePostMortermForm = create<State & Action>((set) => ({
  formValue: null,
  sentStakeholderCommunications: false,
  updateForm: ({ value }) => {
    set((prev) => ({ formValue: { ...prev.formValue, ...value } }));
  },
  updateSentStakeholderCommunications(value) {
    set({ sentStakeholderCommunications: value });
  },
  incident: null,

  // Action to store new incident data
  setIncidentData: (data) => set({ incident: data }),

  // Action to clear the stored data
  clearIncidentData: () => set({ incident: null }),
}));
