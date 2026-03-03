"use client";
import React, { useState } from "react";
import Switch from "@/components/ui/Switch";

const Page = () => {
  // Alert Preferences
  const [criticalThreats, setCriticalThreats] = useState(true);
  const [mediumAlerts, setMediumAlerts] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  // Delivery Methods
  const [emailNotif, setEmailNotif] = useState(true);
  const [slack, setSlack] = useState(false);
  const [sms, setSms] = useState(false);

  return (
    <div className="mx-auto space-y-8">
      {/* Alert Preferences Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Alert Preferences
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Critical Threats */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Critical Threats
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Immediate alerts for critical security threats
              </div>
            </div>
            <Switch checked={criticalThreats} onChange={setCriticalThreats} />
          </div>
          {/* Medium Priority Alerts */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Medium Priority Alerts
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Notifications for medium level security events
              </div>
            </div>
            <Switch checked={mediumAlerts} onChange={setMediumAlerts} />
          </div>
          {/* Daily Security Summary */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Daily Security Summary
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Daily digest of security status and activities
              </div>
            </div>
            <Switch checked={dailySummary} onChange={setDailySummary} />
          </div>
        </div>
      </div>
      {/* Delivery Methods Card */}
      <div className="dark:bg-subDark bg-gray-50 rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">
          Delivery Methods
        </h2>
        <div className="divide-y divide-gray-200">
          {/* Email Notification */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Email Notification
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Send alerts to your email address
              </div>
            </div>
            <Switch checked={emailNotif} onChange={setEmailNotif} />
          </div>
          {/* Slack Integration */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">
                Slack Integration
              </div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Send notifications to Slack channels
              </div>
            </div>
            <Switch checked={slack} onChange={setSlack} />
          </div>
          {/* SMS Alerts */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium dark:text-white">SMS Alerts</div>
              <div className="text-gray-500 text-sm dark:text-gray-300">
                Critical alerts via SMS ( Charges may apply)
              </div>
            </div>
            <Switch checked={sms} onChange={setSms} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
