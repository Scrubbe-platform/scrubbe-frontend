"use client";
import Image from "next/image";

const ContextAware = () => {
  return (
    <div className="w-full bg-white">
      <section className="w-full max-w-[1440px] mx-auto p-4 py-8 md:py-12 lg:py-16">
        {/* Mobile layout - stacked with specific sizing to match image */}
        <div className="lg:hidden flex flex-col items-center">
          {/* Image container sized for different breakpoints */}
          <div className="w-full max-w-[340px] md:max-w-[600px] h-[340px] md:h-[500px] relative mb-8">
            <Image
              src="/mcp-server-big.png"
              alt="Model Context Protocol Server"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 340px, (max-width: 1024px) 600px"
            />
          </div>

          {/* Text content for mobile - sized for different breakpoints */}
          <div className="w-full max-w-[340px] md:max-w-[600px]">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-4">
              Context-aware AI that thinks before it acts
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-3">
              Scrubbe&apos;s blends Large Language Models with a Model Context
              Protocol (MCP) to deliver intelligent, role-aware responses across
              your security stack.
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              It interprets raw log data, detection events, and user behavior in
              real time — converting complex alerts into clear, natural-language
              summaries.
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              From explaining risk scores to suggesting remediation steps or
              even writing detection rules, Scrubbe helps your team respond
              faster, smarter, and with full context.
            </p>
            <button
              onClick={() => console.log("Learn More clicked")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-8 rounded-md transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Desktop layout - side by side */}
        <div className="hidden lg:grid lg:grid-cols-2 justify-items-center gap-4">
          <article className="w-[445px] xl:w-[560px] h-[445px] xl:h-[560px] relative">
            <Image
              src="/mcp-server-big.png"
              alt="Model Context Protocol Server"
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 445px, 560px"
            />
          </article>
          <article className="w-[445px] xl:w-[560px] h-[445px] xl:h-[560px] p-6">
            <div className="w-full h-full flex flex-col justify-center space-y-4">
              <h2 className="text-3xl xl:text-4xl font-bold text-gray-800 leading-tight">
                Context-aware AI that thinks before it acts
              </h2>
              <p className="text-base text-gray-600">
                Scrubbe&apos;s blends Large Language Models with a Model Context
                Protocol (MCP) to deliver intelligent, role-aware responses
                across your security stack.
              </p>
              <p className="text-base text-gray-600">
                It interprets raw log data, detection events, and user behavior
                in real time — converting complex alerts into clear,
                natural-language summaries. From explaining risk scores to
                suggesting remediation steps or even writing detection rules,
                Scrubbe helps your team respond faster, smarter, and with full
                context.
              </p>
              <div>
                <button
                  onClick={() => console.log("Learn More clicked")}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default ContextAware;
