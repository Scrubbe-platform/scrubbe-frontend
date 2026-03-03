import SecurityDashboard from "./SecurityDashboard";

const BuiltForDevelopers = () => {
  return (
    <div className="w-full h-auto bg-white">
      <section className="w-full max-w-[1440px] mx-auto bg-[linear-gradient(to_bottom,#DBEAFE_50%,white_50%)] py-8 md:py-16 px-4">
        {/* Stats Section */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 border-b border-gray-200">
          <div className="flex flex-col items-center justify-center py-4 md:py-6 border-r border-[#1F2B71]">
            <p className="text-[1.2rem] sm:text-[1.8rem] md:text-[2.2rem] text-[#1F2937] font-bold">
              {"<"}5 mins
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              Average time to
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              investigate incident
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 md:py-6 border-r-0 md:border-r border-[#1F2B71]">
            <p className="text-[1.2rem] sm:text-[1.8rem] md:text-[2.2rem] text-[#1F2937] font-bold">
              90%+
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              Analyst satisfaction
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              with UI usability
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 md:py-6 border-r border-t md:border-t-0 border-[#1F2B71]">
            <p className="text-[1.2rem] sm:text-[1.8rem] md:text-[2.2rem] text-[#1F2937] font-bold">
              99.9%
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              Uptime for dashboard
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              availability
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 md:py-6 border-t md:border-t-0">
            <p className="text-[1.2rem] sm:text-[1.8rem] md:text-[2.2rem] text-[#1F2937] font-bold">
              {"<"}5%
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              False positives on
            </p>
            <p className="text-[0.7rem] sm:text-[0.9rem] md:text-[1.1rem] text-[#5E5F60] text-center">
              automated action
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="w-full mt-8 md:mt-12">
          <div className="bg-[#1F2B71] text-white rounded-2xl overflow-hidden w-full mx-auto flex flex-col lg:flex-row">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-8">
                Built for developers. Trusted by enterprises. Designed to
                protect what fintechs value most
              </h2>

              <p className="text-sm md:text-base lg:text-lg">
                At Scrubbe, we believe cybersecurity should be powerful,
                accessible, and intuitive for everyone not just security
                experts. Our platform is built to empower organizations of all
                sizes to detect, investigate, and respond to threats in real
                time without needing deep technical knowledge.
              </p>
            </div>

            {/* Dashboard Section */}
            <div className="w-full lg:w-1/2">
              <SecurityDashboard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuiltForDevelopers;
