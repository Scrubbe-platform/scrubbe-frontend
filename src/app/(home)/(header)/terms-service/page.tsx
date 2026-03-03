import React from "react";

const ScrubbeTermsOfService = () => {
  // Data structure for the Table of Contents and main content
  const sections = [
    {
      id: "agreement",
      title: "Agreement",
      content: (
        <>
          <p className="mb-4">
            These Terms of Service (&quot;Terms&quot;) govern the use of the
            Scrubbe Incident Management System (&quot;Service&quot;) and all
            accompanying software and policies as outlined in the Order Form.
            These Terms constitute a legally binding agreement between Scrubbe
            and you (&ldquo;Customer,&quot; &quot;you&quot;).
          </p>
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 1.1 Scope
            of Agreement
          </h4>
          <p>
            By creating an account, accessing, or using the Service, you agree
            to be bound by these Terms. If you are accepting these Terms on
            behalf of a company, organization, or other legal entity, you
            represent and warrant that you have the authority to bind that
            entity to these Terms.
          </p>
          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 1.2
            Modifications
          </h4>
          <p>
            Scrubbe reserves the right to modify these Terms as outlined in
            Section 19. Your continued use of the Service after any changes
            indicates your acceptance of the updated Terms.
          </p>
        </>
      ),
    },
    {
      id: "definitions",
      title: "Definitions",
      content: (
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong className="font-semibold">Customer Data:</strong> All data,
            content, and information submitted, uploaded, or generated in
            connection with your Service, including but not limited to
            incidents, logs, reports, and integrations.
          </li>
          <li>
            <strong className="font-semibold">User:</strong> An individual
            authorized by the Customer to access and use the Service under the
            Customer&apos;s account.
          </li>
          <li>
            <strong className="font-semibold">Order Form:</strong> A written or
            electronic document, including proposals or online checkout forms,
            specifying the subscription plan, fees, and additional terms
            applicable to the Customer&apos;s use of the Service.
          </li>
          <li>
            <strong className="font-semibold">Subprocessors:</strong>{" "}
            Third-party vendors or service providers engaged by Scrubbe to
            process Customer Data or support the Service.
          </li>
          <li>
            <strong className="font-semibold">SLA:</strong> Service Level
            Agreement, detailing uptime and support commitments, available
            exclusively to Enterprise plan subscribers.
          </li>
        </ul>
      ),
    },
    // The rest of the sections would follow a similar structure
    {
      id: "services",
      title: "Services",
      content: (
        <>
          <p className="mb-4">
            Scrubbe IMS is a Software-as-a-Service (SaaS) platform designed to
            enhance incident management and operational excellence. The Service
            includes, but is not limited to:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Real-time incident detection, logging, and response workflows;
            </li>
            <li>
              Seamless integrations with third-party systems, including GitHub,
              GitLab, AWS, Azure, and Slack;
            </li>
            <li>
              Comprehensive SLA tracking, advanced analytics, and postmortem
              reporting;
            </li>
            <li>
              API access, subject to fair use policies as outlined in the Order
              Form.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.1 Service
            Availability
          </h4>
          <p>
            The Service is accessible via the Internet at{" "}
            <a
              href="https://incidents.scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com
            </a>
            . Availability is subject to planned maintenance windows and force
            majeure events.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 3.2
            Modifications
          </h4>
          <p>
            Service descriptions, usage limits, and restrictions are detailed on
            our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Pricing Page
            </a>{" "}
            and in applicable Order Forms. Exceeding these limits may incur
            additional fees.
          </p>
        </>
      ),
    },
    {
      id: "accounts",
      title: "Accounts & Access",
      content: (
        <>
          <p className="mb-4">
            Customers are responsible for managing access to the Service and
            ensuring compliance with these Terms by all Users.
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Customer is responsible for all actions taken by its Users and
              must ensure only authorized individuals access the Service.
            </li>
            <li>
              Customer must configure role-based access controls (e.g., admin,
              analyst, engineer) to align with organizational needs.
            </li>
            <li>
              User sessions expire after an idle timeout period (default: 5
              minutes, configurable in account settings).
            </li>
            <li>
              Customer is responsible for securing account credentials, Single
              Sign-On (SSO), and Multi-Factor Authentication (MFA).
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 4.1 Account
            Security
          </h4>
          <p>
            Customers must implement strong passwords and enable MFA where
            available. Scrubbe is not liable for damages or losses resulting
            from Customer&apos;s failure to secure credentials.
          </p>
        </>
      ),
    },
    {
      id: "fees",
      title: "Fees & Payment",
      content: (
        <>
          {" "}
          <p className="mb-4">
            Fees for the Service are based on the Customer&apos;s selected
            subscription plan (Starter, Growth, Pro, or Enterprise).
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Payments are processed securely via Stripe or other approved
              payment processors.
            </li>
            <li>
              Fees are payable monthly or annually in advance and are
              non-refundable except as required by applicable law.
            </li>
            <li>
              Overages (e.g., exceeding user limits, data storage, or API call
              thresholds) will be billed in arrears as per the Order Form.
            </li>
            <li>
              Late payments (past 30 days) may result in Service suspension
              until payment is received.
            </li>
          </ul>
          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 5.1 Billing
            Disputes
          </h4>
          <p>
            Customer must notify Scrubbe of any billing disputes within 30 days
            of receiving an invoice. Disputes should be sent to{" "}
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
      id: "customer-data",
      title: "Customer Data",
      content: (
        <>
          <p className="mb-4">
            Fees for the Service are based on the Customer&apos;s selected
            subscription plan (Starter, Growth, Pro, or Enterprise).
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              <strong className="font-semibold">Ownership:</strong> Customer
              retains all rights, title, and interest in Customer Data,
              including intellectual property rights.
            </li>
            <li>
              <strong className="font-semibold">Licence to Scrubbe:</strong>{" "}
              Customer grants Scrubbe a worldwide, non-exclusive, limited
              license to host, process, transmit, and display Customer Data
              solely to provide and maintain the Service.
            </li>
            <li>
              <strong className="font-semibold">Responsibility:</strong>{" "}
              Customer warrants that it has the lawful right to submit Customer
              Data and will not upload regulated data (e.g., PCI, HIPAA, PHI)
              unless explicitly agreed in writing with Scrubbe.
            </li>
            <li>
              <strong className="font-semibold">Return & Deletion:</strong> Upon
              termination, Customer may export Customer Data within 30 days via
              provided tools. Thereafter, Scrubbe will delete Customer Data,
              except as required for legal retention purposes.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 6.1 Data
            Backup
          </h4>
          <p>
            Scrubbe maintains regular backups of Customer Data to ensure
            continuity. Customers are encouraged to maintain their own backups
            for additional redundancy.
          </p>
        </>
      ),
    },
    {
      id: "data-protection",
      title: "Data Protection & Privacy",
      content: (
        <>
          <p className="mb-4">
            Scrubbe is committed to protecting Customer Data in accordance with
            its{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>{" "}
            and Data Processing Agreement (DPA).
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Where applicable, the parties agree to the GDPR Standard
              Contractual Clauses for international data transfers.
            </li>
            <li>
              Subprocessors are listed at{" "}
              <a
                href="https://incidents.scrubbe.com/subprocessors"
                className="text-blue-600 hover:underline"
              >
                incidents.scrubbe.com/subprocessors
              </a>
              . Scrubbe will notify Customers of new critical subprocessors at
              least 14 days in advance.
            </li>
            <li>
              Customer is responsible for configuring data retention policies,
              access controls, and ensuring compliance with applicable data
              protection laws (e.g., GDPR, NDPR, PSPA, CCPA).
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 7.1 Data
            Subject Requests
          </h4>
          <p>
            Customers must handle data subject requests (e.g., access, deletion)
            directly. Scrubbe will assist as required under the DPA, subject to
            reasonable fees for excessive requests.
          </p>
        </>
      ),
    },
    {
      id: "security",
      title: "Security",
      content: (
        <>
          <p className="mb-4">
            Scrubbe maintains industry-standard security measures to protect
            Customer Data, including:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              TLS 1.2+ encryption for data in transit and AES-256 encryption for
              data at rest;
            </li>
            <li>Role-based access control (RBAC) for granular permissions;</li>
            <li>
              Multi-factor authentication (MFA) support for enhanced account
              security;
            </li>
            <li>Comprehensive logging and audit trails for monitoring;</li>
            <li>
              Regular penetration testing and vulnerability scans by third-party
              auditors.
            </li>
          </ul>
          <p className="mb-4">
            In the event of a data breach, Scrubbe will notify affected
            Customers without undue delay, in compliance with applicable laws.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 8.1
            Security Certifications
          </h4>
          <p>
            Scrubbe pursues certifications such as SOC 2 Type II and ISO 27001
            to demonstrate its commitment to security. Reports are available to
            Enterprise customers upon request.
          </p>
        </>
      ),
    },
    {
      id: "sla",
      title: "Service Level & Support",
      content: (
        <>
          <p className="mb-4">
            For Enterprise plan subscribers, Scrubbe provides the following
            Service Level Agreement (SLA) commitments:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Uptime: 99.9% monthly availability, excluding scheduled
              maintenance windows announced at least 48 hours in advance.
            </li>
            <li>
              Response Times: Priority 1 (P1) = 1 hour, P2 = 4 hours, P3 = 1
              business day, P4 = 2 business days.
            </li>
            <li>
              Remedies for SLA Breaches: Service credits as outlined in the SLA,
              proportional to the severity and duration of the breach.
            </li>
            <li>
              Support Channels: Available via email (
              <a
                href="mailto:support@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                support@scrubbe.com
              </a>
              ), live chat, and ticketing during business hours (24/7 for
              Enterprise plans).
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 9.1 Support
            Escalation
          </h4>
          <p>
            Customers may escalate urgent issues to a dedicated account manager
            for Enterprise plans. Contact details are provided in the Order
            Form.
          </p>
        </>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use",
      content: (
        <>
          <p className="mb-4">
            Customers and their Users agree not to engage in any of the
            following prohibited activities:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Using the Service in violation of applicable laws or regulations;
            </li>
            <li>
              Attempting to reverse-engineer, decompile, or derive the source
              code of the Service;
            </li>
            <li>
              Reselling, sublicensing, or sharing access to the Service outside
              the Customer&apos;s organization;
            </li>
            <li>
              Introducing malware, viruses, or other harmful code that could
              disrupt Service operations;
            </li>
            <li>
              Abusing API limits or integrations beyond fair use thresholds.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 10.1
            Enforcement
          </h4>
          <p>
            Scrubbe reserves the right to investigate and suspend accounts for
            violations of this Acceptable Use policy. Customers will be notified
            of any enforcement actions.
          </p>
        </>
      ),
    },
    {
      id: "third-party",
      title: "Third-Party Services & Integrations",
      content: (
        <>
          <p className="mb-4">
            Integrations with third-party services (e.g., Slack, GitHub, AWS)
            are optional and configured at the Customer&apos;s discretion.
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Use of third-party services is governed by their respective terms
              and policies, which Customers must review and accept.
            </li>
            <li>
              Scrubbe is not responsible for the performance, availability, or
              security of third-party services.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 11.1
            Integration Support
          </h4>
          <p>
            Scrubbe provides documentation and support for enabling
            integrations. Additional fees may apply for custom integration
            development.
          </p>
        </>
      ),
    },
    {
      id: "warranties",
      title: "Warranties & Disclaimers",
      content: (
        <>
          <p className="mb-4">
            Scrubbe warrants that the Service will be provided in a professional
            and workmanlike manner, consistent with industry standards.
          </p>
          <p className="mb-4">
            **&quot;EXCEPT AS EXPRESSLY PROVIDED HEREIN, THE SERVICE IS PROVIDED
            &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; SCRUBBE DISCLAIMS
            ALL OTHER WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
            LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT.&quot;**
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 12.1
            Disclaimer Scope
          </h4>
          <p>
            Scrubbe does not guarantee that the Service will meet all Customer
            requirements or that it will be uninterrupted or error-free.
          </p>
        </>
      ),
    },
    {
      id: "indemnification",
      title: "Indemnification",
      content: (
        <>
          <p className="mb-4">
            Customer agrees to indemnify, defend, and hold harmless Scrubbe, its
            affiliates, and their respective officers, directors, and employees
            against any claims, damages, or liabilities arising from:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Customer Data, including any intellectual property disputes;
            </li>
            <li>
              Customer&apos;s misuse of the Service or violation of these Terms;
            </li>
            <li>
              Customer&apos;s violation of applicable laws or third-party
              rights.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 13.1
            Indemnification Process
          </h4>
          <p>
            Scrubbe will notify Customer promptly of any claim requiring
            indemnification. Customer shall assume control of the defense,
            subject to Scrubbe&apos;s right to participate at its own expense.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: (
        <>
          <p className="mb-4">
            **SCRUBBE&apos;S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED
            TO THE SERVICE, WHETHER IN CONTRACT, TORT, OR OTHERWISE, IS LIMITED
            TO THE FEES PAID BY CUSTOMER IN THE 12 MONTHS PRECEDING THE CLAIM.**
          </p>
          <p className="mb-4">
            SCRUBBE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
            LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION, EVEN IF ADVISED
            OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="mb-4">The above limitations apply except for:</p>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Customer&apos;s payment obligations, indemnification obligations,
              or breaches of confidentiality.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 14.1
            Exceptions
          </h4>
          <p>
            The above limitations do not apply to Customer&apos;s payment
            obligations, indemnification obligations, or breaches of
            confidentiality.
          </p>
        </>
      ),
    },
    {
      id: "termination",
      title: "Term, Suspension & Termination",
      content: (
        <>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              <strong className="font-semibold">Term:</strong> These Terms
              remain in effect until terminated by either party.
            </li>
            <li>
              <strong className="font-semibold">
                Termination for Convenience:
              </strong>{" "}
              Either party may terminate the Service with 30 days&apos; written
              notice.
            </li>
            <li>
              <strong className="font-semibold">Termination for Cause:</strong>{" "}
              Either party may terminate if the other materially breaches these
              Terms and fails to cure the breach within 30 days of notice.
            </li>
            <li>
              <strong className="font-semibold">
                Data Retention Post-Termination:
              </strong>{" "}
              Upon termination, Customer may export Customer Data within 30-
              days. Thereafter, Scrubbe will delete Customer Data, except as
              required by law.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 15.1
            Suspension
          </h4>
          <p>
            Scrubbe may suspend the Service for non-payment, violation of
            Acceptable Use policies, or suspected security threats, with prior
            notice where feasible.
          </p>
        </>
      ),
    },
    {
      id: "compliance",
      title: "Compliance & Export Control",
      content: (
        <>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Customer represents that it is not located in a country subject to
              OFAC or EU sanctions and will not use the Service in violation of
              export controls.
            </li>
            <li>
              Customer is responsible for ensuring its use of the Service
              complies with all applicable local, national, and international
              laws.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 16.1 Export
            Compliance
          </h4>
          <p>
            Scrubbe may restrict access to the Service in certain jurisdictions
            to comply with export control regulations.
          </p>
        </>
      ),
    },
    {
      id: "audits",
      title: "Audits & Certifications",
      content: (
        <>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              Enterprise customers may request audit reports (e.g., SOC 2 Type
              II, ISO 27001) once available, subject to confidentiality
              agreements.
            </li>
            <li>
              Customers may request information on Scrubbe&apos;s security
              controls and subprocessors via{" "}
              <a
                href="mailto:contact@scrubbe.com"
                className="text-blue-600 hover:underline"
              >
                contact@scrubbe.com
              </a>
              .
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 17.1 Audit
            Process
          </h4>
          <p>
            Audit requests must be submitted in writing and may be subject to
            reasonable fees for extensive reviews.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law & Dispute Resolution",
      content: (
        <>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>
              <strong className="font-semibold">Governing Law:</strong> These
              Terms are governed by the laws of Delaware, USA, unless otherwise
              agreed in writing for UK or Nigeria-based contracts.
            </li>
            <li>
              <strong className="font-semibold">Dispute Resolution:</strong>{" "}
              Parties will first attempt informal resolution for 30 days. If
              unresolved, disputes will be settled by binding arbitration under
              AAA rules in Delaware, USA.
            </li>
            <li>
              <strong className="font-semibold">Injunctive Relief:</strong>{" "}
              Either party may seek injunctive relief in court for intellectual
              property violations or data misuse.
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 18.1
            Arbitration Process
          </h4>
          <p>
            Arbitration will be conducted by a single arbitrator, and the
            decision will be final and binding. Costs will be borne as
            determined by the arbitrator.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      title: "Changes to Terms",
      content: (
        <>
          <p className="mb-4">
            Scrubbe may update these Terms with 30 day&apos;s prior notice for
            material changes. Notices will be sent via email or posted on{" "}
            <a
              href="https://incidents.scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com
            </a>
            . Continued use of the Service after changes constitutes acceptance.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 19.1
            Notification Process
          </h4>
          <p>
            Customers are responsible for maintaining accurate contact
            information to receive notifications of changes to these Terms.
          </p>
        </>
      ),
    },
    {
      id: "version",
      title: "Version Control",
      content: (
        <>
          <p className="mb-4">
            This document is versioned to ensure transparency and track changes
            over time. The current version is v1.0, effective September 26,
            2025. Previous versions are archived and available upon request to
            Enterprise customers.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 20.1
            Version History
          </h4>
          <p>
            Version history and change logs can be requested by contacting{" "}
            <a
              href="mailto:contact@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              contact@scrubbe.com
            </a>
            .
          </p>
        </>
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
            Scrubbe IMS Terms of Service
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
          <div className="md:block hidden sticky top-[100px] h-screen col-span-3 bg-gray-50 border-r border-gray-200 p-6">
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
          <div className="col-span-9  md:px-4 text-gray-800">
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

export default ScrubbeTermsOfService;
