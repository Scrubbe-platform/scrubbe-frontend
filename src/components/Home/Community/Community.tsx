"use client";
import EmptyState from "@/components/ui/EmptyState";
import MessageContent from "./MessageContent";
import { useCallback, useState } from "react";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/text-area";
import { LuX } from "react-icons/lu";
import CButton from "@/components/ui/Cbutton";
import useAuthStore from "@/lib/stores/auth.store";
import { useCommunityAuth } from "@/lib/stores/useCommunityAuth";
import SignUp from "./authentication/Signup";
import SignIn from "./authentication/Signin";
import ForgotPassword from "./authentication/ForgotPassword";
import CommunityFeed from "./CommunityFeed";
import CTASection from "./CTASection";

const stats = [
  { label: "Members", value: "12,847", color: "text-orange-400" },
  { label: "Discussions", value: "1,204", color: "text-orange-400" },
  { label: "Comments", value: "8,931", color: "text-green-400" },
  { label: "Questions answered", value: "94%", color: "text-blue-400" },
  { label: "Online now", value: "47", color: "text-pink-400" },
];

const tabs = [
  { label: "All", count: 28, active: true },
  { label: "General", count: 9 },
  { label: "Help", count: 7 },
  { label: "Announcements", count: 6 },
  { label: "Feedback", count: 28 },
  { label: "Ideas", count: 28 },
  { label: "Off-topic", count: 5 },
];

const Community = () => {
  const [isNewPostModal, setIsNewPostModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [allPost, setAllPost] = useState();
  const { user } = useAuthStore();
  const { setOpen } = useCommunityAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest First");
  const [showSearch, setShowSearch] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput("");
    }
  };

  const authGuard = (fn: () => void) => {
    if (!user) {
      setOpen(true, "signin");
    } else {
      fn();
    }
  };
  return (
    <div className=" rounded-lg bg-gray-50">
      <div className="p-2 gap-3 bg-[url('/IMS/community.jpg')] bg-no-repeat bg-cover w-full h-[500px] bg-center flex flex-col justify-center md:p-10 p-4 ">
        <h1 className=" text-4xl md:text-6xl font-bold text-white leading-[100%] ">
          Where reliability <br />
          engineers <span className="text-IMSCyan">gather.</span>
        </h1>
        <p className=" text-white text-base md:text-lg max-w-sm font-bold">
          Post-mortems, EAL configurations, connector setups, governance
          patterns — turn production incidents into shared institutional
          knowledge. Open to read. Free to join
        </p>
        <div className="flex sm:flex-row flex-col items-center gap-3">
          <div
            onClick={() => authGuard(() => setIsNewPostModal(true))}
            className=" px-4 py-2 bg-gradient-to-l from-IMSLightGreen to-IMSGreen text-white text-lg rounded w-fit font-bold mt-2 cursor-pointer"
          >
            Join Community
          </div>
          <div
            onClick={() => authGuard(() => setIsNewPostModal(true))}
            className=" px-4 py-2 bg-white text-IMSLightGreen text-lg rounded w-fit font-bold mt-2 cursor-pointer"
          >
            Start a Discussion{" "}
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Mobile: 2-col grid for first 4, last item centred */}
          <div className="grid grid-cols-2 sm:hidden divide-y divide-zinc-200">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center py-4 gap-0.5
                ${
                  i % 2 === 0 && i !== stats.length - 1
                    ? "border-r border-zinc-200"
                    : ""
                }
                ${
                  i === stats.length - 1 && stats.length % 2 !== 0
                    ? "col-span-2 border-t border-zinc-200"
                    : ""
                }
              `}
              >
                <span
                  className={`text-xl font-bold tabular-nums tracking-tight ${s.color}`}
                >
                  {s.value}
                </span>
                <span className="text-[11px] text-black tracking-wide text-center px-2">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop: single row */}
          <div className="hidden sm:flex items-stretch divide-x divide-zinc-200">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-1 flex-col items-center justify-center py-5 gap-1 min-w-0"
              >
                <span
                  className={`text-2xl font-bold tabular-nums tracking-tight ${s.color}`}
                >
                  {s.value}
                </span>
                <span className="text-xs text-black tracking-wide text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* ── Row 1: Tabs + desktop search/sort ── */}
          <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3">
            {/* Tabs — scrollable on all sizes */}
            <div className="flex flex-1 items-center gap-0 overflow-x-auto scrollbar-none min-w-0">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`
                  relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                  ${
                    activeTab === i
                      ? "text-black"
                      : "text-zinc-400 hover:text-zinc-600"
                  }
                `}
                >
                  {activeTab === i && (
                    <span className="absolute inset-0 rounded-md bg-emerald-500/10 border border-emerald-500/40" />
                  )}
                  <span className="relative">{tab.label}</span>
                  <span
                    className={`relative flex h-4 sm:h-5 min-w-[1rem] sm:min-w-[1.25rem] items-center justify-center rounded text-[10px] sm:text-[11px] font-semibold px-1 ${
                      activeTab === i
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-100 text-black"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Desktop: search + sort inline */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Discussions"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-52 rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-8 text-sm text-black focus:border-zinc-400 focus:outline-none cursor-pointer"
                >
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Most Liked</option>
                  <option>Most Commented</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile: search icon toggle + sort icon */}
            <div className="flex sm:hidden items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-md transition-colors ${
                  showSearch
                    ? "bg-zinc-100 text-black"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
                aria-label="Toggle search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-8 appearance-none rounded-md border border-zinc-200 bg-white pl-2 pr-6 text-xs text-black focus:border-zinc-400 focus:outline-none cursor-pointer"
                >
                  <option value="Newest First">Newest</option>
                  <option value="Oldest First">Oldest</option>
                  <option value="Most Liked">Liked</option>
                  <option value="Most Commented">Comments</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Row 2: Mobile expanded search ── */}
          {showSearch && (
            <div className="sm:hidden pb-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Discussions"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="py-10">
        <CommunityFeed />
      </div>
      <CTASection />
      <SignIn />
      <SignUp />
      <ForgotPassword />
    </div>
  );
};

export default Community;
