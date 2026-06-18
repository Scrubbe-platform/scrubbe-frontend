// app/blog/page.tsx
"use client";

import React, { useState } from "react";
import { mockBlogPosts } from "../libs/constant";
import { BlogCategory } from "../types/index";

// Internal Subcomponents
import BlogHero from "./BlogHero";
import FeaturedRow from "./FeaturedRow";
import PostCard from "./PostCard";
import NewsletterCTA from "./NewsletterCTA";

export default function BlogLandingPage() {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>("All");

  // Filter computations
  const filteredPosts =
    selectedCategory === "All"
      ? mockBlogPosts
      : mockBlogPosts.filter((post) => post.category === selectedCategory);

  // Isolate topmost featured post when looking at the landing dashboard
  const featuredPost = mockBlogPosts.find((p) => p.isFeatured);
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  // Fixed static visual configurations matching design counts
  const dynamicCategories: { name: BlogCategory; count: number }[] = [
    { name: "All", count: 28 },
    { name: "Deep Dive", count: 9 },
    { name: "Tutorial", count: 7 },
    { name: "Release", count: 6 },
    { name: "Customer story", count: 28 },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Hero Block */}
      <BlogHero />

      {/* Main Filter & Listing Flow Container */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {/* 2. Interactive Navigation Tabs */}
        <div className="mb-12 flex flex-wrap gap-2 border-b border-zinc-100 pb-5">
          {dynamicCategories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-50 text-zinc-950 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {cat.name}
                <span
                  className={`rounded-sm px-1.5 py-[1px] text-[10px] font-bold font-mono tracking-tight ${
                    isActive
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Conditional Feature Post View */}
        {selectedCategory === "All" && featuredPost && (
          <div className="mb-20">
            <FeaturedRow post={featuredPost} />
          </div>
        )}

        {/* 4. Timeline Middle Flow Layout (Posts 2 & 3 from mock image stream) */}
        {selectedCategory === "All" && (
          <div className="space-y-20 mb-24 border-t border-zinc-100 pt-16">
            {mockBlogPosts.slice(1, 3).map((post, idx) => (
              <FeaturedRow
                key={post.id}
                post={post}
                imageRight={idx % 2 === 0}
              />
            ))}
          </div>
        )}

        {/* 5. Dynamic Standard Sub-Grid View */}
        <div className="border-t border-zinc-100 pt-16">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-8">
            {selectedCategory === "All"
              ? "More Articles"
              : `${selectedCategory} Articles`}
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCategory === "All"
              ? mockBlogPosts
                  .slice(3)
                  .map((post) => <PostCard key={post.id} post={post} />)
              : regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
          </div>
        </div>
      </div>

      <NewsletterCTA />
    </div>
  );
}
