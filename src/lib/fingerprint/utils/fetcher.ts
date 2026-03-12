import { FingerprintResponse } from "@/types/response.type";

const baseURL = "https://scrubbe-server-9z77.onrender.com/api/v1";
export const fetchFingerprint = async (): Promise<FingerprintResponse> => {
  const response = await fetch(`${baseURL}/system-info`, {
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
