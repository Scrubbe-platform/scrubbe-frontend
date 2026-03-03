"use client";
import React, { useState } from "react";
import { useAppStore } from "@/store/StoreProvider";
import { RxCookie } from "react-icons/rx";

const CookieToggleButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cookie-preferences");

  // Get cookie-related state and actions from Zustand
  const {
    cookiePreferences,
    acceptAllCookies,
    acceptEssentialOnly,
    setCookiePreferences,
    updateCookiePreference,
  } = useAppStore((state) => state);

  // Handle different button clicks
  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsDialogOpen(false);
  };

  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    setIsDialogOpen(false);
  };

  const handleSavePreferences = () => {
    setCookiePreferences(cookiePreferences);
    setIsDialogOpen(false);
  };

  const handleToggleChange = (category: keyof typeof cookiePreferences) => {
    // Don't toggle essential cookies
    if (category === "essential") return;
    updateCookiePreference(category, !cookiePreferences[category]);
  };

  return (
    <>
      {/* Cookie toggle button */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-3 left-3 z-50 w-12 h-12 rounded-full text-white bg-colorScBlack hover:bg-blue-700 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none"
        aria-label="Cookie Settings"
      >
        <RxCookie className="w-6 h-6 fill-white" />
      </button>

      {/* Backdrop overlay */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-md bg-black/40 transition-opacity duration-300"
          onClick={() => setIsDialogOpen(false)}
        />
      )}

      {/* Cookie dialog box - Compact with max height 475px */}
      <div
        className={`fixed inset-x-4 mx-auto top-4 md:top-10 z-50 w-auto max-w-xl bg-white rounded-lg shadow-xl transition-all duration-300 max-h-[475px] flex flex-col ${
          isDialogOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-5 pointer-events-none"
        }`}
      >
        {/* Cookie dialog header - Compact */}
        <div className="bg-blue-600 text-white p-2 flex justify-between items-center rounded-t-lg flex-shrink-0">
          <div className="font-semibold flex items-center gap-1 text-sm">
            <RxCookie className="w-4 h-4 fill-white" />
            Cookie Settings
          </div>
          <button
            onClick={() => setIsDialogOpen(false)}
            className="text-white text-xl p-1 hover:bg-blue-700 rounded"
            aria-label="Close cookie settings"
          >
            ×
          </button>
        </div>

        {/* Simple Banner - Compact */}
        <div className="flex flex-col p-3 border-b flex-shrink-0">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Cookie & Privacy Settings
            </h2>
            <p className="text-sm text-gray-700">
              Scrubbe uses cookies and similar technologies to enhance your
              experience, analyze traffic, and enable personalized content.
              Choose your preferences below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAcceptAll}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg transition hover:bg-blue-700"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              className="px-3 py-1.5 border border-gray-400 text-gray-600 text-sm font-medium rounded-lg transition hover:bg-gray-100"
            >
              Essential Only
            </button>
          </div>
        </div>

        {/* Tab Navigation - Compact */}
        <div className="flex flex-wrap border-b bg-gray-100 flex-shrink-0">
          {["cookie-preferences", "privacy-policy", "cookie-policy"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-blue-800 hover:bg-gray-200"
                }`}
              >
                {tab
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            )
          )}
        </div>

        {/* Tab Content - Scrollable area */}
        <div className="p-3 overflow-y-auto flex-1 min-h-0">
          {/* Cookie Preferences Tab */}
          {activeTab === "cookie-preferences" && (
            <div>
              {/* Essential Cookies */}
              <div className="mb-3 pb-2 border-b border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Essential Cookies
                  </h3>
                  <div className="relative w-10 h-5">
                    <input
                      type="checkbox"
                      className="opacity-0 w-0 h-0"
                      checked={cookiePreferences.essential}
                      disabled
                    />
                    <span
                      className={`absolute inset-0 rounded-full transition ${
                        cookiePreferences.essential
                          ? "bg-green-500"
                          : "bg-gray-300"
                      } opacity-50 cursor-not-allowed`}
                    >
                      <span
                        className={`absolute h-4 w-4 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                          cookiePreferences.essential ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  These cookies are necessary for the website to function
                  properly. They cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="mb-3 pb-2 border-b border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Analytics Cookies
                  </h3>
                  <div className="relative w-10 h-5">
                    <input
                      type="checkbox"
                      className="opacity-0 w-0 h-0"
                      checked={cookiePreferences.analytics}
                      onChange={() => handleToggleChange("analytics")}
                    />
                    <span
                      onClick={() => handleToggleChange("analytics")}
                      className={`absolute inset-0 rounded-full transition cursor-pointer ${
                        cookiePreferences.analytics
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                          cookiePreferences.analytics ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  These cookies help us understand how visitors interact with
                  the website, helping us improve our services.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="mb-3 pb-2 border-b border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Functional Cookies
                  </h3>
                  <div className="relative w-10 h-5">
                    <input
                      type="checkbox"
                      className="opacity-0 w-0 h-0"
                      checked={cookiePreferences.functional}
                      onChange={() => handleToggleChange("functional")}
                    />
                    <span
                      onClick={() => handleToggleChange("functional")}
                      className={`absolute inset-0 rounded-full transition cursor-pointer ${
                        cookiePreferences.functional
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                          cookiePreferences.functional ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  These cookies enable personalized features and notifications
                  to enhance your experience.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Marketing Cookies
                  </h3>
                  <div className="relative w-10 h-5">
                    <input
                      type="checkbox"
                      className="opacity-0 w-0 h-0"
                      checked={cookiePreferences.marketing}
                      onChange={() => handleToggleChange("marketing")}
                    />
                    <span
                      onClick={() => handleToggleChange("marketing")}
                      className={`absolute inset-0 rounded-full transition cursor-pointer ${
                        cookiePreferences.marketing
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute h-4 w-4 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                          cookiePreferences.marketing ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  These cookies are used to track visitors across websites to
                  display relevant advertisements.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={handleSavePreferences}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg transition hover:bg-blue-700"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-3 py-1.5 border border-gray-400 text-gray-600 text-xs font-medium rounded-lg transition hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Privacy Policy Tab - Compact */}
          {activeTab === "privacy-policy" && (
            <div className="text-xs">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Privacy Policy for Scrubbe
              </h3>
              <p className="mb-3 text-gray-600">
                Effective Date: March 31, 2025
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1">
                1. Introduction
              </h3>
              <p className="mb-3">
                Welcome to Scrubbe. We respect your privacy and are committed to
                protecting your personal data. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your information when
                you use our SIEM and SOAR platform.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1">
                2. Data We Collect
              </h3>
              <p className="mb-2">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-4 mb-3 space-y-1">
                <li>
                  <span className="font-semibold">Personal Information:</span>{" "}
                  Name, email address, phone number, job title, and company
                  name.
                </li>
                <li>
                  <span className="font-semibold">Log Data:</span> IP addresses,
                  device information, browser type, pages visited, and time
                  spent on pages.
                </li>
                <li>
                  <span className="font-semibold">Security Event Data:</span>{" "}
                  System logs, network traffic data, and security alerts
                  processed by our platform.
                </li>
                <li>
                  <span className="font-semibold">
                    Cookies and Similar Technologies:
                  </span>{" "}
                  Information collected through cookies, web beacons, and
                  similar technologies.
                </li>
              </ul>

              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                <p className="mb-2">
                  If you have any questions about this Privacy Policy, please
                  contact us at:
                </p>
                <p>
                  Scrubbe, Inc.
                  <br />
                  Email: privacy@scrubbe.com
                  <br />
                  Address: 43 Thames Street, London United Kingdom GB
                </p>
              </div>
            </div>
          )}

          {/* Cookie Policy Tab - Compact */}
          {activeTab === "cookie-policy" && (
            <div className="text-xs">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Cookie Policy for Scrubbe
              </h3>
              <p className="mb-3 text-gray-600">
                Effective Date: March 31, 2025
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1">
                1. What Are Cookies
              </h3>
              <p className="mb-3">
                Cookies are small text files that are placed on your device when
                you visit a website. They are widely used to make websites work
                more efficiently and provide information to the website owners.
              </p>

              <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1">
                2. Types of Cookies We Use
              </h3>

              <h4 className="text-sm font-semibold text-gray-900 mt-2 mb-1">
                Essential Cookies
              </h4>
              <p className="mb-2">
                These cookies are necessary for the website to function
                properly. They enable core functionality such as security,
                network management, and account access. You cannot opt out of
                these cookies.
              </p>
              <p className="mb-1">Examples include:</p>
              <ul className="list-disc pl-4 mb-3 space-y-1">
                <li>
                  <span className="font-semibold">session_id:</span> Maintains
                  your session while you use our platform
                </li>
                <li>
                  <span className="font-semibold">csrf_token:</span> Helps
                  prevent cross-site request forgery attacks
                </li>
                <li>
                  <span className="font-semibold">auth_token:</span> Remembers
                  your login status
                </li>
              </ul>

              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                <p className="mb-2">
                  If you have any questions about our use of cookies, please
                  contact us at:
                </p>
                <p>
                  Scrubbe, Inc.
                  <br />
                  Email: cookies@scrubbe.com
                  <br />
                  Address: 43 Thames Street, London United Kingdom GB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CookieToggleButton;
