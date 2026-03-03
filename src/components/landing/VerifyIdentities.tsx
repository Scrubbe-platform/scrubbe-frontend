"use client";
import Image from "next/image";

const VerifyIdentities = () => {
  return (
    <div className="w-full bg-white">
      <section className="w-full max-w-[1440px] mx-auto p-4 py-8 md:py-12 lg:py-16">
        {/* Mobile layout - stacked with specific sizing to match image */}
        <div className="lg:hidden flex flex-col items-center">
          {/* Text content for mobile - sized for different breakpoints */}
          <div className="w-full max-w-[340px] md:max-w-[600px] mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-4">
              Verify identities. Profile devices. Expose intent before it
              becomes fraud
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-3">
              Scrubbe&apos;s KYC Fraud Intelligence Engine combines user
              verification with behavioral and device fingerprinting to assess
              trust in real time.
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Detect fake accounts, repeat abusers, and high-risk identities
              across signups, transactions, or access flows.
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-6">
              Built for compliance, designed for speed — all powered by AI and
              device-level risk signals
            </p>
            <button
              onClick={() => console.log("Learn More clicked")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-8 rounded-md transition-colors"
            >
              Learn More
            </button>
          </div>

          {/* Image container sized for different breakpoints */}
          <div className="w-full max-w-[340px] md:max-w-[600px] h-[340px] md:h-[500px] relative">
            <Image
              src="/fraud-intelligence-big.png"
              alt="Fraud Intelligence Dashboard"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 340px, (max-width: 1024px) 600px"
            />
          </div>
        </div>

        {/* Desktop layout - side by side */}
        <div className="hidden lg:grid lg:grid-cols-2 justify-items-center gap-4">
          <article className="w-[445px] xl:w-[560px] h-[445px] xl:h-[560px] p-6">
            <div className="w-full h-full flex flex-col justify-center space-y-4">
              <h2 className="text-3xl xl:text-4xl font-bold text-gray-800 leading-tight">
                Verify identities. Profile devices. Expose intent before it
                becomes fraud
              </h2>
              <p className="text-base text-gray-600">
                Scrubbe&apos;s KYC Fraud Intelligence Engine combines user
                verification with behavioral and device fingerprinting to assess
                trust in real time.
              </p>
              <p className="text-base text-gray-600">
                Detect fake accounts, repeat abusers, and high-risk identities
                across signups, transactions, or access flows. Built for
                compliance, designed for speed — all powered by AI and
                device-level risk signals
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
          <article className="w-[445px] xl:w-[560px] h-[445px] xl:h-[560px] relative">
            <Image
              src="/fraud-intelligence-big.png"
              alt="Fraud Intelligence Dashboard"
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 445px, 560px"
            />
          </article>
        </div>
      </section>
    </div>
  );
};

export default VerifyIdentities;
