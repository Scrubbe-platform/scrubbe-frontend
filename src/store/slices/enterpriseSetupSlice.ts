import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import type { StateCreator } from "zustand";

export interface TeamMember {
  id: string;
  name?: string;
  email: string;
  role: string;
  level?: string;
  permissions: string[];
}

export interface CompanyLogo {
  file: File | null;
  base64: string | null;
}

export interface EnterpriseSetup {
  // Company Information
  companyName: string;
  industry: string;
  companySize: string;
  primaryRegion: string;
  companyLogo: CompanyLogo | null;

  // Admin Contact
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminJobTitle: string;

  // Team Members
  teamMembers: TeamMember[];

  // Dashboard Preferences
  colorScheme: {
    primaryColor: string;
    secondaryColor: string;
  };
  defaultDashboard: "SIEM" | "SOAR" | "Custom";
  preferredIntegrations: string[]; // ['Jira', 'Freshdesk', 'Service Now']
  notificationChannels: string[]; // ['Slack', 'Microsoft Teams', 'Email', 'SMS']
  defaultIncidentPriority: string; // ['High', 'Medium', 'Low']
}

export type enterpriseSetupSliceType = {
  enterpriseSetup: EnterpriseSetup;
  currentStep: number;
  isSubmitting: boolean;
  isSuccess: boolean;
  errors: Record<string, string>;

  // Actions
  setCompanyInfo: (
    info: Partial<
      Pick<
        EnterpriseSetup,
        "companyName" | "industry" | "companySize" | "primaryRegion"
      >
    >
  ) => void;
  setCompanyLogo: (file: File | null) => void;
  setAdminContact: (
    contact: Partial<
      Pick<
        EnterpriseSetup,
        "adminName" | "adminEmail" | "adminPhone" | "adminJobTitle"
      >
    >
  ) => void;
  addTeamMember: (member: Omit<TeamMember, "id">) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  updateMemberPermission: (
    memberId: string,
    permission: keyof TeamMember["permissions"],
    value: boolean
  ) => void;
  setDashboardPreferences: (
    preferences: Partial<
      Pick<EnterpriseSetup, "colorScheme" | "defaultDashboard">
    >
  ) => void;
  toggleIntegration: (integration: string) => void;
  toggleNotificationChannel: (channel: string) => void;
  toggleIncidentPriority: (priority: string) => void;
  setCurrentStep: (step: number) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  submitEnterpriseSetup: () => Promise<void>;
  resetEnterpriseSetup: () => void;
  validateCurrentStep: () => boolean;
};

const initialEnterpriseSetup: EnterpriseSetup = {
  companyName: "",
  industry: "",
  companySize: "",
  primaryRegion: "",
  companyLogo: null,
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminJobTitle: "",
  teamMembers: [],
  colorScheme: {
    primaryColor: "#F73737",
    secondaryColor: "#1F9237",
  },
  defaultDashboard: "SIEM",
  preferredIntegrations: ["Jira"],
  notificationChannels: ["Slack"],
  defaultIncidentPriority: "HIGH",
};

export const createEnterpriseSetupSlice: StateCreator<
  enterpriseSetupSliceType
> = (set, get) => ({
  enterpriseSetup: initialEnterpriseSetup,
  currentStep: 0,
  isSubmitting: false,
  isSuccess: false,
  errors: {},

  // Set company information
  setCompanyInfo: (info) => {
    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        ...info,
      },
    }));
  },

  // Set company logo
  setCompanyLogo: (file) => {
    if (!file) {
      set((state) => ({
        enterpriseSetup: {
          ...state.enterpriseSetup,
          companyLogo: null,
        },
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        set((state) => ({
          enterpriseSetup: {
            ...state.enterpriseSetup,
            companyLogo: {
              file,
              base64: result,
            },
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  },

  // Set admin contact information
  setAdminContact: (contact) => {
    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        ...contact,
      },
    }));
  },

  // Add a new team member
  addTeamMember: (member) => {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        teamMembers: [...state.enterpriseSetup.teamMembers, newMember],
      },
    }));
  },

  // Update existing team member
  updateTeamMember: (id, updates) => {
    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        teamMembers: state.enterpriseSetup.teamMembers.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        ),
      },
    }));
  },

  // Remove team member
  removeTeamMember: (id) => {
    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        teamMembers: state.enterpriseSetup.teamMembers.filter(
          (member) => member.id !== id
        ),
      },
    }));
  },

  // Update team member permission
  updateMemberPermission: (memberId, permission, value) => {
    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        teamMembers: state.enterpriseSetup.teamMembers.map((member) =>
          member.id === memberId
            ? {
                ...member,
                permissions: {
                  ...member.permissions,
                  [permission]: value,
                },
              }
            : member
        ),
      },
    }));
  },

  // Set dashboard preferences
  setDashboardPreferences: (preferences) => {
    set((state) => ({
      enterpriseSetup: {
        ...state.enterpriseSetup,
        ...preferences,
      },
    }));
  },

  // Toggle integration selection
  toggleIntegration: (integration) => {
    set((state) => {
      const currentIntegrations = state.enterpriseSetup.preferredIntegrations;
      const newIntegrations = currentIntegrations.includes(integration)
        ? currentIntegrations.filter((item) => item !== integration)
        : [...currentIntegrations, integration];

      return {
        enterpriseSetup: {
          ...state.enterpriseSetup,
          preferredIntegrations: newIntegrations,
        },
      };
    });
  },

  // Toggle notification channel
  toggleNotificationChannel: (channel) => {
    set((state) => {
      const currentChannels = state.enterpriseSetup.notificationChannels;
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter((item) => item !== channel)
        : [...currentChannels, channel];

      return {
        enterpriseSetup: {
          ...state.enterpriseSetup,
          notificationChannels: newChannels,
        },
      };
    });
  },

  // Toggle incident priority
  toggleIncidentPriority: (priority) => {
    set((state) => {
      const currentPriorities = state.enterpriseSetup.defaultIncidentPriority;
      const newPriorities = currentPriorities == priority ? "" : priority;

      return {
        enterpriseSetup: {
          ...state.enterpriseSetup,
          defaultIncidentPriority: newPriorities,
        },
      };
    });
  },

  // Set current step
  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  // Set error for a specific field
  setError: (field, error) => {
    set((state) => ({
      errors: {
        ...state.errors,
        [field]: error,
      },
    }));
  },

  // Clear error for a specific field
  clearError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  // Clear all errors
  clearAllErrors: () => {
    set({ errors: {} });
  },

  // Validate current step
  validateCurrentStep: () => {
    const { currentStep, enterpriseSetup } = get();
    const { clearAllErrors, setError } = get();

    clearAllErrors();
    let isValid = true;

    switch (currentStep) {
      case 0: // Company Information
        if (!enterpriseSetup.companyName.trim()) {
          setError("companyName", "Company name is required");
          isValid = false;
        }
        if (!enterpriseSetup.industry) {
          setError("industry", "Industry selection is required");
          isValid = false;
        }
        if (!enterpriseSetup.companySize) {
          setError("companySize", "Company size is required");
          isValid = false;
        }
        if (!enterpriseSetup.primaryRegion) {
          setError("primaryRegion", "Primary region is required");
          isValid = false;
        }
        break;

      case 1: // Admin Contact
        if (!enterpriseSetup.adminName.trim()) {
          setError("adminName", "Admin name is required");
          isValid = false;
        }
        if (!enterpriseSetup.adminEmail.trim()) {
          setError("adminEmail", "Admin email is required");
          isValid = false;
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enterpriseSetup.adminEmail)
        ) {
          setError("adminEmail", "Please enter a valid email address");
          isValid = false;
        }
        if (!enterpriseSetup.adminJobTitle.trim()) {
          setError("adminJobTitle", "Admin job title is required");
          isValid = false;
        }
        break;

      case 2: // Team Members (optional, so no validation required)
        break;

      case 3: // Dashboard Preferences (optional, so no validation required)
        break;

      default:
        break;
    }

    return isValid;
  },

  // Submit enterprise setup
  submitEnterpriseSetup: async () => {
    const { validateCurrentStep, enterpriseSetup } = get();

    if (!validateCurrentStep()) {
      return;
    }

    set({ isSubmitting: true });

    try {
      // Simulate API call
      const dashboardPreference: { [key: string]: string } = {
        SIEM: "SCRUBBE_DASHBOARD_SIEM",
        SOAR: "SCRUBBE_DASHBOARD_SOAR",
        CUSTOM: "SCRUBBE_DASHBOARD_CUSTOM",
      };

      const integration: { [key: string]: string } = {
        Jira: "JIRA",
        Freshdesk: "FRESHDESK",
        "Service Now": "SERVICE_NOW",
      };

      const notificationChannel: { [key: string]: string } = {
        Slack: "SLACK",
        "Microsoft Teams": "MICROSOFT_TEAMS",
        Email: "EMAIL",
        SMS: "SMS",
      };

      const data = {
        companyName: enterpriseSetup.companyName,
        industry: enterpriseSetup.industry,
        companySize: enterpriseSetup.companySize,
        primaryRegion: enterpriseSetup.primaryRegion,
        companyLogo: "",
        firstName: enterpriseSetup.adminName.split(" ")[0] ?? "",
        lastName: enterpriseSetup.adminName.split(" ")[1] ?? "",
        adminEmail: enterpriseSetup.adminEmail,
        adminJobTitle: enterpriseSetup.adminJobTitle,
        inviteMembers: enterpriseSetup.teamMembers.map((value) => ({
          inviteEmail: value.email,
          role: value.role,
          accessPermissions: value.permissions,
        })),
        dashboardPreference: {
          colorScheme: enterpriseSetup.colorScheme.primaryColor,
          defaultDashboard:
            dashboardPreference[enterpriseSetup.defaultDashboard],
          preferredIntegration: enterpriseSetup.preferredIntegrations.map(
            (value) => integration[value]
          ),
          notificationChannels: enterpriseSetup.notificationChannels.map(
            (value) => notificationChannel[value]
          ),
          defaultPriority:
            enterpriseSetup.defaultIncidentPriority.toUpperCase(),
        },
      };

      // Replace with actual API endpoint
      // const response = await fetch('/api/enterprise-setup', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to submit enterprise setup');
      // }

      // Simulate successful submission
      await apiClient.put(endpoint.auth.account_setup, data);
      set({ isSuccess: true });
    } catch (error) {
      console.error("Error submitting enterprise setup:", error);
      toast.error("Failed to submit enterprise setup");
      set({
        errors: {
          submit:
            error instanceof Error
              ? error.message
              : "Failed to submit enterprise setup",
        },
      });
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Reset enterprise setup to initial state
  resetEnterpriseSetup: () => {
    set({
      enterpriseSetup: initialEnterpriseSetup,
      currentStep: 0,
      isSubmitting: false,
      errors: {},
    });
  },
});
