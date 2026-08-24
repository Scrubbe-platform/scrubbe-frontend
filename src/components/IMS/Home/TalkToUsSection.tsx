"use client";

import Image from "next/image";
import Link from "next/link";

export default function TalkToUsSection() {
  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-[1480px] mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden min-h-[420px] flex items-center"
          style={{
            backgroundImage: "url(/IMS/contact-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 px-10 md:px-16 py-14 max-w-lg">
            <h2 className="font-serif font-bold text-gray-950 leading-[1.15] text-[clamp(28px,3.2vw,42px)]">
              Let's make incidents faster to resolve
            </h2>
            <p className="mt-5 text-[15px] text-gray-500 leading-relaxed max-w-md">
              See how scrubbe can help your engineering team investigate
              incidents faster , understand what happened , and move toward
              safer remediation
            </p>
            <Link
              href="/contact-us"
              className="inline-block mt-8 px-6 py-3 rounded-lg font-bold text-[14px] text-white bg-black hover:brightness-110 transition-all"
            >
              Talk to us
            </Link>
          </div>

          <div className="absolute right-0 md:-right-10 -bottom-10 top-0 w-[300px] md:w-[520px] pointer-events-none select-none">
            <Image
              src="/IMS/crystals.png"
              alt=""
              fill
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
