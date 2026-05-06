import { FingerprintResponse } from "@/types/response.type";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";
export const fetchFingerprint = async (): Promise<FingerprintResponse> => {
  const response = await fetch(`${baseURL}/fingerprint/system-info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
