export const endpoint = {
  auth: {
    account_setup: "/business/setup",
    invite_member: "/business/send-invite",
    decode_invite_token: "/business/decode-invite",
    accept_invite: "/business/accept-invite",
    ims_setup: "/ims/setup",
    ims_config: "/ims/config",
    ims_sso: "/ims/sso",
    ims_sso_test: "/ims/sso/test",
    ims_sso_activate: "/ims/sso/activate",
    ims_sso_disable: "/ims/sso/disable",
    ims_sso_domains: "/ims/sso/domains",
    ims_sso_verify_domain: "/ims/sso/domains/verify",
    sso_discover: "/auth/sso/discover",
    sso_login: "/auth/sso/login",
    me: "/auth/me",
    profile: "/auth/profile",
    update_profile: "/auth/profile",
    forgot_password: "/auth/forgot-password",
    valid_token: "/auth/validate-reset-token",
    reset_password: "/auth/reset-password",
    change_password: "/auth/change-password",
    logout: "/auth/logout",
  },
  data_source: {
    fingerprint_configuration: "/fingerprint/configuration",
  },
  incident_ticket: {
    create: "/incident-ticket",
    update: "/incident-ticket",
    get: "/incident-ticket",
    get_postmortems: "/postmortems",
    getTicket: "/tickets",
    get_members: "/business/get_members",
    send_comment: "/incident-ticket/comment",
    get_incident_id: "/incident-ticket/generate-id",
    get_comment: "/incident-ticket/comment",
    get_messages: "/incident-ticket/message",
    threat_intel: "/incident-ticket",
    context_get: "/incident-ticket",
    context_update: "/incident-ticket",
    analytics: "/incident-ticket/analytics",
    history: "/tickets/history",
    integrations: "/integrations",
    gitlab_projects: "/integrations/gitlab/projects",
    github_repos: "/integrations/github/repos",
    bitbucket_repos: "/integrations/bitbucket/repos",
    postmorterm: {
      five_why: "/incident-ticket/resolve/ai/five-whys",
      suggestion: "/incident-ticket/resolve/ai/suggestion",
      stakeholder: "/incident-ticket/resolve/ai/stakeholder",
      customer_kb: "/incident-ticket/resolve/customer-kb",
      resolve: "/incident-ticket/resolve",
      generatePDF: "/generate-pdf",
    },
  },
  changes: {
    create: "/changes",
    get: "/changes",
    getOne: "/changes",
    update: "/changes",
    delete: "/changes",
  },
  problems: {
    create: "/problems",
    get: "/problems",
    getOne: "/problems",
    update: "/problems",
    delete: "/problems",
  },
  api_key: {
    create: "/apikey/createapikey",
    get: "/apikey/apikeys",
    rotate: "/apikey",
    revoke: "/apikey",
    delete: "/apikey",
  },
  integration: {
    whatsapp: "/integrations/whatsapp/connect",
    sms: "/integrations/sms/connect",
    email: "/integrations/email/connect",
    slack: "/integrations/slack/connect",
    slack_callback: "/integrations/slack/oauth/callback",
    googlemeet: "/integrations/google/meet/connect",
    googlemeet_callback: "/integrations/google/meet/oauth/callback",
    github: "/integrations/github/connect",
    github_callback: "/integrations/github/callbacks/github",
    gitlab: "/integrations/gitlab/connect",
    gitlab_callback: "/integrations/gitlab/callback",
    bitbucket: "/integrations/bitbucket/connect",
    bitbucket_callback: "/integrations/bitbucket/callback",
    bitbucket_repos: "/integrations/bitbucket/repos",
  },
  connectors: {
    catalog: "/connectors/connectors",
    catalog_item: "/connectors/connectors",
    connections: "/connectors/connections",
    connection: "/connectors/connections",
    test: "/connectors/connections",
    rotate: "/connectors/connections",
    health: "/connectors/connections",
    events: "/connectors/connections",
  },
  ingestion: {
    github: "/ingestion/github",
    gitlab: "/ingestion/gitlab",
    bitbucket: "/ingestion/bitbucket",
    kubernetes: "/ingestion/kubernetes",
    kubernetes_manifest: "/ingestion/kubernetes/manifest",
    pagerduty: "/ingestion/pagerduty",
    prometheus: "/ingestion/prometheus",
    datadog: "/ingestion/datadog",
    webhook: "/ingestion/webhook",
  },
  plans: {
    get: "/pricing/plans",
    create_subscription: "/pricing/subscriptions",
    create_session: "/pricing/checkout/create-session",
    getUserSubscription: "/pricing/customers",
    cancel: "/pricing/subscriptions",
  },
  public: {
    blogs: "/admin/public/blogs",
    jobs: "/admin/public/jobs",
  },
  portal: {
    get_companies: "/customer/companies",
    register: "/customer/register",
    login: "/customer/login",
    create_incident: "/customer/create-incident",
    get_incident: "/customer/get-incident",
    get_incidents: "/customer/get-incidents",
  },
  contact_us: "/admin/public/contact-us",
  on_call: {
    assign_member: "/assign-member",
    get_all_assign: "/get-all-assign",
    get_assign: "/get-assign",
  },
  dashboard: {
    get_metrics: "/dashboard/metrics",
    get_analytics: "/dashboard/analytics",
  },
  sla_policies: {
    create: "/sla-policies",
    get: "/sla-policies",
    analytics: "/sla-policies/analytics",
    getOne: "/sla-policies",
    update: "/sla-policies",
    delete: "/sla-policies",
  },
  silent_hours: {
    get: "/silent-hours",
    save: "/silent-hours",
  },
  pipelines: {
    list: "/pipelines",
    getOne: "/pipelines",                // GET /pipelines/:id
  },
  playbooks: {
    list: "/playbooks",
    create: "/playbooks",
    getOne: "/playbooks",                // GET /playbooks/:id
    update: "/playbooks",                // PUT /playbooks/:id
    publish: "/playbooks",               // POST /playbooks/:id/publish
    delete: "/playbooks",                // DELETE /playbooks/:id
    match: "/playbooks/match",
    suggest: "/playbooks/suggest",
    patterns: "/playbooks/patterns",
    stats: "/playbooks/stats",
    executions: "/playbooks/executions/list",
    executionDetail: "/playbooks/executions", // GET /playbooks/executions/:executionId
    execute: "/playbooks",               // POST /playbooks/:id/execute
    completeStep: "/playbooks/executions", // POST /playbooks/executions/:executionId/steps/:stepIndex/complete
    skipStep: "/playbooks/executions",   // POST /playbooks/executions/:executionId/steps/:stepIndex/skip
    selectAction: "/playbooks/executions", // POST /playbooks/executions/:executionId/action
    completeExecution: "/playbooks/executions", // POST /playbooks/executions/:executionId/complete
    cancelExecution: "/playbooks/executions", // POST /playbooks/executions/:executionId/cancel
  },
  guardrails: {
    list: "/guardrails",
    getOne: "/guardrails",               // GET /guardrails/:id
    create: "/guardrails",
    update: "/guardrails",               // PATCH /guardrails/:id
    delete: "/guardrails",               // DELETE /guardrails/:id
    evaluate: "/guardrails/evaluate",
    violations: "/guardrails/violations",
  },
  decisions: {
    list: "/decisions",
    log: "/decisions/log",
    getOne: "/decisions",                // GET /decisions/:id
    propose: "/decisions/propose",
    approve: "/decisions",               // PATCH /decisions/:id/approve
    block: "/decisions",                 // PATCH /decisions/:id/block
    executed: "/decisions",              // PATCH /decisions/:id/executed
    cancel: "/decisions",                // PATCH /decisions/:id/cancel
  },
  ezra: {
    analyse: "/ezra/analyse",
    analyses: "/ezra/analyses",
    analysis: "/ezra/analysis",           // GET /ezra/analysis/:incidentId
    report: "/ezra/report",
    learn: "/ezra/learn",
    patterns: "/ezra/patterns",
  },
  signals: {
    list: "/signals",
    stats: "/signals/stats",
    getOne: "/signals",                   // GET /signals/:id
    ingest: "/signals",                   // POST /signals
    bulkIngest: "/signals/bulk",          // POST /signals/bulk
    acknowledge: "/signals",              // PATCH /signals/:id/acknowledge
    resolve: "/signals",                  // PATCH /signals/:id/resolve
    suppress: "/signals",                 // PATCH /signals/:id/suppress
  },
  blast_radius: {
    list: "/blast-radius",
    calculate: "/blast-radius/calculate",
    riskSummary: "/blast-radius/risk-summary",
    getForTrigger: "/blast-radius/trigger",  // GET /blast-radius/trigger/:triggerId
    getOne: "/blast-radius",                 // GET /blast-radius/:id
  },
  service_map: {
    topology: "/service-map/topology",
    list: "/service-map",
    getOne: "/service-map",                  // GET /service-map/:id
    downstreamImpact: "/service-map",        // GET /service-map/:id/downstream-impact
    create: "/service-map",
    addDependency: "/service-map/dependencies",
    update: "/service-map",                  // PATCH /service-map/:id
    remove: "/service-map",                  // DELETE /service-map/:id
    removeDependency: "/service-map/dependencies", // DELETE /service-map/dependencies/:depId
  },
};
