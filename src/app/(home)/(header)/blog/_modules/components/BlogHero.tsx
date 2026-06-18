import Image from "next/image";

export default function BlogHero() {
  return (
    <div className="relative overflow-hidden bg-zinc-950 text-white py-24">
      {/* Decorative Matrix/Mesh Ring Ring Graphics */}
      <div className="w-full absolute inset-0">
        <Image
          src="/IMS/BlogHero.png"
          fill
          alt="scrubbe blog"
          className="object-cover"
        />
      </div>
      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-6xl font-light tracking-tight md:text-8xl">
            Blog.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white">
            Long-form thinking on incident governance, automation safety,
            observability engineering, and the culture that makes reliable
            systems possible.
          </p>

          {/* Key Metrics Stats Anchor row */}
          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-zinc-800 pt-8 max-w-xl">
            <div>
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-orange-600 font-mono">
                48
              </div>
              <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Articles
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-pink-300 font-mono">
                140k
              </div>
              <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Monthly reads
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold tracking-tight text-lime-300 font-mono">
                26
              </div>
              <div className="mt-1 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Avg. min read
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
