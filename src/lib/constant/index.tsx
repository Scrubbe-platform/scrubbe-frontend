import {
  ArrowLeftRight,
  ArrowUp,
  Code,
  LayoutDashboard,
  Lock,
  LucideAlertTriangle,
  LucideDatabaseBackup,
  LucideLayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  SquareCode,
  SquareKanban,
  UsersRound,
} from "lucide-react";
import {
  BsBoxSeam,
  BsBriefcaseFill,
  BsBroadcast,
  BsDatabase,
  BsFillBarChartFill,
  BsFillBellFill,
  BsQuestionOctagon,
} from "react-icons/bs";
import {
  FaBook,
  FaCircleQuestion,
  FaClock,
  FaCodepen,
  FaUserGroup,
} from "react-icons/fa6";
import { FiGitMerge, FiUsers } from "react-icons/fi";
import { HiOutlineCreditCard } from "react-icons/hi";
import { TbCloudDataConnection, TbRouteSquare } from "react-icons/tb";
import { TiFlowChildren } from "react-icons/ti";
import { GoLock } from "react-icons/go";
import {
  IoIosCall,
  IoIosNotifications,
  IoIosWarning,
  IoMdCall,
} from "react-icons/io";
import { CgArrowBottomRightR } from "react-icons/cg";
import {
  MdAnalytics,
  MdBalance,
  MdGroup,
  MdLock,
  MdShield,
} from "react-icons/md";
import {
  BiPlus,
  BiSolidBookBookmark,
  BiSolidChart,
  BiSolidDashboard,
  BiSolidMessageAltEdit,
} from "react-icons/bi";
import { RiBloggerLine, RiOrganizationChart } from "react-icons/ri";
import {
  FaBolt,
  FaBox,
  FaBrain,
  FaLink,
  FaRedo,
  FaSignal,
} from "react-icons/fa";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { SiAccuweather } from "react-icons/si";
import { GiScrollUnfurled } from "react-icons/gi";
import { PiBookFill, PiStarFourFill, PiEngineFill } from "react-icons/pi";
import { RiPencilFill } from "react-icons/ri";
import { TbTimelineEventFilled } from "react-icons/tb";
import { HiOutlineLink } from "react-icons/hi";
import { IoMap, IoWarningOutline } from "react-icons/io5";
import {
  HiMiniBuildingOffice,
  HiOutlineArrowsRightLeft,
} from "react-icons/hi2";
import {
  LuVideo,
  LuRefreshCw,
  LuRadio,
  LuLayoutGrid,
  LuFileText,
  LuGitPullRequest,
  LuShieldAlert,
  LuFolderClosed,
  LuLayers,
  LuWorkflow,
} from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { VscSymbolInterface } from "react-icons/vsc";
import { RxBarChart, RxDisc } from "react-icons/rx";
import { PiInfinityBold } from "react-icons/pi";
import { IoSettingsOutline, IoWalletOutline } from "react-icons/io5";

export type LifecycleStage =
  | "OPEN"
  | "INVESTIGATING"
  | "DIAGNOSED"
  | "REMEDIATING"
  | "MONITORING"
  | "REVIEW"
  | "RESOLVED"
  | "CLOSED";

export interface StageMetadata {
  id: number;
  label: LifecycleStage;
  display: string;
  // Dynamic custom color mapping pairs
  dotColor: string; // Used for dropdown dots
  ribbonActive: string; // Active ribbon style block
  ribbonDone: string; // Completed ribbon style block
  textColor: string; // Color matching text strings
}

export const STAGES_CONFIG: StageMetadata[] = [
  {
    id: 1,
    label: "OPEN",
    display: "Open",
    dotColor: "bg-cyan-400",
    ribbonActive: "bg-cyan-500 text-white border-l-cyan-500",
    ribbonDone: "bg-cyan-500/5 text-cyan-600 dark:text-cyan-400/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: 2,
    label: "INVESTIGATING",
    display: "Investigating",
    dotColor: "bg-amber-500",
    ribbonActive: "bg-amber-500 text-white border-l-amber-500",
    ribbonDone: "bg-amber-500/5 text-amber-600 dark:text-[#f3ab3d]/40",
    textColor: "text-amber-500 dark:text-[#f3ab3d]",
  },
  {
    id: 3,
    label: "DIAGNOSED",
    display: "Diagnosed",
    dotColor: "bg-blue-500",
    ribbonActive: "bg-blue-500 text-white border-l-blue-500",
    ribbonDone: "bg-blue-500/5 text-blue-600 dark:text-blue-400/40",
    textColor: "text-blue-500 dark:text-blue-400",
  },
  {
    id: 4,
    label: "REMEDIATING",
    display: "Remediating",
    dotColor: "bg-orange-500",
    ribbonActive: "bg-orange-500 text-white border-l-orange-500",
    ribbonDone: "bg-orange-500/5 text-orange-600 dark:text-orange-400/40",
    textColor: "text-orange-500 dark:text-orange-400",
  },
  {
    id: 5,
    label: "MONITORING",
    display: "Monitoring",
    dotColor: "bg-cyan-400",
    ribbonActive: "bg-cyan-500 text-white border-l-cyan-500",
    ribbonDone: "bg-cyan-500/5 text-cyan-600 dark:text-cyan-400/40",
    textColor: "text-cyan-500 dark:text-cyan-400",
  },
  {
    id: 6,
    label: "REVIEW",
    display: "Review",
    dotColor: "bg-purple-400",
    ribbonActive: "bg-purple-500 text-white border-l-purple-500",
    ribbonDone: "bg-purple-500/5 text-purple-600 dark:text-purple-400/40",
    textColor: "text-purple-500 dark:text-purple-400",
  },
  {
    id: 7,
    label: "RESOLVED",
    display: "Resolved",
    dotColor: "bg-emerald-500",
    ribbonActive: "bg-emerald-500 text-white border-l-emerald-500",
    ribbonDone: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400/40",
    textColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    id: 8,
    label: "CLOSED",
    display: "Closed",
    dotColor: "bg-emerald-500",
    ribbonActive: "bg-emerald-500 text-white border-l-emerald-500",
    ribbonDone: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400/40",
    textColor: "text-emerald-500 dark:text-emerald-400",
  },
];

export type NavItem = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  link: string;
  isMenu?: boolean;
  isActive?: boolean;
  menu?: NavItemChild[];
  description?: string;
  pillText?: string;
  pillBorderColor?: string;
  pillTextColor?: string;
};
type NavItemChild = {
  name: string;
  link: string;
  childMenu?: Partial<{ name: string; link: "dashboard" | "telemetry" }[]>;
};
export const navItem: NavItem[] = [
  {
    name: "Dashboard",
    Icon: LayoutDashboard,
    link: "/dashboard",
    isMenu: true,
    isActive: true,
    menu: [
      {
        name: "Global Overview",
        link: "/dashboard",
      },
      {
        name: "Quick Access Panel",
        link: "/dashboard/incident-overview",
      },
    ],
  },
  {
    name: "SIEM",
    Icon: FaCodepen,
    link: "/dashboard/data-source",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Data Source",
        link: "/dashboard/data-source",
      },
      {
        name: "Source Categories (Cloud, Apps)",
        link: "/dashboard/source-categories",
      },
      {
        name: "Event Streams",
        link: "/dashboard/event-streams",
      },
    ],
  },
  {
    name: "SOAR",
    Icon: TbRouteSquare,
    link: "/dashboard/playbook-builder",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Playbook Builder",
        link: "/dashboard/playbook-builder",
      },
      {
        name: "Incident Ticket",
        link: "/dashboard/incident-ticket",
      },
      {
        name: "Actions & Triggers",
        link: "/dashboard/actions-triggers",
      },
      {
        name: "Scheduling",
        link: "/dashboard/scheduling",
      },
    ],
  },
  {
    name: "Fraud Detection",
    Icon: ShieldCheck,
    link: "/dashboard/fraud-overview",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Fraud Overview",
        link: "/dashboard/fraud-overview",
      },
      {
        name: "Anomaly Detection",
        link: "/dashboard/anomaly-detection",
      },
    ],
  },

  {
    name: "Data Management",
    Icon: TbCloudDataConnection,
    link: "/dashboard/control-log",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Control log",
        link: "/dashboard/control-log",
      },
      {
        name: "Retention Policies",
        link: "/dashboard/retention-policy",
      },
    ],
  },
  {
    name: "Security & Compliance",
    Icon: GoLock,
    link: "/dashboard/audit-logs",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Audit Logs",
        link: "/dashboard/audit-logs",
      },
      {
        name: "Compliance Reports",
        link: "/dashboard/compliance-reports",
      },
      {
        name: "Policy Management",
        link: "/dashboard/policy-management",
      },
    ],
  },
  {
    name: "Organization Settings",
    Icon: BsBoxSeam,
    link: "/dashboard/user-management",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "User Management",
        link: "/dashboard/user-management",
      },
      {
        name: "Role & Permissions",
        link: "/dashboard/role-management",
      },
      {
        name: "SSO/Identity Providers",
        link: "/dashboard/sso-identity-providers",
      },
    ],
  },
  {
    name: "Settings",
    Icon: Settings,
    link: "/dashboard/settings",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "General Settings",
        link: "/dashboard/settings",
      },

      {
        name: "Notification Settings",
        link: "/dashboard/notification-settings",
      },
    ],
  },
  {
    name: "Developer Portal",
    Icon: BsDatabase,
    link: "/dashboard/api-keys",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "API Keys",
        link: "/dashboard/api-keys",
      },

      {
        name: "API Documentation",
        link: "/dashboard/api-documentation",
      },
      {
        name: "Webhooks Management",
        link: "/dashboard/webhooks-management",
      },
      {
        name: "SDK Download",
        link: "/dashboard/sdk-download",
      },
      {
        name: "Integration Guides",
        link: "/dashboard/integration-guides",
      },
    ],
  },
  {
    name: "Support",
    Icon: BsQuestionOctagon,
    link: "/dashboard/support",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Support Ticket",
        link: "/dashboard/support",
      },
      {
        name: "Community Forum",
        link: "/dashboard/community-forum",
      },
    ],
  },
];

export const ezraNavItem: NavItem[] = [
  {
    name: "Dashboard",
    Icon: LayoutDashboard,
    link: "/ezra/dashboard",
    isMenu: true,
    isActive: true,
    menu: [
      {
        name: "Global Overview",
        link: "/ezra/dashboard",
      },
      {
        name: "Quick Access Panel",
        link: "/ezra/dashboard/incident-overview",
      },
    ],
  },
  {
    name: "SIEM",
    Icon: FaCodepen,
    link: "/ezra/dashboard/data-source",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Data Source",
        link: "/ezra/dashboard/data-source",
      },
      {
        name: "Source Categories (Cloud, Apps)",
        link: "/ezra/dashboard/source-categories",
      },
      {
        name: "Event Streams",
        link: "/ezra/dashboard/event-streams",
      },
    ],
  },
  {
    name: "SOAR",
    Icon: TbRouteSquare,
    link: "/ezra/dashboard/natural-language-rule",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Natural Language Rule Input",
        link: "/ezra/dashboard/natural-language-rule",
      },
      {
        name: "Incident Ticket",
        link: "/ezra/dashboard/incident-ticket",
      },
      {
        name: "Actions & Triggers",
        link: "/ezra/dashboard/actions-triggers",
      },
      {
        name: "Scheduling",
        link: "/ezra/dashboard/scheduling",
      },
    ],
  },
  {
    name: "Fraud Detection",
    Icon: ShieldCheck,
    link: "/dashboard/fraud-overview",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Fraud Overview",
        link: "/dashboard/fraud-overview",
      },
      {
        name: "Anomaly Detection",
        link: "/ezra/dashboard/anomaly-detection",
      },
    ],
  },
  // {
  //   name: "Playbook Builder",
  //   Icon: FaCodepen,
  //   link: "ezra/dashboard",
  // },
  {
    name: "Data Management",
    Icon: TbCloudDataConnection,
    link: "/ezra/dashboard/control-log",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Control log",
        link: "/ezra/dashboard/control-log",
      },
      {
        name: "Retention Policies",
        link: "/ezra/dashboard/retention-policy",
      },
    ],
  },
  {
    name: "Security & Compliance",
    Icon: GoLock,
    link: "/ezra/dashboard/audit-logs",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Audit Logs",
        link: "/ezra/dashboard/audit-logs",
      },
      {
        name: "Compliance Reports",
        link: "/ezra/dashboard/compliance-reports",
      },
      {
        name: "Policy Management",
        link: "/ezra/dashboard/policy-management",
      },
    ],
  },
  {
    name: "Organization Settings",
    Icon: BsBoxSeam,
    link: "/ezra/dashboard/user-management",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "User Management",
        link: "/ezra/dashboard/user-management",
      },
      {
        name: "Role & Permissions",
        link: "/ezra/dashboard/role-management",
      },
      {
        name: "SSO/Identity Providers",
        link: "/ezra/dashboard/sso-identity-providers",
      },
    ],
  },
  {
    name: "Settings",
    Icon: Settings,
    link: "/ezra/dashboard/settings",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "General Settings",
        link: "/ezra/dashboard/settings",
      },

      {
        name: "Notification Settings",
        link: "/ezra/dashboard/notification-settings",
      },
    ],
  },
  {
    name: "Support",
    Icon: BsQuestionOctagon,
    link: "/ezra/dashboard/support",
    isMenu: true,
    isActive: false,
    menu: [
      {
        name: "Support Ticket",
        link: "/ezra/dashboard/support",
      },
      {
        name: "Community Forum",
        link: "/ezra/dashboard/community-forum",
      },
    ],
  },
];

export const developerNavItem: NavItem[] = [
  {
    name: "Dashboard",
    Icon: LayoutDashboard,
    link: "/developer/dashboard",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Device Intelligence",
    Icon: FiGitMerge,
    link: "/developer/device-intelligence",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Analytics",
    Icon: SquareKanban,
    link: "/developer/analytics",
    isMenu: false,
    isActive: false,
  },
];

export const developerNavItemDevelopment: NavItem[] = [
  {
    name: "API Playground",
    Icon: SquareCode,
    link: "/developer/api-playground",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Integration Tools",
    Icon: FiGitMerge,
    link: "/developer/integration-tools",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Webhooks",
    Icon: TiFlowChildren,
    link: "/developer/webhooks",
    isMenu: false,
    isActive: false,
  },
];

export const developerNavItemSecurity: NavItem[] = [
  {
    name: "Security Center",
    Icon: Lock,
    link: "/developer/security-center",
    isMenu: false,
    isActive: false,
  },
  {
    name: "API Keys",
    Icon: Code,
    link: "/developer/api-keys",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Audit Logs",
    Icon: LucideDatabaseBackup,
    link: "/developer/audit-logs",
    isMenu: false,
    isActive: false,
  },
];

export const developerNavItemAccount: NavItem[] = [
  {
    name: "Team Management",
    Icon: UsersRound,
    link: "/developer/team-management",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Billing & Usage",
    Icon: HiOutlineCreditCard,
    link: "/developer/billing-usage",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Support",
    Icon: FaCircleQuestion,
    link: "/developer/support",
    isMenu: false,
    isActive: false,
  },
];

export const playbookTemplate = [
  {
    title: "Unauthorize playbook",
    nodes: [
      {
        id: "block-1",
        type: "metric",
        label: "Unauthorized access",
        configuration: {},
        configured: false,
        children: [
          {
            id: "block-2",
            type: "trigger",
            label: "Send Alert",
            configuration: {},
            configured: false,
            children: [],
          },
          {
            id: "block-3",
            type: "action",
            label: "Block IP",
            configuration: {},
            configured: false,
            children: [],
          },
        ],
      },
    ],
  },

  {
    title: "Failed Login",
    nodes: [
      {
        id: "block-4",
        type: "metric",
        label: "Failed Login",
        configuration: {},
        configured: false,
        children: [
          {
            id: "block-7",
            type: "trigger",
            label: "Send Alert",
            configuration: {},
            configured: false,
            children: [],
          },
          {
            id: "block-6",
            type: "action",
            label: "Log event",
            configuration: {},
            configured: false,
            children: [],
          },
        ],
      },
    ],
  },

  {
    title: "Phishing Response",
    nodes: [
      {
        id: "block-8",
        type: "metric",
        label: "Phishing Email",
        configuration: {},
        configured: false,
        children: [
          {
            id: "block-10",
            type: "action",
            label: "Log event",
            configuration: {},
            configured: false,
            children: [
              {
                id: "block-9",
                type: "trigger",
                label: "Send Alert",
                configuration: {},
                configured: false,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const IMSSidebar: NavItem[] = [
  {
    name: "Dashboard",
    Icon: LucideLayoutDashboard,
    link: "/incident",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Incident",
    Icon: FaCircleQuestion,
    link: "/incident/tickets",
    isMenu: false,
    isActive: true,
  },
  {
    name: "On-Call",
    Icon: IoMdCall,
    link: "/incident/on-call",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Ingestion",
    Icon: CgArrowBottomRightR,
    link: "/incident/ingestion",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Postmortems",
    Icon: BiSolidBookBookmark,
    link: "/incident/postmortems",
    isMenu: false,
    isActive: true,
  },
  {
    name: "SLA Management",
    Icon: FaClock,
    link: "/incident/sla",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Changes and Problems",
    Icon: LuRefreshCw,
    link: "/incident/changes-problems",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Runbooks",
    Icon: FaBook,
    link: "/incident/runbooks",
    isMenu: false,
    isActive: false,
  },

  {
    name: "Timeline",
    Icon: FaClock,
    link: "/incident/timeline",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Analytics",
    Icon: MdAnalytics,
    link: "/incident/anlytics",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Ai Suggestions",
    Icon: PiStarFourFill,
    link: "/incident/ai-suggestion",
    isMenu: false,
    isActive: true,
  },

  {
    name: "Workflows",
    Icon: RiOrganizationChart,
    link: "/incident/workflows",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Audit",
    Icon: Search,
    link: "/incident/audit",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Multi-Tenancy",
    Icon: MdGroup,
    link: "/incident/multi-tenancy",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Sandbox",
    Icon: FaBox,
    link: "/incident/sandbox",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Notification",
    Icon: IoIosNotifications,
    link: "/incident/notification",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Permissions",
    Icon: MdLock,
    link: "/incident/permissions",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Relationships",
    Icon: FaLink,
    link: "/incident/relationships",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Climate & Resilience Intelligence",
    Icon: SiAccuweather,
    link: "/incident/climate-resilience-intelligence",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Documentation",
    Icon: GiScrollUnfurled,
    link: "/incident/documentation",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Status & Communication Center",
    Icon: BiSolidMessageAltEdit,
    link: "/incident/status-communication-center",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Knowledge Based & Lessons Learned",
    Icon: FaBook,
    link: "/incident/knowledge-base",
    isMenu: false,
    isActive: false,
  },
  {
    name: "Reports & Export",
    Icon: BsFillBarChartFill,
    link: "/incident/reports-export",
    isMenu: false,
    isActive: false,
  },
];

export const SubSidebar = [
  {
    name: "Team Member",
    Icon: FiUsers,
    link: "/incident/team-management",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Billing & Usage",
    Icon: HiOutlineCreditCard,
    link: "/incident/billings",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Support",
    Icon: AiOutlineQuestionCircle,
    link: "/incident/support",
    isMenu: false,
    isActive: false,
  },
];

export const AdminSidebar: NavItem[] = [
  {
    name: "Dashboard",
    Icon: LucideLayoutDashboard,
    link: "/admin",
    isMenu: false,
    isActive: true,
  },
  {
    name: "User",
    Icon: FaUserGroup,
    link: "/admin/users",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Blog",
    Icon: RiBloggerLine,
    link: "/admin/blogs",
    isMenu: false,
    isActive: true,
  },
  {
    name: "Careers",
    Icon: BsBriefcaseFill,
    link: "/admin/careers",
    isMenu: false,
    isActive: true,
  },
];

export const popularTimezones = [
  {
    label: "(GMT-08:00) Pacific Time (US & Canada)",
    value: "America/Los_Angeles",
  },
  { label: "(GMT-07:00) Mountain Time (US & Canada)", value: "America/Denver" },
  { label: "(GMT-06:00) Central Time (US & Canada)", value: "America/Chicago" },
  {
    label: "(GMT-05:00) Eastern Time (US & Canada)",
    value: "America/New_York",
  },
  { label: "(GMT+00:00) UTC / Greenwich Mean Time", value: "UTC" },
  {
    label: "(GMT+00:00) Western European Time (London)",
    value: "Europe/London",
  },
  {
    label: "(GMT+01:00) Central European Time (Paris/Berlin)",
    value: "Europe/Paris",
  },
  { label: "(GMT+05:30) India Standard Time", value: "Asia/Kolkata" },
  {
    label: "(GMT+08:00) China Standard Time / Singapore",
    value: "Asia/Singapore",
  },
  { label: "(GMT+09:00) Japan Standard Time", value: "Asia/Tokyo" },
  {
    label: "(GMT+10:00) Australian Eastern Time (Sydney)",
    value: "Australia/Sydney",
  },
  { label: "(GMT+11:00) Central Pacific Time", value: "Pacific/Guadalcanal" },
];

export const NewMenu: Record<string, NavItem[]> = {
  incident_management: [
    {
      name: "Incidents",
      Icon: LucideAlertTriangle,
      link: "/incident/tickets",
      isActive: true,
      isMenu: false,
    },
    {
      name: "War Rooms",
      Icon: LuVideo,
      link: "/incident/war-rooms",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Incident Delivery",
      Icon: LuRadio,
      link: "/incident/delivery-incidents",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Major Incidents Workbench",
      Icon: LuLayoutGrid,
      link: "/incident/workbench",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Postmortems",
      Icon: LuFileText,
      link: "/incident/post-mortems",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Problems",
      Icon: HiOutlineArrowsRightLeft,
      link: "/incident/problems",
      isActive: false,
      isMenu: false,
    },
    {
      name: "On-Call",
      Icon: FiUsers,
      link: "/incident/on-call",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Handover",
      Icon: LuShieldAlert,
      link: "/incident/handover",
      isActive: true,
      isMenu: false,
    },
  ],
  intelligence: [
    {
      name: "Intelligence Control Plane",
      Icon: VscSymbolInterface,
      link: "/incident/control-plane",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Code Engine",
      Icon: LuFolderClosed,
      link: "/incident/code-engine",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Signal Graph",
      Icon: RxBarChart,
      link: "/incident/signal-graph",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Playbooks",
      Icon: LuLayers,
      link: "/incident/playbooks",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Mother ↔ Child",
      Icon: RxDisc,
      link: "/incident/mother-child",
      isActive: false,
      isMenu: false,
    },
  ],
  engineering_ecosystem: [
    {
      name: "Services",
      Icon: LuFolderClosed,
      link: "/incident/services",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Repositories",
      Icon: LuGitPullRequest,
      link: "/incident/repositories",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Deployments",
      Icon: LuLayers,
      link: "/incident/deployments",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Pipelines",
      Icon: LuWorkflow,
      link: "/incident/pipelines",
      isActive: false,
      isMenu: false,
    },
    {
      name: "Infrastructure",
      Icon: LuLayers,
      link: "/incident/infrastructure",
      isActive: false,
      isMenu: false,
    },
  ],
  platform: [
    {
      name: "API & SDK",
      Icon: LuFolderClosed,
      link: "/incident/api-key",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Connectors",
      Icon: PiInfinityBold,
      link: "/incident/connections",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Settings",
      Icon: IoSettingsOutline,
      link: "/incident/settings",
      isActive: true,
      isMenu: false,
    },
    {
      name: "Plans and Billings",
      Icon: IoWalletOutline,
      link: "/incident/billing",
      isActive: false,
      isMenu: false,
    },
  ],
};

export const activityData = [
  {
    id: "pr_131_control",
    run: "pr_131",
    timestamp: "29m ago",
    repoName: "control - plane",
    repoPath: "scrubbe/control-plane",
    service: "control-plane",
    metadata: { pr: "pr #131", sha: "sha d00f00", env: "env pr" },
    status: {
      label: "Warning",
      type: "warning",
      subLabel: "Approval required",
    },
    trigger: {
      title: "PR#131",
      description: "PR#131 • Add new policy evaluator",
    },
    details: {
      incidentStatus: "active • S4",
      stages: [
        { name: "checkout", status: "warning" },
        { name: "unit-tests", status: "error" },
        { name: "integration-tests", status: "success" },
        { name: "reports", status: "warning" },
      ],
      codeEngine: {
        id: "CE-9812A31F",
        confidence: "0.86",
        risk: "Low",
        paths: "No sensitive paths",
      },
      affectedFiles: ["src/payouts/idempotency.test.ts"],
      gateReason:
        "Merge conflict remediation touches /policy. Requires owning-team approval.",
    },
    evidence: { runUrl: "#", logsUrl: "#", incidentId: "INC-9AC0D113" },
  },
  {
    id: "run_311_payment",
    run: "run_311",
    timestamp: "3m ago",
    repoName: "Payment - api",
    repoPath: "scrubbe/payment-api",
    service: "payment-api",
    metadata: { pr: "pr #124", sha: "sha 9fd1a0c", env: "env pr" },
    status: { label: "failed", type: "error", subLabel: null },
    trigger: {
      title: "PR#128",
      description: "PR#128 • Add idempotency keys to payout flow",
    },
    details: {
      incidentStatus: "resolved • S2",
      stages: [
        { name: "checkout", status: "success" },
        { name: "unit-tests", status: "error" },
        { name: "security-scan", status: "error" },
      ],
      codeEngine: {
        id: "CE-1122B44G",
        confidence: "0.92",
        risk: "High",
        paths: "/api/payouts/**",
      },
      affectedFiles: ["api/v1/payouts.go", "db/schema.sql"],
      gateReason:
        "High risk path detected in payout logic. Manual review required.",
    },
    evidence: { runUrl: "#", logsUrl: "#", incidentId: "INC-2A7F9BIC" },
  },
  {
    id: "deploy_88_infra",
    run: "deploy_88",
    timestamp: "1h ago",
    repoName: "infrastructure",
    repoPath: "scrubbe/terraform-main",
    service: "aws-provider",
    metadata: { pr: "pr #132", sha: "sha beef123", env: "env staging" },
    status: { label: "failed", type: "error", subLabel: "Approval required" },
    trigger: { title: "Deploy", description: "Deploy • Increase DB pool size" },
    details: {
      incidentStatus: "active • S1",
      stages: [
        { name: "tf-plan", status: "success" },
        { name: "tf-apply", status: "error" },
        { name: "cost-estimation", status: "warning" },
      ],
      codeEngine: {
        id: "CE-5566X99P",
        confidence: "0.99",
        risk: "Critical",
        paths: "/terraform/rds/**",
      },
      affectedFiles: ["terraform/rds/main.tf"],
      gateReason:
        "Critical infrastructure change. Requires Senior SRE approval.",
    },
    evidence: { runUrl: "#", logsUrl: "#", incidentId: "INC-11B0DE88" },
  },
  {
    id: "run_315_gateway",
    run: "run_315",
    timestamp: "2h ago",
    repoName: "api-gateway",
    repoPath: "scrubbe/api-gateway",
    service: "edge-auth",
    metadata: { pr: "pr #140", sha: "sha a1b2c3d", env: "env pr" },
    status: { label: "Warning", type: "warning", subLabel: "Internal Flake" },
    trigger: {
      title: "PR#140",
      description: "PR#140 • Update JWT validation logic",
    },
    details: {
      incidentStatus: "monitoring • S3",
      stages: [
        { name: "lint", status: "success" },
        { name: "type-check", status: "warning" },
        { name: "e2e-tests", status: "success" },
      ],
      codeEngine: {
        id: "CE-4433Z11L",
        confidence: "0.74",
        risk: "Med",
        paths: "No sensitive paths",
      },
      affectedFiles: ["middleware/auth.ts"],
      gateReason:
        "Validation logic changed. Verification tests passed but linting warnings present.",
    },
    evidence: { runUrl: "#", logsUrl: "#", incidentId: "INC-77C12F00" },
  },
];
