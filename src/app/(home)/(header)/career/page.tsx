import EmptyState from "@/components/ui/EmptyState";
import React from "react";

const mission = [
  {
    title: "Resilience",
    description:
      "We build for reliability in challenging environments, ensuring our tools stand strong under pressure.",
  },
  {
    title: "Ownership",
    description:
      "Everyone has impact from day one, taking responsibility for creating meaningful solutions.",
  },
  {
    title: "Simplicity",
    description:
      "We solve complex problems with clear, user-focused designs and intuitive workflows.",
  },
  {
    title: "Trust",
    description:
      "Security and transparency guide everything we do, fostering confidence in our platform.",
  },
];

const benefits = [
  {
    title: "Competitive Salary + Equity",
    description:
      "Join a fast-growing startup with equity options and competitive compensation.",
  },
  {
    title: "Remote-First Work",
    description:
      "Work from anywhere in Africa with flexible hours to suit your lifestyle.",
  },
  {
    title: "Learning & Growth Budget",
    description:
      "Access stipends for courses, certifications, and professional development.",
  },
  {
    title: "Health & Wellness Support",
    description:
      "Receive a stipend to support your physical and mental well-being.",
  },
];
const page = () => {
  return (
    <div>
      <div className="h-[800px] w-full bg-no-repeat bg-cover relative z-10">
        <img
          src="/IMS/career-banner.png"
          className=" w-full h-full object-cover brightness-50 absolute z-0"
          alt=""
        />
        <div className="container mx-auto p-4">
          <div className=" absolute flex flex-col justify-center h-full">
            <h1 className="text-white text-4xl md:text-5xl font-bigshotOne sm:text-start text-center">
              Join us in building <br /> Africa’s resilience layer
            </h1>
            <p className=" max-w-2xl text-white sm:text-start text-center">
              At Scrubbe, we’re solving one of Africa’s most urgent problems:
              resilience. Join us to build tools that minimize downtime, protect
              revenue, and empower developers across the continent.
            </p>
            <div className="flex sm:flex-row flex-col sm:gap-0 gap-5 items-center mt-3">
              <div className="h-[42px] rounded-lg bg-IMSLightGreen text-white flex items-center px-6 font-semibold cursor-pointer">
                View Open Roles
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" container mx-auto p-4 py-10 space-y-2">
        <p className=" text-center font-bold md:text-4xl text-3xl">
          Our Mission and Vision
        </p>
        <p className=" text-center max-w-2xl mx-auto text-base">
          At Scrubbe IMS, our mission is to empower African businesses with
          tools to ensure reliability, fight fraud, and stay resilient in
          challenging environments. We’re building a platform that developers
          and enterprises trust to deliver uptime and security.
        </p>

        <div className="grid md:grid-cols-2 pt-5 md:gap-10">
          <div className="h-[500px] rounded-lg overflow-clip">
            <img src="/IMS/career-woman.jpg" className="rounded-lg" alt="" />
          </div>
          <div className=" space-y-5">
            {mission.map((item, idx) => (
              <div
                key={item.title}
                className="flex gap-4 md:gap-10 items-center"
              >
                <div className="size-10 min-w-10 md:min-w-14 md:size-14 rounded-full border border-black flex items-center justify-center text-xl font-bold">
                  {idx + 1}
                </div>
                <div className="">
                  <p className=" text-lg font-semibold">{item.title}</p>
                  <p className=" text-base">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className=" space-y-3 py-10">
          <p className=" text-xl font-bold">Open Role</p>
          <EmptyState
            title="No Opening Available"
            description="Check back soon to get updates on our new opening. See you soon."
          />
        </div>

        <div className=" py-10">
          <p className=" text-center font-bold md:text-4xl text-3xl">
            Why Join Scrubbe?{" "}
          </p>
          <p className=" text-center max-w-xl mx-auto text-base">
            Work with a team passionate about solving real-world problems with
            cutting-edge technology.
          </p>

          <div className="grid md:grid-cols-2 gap-5 mt-10">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="border border-zinc-200 rounded-lg gap-3 p-4"
              >
                <p className="text-lg font-medium ">{item.title}</p>
                <p className="text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
