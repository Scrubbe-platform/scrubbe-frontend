

const SkeletonSecurityIntelligence = () => {
  return (
    <div className="w-full h-auto bg-[#EFF6FF]">
      <section className="w-full max-w-[1440px] mx-auto py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        {/* Header Skeleton - Responsive */}
        <div className="text-center">
          <div className="h-7 sm:h-8 md:h-9 w-48 sm:w-56 md:w-64 mx-auto bg-slate-200 rounded mb-2 animate-pulse"></div>
          <div className="flex justify-center items-center mb-4 sm:mb-5 md:mb-6">
            <div className="w-20 sm:w-24 md:w-28 h-0.5 sm:h-1 bg-slate-200 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Subheading Skeleton - Responsive */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="h-4 sm:h-5 w-72 sm:w-80 md:w-96 max-w-[90%] mx-auto bg-slate-200 rounded animate-pulse"></div>
        </div>

        {/* Main Content Skeleton - Responsive */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="p-4 sm:p-5 md:p-6">
              <div className="mb-4 sm:mb-5 md:mb-6">
                <div className="h-5 sm:h-6 w-36 sm:w-40 md:w-48 bg-slate-200 rounded mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 w-60 sm:w-72 md:w-80 bg-slate-200 rounded"></div>
              </div>

              {/* Data Table Skeleton - Responsive */}
              <div className="border border-blue-100 rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    {[...Array(10)].map((_, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-4 md:px-6 border-b border-blue-100 border-r w-1/3">
                          <div className="h-3 sm:h-4 w-24 sm:w-28 md:w-32 bg-slate-200 rounded"></div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 md:px-6 border-b border-blue-100">
                          <div className="h-3 sm:h-4 w-36 sm:w-40 md:w-48 bg-slate-200 rounded"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SkeletonSecurityIntelligence;