import React from "react";

const ScrubbePrivacyPolicy = () => {
  // Data structure for the Table of Contents and main content
  const sections = [
    {
      id: "scope-covers",
      title: "Scope & Who This Covers",
      number: 1,
      content: (
        <>
          <p className="mb-4">
            This Privacy Policy describes how Scrubbe (legal entity: Scrubbe
            Limited, registered at 456 Innovation Avenue, Lagos, Nigeria)
            collects, uses, discloses, and protects personal data in connection
            with the Scrubbe Incident Management System (&quot;Scrubbe
            IMS&quot;), &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;.
          </p>
          <p className="mb-4">
            If you are a customer (an organization using Scrubbe IMS), the
            relationship between you and Scrubbe regarding personal data is
            primarily governed by the Master Service Agreement and Data
            Processing Agreement (DPA) we execute with you. In many cases,
            customer determines the purposes and means for processing the
            content they upload; in those cases, the customer is the &quot;data
            controller&quot; and Scrubbe is the &quot;data processor.&quot;
            Where Scrubbe collects personal data directly (e.g., user account
            sign-up), Scrubbe acts as the controller.
          </p>
          <p className="mb-4">
            For questions or to exercise your rights, contact:{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>
            .
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 1.1 Policy
            Applies To
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Individuals who visit our corporate website (
              <a
                href="https://incidents.scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                incidents.scrubbe.com
              </a>{" "}
              and related domains).
            </li>
            <li>
              Users, admins, and other persons who use or access Scrubbe IMS
              (customers&apos; employees, contractors, MSP staff, third-party
              integrators).
            </li>
            <li>
              Prospective customers, trial users, interview candidates, and
              other contacts.
            </li>
          </ul>
          <p className="mt-4">
            It covers personal data collected via web forms, API requests,
            integrations, support requests, and other channels.
          </p>
        </>
      ),
    },
    {
      id: "summary-key-points",
      title: "Summary / Key Points",
      number: 2,
      content: (
        <>
          <p className="mb-4 font-semibold">
            In plain language, here&apos;s what you need to know:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              We use personal data to manage and authenticate access to Scrubbe
              IMS and process incident data to help your teams detect, manage,
              and resolve incidents.
            </li>
            <li>
              Customers typically control the content of incidents; Scrubbe
              processes that content to provide the Service.
            </li>
            <li>
              We use industry-standard security (TLS in transit, encryption at
              rest) and access controls.
            </li>
            <li>
              We share data with third-party service providers and subprocessors
              necessary to run the product, with contractual safeguards.
            </li>
            <li>
              You can request access, correction, deletion, or portability of
              your personal data. Contact{" "}
              <a
                href="mailto:support@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                support@scrubbe.com
              </a>
              .
            </li>
            <li>We do not sell personal data.</li>
            <li>
              We operate across international borders (e.g., between Africa and
              the U.S.); we use legal safeguards like EU Standard Contractual
              Clauses.
            </li>
            <li>
              We comply with accessibility standards to ensure our services are
              usable by all, including those with disabilities.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "personal-data-collect",
      title: "What Personal Data We Collect",
      number: 3,
      content: (
        <>
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.1 Account
            & Registration Data
          </h4>
          <p className="mb-4">
            Name, business email, business phone number, job title, business
            name, business address, country. User credentials (securely stored;
            passwords hashed). Billing Information: company billing address,
            federal tax ID, and limited payment card data is processed by Stripe
            and is not stored on Scrubbe systems except as tokens.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.2
            Workspace & Team Data
          </h4>
          <p>
            Workspace name, domain, number of users, user roles, invited users,
            workspace settings (e.g., idle timeout, SSO settings).
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.3
            Incident & Operational Data
          </h4>
          <p>
            Incident titles, descriptions, logs, attachments (screenshots,
            logs), timeline entries, incident owner, assignees, postmortem
            reports, comments, and messages posted as part of incident response.
            This content may include personal data (names, phone numbers,
            emails, or other identifiers) entered by customers or other users.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.4
            Integration Data & Event Data
          </h4>
          <p>
            Data obtained via integrations you enable (GitHub/GitLab events,
            cloud provider alerts from AWS/Azure/GCP, Slack messages posted in
            incident channels, monitoring alerts). The specific scope depends on
            the integration and permissions you grant. Customers are responsible
            for ensuring that third-party integrations comply with applicable
            data protection laws; Scrubbe provides tools (e.g., permission
            controls) to manage data shared with these integrations.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.5 Usage,
            Telemetry & Technical Data
          </h4>
          <p>
            IP address, device/browser type, operating system, login timestamps,
            API call logs, crash reports, feature usage metrics, cookies, and
            similar technologies.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.6
            Communications
          </h4>
          <p>
            Information you provide via support tickets, chat, email, or during
            sales conversations. These may include personal identifiers,
            business context, and troubleshooting logs.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.7 Payment
            & Merchant Data
          </h4>
          <p>
            We use Stripe to process payments. We may store payment metadata
            (invoices, transaction IDs, billing history). Card data is handled
            by Stripe under its security and privacy practices.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.8 Data
            from Third Parties
          </h4>
          <p>
            Information received from third-party integrations and partners, and
            data available from public sources when you connect those services.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.9 Special
            Categories of Data
          </h4>
          <p>
            We do not intentionally collect special category personal data
            (racial origin, health information, religious beliefs, etc.).
            However, incident content may occasionally include such data
            uploaded by customers. If such data is processed, we do so only
            under customer instructions and applicable legal requirements.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.10 Data
            Minimization and Purpose Limitation
          </h4>
          <p>
            We collect only the personal data necessary to provide Scrubbe IMS
            and fulfill the purposes outlined in this policy. We do not use
            personal data for purposes other than those specified, unless
            required by law or with your explicit consent.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use-data",
      title: "How We Use Personal Data",
      number: 4,
      content: (
        <>
          <p className="mb-4">
            We use personal data for the following purposes, with lawful bases
            under GDPR where applicable:
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 4.1 Core
            Service Purposes
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Create and administer user accounts and workspaces; authenticate
              and provide the service — Legal basis: **performance of
              contract.**
            </li>
            <li>
              Process incidents, attach timelines, assign owners, and execute
              integrations to deliver the IMS functionality — Legal basis:
              **performance of contract.**
            </li>
            <li>
              Billing, payment collection, invoicing, and fraud prevention —
              Legal basis: **performance of contract/legal obligation.**
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 4.2
            Operational & Improvement Purposes
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Monitor service performance, usage, analytics, and feature
              development; detect and prevent abuse and operational incidents —
              Legal basis: **legitimate interests** (improving
              service/security).
            </li>
            <li>
              Securing the service, investigating security incidents, and
              preventing fraud — Legal basis: **legitimate interests**
              (security).
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 4.3
            Marketing & Communications
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Sending product updates, marketing emails, newsletters — Legal
              basis: **consent** where required; otherwise **legitimate
              interests** (opt-out).
            </li>
            <li>
              Trial follow-up and onboarding communications — Legal basis:
              **performance of contract** or **legitimate interest** for
              prospective customers.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 4.4 Legal &
            Compliance
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Respond to lawful requests from law enforcement or legal process,
              enforce terms of service; maintain records for tax and regulatory
              compliance — Legal basis: **legal obligations; legitimate
              interests.**
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 4.5
            Aggregation & Anonymization
          </h4>
          <p>
            Use de-identified or aggregated metrics for research and business
            analytics. Aggregated data cannot reasonably be used to re-identify
            individuals.
          </p>
        </>
      ),
    },
    {
      id: "data-sharing-recipients",
      title: "Data Sharing & Recipients",
      number: 5,
      content: (
        <>
          <p className="mb-4">
            We disclose personal data only as described below and only to the
            extent necessary:
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 5.1
            Subprocessors & Service Providers
          </h4>
          <p className="mb-2 font-semibold">Examples include:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Cloud hosting & infrastructure: AWS, Azure, Google Cloud.</li>
            <li>Payment processing: Stripe.</li>
            <li>Email communications: Customer.io, SendGrid.</li>
            <li>SMS providers: Twilio (for SMS alerts).</li>
            <li>Customer support: Intercom, Zendesk.</li>
            <li>
              Analytics & monitoring: Google Analytics, Sentry (telemetry and
              error tracking).
            </li>
            <li>CI/CD/marketplace connectors: GitHub, GitLab.</li>
          </ul>
          <p className="mt-4">
            We maintain an up-to-date list of subprocessors at{" "}
            <a
              href="https://incidents.scrubbe.com/subprocessors"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com/subprocessors
            </a>
            . We require subprocessors to maintain the same level of protection
            as described in this Privacy Policy and the Data Processing
            Agreement.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 5.2
            Customers & Other Users
          </h4>
          <p>
            Incident content and workspace data are visible to other users in
            the same workspace and to the admin(s) of the customer organization.
            The customer controls who has access.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 5.3 Legal
            Requests
          </h4>
          <p>
            We may disclose data in response to valid legal process (court
            order, subpoena), to comply with laws, to enforce our terms, or to
            protect our rights, privacy, security, or property. We will notify
            customers of requests relating to their data unless prohibited.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 5.4
            Business Transfers
          </h4>
          <p>
            If Scrubbe is involved in a merger, acquisition, or sale of assets,
            personal data may be transferred as part of that transaction. We
            will notify affected customers and provide choices as required by
            law.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 5.5
            Customer Responsibilities
          </h4>
          <p>
            Customer remains responsible for ensuring that incident data they
            upload does not include unnecessary personal data or special
            categories of data unless strictly required. Customers must
            configure third-party integrations responsibly (e.g., reviewing the
            data that each service provider provides, permission settings, data
            retention controls) to support compliance.
          </p>
        </>
      ),
    },
    {
      id: "international-transfers",
      title: "International Transfers",
      number: 6,
      content: (
        <>
          <p className="mb-4">
            Scrubbe operates globally: personal data may be transferred to, and
            stored in, countries outside your country of residence (including
            the United States and countries without an adequacy decision).
          </p>
          <p className="mb-4 font-semibold">
            When transferring personal data from the EEA/UK to jurisdictions
            without an adequacy decision, we use appropriate safeguards such as:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Standard Contractual Clauses (SCCs) adopted by the European
              Commission or other recognized bodies, as required.
            </li>
            <li>Binding corporate rules where applicable.</li>
            <li>Other lawful transfer mechanisms as required.</li>
            <li>
              We will provide copies or summaries of safeguards on request
              (contact{" "}
              <a
                href="mailto:support@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                support@scrubbe.com
              </a>
              ).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "retention-deletion",
      title: "Retention & Deletion",
      number: 7,
      content: (
        <>
          <p className="mb-4">
            We retain personal data only as long as necessary to provide the
            service, comply with legal obligations, resolve disputes, and
            enforce agreements. Typical retention windows (configurable per
            enterprise contract) are:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Account & billing records: retained for tax & accounting purposes
              — typically 7 years (or as required by local law).
            </li>
            <li>
              Incident logs & timelines: default retention 3 years; configurable
              by customers (enterprise plans can specify longer or shorter).
              Post-termination deletion of incident content; deletion requests
              subject to contractual obligations and legal requirements.
            </li>
            <li>
              Support tickets & communications: 2–5 years depending on legal
              needs.
            </li>
            <li>
              Backups: retained for disaster recovery for up to 90 days in
              encrypted backups; backups are overwritten per schedule.
            </li>
          </ul>
          <p className="mt-4">
            When an account is deleted, we will remove active data within 30-90
            days, subject to legal holds, billing obligations, and residual
            backups. Please consult your DPA for exact retention commitments for
            enterprise customers.
          </p>
        </>
      ),
    },
    {
      id: "data-subject-rights",
      title: "Data Subject Rights",
      number: 8,
      content: (
        <>
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 8.1 For EU
            & UK Residents (GDPR)
          </h4>
          <p className="mb-2 font-semibold">You have the right to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Right of access (Article 15) — request a copy of personal data.
            </li>
            <li>Right to rectification (Article 16).</li>
            <li>
              Right to erasure (Article 17) — subject to exceptions (e.g., legal
              retention obligations).
            </li>
            <li>Right to restriction of processing (Article 18).</li>
            <li>Right to object to processing (Article 21).</li>
            <li>Right to data portability (Article 20).</li>
            <li>
              Right to withdraw consent (where processing is based on consent).
            </li>
          </ul>
          <p className="mt-2">
            Submit requests to{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>
            . We may require identity verification. We will respond within 30
            days or extended 90 days where permitted. We will inform you if we
            need more time.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 8.2 For
            California Residents (CCPA/CPRA)
          </h4>
          <p className="mb-2 font-semibold">California residents have the:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Right to know what personal data is collected, disclosed, and
              sold.
            </li>
            <li>Right to request deletion of personal data.</li>
            <li>
              Right to opt out of sale of personal data (we do not sell personal
              data).
            </li>
            <li>Right to non-discrimination for exercising privacy rights.</li>
          </ul>
          <p className="mt-2">
            To submit a verifiable request, contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            with &quot;CCPA Request&quot; in the subject line.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 8.3 For
            Other Jurisdictions (Nigeria NDPR, Kenya DPA, South Africa POPIA)
          </h4>
          <p>
            We will comply with local data protection obligations. Data subject
            rights vary by jurisdiction; contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            for assistance.
          </p>
        </>
      ),
    },
    {
      id: "how-to-make-request",
      title: "How to Make a Request",
      number: 9,
      content: (
        <>
          <p className="mb-4">
            To exercise your rights, use the form below or send your request to{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            with:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong className="font-semibold">
                Request in the subject line:
              </strong>{" "}
              &quot;Data Request&quot; in the subject.
            </li>
            <li>
              <strong className="font-semibold">
                A clear description of the request:
              </strong>{" "}
              (access, deletion, portability, correction).
            </li>
            <li>
              <strong className="font-semibold">Verification:</strong> Include
              full name, email, workspace name, description of request,
              preferred outcome, and request for identity verification (photo
              ID, verification code sent to admin email to prevent fraudulent
              requests).
            </li>
          </ul>
          <p className="mt-4">
            We will acknowledge receipt within 5 business days and provide a
            decision within the legal timeframe.
          </p>
          <button className="mt-4 bg-scrubbe-green hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
            Submit a request
          </button>
          <p className="mt-4 text-sm text-gray-500">
            We will comply with local data protection obligations. Data subject
            rights vary by jurisdiction; contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            for assistance.
          </p>
        </>
      ),
    },
    {
      id: "cookies-tracking",
      title: "Cookies & Tracking Technologies",
      number: 10,
      content: (
        <>
          <p className="mb-4">
            We use cookies and similar technologies on our website. Categories:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong className="font-semibold">
                Essential cookies (required):
              </strong>{" "}
              session cookies, authentication tokens, security cookies (cannot
              be disabled as they are necessary for the service).
            </li>
            <li>
              <strong className="font-semibold">Functional cookies:</strong>{" "}
              preferences, UI settings.
            </li>
            <li>
              <strong className="font-semibold">Analytics:</strong> Google
              Analytics, Sentry — used to understand site usage. Opt-out options
              provided.
            </li>
            <li>
              <strong className="font-semibold">Marketing cookies:</strong> used
              for remarketing, advertising (if used). You can opt out via cookie
              settings.
            </li>
          </ul>
          <p className="mt-4">
            Cookie list & management: see our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Cookie Policy
            </a>
            . Users can manage cookie preferences through the cookie banner and
            browser settings.
          </p>
        </>
      ),
    },
    {
      id: "security-measures",
      title: "Security Measures",
      number: 11,
      content: (
        <>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to
            protect personal data:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Encryption: TLS 1.2+ in transit; AES-256 encryption at rest.
            </li>
            <li>
              Access Controls: Role-based access control (RBAC), least
              privilege, strong password policies, support for MFA/SAML/SSO.
            </li>
            <li>
              Authentication: Support for Multi-factor authentication (MFA) for
              admin users.
            </li>
            <li>
              Logging & Monitoring: Session timeouts (default: 5 minutes,
              configurable), logs for security monitoring.
            </li>
            <li>
              Backup & disaster recovery: Encrypted backups, routine restore
              testing.
            </li>
            <li>
              Vulnerability Management: Regular vulnerability scanning, patch
              management, periodic penetration testing by third-party security
              firms.
            </li>
            <li>
              Confidentiality: Employees are subject to specific privacy and
              security obligations.
            </li>
            <li>
              Subprocessor controls: Contractual security obligations and right
              to audit for critical subprocessors.
            </li>
            <li>
              Certifications: We pursue certifications such as **SOC 2 Type II,
              ISO 27001**, and **ISO 27017**.
            </li>
            <li>
              Vendor Compliance: We conduct regular third-party audits to ensure
              compliance with security best practices.
            </li>
          </ul>
          <p className="mt-4">
            We cannot guarantee 100% security; if you have specific compliance
            requirements (PCI, HIPAA, etc.), contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            to discuss compliant deployment options and contractual terms.
          </p>
        </>
      ),
    },
    {
      id: "data-breach-response",
      title: "Data Breach Response & Notification",
      number: 12,
      content: (
        <>
          <p className="mb-4 font-semibold">
            If Scrubbe becomes aware of a security incident that materially
            affects personal data, we will:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Contain and remediate the incident.</li>
            <li>
              **Notify affected customers and data subjects without undue
              delay** and, where required by law, within applicable regulatory
              timelines (e.g., within 72 hours for GDPR significant breaches).
            </li>
            <li>
              Provide reasonable details about the nature of the incident,
              measured taken, and recommended next steps.
            </li>
          </ul>
          <p className="mt-4">
            Customers must notify us promptly at{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            if they suspect a security incident relating to their workspace.
          </p>
        </>
      ),
    },
    {
      id: "law-enforcement-requests",
      title: "Law Enforcement & Government Requests",
      number: 13,
      content: (
        <>
          <p className="mb-4">
            We may disclose information in response to lawful requests by public
            authorities (e.g., court orders, subpoenas) to the extent required
            by law. Where permitted, we will attempt to notify the affected
            customer prior to disclosure to allow them to object to the request.
          </p>
          <p className="mb-4">
            For subpoenas and law enforcement requests, please forward to{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>
            .
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 13.1
            Transparency Reports
          </h4>
          <p>
            We are committed to transparency regarding government requests for
            data. Where permitted by law, we publish annual transparency reports
            summarizing the number and type of requests received, available at{" "}
            <a
              href="https://incidents.scrubbe.com/transparency"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com/transparency
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "minors-children",
      title: "Minors & Children",
      number: 14,
      content: (
        <p>
          Scrubbe IMS is not intended for persons under 16. We do not knowingly
          collect personal data from children under 16. If we learn we have
          collected such data, we will delete it as required.
        </p>
      ),
    },
    {
      id: "automated-decision",
      title: "Automated Decision-Making / Profiling",
      number: 15,
      content: (
        <>
          <p className="mb-4">
            We do not perform automated decision-making that produces legal
            effects concerning individuals or similarly significantly affects
            individuals. We may use aggregated telemetry and machine learning to
            improve service performance, detect fraud, and prioritize support
            tickets, but all individual actions and decisions are based on
            anonymized or aggregated data. ML models are regularly audited to
            ensure compliance with our data protection policies and provide
            human control over all automated decisions.
          </p>
        </>
      ),
    },
    {
      id: "subprocessors-vendor-list",
      title: "Subprocessors & Vendor List",
      number: 16,
      content: (
        <>
          <p className="mb-4">
            We maintain and publish the current list of subprocessors at{" "}
            <a
              href="https://incidents.scrubbe.com/subprocessors"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com/subprocessors
            </a>
            .
          </p>
          <p className="mb-2 font-semibold">Typical subprocessors include:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Cloud hosting providers: AWS, Azure, Google Cloud.</li>
            <li>Payment processors: Stripe.</li>
            <li>Email services: SendGrid.</li>
            <li>SMS providers: Twilio.</li>
            <li>CDN: Cloudflare.</li>
            <li>Logging & Usage Analytics: Sentry.</li>
            <li>Customer support: Intercom.</li>
            <li>CI/CD/marketplace connectors: GitHub, GitLab.</li>
          </ul>
          <p className="mt-4">
            We notify customers of new critical subprocessors in advance and
            provide an opportunity to object in accordance with contract terms.
          </p>
        </>
      ),
    },
    {
      id: "dpa-enterprise",
      title: "Data Processing Agreement (DPA) & Enterprise Controls",
      number: 17,
      content: (
        <>
          <p className="mb-4">
            For enterprise customers, Scrubbe offers a DPA that specifies:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Roles and responsibilities (customer = controller; Scrubbe =
              processor).
            </li>
            <li>Data categories, processing details, and subprocessors.</li>
            <li>
              Scrubbe&apos;s processor obligations, data subject rights,
              international transfer mechanisms, retention periods, and deletion
              obligations.
            </li>
          </ul>
          <p className="mt-4">
            Contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            to request a DPA or specific compliance documentation (e.g.,
            certifications, audit reports).
          </p>
        </>
      ),
    },
    {
      id: "international-compliance",
      title: "International Compliance & Legal Laws",
      number: 18,
      content: (
        <>
          <p className="mb-4">
            Scrubbe aims to comply with applicable data protection laws,
            including GDPR (EU/EEA/UK), CCPA/CPRA (California), Nigeria&apos;s
            NDPR, Kenya&apos;s Data Protection Law, South Africa&apos;s POPIA,
            Brazil&apos;s LGPD, India&apos;s DPDP, and other relevant legal and
            regulatory requirements. We incorporate specific data protection
            requirements will be addressed in customer agreements. We
            continuously monitor evolving regulations to ensure ongoing
            compliance.
          </p>
        </>
      ),
    },
    {
      id: "changes-policy",
      title: "Changes to This Privacy Policy",
      number: 19,
      content: (
        <>
          <p className="mb-4">
            We may update this Privacy Policy to reflect changes in our
            processing activities or legal requirements. We will provide 30
            days&apos; prior notice for material changes, communicated via
            platform announcements, or by email or dashboard notification.
            Material changes will be communicated in advance where required by
            law.
          </p>
        </>
      ),
    },
    {
      id: "contact-enforcement",
      title: "Contact & Enforcement",
      number: 20,
      content: (
        <>
          <p className="mb-4">
            If you have questions, complaints, or want to exercise your rights,
            contact:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Email:{" "}
              <a
                href="mailto:support@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                support@scrubbe.com
              </a>
            </li>
            <li>
              Mailing Address: Scrubbe Limited, 456 Innovation Avenue, Lagos,
              Nigeria
            </li>
          </ul>
          <p className="mt-4">
            If you feel we have not fully addressed your concern or violated
            local data protection law have been violated, you may contact your
            local supervisory authority. We will cooperate with any lawful
            requests and respond to complaints.
          </p>
        </>
      ),
    },
    {
      id: "additional-legal-notices",
      title: "Additional Legal Notices",
      number: 21,
      content: (
        <>
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 21.1
            General Legal Notices
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              No sale of personal data: We do not sell personal data as defined
              under the CCPA.
            </li>
            <li>
              Third-party links: Our websites may link to third-party sites; we
              are not responsible for their privacy practices.
            </li>
            <li>
              Contact for legal requests: For subpoenas and law enforcement
              requests, please forward to{" "}
              <a
                href="mailto:support@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                support@scrubbe.com
              </a>
              .
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 21.2
            California Consumer Privacy Act (CCPA)
          </h4>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              No sale of personal data: We do not sell personal data as defined
              under the CCPA.
            </li>
            <li>
              Third-party links: Our websites may link to third-party sites; we
              are not responsible for their privacy practices.
            </li>
            <li>
              Contact for legal requests: For subpoenas and law enforcement
              requests, please forward to{" "}
              <a
                href="mailto:support@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                support@scrubbe.com
              </a>
              .
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-to-request",
      title: "How to Request Copies and Exercise Rights",
      number: 22,
      content: (
        <>
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 22.1
            Request Process
          </h4>
          <p className="mb-4">
            Use the form below or email{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            with **&quot;Data Request&quot;** in the subject.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Include: full name, email, workspace name, description of request,
              preferred outcome.
            </li>
            <li>
              We may request identity verification (photo ID, verification code
              sent to admin email).
            </li>
            <li>
              We will acknowledge receipt within 5 business days and respond
              substantively within applicable legal timeframes (typically 30
              calendar days).
            </li>
          </ul>
          <button className="mt-4 bg-scrubbe-green hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
            Submit a request
          </button>
        </>
      ),
    },
    {
      id: "appendix-retention",
      title: "Appendix – Sample Retention Defaults",
      number: 23,
      content: (
        <>
          <p className="mb-4">
            These are sample defaults. Enterprise customers may set custom
            values in the contract.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Incident content: 3 years (default) — configurable.</li>
            <li>Audit logs: 7 years (default), required for 3 years.</li>
            <li>Billing & invoices: 7 years.</li>
            <li>Backups: rolling, up to 90 days.</li>
            <li>Support tickets: 2 years.</li>
          </ul>
        </>
      ),
    },
    {
      id: "accessibility-compliance",
      title: "Accessibility Compliance",
      number: 24,
      content: (
        <>
          <p className="mb-4">
            Scrubbe is committed to ensuring our website and services, including
            this Privacy Policy and the data request form, comply with Web
            Content Accessibility Guidelines (WCAG) 2.1 to support users with
            disabilities. If you encounter accessibility issues, please contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "final-notes",
      title: "Final Notes & Recommended Next Steps for Scrubbe",
      number: 25,
      content: (
        <>
          <p className="mb-4 font-semibold">
            For Scrubbe founders and operators:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Publish this Privacy Policy with replaced placeholders and a link
              in your site footer or at{" "}
              <a
                href="https://incidents.scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                incidents.scrubbe.com
              </a>
              .
            </li>
            <li>
              Publish a clear{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Cookie Policy
              </a>{" "}
              and a{" "}
              <a
                href="https://incidents.scrubbe.com/subprocessors"
                className="text-blue-600 hover:underline"
              >
                Subprocessors list page
              </a>
              .
            </li>
            <li>
              Create a{" "}
              <a
                href="https://incidents.scrubbe.com/transparency"
                className="text-blue-600 hover:underline"
              >
                Transparency Report page
              </a>{" "}
              to summarize government data requests annually.
            </li>
            <li>
              Provide a simple portal (or email) for data subject requests;
              enterprise customers should be able to request and view all their
              data.
            </li>
            <li>
              Keep a living document (internal playbook) that explains how to
              handle delete requests, legal holds, and incident notifications.
            </li>
            <li>
              Have a lawyer on-call to ensure local compliance (Nigeria, South
              Africa, Kenya, UK, US, Brazil, India) and to produce a DPA
              template for customers.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "legal-disclaimer",
      title: "Legal Disclaimer",
      number: 26,
      content: (
        <p>
          This Privacy Policy is provided for informational purposes and is not
          legal advice. You should consult qualified legal counsel to tailor
          this policy to your jurisdiction and business operations and to ensure
          compliance with applicable laws.
        </p>
      ),
    },
  ];

  // Helper for consistent section header styling
  const SectionHeader = ({
    id,
    number,
    title,
  }: {
    id: string;
    number: number;
    title: string;
  }) => (
    <h2
      id={id}
      className={`text-2xl font-bold p-4 pl-6 text-white bg-[#1F553E]`}
    >
      {number}. {title}
    </h2>
  );

  return (
    <div className="bg-[#00263D] min-h-screen px-4  md:px-8 py-[10rem] font-sans overflow-clip">
      <style>{`
        /* Custom colors based on the screenshots */
        .bg-scrubbe-dark { background-color: #2c3e50; }
        .bg-scrubbe-green { background-color: #38761d; }
        .text-scrubbe-green { color: #38761d; }
      `}</style>
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center flex flex-col justify-center items-center mb-10 bg-gradient-to-r from-[#5A519F] to-[#8D4C9A] rounded-[30px] p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Scrubbe IMS Privacy Policy{" "}
          </h1>

          <p className="text-lg text-white">
            Effective Date : September 26, 2025
          </p>
          <p className="text-lg text-white">
            Last Updated : September 26, 2025
          </p>
        </div>
        {/* Header Block */}

        {/* Main Content Grid */}
        <div className="w-full min-h-[2000px] mx-auto md:grid grid-cols-12 gap-8 bg-white p-0 rounded-b-lg shadow-xl">
          {/* Left Column - Table of Contents */}
          <div className="md:block hidden sticky top-[100px] h-[calc(100vh+300px)] col-span-3 bg-gray-50 border-r border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Table of contents
            </h2>
            <nav className="text-base space-y-1">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block py-1 text-gray-700 hover:text-scrubbe-green transition-colors ${
                    index === 0 ? "font-bold text-scrubbe-green" : ""
                  }`} // Highlight first item like in screenshot
                >
                  {index + 1}. {section.title}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Column - Terms Content */}
          <div className="col-span-9 md:px-4 text-gray-800 overflow-auto">
            {sections.map((section, index) => (
              <div key={section.id} className="mb-8">
                <SectionHeader
                  id={section.id}
                  number={index + 1}
                  title={section.title}
                />
                <div className="p-4 bg-white border border-t-0">
                  {section.content}
                </div>
              </div>
            ))}

            {/* Contact Section - Manually styled for the download button */}
            <SectionHeader id="contact" number={21} title="Contact" />
            <div className="p-4 bg-white border border-t-0 mb-8 flex flex-col items-center text-center">
              <p className="mb-1">
                <strong className="font-semibold">Email:</strong>{" "}
                <a
                  href="mailto:contact@scrubbe.com"
                  className="text-blue-600 hover:underline"
                >
                  contact@scrubbe.com
                </a>{" "}
                | <strong className="font-semibold">Support:</strong>{" "}
                <a
                  href="mailto:support@scrubbe.com"
                  className="text-blue-600 hover:underline"
                >
                  support@scrubbe.com
                </a>
              </p>
              <p className="mb-4">
                <strong className="font-semibold">Website:</strong>{" "}
                <a
                  href="https://incidents.scrubbe.com"
                  className="text-blue-600 hover:underline"
                >
                  incidents.scrubbe.com
                </a>
              </p>
              <button className="flex items-center justify-center bg-scrubbe-green hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l1.293-1.293a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v9a1 1 0 11-2 0V3a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Download PDF Version
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrubbePrivacyPolicy;
