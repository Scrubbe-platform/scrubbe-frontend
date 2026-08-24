"use client";

export default function MttrSection() {
  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — wave background with headline + CTA */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-center px-10 py-14 md:px-14 min-h-[500px]"
          style={{
            backgroundImage: "url(/IMS/MTTR2.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="font-serif font-bold text-white leading-[1.1] text-[clamp(32px,3.4vw,48px)] max-w-[420px]">
              Resolving Incidents Faster Everyday
            </h2>
            <p className="mt-5 text-[15px] text-white/85 leading-relaxed max-w-[380px]">
              Track how scrubbe reduces MTTR and resolves more incident over
              time
            </p>
            <button className="mt-9 px-6 py-3.5 rounded-lg bg-white text-black font-semibold text-[14.5px] cursor-pointer border-none hover:brightness-95 transition-all">
              Get Started
            </button>
          </div>
        </div>

        {/* Right — dashboard screenshot */}
        <div className="relative rounded-2xl overflow-hidden min-h-[500px]">
          <img
            src="/IMS/MTTR1.png"
            alt="Scrubbe MTTR dashboard"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
