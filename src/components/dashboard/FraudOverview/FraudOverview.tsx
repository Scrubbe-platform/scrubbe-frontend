"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import { ChevronDown, Clock1, Redo2, Search } from "lucide-react";
import React from "react";
import MultipleFailedLoginAttemptChart from "./MultipleFailedLoginAttempt/MultipleFailedLoginAttemptChart";
import LoginFromUnsualLocationChart from "./LoginFromUnsualLocation/LoginFromUnsualLocationChart";
import PasswordGuess from "./PasswordGuess/PasswordGuessChart";
import IPAddressMultipleAccountChart from "./IPAddressMultipleAccount/IPAddressMultipleAccountChart";
import GeoImpossibleLoginChart from "./GeoImpossibleLogin/GeoImpossibleLoginChart";
import SpeedVsLoginpointsChart from "./SpeedVsLoginPointChart/SpeedVsLoginPointChart";
import AlertTriggerbyRuleChart from "./AlertTriggerbyRule/AlertTriggerbyRuleChart";
import UserIdUniqueFingerprintsChart from "./UserIdUniqueFingerprints/UserIdUniqueFingerprintsChart";
import TimestampVsFingerprintChangesChart from "./TimestampVsFingerprintChanges/TimestampVsFingerprintChangesChart";
import IpAddressesVsAccountsChart from "./IpAddressesVsAccounts/IpAddressesVsAccountsChart";
import TimeVsSessionTokensChart from "./TimeVsSessionTokens/TimeVsSessionTokensChart";
import SessionIdVsDurationChart from "./SessionIdVsDuration/SessionIdVsDurationChart";
import UserVsTimeOfDayChart from "./UserVsTimeOfDay/UserVsTimeOfDayChart";
import ApiEndpointsAccessFrequencyChart from "./ApiEndpointsAccessFrequency/ApiEndpointsAccessFrequencyChart";
import TimVsNumberUniquePermissionChart from "./TimVsNumberUniquePermission/TimVsNumberUniquePermissionChart";
import ApiEndpointsUserRoleChart from "./ApiEndpointsUserRole/ApiEndpointsUserRoleChart";
import CountrySeverityScoreChart from "./CountrySeverityScore/CountrySeverityScoreChart";
import IpAddressDetectionFlagsChart from "./IpAddressDetectionFlags/IpAddressDetectionFlagsChart";
import LoginByLocationChart from "./LoginByLocation/LoginByLocationChart";
import UsefulIpTrafficChart from "./UsefulIpTraffic/UsefulIpTrafficChart";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useChart } from "@/lib/stores/chart.store";

const FraudOverview = () => {
  const router = useRouter();
  const { setTab } = useChart();
  return (
    <div className="p-4">
      <div className=" flex justify-between items-center">
        <div className="text-2xl font-bold dark:text-white text-black">
          Fraud Detection Dashboards
        </div>

        <div className="flex items-center gap-4">
          <CButton className=" border border-colorScBlue bg-transparent text-colorScBlue hover:text-white">
            <Clock1 />
            <p>Filter by time</p>
            <ChevronDown />
          </CButton>
          <CButton className=" border border-colorScBlue bg-transparent text-colorScBlue hover:text-white">
            <Redo2 />
            <p>Refresh</p>
          </CButton>
          <CButton className=" border border-colorScBlue bg-transparent text-colorScBlue hover:text-white">
            <p>Export</p>
          </CButton>
        </div>
      </div>

      <div className=" relative max-w-lg">
        <Input
          className=" bg-white dark:bg-dark"
          placeholder="Search chart"
          icon={<Search className=" opacity-60 dark:text-white" />}
        />
      </div>
      <div className="grid grid-cols-3 gap-5 w-full text-sm">
        <div className=" col-span-2 h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Multiple Failed Login Attempts
            </p>

            <div
              onClick={() => {
                setTab({
                  value: "multiple-failed-login-attempts",
                  label: "Multiple failed login attempt",
                });
                router.push(
                  `/dashboard/fraud-overview/multiple-failed-login-attempts`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <MultipleFailedLoginAttemptChart />
        </div>
        <div className="  h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Login attempts from Unusual locations
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "login-attempts-from-unusual-locations",
                  label: "Login attempts from Unusual locations",
                });
                router.push(
                  `/dashboard/fraud-overview/login-attempts-from-unusual-locations`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <LoginFromUnsualLocationChart />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              High Velocity Password guess
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "high-velocity-password-guess",
                  label: " High Velocity Password guess",
                });
                router.push(
                  `/dashboard/fraud-overview/high-velocity-password-guess`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <PasswordGuess />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              IP Addresses targeting Multiple Accounts{" "}
            </p>

            <div
              onClick={() => {
                setTab({
                  value: "ipaddress-targeting-multiple-accounts",
                  label: "IP Addresses targeting Multiple Accounts",
                });
                router.push(
                  `/dashboard/fraud-overview/ipaddress-targeting-multiple-accounts`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <IPAddressMultipleAccountChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Geographically Impossible logins
            </p>

            <div
              onClick={() => {
                setTab({
                  value: "geographical-impossible-logins",
                  label: "Geographically Impossible logins",
                });
                router.push(
                  `/dashboard/fraud-overview/geographical-impossible-logins`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <GeoImpossibleLoginChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Travel Velocity Analysis
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "travel-velocity-analysis",
                  label: "Travel Velocity Analysis",
                });
                router.push(
                  `/dashboard/fraud-overview/travel-velocity-analysis`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <SpeedVsLoginpointsChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Alert triggered by rule{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "alert-triggered-by-rule",
                  label: "Alert triggered by rule",
                });
                router.push(
                  `/dashboard/fraud-overview/alert-triggered-by-rule`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <AlertTriggerbyRuleChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              First-time devices used per user{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "first-time-devices-used-per-user",
                  label: "First-time devices used per user",
                });
                router.push(
                  `/dashboard/fraud-overview/first-time-devices-used-per-user`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <UserIdUniqueFingerprintsChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Browser Fingerprint mismatch{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "browser-fingerprint-mismatch",
                  label: "Browser Fingerprint mismatch",
                });
                router.push(
                  `/dashboard/fraud-overview/browser-fingerprint-mismatch`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <TimestampVsFingerprintChangesChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Multiple Users from same device/IP{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "multiple-users-from-same-device",
                  label: "Multiple Users from same device/IP",
                });
                router.push(
                  `/dashboard/fraud-overview/multiple-users-from-same-device`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <IpAddressesVsAccountsChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Session reuse across users{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "session-reuse-across-users",
                  label: "Session reuse across users",
                });
                router.push(
                  `/dashboard/fraud-overview/session-reuse-across-users`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <TimeVsSessionTokensChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Abnormally long/short sessions{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "abnormally-sessions",
                  label: "Abnormally long/short sessions",
                });
                router.push(`/dashboard/fraud-overview/abnormally-sessions`);
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <SessionIdVsDurationChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Login times Vs User Schedule
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "login-times-vs-user-schedule",
                  label: "Login times Vs User Schedule",
                });
                router.push(
                  `/dashboard/fraud-overview/login-times-vs-user-schedule`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <UserVsTimeOfDayChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Suspicious access to rarely used endpoints{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "suspicious-access-to-rarely-used-endpoints",
                  label: "Suspicious access to rarely used endpoints",
                });
                router.push(
                  `/dashboard/fraud-overview/suspicious-access-to-rarely-used-endpoints`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <ApiEndpointsAccessFrequencyChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Sudden increase in permissions used
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "sudden-increase-in-permissions-used",
                  label: "Sudden increase in permissions used",
                });
                router.push(
                  `/dashboard/fraud-overview/sudden-increase-in-permissions-used`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <TimVsNumberUniquePermissionChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Endpoint vs User role{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "endpoint-vs-user-role",
                  label: "Endpoint vs User role",
                });
                router.push(`/dashboard/fraud-overview/endpoint-vs-user-role`);
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <ApiEndpointsUserRoleChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Country/Region vs Severity Score{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "country-vs-severity-score",
                  label: "Country/Region vs Severity Score",
                });
                router.push(
                  `/dashboard/fraud-overview/country-vs-severity-score`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <CountrySeverityScoreChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              IP Address vs Detection Flag{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "ipaddress-vs-detection-flag",
                  label: "IP Address vs Detection Flag",
                });
                router.push(
                  `/dashboard/fraud-overview/ipaddress-vs-detection-flag`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <IpAddressDetectionFlagsChart />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 w-full mt-5 text-sm">
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Network Traffic Volume (Mbps) by IP Address Over Time{" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "network-traffic-by-ipaddress-overtime",
                  label:
                    "Network Traffic Volume (Mbps) by IP Address Over Time",
                });
                router.push(
                  `/dashboard/fraud-overview/network-traffic-by-ipaddress-overtime`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <UsefulIpTrafficChart />
        </div>
        <div className=" h-[350px] bg-white dark:bg-dark p-4 rounded-lg border">
          <div className="flex justify-between pb-4">
            <p className="dark:text-white font-medium ">
              Number of Logins by Location Over Time (Predictable Data){" "}
            </p>
            <div
              onClick={() => {
                setTab({
                  value: "logins-by-location-overtime",
                  label: " Number of Logins by Location Over Time",
                });
                router.push(
                  `/dashboard/fraud-overview/logins-by-location-overtime`
                );
              }}
              className=" size-10 rounded-md flex justify-center items-center border dark:text-white cursor-pointer"
            >
              <BsThreeDotsVertical />
            </div>
          </div>
          <LoginByLocationChart />
        </div>
      </div>
    </div>
  );
};

export default FraudOverview;
