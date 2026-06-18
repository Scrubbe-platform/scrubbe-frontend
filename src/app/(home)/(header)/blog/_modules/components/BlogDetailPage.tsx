// app/blog/[slug]/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Link2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown"; // Real Markdown Parser Component

import NewsletterCTA from "../components/NewsletterCTA";
import PostCard from "../components/PostCard";
import { mockBlogPosts } from "../libs/constant";

// Pure, clean Markdown exact payload straight from a database or file system
const MOCK_MARKDOWN_BODY = `
### The problem with current incident automation
Every major incident platform offers some version of auto-remediation. The premise is compelling: if the system can detect and match an incident to a known pattern, why not fix it automatically?

The answer — which took the industry a decade to articulate clearly — is: because "automatically" is not a risk model. It's the absence of one.

> "Automation without a ceiling is not reliability engineering. It's hoping the machine is always right."

### What EAL actually is
The Effective Automation Level is a computed value, not a configuration option. You don't set EAL directly — you set three inputs, and the system computes the effective level as their minimum:

\`\`\`text
effectiveAutomationLevel = min(
  playbook.automationStage,   // What the playbook claims to handle
  policy.maxAutomationLevel,  // What your org policy permits
  riskClassifier.computedLevel // What live risk assessment allows
)
\`\`\`

Each input does different work. The playbook ceiling reflects the author's confidence in the automation. The policy ceiling reflects your organisation's risk appetite and compliance requirements. The risk classifier is a live computation — it can lower the effective level at execution time based on blast radius, current system health, and historical outcomes for this pattern.

### The four automation levels
* **EAL 1 — Suggest**. Ezra surfaces ranked options. Every decision remains with your team. Nothing executes without explicit human action. The correct starting point for any new pattern.
* **EAL 2 — Propose**. Ranked proposals enter the approval queue. Explicit human approval required before anything executes. The system does the analysis; a human makes the call.
* **EAL 3 — Assisted**. The system stages the remediation and presents a pre-validated action for one-click confirmation. The human confirms rather than decides. The practical sweet spot for high-confidence, reversible remediations once you have sufficient learnedPatterns data.
* **EAL 4 — Automated**. Full execution without human confirmation, subject to guardrail evaluation. This should only be permitted for patterns with extensive resolved outcome history, bounded blast radius, and fully reversible actions.

### How to raise EAL responsibly
The path from EAL 1 to EAL 4 is not a settings change — it's an evidence-gathering process. learnedPatterns tracks Execution.outcome per {service, env, signalType} triple. As the outcome distribution shifts toward resolved, confidence increases.

Run EAL 1 for two weeks on any new pattern. Move to EAL 2 once you've validated the remediation manually five times. Move to EAL 3 after ten consistent resolved outcomes. Consider EAL 4 only after twenty or more resolved outcomes with no degraded or worsened outcomes in the trailing thirty days.
`;

export default function BlogPostDetailPage() {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const post = mockBlogPosts[0];
  const relatedPosts = mockBlogPosts.slice(3, 6);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      // Reset the button state back to original after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  // Handler for sharing via native OS share sheet (mobile/supported desktop browsers)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("User cancelled share or share failed:", err);
      }
    } else {
      // Fallback: If the browser doesn't support the native Share sheet, trigger the copy link workflow
      handleCopyLink();
    }
  };
  // Senior Developer Pattern: Create an explicit map to inject styling directly into raw markdown rendering
  const MarkdownStyles = {
    h3: ({ children }: any) => (
      <h3 className="text-xl sm:text-[22px] font-bold tracking-tight text-zinc-900 mt-16 mb-6">
        {children}
      </h3>
    ),
    p: ({ children }: any) => {
      // Check if this paragraph contains our custom backend alert callout string contract
      const text = String(children);
      if (text.startsWith("Critical: EAL")) {
        return (
          <div className="my-10 rounded-lg bg-zinc-900 p-5 font-mono text-xs text-red-400 border-l-4 border-red-500 shadow-sm">
            {children}
          </div>
        );
      }
      return (
        <p className="text-sm sm:text-[15px] text-zinc-800 leading-[1.8] mb-8 font-normal">
          {children}
        </p>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="font-normal italic text-lg text-emerald-900 bg-emerald-50/40 p-6 rounded-xl border-l-4 border-emerald-500 my-12">
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 my-8 space-y-3">{children}</ul>
    ),
    li: ({ children }: any) => (
      <li className="text-sm sm:text-[15px] text-zinc-800 leading-[1.7]">
        {children}
      </li>
    ),
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-950 font-medium">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-zinc-900 text-zinc-100 p-6 rounded-xl font-mono text-xs leading-relaxed my-10 overflow-x-auto shadow-inner">
          <code>{children}</code>
        </pre>
      );
    },
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Action Header Controls */}
      <div className="mx-auto max-w-3xl px-6 lg:px-8 pt-12 pb-6 flex items-center justify-between border-b border-zinc-100">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} />
          back
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors ${
              liked
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <Heart size={13} className={liked ? "fill-current" : ""} />
            Like
          </button>
          <button
            onClick={handleShare}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Share2 size={13} />
            Share
          </button>

          {/* Copy Link Button with dynamic feedback state */}
          <button
            onClick={handleCopyLink}
            disabled={copied}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-all ${
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Link2 size={13} />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Core Content Container Layout Stream */}
      <article className="mx-auto max-w-3xl px-6 lg:px-8 pt-14 pb-20">
        {/* Author Metadata Ribbon */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-sm">
              {post.author.initials}
            </div>
            <div>
              <span className="font-semibold text-zinc-800">
                {post.author.name}
              </span>
              <span className="mx-2 text-zinc-300">|</span>
              <span className="font-mono">{post.readingTime}</span>
            </div>
          </div>
          <div className="font-medium text-zinc-500">
            Published {post.publishedAt}
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-zinc-900 leading-[1.2] mb-8">
          {post.title}
        </h1>

        {/* Post Excerpt */}
        <p className="mt-8 text-base sm:text-lg text-zinc-500 leading-relaxed font-normal italic border-l-2 border-zinc-200 pl-5 mb-12">
          {post.excerpt}
        </p>

        {/* Main Cover Asset Node */}
        <div className="my-14 relative w-full aspect-[21/9] rounded-xl bg-zinc-100 border border-zinc-100 overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-400 font-mono text-xs tracking-wide">
            [Post Featured Graphic Asset Boundary — Workspace Shaking Hands]
          </div>
        </div>

        {/* Clean, Scalable Markdown Render Stream */}
        <ReactMarkdown components={MarkdownStyles}>
          {MOCK_MARKDOWN_BODY}
        </ReactMarkdown>
      </article>

      {/* Related Content Grid Footnote Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 border-t border-zinc-100 mt-20">
        <h3 className="text-lg font-bold tracking-tight text-zinc-900 mb-8">
          Related Articles
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {relatedPosts.map((relatedPost) => (
            <PostCard key={relatedPost.id} post={relatedPost} />
          ))}
        </div>
      </div>

      {/* Bottom Conversion CTA Module */}
      <NewsletterCTA />
    </div>
  );
}
