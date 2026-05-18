"use client";

import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-[#f5f5f0] w-full px-16 py-16">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-16">
        {/* Left — Headline */}
        <div className="flex-1 min-w-0">
          <h2 className="text-5xl leading-tight font-serif text-zinc-900">
            The fastest way to get help.
          </h2>
          <h2 className="text-5xl leading-tight font-serif italic text-zinc-400">
            And to help others.
          </h2>
        </div>

        {/* Right — Description + Stats + CTA */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <p className="text-sm text-zinc-600 leading-relaxed max-w-lg">
            Join our Slack workspace for real-time conversations, connector
            troubleshooting, EAL discussions, and direct access to the Scrubbe
            team. New members get a personal onboarding message from the
            engineering team.
          </p>

          {/* Stats */}
          <div className="flex items-stretch divide-x divide-zinc-300">
            <div className="pr-8 flex flex-col gap-0.5">
              <span className="text-xl font-bold text-zinc-900">1240</span>
              <span className="text-xs text-zinc-500">Members in Slack</span>
            </div>
            <div className="px-8 flex flex-col gap-0.5">
              <span className="text-xl font-bold text-zinc-900">12</span>
              <span className="text-xs text-zinc-500">Active Channels</span>
            </div>
            <div className="pl-8 flex flex-col gap-0.5">
              <span className="text-xl font-bold text-zinc-900">&lt;4h</span>
              <span className="text-xs text-zinc-500">Team response time</span>
            </div>
          </div>

          {/* Button */}
          <div>
            <Link
              className="px-6 py-3 rounded-md text-sm font-medium text-white"
              style={{
                background:
                  "linear-gradient(135deg, #1a2e1a 0%, #2d5a1b 40%, #7ec832 100%)",
              }}
              href={"https://scrubbecommunity.slack.com/"}
              target="_blank"
            >
              Join Slack Workspace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
