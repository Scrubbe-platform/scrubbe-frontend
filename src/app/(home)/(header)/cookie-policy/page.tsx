import React from "react";

const ScrubbeCookiePolicy = () => {
  // Data structure for the Table of Contents and main content
  const sections = [
    {
      id: "what-are-cookies",
      title: "What Are Cookies?",
      number: 1,
      content: (
        <>
          <p className="mb-4">
            Cookies are small text files placed on your device (computer, phone,
            tablet) when you visit a website. They help websites function,
            improve user experience, analyze performance, and deliver
            personalized content. We also use other tracking technologies like
            local storage, session storage, and tracking pixels (collectively
            referred to as &quot;cookies&quot; in this policy).
          </p>
        </>
      ),
    },
    {
      id: "types-we-use",
      title: "Types of Cookies We Use",
      number: 2,
      content: (
        <>
          <p className="mb-4">
            We categorize cookies based on their purpose. For performance
            cookies, we enable IP anonymization (e.g., in Google Analytics) to
            minimize personal data collection.
          </p>
          <table className="min-w-full divide-y divide-gray-200 border mb-8">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Examples
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  Essential Cookies
                </td>
                <td className="px-4 py-2">
                  Required for core website functionality, such as
                  authentication, security, and session management. These cannot
                  be disabled without affecting site operation.
                </td>
                <td className="px-4 py-2">
                  Session cookies, authentication tokens, CSRF tokens, secure
                  cookies.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  Functional Cookies
                </td>
                <td className="px-4 py-2">
                  Enhance user experience by remembering preferences (e.g.,
                  language, dark mode) and settings.
                </td>
                <td className="px-4 py-2">
                  Preference cookies, UI customization cookies.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  Performance/Analytics Cookies
                </td>
                <td className="px-4 py-2">
                  Collect anonymized data to analyze site usage, performance,
                  and errors, helping us improve Scrubbe IMS.
                </td>
                <td className="px-4 py-2">
                  Google Analytics (.ga), Sentry error logs.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  Marketing Cookies
                </td>
                <td className="px-4 py-2">
                  Used for targeted advertising, remarketing, and tracking user
                  interactions for marketing campaigns (if applicable).
                </td>
                <td className="px-4 py-2">
                  Third-party ad cookies (e.g., LinkedIn, Google Ads).
                </td>
              </tr>
            </tbody>
          </table>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 2.1 Sample
            Cookie List
          </h4>
          <p className="mb-4">
            Below is a sample of cookies we may use. For a complete list, see{" "}
            <a
              href="https://incidents.scrubbe.com/cookie-list"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com/cookie-list
            </a>
            .
          </p>
          <table className="min-w-full divide-y divide-gray-200 border mb-8">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Cookie Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Examples
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">\_ga</td>
                <td className="px-4 py-2">Google Analytics</td>
                <td className="px-4 py-2">Tracks site usage (anonymized)</td>
                <td className="px-4 py-2">2 years</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  \_cfduid
                </td>
                <td className="px-4 py-2">Cloudflare</td>
                <td className="px-4 py-2">Enhances site security and speed</td>
                <td className="px-4 py-2">1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  intercom-id
                </td>
                <td className="px-4 py-2">Intercom</td>
                <td className="px-4 py-2">Supports customer service chat</td>
                <td className="px-4 py-2">9 months</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap font-bold">
                  sentry\_replay\_session
                </td>
                <td className="px-4 py-2">Sentry</td>
                <td className="px-4 py-2">Error tracking and performance</td>
                <td className="px-4 py-2">Session</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "purposes-of-cookies",
      title: "Purposes of Cookies",
      number: 3,
      content: (
        <>
          <p className="mb-4">We use cookies for the following purposes:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Service Delivery: Authenticate users, maintain sessions, and
              ensure secure access to Scrubbe IMS (e.g., login tokens).
            </li>
            <li>
              User Experience: Remember preferences, such as dark mode or
              language settings, to enhance usability.
            </li>
            <li>
              Performance & Analytics: Understand how users interact with our
              website and services to optimize performance and fix issues (e.g.,
              page load times, error rates).
            </li>
            <li>
              Marketing: Deliver relevant ads and measure campaign effectiveness
              (if applicable, with user consent).
            </li>
            <li>
              Security: Protect against fraud, unauthorized access, and security
              threats (e.g., CSRF tokens).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "third-party-cookies",
      title: "Third-Party Cookies",
      number: 4,
      content: (
        <>
          <p className="mb-4">
            Some cookies are set by **third-party services** (subprocessors) we
            use to operate Scrubbe IMS. These third parties are contractually
            obligated to comply with data protection laws and are subject to
            regular audits to ensure compliance.
          </p>
          <p className="mb-2 font-semibold">
            Examples of third-party cookies include:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Google Analytics: Tracks site usage and performance with **IP
              anonymization** enabled (
              <a
                href="google.com/privacy"
                className="text-blue-600 hover:underline"
              >
                Google Privacy Policy
              </a>
              ).
            </li>
            <li>
              Sentry: Monitors errors and performance issues (
              <a
                href="sentry.io/privacy"
                className="text-blue-600 hover:underline"
              >
                Sentry Privacy Policy
              </a>
              ).
            </li>
            <li>
              Microsoft (Azure/GCP) Data from cloud providers for alerts and
              security.
            </li>
            <li>
              Cloudflare: Enhances site speed and security (
              <a
                href="cloudflare.com/privacy"
                className="text-blue-600 hover:underline"
              >
                Cloudflare Privacy Policy
              </a>
              ).
            </li>
          </ul>
          <p className="mt-4">
            Our full list of subprocessors is available at{" "}
            <a
              href="https://incidents.scrubbe.com/subprocessors"
              className="text-blue-600 hover:underline"
            >
              incidents.scrubbe.com/subprocessors
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "cookie-retention",
      title: "Cookie Retention Periods",
      number: 5,
      content: (
        <>
          <p className="mb-4 font-semibold">Cookie retention varies by type:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Session Cookies: Expire when you close your browser.</li>
            <li>
              Functional Cookies: Remain on your device for a set period
              (typically up to 2 years) or until you delete them.
            </li>
            <li>
              Analytics cookies: Google Analytics cookies (\_ga) last up to 2
              years; Sentry cookies vary by configuration.
            </li>
            <li>
              Marketing Cookies: May last up to 1 year, depending on the
              third-party provider.
            </li>
          </ul>
          <p className="mt-4">
            For specific retention periods, see our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              cookie list
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "managing-preferences",
      title: "Managing Your Cookie Preferences",
      number: 6,
      content: (
        <>
          <p className="mb-4">You can control cookies in the following ways:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Cookie Consent Banner: On your first visit, a banner allows you to
              accept or customize cookie preferences. You can revisit these
              settings using the button below.
            </li>
            <li>
              Browser Settings: Configure your browser to refuse or delete
              cookies. Instructions for major browsers (e.g., Chrome, Firefox,
              Safari) are available online. **Note: blocking essential cookies
              may impair website functionality**.
            </li>
            <li>
              Cross-Device Sync: Where possible, we sync preferences across
              devices using local storage or secure login settings to ensure you
              are logged in for consistent preferences.
            </li>
            <li>
              Opt-Out Tools: Opt-out tools like{" "}
              <a
                href="aboutads.info/choices"
                className="text-blue-600 hover:underline"
              >
                networkadvertising.org
              </a>{" "}
              or Your Online Choices (
              <a
                href="youronlinechoices.eu"
                className="text-blue-600 hover:underline"
              >
                youronlinechoices.eu
              </a>
              ) for marketing cookies.
            </li>
            <li>
              Do Not Track (DNT): We honor DNT signals where supported by
              third-party services (e.g., Google Analytics).
            </li>
          </ul>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 6.1 Consent
            Management
          </h4>
          <p className="mb-4">
            We use a Consent Management Platform to record and store your cookie
            preferences, ensuring compliance with **GDPR** and other
            regulations. Consent logs are maintained for audit purposes and can
            be provided upon request to{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>
            .
          </p>
          <p className="mb-4">Click below to manage your cookie preferences:</p>
          <button className="bg-scrubbe-green hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
            Manage Cookie Preferences
          </button>
        </>
      ),
    },
    {
      id: "regulatory-compliance",
      title: "Regulatory Compliance",
      number: 7,
      content: (
        <>
          <p className="mb-4">
            We comply with applicable data protection laws regarding cookies, as
            detailed in our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy (Section 18)
            </a>
            .
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 7.1 GDPR/UK
            (EU/UK)
          </h4>
          <p className="mb-4">
            Under GDPR, we obtain explicit consent for non-essential cookies via
            our cookie banner. You have the right to withdraw consent at any
            time using the preference management form or by contacting{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>
            . See our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy (Section 8.1)
            </a>{" "}
            for core rights.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 7.2
            CCPA/CPRA (California)
          </h4>
          <p className="mb-4">
            California residents can opt out of the sale of personal data via
            cookies. Scrubbe does not sell personal data, but marketing cookies
            may involve data sharing with third parties. Use the preference form
            or email{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            with &quot;CCPA Request&quot; in the subject line to opt out. See
            our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy (Section 8.2)
            </a>{" "}
            for CCPA rights.
          </p>

          <h4 className="font-semibold text-lg mb-2 flex items-center mt-4">
            <span className="text-scrubbe-green mr-2">&#9650;</span> 7.3 Other
            Jurisdictions (Nigeria NDPR, South Africa POPIA, Brazil LGPD, India
            DPDP Act, Canada PIPEDA)
          </h4>
          <p>
            We comply with local data protection laws, including Nigeria&apos;s
            NDPR, South Africa&apos;s POPIA, Brazil&apos;s LGPD, India&apos;s
            DPDP Act, and Canada&apos;s PIPEDA. We monitor evolving regulations
            to ensure ongoing compliance. Contact{" "}
            <a
              href="mailto:support@scrubbe.com"
              className="text-blue-600 hover:underline"
            >
              support@scrubbe.com
            </a>{" "}
            for assistance with local rights.
          </p>
        </>
      ),
    },
    {
      id: "childrens-privacy",
      title: "Children's Privacy",
      number: 8,
      content: (
        <p>
          Scrubbe IMS is not intended for children under 16, and we do not use
          cookies to target or collect data from children. If we learn that
          cookies have inadvertently collected data from a child under 16, we
          will delete it promptly. Contact{" "}
          <a
            href="mailto:support@scrubbe.com"
            className="text-blue-600 hover:underline"
          >
            support@scrubbe.com
          </a>{" "}
          if you believe we have collected such data.
        </p>
      ),
    },
    {
      id: "enterprise-controls",
      title: "Enterprise Controls & Data Processing Agreement (DPA)",
      number: 9,
      content: (
        <p>
          For enterprise customers, our **Data Processing Agreement (DPA)**
          includes provisions for cookie usage and subprocessor compliance.
          Contact{" "}
          <a
            href="mailto:support@scrubbe.com"
            className="text-blue-600 hover:underline"
          >
            support@scrubbe.com
          </a>{" "}
          to request a DPA or discuss cookie-related compliance requirements.
        </p>
      ),
    },
    {
      id: "accessibility",
      title: "Accessibility",
      number: 10,
      content: (
        <p>
          Our website and cookie preference form comply with Web Content
          Accessibility Guidelines (WCAG) 2.1 to ensure accessibility for users
          with disabilities. If you encounter issues, contact{" "}
          <a
            href="mailto:support@scrubbe.com"
            className="text-blue-600 hover:underline"
          >
            support@scrubbe.com
          </a>
          .
        </p>
      ),
    },
    {
      id: "changes-policy",
      title: "Changes to This Cookie Policy",
      number: 11,
      content: (
        <p>
          We may update this Cookie Policy to reflect changes in our practices
          or legal requirements. Updates will be posted with a new &quot;Last
          Updated&quot; date, and material changes will be communicated via
          email or dashboard notification where required.
        </p>
      ),
    },
    {
      id: "contact-us",
      title: "Contact Us",
      number: 12,
      content: (
        <>
          <p className="mb-4">
            For questions or to exercise your rights regarding cookies, contact:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Privacy Team:{" "}
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
            If you believe your rights have been violated, you may contact your
            local data protection authority. We will cooperate with lawful
            requests.
          </p>
        </>
      ),
    },
    {
      id: "legal-disclaimer",
      title: "Legal Disclaimer",
      number: 13,
      content: (
        <p>
          This Cookie Policy is for informational purposes and is not legal
          advice. Consult qualified legal counsel to ensure compliance with
          applicable laws.
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
    <div className="bg-[#00263D] min-h-screen px-4  md:px-8 py-[10rem] font-sans overflow-x-clip">
      <style>{`
        /* Custom colors based on the screenshots */
        .bg-scrubbe-dark { background-color: #2c3e50; }
        .bg-scrubbe-green { background-color: #38761d; }
        .text-scrubbe-green { color: #38761d; }
      `}</style>
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center flex flex-col justify-center items-center mb-10 bg-gradient-to-r from-[#5A519F] to-[#8D4C9A] rounded-[30px] p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Scrubbe IMS Cookie Policy{" "}
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
        <div className="w-full min-h-[2000px] mx-auto md:grid grid-cols-12  p-0 rounded-b-lg shadow-xl bg-white">
          {/* Left Column - Table of Contents */}
          <div className="md:block hidden sticky top-[100px] h-screen col-span-3 bg-gray-50 border-r border-gray-200 p-6  ">
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
          <div className="col-span-9 md:px-4 text-gray-800 bg-white w-full overflow-auto">
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

export default ScrubbeCookiePolicy;
