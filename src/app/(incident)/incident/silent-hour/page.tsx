"use client";
import CButton from "@/components/ui/Cbutton";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoPaperPlaneOutline } from "react-icons/io5";
import RelatedSection from "./_module/component/RelatedSection";
import QuietRules, { QuietRule } from "./_module/component/QuietRules";
import Status from "./_module/component/Status";

const Page = () => {
  const [rules, setRules] = useState<QuietRule[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { get, post, remove } = useFetch();
  const queryClient = useQueryClient();

  const { data: savedRules = [], isLoading } = useQuery<QuietRule[]>({
    queryKey: ["silent-hours"],
    queryFn: async () => {
      const res = await get(endpoint.silent_hours.get);
      if (res.success) return res.data?.data ?? [];
      return [];
    },
  });

  // Seed the editable working set from the server once on load, so
  // publishing doesn't wipe out rules the user never touched.
  useEffect(() => {
    if (!hydrated && !isLoading) {
      setRules(savedRules);
      setHydrated(true);
    }
  }, [hydrated, isLoading, savedRules]);

  const newRuleCount = rules.filter((r) => !r.id).length;

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.silent_hours.save, { rules });
      if (!res.success)
        throw new Error((res.data as string) ?? "Failed to publish rules");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Quiet hour rules published");
      queryClient.invalidateQueries({ queryKey: ["silent-hours"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const res = await remove(endpoint.silent_hours.delete, id);
      if (!res.success) throw new Error((res.data as string) ?? "Failed to delete rule");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Rule deleted");
      queryClient.invalidateQueries({ queryKey: ["silent-hours"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleRuleRemoved = (index: number) => {
    const rule = rules[index];
    setRules((prev) => prev.filter((_, i) => i !== index));
    if (rule?.id) deleteRule.mutate(rule.id);
  };

  return (
    <div className="bg-dark space-y-8 p-6">
      <div className="flex justify-between gap-4 ">
        <div className="text-white">
          <p className="text-lg font-semibold">Setting</p>
          <p className="text-lg font-medium">
            Quiet Hours & Enterprise Suppression
          </p>
          <p className="text-base">
            Team-specific, rotation-aware, regional quiet rules + suppression.
          </p>
          {newRuleCount > 0 && (
            <p className="text-sm text-green-400 mt-1">
              {newRuleCount} unpublished rule
              {newRuleCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div>
          <CButton
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || !hydrated}
          >
            <IoPaperPlaneOutline />
            {publishMutation.isPending ? "Publishing..." : "Publish"}
          </CButton>
        </div>
      </div>
      <div className="flex gap-5">
        <div className="flex-[.4]">
          <RelatedSection />
        </div>
        <div className="flex-1">
          <QuietRules
            rules={rules}
            isLoading={isLoading && !hydrated}
            onRuleAdded={(rule) => setRules((prev) => [...prev, rule])}
            onRuleRemoved={handleRuleRemoved}
          />
        </div>
        <div className="flex-[.5]">
          <Status rules={rules} />
        </div>
      </div>
    </div>
  );
};

export default Page;
