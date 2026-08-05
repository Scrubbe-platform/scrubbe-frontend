"use client";
import { CalendarRange, Clock, ShieldIcon, Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────

const P = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`text-[14px] text-gray-600 leading-relaxed mb-3 ${className}`}>
    {children}
  </p>
);
const Bold = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold text-gray-800">{children}</strong>
);
const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2 text-[14px] text-gray-600 leading-relaxed">
    <span className="text-gray-400 mt-1 shrink-0">›</span>
    <span>{children}</span>
  </li>
);
const Ul = ({ children }: { children: React.ReactNode }) => (
  <ul className="space-y-2 my-3">{children}</ul>
);
const Note = ({
  color,
  title,
  children,
}: {
  color: "green" | "amber" | "red" | "blue";
  title: string;
  children: React.ReactNode;
}) => {
  const cls = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    blue: "bg-sky-50 border-sky-200 text-sky-800",
  }[color];
  const tcls = {
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
    blue: "text-sky-700",
  }[color];
  return (
    <div
      className={`border rounded-lg p-4 my-4 text-[13px] leading-relaxed ${cls}`}
    >
      <p
        className={`font-bold text-[11px] uppercase tracking-wider mb-1.5 ${tcls}`}
      >
        {title}
      </p>
      {children}
    </div>
  );
};
const DarkTable = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="bg-gray-800 text-white">
          {headers.map((h) => (
            <th
              key={h}
              className="px-4 py-2.5 text-left font-semibold border border-gray-600"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border border-gray-200">
            {row.map((cell, j) => (
              <td
                key={j}
                className={`px-4 py-3 text-gray-600 leading-relaxed ${j < row.length - 1 ? "border-r border-gray-200" : ""}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
const DefTable = ({
  rows,
  dark = false,
}: {
  rows: [string, React.ReactNode][];
  dark?: boolean;
}) => (
  <table className="w-full border-collapse text-[13px] my-4">
    <tbody>
      {rows.map(([term, def]) => (
        <tr key={term} className="border border-gray-200">
          <td
            className={`w-[180px] px-4 py-3 font-semibold align-top border-r border-gray-200 whitespace-pre-wrap text-[13px] ${dark ? "bg-gray-800 text-emerald-400" : "bg-gray-50 text-gray-800"}`}
          >
            {term}
          </td>
          <td
            className={`px-4 py-3 leading-relaxed ${dark ? "bg-gray-800 text-gray-300" : "text-gray-600"}`}
          >
            {def}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
const Badge = ({
  color,
  children,
}: {
  color: "green" | "amber" | "red" | "blue" | "purple";
  children: React.ReactNode;
}) => {
  const cls = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100  text-amber-700  border-amber-200",
    red: "bg-red-100    text-red-700    border-red-200",
    blue: "bg-sky-100    text-sky-700    border-sky-200",
    purple: "bg-violet-100 text-violet-700 border-violet-200",
  }[color];
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cls}`}>
      {children}
    </span>
  );
};

// ── Rights card ───────────────────────────────────────────────────
const RightCard = ({
  art,
  title,
  desc,
}: {
  art: string;
  title: string;
  desc: string;
}) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-white">
    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
      {art}
    </p>
    <p className="text-[13px] font-bold text-gray-800 mb-1">{title}</p>
    <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

// ── Retention timeline item ───────────────────────────────────────
const RetentionItem = ({
  period,
  color,
  title,
  desc,
}: {
  period: string;
  color: string;
  title: string;
  desc: string;
}) => (
  <div className="flex gap-4 mb-5">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${color}`} />
      <div className="w-px flex-1 bg-gray-200 mt-1" />
    </div>
    <div className="pb-2">
      <p
        className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${color.replace("bg-", "text-")}`}
      >
        {period}
      </p>
      <p className="text-[13px] font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// ── Sections ──────────────────────────────────────────────────────
const SECTIONS: { id: string; title: string; content: React.ReactNode }[] = [
  {
    id: "overview",
    title: "Overview & Scope",
    content: (
      <>
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              title: "Data you own",
              body: "Customer incident and telemetry data remains yours. We process it only on your instructions.",
              tag: "CCPA/CPRA Service Provider",
              tagColor: "green" as const,
            },
            {
              title: "Where it lives",
              body: "Processed and stored in the United States by default. Enterprise residency options available.",
              tag: "U.S. default",
              tagColor: "green" as const,
            },
            {
              title: "How long we keep it",
              body: "Account data is deleted within 90 days of termination. Audit logs retained for 7 years.",
              tag: "30-day export window",
              tagColor: "amber" as const,
            },
            {
              title: "Your rights",
              body: "Know, correct, delete, opt out of sale/sharing, and non-discrimination — respond within 45 days.",
              tag: "CCPA/CPRA Consumer Rights",
              tagColor: "green" as const,
            },
            {
              title: "Breach notification",
              body: "We notify affected customers within 72 hours of confirming a breach affecting your personal data.",
              tag: "72-hr notification commitment",
              tagColor: "green" as const,
            },
            {
              title: "No selling of data",
              body: "We never sell, rent, or trade personal data to third parties for marketing purposes.",
              tag: "No sale or sharing (CCPA)",
              tagColor: "green" as const,
            },
          ].map((c) => (
            <div
              key={c.title}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <p className="text-[13px] font-bold text-gray-800 mb-1">
                {c.title}
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed mb-2">
                {c.body}
              </p>
              <Badge color={c.tagColor}>{c.tag}</Badge>
            </div>
          ))}
        </div>
        <P>
          This Privacy Policy applies to all personal data processed by Scrubbe
          Inc. in connection with:
        </P>
        <Ul>
          <Li>
            <Bold>The Platform:</Bold> Personal data of Authorized Users who
            access the Scrubbe incident intelligence platform under a
            subscription.
          </Li>
          <Li>
            <Bold>The Website:</Bold> Personal data of visitors to
            www.scrubbe.com, visitors to and any associated marketing pages or
            documentation portals.
          </Li>
          <Li>
            <Bold>Sales &amp; Support:</Bold> Personal data collected during
            pre-sales conversations, customer onboarding, technical support
            engagements, and account management.
          </Li>
          <Li>
            <Bold>Customer Data (as processor):</Bold> Telemetry, alert data,
            log payloads, and other operational data that Customers submit to
            the Platform. We process this as a data processor acting on Customer
            instructions — not as a controller.
          </Li>
        </Ul>
        <P>
          This Policy does not govern data processed by third-party services
          that you may connect to the Platform via Connectors (e.g. PagerDuty,
          Datadog, AWS). You should review the privacy policies of those
          services separately.
        </P>
        <Note color="blue" title="Controller vs Processor">
          <p className="text-[13px] text-sky-700 leading-relaxed mb-1">
            For personal data in Customer-submitted incident payloads and
            telemetry, Scrubbe acts as a Data Processor (a "Service Provider"
            under the CCPA/CPRA) and the Customer is the Data Controller (a
            "Business" under the CCPA/CPRA).
          </p>
          <p className="text-[13px] text-sky-700 leading-relaxed">
            Our Data Processing Agreement ("DPA") governs that relationship.
            This Policy primarily describes our activities as a data controller
            in our own right.
          </p>
        </Note>
      </>
    ),
  },
  {
    id: "data-controller",
    title: "Data Controller",
    content: (
      <>
        <P>
          The data controller responsible for personal data processed under this
          Policy is:
        </P>
        <DefTable
          rows={[
            ["Company", "Scrubbe Inc."],
            ["Jurisdiction", "United States"],
            [
              "Website",
              <a
                href="https://www.scrubbe.com"
                className="text-emerald-600 hover:underline"
              >
                www.scrubbe.com
              </a>,
            ],
            [
              "Privacy contact",
              <a
                href="mailto:privacy@scrubbe.com"
                className="text-emerald-600 hover:underline"
              >
                privacy@scrubbe.com
              </a>,
            ],
            [
              "Primary\nregulators",
              "Federal Trade Commission (FTC) for general consumer protection; California Privacy Protection Agency (CPPA) and California Attorney General for CCPA/CPRA enforcement; other state Attorneys General as applicable under their respective state privacy laws.",
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data We Collect",
    content: (
      <>
        <P>
          We collect personal data in the following categories depending on how
          you interact with Scrubbe:
        </P>
        <DarkTable
          headers={["Category", "Examples", "Source"]}
          rows={[
            [
              "Account & identity",
              "Name, work email address, job title, organization name, profile picture",
              "Provided by you or your employer at onboarding",
            ],
            [
              "Authentication data",
              "Hashed passwords, SSO tokens, MFA state, session tokens",
              "Generated at login; never stored in plaintext",
            ],
            [
              "Usage & activity",
              "Feature interactions, dashboard views, playbook configurations, incident approvals/rejections, API calls",
              "Automatically collected via platform instrumentation",
            ],
            [
              "Audit events",
              "User ID, action type, timestamp, IP address, policy version evaluated, outcome",
              "Automatically generated for every state transition",
            ],
            [
              "Device & technical",
              "IP address, browser type and version, operating system, viewport size, time zone",
              "Automatically collected on web access",
            ],
            [
              "Communications",
              "Support tickets, email correspondence, sales call notes, product feedback",
              "Provided by you directly",
            ],
            [
              "Connector credentials",
              "API keys, OAuth tokens, service account identifiers for third-party integrations",
              "Provided by Customer Authorized Users; stored encrypted",
            ],
            [
              "Marketing & website",
              "Name, work email, company, interest area from contact or demo request forms; cookie identifiers",
              "Provided by you on the website",
            ],
            [
              "Payment data",
              "Billing contact name and email, company name, tax identification number (e.g., EIN or VAT/GST where applicable). Card details are handled exclusively by our payment processor and never stored by Scrubbe.",
              "Provided at subscription purchase",
            ],
          ]}
        />
        <P>
          We do not knowingly collect special category personal data (health,
          biometric, racial or ethnic origin, political opinions, etc.) in the
          normal course of operating the Platform. If any such data appears in
          Customer-submitted incident payloads, it is processed as Customer Data
          under the DPA and the Customer is responsible as controller for its
          lawfulness.
        </P>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use Data",
    content: (
      <>
        <P>
          We use personal data collected as controller for the following
          purposes:
        </P>
        <DefTable
          rows={[
            [
              "Service delivery:",
              "Provisioning accounts, authenticating users, enforcing role-based access controls, routing notifications, and delivering all platform features within Subscription entitlements.",
            ],
            [
              "Security and integrity:",
              "Detecting, investigating, and responding to security incidents, abuse, and policy violations. Maintaining the immutable audit trail of all platform actions.",
            ],
            [
              "Product improvement:",
              "Analyzing aggregated, anonymized usage patterns to prioritize features, improve agent accuracy, and optimize system performance. We do not use individual-level usage data to build personal profiles for advertising.",
            ],
            [
              "Customer communications:",
              "Sending service notifications, release notes, security advisories, billing communications, and support responses. These are non-optional for account holders.",
            ],
            [
              "Marketing:",
              "Sending product updates, case studies, webinar invitations, and relevant content to prospects and customers who have opted in. You may withdraw consent at any time.",
            ],
            [
              "Legal compliance:",
              "Meeting obligations under applicable law, including responding to lawful requests from regulatory authorities.",
            ],
            [
              "Business operations:",
              "Managing our commercial relationships, processing payments, and maintaining corporate records.",
            ],
          ]}
        />
        <Note color="green" title="No Automated Decision-Making on You">
          <p className="text-[13px] text-emerald-700 leading-relaxed">
            While the Scrubbe Platform uses AI agents to make automated
            decisions about operational incidents, we do not use automated
            decision-making or profiling about individual users or data subjects
            that produces legal or similarly significant effects, consistent
            with automated-decision-making protections under applicable U.S.
            state privacy laws (e.g., Colorado and Connecticut).
          </p>
        </Note>
      </>
    ),
  },
  {
    id: "customer-incident-data",
    title: "Customer & Incident Data",
    content: (
      <>
        <P>
          When Customers submit telemetry, alerts, log payloads, and related
          operational data to the Platform, Scrubbe acts exclusively as a{" "}
          <Bold>data processor</Bold> (a "Service Provider" under the
          CCPA/CPRA, and a "Processor" under other applicable U.S. state
          privacy laws). This means:
        </P>
        <Ul>
          <Li>
            We process Customer Data only on documented instructions from the
            Customer (as set out in the DPA and Order Form).
          </Li>
          <Li>
            We do not use Customer Data for any purpose other than providing and
            maintaining the Service, unless required by law.
          </Li>
          <Li>
            We impose binding confidentiality and data protection obligations on
            all sub-processors who access Customer Data.
          </Li>
          <Li>
            We assist Customers in responding to data subject rights requests
            relating to personal data contained within Customer Data.
          </Li>
          <Li>
            We maintain records of all processing activities performed on behalf
            of each Customer tenant.
          </Li>
          <Li>
            Upon termination, Customer Data is retained for 30 days to allow
            export and then securely deleted within 90 days, except where law
            requires longer retention.
          </Li>
        </Ul>
        <Note color="amber" title="Customer Responsibility">
          <p className="text-[13px] text-amber-700 leading-relaxed">
            Customers are responsible as data controllers for ensuring they have
            a lawful basis for submitting personal data to the Platform via
            Connectors. Scrubbe's ingestion pipeline processes all submitted
            data without inspecting it for personal data at the point of entry —
            it is the Customer's responsibility to apply appropriate data
            minimization at source.
          </p>
        </Note>
        <P>
          Scrubbe maintains a Data Processing Agreement ("DPA") that governs all
          processor-level processing. Enterprise Customers must execute the DPA
          prior to submitting personal data to the Platform. Our standard DPA is
          available at{" "}
          <a
            href="https://www.scrubbe.com/dpa"
            className="text-emerald-600 hover:underline"
          >
            www.scrubbe.com/dpa
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content: (
      <>
        <P>
          We do not sell, rent, or trade personal data. We share personal data
          only in the following limited circumstances:
        </P>
        <DefTable
          dark
          rows={[
            [
              "Sub-processors",
              "Third-party infrastructure and SaaS providers that process personal data on our behalf to deliver the Service (e.g. cloud hosting, email delivery, error monitoring, payment processing). A current list of sub-processors is maintained at www.scrubbe.com/sub-processors. We notify Customers at least 30 days before adding a new sub-processor.",
            ],
            [
              "Professional advisors",
              "Lawyers, auditors, and accountants acting in an advisory capacity, subject to professional confidentiality obligations.",
            ],
            [
              "Regulatory authorities",
              "We may disclose personal data to regulatory or law enforcement authorities where required by applicable law or a valid legal order. We will notify affected Customers where legally permitted to do so.",
            ],
            [
              "Business transactions",
              "In the event of a merger, acquisition, or sale of all or part of our business, personal data may be transferred to the successor entity, subject to equivalent privacy protections. We will notify affected individuals before any such transfer takes effect.",
            ],
            [
              "With your consent",
              "For any sharing not described above, we will seek your explicit consent before proceeding.",
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International Transfers",
    content: (
      <>
        <P>
          Scrubbe is headquartered in the United States. By default, personal
          data and Customer Data are processed and stored within the United
          States.
        </P>
        <P>
          Where we process personal data originating from the European
          Economic Area (EEA), United Kingdom, or other regions with data
          transfer restrictions, we put an appropriate safeguard in place for
          the transfer to the United States, including:
        </P>
        <Ul>
          <Li>
            <Bold>EU Standard Contractual Clauses (SCCs)</Bold> for transfers
            of personal data from the EEA, supplemented by a Transfer Impact
            Assessment where required.
          </Li>
          <Li>
            <Bold>UK International Data Transfer Agreement (IDTA) / UK
            Addendum</Bold> for transfers of personal data from the United
            Kingdom.
          </Li>
          <Li>
            Other legally recognized transfer mechanisms as they become
            available or are required under applicable law.
          </Li>
        </Ul>
        <P>
          Enterprise Customers requiring data residency in a specific region
          may request this configuration in their Order Form. We will identify
          any sub-processors that may necessitate transfers outside that
          region and provide appropriate documentation.
        </P>
        <Note color="blue" title="Transfer Records">
          <p className="text-[13px] text-sky-700 leading-relaxed">
            You may request a copy of the transfer safeguards applicable to your
            data by contacting{" "}
            <a
              href="mailto:privacy@scrubbe.com"
              className="text-emerald-600 hover:underline"
            >
              privacy@scrubbe.com
            </a>
            . We maintain records of processing activities, including all
            international transfer mechanisms.
          </p>
        </Note>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention",
    content: (
      <>
        <P>
          We retain personal data only for as long as necessary for the purposes
          described in this Policy, or as required by law. Our standard
          retention periods are:
        </P>
        <div className="mt-4">
          <RetentionItem
            period="Duration of subscription + 30 days"
            color="bg-emerald-400"
            title="Account & profile data"
            desc="Name, work email, role, and access records. Retained for 30 days post-termination to allow export, then permanently deleted."
          />
          <RetentionItem
            period="Duration of subscription + 90 days"
            color="bg-emerald-400"
            title="Customer incident & telemetry data"
            desc="All Customer Data processed as a processor, including enriched incident records and agent action logs. Securely deleted within 90 days of contract end, unless law requires longer."
          />
          <RetentionItem
            period="7 years"
            color="bg-emerald-400"
            title="Audit trail & compliance records"
            desc="The immutable audit log of all state transitions, approvals, policy evaluations, and action outcomes. Retained for regulatory compliance and legal defensibility."
          />
          <RetentionItem
            period="7 years"
            color="bg-emerald-400"
            title="Financial & billing records"
            desc="Invoices, payment records, and associated contact data retained to satisfy applicable U.S. federal and state tax and accounting recordkeeping requirements."
          />
          <RetentionItem
            period="3 years from last contact"
            color="bg-amber-400"
            title="Marketing & prospect data"
            desc="Records of individuals who have expressed interest in Scrubbe but have not become customers. Suppression records (opt-outs) are retained indefinitely."
          />
          <RetentionItem
            period="90 days rolling"
            color="bg-sky-400"
            title="Security & access logs"
            desc="Server access logs, authentication events, and IP address records used for security monitoring and incident investigation."
          />
        </div>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <>
        <P>
          Scrubbe implements layered technical and organizational security
          measures to protect personal data against unauthorized access,
          alteration, disclosure, or destruction. These include:
        </P>
        <DefTable
          rows={[
            [
              "Encryption in transit:",
              "All data transmitted between clients and the Platform uses TLS 1.2 or higher. Internal service-to-service communication is encrypted.",
            ],
            [
              "Encryption at rest:",
              "All stored personal data and Customer Data is encrypted using AES-256.",
            ],
            [
              "Access controls:",
              "Scrubbe personnel access to Customer environments is strictly role-limited, logged, and subject to a least-privilege policy. Access requires multi-factor authentication.",
            ],
            [
              "Penetration testing:",
              "Annual independent penetration tests and continuous automated vulnerability scanning of the Platform.",
            ],
            [
              "Incident response:",
              "A documented information security incident response process, including escalation paths and Customer notification procedures.",
            ],
            [
              "Sub-processor assessment:",
              "All sub-processors handling personal data are assessed for security posture before onboarding and periodically thereafter.",
            ],
            [
              "Immutable audit logs:",
              "All access to Customer Data by Scrubbe personnel is logged in an append-only audit trail that cannot be modified or deleted.",
            ],
          ]}
        />
        <P>
          <Bold>Breach notification.</Bold> In the event of a personal data
          breach that is likely to result in a risk to the rights and freedoms
          of individuals, we will notify affected Customers within 72 hours of
          confirming the breach, providing sufficient information to allow
          them to fulfill their own notification obligations. Where required
          by applicable state law, we will also notify affected individuals
          and state Attorneys General within the timeframes those laws
          prescribe.
        </P>
        <P>
          To report a security vulnerability or suspected breach, contact{" "}
          <a
            href="mailto:security@scrubbe.com"
            className="text-emerald-600 hover:underline"
          >
            security@scrubbe.com
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <P>
          Depending on your state of residence, you have some or all of the
          following rights in relation to personal data we hold about you as
          controller, under applicable U.S. state privacy laws — including the
          California Consumer Privacy Act as amended by the CPRA ("CCPA/CPRA")
          and similar laws in Colorado, Connecticut, Virginia, Utah, and other
          states. These rights apply to our processing of your personal data
          as a Scrubbe user, website visitor, or contact — not to Customer
          Data (where rights should be directed to the relevant
          Customer/controller).
        </P>
        <div className="grid grid-cols-2 gap-3 my-4">
          <RightCard
            art="CCPA/CPRA § 1798.100"
            title="Right to Know / Access"
            desc="Request disclosure of the categories and specific pieces of personal information we have collected about you, the sources, purposes, and any third parties it was disclosed to."
          />
          <RightCard
            art="CCPA/CPRA § 1798.106"
            title="Right to Correct"
            desc="Request correction of inaccurate or incomplete personal data we hold about you."
          />
          <RightCard
            art="CCPA/CPRA § 1798.105"
            title="Right to Delete"
            desc="Request deletion of your personal data, subject to legal retention requirements and certain exceptions."
          />
          <RightCard
            art="CCPA/CPRA § 1798.121"
            title="Right to Limit Sensitive Data"
            desc="Limit the use and disclosure of sensitive personal information to what is necessary to provide the Service."
          />
          <RightCard
            art="CCPA/CPRA § 1798.100"
            title="Right to Portability"
            desc="Receive your personal data in a structured, machine-readable format and transfer it to another controller where technically feasible."
          />
          <RightCard
            art="CCPA/CPRA § 1798.120"
            title="Right to Opt Out of Sale/Sharing"
            desc="Direct us not to sell or share your personal information. As noted above, we do not sell or share personal data for cross-context behavioral advertising."
          />
          <RightCard
            art="CCPA/CPRA § 1798.125"
            title="Right to Non-Discrimination"
            desc="We will not deny goods or services, charge a different price, or provide a different level of service because you exercised a privacy right."
          />
          <RightCard
            art="State AG / FTC"
            title="Right to Lodge a Complaint"
            desc="Lodge a complaint with the California Privacy Protection Agency (CPPA), your state Attorney General, the Federal Trade Commission (FTC), or your local supervisory authority if you believe we have infringed your rights."
          />
        </div>
        <P>
          To exercise any right, submit a request to{" "}
          <a
            href="mailto:privacy@scrubbe.com"
            className="text-emerald-600 hover:underline"
          >
            privacy@scrubbe.com
          </a>
          . We will respond within 45 days (extendable by a further 45 days for
          complex requests, with notice). We may need to verify your identity
          before processing the request, and may require a higher level of
          verification for delete or correct requests. Rights requests are
          free of charge, though we may charge a reasonable fee for
          manifestly unfounded, excessive, or repetitive requests. You may
          designate an authorized agent to submit a request on your behalf.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    content: (
      <>
        <P>
          We use cookies and similar tracking technologies on{" "}
          <a
            href="https://www.scrubbe.com"
            className="text-emerald-600 hover:underline"
          >
            www.scrubbe.com
          </a>{" "}
          and the Platform. Detailed information about the cookies we use, their
          purpose, and how to manage your preferences is set out in our{" "}
          <a href="#" className="text-emerald-600 hover:underline">
            Cookie Policy
          </a>
          . A summary:
        </P>
        <DarkTable
          headers={["Category", "Purpose", "Consent required?"]}
          rows={[
            [
              "Essential",
              "Session management, authentication, security, load balancing. Without these the Platform cannot function.",
              "No — lawful basis: contract",
            ],
            [
              "Analytics",
              "Aggregated anonymized usage statistics to understand how the Platform and website are used. We use privacy-preserving analytics that do not fingerprint individuals.",
              "Yes — consent required",
            ],
            [
              "Functional",
              "Remembering your preferences (theme, language, dashboard layout) to improve your experience.",
              "No — consent required",
            ],
            [
              "Marketing",
              "Tracking visits from marketing campaigns to measure effectiveness. Not used for third-party ad targeting.",
              "No — consent required",
            ],
          ]}
        />
        <P>
          You can manage your cookie preferences at any time via the cookie
          preference center, accessible from the footer of any Scrubbe website
          page — including the "Do Not Sell or Share My Personal Information"
          control required under the CCPA/CPRA. You may also control cookies
          through your browser settings or by enabling the Global Privacy
          Control (GPC), though disabling Essential cookies will impair
          Platform functionality.
        </P>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: (
      <>
        <P>
          The Scrubbe Platform and website are directed exclusively at business
          users and are not intended for use by individuals under the age of 18.
          We do not knowingly collect personal data from children.
        </P>
        <P>
          If you believe that a child has provided personal data to Scrubbe,
          please contact{" "}
          <a
            href="mailto:privacy@scrubbe.com"
            className="text-emerald-600 hover:underline"
          >
            privacy@scrubbe.com
          </a>{" "}
          and we will take prompt steps to delete the relevant data.
        </P>
      </>
    ),
  },
  {
    id: "policy-changes",
    title: "Policy Changes",
    content: (
      <>
        <P>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, legal requirements, or new features. When we make
          material changes, we will:
        </P>
        <Ul>
          <Li>
            Notify account holders by email to the primary registered address at
            least 30 days before the changes take effect.
          </Li>
          <Li>
            Display a prominent notice within the Platform and on the Scrubbe
            website.
          </Li>
          <Li>Update the "Last updated" date at the top of this Policy.</Li>
          <Li>
            Maintain a version history so you can review what has changed.
          </Li>
        </Ul>
        <P>
          Your continued use of the Platform after the effective date of an
          updated Policy constitutes acceptance of the changes. If you do not
          accept material changes, you may exercise your right to erasure or
          account closure by contacting{" "}
          <a
            href="mailto:privacy@scrubbe.com"
            className="text-emerald-600 hover:underline"
          >
            privacy@scrubbe.com
          </a>
          .
        </P>
        <P>
          For non-material changes (such as clarifications, typographical
          corrections, or descriptions of existing practices), we will update
          the Policy without prior notice.
        </P>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contacts & Notices",
    content: (
      <>
        <P>
          For legal notices under these Terms, or to report a potential breach
          of these Terms, please contact Scrubbe's legal team using the details
          below. Notices sent by email are deemed received on the next business
          day. Notices sent by certified mail to the registered address are
          deemed received three business days after mailing.
        </P>
        <div className="grid grid-cols-2 gap-4 my-5">
          {[
            ["Legal enquiries", "legal@scrubbe.com"],
            ["Security & data incidents", "security@scrubbe.com"],
            ["General enquiries", "p.ifediora@scrubbe.com"],
            ["Company", "Scrubbe Inc."],
            ["Website", "www.scrubbe.com"],
          ].map(([label, val]) => (
            <div key={label} className="border-b border-gray-100 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                {label}
              </p>
              {val.includes("@") ? (
                <a
                  href={`mailto:${val}`}
                  className="text-[13px] text-emerald-600 hover:underline font-medium"
                >
                  {val}
                </a>
              ) : val.startsWith("www") ? (
                <a
                  href={`https://${val}`}
                  className="text-[13px] text-emerald-600 hover:underline font-medium"
                >
                  {val}
                </a>
              ) : (
                <p className="text-[13px] text-gray-700 font-medium">{val}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-[14px]"
          >
            <Download size={16} /> Download PDF Version
          </button>
        </div>
      </>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────

const ScrubbePrivacyPolicy = () => {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveId(id);
  };

  return (
    <div className="font-sans">
      {/* ── Hero ── */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img
          src="/IMS/privacy.png"
          className="absolute inset-0 w-full h-full object-cover -z-10"
          alt=""
        />
        <div className="absolute inset-0 bg-black/30 -z-[5]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/90 max-w-2xl text-[14px] leading-relaxed">
            This Privacy Policy explains how Scrubbe Inc. collects, uses, stores,
            and protects personal data in connection with the Scrubbe incident
            intelligence platform and our marketing presence. We are committed
            to processing personal data lawfully and transparently, in
            accordance with the California Consumer Privacy Act (CCPA/CPRA),
            other applicable U.S. state privacy laws, and applicable data
            protection law.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
            <span className="flex items-center gap-2 text-white/80 text-[13px]">
              <CalendarRange size={15} /> Effective Date: 21 May 2025
            </span>
            <span className="flex items-center gap-2 text-white/80 text-[13px]">
              <Clock size={15} /> Last Reviewed: 21 May 2026
            </span>
            <span className="flex items-center gap-2 text-white/80 text-[13px]">
              <ShieldIcon size={15} /> Jurisdiction: United States
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-[#e8faf0] min-h-screen py-16 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* TOC */}
            <aside className="hidden md:block md:col-span-3 sticky top-6 self-start">
              <nav className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-gray-100 last:border-0 ${
                      activeId === s.id
                        ? "bg-emerald-100 font-bold text-gray-900"
                        : "hover:bg-gray-50 text-gray-600 font-normal"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-full border text-[11px] font-semibold shrink-0 transition-colors ${
                        activeId === s.id
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px] leading-tight">{s.title}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="md:col-span-9 md:pl-0">
              {SECTIONS.map((s, i) => (
                <div
                  key={s.id}
                  id={s.id}
                  ref={(el) => {
                    sectionRefs.current[s.id] = el;
                  }}
                  className="mb-8 scroll-mt-6"
                >
                  <h2 className="text-2xl font-serif text-gray-900 bg-emerald-200 px-6 py-4">
                    {s.title}
                  </h2>
                  <div className="bg-white border border-t-0 border-gray-200 px-6 py-6">
                    {s.content}
                  </div>
                </div>
              ))}
              {/* Footer */}
              <div className="bg-gray-800 text-white px-6 py-5 rounded-b-xl text-[12px] flex flex-wrap gap-x-8 gap-y-1">
                <span>Document reference: TOS-2025-v1.0</span>
                <span>Effective: 21 May 2025</span>
                <span>Last reviewed: 21 May 2026</span>
                <span>Jurisdiction: United States</span>
                <span>Company: Scrubbe Inc.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrubbePrivacyPolicy;
