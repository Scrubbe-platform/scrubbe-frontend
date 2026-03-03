"use client";
import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/StoreProvider";
import { useFingerprintDisplay } from "@/lib/fingerprint/fingerprintdisplay";

const CookieConsentModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState("cookie-preferences");
  const [showDetailedSettings, setShowDetailedSettings] = useState(false);
  const { handleRetry } = useFingerprintDisplay();

  const {
    cookiePreferences,
    showCookieModal,
    setShowCookieModal,
    acceptAllCookies,
    acceptEssentialOnly,
    setCookiePreferences,
    updateCookiePreference,
  } = useAppStore((state) => state);

  useEffect(() => {
    const checkExistingConsent = () => {
      const hasCookieConsent = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("cookie_consent="));

      if (!hasCookieConsent) {
        setShowCookieModal(true);
      }
    };

    checkExistingConsent();
  }, [setShowCookieModal]);

  const handleAcceptAll = () => {
    acceptAllCookies();
    handleRetry();
  };

  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    handleRetry();
  };

  const handleSavePreferences = () => {
    setCookiePreferences(cookiePreferences);
    handleRetry();
  };

  const handleToggleChange = (category: keyof typeof cookiePreferences) => {
    if (category === "essential") return;

    updateCookiePreference(category, !cookiePreferences[category]);
    handleRetry();
  };

  if (!showCookieModal) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 transform ">
      {/* Simple Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white bg-opacity-95 border-t shadow-lg">
        <div className="flex-1 mb-4 md:mb-0 md:mr-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cookie & Privacy Settings
          </h2>
          <p className="text-gray-700">
            Scrubbe uses cookies and similar technologies to enhance your
            experience, analyze traffic, and enable personalized content. Choose
            your preferences below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition hover:bg-blue-700"
          >
            Accept All
          </button>
          <button
            onClick={() => setShowDetailedSettings(true)}
            className="px-4 py-2 border border-gray-400 text-gray-600 font-medium rounded-lg transition hover:bg-gray-100"
          >
            Customize Settings
          </button>
          <button
            onClick={handleEssentialOnly}
            className="px-4 py-2 border border-gray-400 text-gray-600 font-medium rounded-lg transition hover:bg-gray-100"
          >
            Essential Only
          </button>
        </div>
      </div>

      {/* Detailed Settings Tabs */}
      {showDetailedSettings && (
        <div className="w-full bg-white border-t">
          {/* Tab Navigation */}
          <div className="flex border-b bg-gray-100">
            {["cookie-preferences", "privacy-policy", "cookie-policy"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-4 text-sm font-semibold border-b-2 transition ${
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

          {/* Tab Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Cookie Preferences Tab */}
            {activeTab === "cookie-preferences" && (
              <div>
                {/* Essential Cookies */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Essential Cookies
                    </h3>
                    <div className="relative w-12 h-6">
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
                          className={`absolute h-5 w-5 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                            cookiePreferences.essential ? "translate-x-6" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    These cookies are necessary for the website to function
                    properly. They cannot be disabled.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Analytics Cookies
                    </h3>
                    <div className="relative w-12 h-6">
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
                          className={`absolute h-5 w-5 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                            cookiePreferences.analytics ? "translate-x-6" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    These cookies help us understand how visitors interact with
                    the website, helping us improve our services.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Functional Cookies
                    </h3>
                    <div className="relative w-12 h-6">
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
                          className={`absolute h-5 w-5 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                            cookiePreferences.functional ? "translate-x-6" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    These cookies enable personalized features and notifications
                    to enhance your experience.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Marketing Cookies
                    </h3>
                    <div className="relative w-12 h-6">
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
                          className={`absolute h-5 w-5 bg-white rounded-full transform transition top-0.5 left-0.5 ${
                            cookiePreferences.marketing ? "translate-x-6" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    These cookies are used to track visitors across websites to
                    display relevant advertisements.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition hover:bg-blue-700"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowDetailedSettings(false)}
                    className="px-4 py-2 border border-gray-400 text-gray-600 font-medium rounded-lg transition hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Policy Tab - Content remains the same */}
            {activeTab === "privacy-policy" && (
              <div className="text-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Privacy Policy for Scrubbe
                </h3>
                <p className="mb-4">Effective Date: March 31, 2025</p>

                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                  1. Introduction
                </h3>
                <p className="mb-4">
                  Welcome to Scrubbe. We respect your privacy and are committed
                  to protecting your personal data. This Privacy Policy explains
                  how we collect, use, disclose, and safeguard your information
                  when you use our SIEM and SOAR platform.
                </p>

                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                  2. Data We Collect
                </h3>
                <p className="mb-2">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-1">
                    <span className="font-semibold">Personal Information:</span>{" "}
                    Name, email address, phone number, job title, and company
                    name.
                  </li>
                  <li className="mb-1">
                    <span className="font-semibold">Log Data:</span> IP
                    addresses, device information, browser type, pages visited,
                    and time spent on pages.
                  </li>
                  <li className="mb-1">
                    <span className="font-semibold">Security Event Data:</span>{" "}
                    System logs, network traffic data, and security alerts
                    processed by our platform.
                  </li>
                  <li className="mb-1">
                    <span className="font-semibold">
                      Cookies and Similar Technologies:
                    </span>{" "}
                    Information collected through cookies, web beacons, and
                    similar technologies.
                  </li>
                </ul>

                {/* Additional privacy policy sections would go here */}

                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
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

            {/* Cookie Policy Tab - Content remains the same */}
            {activeTab === "cookie-policy" && (
              <div className="text-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Cookie Policy for Scrubbe
                </h3>
                <p className="mb-4">Effective Date: March 31, 2025</p>

                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                  1. What Are Cookies
                </h3>
                <p className="mb-4">
                  Cookies are small text files that are placed on your device
                  when you visit a website. They are widely used to make
                  websites work more efficiently and provide information to the
                  website owners.
                </p>

                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                  2. Types of Cookies We Use
                </h3>

                <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2">
                  Essential Cookies
                </h3>
                <p className="mb-2">
                  These cookies are necessary for the website to function
                  properly. They enable core functionality such as security,
                  network management, and account access. You cannot opt out of
                  these cookies.
                </p>
                <p className="mb-2">Examples include:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-1">
                    <span className="font-semibold">session_id:</span> Maintains
                    your session while you use our platform
                  </li>
                  <li className="mb-1">
                    <span className="font-semibold">csrf_token:</span> Helps
                    prevent cross-site request forgery attacks
                  </li>
                  <li className="mb-1">
                    <span className="font-semibold">auth_token:</span> Remembers
                    your login status
                  </li>
                </ul>

                {/* Additional cookie policy sections would go here */}

                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
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
      )}
    </div>
  );
};

export default CookieConsentModal;
