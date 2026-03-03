"use client";
import React, { useState } from "react";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import SideModal from "@/components/ui/SideModal";
import TicketStatus from "@/components/ezra/Support/TicketStatus";
import RecentSubmission from "@/components/ezra/Support/RecentSubmission";

const Page = () => {
  const [tab, setTab] = useState("submit");
  const [showStatus, setShowStatus] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  return (
    <div className="w-full h-full p-4">
      <p className="text-2xl font-bold dark:text-white ">Support </p>
      <div className="w-full min-h-screen dark:bg-dark bg-white rounded-lg p-8 mt-4 space-y-4">
        <div>
          <p className="text-lg font-bold dark:text-white">
            Submit a Customer Support Ticket
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-300">
            Our customer support team will respond within 4 hours for
            High-priority issues and 24 hours for others. Please provide
            detailed information to assist us in resolving your issue quickly.
          </p>
        </div>

        {/* Settings Tabs as navigation */}
        <div className="w-full flex gap-5 border-b dark:border-gray-700 border-gray-200 bg-transparent rounded-none p-0 mb-4">
          <button
            onClick={() => setTab("submit")}
            className={` text-center py-2 text-sm font-medium transition-colors border-b-2
                ${
                  tab === "submit"
                    ? "text-blue-700 border-blue-700"
                    : "text-gray-700 border-transparent hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-700"
                }
                focus:outline-none`}
            type="button"
          >
            Submit Ticket
          </button>
          <button
            onClick={() => {
              setTab("status");
              setShowStatus(true);
            }}
            className={` text-center py-2 text-sm font-medium transition-colors border-b-2
                ${
                  tab === "status"
                    ? "text-blue-700 border-blue-700"
                    : "text-gray-700 border-transparent hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-700"
                }
                focus:outline-none`}
            type="button"
          >
            Ticket Status
          </button>
          <button
            onClick={() => {
              setTab("recent");
              setShowRecent(true);
            }}
            className={` text-center py-2 text-sm font-medium transition-colors border-b-2
                ${
                  tab === "recent"
                    ? "text-blue-700 border-blue-700"
                    : "text-gray-700 border-transparent hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-700"
                }
                focus:outline-none`}
            type="button"
          >
            Recent Submissions
          </button>
        </div>

        {/* implement it here */}
        <form className="space-y-6">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" placeholder="Your full name" />
            <Input
              label="Email"
              type="email"
              placeholder="Your email address"
            />
          </div>
          {/* Subject and Follow-Up Ticket ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Subject" placeholder="Brief Summary of the issue" />
            <div>
              <Input
                label="Follow-Up Ticket ID (Optional)"
                placeholder="e.g SCR-001"
              />
              <div className="text-xs text-gray-400 mt-1">
                Enter an existing ticket ID for follow-ups( format : SCR-XXX)
              </div>
            </div>
          </div>
          {/* Category */}
          <div>
            <Select
              label="Category"
              options={[
                { value: "", label: "Select category" },
                { value: "bug", label: "Bug Report" },
                { value: "feature", label: "Feature Request" },
                { value: "billing", label: "Billing" },
                { value: "account", label: "Account Issue" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
          {/* Issue Description */}
          <div className="space-y-2">
            <p className="dark:text-white font-medium text-sm ">Description</p>
            <textarea
              rows={4}
              placeholder="optional description of the rule"
              className="w-full bg-transparent dark:text-white border border-gray-300 rounded-md p-2 text-sm "
            />
          </div>
          {/* Attachments */}
          <div className=" space-y-2">
            <label className="block font-medium dark:text-white text-sm mb-1">
              Attachments(optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-transparent">
              <svg
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 0l-4 4m4-4l4 4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 16.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5"
                />
              </svg>
              <div className="text-gray-500 text-sm mb-2 text-center">
                Supported files : Jpeg, PNG, PDF, TXT, LOG(Max 10mb total)
              </div>
              <label className="inline-block">
                <input type="file" className="hidden" multiple />
                <span className="inline-block px-5 py-2 border border-blue-500 text-blue-600 rounded-lg cursor-pointer bg-transparent hover:bg-blue-50 transition">
                  Choose file
                </span>
              </label>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-base transition"
            >
              Submit Ticket
            </button>
          </div>
        </form>

        {showStatus && (
          <SideModal
            title="Ticket Status"
            isOpen={showStatus}
            onClose={() => setShowStatus(false)}
          >
            <TicketStatus />
          </SideModal>
        )}

        {showRecent && (
          <SideModal
            title="Recent Submissions"
            isOpen={showRecent}
            onClose={() => setShowRecent(false)}
          >
            <RecentSubmission />
          </SideModal>
        )}
      </div>
    </div>
  );
};

export default Page;
