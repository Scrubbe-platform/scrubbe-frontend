import Image from "next/image";

interface BrandProps {
  name: string;
  logo: string;
}

const SupportedBy = () => {
  const brands: BrandProps[] = [
    {
      name: "Slack",
      logo: "/icon-slack.svg",
    },
    {
      name: "Supabase",
      logo: "/icon-supabase.svg",
    },
    {
      name: "Microsoft",
      logo: "/icon-microsoft.svg",
    },
    {
      name: "Github",
      logo: "/icon-github.svg",
    },
    {
      name: "Amazon",
      logo: "/icon-awsamazon.svg",
    },
  ];

  return (
    <div className="w-full">
      {/* Blue gradient background section */}
      <section className="w-full max-w-[1440px] mx-auto">
        <article className="w-full bg-gradient-to-r from-[#1F2B71] to-[#3B52D7] py-6 md:py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
              Supported by Global Brands
            </h2>

            <div className="h-1 w-24 bg-emerald-400 mx-auto mt-2 mb-8"></div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {brands.map((brand) => (
                <div
                  key={brand.name}
                  className="bg-white rounded-md py-1 px-3 flex items-center justify-center shadow-sm min-w-[120px] md:min-w-[140px]"
                >
                  <div className="w-[110px] h-[40px] relative">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 768px) 110px, 140px"
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Light blue content section */}
        <article className="w-full bg-[#EFF6FF] py-6 md:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-center text-gray-800 text-lg md:text-xl leading-relaxed">
              Scrubbe empowers modern teams to stop fraud, verify trust, and
              automate response with clarity and speed. Whether you&#39;re
              launching your first security layer or scaling to millions,
              Scrubbe is built to grow with you
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <a
                href="#"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md text-center transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="#"
            className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-100 font-medium py-3 px-6 rounded-md text-center transition-colors"
              >
                Talk to our team
              </a>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default SupportedBy;
