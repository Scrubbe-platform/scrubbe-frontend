"use client";
import EmptyState from "@/components/ui/EmptyState";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import BlogLandingPage from "./_modules/components/BlogPage";

const Page = () => {
  const [search, setSearch] = useState("");
  const { get } = useFetch();

  const { data: blogs, isLoading } = useQuery({
    queryKey: [querykeys.PUBLIC_BLOGS],
    queryFn: async () => {
      const res = await get(endpoint.public.blogs);
      if (res.success) return res.data.data as any[];
      return [];
    },
  });

  const filtered = (blogs ?? []).filter(
    (b: any) =>
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((t: string) =>
        t.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div>
      <BlogLandingPage />
    </div>
  );
};

export default Page;
