/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { getFingerprintWithConsent } from "@/lib/fingerprint/utils/handler";
import { FingerprintResponse } from "@/types/response.type";

export const useFingerprintDisplay = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintResponse>();
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        setLoading(true);
        const { fingerprint, hasConsent } = await getFingerprintWithConsent();
        setFingerprint(fingerprint);
        setHasConsent(hasConsent);
      } catch (err) {
        console.error(err);
        setError("Failed to load fingerprint data");
      } finally {
        setLoading(false);
      }
    };

    loadFingerprint();
  }, []);

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    try {
      const { fingerprint, hasConsent } = await getFingerprintWithConsent();
      setFingerprint(fingerprint);
      setHasConsent(hasConsent);
    } catch (err) {
      setError("Failed to load fingerprint data");
    } finally {
      setLoading(false);
    }
  };

  const formattedItems = [
    {
      label: "VPN/Proxy Status",
      value: fingerprint?.data.network.isProxy ? "Detected" : "Not Detected",
    },
    {
      label: "Device Type",
      value: fingerprint?.data.device.deviceType || "Unavailable",
    },
    {
      label: "Connection asn",
      value: fingerprint?.data.usersDetails?.connection.asn || "Unavailable",
    },
    {
      label: "Connection isp",
      value: fingerprint?.data.usersDetails?.connection.isp || "Unavailable",
    },
    {
      label: "Timestamp",
      value: new Date().toLocaleString(),
    },
    {
      label: "OS Model",
      value: fingerprint?.data.device.os || "Unavailable",
    },
    {
      label: "IP Address",
      value:
        fingerprint?.data.ip ||
        fingerprint?.data.usersDetails?.ip ||
        "Unavailable",
    },
    {
      label: "Country",
      value: fingerprint?.data.usersDetails?.continent_name || "Unavailable",
    },
    {
      label: "Region/City",
      value:
        fingerprint?.data.usersDetails?.region_name &&
        fingerprint?.data.usersDetails?.city
          ? `${fingerprint?.data.usersDetails?.region_name}/${fingerprint?.data.usersDetails?.city}`
          : "Unknown",
    },
    {
      label: "Browser Information",
      value: fingerprint?.data.device.browser || "Unavailable",
    },
    {
      label: "ISP",
      value: fingerprint?.data.usersDetails?.connection.isp || "Unavailable",
    },
    {
      label: "Network Provider",
      value:
        (fingerprint?.data?.usersDetails as any)?.networkProvider ||
        "Unavailable",
    },
    {
      label: "User Fingerprint ID",
      value: (fingerprint?.data?.usersDetails as any)?.userId || "Unavailable",
    },
    {
      label: "Device Trust Score",
      value: fingerprint?.data?.network.isProxy ? "0%" : "100%",
    },
  ];

  return {
    hasConsent,
    error,
    loading,
    fingerprint,
    formattedItems,
    handleRetry,
  };
};
