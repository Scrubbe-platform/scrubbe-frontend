const DEFAULT_API_BASE = "https://api.scrubbe.com";

export const normalizeApiBase = () => {
  const rawBase =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? DEFAULT_API_BASE;
  return rawBase.endsWith("/api/v1") ? rawBase : `${rawBase}/api/v1`;
};

export const ingestionUrlForSource = (source: string) =>
  `${normalizeApiBase()}/ingestion/${source}`;
