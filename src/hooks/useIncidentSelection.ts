"use client";

import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation";

type SetIncidentOptions = {
  replace?: boolean;
  preserveTab?: boolean;
};

const getFirstParamValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export const useIncidentSelection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const routeIncidentId = getFirstParamValue(params?.id as string | string[] | undefined);
  const queryIncidentId = searchParams.get("id");
  const incidentId = queryIncidentId ?? routeIncidentId ?? null;
  const currentTab = searchParams.get("tab") ?? "overview";

  const buildSearchParams = (nextIncidentId?: string | null, options?: SetIncidentOptions) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (nextIncidentId) {
      nextParams.set("id", nextIncidentId);
      if (options?.preserveTab === false) {
        nextParams.delete("tab");
      }
    } else {
      nextParams.delete("id");
    }

    return nextParams;
  };

  const setSelectedIncident = (nextIncidentId: string, options?: SetIncidentOptions) => {
    const nextParams = buildSearchParams(nextIncidentId, options);
    const target = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

    if (options?.replace === false) {
      router.push(target);
      return;
    }

    router.replace(target);
  };

  const clearSelectedIncident = () => {
    const nextParams = buildSearchParams(null);
    nextParams.delete("tab");
    const target = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(target);
  };

  return {
    incidentId,
    currentTab,
    pathname,
    routeIncidentId,
    queryIncidentId,
    setSelectedIncident,
    clearSelectedIncident,
  };
};
