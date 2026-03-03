import { ChevronRight } from "lucide-react";
import React from "react";
import Image from "next/image";
import { FaGithub, FaLinkedin, FaSquareXTwitter } from "react-icons/fa6";
import { IconType } from "react-icons";
import Link from "next/link";

// Centralized theme configuration - keeping only shared/reused styles
const theme = {
  colors: {
    text: "text-white",
    accent: "text-green-400",
  },
  spacing: {
    columnGap: "gap-4",
    rowGap: "gap-8",
  },
  fonts: {
    logo: "font-bold font-Montserrat text-xl xl:text-2xl",
    title: "font-semibold font-Montserrat text-base xl:text-lg",
    body: "font-Raleway text-xs xl:text-sm",
    linkText: "font-Montserrat text-xs xl:text-sm",
  },
};

// Component-specific styles grouped together
const componentStyles = {
  footer: {
    container: "w-full max-w-[1440px] mx-auto px-4 py-8 z-10",
    background: "bg-gradient-to-r from-[#1E326A] to-[#3B62D0]",
    innerContainer: "max-w-7xl mx-auto",
    topRow:
      "grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8 pb-8 border-b border-grayscrubbe-100/30",
    middleRow:
      "grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8 pb-8 border-b border-grayscrubbe-100/30",
    bottomRow: "flex flex-col xl:flex-row xl:items-center xl:justify-between",
    address: "mb-4 xl:mb-0",
    copyright: "text-sm text-gray-300",
  },
  socialLink: {
    container:
      "relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black hover:bg-blue-700 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1",
  },
  footerLink: {
    container: "flex items-center justify-start mb-2 xl:mb-3",
    text: "w-fit h-fit items-center flex cursor-pointer hover:text-green-400 transition-all justify-start",
  },
  column: {
    container: "w-full",
    headerContainer: "w-full mb-4",
    accent: "w-10 h-1 bg-green-400 rounded-full mt-2",
    linkContainer: "mt-4",
  },
  logoSection: {
    container: "col-span-1 xl:col-span-1",
    description: "mt-3 mb-6 max-w-xs",
    socialContainer: "flex items-center gap-3",
  },
};

// Type definitions
interface SocialLinkProps {
  icon: IconType;
  href: string;
}

interface FooterLinkProps {
  text: string;
  href: string;
}

interface ColumnHeaderProps {
  title: string;
}

interface FooterColumnProps {
  title: string;
  links: Array<{ text: string; href: string }>;
}

interface ColumnData {
  title: string;
  links: Array<{ text: string; href: string }>;
}

// Social media link component
const SocialLink: React.FC<SocialLinkProps> = ({ icon: Icon, href }) => (
  <Link
    href={href}
    className={componentStyles.socialLink.container}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon size={24} />
  </Link>
);

// Footer link component
// This is incorrect, as size doesn't support the lg: variant directly, let me fix it
const FooterLink: React.FC<FooterLinkProps> = ({ text, href }) => (
  <div className={componentStyles.footerLink.container}>
    <Link
      href={href}
      className={`${componentStyles.footerLink.text} ${theme.colors.text}`}
    >
      <ChevronRight size={14} className="text-green-400" />
      <div className={`${theme.fonts.linkText}`}>{text}</div>
    </Link>
  </div>
);

// Column header component
const ColumnHeader: React.FC<ColumnHeaderProps> = ({ title }) => (
  <div className={componentStyles.column.headerContainer}>
    <div className={`${theme.fonts.title} ${theme.colors.text}`}>{title}</div>
    <div className={componentStyles.column.accent}></div>
  </div>
);

// Column component
const FooterColumn: React.FC<FooterColumnProps> = ({ title, links }) => (
  <div className={componentStyles.column.container}>
    <ColumnHeader title={title} />
    <div className={componentStyles.column.linkContainer}>
      {links.map((link, index) => (
        <FooterLink key={index} text={link.text} href={link.href} />
      ))}
    </div>
  </div>
);

const Footer: React.FC = () => {
  // Data for top row columns
  const productLinks: ColumnData = {
    title: "Product",
    links: [
      { text: "SIEM platform", href: "#" },
      { text: "SOAR automation", href: "#" },
      { text: "Incident Management", href: "#" },
      { text: "Fraud Detection", href: "#" },
      { text: "Authentication SDK", href: "#" },
      { text: "Compliance Tool", href: "#" },
      { text: "Dashboard Preview", href: "#" },
    ],
  };

  const solutionsLinks: ColumnData = {
    title: "Solutions",
    links: [
      { text: "Fintech", href: "#" },
      { text: "SaaS Companies", href: "#" },
      { text: "Security Team", href: "#" },
      { text: "Real-Time threat Monitoring", href: "#" },
      { text: "KYC and Fraud Protection", href: "#" },
    ],
  };

  const documentationLinks: ColumnData = {
    title: "Documentation",
    links: [
      { text: "Fraud API", href: "#" },
      { text: "Authentication SDK", href: "#" },
      { text: "Blog", href: "#" },
      { text: "Community", href: "#" },
      { text: "Support", href: "#" },
    ],
  };

  const pricingLinks: ColumnData = {
    title: "Pricing",
    links: [
      { text: "Authentication SDK Pricing", href: "#" },
      { text: "SIEM and SOAR monitoring Pricing", href: "#" },
      { text: "Talk to sales", href: "#" },
      { text: "Community", href: "#" },
      { text: "Support", href: "#" },
    ],
  };

  // Data for middle row columns
  const moreLinks: ColumnData = {
    title: "More",
    links: [
      { text: "Knowledge base", href: "#" },
      { text: "Case studies", href: "#" },
      { text: "White papers", href: "#" },
      { text: "Compliance Check list", href: "#" },
      { text: "Security and Trust", href: "#" },
      { text: "Blog (Technical and Industrial Post)", href: "#" },
      { text: "Careers", href: "#" },
      { text: "About Us", href: "#" },
    ],
  };

  // Compliance content from the screenshot
  const complianceContent = [
    {
      id: 1,
      text: "Our services are hosted on AWS Cloud, which makes scrubbe to be ISO 27017, ISO compliant.",
    },
    {
      id: 2,
      text: "Your personal Data Protection in the cloud such as PII, KYC and Authentication information is guaranteed - compliant with ISO 27018.",
    },
    {
      id: 3,
      text: "Scrubbe is compliant with ISO 27001 - Information Security Management global standards necessary for controlling, processing and protecting customer data, internal systems and software assets.",
    },
  ];

  return (
    <div className="w-full h-auto bg-gradient-to-r from-[#1E326A] to-[#3B62D0]">
      <section
        className={`${componentStyles.footer.container} ${componentStyles.footer.background}`}
      >
        <div className={componentStyles.footer.innerContainer}>
          {/* Top Row - Logo + 4 columns */}
          <div className={componentStyles.footer.topRow}>
            {/* Logo and description section */}
            <div className={componentStyles.logoSection.container}>
              <div className="relative w-32 h-8 xl:w-40 xl:h-10">
                <Image
                  src="/scrubbe-logo-white.png"
                  alt="Scrubbe Logo"
                  fill
                  sizes="(max-width: 1280px) 128px, 160px"
                  className="object-contain"
                />
              </div>
              <div
                className={`${componentStyles.logoSection.description} ${theme.fonts.body} ${theme.colors.text}`}
              >
                1207 Delaware Ave #3296
                <br />
                Wilmington, DE 19806, United States
              </div>
              <div className={componentStyles.logoSection.socialContainer}>
                <SocialLink
                  icon={FaSquareXTwitter}
                  href="https://x.com/_Scrubbe"
                />
                <SocialLink
                  icon={FaLinkedin}
                  href="https://www.linkedin.com/company/scrubbe/"
                />
                <SocialLink icon={FaGithub} href="#" />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/icon-eu-big.svg"
                      alt="EU Compliance"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/icon-iso-big.svg"
                      alt="ISO Certification"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <FooterColumn
                title={productLinks.title}
                links={productLinks.links}
              />
            </div>

            {/* Solutions Column */}
            <div>
              <FooterColumn
                title={solutionsLinks.title}
                links={solutionsLinks.links}
              />
            </div>

            {/* Documentation Column */}
            <div>
              <FooterColumn
                title={documentationLinks.title}
                links={documentationLinks.links}
              />
            </div>

            {/* Pricing Column */}
            <div>
              <FooterColumn
                title={pricingLinks.title}
                links={pricingLinks.links}
              />
            </div>
          </div>

          {/* Middle Row - Compliance and More sections */}
          <div className={componentStyles.footer.middleRow}>
            {/* Empty column to align with logo */}
            <div className="hidden xl:block"></div>

            {/* More Column (takes 2 columns, under Product and Solutions) */}
            <div className="col-span-1 xl:col-span-2">
              <FooterColumn title={moreLinks.title} links={moreLinks.links} />
            </div>

            {/* Compliance Section (takes 2 columns, under Documentation and Pricing) */}
            <div className="col-span-1 xl:col-span-2">
              <ColumnHeader title="Compliance" />
              <div className="mt-4 space-y-6">
                {complianceContent.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="font-semibold text-green-400">
                      {item.id}.
                    </div>
                    <div className={`${theme.fonts.body} ${theme.colors.text}`}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row - Copyright */}
          <div className={componentStyles.footer.bottomRow}>
            <div className="w-full text-center">
              <div className={componentStyles.footer.copyright}>
                @Scrubbe All rights reserved{" "}
                <span>{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Footer;
