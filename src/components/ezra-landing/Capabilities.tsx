"use client";
import React from "react";

const capabilities = [
  {
    title: "Advanced Automation",
    description:
      "Automate phishing, ransomware, and insider threat responses with dynamic playbooks",
    icon: "/check-box.svg", // Placeholder for icon
  },
  {
    title: "AI-Powered Analytics",
    description: "Real-time threat insights with Grok 3's AI and Think Mode.",
    icon: "/analytics.svg",
  },
  {
    title: "Robust Security",
    description:
      "Ensure compliance with SOC 2, ISO 27001, RBAC, SSO, and AES-256 encryption.",
    icon: "/padlock-square.svg",
  },
  {
    title: "Scalable Performance",
    description:
      "Handle 50,000+ alerts/hour with Kubernetes-based scaling and 99.9% uptime.",
    icon: "/scale.svg",
  },
  {
    title: "Team Collaboration",
    description:
      "Real-time incident management and notifications via Slack/Teams",
    icon: "/people.svg",
  },
  {
    title: "Log Analysis & Summarization",
    description:
      "Analyze and summarize logs with Grok 3's AI for actionable insights.",
    icon: "/analytics.svg",
  },
];

const Capabilities = () => {
  return (
    <section className="w-full min-h-screen  py-16 px-2 sm:px-6 md:px-12 relative ">
      <div className=" h-[400px] w-[400px] rounded-full  bg-colorScBlue/20 absolute top-0 left-0 z-0 blur-3xl" />
      <div className="max-w-7xl mx-auto z-10 relative">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-2">
          Unmatched SOAR Capabilities
        </h2>
        <div className="w-24 h-1 bg-teal-400 mx-auto mb-12 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="bg-[#1F1F24] border border-zinc-500 rounded-xl p-8 flex flex-col gap-4 shadow-lg hover:shadow-xl transition-shadow duration-200 h-full"
            >
              {/* Icon placeholder */}
              <div className="w-12 h-12 rounded-full bg-[#17203F] flex items-center justify-center mb-2 relative">
                {/* TODO: Insert icon here */}
                {cap.icon && (
                  <img
                    src={cap.icon}
                    alt={cap.title}
                    sizes="32px"
                    className="object-contain absolute"
                  />
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {cap.title}
              </h3>
              <p className="text-zinc-300 text-base mb-4 flex-1">
                {cap.description}
              </p>
              <a
                href="#"
                className="text-white font-medium flex items-center gap-2 hover:underline mt-auto"
              >
                Learn more <span aria-hidden>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Capabilities;
