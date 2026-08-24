"use client";

export default function NvidiaInceptionSection() {
  return (
    <section className="w-full py-16 px-6" style={{ background: "#f2f3f5" }}>
      <div className="max-w-[560px] mx-auto bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center">
        <p className="text-[13px] font-bold uppercase text-slate-900 mb-4">
          AI - Backed Infrastructure
        </p>

        <div className="rounded-md">
          <img
            src="/nvidia.jfif"
            alt="NVIDIA Inception Program"
            className="h-28 w-auto object-contain"
          />
        </div>

        <p className="mt-4 text-[14.5px] leading-relaxed text-gray-500 text-center max-w-[420px]">
          Scrubbe is a member of the NVIDIA Inception Program, exploring NVIDIA
          accelerated computing to power the next generation of autonomous
          incident response.
        </p>
      </div>
    </section>
  );
}
