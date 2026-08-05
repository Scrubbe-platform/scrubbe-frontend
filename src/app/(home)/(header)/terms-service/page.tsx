"use client";
import { CalendarRange, Clock, ShieldIcon, Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────

const SubHead = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[14px] font-semibold text-gray-800 mb-2 mt-5 flex items-center gap-2">
    <span className="text-emerald-500 text-[10px]">▲</span>
    {children}
  </h4>
);

const Note = ({
  color,
  title,
  children,
}: {
  color: "green" | "amber" | "red";
  title: string;
  children: React.ReactNode;
}) => {
  const cls = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50  border-amber-200  text-amber-800",
    red: "bg-red-50    border-red-200    text-red-800",
  }[color];
  const titleCls = {
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  }[color];
  return (
    <div
      className={`border rounded-lg p-4 my-4 text-[13px] leading-relaxed ${cls}`}
    >
      <p
        className={`font-bold text-[11px] uppercase tracking-wider mb-1 ${titleCls}`}
      >
        {title}
      </p>
      {children}
    </div>
  );
};

const DefTable = ({ rows }: { rows: [string, React.ReactNode][] }) => (
  <table className="w-full border-collapse text-[13px] mt-4">
    <tbody>
      {rows.map(([term, def]) => (
        <tr key={term} className="border border-gray-200">
          <td className="w-[160px] px-4 py-3 font-semibold text-gray-800 align-top bg-gray-50 border-r border-gray-200 whitespace-nowrap">
            {term}
          </td>
          <td className="px-4 py-3 text-gray-600 leading-relaxed">{def}</td>
        </tr>
      ))}
    </tbody>
  </table>
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

// ── Sections ──────────────────────────────────────────────────────

const SECTIONS: { id: string; title: string; content: React.ReactNode }[] = [
  {
    id: "definitions",
    title: "Definitions",
    content: (
      <>
        <P>
          The following capitalized terms have the meanings set out below
          throughout these Terms and any Order Form, Data Processing Agreement,
          or addendum that reference them.
        </P>
        <DefTable
          rows={[
            [
              "Service",
              "The Scrubbe cloud-hosted, governed multi-agent incident intelligence platform, including all agents, orchestration engine, connector framework, APIs, dashboards, and documentation made available to Customer under an Order Form.",
            ],
            [
              "Customer Data",
              "All data, telemetry, alerts, log payloads, and metadata submitted to or generated within the Service by or on behalf of Customer, including any data processed through connectors and agent pipelines.",
            ],
            [
              "Authorized User",
              "An employee, contractor, or agent of Customer who is granted access credentials to the Service under the Customer's subscription and who has accepted these Terms and any applicable acceptable-use policies.",
            ],
            [
              "Subscription",
              "The commercial arrangement under which Customer purchases access to the Service as set out in an Order Form, including tier, seat count, usage limits, and subscription period.",
            ],
            [
              "Order Form",
              "A signed or electronically executed commercial document incorporating these Terms that specifies Subscription details, fees, and any additional terms agreed between the parties.",
            ],
            [
              "Incident",
              "A detected operational event processed through the Service's nine-state lifecycle (Detected through Post-Mortem), including all associated telemetry, enrichment data, proposed and approved actions.",
            ],
            [
              "Automation Level",
              "The effective automation level (EAL) governing which remediation actions the Service may execute automatically, determined by the intersection of Customer-configured playbook stage, policy ceiling, and risk classifier output.",
            ],
            [
              "Connector",
              "An integration module that enables the Service to ingest telemetry from, or execute actions against, a third-party tool (e.g. monitoring, ITSM, cloud provider, communication platform).",
            ],
            [
              "Confidential Information",
              "Any non-public information disclosed by one party to the other that is marked confidential or is reasonably understood to be confidential given its nature, including pricing, architecture, Customer Data, and the contents of any Order Form.",
            ],
            [
              "Documentation",
              "All user guides, API references, integration guides, runbooks, and other technical or operational materials made available by Scrubbe in connection with the Service.",
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: "acceptance",
    title: "Acceptance & Eligibility",
    content: (
      <>
        <P>
          By registering for an account, executing an Order Form, or accessing
          any part of the Service, you confirm that:
        </P>
        <Ul>
          <Li>
            You are at least 18 years of age and have the legal capacity to
            enter into binding contracts.
          </Li>
          <Li>
            If you are acting on behalf of a legal entity, you have the
            authority to bind that entity to these Terms.
          </Li>
          <Li>
            Your use of the Service complies with all applicable laws and
            regulations in your jurisdiction.
          </Li>
          <Li>
            You are not located in, or acting on behalf of a party located in, a
            jurisdiction subject to applicable trade sanctions.
          </Li>
        </Ul>
        <Note color="amber" title="Enterprise Customers">
          Where these Terms conflict with a separately negotiated Enterprise
          Master Service Agreement ("MSA") signed by both parties, the MSA shall
          prevail to the extent of the conflict.
        </Note>
        <P>
          These Terms shall apply from the earliest of: (a) the date you first
          access the Service, (b) the date you accept these Terms
          electronically, or (c) the effective date stated in an Order Form.
        </P>
      </>
    ),
  },
  {
    id: "services",
    title: "Description of Services",
    content: (
      <>
        <P>
          Scrubbe provides a governed multi-agent incident intelligence platform
          designed to help enterprise engineering teams detect, investigate, and
          remediate operational incidents with appropriate policy controls.
        </P>
        <P>The Service includes, subject to your Subscription tier:</P>
        <DefTable
          rows={[
            [
              "Incident intelligence pipeline:",
              "Automated ingestion, normalization, deduplication, and enrichment of operational events from connected sources.",
            ],
            [
              "Governed orchestration:",
              "Policy-driven playbook matching and execution with configurable automation levels and guardrail enforcement.",
            ],
            [
              "Agent framework:",
              "Specialized AI agents operating within policy boundaries, producing auditable proposals and executing approved actions.",
            ],
            [
              "Connector ecosystem:",
              "Pre-built and configurable integrations with monitoring, ITSM, cloud, communication, and observability tools.",
            ],
            [
              "Audit trail:",
              "An immutable, append-only record of all state transitions, policy evaluations, approvals, and action outcomes.",
            ],
            [
              "War room coordination:",
              "Automated incident command channels and meeting creation for high-severity events.",
            ],
            [
              "Post-mortem intelligence:",
              "Automated generation of post-incident analysis informed by the full incident record.",
            ],
          ]}
        />
        <Note color="green" title="Alpha & Beta Features">
          Features designated as "Alpha", "Beta", or "Preview" are provided
          without warranty and may be modified or withdrawn at any time. We will
          endeavor to provide reasonable notice before withdrawing features
          from general availability.
        </Note>
        <P>
          Scrubbe reserves the right to modify, enhance, or discontinue features
          of the Service upon reasonable notice, provided that material
          reductions in core functionality are communicated to Customer with at
          least 30 days' notice.
        </P>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Account & Services",
    content: (
      <>
        <P>
          <Bold>Account security.</Bold> Customer is responsible for maintaining
          the confidentiality of all authentication credentials issued to or
          created by Authorized Users. You must promptly notify Scrubbe of any
          suspected unauthorized access or credential compromise.
        </P>
        <P>
          <Bold>Authorized Users.</Bold> Customer may provision access for the
          number of Authorized Users permitted under the applicable
          Subscription. You may not share credentials between individuals or use
          service accounts in a manner that circumvents per-seat limits.
        </P>
        <P>
          <Bold>Role-based access.</Bold> The Service provides role-based access
          controls ("RBAC"). Customer is responsible for configuring and
          maintaining appropriate role assignments, including designating at
          least one tenant administrator who holds responsibility for account
          configuration and policy governance.
        </P>
        <P>
          <Bold>Connector credentials.</Bold> Where a Connector requires
          third-party credentials (API keys, OAuth tokens, or service account
          credentials), Customer is responsible for ensuring such credentials
          are valid, appropriately scoped, and rotated in accordance with the
          relevant third-party's security requirements.
        </P>
        <Ul>
          <Li>
            Scrubbe will store Connector credentials encrypted at rest using
            AES-256 and transmit them only over TLS 1.2 or higher.
          </Li>
          <Li>
            Customer must not provision credentials with permissions beyond
            those documented as required for each Connector.
          </Li>
          <Li>
            Customer must revoke Connector credentials promptly upon termination
            or suspension of the Service.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <>
        <P>
          Customer and all Authorized Users must use the Service only for lawful
          purposes and in accordance with these Terms. The following uses are
          expressly prohibited:
        </P>
        <Ul>
          <Li>
            Circumventing, disabling, or tampering with any policy guardrail,
            automation ceiling, or approval gate built into the Service.
          </Li>
          <Li>
            Attempting to reverse-engineer, decompile, or derive source code or
            model weights underlying the Service.
          </Li>
          <Li>
            Using the Service to store, process, or transmit data that violates
            applicable law, infringes third-party rights, or constitutes
            regulated health information (PHI/HIPAA) unless covered by an
            applicable Business Associate Agreement.
          </Li>
          <Li>
            Conducting load, penetration, or security testing against the
            Service without Scrubbe's prior written consent.
          </Li>
          <Li>
            Reselling, sublicensing, or providing access to the Service to any
            third party outside Customer's organization without express written
            authorization.
          </Li>
          <Li>
            Using the Service in a safety-critical context where human life or
            physical safety depends on uninterrupted, failure-free operation.
          </Li>
          <Li>
            Attempting to extract or reconstruct Scrubbe's proprietary playbook
            logic, agent decision models, or training data.
          </Li>
          <Li>
            Introducing malicious code, viruses, or payloads into the Service or
            any connected system.
          </Li>
        </Ul>
        <Note color="red" title="Policy Guardrail Integrity">
          The Service is designed so that policy guardrails enforce governance
          boundaries across all automated actions. Any attempt to bypass, spoof,
          or undermine guardrail evaluation — including through crafted
          connector payloads — constitutes a material breach of these Terms and
          may result in immediate suspension.
        </Note>
        <P>
          Scrubbe may monitor Service usage for compliance with this policy and
          will notify Customer of any suspected violation before taking remedial
          action, except where immediate suspension is necessary to protect the
          Service or other customers.
        </P>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data & Security",
    content: (
      <>
        <P>
          <Bold>Ownership.</Bold> Customer retains all right, title, and
          interest in Customer Data. These Terms do not grant Scrubbe any
          ownership interest in Customer Data.
        </P>
        <P>
          <Bold>License to process.</Bold> Customer grants Scrubbe a limited,
          non-exclusive license to receive, store, process, and transmit
          Customer Data solely to provide and improve the Service, comply with
          legal obligations, and as otherwise directed by Customer.
        </P>
        <P>
          <Bold>Data Processing Agreement.</Bold> Where Customer Data includes
          personal data subject to applicable data protection law (including
          the CCPA/CPRA and other applicable U.S. state privacy laws, and EU
          GDPR or UK GDPR where Customer Data originates from those regions),
          the parties shall execute Scrubbe's standard Data Processing
          Agreement ("DPA"), which is incorporated into these Terms by
          reference. The DPA governs all processing of personal data under
          these Terms.
        </P>
        <P>
          <Bold>Security.</Bold> Scrubbe implements and maintains technical and
          organizational security measures appropriate to the risk, including:
        </P>
        <Ul>
          <Li>
            Encryption of Customer Data in transit (TLS 1.2+) and at rest
            (AES-256).
          </Li>
          <Li>
            Role-based access controls and audit logging for all access to
            Customer Data by Scrubbe personnel.
          </Li>
          <Li>
            Regular penetration testing and vulnerability assessments by
            independent third parties.
          </Li>
          <Li>
            Incident response procedures including notification to Customer
            within 72 hours of becoming aware of a confirmed breach affecting
            Customer Data.
          </Li>
        </Ul>
        <P>
          <Bold>Data location.</Bold> Customer Data is processed and stored in
          data centers located in the United States by default. Enterprise
          Customers may request specific data residency configurations in
          their Order Form.
        </P>
        <P>
          <Bold>Retention and deletion.</Bold> Upon termination or expiry of the
          Subscription, Customer Data will be retained for 30 days to allow
          export, after which it will be securely deleted within 90 days, except
          where retention is required by applicable law.
        </P>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <>
        <P>
          <Bold>Scrubbe IP.</Bold> All rights in the Service, including
          software, agents, orchestration logic, playbook frameworks, APIs,
          Documentation, trademarks (including the Scrubbe name, Diamond S Mark,
          and associated visual identity), and all improvements thereto, are and
          remain the exclusive property of Scrubbe Inc. or its licensors.
        </P>
        <P>
          <Bold>Customer's license.</Bold> Subject to payment of applicable fees
          and compliance with these Terms, Scrubbe grants Customer a limited,
          non-exclusive, non-transferable, non-sublicensable license to access
          and use the Service during the Subscription period solely for
          Customer's internal business operations.
        </P>
        <P>
          <Bold>Feedback.</Bold> If Customer or any Authorized User provides
          suggestions, feedback, or ideas relating to the Service ("Feedback"),
          Customer hereby assigns to Scrubbe all right, title, and interest in
          such Feedback. Scrubbe may use Feedback without restriction or
          compensation.
        </P>
        <P>
          <Bold>Usage data.</Bold> Scrubbe may collect and use aggregated,
          anonymized usage and performance data derived from Customer's use of
          the Service to operate, improve, and benchmark the Service, provided
          such data cannot reasonably be used to identify Customer or any
          individual.
        </P>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees and Billings",
    content: (
      <>
        <P>
          Fees are specified in the applicable Order Form. Unless otherwise
          stated, the following terms apply:
        </P>
        <table className="w-full border-collapse text-[13px] my-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-2.5 text-left font-semibold border border-gray-600">
                Item
              </th>
              <th className="px-4 py-2.5 text-left font-semibold border border-gray-600">
                Standard Terms
              </th>
              <th className="px-4 py-2.5 text-left font-semibold border border-gray-600">
                Plan
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Invoice frequency",
                "Annual in advance; monthly where specified in Order Form",
                "All plans",
              ],
              ["Payment terms", "Net 30 from invoice date", "All plans"],
              [
                "Overdue interest",
                "1.5% per month (18% per annum), or the maximum rate permitted by applicable law, whichever is lower",
                "All plans",
              ],
              [
                "Price increases",
                "60 days' written notice before renewal",
                "All plans",
              ],
              [
                "Usage overages",
                "Billed monthly in arrears at rates set out in Order Form",
                "Enterprise",
              ],
              [
                "Auto-renewal",
                "Subscriptions renew automatically unless cancelled with 60 days' notice",
                "All plans",
              ],
            ].map(([item, terms, plan]) => {
              const planCls =
                plan === "Enterprise"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-300";
              return (
                <tr key={item} className="border border-gray-200">
                  <td className="px-4 py-2.5 text-gray-700 border-r border-gray-200 font-medium">
                    {item}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 border-r border-gray-200">
                    {terms}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${planCls}`}
                    >
                      {plan}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <P>
          <Bold>Taxes.</Bold> All fees are exclusive of applicable taxes,
          levies, and duties. Customer is responsible for all taxes other than
          those assessed on Scrubbe's net income.
        </P>
        <P>
          <Bold>Disputes.</Bold> Customer must notify Scrubbe in writing of any
          invoice dispute within 30 days of the invoice date. Undisputed amounts
          remain due by the payment deadline.
        </P>
        <Note color="amber" title="Suspension for Non-Payment">
          Scrubbe may suspend access to the Service if payment is overdue by
          more than 15 days, having provided at least 10 days' written notice.
          Suspension does not relieve Customer of payment obligations.
        </Note>
      </>
    ),
  },
  {
    id: "sla",
    title: "SLA & Availability",
    content: (
      <>
        <P>
          Scrubbe targets the following monthly uptime commitments for the core
          Service:
        </P>
        <DefTable
          rows={[
            [
              "Enterprise",
              "99.9% monthly uptime (≤ 43.8 minutes downtime per month), excluding scheduled maintenance windows communicated at least 48 hours in advance.",
            ],
            [
              "Growth",
              "99.5% monthly uptime (≤ 3.6 hours downtime per month), excluding scheduled maintenance.",
            ],
            [
              "Starter / Trial",
              "Best-effort availability. No SLA credits apply.",
            ],
          ]}
        />
        <P>
          <Bold>Service credits.</Bold> Where Scrubbe fails to meet the
          committed SLA in any calendar month, Customer is eligible for service
          credits equal to 10% of the monthly fee for each full percentage point
          below the target, up to a maximum of 30% of the monthly fee. Service
          credits are Customer's sole remedy for SLA failures.
        </P>
        <P>
          <Bold>Exclusions.</Bold> SLA commitments do not apply to downtime
          caused by: Customer-side infrastructure, network, or connector
          failures; force majeure events; Customer-requested changes;
          third-party platform outages outside Scrubbe's reasonable control; or
          actions taken in accordance with these Terms.
        </P>
      </>
    ),
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    content: (
      <>
        <P>
          Each party agrees to maintain the confidentiality of the other party's
          Confidential Information and not to disclose such information to any
          third party without the disclosing party's prior written consent,
          except:
        </P>
        <Ul>
          <Li>
            To employees, contractors, or advisors who have a legitimate need to
            know and are bound by confidentiality obligations no less protective
            than these Terms.
          </Li>
          <Li>
            As required by applicable law, regulation, or court order, provided
            the receiving party gives the disclosing party maximum practicable
            prior notice and cooperates in seeking a protective order.
          </Li>
          <Li>
            For information that is or becomes publicly available through no
            fault of the receiving party, was rightfully known prior to
            disclosure, or was independently developed.
          </Li>
        </Ul>
        <P>
          Confidentiality obligations under this section shall survive
          termination or expiry of these Terms for a period of five (5) years,
          except that obligations with respect to trade secrets shall continue
          for so long as the relevant information remains a trade secret.
        </P>
      </>
    ),
  },
  {
    id: "warranties",
    title: "Warranties & Disclaimers",
    content: (
      <>
        <P>
          <Bold>Scrubbe warrants</Bold> that during the Subscription period: (a)
          the Service will perform materially in accordance with the
          Documentation; (b) Scrubbe will implement and maintain commercially
          reasonable security measures; and (c) Scrubbe has the right to grant
          the licenses set out in these Terms.
        </P>
        <P>
          <Bold>Customer warrants</Bold> that: (a) it has all rights necessary
          to submit Customer Data to the Service; (b) the submission and
          processing of Customer Data does not violate applicable law or any
          third-party rights; and (c) it has implemented appropriate Connector
          credential security measures.
        </P>
        <Note color="red" title="Disclaimer">
          Except as expressly stated, the Service is provided "AS IS" and "AS
          AVAILABLE". Scrubbe disclaims all implied warranties, including
          merchantability, fitness for a particular purpose, and
          non-infringement. Scrubbe does not warrant that the Service will be
          error-free, uninterrupted, or that all automated remediation actions
          will produce the desired outcomes. AI-generated incident analyses,
          playbook proposals, and remediation recommendations are advisory and
          do not constitute professional engineering or legal advice.
        </Note>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: (
      <>
        <P>
          <Bold>Cap.</Bold> To the maximum extent permitted by applicable law,
          each party's total aggregate liability arising out of or in connection
          with these Terms (whether in contract, tort including negligence, or
          otherwise) shall not exceed the greater of: (a) the total fees paid or
          payable by Customer in the twelve months immediately preceding the
          event giving rise to the claim; or (b) $12,500 USD.
        </P>
        <P>
          <Bold>Exclusions.</Bold> Neither party shall be liable to the other
          for any:
        </P>
        <Ul>
          <Li>Loss of profits, revenue, or anticipated savings;</Li>
          <Li>Loss of business, contracts, or opportunities;</Li>
          <Li>
            Loss of data or corruption of data (other than Scrubbe's obligation
            to maintain backups as specified in the DPA);
          </Li>
          <Li>Indirect, incidental, special, or consequential damages;</Li>
          <Li>
            Damage arising from actions taken or not taken by automated agents
            within the Automation Level configured by Customer.
          </Li>
        </Ul>
        <P>
          These exclusions apply even if a party has been advised of the
          possibility of such loss. Nothing in these Terms shall limit liability
          for death or personal injury caused by negligence, fraud or fraudulent
          misrepresentation, or any other liability that cannot be excluded by
          law.
        </P>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "Indemnification",
    content: (
      <>
        <P>
          <Bold>By Scrubbe.</Bold> Scrubbe will defend Customer against any
          third-party claim that the Service, as provided and used in accordance
          with these Terms, infringes any patent, copyright, trademark, or
          other intellectual property right, and will indemnify Customer
          against damages finally awarded
          in such a claim. This obligation does not apply where the claim arises
          from: modification of the Service by Customer; use of the Service in
          combination with non-Scrubbe products; use contrary to the
          Documentation; or Customer Data.
        </P>
        <P>
          <Bold>By Customer.</Bold> Customer will defend Scrubbe against any
          third-party claim arising from: (a) Customer Data; (b) Customer's use
          of the Service in breach of applicable law; or (c) Customer's
          violation of applicable law; or (d) actions taken by the Service
          pursuant to Customer's policy and playbook configuration.
        </P>
        <P>
          <Bold>Procedure.</Bold> The indemnified party must: (i) promptly
          notify the indemnifying party in writing of any claim; (ii) give the
          indemnifying party sole control of the defence and settlement; and
          (iii) provide reasonable assistance at the indemnifying party's
          expense. The indemnified party may participate in the defence with its
          own counsel at its own cost.
        </P>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <>
        <P>
          <Bold>By Customer.</Bold> Customer may terminate the Subscription at
          any time by providing written notice. Unless a different notice period
          is specified in the Order Form, termination takes effect at the end of
          the then-current Subscription period. No refunds are provided for
          prepaid fees except where termination is for Scrubbe's material
          uncured breach.
        </P>
        <P>
          <Bold>By Scrubbe for cause.</Bold> Scrubbe may terminate these Terms
          immediately on written notice if: (a) Customer is in material breach
          and fails to cure within 30 days of notice; (b) Customer becomes
          insolvent, makes an assignment for the benefit of creditors, or
          becomes subject to bankruptcy, receivership, or similar proceedings;
          or (c) continued provision would violate applicable law.
        </P>
        <P>
          <Bold>Effect of termination.</Bold> On termination or expiry:
        </P>
        <Ul>
          <Li>All licenses granted to Customer terminate immediately.</Li>
          <Li>
            Customer must cease all use of the Service and destroy all copies of
            Documentation in its possession.
          </Li>
          <Li>
            Customer retains the right to export Customer Data during the 30-day
            retention period per Section 6.
          </Li>
          <Li>
            Sections 1, 7, 10, 11, 12, 13, 15, and this Section survive
            termination indefinitely.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Laws & Dispute",
    content: (
      <>
        <P>
          These Terms are governed by and shall be construed in accordance with
          the laws of the State of Delaware, without regard to its conflict of
          laws principles. The parties irrevocably submit to the exclusive
          jurisdiction of the state and federal courts located in Delaware to
          settle any dispute arising out of or in connection with these Terms.
        </P>
        <P>
          <Bold>Dispute resolution.</Bold> Before commencing legal proceedings,
          the parties agree to attempt resolution through good-faith negotiation
          for at least 30 days. Either party may request a meeting between
          senior representatives of each organization.
        </P>
        <P>
          <Bold>UN Convention.</Bold> The United Nations Convention on Contracts
          for the International Sale of Goods does not apply to these Terms.
        </P>
        <P>
          <Bold>Injunctive relief.</Bold> Nothing in this section prevents
          either party from seeking urgent injunctive or other equitable relief
          in any court of competent jurisdiction where delay would cause
          irreparable harm, including in connection with a breach of
          confidentiality or intellectual property obligations.
        </P>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to Terms",
    content: (
      <>
        <P>
          Scrubbe may update these Terms from time to time. Where changes are
          material, we will provide at least 30 days' advance notice by email to
          the primary account contact and/or by prominent notice within the
          Service.
        </P>
        <P>
          <Bold>Material changes</Bold> include modifications to payment terms,
          data handling provisions, limitation of liability, or Customer's core
          rights. <Bold>Non-material changes</Bold> (e.g. formatting,
          clarifications, new feature descriptions) take effect immediately upon
          publication.
        </P>
        <P>
          Continued use of the Service after the effective date of updated Terms
          constitutes acceptance. If you do not accept updated Terms, you must
          notify Scrubbe within the notice period and you may terminate the
          Subscription without penalty for the change itself.
        </P>
        <P>
          Where Customer holds an active Order Form, changes to these Terms do
          not affect the Order Form until it next renews or is amended by mutual
          agreement, unless required by applicable law.
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

const ScrubbeTermsOfService = () => {
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
            Terms of Service
          </h1>
          <p className="text-white/90 max-w-2xl text-[14px] leading-relaxed">
            These Terms of Service ("Terms") constitute a legally binding
            agreement between Scrubbe Inc. ("Scrubbe", "we", "us") and the
            organization or individual ("Customer", "you") accessing or using
            the Scrubbe governed multi-agent incident intelligence platform. By
            accessing any part of the Service, you agree to be bound by these
            Terms in full.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
            <span className="flex items-center gap-2 text-white/80 text-[13px]">
              <CalendarRange size={15} /> Effective Date: 21 May 2025
            </span>
            <span className="flex items-center gap-2 text-white/80 text-[13px]">
              <Clock size={15} /> Last Reviewed: 21 May 2026
            </span>
            <span className="flex items-center gap-2 text-white/80 text-[13px]">
              <ShieldIcon size={15} /> Jurisdiction: Delaware, USA
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

              {/* Footer strip */}
              <div className="bg-gray-800 text-white px-6 py-5 rounded-b-xl text-[12px] flex flex-wrap gap-x-8 gap-y-1">
                <span>Document reference: TOS-2025-v1.0</span>
                <span>Effective: 21 May 2025</span>
                <span>Last reviewed: 21 May 2026</span>
                <span>Jurisdiction: Delaware, USA</span>
                <span>Company: Scrubbe Inc.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrubbeTermsOfService;
