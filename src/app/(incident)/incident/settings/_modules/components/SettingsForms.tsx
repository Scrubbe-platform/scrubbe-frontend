import type { ReactElement } from "react";
import { FormProps } from "./formTypes";
import { AppearanceForm, AuthenticationForm, OrganizationForm, RolesForm, UsersForm } from "./SettingsFormsWorkspace";
import {
  AssetsForm, AutomationForm, EnvironmentsForm, IncidentPoliciesForm, OrulesForm, QualityForm, ServicesForm, SlaForm, WorkflowsForm,
} from "./SettingsFormsOperations";
import { AgentsForm, AiForm, AiModelsForm, CausalForm, PlaybooksForm } from "./SettingsFormsAgents";
import { DeliveryForm, IntegrationsForm, NotificationsForm, StatusForm } from "./SettingsFormsConnect";
import {
  ApiKeysForm, AuditForm, ComplianceForm, DecisionsForm, RetentionForm, SecurityForm,
} from "./SettingsFormsGovernance";
import { BillingForm, DeveloperForm, SystemForm } from "./SettingsFormsPlatform";

export const FORM_RENDERERS: Record<string, (p: FormProps) => ReactElement> = {
  organization: OrganizationForm,
  users: UsersForm,
  roles: RolesForm,
  authentication: AuthenticationForm,
  appearance: AppearanceForm,

  services: ServicesForm,
  environments: EnvironmentsForm,
  workflows: WorkflowsForm,
  orules: OrulesForm,
  sla: SlaForm,
  incidentpolicies: IncidentPoliciesForm,
  assets: AssetsForm,
  automation: AutomationForm,
  quality: QualityForm,

  agents: AgentsForm,
  ai: AiForm,
  playbooks: PlaybooksForm,
  aimodels: AiModelsForm,
  causal: CausalForm,

  integrations: IntegrationsForm,
  notifications: NotificationsForm,
  delivery: DeliveryForm,
  status: StatusForm,

  security: SecurityForm,
  retention: RetentionForm,
  audit: AuditForm,
  apikeys: ApiKeysForm,
  decisions: DecisionsForm,
  compliance: ComplianceForm,

  developer: DeveloperForm,
  system: SystemForm,
  billing: BillingForm,
};
