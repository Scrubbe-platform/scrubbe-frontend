export default function NewsletterCTA() {
  return (
    <div className="bg-[#00474D] text-white mt-32 py-16 px-6 sm:py-24 lg:px-8 border-t border-emerald-900">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-serif text-3xl font-light tracking-tight sm:text-4xl">
          Fortnightly. No filler.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed">
          Deep dives, governance patterns, connector releases, and community
          highlights. Engineers at Stripe, Shopify, and Cloudflare subscribe.
        </p>

        <form
          className="mx-auto mt-10 flex max-w-md"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="min-w-0 flex-1 rounded-l px-4 py-2 text-sm text-black bg-white focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="flex-none rounded-r bg-green-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-all"
          >
            Subscribe Now
          </button>
        </form>
      </div>
    </div>
  );
}
