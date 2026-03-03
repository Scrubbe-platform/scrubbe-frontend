"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { VscChevronDown, VscChevronUp } from "react-icons/vsc";
import { RiSearchLine } from "react-icons/ri";
import { FiGlobe } from "react-icons/fi";
import SearchModal from "@/components/landing/SearchModal";
import { motion } from "framer-motion";

type MenuItem = {
  label: string;
  href?: string;
  dropdownOptions?: {
    label: string;
    href: string;
    description?: string; // Adding optional description field
  }[];
};

const NewNavbar = () => {
  // Existing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const textColor = "text-gray-800";
  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLanguageModalOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setIsLanguageModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLanguageModalOpen]);

  // Toggle dropdown visibility in mobile menu
  const toggleMobileDropdown = (label: string) => {
    setExpandedMenus((prev) => {
      // If the clicked menu is already open, close it
      if (prev[label]) {
        return {
          ...prev,
          [label]: false,
        };
      }

      // Otherwise, close all menus and open the clicked one
      const newState: Record<string, boolean> = {};
      menuItems.forEach((item) => {
        if (item.dropdownOptions) {
          newState[item.label] = false;
        }
      });

      return {
        ...newState,
        [label]: true,
      };
    });
  };

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      label: "Products",
      dropdownOptions: [
        {
          label: "SIEM Platform",
          href: "/products/siem",
          description:
            "Real-time threat detection, log analysis, and centralized monitoring",
        },
        {
          label: "SOAR Automation",
          href: "/products/soar",
          description:
            "Automated workflows to respond to incidents faster and smarter",
        },
        {
          label: "Incident Management",
          href: "/products/incident-management",
          description:
            "End-to-end visibility, manage security events from detection to resolution",
        },
        {
          label: "Fraud Detection",
          href: "#",
          description:
            "Tools to detect and block suspicious behavior across digital platforms",
        },
        {
          label: "Authentication SDK",
          href: "/products/authentication-sdk",
          description:
            "Secure user and system authentication for integrated apps",
        },
        {
          label: "Compliance Tools",
          href: "/products/compliance",
          description:
            "Automate reporting and meet standards like SOC 2, ISO 27001",
        },
        {
          label: "Dashboard Preview",
          href: "/products/dashboard-preview",
          description:
            "Get a sneak peak of the Scrubbe control center in action",
        },
      ],
    },
    {
      label: "Solutions",
      dropdownOptions: [
        {
          label: "For Fintech",
          href: "#",
          description: "Monitor Fraud, ensure compliance and Scale securely",
        },
        {
          label: "For SaaS Companies",
          href: "#",
          description:
            "Protect customer data and respond to security threats in real time",
        },
        {
          label: "For Security Teams",
          href: "#",
          description:
            "Centralize visibility, automate playbooks, and reduce manual triage",
        },
        {
          label: "Real-time Threat Monitoring",
          href: "#",
          description: "Spot and act on threats as they happen",
        },
        {
          label: "KYC & Fraud Protection",
          href: "#",
          description:
            "Detect identity fraud and malicious account behavior early",
        },
      ],
    },
    {
      label: "Documentation",
      dropdownOptions: [
        {
          label: "Fraud APIs",
          href: "#",
          description:
            "Fraud-aware APIs equipped with tools to monitor, detect and block suspicious behavior across digital platforms",
        },
        {
          label: "Authentication SDK",
          href: "#",
          description:
            "Secure user and system with scrubbe authentication with features",
        },
      ],
    },
    // {
    //   label: "Pricing",
    //   dropdownOptions: [
    //     {
    //       label: "Authentication SDK Pricing",
    //       href: "#",
    //     },
    //     {
    //       label: "SIEM and SOAR Monitoring Pricing",
    //       href: "#",
    //     },
    //     {
    //       label: "Talk To Sales",
    //       href: "#",
    //     },
    //   ],
    // },
    // {
    //   label: "More",
    //   dropdownOptions: [
    //     { label: "Knowledge base", href: "#" },
    //     { label: "Security and Trust", href: "#" },
    //     { label: "Case Studies", href: "#" },
    //     { label: "Blog (Technical and Industry Post)", href: "#" },
    //     { label: "White Papers", href: "#" },
    //     { label: "Careers", href: "#" },
    //     { label: "Compliance Checklist", href: "#" },
    //     { label: "About Us", href: "#" },
    //   ],
    // },
  ];

  // Handle search button click
  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  return (
    <>
      {/* NewNavbar Container */}
      <section className="w-full h-auto bg-white xl:bg-colorScBlack py-3  sticky top-0 z-50">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 1,
            type: "tween",
          }}
          className=" w-full  flex justify-center"
        >
          <nav
            className={`flex ${textColor} h-16 w-full max-w-[1540px] justify-between items-center px-4 md:px-6 lg:px-10 xl:px-20 sticky top-0 z-50  shadow-sm`}
          >
            {/* Line throught the navbar */}
            <div className=" absolute bg-white w-[80%] h-[33px] mx-4 left-[10%] hidden xl:flex " />
            {/* Logo */}
            <Link
              href="/"
              className="relative  w-[130px] h-[40px] sm:w-[160px] sm:h-[50px] lg:w-[180px] lg:h-[60px] bg-white rounded-full "
            >
              <Image
                src="/scrubbe-logo-01.png"
                alt="scrubbe-logo-01.png"
                fill
                sizes="(min-width: 300px) 100vw"
                className="object-contain scale-75 "
              />
            </Link>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 xl:hidden">
              <button
                className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                onClick={handleSearchClick}
              >
                <RiSearchLine size={20} />
              </button>
              <div className="relative group" ref={statusFilterRef}>
                <button
                  onClick={() => setIsLanguageModalOpen((prev) => !prev)}
                  className="p-2 rounded-full text-black cursor-pointer"
                >
                  <FiGlobe size={24} />
                </button>
                {isLanguageModalOpen && (
                  <div className=" w-[130px] border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full left-1/2 transform -translate-x-1/2 mt-1">
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      English
                    </div>
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      French
                    </div>
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      Spanish
                    </div>
                    <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                      German
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <GiHamburgerMenu size={20} />
              </button>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden xl:flex items-center justify-center flex-1 ml-8">
              {menuItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.dropdownOptions ? (
                    <>
                      <button
                        className={`${textColor} hover:text-blue-600 font-medium transition-colors flex justify-center gap-1 items-center cursor-pointer whitespace-nowrap py-2   w-[141px] h-[40px]  sm:h-[50px] lg:w-[155px] lg:h-[60px] bg-white rounded-3xl`}
                      >
                        {item.label} <VscChevronDown />
                      </button>

                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white shadow-lg rounded-lg w-[630px] z-50 border border-gray-200 py-4 px-6 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                        <div className="grid grid-cols-2 gap-2">
                          {item.dropdownOptions.map((option) => (
                            <Link
                              key={option.label}
                              href={option.href}
                              className={`block rounded-lg hover:bg-blue-50 transition-colors relative overflow-hidden group/item ${
                                option.description ? "p-3" : "py-1 px-3"
                              }`}
                            >
                              {/* Left border that appears on hover */}
                              <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover/item:bg-blue-600 transition-colors"></div>

                              <h3
                                className={`font-medium ${textColor} group-hover/item:text-blue-600 group-hover/item:underline transition-colors`}
                              >
                                {option.label}
                              </h3>
                              {option.description && (
                                <p className="text-sm text-gray-500 mt-1 group-hover/item:text-blue-500 transition-colors">
                                  {option.description}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className={`${textColor} hover:text-blue-600 transition-colors flex justify-center items-center cursor-pointer whitespace-nowrap py-2`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Right Menu */}
            <div className="hidden xl:flex items-center z-10 ">
              <div className="flex justify-center items-center gap-2  h-[40px] sm:h-[50px] sm:w-[140px] lg:h-[60px] bg-white rounded-3xl">
                <button
                  className="p-2 rounded-full text-black cursor-pointer"
                  onClick={handleSearchClick}
                >
                  <RiSearchLine size={24} />
                </button>
                <div className="relative group" ref={statusFilterRef}>
                  <button
                    onClick={() => setIsLanguageModalOpen((prev) => !prev)}
                    className="p-2 rounded-full text-black cursor-pointer"
                  >
                    <FiGlobe size={24} />
                  </button>
                  {isLanguageModalOpen && (
                    <div className=" w-[130px] border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                        English
                      </div>
                      <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                        French
                      </div>
                      <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                        Spanish
                      </div>
                      <div className="text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                        German
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center items-center gap-2  min-w-[141px] h-[40px] sm:min-w-[176px] sm:h-[50px] lg:min-w-[180px] lg:h-[60px] bg-white rounded-3xl px-4">
                <div className="animated-gradient p-[2px] rounded-3xl">
                  <Link
                    href={"/ezra"}
                    className=" bg-[#111827] gap-2 px-6 py-2 text-white rounded-3xl font-medium flex items-center"
                  >
                    Ezra Ai
                    <img src="/ezrastar1.svg" alt="ezrastar1.svg" />
                    {/* <PiStarFourFill className=" text-blue-500" size={22} /> */}
                  </Link>
                </div>
                <Link
                  href="/auth/signin"
                  className="px-6 py-2 rounded-2xl font-medium text-colorScBlue border border-colorScBlue hover:border-blue-700 transition-colors whitespace-nowrap focus:outline-none"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </nav>
        </motion.div>

        {/* Mobile Menu Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-white z-50 xl:hidden ">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 h-16 border-b border-gray-200">
              <Link
                href="/"
                onClick={() => setIsModalOpen(false)}
                className="relative w-[141px] h-[40px] sm:w-[176px] sm:h-[50px] lg:w-[211px] lg:h-[60px]"
              >
                <Image
                  src="/scrubbe-logo-01.png"
                  alt="scrubbe-logo-01.png"
                  fill
                  sizes="(min-width: 360px) 100vw"
                  className="object-contain"
                />
              </Link>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <IoMdClose size={24} className={textColor} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-[calc(100vh-64px)]">
              {menuItems.map((item) => (
                <div key={item.label} className="w-full">
                  {item.dropdownOptions ? (
                    <>
                      <button
                        onClick={() => toggleMobileDropdown(item.label)}
                        className={`flex items-center justify-between w-full text-lg font-medium ${textColor} hover:text-blue-600 transition-colors py-2`}
                      >
                        <span>{item.label}</span>
                        {expandedMenus[item.label] ? (
                          <VscChevronUp className="ml-2" />
                        ) : (
                          <VscChevronDown className="ml-2" />
                        )}
                      </button>

                      {expandedMenus[item.label] && (
                        <div className="mt-1 space-y-2">
                          {item.dropdownOptions.map((option) => (
                            <Link
                              key={option.label}
                              href={option.href}
                              onClick={() => setIsModalOpen(false)}
                              className={`block px-4 py-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group relative`}
                            >
                              <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-blue-600 transition-colors"></div>
                              <span
                                className={`block font-medium ${textColor} group-hover:text-blue-600 group-hover:underline transition-colors`}
                              >
                                {option.label}
                              </span>
                              {option.description && (
                                <span className="block text-sm text-gray-500 mt-1 group-hover:text-blue-500 transition-colors">
                                  {option.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      onClick={() => setIsModalOpen(false)}
                      className={`block py-2 text-lg font-medium ${textColor} hover:text-blue-600 transition-colors`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-6 border-t border-gray-200 space-y-3">
                <div className="animated-gradient p-[2px] rounded-3xl">
                  <Link
                    href={"/ezra"}
                    className=" bg-[#111827] w-full gap-2 px-6 py-2 text-white rounded-3xl font-medium flex items-center justify-center"
                  >
                    Ezra Ai
                    <img src="/ezrastar1.svg" />
                    {/* <PiStarFourFill className=" text-blue-500" size={22} /> */}
                  </Link>
                </div>
                <Link
                  href="/auth/signin"
                  onClick={() => setIsModalOpen(false)}
                  className="block w-full text-center py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none text-lg font-medium"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Search Modal Component */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />
      </section>
    </>
  );
};

export default NewNavbar;
