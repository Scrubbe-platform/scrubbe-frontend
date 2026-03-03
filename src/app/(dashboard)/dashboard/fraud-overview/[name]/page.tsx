"use client";
import AlertTriggerbyRuleDetails from "@/components/dashboard/FraudOverview/AlertTriggerbyRule/AlertTriggerbyRuleDetails";
import ApiEndpointsAccessFrequencyDetails from "@/components/dashboard/FraudOverview/ApiEndpointsAccessFrequency/ApiEndpointsAccessFrequencyDetails";
import ApiEndpointsUserRoleDetails from "@/components/dashboard/FraudOverview/ApiEndpointsUserRole/ApiEndpointsUserRoleDetails";
import CountrySeverityScoreDetails from "@/components/dashboard/FraudOverview/CountrySeverityScore/CountrySeverityScoreDetails";
import GeoImpossibleLoginDetails from "@/components/dashboard/FraudOverview/GeoImpossibleLogin/GeoImpossibleLoginDetails";
import IpAddressDetectionFlagsDetails from "@/components/dashboard/FraudOverview/IpAddressDetectionFlags/IpAddressDetectionFlagsDetails";
import IPAddressMultipleAccountDetails from "@/components/dashboard/FraudOverview/IPAddressMultipleAccount/IPAddressMultipleAccountDetails";
import LoginByLocationDetails from "@/components/dashboard/FraudOverview/LoginByLocation/LoginByLocationDetails";
import LoginFromUnsualLocationDetails from "@/components/dashboard/FraudOverview/LoginFromUnsualLocation/LoginFromUnsualLocationDetails";
import MultipleFailedLoginAttempDetails from "@/components/dashboard/FraudOverview/MultipleFailedLoginAttempt/MultipleFailedLoginAttempDetails";
import PasswordGuessDetails from "@/components/dashboard/FraudOverview/PasswordGuess/PasswordGuessDetails";
import SessionIdVsDurationDetails from "@/components/dashboard/FraudOverview/SessionIdVsDuration/SessionIdVsDurationDetails";
import SpeedVsLoginPointDetails from "@/components/dashboard/FraudOverview/SpeedVsLoginPointChart/SpeedVsLoginPointDetails";
import TimestampVsFingerprintChangesDetails from "@/components/dashboard/FraudOverview/TimestampVsFingerprintChanges/TimestampVsFingerprintChangesDetails";
import TimeVsSessionTokensDetails from "@/components/dashboard/FraudOverview/TimeVsSessionTokens/TimeVsSessionTokensDetails";
import TimVsNumberUniquePermissionDetails from "@/components/dashboard/FraudOverview/TimVsNumberUniquePermission/TimVsNumberUniquePermissionDetails";
import UsefulIpTrafficDetails from "@/components/dashboard/FraudOverview/UsefulIpTraffic/UsefulIpTrafficDetails";
import UserIdUniqueFingerprintsDetails from "@/components/dashboard/FraudOverview/UserIdUniqueFingerprints/UserIdUniqueFingerprintsDetails";
import UserVsTimeOfDayDetails from "@/components/dashboard/FraudOverview/UserVsTimeOfDay/UserVsTimeOfDayDetails";
import { useChart } from "@/lib/stores/chart.store";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const FraudOverviewPage = () => {
  const { name } = useParams();

  const router = useRouter();
  const { tabs, removeTab } = useChart();
  let content: React.ReactNode;

  switch (name) {
    case "multiple-failed-login-attempts":
      content = <MultipleFailedLoginAttempDetails />;
      break;
    case "login-attempts-from-unusual-locations":
      content = <LoginFromUnsualLocationDetails />;
      break;
    case "high-velocity-password-guess":
      content = <PasswordGuessDetails />;
      break;
    case "ipaddress-targeting-multiple-accounts":
      content = <IPAddressMultipleAccountDetails />;
      break;
    case "geographical-impossible-logins":
      content = <GeoImpossibleLoginDetails />;
      break;
    case "travel-velocity-analysis":
      content = <SpeedVsLoginPointDetails />;
      break;
    case "alert-triggered-by-rule":
      content = <AlertTriggerbyRuleDetails />;
      break;
    case "first-time-devices-used-per-user":
      content = <UserIdUniqueFingerprintsDetails />;
      break;
    case "browser-fingerprint-mismatch":
      content = <TimestampVsFingerprintChangesDetails />;
      break;
    case "multiple-users-from-same-device":
      content = <IPAddressMultipleAccountDetails />;
      break;
    case "session-reuse-across-users":
      content = <TimeVsSessionTokensDetails />;
      break;
    case "abnormally-sessions":
      content = <SessionIdVsDurationDetails />;
      break;
    case "login-times-vs-user-schedule":
      content = <UserVsTimeOfDayDetails />;
      break;
    case "suspicious-access-to-rarely-used-endpoints":
      content = <ApiEndpointsAccessFrequencyDetails />;
      break;
    case "sudden-increase-in-permissions-used":
      content = <TimVsNumberUniquePermissionDetails />;
      break;
    case "endpoint-vs-user-role":
      content = <ApiEndpointsUserRoleDetails />;
      break;
    case "country-vs-severity-score":
      content = <CountrySeverityScoreDetails />;
      break;
    case "ipaddress-vs-detection-flag":
      content = <IpAddressDetectionFlagsDetails />;
      break;
    case "network-traffic-by-ipaddress-overtime":
      content = <UsefulIpTrafficDetails />;
      break;
    case "logins-by-location-overtime":
      content = <LoginByLocationDetails />;
      break;

    default:
      content = <div>{name}</div>;
      break;
  }
  return (
    <div className={`p-6`}>
      <div className="flex items-center justify-between mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <h1
          onClick={() => router.back()}
          className="text-2xl cursor-pointer font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
        >
          <ChevronLeft /> Back to dashboard
        </h1>
        {/* You can add actual navigation here */}
      </div>

      {/* Filters and Search Bar Section */}
      <div className="mb-8">
        {/* Active Filters / Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((value) => (
            <span
              onClick={() => {
                if (value.value !== name)
                  router.replace(`/dashboard/fraud-overview/${value.value}`);
              }}
              key={value.value}
              className={clsx(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ",
                value.value === name
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 cursor-not-allowed"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 cursor-pointer opacity-50 hover:opacity-100"
              )}
            >
              {value.label}

              {value.value !== name && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(value);
                  }}
                  className="ml-2 -mr-1 text-blue-500 hover:text-blue-700 dark:text-blue-200 dark:hover:text-blue-400"
                >
                  <span className=" text-white">|</span> &times;
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Search Bar */}
      </div>

      {content}
    </div>
  );
};

export default FraudOverviewPage;
