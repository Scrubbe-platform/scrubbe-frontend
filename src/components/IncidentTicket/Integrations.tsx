"use client";
// Integrations.tsx
import React, { useEffect, useRef, useState } from "react";
// You would replace this with actual SVG or image imports
import Modal from "../ui/Modal";
import WhatsappIntegration from "./Integration/WhatsappIntegration";
import SMSIntegration from "./Integration/SMSIntegration";
import SlackIntegration from "./Integration/SlackIntegration";
import GoogleMeetIntegration from "./Integration/GoogleMeetIntegration";
import GithubIntegration from "./Integration/GithubIntegration";
import GitlabIntegration from "./Integration/GitlabIntegration";
import { querykeys } from "@/lib/constant";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/lib/stores/auth.store";
import GitlabConfiguration from "./Configuration/GitlabConfiguration";
import GithubConfiguration from "./Configuration/GithubConfiguration";
import CButton from "../ui/Cbutton";
import { Filter, SearchIcon } from "lucide-react";
import Input from "../ui/input";
import EmptyState from "../ui/EmptyState";

// Array of all available integrations
const integrations = [
  {
    name: "Slack",
    icon: "/integration/slack.png",
    description: "Real-time coordination and stakeholder updates",
    category: "Communication Platform",
    development: false,
  },
  {
    name: "Microsoft Teams",
    icon: "/integration/teams.png",
    description: "Real-time coordination and stakeholder updates",
    category: "Communication Platform",
    development: true,
  },
  {
    name: "Google Meet",
    icon: "/integration/google_meet.png",
    description: "War rooms, briefings, and post-incident reviews",
    category: "Video Conferencing",
    development: true,
  },
  {
    name: "Google Calendar",
    icon: "/integration/google_calender.png",
    description: "War rooms, briefings, and post-incident reviews",
    category: "Video Conferencing",
    development: true,
  },
  {
    name: "Google Chat",
    icon: "/integration/google_chat.png",
    description: "Real-time coordination and stakeholder updates",
    category: "Communication Platform",
    development: true,
  },
  {
    name: "Zoom",
    icon: "/integration/zoom.png",
    description: "Real-time coordination and stakeholder updates",
    category: "Communication Platform",
    development: true,
  },
  {
    name: "SMS",
    icon: "/integration/sms.png", // A placeholder icon
    description: "Critical alerts and stakeholder communications",
    category: "Notification Channel",
    development: false,
  },
  {
    name: "ServiceNow",
    icon: "/integration/servicenow.png",
    description: "Incident tracking and follow-up tasks",
    category: "Ticketing System",
    development: true,
  },
  {
    name: "WhatsApp",
    icon: "/integration/whatsapp.png",
    description: "Real-time coordination and stakeholder updates",
    category: "Communication Platform",
    development: false,
  },
  {
    name: "Jira",
    icon: "/integration/jira.png",
    description: "Incident tracking and follow-up tasks",
    category: "Ticketing System",
    development: true,
  },
  {
    name: "Freshdesk",
    icon: "/integration/freshdesk.png",
    description: "Incident tracking and follow-up tasks",
    category: "Ticketing System",
    development: true,
  },
  {
    name: "PagerDuty",
    icon: "/integration/page_duty.png", // A placeholder icon
    description: "Monitoring Tool - Alert correlation and on-call management",
    development: true,
  },
  {
    name: "Email Services",
    icon: "/integration/email.png", // A placeholder icon
    description: "Critical alerts and stakeholder communications",
    category: "Notification Channel",
    development: false,
  },
  {
    name: "Calendly",
    icon: "/integration/calendly.png",
    description: "War rooms, briefings, and post-incident reviews",
    category: "Video Conferencing",
    development: true,
  },
  {
    name: "GitHub",
    icon: "/integration/github.png",
    description: "Code-related incident tracking and rollbacks",
    category: "Development Platform",
    development: false,
  },
  {
    name: "GitLab",
    icon: "/integration/gitlab.png",
    description: "Code-related incident tracking and rollbacks",
    category: "Development Platform",
    development: false,
  },
  {
    name: "Amazon Web Services",
    icon: "/integration/aws.png",
    description: "Infrastructure monitoring and resource management",
    category: "Cloud Infrastructure",
    development: true,
  },
  {
    name: "Microsoft Azure",
    icon: "/integration/azure.png",
    description: "Infrastructure monitoring and resource management",
    category: "Cloud Infrastructure",
    development: true,
  },
  {
    name: "Datadog",
    icon: "/integration/datadog.png",
    description:
      "Real-time monitoring, observability, and analytics for cloud applications",
    category: "Cloud Monitoring & Security",
    development: true,
  },
  {
    name: "Saleforce",
    icon: "/integration/saleforce.png",
    description:
      "Customer relationship management and business process automation",
    category: "Customer Relationship Management",
    development: true,
  },
  {
    name: "Scrubbe SDK",
    icon: "/scrubbe-logo-01.png",
    description: "Ingest fraud detection events.",
    category: null,
    development: true,
  },
  {
    name: "Custom webhook",
    icon: "/integration/webhook.png",
    description: "Ingest events via custom REST API.",
    category: null,
    development: true,
  },
];

const sortedIntegrations = integrations.sort((a, b) => {
  // If 'a' is in development and 'b' is not, 'a' comes first (-1)
  if (a.development && !b.development) {
    return 1;
  }
  // If 'b' is in development and 'a' is not, 'b' comes first (1)
  if (!a.development && b.development) {
    return -1;
  }
  // Otherwise, maintain the original order (0)
  return 0;
});

const Integrations: React.FC = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<
    string | undefined
  >();
  const [selectConfiguration, setSelectConfiguration] = useState<
    string | undefined
  >();
  const [filterIntegration, setFilterIntegration] =
    useState(sortedIntegrations);

  // create the categories from the integration
  const uniqueObj = new Set();
  const categories = sortedIntegrations
    .filter((obj) => {
      if (!uniqueObj.has(obj.category)) {
        uniqueObj.add(obj.category);
        return true;
      }
      return false;
    })
    .map((value) => ({ value: value.category, label: value.category }));

  const [search, setSearch] = useState("");
  const { get } = useFetch();
  const { user } = useAuthStore();
  const { data } = useQuery({
    queryKey: [querykeys.INTEGRATIONS],
    queryFn: async () => {
      const res = await get(
        endpoint.incident_ticket.integrations + "/" + user?.id
      );
      console.log(res);
      if (res.success) {
        return res.data.data;
      }
      return [];
    },
    enabled: !!user?.id,
  });

  // search integration
  const handleSearchIntegration = (searched: string) => {
    setSearch(searched);
    if (!searched.trim()) {
      setFilterIntegration(sortedIntegrations);
    } else {
      setFilterIntegration(
        sortedIntegrations.filter((value) => {
          if (value.name.toLowerCase().includes(searched.toLowerCase())) {
            return value;
          }
        })
      );
    }
  };

  const handleCategoryIntegration = (searched: string) => {
    setSearch(searched);
    if (!searched.trim()) {
      setFilterIntegration(sortedIntegrations);
    } else {
      setFilterIntegration(
        sortedIntegrations.filter((value) => {
          if (value.category?.toLowerCase().includes(searched.toLowerCase())) {
            return value;
          }
        })
      );
    }
  };

  const statusFilterRef = useRef<HTMLDivElement>(null);
  const [openStatusFilter, setOpenStatusFilter] = useState<boolean>(false);

  useEffect(() => {
    if (!openStatusFilter) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setOpenStatusFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openStatusFilter]);

  switch (selectedIntegration) {
    case "WhatsApp":
      return (
        <Modal
          isOpen={selectedIntegration === "WhatsApp"}
          onClose={() => setSelectedIntegration(undefined)}
        >
          <WhatsappIntegration />
        </Modal>
      );

    case "SMS":
      return (
        <Modal
          isOpen={selectedIntegration === "SMS"}
          onClose={() => setSelectedIntegration(undefined)}
        >
          <SMSIntegration />
        </Modal>
      );
    case "Slack":
      return (
        <Modal
          isOpen={selectedIntegration === "Slack"}
          onClose={() => setSelectedIntegration(undefined)}
        >
          <SlackIntegration />
        </Modal>
      );
    case "Google Meet":
      return (
        <Modal
          isOpen={selectedIntegration === "Google Meet"}
          onClose={() => setSelectedIntegration(undefined)}
        >
          <GoogleMeetIntegration />
        </Modal>
      );
    case "GitHub":
      return (
        <Modal
          isOpen={selectedIntegration === "GitHub"}
          onClose={() => setSelectedIntegration(undefined)}
        >
          <GithubIntegration />
        </Modal>
      );
    case "GitLab":
      return (
        <Modal
          isOpen={selectedIntegration === "GitLab"}
          onClose={() => setSelectedIntegration(undefined)}
        >
          <GitlabIntegration />
        </Modal>
      );
    default:
      break;
  }

  switch (selectConfiguration) {
    case "GitHub":
      return (
        <Modal
          isOpen={selectConfiguration === "GitHub"}
          onClose={() => setSelectConfiguration(undefined)}
        >
          <GithubConfiguration />
        </Modal>
      );
    case "GitLab":
      return (
        <Modal
          isOpen={selectConfiguration === "GitLab"}
          onClose={() => setSelectConfiguration(undefined)}
        >
          <GitlabConfiguration />
        </Modal>
      );
    default:
      break;
  }

  const connectIntegration = data?.map(
    (integration: { name: string; provider: string; userId: string }) => ({
      ...integration,
      provider: (integration.provider as string).toLowerCase(),
    })
  );

  return (
    <div className="min-h-screen !min-w-[600px]">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white ">
        Integrations
      </h1>
      <p className="mb-6 dark:text-white">
        Connect and manage your enterprise tools and services
      </p>

      <div className="flex justify-between ">
        <div className="relative w-1/2">
          <Input
            placeholder="Search"
            onChange={(e) => handleSearchIntegration(e.target.value)}
          />
          <div className="absolute right-2 top-2/4 -translate-y-2/3 pb-2">
            <SearchIcon size={18} className="dark:text-white text-black" />
          </div>
        </div>
        <div className="relative" ref={statusFilterRef}>
          <CButton
            onClick={() => setOpenStatusFilter(!openStatusFilter)}
            className="w-fit border-green hover:bg-green hover:text-white dark:text-white border bg-transparent text-green shadow-none"
          >
            Filter by Category <Filter />
          </CButton>
          {/* click outside to close */}
          {openStatusFilter && (
            <div className="absolute right-0 z-10 mt-1 bg-white border border-gray-300 text-sm rounded-md shadow-lg">
              {categories.map((option) => {
                if (option.value) {
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleCategoryIntegration(option.value as string);
                        setOpenStatusFilter(false);
                      }}
                      className="w-full text-sm text-nowrap px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-gray-900 first:rounded-t-md last:rounded-b-md"
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
      {filterIntegration.length < 1 ? (
        <EmptyState title={`"${search}"- Not Found`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {filterIntegration?.map((integration, index) => {
            const isConnected = (
              connectIntegration as {
                name: string;
                provider: string;
                userId: string;
              }[]
            )?.find(
              (value) => value.provider === integration.name.toLowerCase()
            );
            return (
              <div
                key={index}
                className="bg rounded-lg shadow-sm border border-gray-200 dark:border-gray-500 p-6 flex flex-col gap-4"
              >
                {/* Integration Icon */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-16 h-12 flex items-center justify-center rounded-lg bg-gray-100 mr-4">
                    <img
                      src={integration.icon}
                      alt=""
                      className={`size-10 ${
                        integration.name.includes("Scrubbe")
                          ? " object-contain"
                          : "object-cover"
                      }`}
                    />{" "}
                  </div>

                  {/* Integration Details */}
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      {integration.name} -{" "}
                      <span className=" font-thin">{integration.category}</span>
                    </h2>
                    <p className="text-sm text-gray-500">
                      {integration.description}
                    </p>
                  </div>
                </div>

                {/* Action Buttons and Status */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  {integration.development ? null : (
                    <div className="flex items-center gap-3">
                      <CButton
                        onClick={() => setSelectedIntegration(integration.name)}
                        className="py-2 text-sm font-medium shadow-none w-fit px-7"
                      >
                        {isConnected ? "Connected" : "Connect"}
                      </CButton>
                      {isConnected &&
                        (integration.name === "GitHub" ||
                          integration.name === "GitLab") && (
                          <button
                            onClick={() =>
                              setSelectConfiguration(integration.name)
                            }
                            className="px-4 py-2 text-sm font-medium text-green border border-green rounded-md hover:bg-blue-50 focus:outline-none"
                          >
                            Configure
                          </button>
                        )}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500 gap-2">
                    {integration.development ? (
                      <span>Coming soon</span>
                    ) : (
                      <>
                        {isConnected ? (
                          <>
                            <div className=" size-2 rounded-full bg-IMSLightGreen" />

                            <span>Connected</span>
                          </>
                        ) : (
                          <>
                            <div className=" size-2 rounded-full bg-red-500" />
                            <span>Not connected</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Integrations;
