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

const posts = [
  {
    user: {
      fullname: "Alex Johnson",
      role: "SRE Lead",
    },
    message:
      "Question: Our 'Billing Service' latency spiked $300mathrm{ms}$ at 09:15 UTC. Anyone else seeing resource contention in the `us-east-1` cluster? Metrics look odd, but no service errors reported yet.",
    tags: ["Monitoring", "Billing", "Investigating"],
    likes: 15,
    comments: [
      {
        user: {
          fullname: "Maria Lopez",
          role: "DevOps Engineer",
        },
        message:
          "I checked the autoscaling group in `us-east-1`. One node was draining around 09:10, which might explain the spike. I'm investigating the reason for the drain.",
        likes: 5,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        user: {
          fullname: "Alex Johnson",
          role: "SRE Lead",
        },
        message:
          "Thanks, Maria. Keep me posted. Let's tag this as **'Resolved'** once we confirm the drain was the root cause.",
        likes: 1,
        createdAt: new Date(Date.now() - 3000000), // 50 mins ago
      },
    ],
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
  },
  {
    user: {
      fullname: "David Chen",
      role: "Backend Engineer",
    },
    message:
      "Incident Report (Post-Mortem): The Database Failover Incident (INC-2025-0421) post-mortem draft is now live. **Key takeaway:** Need to review and update the DR runbook steps for data synchronization. Please review by EOD.",
    tags: ["Post-Mortem", "Database", "Action Item"],
    likes: 28,
    comments: [],
    createdAt: new Date(Date.now() - 10800000), // 3 hours ago
  },
  {
    user: {
      fullname: "Olamide Moraks",
      role: "Senior Devops Engineer",
    },
    message:
      "PSA: We've identified a pattern in recent incidents related to memory leaks in Node.js services running on K8s. If you're seeing **OOMKilled** errors, check your event listeners and ensure proper cleanup. Updated runbook available in the #nodejs channel.",
    tags: ["Announcement", "Kubernetes", "Node.js"],
    likes: 42,
    comments: [],
    createdAt: new Date(Date.now() - 14400000), // 4 hours ago
  },
  {
    user: {
      fullname: "Joseph Morakinyo",
      role: "Senior Devops Engineer",
    },
    message:
      "Question: Why is the `UserAuth` service showing $99.9%$ success rate but with a significant drop in RPS since the $1.5.0$ deployment? Did we miss a critical dependency change?",
    tags: ["Deployment", "Authentication", "Investigating"],
    likes: 8,
    comments: [
      {
        user: {
          fullname: "Sarah Kim",
          role: "Frontend Engineer",
        },
        message:
          "I noticed the new frontend build on `staging` is no longer calling one of the legacy UserAuth endpoints. Maybe a feature flag was accidentally rolled out? Check the release notes.",
        likes: 3,
        createdAt: new Date(Date.now() - 14000000), // 3 hours 53 mins ago
      },
    ],
    createdAt: new Date(Date.now() - 18000000), // 5 hours ago
  },
  {
    user: {
      fullname: "Emily Carter",
      role: "Product Manager",
    },
    message:
      "Update: Customer Support has flagged a critical issue where users cannot complete checkout. The error message is generic: 'Transaction Failed.' Priority 1. Who is the Incident Commander?",
    tags: ["P1", "Checkout", "Live Incident"],
    likes: 35,
    comments: [],
    createdAt: new Date(Date.now() - 21600000), // 6 hours ago
  },
  {
    user: {
      fullname: "Michael Brown",
      role: "Infrastructure Engineer",
    },
    message:
      "Question: I'm trying to reproduce a sudden spike in SQS queue size (Q-Payments). Does anyone have the exact payload structure that triggers the high processing time? Trying to isolate the message type.",
    tags: ["Queue", "SQS", "Payments"],
    likes: 12,
    comments: [],
    createdAt: new Date(Date.now() - 25200000), // 7 hours ago
  },
  {
    user: {
      fullname: "Jessica Lee",
      role: "QA Specialist",
    },
    message:
      "Follow-up: The 'Broken Image Upload' bug is back after the hotfix. It seems to only affect users with international characters in their filenames. Should we revert the fix or try another approach?",
    tags: ["Bug", "Hotfix", "Image Service"],
    likes: 6,
    comments: [],
    createdAt: new Date(Date.now() - 28800000), // 8 hours ago
  },
  {
    user: {
      fullname: "Ryan Green",
      role: "Security Analyst",
    },
    message:
      "Security Alert: We've detected a significant increase in failed login attempts originating from a specific IP range. This looks like a potential brute-force attack. Initiating rate-limiting measures immediately.",
    tags: ["Security", "Alert", "Live Incident"],
    likes: 55,
    comments: [
      {
        user: {
          fullname: "Alex Johnson",
          role: "SRE Lead",
        },
        message:
          "Acknowledged. Let's verify the rate-limiting deployment and monitor the impact on legitimate users. Keep the security channel updated.",
        likes: 10,
        createdAt: new Date(Date.now() - 28000000), // 7 hours 46 mins ago
      },
    ],
    createdAt: new Date(Date.now() - 32400000), // 9 hours ago
  },
  {
    user: {
      fullname: "Sophie Miller",
      role: "Data Scientist",
    },
    message:
      "Question: Why is the hourly data pipeline for 'User Activity' failing with a `NullPointerException`? It ran fine yesterday. Did the schema change on the source table without notification?",
    tags: ["Data Pipeline", "ETL", "Investigating"],
    likes: 9,
    comments: [],
    createdAt: new Date(Date.now() - 36000000), // 10 hours ago
  },
  {
    user: {
      fullname: "Ben Clark",
      role: "Mobile Developer",
    },
    message:
      "Update: We have a temporary fix for the iOS app crash on launch (affecting $10%$ of users on iOS $16.5$). The workaround is forcing a library refresh. Planning an emergency hotfix release for tomorrow.",
    tags: ["Mobile", "iOS", "Hotfix"],
    likes: 18,
    comments: [],
    createdAt: new Date(Date.now() - 39600000), // 11 hours ago
  },
  {
    user: {
      fullname: "Grace Hall",
      role: "Technical Writer",
    },
    message:
      "PSA: The new standardized Incident Communication Template is ready and mandatory for all P1/P2 incidents starting next week. Please familiarize yourself with the structure.",
    tags: ["Process", "Documentation", "Announcement"],
    likes: 21,
    comments: [],
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
  },
  {
    user: {
      fullname: "Kevin White",
      role: "Network Engineer",
    },
    message:
      "Question: Getting intermittent packet loss between the web servers and the load balancer in the `eu-west-2` region. Is there a scheduled maintenance or a network configuration change that was recently deployed?",
    tags: ["Network", "Investigating", "Cloud"],
    likes: 14,
    comments: [],
    createdAt: new Date(Date.now() - 46800000), // 13 hours ago
  },
  {
    user: {
      fullname: "Joseph Morakinyo",
      role: "Senior Devops Engineer",
    },
    message:
      "Action Item: The runbook for 'Redis Cluster Failure' is outdated and led to a $15$-minute delay in recovery during the last incident. I'm assigning this to the Infrastructure team for immediate review and update.",
    tags: ["Runbook", "Action Item", "Redis"],
    likes: 30,
    comments: [],
    createdAt: new Date(Date.now() - 50400000), // 14 hours ago
  },
  {
    user: {
      fullname: "Alex Johnson",
      role: "SRE Lead",
    },
    message:
      "Question: How can we better automate the rollback process for our microservices? Manual rollbacks are currently the longest step in our P2 resolution time metrics. Seeking proposals!",
    tags: ["Automation", "Process Improvement", "SRE"],
    likes: 22,
    comments: [
      {
        user: {
          fullname: "David Chen",
          role: "Backend Engineer",
        },
        message:
          "We could integrate a 'one-click rollback' button directly into our CI/CD pipeline UI, defaulting to the last known stable build. I can draft an RFC.",
        likes: 7,
        createdAt: new Date(Date.now() - 48000000), // 13 hours 20 mins ago
      },
    ],
    createdAt: new Date(Date.now() - 54000000), // 15 hours ago
  },
  {
    user: {
      fullname: "Laura Perez",
      role: "Financial Analyst",
    },
    message:
      "Incident Report: The financial reconciliation report for last month shows a $2%$ discrepancy. The anomaly seems tied to the 'Refund Processing' service. Can the team look into this urgently?",
    tags: ["Finance", "Reconciliation", "Investigating"],
    likes: 7,
    comments: [],
    createdAt: new Date(Date.now() - 57600000), // 16 hours ago
  },
  {
    user: {
      fullname: "Mark Davis",
      role: "UX Designer",
    },
    message:
      "Question: Has anyone documented the user experience impact of the recent $503$ errors? We need concrete data to prioritize engineering effort on the most customer-facing issues.",
    tags: ["UX", "Customer Impact", "Metrics"],
    likes: 11,
    comments: [],
    createdAt: new Date(Date.now() - 61200000), // 17 hours ago
  },
  {
    user: {
      fullname: "Olamide Moraks",
      role: "Senior Devops Engineer",
    },
    message:
      "Resolved: The 'High CPU Utilization' alert on the logging cluster has been resolved. Root cause was an inefficient log parsing configuration. We've rolled back the config change. Monitoring remains active.",
    tags: ["Resolved", "Logging", "Configuration"],
    likes: 38,
    comments: [],
    createdAt: new Date(Date.now() - 64800000), // 18 hours ago
  },
  {
    user: {
      fullname: "Chris Taylor",
      role: "Product Owner",
    },
    message:
      "Feedback Request: We are reviewing our incident severity matrix. Do you feel the current criteria accurately reflects the business impact? Please share your thoughts by Friday.",
    tags: ["Process", "Feedback", "SOP"],
    likes: 19,
    comments: [],
    createdAt: new Date(Date.now() - 68400000), // 19 hours ago
  },
  {
    user: {
      fullname: "Samantha Wong",
      role: "Database Administrator",
    },
    message:
      "Question: Why are there so many stalled connections to the read replica of the primary customer DB? Is the connection pool configured correctly on the application side after the recent update?",
    tags: ["Database", "Connection Pool", "Investigating"],
    likes: 16,
    comments: [
      {
        user: {
          fullname: "Michael Brown",
          role: "Infrastructure Engineer",
        },
        message:
          "We increased the connection timeout in the last deployment, but perhaps not the max pool size. I'm checking the config file now.",
        likes: 4,
        createdAt: new Date(Date.now() - 67000000), // 18 hours 36 mins ago
      },
    ],
    createdAt: new Date(Date.now() - 72000000), // 20 hours ago
  },
  {
    user: {
      fullname: "Daniel Rodriguez",
      role: "System Analyst",
    },
    message:
      "Outage Alert (P1): All users are currently unable to access the main application dashboard. Status page has been updated. Join the bridge call for real-time updates. Incident Commander: Alex Johnson.",
    tags: ["P1", "Outage", "Dashboard"],
    likes: 60,
    comments: [],
    createdAt: new Date(Date.now() - 75600000), // 21 hours ago
  },
];

const TOP_N = 6;

// 1. Use reduce to build a map (object) of tag counts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tagCounts = posts.reduce((accumulator: any, post) => {
  // Check for tags existence and iterate over them
  if (post.tags) {
    post.tags.forEach((tag) => {
      const normalizedTag = tag.trim();
      // Increment the count or initialize it to 1
      accumulator[normalizedTag] = (accumulator[normalizedTag] || 0) + 1;
    });
  }
  return accumulator;
}, {}); // Initial accumulator is an empty object {}

// 2. Convert the count object to an array of [tag, count] pairs, sort by count, and extract the top N
const mostPopularTags = Object.entries(tagCounts)
  // Sort in descending order (highest count first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .sort(([, countA]: any, [, countB]: any) => countB - countA)
  // Select the top N tags
  .slice(0, TOP_N)
  // Map the result back to just an array of tag names
  .map(([tag]) => tag);

const Community = () => {
  const [isNewPostModal, setIsNewPostModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [allPost, setAllPost] = useState(posts);
  const { user } = useAuthStore();
  const { setOpen } = useCommunityAuth();

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const filterPosts = useCallback((tag: string) => {
    let items = posts;
    items = items.filter((item) => {
      if (item.tags.includes(tag)) return item;
    });
    setAllPost(items);
  }, []);

  const authGuard = (fn: () => void) => {
    if (!user) {
      setOpen(true, "signin");
    } else {
      fn();
    }
  };
  return (
    <div className="mx-auto container p-2 md:p-10 rounded-lg bg-gray-50">
      <div className="p-2 gap-3 bg-[url('/IMS/portal-auth-bg.jpg')] w-full h-[300px] rounded-2xl bg-center flex flex-col items-center justify-center ">
        <h1 className=" text-4xl md:text-6xl font-bold text-white text-center">
          Scrubbe Community
        </h1>
        <p className=" text-white text-lg text-center">
          Where Devs, SREs, and Security Teams connect, share, and grow.
        </p>
        <div
          onClick={() => authGuard(() => setIsNewPostModal(true))}
          className=" px-4 py-2 bg-white text-IMSLightGreen text-lg rounded-md font-bold mt-2 cursor-pointer"
        >
          Make A Post
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr,.5fr] mt-10 gap-10">
        <div className="flex gap-4 flex-col">
          {allPost.map((post, index) => (
            <MessageContent post={post} key={index} />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-4 space-y-3">
            <p className="font-medium text-lg">Trending Posts</p>
            <EmptyState
              title="No Trending Posts"
              description="Check back here to get trending posts."
            />
          </div>
          <div className="rounded-xl bg-white p-4 space-y-3">
            <p className="font-medium text-lg">Scrubbe Announcements</p>
            <EmptyState
              title="No Announcements"
              description="Check back here to get our daily anouncements."
            />
          </div>

          <div className="rounded-xl bg-white p-4 space-y-3">
            <p className="font-medium text-lg">Popular Tags</p>
            <div className="flex flex-wrap gap-3">
              {mostPopularTags.map((tag, index) => (
                <div
                  className=" cursor-pointer px-4 py-2 bg-neutral-100 text-neutral-600 text-sm rounded-md"
                  key={index}
                  onClick={() => filterPosts(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isNewPostModal} onClose={() => setIsNewPostModal(false)}>
        <div className="flex flex-col gap-3">
          <p className=" font-medium text-lg">Create Post</p>
          <p className=" text-base">
            Share an incident update, learning, or ask the community for help
          </p>

          <TextArea
            label="Content"
            placeholder="Share incident details, Learnings or questions"
            required
            rows={6}
          />

          <div className="space-y-2 -mt-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
              Tags
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Enter a tag"
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:border-zinc-600 dark:bg-themeBg-50 dark:text-white"
              />
              <CButton className=" !w-fit" type="button" onClick={addTag}>
                Add Tag
              </CButton>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-primary-800 dark:bg-primary-900/20 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-1 text-xs dark:text-primary-400"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-600"
                    >
                      <LuX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-end gap-3 mt-3">
              <CButton
                className="w-fit px-5 border border-IMSLightGreen bg-white text-IMSLightGreen hover:text-white"
                onClick={() => setIsNewPostModal(false)}
              >
                Close
              </CButton>
              <CButton className="w-fit px-5">Post</CButton>
            </div>
          </div>
        </div>
      </Modal>

      <SignIn />
      <SignUp />
      <ForgotPassword />
    </div>
  );
};

export default Community;
