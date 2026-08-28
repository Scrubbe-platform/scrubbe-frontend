"use client";

export default function DevOpsLoopSection() {
  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-[1480px] mx-auto">
        <h2 className="font-serif font-bold text-gray-950 leading-[1.15] text-[clamp(28px,3.2vw,42px)] max-w-2xl">
          From raw signal to operational understanding
        </h2>
        <p className="mt-4 text-[15px] text-gray-500 leading-relaxed max-w-xl">
          Every signal is correlated, weighed for confidence and evidence, and
          surfaced where it changes a decision across the workspace..
        </p>

        <div className="relative mt-16 flex justify-center">
          <img
            src="/IMS/CI_CD.png"
            alt="Dev Ops continuous loop — code, build, test, plan, release, deploy, operate, monitor"
            className="w-full max-w-[760px] h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
