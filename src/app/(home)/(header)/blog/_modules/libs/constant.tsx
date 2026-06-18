// data/blogMockData.ts
import { BlogPost } from "../types/index";

export const mockBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "why-eal-is-the-only-automation-metric",
    title:
      "Why EAL is the only automation metric that matters for enterprise incident response",
    excerpt:
      "Most incident automation fails not because the automation is wrong, but because there's no principled way to bound it. EAL solves this by making the automation ceiling a governed, auditable policy decision — not a judgement call made at 3am under pressure.",
    category: "Deep Dive",
    publishedAt: "April 21, 2026",
    readingTime: "4 min read",
    imageUrl: "/images/blog/featured-eal.png", // Fallback to placeholder gradients or images
    author: {
      name: "Paschal Ifediora",
      role: "Founder & CEO of Scrubbe",
      initials: "PK",
      avatarColor: "#2563eb",
    },
    isFeatured: true,
  },
  {
    id: "post-2",
    slug: "how-to-author-your-first-playbook",
    title:
      "How to author your first Scrubbe playbook — from pattern identification to production deployment",
    excerpt:
      "A step-by-step walkthrough — triggerConditions with confidence weights, branching investigationSteps, remediationOptions, blast radius hints, and how to set your automationStage correctly. Includes a real CrashLoopBackOff example with full JSONB config.",
    category: "Tutorial",
    publishedAt: "April 14, 2026",
    readingTime: "4 min read",
    imageUrl: "/images/blog/playbook-guide.png",
    author: {
      name: "Sarah Kim",
      initials: "SK",
      avatarColor: "#7c3aed",
    },
  },
  {
    id: "post-3",
    slug: "ezra-code-engine-now-in-ga",
    title:
      "Ezra Code Engine now in GA — diff suggestions, auto PR, CI failure comparison",
    excerpt:
      "Ezra now suggests targeted code diffs against the file it identifies as root cause. Diffs presented as unified patches against your actual repo. One-click PR creation. CI comparison across last 5 passing runs.",
    category: "Release",
    publishedAt: "April 08, 2026",
    readingTime: "4 min read",
    imageUrl: "/images/blog/ezra-ga.png",
    author: {
      name: "Team scrubbe",
      initials: "TS",
      avatarColor: "#059669",
    },
  },
  {
    id: "post-4",
    slug: "how-fintrax-cut-mttr",
    title: "How Fintrax cut MTTR by 79% in 8 weeks on the Govern plan",
    excerpt:
      "Fintrax processes 2M+ payments daily. 90% of incidents were resolved manually despite having Datadog and PagerDuty. Here's how they built their first governed playbook library and what they learned.",
    category: "Customer story",
    publishedAt: "March 29, 2026",
    readingTime: "4 min read",
    imageUrl: "/images/blog/fintrax-case.png",
    author: {
      name: "Rajan Patel",
      role: "Fintrax",
      initials: "RP",
      avatarColor: "#2563eb",
    },
  },
  {
    id: "post-5",
    slug: "blast-radius-not-severity",
    title:
      "Blast radius, not severity: the metric that should gate automated remediation",
    excerpt:
      "Severity is a snapshot. Blast radius is a graph computation. Using severity alone to gate automation leads to systematic over-permission — and how DIRECT / CASCADE / INDIRECT node classification fixes it.",
    category: "Deep Dive",
    publishedAt: "March 22, 2026",
    readingTime: "4 min read",
    imageUrl: "/images/blog/blast-radius.png",
    author: {
      name: "Paschal Ifediora",
      initials: "PK",
      avatarColor: "#2563eb",
    },
  },
  {
    id: "post-6",
    slug: "event-driven-policy-evaluation",
    title:
      "Event-driven policy evaluation at scale — lessons from building Scrubbe's core loop",
    excerpt:
      "How we designed the Event → Evaluation → Decision → Action → Audit loop to be deterministic, replayable, and auditable. What we got wrong in the first two iterations before we got it right.",
    category: "Release",
    publishedAt: "March 15, 2026",
    readingTime: "4 min read",
    imageUrl: "/images/blog/core-loop.png",
    author: {
      name: "Ade Balogun",
      initials: "AB",
      avatarColor: "#2563eb",
    },
  },
];
