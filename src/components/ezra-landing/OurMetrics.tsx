import React from "react";

const OurMetrics = () => {
  const metrics = [
    {
      value: "500+",
      label: "Alerts/hour",
    },
    {
      value: "99.9%",
      label: "Uptime",
    },
    {
      value: "35%",
      label: "Response Time",
    },
  ];
  return (
    <section className="w-full py-16 px-2 sm:px-6 md:px-12 relative bg-subDarkEzra ">
      <div className=" flex flex-col justify-center items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-2">
          Our Impact metrics
        </h2>
        <div className="w-24 h-1 bg-teal-400 mx-auto mb-6 rounded-full" />

        <div className=" flex max-w-4xl w-full gap-5  justify-between flex-wrap mx-auto mt-4">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className=" w-full text-white border-l-2 px-3 py-2 border-colorScBlue">
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                  {metric.value}
                </p>
                <p>{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurMetrics;
