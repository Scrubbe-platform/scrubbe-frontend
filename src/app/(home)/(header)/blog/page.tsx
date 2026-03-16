"use client";
import EmptyState from "@/components/ui/EmptyState";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

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
        t.toLowerCase().includes(search.toLowerCase())
      )
  );

  return (
    <div>
      <div className="h-[800px] w-full bg-no-repeat bg-cover relative z-10">
        <img
          src="/IMS/blog-banner.jpg"
          className=" w-full h-full object-cover brightness-50 absolute z-0"
          alt=""
        />
        <div className="container mx-auto px-4">
          <div className=" absolute flex flex-col max-sm:items-center justify-center h-full">
            <h1 className="text-white sm:text-start text-center text-4xl md:text-5xl font-bigshotOne">
              Insights on Reliability,
              <br className=" hidden md:flex" /> Incidents & Resilience
            </h1>

            <div className="flex sm:flex-row flex-col sm:gap-0 gap-5 items-center mt-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts about SLAs, Devops etc"
                className="h-[42px] w-[300px] text-center sm:text-start px-4 bg-white outline-none max-sm:rounded-lg sm:rounded-l-lg"
              />
              <div className="h-[42px] max-sm:rounded-lg sm:rounded-r-lg bg-IMSLightGreen text-white flex items-center px-6 font-semibold cursor-pointer">
                Search
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" container mx-auto mt-4 px-4 space-y-3">
        <p className=" text-xl font-bold">Blog Posts</p>
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            Loading blog posts...
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filtered.map((blog: any) => (
              <div
                key={blog.id}
                className="border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {blog.coverImage && (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {(blog.tags ?? []).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="font-semibold text-lg leading-tight">
                    {blog.title}
                  </p>
                  {blog.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {blog.author
                      ? `By ${blog.author.firstName} ${blog.author.lastName}`
                      : "Scrubbe Team"}{" "}
                    &bull;{" "}
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Blog Post"
            description="Check back soon to get updates on our new blog posts. See you soon."
          />
        )}
      </div>
    </div>
  );
};

export default Page;
